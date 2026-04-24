export function renderEditor(state) {
  if (!state.selectedItem) {
    return '<section class="panel"><h2>Editor</h2><p>Bitte wählen Sie links eine Vorlage oder einen Baustein aus.</p></section>';
  }

  if (state.selectedItem.type === 'template') {
    const template = state.data.templates.find((item) => item.id === state.selectedItem?.id);
    if (!template) return '<section class="panel"><h2>Editor</h2><p>Vorlage nicht gefunden.</p></section>';
    return renderTemplateEditor(template, state.data.variableDefinitions);
  }

  const block = state.data.blocks.find((item) => item.id === state.selectedItem.id);
  if (!block) return '<section class="panel"><h2>Editor</h2><p>Baustein nicht gefunden.</p></section>';
  return renderBlockEditor(block, state.data.variableDefinitions);
}

function renderTemplateEditor(template, variables) {
  return `
    <section class="panel">
      <h2>Vorlagen-Editor</h2>
      <label>Titel
        <input data-editor="template-title" value="${template.title}" />
      </label>
      <label>Beschreibung
        <input data-editor="template-description" value="${template.description ?? ''}" />
      </label>
      <div class="grid-2">${renderTagInputs(template.tags, 'template')}</div>
      <label>Inhalt (Platzhalter: {{variable_key}}, {{block:block_id}})
        <textarea data-editor="template-content" rows="10">${template.content}</textarea>
      </label>
      <div class="editor-secondary">
        <div>
          <h3>Variablen-Zuordnung</h3>
          ${variables
            .map(
              (variable) => `
              <label class="check-row">
                <input type="checkbox" data-editor="template-variable" value="${variable.key}" ${
                template.variableKeys.includes(variable.key) ? 'checked' : ''
              } />
                <span>${variable.label} <small>(${variable.key})</small></span>
              </label>`
            )
            .join('')}
        </div>
        <div>
          <h3>Platzhalter-Liste</h3>
          <ul class="placeholder-list">
            ${variables.map((variable) => `<li><code>{{${variable.key}}}</code> – ${variable.label}</li>`).join('')}
            <li><code>{{block:block_1}}</code> – Beispiel Baustein-Einbindung</li>
          </ul>
        </div>
      </div>
      <button class="primary" data-action="save-template">Vorlage speichern</button>
    </section>
  `;
}

function renderBlockEditor(block, variables) {
  return `
    <section class="panel">
      <h2>Baustein-Editor</h2>
      <label>Titel
        <input data-editor="block-title" value="${block.title}" />
      </label>
      <div class="grid-2">${renderTagInputs(block.tags, 'block')}</div>
      <label>Bausteininhalt
        <textarea data-editor="block-content" rows="10">${block.content}</textarea>
      </label>
      <h3>Verknüpfte Variablen</h3>
      ${variables
        .map(
          (variable) => `
          <label class="check-row">
            <input type="checkbox" data-editor="block-variable" value="${variable.key}" ${
            block.linkedVariableKeys.includes(variable.key) ? 'checked' : ''
          } />
            <span>${variable.label} <small>(${variable.key})</small></span>
          </label>`
        )
        .join('')}
      <button class="primary" data-action="save-block">Baustein speichern</button>
    </section>
  `;
}

function renderTagInputs(tags, prefix) {
  return `
    <label>Themengebiet
      <input data-editor="${prefix}-tag-themengebiet" value="${tags.themengebiet}" />
    </label>
    <label>Gesetz/Verordnung
      <input data-editor="${prefix}-tag-gesetz" value="${tags.gesetzVerordnung}" />
    </label>
    <label>Paragraph
      <input data-editor="${prefix}-tag-paragraph" value="${tags.paragraph}" />
    </label>
    <label>Schlagwort
      <input data-editor="${prefix}-tag-schlagwort" value="${tags.schlagwort}" />
    </label>
  `;
}
