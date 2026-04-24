function normalize(text) {
  return text.toLocaleLowerCase('de-DE');
}

function matchesSearch(value, query) {
  if (!query) return true;
  return normalize(value).includes(normalize(query));
}

export function renderLibrary(state) {
  const query = state.searchTerm.trim();

  const blocks = state.data.blocks.filter(
    (item) =>
      matchesSearch(item.title, query) ||
      matchesSearch(item.tags.themengebiet, query) ||
      matchesSearch(item.tags.gesetzVerordnung, query) ||
      matchesSearch(item.tags.paragraph, query) ||
      matchesSearch(item.tags.schlagwort, query)
  );
  const templates = state.data.templates.filter(
    (item) =>
      matchesSearch(item.title, query) ||
      matchesSearch(item.tags.themengebiet, query) ||
      matchesSearch(item.tags.gesetzVerordnung, query) ||
      matchesSearch(item.tags.paragraph, query) ||
      matchesSearch(item.tags.schlagwort, query)
  );

  if (state.data.preferences.libraryViewMode === 'list') {
    return `
      <div class="library-list">
        <h3>Vorlagen</h3>
        ${templates.map((item) => renderListItem(item, 'template', state)).join('')}
        <h3>Bausteine</h3>
        ${blocks.map((item) => renderListItem(item, 'block', state)).join('')}
      </div>
    `;
  }

  const tree = {};
  for (const item of [...templates, ...blocks]) {
    const tg = item.tags.themengebiet || 'Ohne Themengebiet';
    const gv = item.tags.gesetzVerordnung || 'Ohne Gesetz';
    const para = item.tags.paragraph || 'Ohne Paragraph';
    const keyword = item.tags.schlagwort || 'Ohne Schlagwort';
    tree[tg] ??= {};
    tree[tg][gv] ??= {};
    tree[tg][gv][`${para} • ${keyword}`] ??= [];
    tree[tg][gv][`${para} • ${keyword}`].push(item);
  }

  return Object.entries(tree)
    .map(([tg, laws]) => {
      const tgId = `tg:${tg}`;
      return renderNode(
        tgId,
        tg,
        Object.entries(laws)
          .map(([law, groups]) => {
            const lawId = `gv:${tg}:${law}`;
            return renderNode(
              lawId,
              law,
              Object.entries(groups)
                .map(([groupName, items]) => {
                  const groupId = `grp:${tg}:${law}:${groupName}`;
                  return renderNode(
                    groupId,
                    groupName,
                    items.map((item) => renderListItem(item, item.type, state)).join(''),
                    state
                  );
                })
                .join(''),
              state
            );
          })
          .join(''),
        state
      );
    })
    .join('');
}

function renderNode(id, label, children, state) {
  const expanded = state.data.preferences.expandedTreeNodeIds.includes(id);
  return `
    <div class="tree-node">
      <button class="tree-toggle" data-action="toggle-node" data-node-id="${id}" aria-expanded="${expanded}">
        <span>${expanded ? '▾' : '▸'}</span> ${label}
      </button>
      <div class="tree-children ${expanded ? '' : 'is-hidden'}">${children}</div>
    </div>
  `;
}

function renderListItem(item, itemType, state) {
  const selected = state.selectedItem?.id === item.id ? 'is-selected' : '';
  const typeLabel = itemType === 'template' ? 'Vorlage' : 'Baustein';
  return `
    <button class="library-item ${selected}" data-action="select-item" data-item-id="${item.id}" data-item-type="${itemType}">
      <strong>${item.title}</strong>
      <small>${typeLabel} · ${item.tags.paragraph}</small>
    </button>
  `;
}
