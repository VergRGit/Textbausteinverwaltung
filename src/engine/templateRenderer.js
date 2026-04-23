import { evaluateDerivedVariables } from './derivedEngine.js';

const TOKEN_PATTERN = /{{\s*([^}]+?)\s*}}/g;

function stringifyValue(value) {
  if (value === undefined || value === null || value === '') return '⚠️ [Wert fehlt]';
  return String(value);
}

/**
 * @param {import('../types/models').Template} template
 * @param {import('../types/models').Block[]} blocks
 * @param {import('../types/models').VariableDefinition[]} variables
 * @param {import('../types/models').DerivedRule[]} rules
 * @param {Record<string, string|number|boolean>} values
 */
export function renderTemplate(template, blocks, variables, rules, values) {
  const mergedValues = evaluateDerivedVariables(values, variables, rules);
  const blockMap = new Map(blocks.map((block) => [block.id, block]));

  const withBlocks = template.content.replace(TOKEN_PATTERN, (fullMatch, token) => {
    if (token.startsWith('block:')) {
      const id = token.replace('block:', '').trim();
      return blockMap.get(id)?.content ?? `⚠️ [Baustein ${id} fehlt]`;
    }
    return fullMatch;
  });

  return withBlocks.replace(TOKEN_PATTERN, (_, token) => stringifyValue(mergedValues[token.trim()]));
}
