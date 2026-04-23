export function renderWizard(state) {
  const selectedTemplate =
    state.selectedItem?.type === 'template'
      ? state.data.templates.find((template) => template.id === state.selectedItem?.id)
      : undefined;

  if (!selectedTemplate) {
    return '<section class="panel"><h2>Wizard</h2><p>Für den Wizard bitte eine Vorlage auswählen.</p></section>';
  }

  const neededVariables = resolveWizardVariables(selectedTemplate, state.data.variableDefinitions);
  const grouped = groupBy(neededVariables, (item) => item.group || 'Allgemein');

  return `
    <section class="panel">
      <h2>Wizard · ${selectedTemplate.title}</h2>
      ${Object.entries(grouped)
        .map(
          ([groupName, entries]) => `
            <fieldset>
              <legend>${groupName}</legend>
              ${entries.map((variable) => renderWizardField(variable, state)).join('')}
            </fieldset>`
        )
        .join('')}
    </section>
  `;
}

function resolveWizardVariables(template, variables) {
  const used = new Set(template.variableKeys);
  return variables.filter((variable) => used.has(variable.key) && variable.askInWizard && variable.type !== 'derived');
}

function renderWizardField(variable, state) {
  const value = state.wizardValues[variable.key] ?? variable.defaultValue ?? '';
  const requiredMark = variable.required ? '*' : '';

  if (variable.type === 'select') {
    const options = (variable.options ?? [])
      .map((entry) => `<option value="${entry}" ${value === entry ? 'selected' : ''}>${entry}</option>`)
      .join('');
    return `<label>${variable.label} ${requiredMark}<select data-action="wizard-input" data-key="${variable.key}">${options}</select></label>`;
  }

  if (variable.type === 'boolean') {
    return `<label class="check-row"><input type="checkbox" data-action="wizard-input" data-key="${variable.key}" ${
      value === true ? 'checked' : ''
    }/>${variable.label}</label>`;
  }

  if (variable.type === 'date') {
    return `<label>${variable.label} ${requiredMark}<input type="date" data-action="wizard-input" data-key="${variable.key}" value="${value}" /></label>`;
  }

  if (variable.type === 'number') {
    return `<label>${variable.label} ${requiredMark}<input type="number" data-action="wizard-input" data-key="${variable.key}" value="${value}" /></label>`;
  }

  if (variable.textInputMode === 'multiline') {
    return `<label>${variable.label} ${requiredMark}<textarea rows="4" data-action="wizard-input" data-key="${variable.key}">${value}</textarea></label>`;
  }

  return `<label>${variable.label} ${requiredMark}<input type="text" data-action="wizard-input" data-key="${variable.key}" value="${value}" /></label>`;
}

function groupBy(entries, getKey) {
  return entries.reduce((acc, entry) => {
    const key = getKey(entry);
    acc[key] ??= [];
    acc[key].push(entry);
    return acc;
  }, {});
}
