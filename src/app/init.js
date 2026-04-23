import { createExportPayload, initializeRepository, loadAppData, saveAppData } from '../db/repository.js';
import { renderTemplate } from '../engine/templateRenderer.js';
import { createInitialState, createStore } from '../state/store.js';
import { validateImportPayload } from '../validation/validators.js';
import { renderEditor } from '../components/editor.js';
import { renderInspector } from '../components/inspector.js';
import { renderLibrary } from '../components/library.js';
import { renderWizard } from '../components/wizard.js';

export async function initApp(root) {
  await initializeRepository();
  const loaded = await loadAppData();

  const store = createStore(createInitialState());
  store.dispatch({ type: 'INIT', payload: loaded });

  const render = () => {
    const state = store.getState();
    const selectedTemplate =
      state.selectedItem?.type === 'template'
        ? state.data.templates.find((template) => template.id === state.selectedItem?.id)
        : undefined;

    const preview =
      selectedTemplate !== undefined
        ? renderTemplate(
            selectedTemplate,
            state.data.blocks,
            state.data.variableDefinitions,
            state.data.derivedRules,
            state.wizardValues
          )
        : 'Für die Vorschau bitte eine Vorlage auswählen.';

    root.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar">
          <h1>Textbausteinverwaltung</h1>
          <label>Suche
            <input data-action="search" value="${state.searchTerm}" placeholder="Titel, Gesetz, Schlagwort …" />
          </label>
          <div class="segment">
            <button data-action="view-tree" ${state.data.preferences.libraryViewMode === 'tree' ? 'class="is-active"' : ''}>Baum</button>
            <button data-action="view-list" ${state.data.preferences.libraryViewMode === 'list' ? 'class="is-active"' : ''}>Liste</button>
          </div>
          <nav class="library">${renderLibrary(state)}</nav>
        </aside>
        <main class="workspace">
          ${renderEditor(state)}
          ${renderWizard(state)}
        </main>
        ${renderInspector(state, preview)}
      </div>
    `;

    wireEvents(root, store);
  };

  store.subscribe(() => {
    const next = store.getState();
    void saveAppData(next.data);
    render();
  });

  render();
}

function wireEvents(root, store) {
  root.querySelectorAll('[data-action="select-item"]').forEach((element) => {
    element.onclick = () => {
      const id = element.dataset.itemId;
      const type = element.dataset.itemType;
      if (!id || !type) return;
      store.dispatch({ type: 'SELECT_ITEM', payload: { id, type } });
    };
  });

  root.querySelectorAll('[data-action="toggle-node"]').forEach((element) => {
    element.onclick = () => {
      const nodeId = element.dataset.nodeId;
      if (!nodeId) return;
      store.dispatch({ type: 'TOGGLE_NODE', payload: nodeId });
    };
  });

  const searchInput = root.querySelector('[data-action="search"]');
  if (searchInput) {
    searchInput.oninput = () => store.dispatch({ type: 'SET_SEARCH', payload: searchInput.value });
  }

  root.querySelector('[data-action="view-tree"]')?.addEventListener('click', () => {
    store.dispatch({ type: 'SET_LIBRARY_VIEW', payload: 'tree' });
  });
  root.querySelector('[data-action="view-list"]')?.addEventListener('click', () => {
    store.dispatch({ type: 'SET_LIBRARY_VIEW', payload: 'list' });
  });

  root.querySelectorAll('[data-action="wizard-input"]').forEach((element) => {
    const commit = () => {
      const key = element.dataset.key;
      if (!key) return;
      let value = element.value;
      if (element instanceof HTMLInputElement && element.type === 'checkbox') value = element.checked;
      if (element instanceof HTMLInputElement && element.type === 'number') value = Number(element.value || 0);
      store.dispatch({ type: 'SET_WIZARD_VALUE', payload: { key, value } });
    };
    element.oninput = commit;
    element.onchange = commit;
  });

  root.querySelector('[data-action="save-template"]')?.addEventListener('click', () => {
    const current = store.getState();
    if (current.selectedItem?.type !== 'template') return;
    const template = current.data.templates.find((entry) => entry.id === current.selectedItem?.id);
    if (!template) return;

    const updated = {
      ...template,
      title: getValue(root, 'template-title'),
      description: getValue(root, 'template-description'),
      content: getValue(root, 'template-content'),
      tags: {
        themengebiet: getValue(root, 'template-tag-themengebiet'),
        gesetzVerordnung: getValue(root, 'template-tag-gesetz'),
        paragraph: getValue(root, 'template-tag-paragraph'),
        schlagwort: getValue(root, 'template-tag-schlagwort')
      },
      variableKeys: Array.from(root.querySelectorAll('[data-editor="template-variable"]:checked')).map((entry) => entry.value)
    };

    store.dispatch({ type: 'UPDATE_TEMPLATE', payload: updated });
  });

  root.querySelector('[data-action="save-block"]')?.addEventListener('click', () => {
    const current = store.getState();
    if (current.selectedItem?.type !== 'block') return;
    const block = current.data.blocks.find((entry) => entry.id === current.selectedItem?.id);
    if (!block) return;

    const updated = {
      ...block,
      title: getValue(root, 'block-title'),
      content: getValue(root, 'block-content'),
      tags: {
        themengebiet: getValue(root, 'block-tag-themengebiet'),
        gesetzVerordnung: getValue(root, 'block-tag-gesetz'),
        paragraph: getValue(root, 'block-tag-paragraph'),
        schlagwort: getValue(root, 'block-tag-schlagwort')
      },
      linkedVariableKeys: Array.from(root.querySelectorAll('[data-editor="block-variable"]:checked')).map((entry) => entry.value)
    };

    store.dispatch({ type: 'UPDATE_BLOCK', payload: updated });
  });

  root.querySelectorAll('[data-action="variable-default"]').forEach((element) => {
    element.onchange = () => {
      const key = element.dataset.key;
      if (!key) return;
      const state = store.getState();
      const variable = state.data.variableDefinitions.find((entry) => entry.key === key);
      if (!variable) return;

      const converted = convertByType(element.value, variable.type);
      const updated = { ...variable, defaultValue: converted };
      store.dispatch({ type: 'UPDATE_VARIABLE', payload: updated });
    };
  });

  root.querySelector('[data-action="export-json"]')?.addEventListener('click', () => {
    const payload = createExportPayload(store.getState().data);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `textbausteine-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    store.dispatch({ type: 'SET_IMPORT_EXPORT_MESSAGE', payload: 'Export erfolgreich erstellt.' });
  });

  root.querySelector('[data-action="import-json"]')?.addEventListener('change', async (event) => {
    const target = event.target;
    const file = target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      const validation = validateImportPayload(parsed);
      if (!validation.ok || !validation.data) {
        store.dispatch({ type: 'SET_VALIDATION_ISSUES', payload: validation.issues });
        store.dispatch({ type: 'SET_IMPORT_EXPORT_MESSAGE', payload: 'Import fehlgeschlagen: Validierungsfehler.' });
        return;
      }
      store.dispatch({ type: 'INIT', payload: validation.data });
      store.dispatch({ type: 'SET_IMPORT_EXPORT_MESSAGE', payload: 'Import erfolgreich geladen.' });
    } catch {
      store.dispatch({ type: 'SET_IMPORT_EXPORT_MESSAGE', payload: 'Import fehlgeschlagen: Datei konnte nicht gelesen werden.' });
    }
  });
}

function getValue(root, editorKey) {
  return root.querySelector(`[data-editor="${editorKey}"]`)?.value ?? '';
}

function convertByType(value, type) {
  if (type === 'number') return Number(value || 0);
  if (type === 'boolean') return value === 'true';
  return value;
}
