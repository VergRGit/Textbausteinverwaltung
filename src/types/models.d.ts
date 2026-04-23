export type ID = string;

export type VariableType = 'text' | 'select' | 'date' | 'number' | 'boolean' | 'derived';
export type TextInputMode = 'singleline' | 'multiline';

export interface TagSet {
  themengebiet: string;
  gesetzVerordnung: string;
  paragraph: string;
  schlagwort: string;
}

export interface VariableDefinition {
  key: string;
  label: string;
  type: VariableType;
  description?: string;
  defaultValue?: string | number | boolean;
  required: boolean;
  askInWizard: boolean;
  showInExpertMode: boolean;
  offerInInsertionMenu: boolean;
  renderableInDocument: boolean;
  textInputMode?: TextInputMode;
  options?: string[];
  derivedRuleId?: ID;
  group?: string;
}

export interface DerivedRule {
  id: ID;
  variableKey: string;
  label: string;
  ifVariableKey: string;
  equals: string | number | boolean;
  thenValue: string;
  elseValue: string;
}

export interface SlotDefinition {
  key: string;
  label: string;
  description?: string;
  required: boolean;
}

export interface Block {
  id: ID;
  type: 'block';
  title: string;
  content: string;
  tags: TagSet;
  linkedVariableKeys: string[];
  slotDefinitions: SlotDefinition[];
  updatedAt: string;
}

export interface Template {
  id: ID;
  type: 'template';
  title: string;
  description?: string;
  content: string;
  tags: TagSet;
  blockIds: ID[];
  variableKeys: string[];
  conditionKeys: string[];
  updatedAt: string;
}

export interface DocumentInstance {
  id: ID;
  templateId: ID;
  title: string;
  values: Record<string, string | number | boolean>;
  createdAt: string;
  renderedContent: string;
}

export interface ValidationIssue {
  code:
    | 'DUPLICATE_VARIABLE_KEY'
    | 'INVALID_VARIABLE_CONFIG'
    | 'MISSING_REQUIRED_METADATA'
    | 'UNKNOWN_TEMPLATE_VARIABLE'
    | 'BROKEN_DERIVED_RULE';
  severity: 'error' | 'warning';
  message: string;
  entityType: 'variable' | 'template' | 'block' | 'rule' | 'import';
  entityId: string;
}

export interface UIPreferences {
  expandedTreeNodeIds: string[];
  libraryViewMode: 'tree' | 'list';
  recentItemIds: string[];
}

export interface AppData {
  blocks: Block[];
  templates: Template[];
  variableDefinitions: VariableDefinition[];
  derivedRules: DerivedRule[];
  preferences: UIPreferences;
}

export interface ImportPayload {
  version: number;
  exportedAt: string;
  data: AppData;
}
