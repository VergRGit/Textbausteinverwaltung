function pushIssue(issues, issue) {
  issues.push({ severity: issue.severity ?? 'error', ...issue });
}

function isVariableConfigInvalid(variable) {
  if (variable.type === 'select' && (!variable.options || variable.options.length === 0)) return true;
  if (variable.type === 'text' && !variable.textInputMode) return true;
  if (variable.type === 'derived' && !variable.derivedRuleId) return true;
  return false;
}

export function validateData(data) {
  const issues = [];

  const seen = new Set();
  for (const variable of data.variableDefinitions) {
    if (seen.has(variable.key)) {
      pushIssue(issues, {
        code: 'DUPLICATE_VARIABLE_KEY',
        entityType: 'variable',
        entityId: variable.key,
        message: `Variable-Schlüssel doppelt vorhanden: ${variable.key}`
      });
    }
    seen.add(variable.key);

    if (isVariableConfigInvalid(variable)) {
      pushIssue(issues, {
        code: 'INVALID_VARIABLE_CONFIG',
        entityType: 'variable',
        entityId: variable.key,
        message: `Ungültige Konfiguration für Variable ${variable.key}`
      });
    }

    if (!variable.label.trim()) {
      pushIssue(issues, {
        code: 'MISSING_REQUIRED_METADATA',
        entityType: 'variable',
        entityId: variable.key,
        message: `Variable ${variable.key} ohne Label`
      });
    }
  }

  const variableKeys = new Set(data.variableDefinitions.map((v) => v.key));
  for (const template of data.templates) {
    if (!template.title.trim()) {
      pushIssue(issues, {
        code: 'MISSING_REQUIRED_METADATA',
        entityType: 'template',
        entityId: template.id,
        message: `Vorlage ${template.id} ohne Titel`
      });
    }

    for (const key of template.variableKeys) {
      if (!variableKeys.has(key)) {
        pushIssue(issues, {
          code: 'UNKNOWN_TEMPLATE_VARIABLE',
          entityType: 'template',
          entityId: template.id,
          message: `Vorlage ${template.title} referenziert unbekannte Variable ${key}`
        });
      }
    }
  }

  const ruleKeys = new Set(data.derivedRules.map((rule) => rule.id));
  for (const variable of data.variableDefinitions.filter((entry) => entry.type === 'derived')) {
    if (!variable.derivedRuleId || !ruleKeys.has(variable.derivedRuleId)) {
      pushIssue(issues, {
        code: 'BROKEN_DERIVED_RULE',
        entityType: 'variable',
        entityId: variable.key,
        message: `Derived-Variable ${variable.key} verweist auf ungültige Regel`
      });
    }
  }

  for (const rule of data.derivedRules) {
    if (!variableKeys.has(rule.ifVariableKey)) {
      pushIssue(issues, {
        code: 'BROKEN_DERIVED_RULE',
        entityType: 'rule',
        entityId: rule.id,
        message: `Regel ${rule.label} hat unbekannte Vergleichsvariable ${rule.ifVariableKey}`
      });
    }
  }

  return issues;
}

export function validateImportPayload(payload) {
  const issues = [];

  if (!payload || typeof payload !== 'object') {
    pushIssue(issues, {
      code: 'INVALID_VARIABLE_CONFIG',
      entityType: 'import',
      entityId: 'root',
      message: 'Importformat ist kein Objekt.'
    });
    return { ok: false, issues };
  }

  if (payload.version !== 1 || !payload.data) {
    pushIssue(issues, {
      code: 'INVALID_VARIABLE_CONFIG',
      entityType: 'import',
      entityId: 'root',
      message: 'Importformat muss Version 1 und data enthalten.'
    });
    return { ok: false, issues };
  }

  const dataIssues = validateData(payload.data);
  return { ok: dataIssues.length === 0, issues: dataIssues, data: payload.data };
}
