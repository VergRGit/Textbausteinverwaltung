# Legacy Single-File App Migration Strategy

## Goal
Break a large single-file HTML/CSS/JS application into maintainable modules without requiring the original source at this step.

## Target outcomes
- `index.html` as the shell only.
- CSS split into focused modules.
- Centralized app state/store.
- Isolated IndexedDB data access layer.
- Reusable UI components.
- Dedicated variable engine.
- Dedicated wizard flow module.
- Dedicated renderer for preview/output.

## Suggested migration phases

### Phase 0 — Stabilize and baseline
1. Freeze feature work while extracting architecture.
2. Capture behavior baseline with manual smoke checklist:
   - load app
   - edit data
   - run variable substitutions
   - run wizard steps
   - render output
   - save/load from IndexedDB
3. Keep one deployable branch for rollback.

### Phase 1 — Extract shell and bootstrapping
1. Keep current app behavior intact.
2. Replace monolithic file with:
   - lightweight `index.html`
   - module entrypoint (`src/main.js`)
3. Move inline CSS/JS out of HTML.

### Phase 2 — Carve out state and persistence
1. Introduce store (`src/state/store.js`) as the single source of truth.
2. Move all IndexedDB calls into `src/db/indexeddb.js`.
3. Route UI changes through dispatch/actions, not direct DOM-global mutations.

### Phase 3 — Split features into modules
1. UI components (`src/components/*`) handle markup + events only.
2. Variable logic (`src/engine/variableEngine.js`) handles parsing/evaluation.
3. Wizard flow (`src/wizard/wizardController.js`) handles step progression/validation.
4. Renderer (`src/renderer/previewRenderer.js`) turns state + templates into preview/output.

### Phase 4 — CSS modularization
1. `src/styles/base.css` for reset/tokens/layout primitives.
2. `src/styles/components.css` for shared component rules.
3. Optional feature CSS modules as complexity grows (wizard, renderer, editor).

### Phase 5 — Hardening and cleanup
1. Add unit tests around pure modules (store, engine, renderer).
2. Add integration smoke checks for boot + IndexedDB.
3. Remove dead globals and inline leftovers.
4. Document extension points and module contracts.

## Architecture contracts

### Data flow
`UI event -> action -> store update -> renderer/component re-render -> persistence sync`

### Store contract
- `getState()` returns immutable snapshot.
- `dispatch(action)` is the only mutation path.
- `subscribe(listener)` for updates.

### IndexedDB contract
- `initDB()` sets up schema.
- CRUD methods return Promises.
- No UI code in DB module.

### Component contract
- Accept input props/state.
- Emit callbacks/actions.
- Do not directly mutate global state.

### Variable engine contract
- Pure functions where possible.
- Deterministic output for same inputs.
- Clear error object shape.

### Wizard contract
- Explicit step configuration.
- Validation gate before next step.
- Navigation state stored centrally.

### Renderer contract
- Stateless render functions.
- Escaped/safe output handling.
- Separate preview vs export formatting.

## Target folder structure

```text
.
├── index.html
├── docs/
│   └── migration-strategy.md
└── src/
    ├── main.js
    ├── app/
    │   └── init.js
    ├── styles/
    │   ├── base.css
    │   └── components.css
    ├── state/
    │   └── store.js
    ├── db/
    │   └── indexeddb.js
    ├── components/
    │   ├── AppShell.js
    │   ├── TemplateEditor.js
    │   └── WizardPanel.js
    ├── engine/
    │   └── variableEngine.js
    ├── wizard/
    │   └── wizardController.js
    └── renderer/
        └── previewRenderer.js
```

## Migration mapping template (use later when source is available)
Use this matrix to map legacy sections to modules:

| Legacy area | New module | Notes |
|---|---|---|
| Inline CSS block(s) | `src/styles/*` | Split by base/components/features |
| Global variables | `src/state/store.js` | Normalize state tree |
| `indexedDB` calls | `src/db/indexeddb.js` | Promise API only |
| Template interpolation | `src/engine/variableEngine.js` | Pure functions first |
| Wizard step logic | `src/wizard/wizardController.js` | Declarative step config |
| HTML string rendering | `src/renderer/previewRenderer.js` | Escape + sanitize path |
| DOM event wiring | `src/components/*` + `src/app/init.js` | Componentized listeners |

