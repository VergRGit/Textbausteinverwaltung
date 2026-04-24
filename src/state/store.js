import { validateData } from '../validation/validators.js';

export function createInitialState() {
  return {
    data: {
      blocks: [],
      templates: [],
      variableDefinitions: [],
      derivedRules: [],
      preferences: { expandedTreeNodeIds: [], libraryViewMode: 'tree', recentItemIds: [] }
    },
    selectedItem: null,
    searchTerm: '',
    wizardValues: {},
    importExportMessage: '',
    validationIssues: []
  };
}

export function reduce(state, action) {
  switch (action.type) {
    case 'INIT': {
      const selectedTemplate = action.payload.templates[0];
      return {
        ...state,
        data: action.payload,
        selectedItem: selectedTemplate ? { type: 'template', id: selectedTemplate.id } : null,
        validationIssues: validateData(action.payload)
      };
    }
    case 'SELECT_ITEM':
      return {
        ...state,
        selectedItem: action.payload,
        data: {
          ...state.data,
          preferences: {
            ...state.data.preferences,
            recentItemIds: [action.payload.id, ...state.data.preferences.recentItemIds.filter((id) => id !== action.payload.id)].slice(
              0,
              8
            )
          }
        }
      };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'TOGGLE_NODE': {
      const expanded = new Set(state.data.preferences.expandedTreeNodeIds);
      if (expanded.has(action.payload)) expanded.delete(action.payload);
      else expanded.add(action.payload);
      return {
        ...state,
        data: {
          ...state.data,
          preferences: {
            ...state.data.preferences,
            expandedTreeNodeIds: [...expanded]
          }
        }
      };
    }
    case 'SET_LIBRARY_VIEW':
      return {
        ...state,
        data: {
          ...state.data,
          preferences: {
            ...state.data.preferences,
            libraryViewMode: action.payload
          }
        }
      };
    case 'UPDATE_TEMPLATE': {
      const templates = state.data.templates.map((template) =>
        template.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : template
      );
      const data = { ...state.data, templates };
      return { ...state, data, validationIssues: validateData(data) };
    }
    case 'UPDATE_BLOCK': {
      const blocks = state.data.blocks.map((block) =>
        block.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : block
      );
      const data = { ...state.data, blocks };
      return { ...state, data, validationIssues: validateData(data) };
    }
    case 'UPDATE_VARIABLE': {
      const variableDefinitions = state.data.variableDefinitions.map((variable) =>
        variable.key === action.payload.key ? action.payload : variable
      );
      const data = { ...state.data, variableDefinitions };
      return { ...state, data, validationIssues: validateData(data) };
    }
    case 'SET_WIZARD_VALUE':
      return { ...state, wizardValues: { ...state.wizardValues, [action.payload.key]: action.payload.value } };
    case 'SET_IMPORT_EXPORT_MESSAGE':
      return { ...state, importExportMessage: action.payload };
    case 'SET_VALIDATION_ISSUES':
      return { ...state, validationIssues: action.payload };
    default:
      return state;
  }
}

export function createStore(initial) {
  let state = initial;
  const listeners = new Set();

  return {
    getState: () => state,
    dispatch(action) {
      state = reduce(state, action);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
