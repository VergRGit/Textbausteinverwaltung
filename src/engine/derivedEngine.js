/**
 * @param {Record<string, string|number|boolean>} values
 * @param {import('../types/models').VariableDefinition[]} variables
 * @param {import('../types/models').DerivedRule[]} rules
 */
export function evaluateDerivedVariables(values, variables, rules) {
  const output = { ...values };
  const ruleById = new Map(rules.map((rule) => [rule.id, rule]));

  for (const variable of variables) {
    if (variable.type !== 'derived' || !variable.derivedRuleId) continue;
    const rule = ruleById.get(variable.derivedRuleId);
    if (!rule) continue;

    const compareValue = output[rule.ifVariableKey];
    output[variable.key] = compareValue === rule.equals ? rule.thenValue : rule.elseValue;
  }

  return output;
}
