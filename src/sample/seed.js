/** @typedef {import('../types/models').AppData} AppData */

/** @type {AppData} */
export const seedData = {
  blocks: [
    {
      id: 'block_1',
      type: 'block',
      title: 'Einleitung Verwaltungsverfahren',
      content: 'Sehr geehrte Damen und Herren,\n\nnamens {{antragsteller_name}} wird folgender Antrag gestellt.',
      tags: {
        themengebiet: 'Verwaltungsrecht',
        gesetzVerordnung: 'VwVfG',
        paragraph: '§ 28',
        schlagwort: 'Anhörung'
      },
      linkedVariableKeys: ['antragsteller_name'],
      slotDefinitions: [],
      updatedAt: new Date().toISOString()
    }
  ],
  templates: [
    {
      id: 'tpl_1',
      type: 'template',
      title: 'Widerspruchsbegründung (Basis)',
      description: 'Erste vertikale Slice-Vorlage mit Variablen und Vorschau.',
      content: '{{block:block_1}}\n\nSachverhalt:\n{{sachverhalt}}\n\nVerfahren: {{verfahrenstyp}}\n{{frist_hinweis}}',
      tags: {
        themengebiet: 'Verwaltungsrecht',
        gesetzVerordnung: 'VwVfG',
        paragraph: '§ 70',
        schlagwort: 'Widerspruch'
      },
      blockIds: ['block_1'],
      variableKeys: ['antragsteller_name', 'sachverhalt', 'frist_tage', 'verfahrenstyp', 'frist_hinweis'],
      conditionKeys: [],
      updatedAt: new Date().toISOString()
    }
  ],
  variableDefinitions: [
    {
      key: 'antragsteller_name',
      label: 'Name Antragsteller',
      type: 'text',
      description: 'Vollständiger Name der antragstellenden Person.',
      required: true,
      askInWizard: true,
      showInExpertMode: true,
      offerInInsertionMenu: true,
      renderableInDocument: true,
      textInputMode: 'singleline',
      group: 'Person'
    },
    {
      key: 'sachverhalt',
      label: 'Sachverhalt',
      type: 'text',
      description: 'Kurze Darstellung des Sachverhalts.',
      required: true,
      askInWizard: true,
      showInExpertMode: true,
      offerInInsertionMenu: true,
      renderableInDocument: true,
      textInputMode: 'multiline',
      group: 'Inhalt'
    },
    {
      key: 'frist_tage',
      label: 'Frist in Tagen',
      type: 'number',
      required: true,
      askInWizard: true,
      showInExpertMode: true,
      offerInInsertionMenu: false,
      renderableInDocument: true,
      defaultValue: 14,
      group: 'Fristen'
    },
    {
      key: 'verfahrenstyp',
      label: 'Verfahrenstyp',
      type: 'select',
      required: true,
      askInWizard: true,
      showInExpertMode: true,
      offerInInsertionMenu: false,
      renderableInDocument: true,
      options: ['Widerspruch', 'Anhörung', 'Eilantrag'],
      defaultValue: 'Widerspruch',
      group: 'Verfahren'
    },
    {
      key: 'frist_hinweis',
      label: 'Fristhinweis',
      type: 'derived',
      required: false,
      askInWizard: false,
      showInExpertMode: true,
      offerInInsertionMenu: true,
      renderableInDocument: true,
      derivedRuleId: 'rule_frist_hinweis',
      group: 'Fristen'
    }
  ],
  derivedRules: [
    {
      id: 'rule_frist_hinweis',
      variableKey: 'frist_hinweis',
      label: 'Fristhinweis auf Basis der Frist',
      ifVariableKey: 'frist_tage',
      equals: 14,
      thenValue: 'Die Standardfrist beträgt 14 Tage.',
      elseValue: 'Bitte prüfen Sie die abweichende Frist.'
    }
  ],
  preferences: {
    expandedTreeNodeIds: ['tg:Verwaltungsrecht', 'gv:Verwaltungsrecht:VwVfG'],
    libraryViewMode: 'tree',
    recentItemIds: ['tpl_1']
  }
};
