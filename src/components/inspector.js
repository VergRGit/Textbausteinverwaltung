export function renderInspector(state, preview) {
  return `
    <section class="panel inspector">
      <h2>Inspektor</h2>
      <details open>
        <summary>Vorschau</summary>
        <article class="preview-doc">${escapeHtml(preview)}</article>
      </details>
      <details open>
        <summary>Variablenkatalog</summary>
        <div class="variable-list">
          ${state.data.variableDefinitions
            .map(
              (variable) => `
              <div class="variable-item">
                <strong>${variable.label}</strong>
                <small>${variable.key} · ${variable.type}</small>
                <label>Standardwert
                  <input data-action="variable-default" data-key="${variable.key}" value="${variable.defaultValue ?? ''}" />
                </label>
              </div>`
            )
            .join('')}
        </div>
      </details>
      <details open>
        <summary>Import/Export</summary>
        <div class="stack">
          <button data-action="export-json">Export JSON</button>
          <input type="file" accept="application/json" data-action="import-json" />
          <p class="muted">${state.importExportMessage || 'Bereit für Import/Export.'}</p>
        </div>
      </details>
      <details open>
        <summary>Validierung (${state.validationIssues.length})</summary>
        ${renderIssues(state.validationIssues)}
      </details>
    </section>
  `;
}

function renderIssues(issues) {
  if (!issues.length) return '<p class="ok">Keine Validierungsfehler.</p>';
  return `<ul class="issue-list">${issues
    .map((issue) => `<li><strong>${issue.code}</strong><span>${issue.message}</span></li>`)
    .join('')}</ul>`;
}

function escapeHtml(input) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
    .replaceAll('\n', '<br/>');
}
