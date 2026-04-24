import { seedData } from '../sample/seed.js';

const DB_NAME = 'textbausteinverwaltung';
const DB_VERSION = 1;

const STORES = {
  blocks: 'blocks',
  templates: 'templates',
  variableDefinitions: 'variableDefinitions',
  derivedRules: 'derivedRules',
  preferences: 'preferences'
};

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const storeName of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function txRequest(storeName, mode, exec) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = exec(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

async function getAll(storeName) {
  const result = await txRequest(storeName, 'readonly', (store) => store.getAll());
  return result ?? [];
}

async function putMany(storeName, entries) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const entry of entries) {
      store.put(entry);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function initializeRepository() {
  await openDb();
  const blocks = await getAll(STORES.blocks);
  if (blocks.length > 0) return;

  await putMany(STORES.blocks, seedData.blocks);
  await putMany(STORES.templates, seedData.templates);
  await putMany(STORES.variableDefinitions, seedData.variableDefinitions.map((entry) => ({ ...entry, id: entry.key })));
  await putMany(STORES.derivedRules, seedData.derivedRules);
  await txRequest(STORES.preferences, 'readwrite', (store) => store.put({ id: 'prefs', ...seedData.preferences }));
}

export async function loadAppData() {
  const [blocks, templates, variableDefsRaw, derivedRules, prefRaw] = await Promise.all([
    getAll(STORES.blocks),
    getAll(STORES.templates),
    getAll(STORES.variableDefinitions),
    getAll(STORES.derivedRules),
    txRequest(STORES.preferences, 'readonly', (store) => store.get('prefs'))
  ]);

  return {
    blocks,
    templates,
    variableDefinitions: variableDefsRaw.map(({ id, ...rest }) => rest),
    derivedRules,
    preferences: prefRaw
      ? {
          expandedTreeNodeIds: prefRaw.expandedTreeNodeIds ?? [],
          libraryViewMode: prefRaw.libraryViewMode ?? 'tree',
          recentItemIds: prefRaw.recentItemIds ?? []
        }
      : seedData.preferences
  };
}

export async function saveAppData(data) {
  await Promise.all([
    putMany(STORES.blocks, data.blocks),
    putMany(STORES.templates, data.templates),
    putMany(STORES.variableDefinitions, data.variableDefinitions.map((entry) => ({ ...entry, id: entry.key }))),
    putMany(STORES.derivedRules, data.derivedRules),
    txRequest(STORES.preferences, 'readwrite', (store) => store.put({ id: 'prefs', ...data.preferences }))
  ]);
}

export function createExportPayload(data) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  };
}
