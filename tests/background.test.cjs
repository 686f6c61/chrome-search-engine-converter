/**
 * Tests para background.js con mocks de la API de Chrome.
 *
 * Carga background.js en un contexto VM con mocks de chrome.* y verifica
 * el comportamiento del service worker: menus contextuales, atajos y omnibox.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

/**
 * Carga engines.js + background.js en un contexto VM con mocks de chrome.
 * Devuelve el contexto para inspeccionar los mocks y el estado.
 */
function loadBackgroundModule() {
  const enginesPath = path.join(__dirname, '..', 'extension', 'engines.js');
  const bgPath = path.join(__dirname, '..', 'extension', 'background.js');
  let enginesSource = fs.readFileSync(enginesPath, 'utf8');
  /* Strip export keywords para poder cargar en VM (CommonJS) */
  enginesSource = enginesSource.replace(/\bexport\s+(const|function|let|var|class)\b/g, '$1');
  let bgSource = fs.readFileSync(bgPath, 'utf8');
  /* Reemplazar import dinamico por asignacion manual: las exports de engines.js
     ya estan en el contexto global, asi que eliminamos el import statement. */
  bgSource = bgSource.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');

  /* Mock state */
  const mockStorage = {};
  const mockContextMenus = [];
  const mockTabs = [{ id: 1, url: 'https://www.google.com/search?q=test', active: true, currentWindow: true }];
  let activeTabId = 1;
  const createdTabs = [];
  const updatedTabs = [];
  let badgeText = '';
  let badgeColor = '';
  let uninstallUrl = '';

  const onInstalledListeners = [];
  const onStartupListeners = [];
  const onActivatedListeners = [];
  const onUpdatedListeners = [];
  const onCommandListeners = [];
  const omniboxEnteredListeners = [];
  const omniboxChangedListeners = [];
  const contextMenuClickListeners = [];
  const storageChangeListeners = [];

  const mockChrome = {
    runtime: {
      onInstalled: { addListener: (fn) => onInstalledListeners.push(fn) },
      onStartup: { addListener: (fn) => onStartupListeners.push(fn) },
      lastError: null,
      setUninstallURL: (url) => { uninstallUrl = url; }
    },
    storage: {
      local: {
        get: (key, cb) => {
          const data = {};
          if (typeof key === 'string' && mockStorage[key] !== undefined) {
            data[key] = mockStorage[key];
          }
          cb(data);
        },
        set: (obj, cb) => {
          Object.assign(mockStorage, obj);
          if (cb) cb();
          /* Notificar listeners de cambio */
          const changes = {};
          for (const k of Object.keys(obj)) {
            changes[k] = { newValue: obj[k] };
          }
          storageChangeListeners.forEach(fn => fn(changes, 'local'));
        }
      },
      onChanged: { addListener: (fn) => storageChangeListeners.push(fn) }
    },
    contextMenus: {
      removeAll: (cb) => { mockContextMenus.length = 0; if (cb) cb(); },
      create: (props) => { mockContextMenus.push(props); return mockContextMenus.length; },
      onClicked: { addListener: (fn) => contextMenuClickListeners.push(fn) }
    },
    tabs: {
      query: (opts, cb) => cb(mockTabs.filter(t => t.active)),
      get: (id, cb) => {
        const tab = mockTabs.find(t => t.id === id);
        cb(tab || null);
      },
      create: (props, cb) => {
        createdTabs.push(props);
        if (cb) cb({ id: 999, ...props });
      },
      update: (idOrProps, propsOrCb, cb) => {
        let id, props;
        if (typeof idOrProps === 'number') {
          id = idOrProps;
          props = propsOrCb;
        } else {
          props = idOrProps;
          cb = propsOrCb;
          id = activeTabId;
        }
        updatedTabs.push({ id, props });
        if (cb) cb({ id: activeTabId, ...props });
      },
      onActivated: { addListener: (fn) => onActivatedListeners.push(fn) },
      onUpdated: { addListener: (fn) => onUpdatedListeners.push(fn) }
    },
    commands: {
      onCommand: { addListener: (fn) => onCommandListeners.push(fn) }
    },
    omnibox: {
      onInputEntered: { addListener: (fn) => omniboxEnteredListeners.push(fn) },
      onInputChanged: { addListener: (fn) => omniboxChangedListeners.push(fn) }
    },
    action: {
      setBadgeText: (opts) => { badgeText = opts.text; },
      setBadgeBackgroundColor: (opts) => { badgeColor = opts.color; }
    },
    windows: { WINDOW_ID_CURRENT: -2 }
  };

  const context = { chrome: mockChrome, console };
  vm.createContext(context);

  /* Cargar engines.js primero */
  vm.runInContext(enginesSource, context, { filename: 'engines.js' });

  /* Cargar background.js: el import statement ya fue stripped, las exports
     de engines.js estan en el contexto global */
  vm.runInContext(bgSource, context, { filename: 'background.js' });

  return {
    chrome: mockChrome,
    storage: mockStorage,
    contextMenus: mockContextMenus,
    tabs: mockTabs,
    createdTabs,
    updatedTabs,
    getBadgeText: () => badgeText,
    getBadgeColor: () => badgeColor,
    getUninstallUrl: () => uninstallUrl,
    setActiveTabId: (id) => { activeTabId = id; },
    /* Disparar eventos manualmente para tests */
    fireOnInstalled: (reason) => onInstalledListeners.forEach(fn => fn({ reason: reason || 'install' })),
    fireOnActivated: (tabId) => {
      onActivatedListeners.forEach(fn => fn({ tabId }));
    },
    fireOnUpdated: (tabId, changeInfo, tab) => {
      onUpdatedListeners.forEach(fn => fn(tabId, changeInfo, tab));
    },
    fireContextMenuClick: (info) => {
      contextMenuClickListeners.forEach(fn => fn(info));
    },
    fireCommand: (command) => {
      onCommandListeners.forEach(fn => fn(command));
    },
    fireOmniboxEnter: (text, disposition) => {
      omniboxEnteredListeners.forEach(fn => fn(text, disposition || 'currentTab'));
    }
  };
}

/* ============================================================================
 * Tests de menus contextuales
 * ============================================================================ */

test('background creates context menus on load', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  assert.ok(mod.contextMenus.length > 0);
  const ids = mod.contextMenus.map(m => m.id);
  assert.ok(ids.includes('search_default'));
  assert.ok(ids.includes('search_separator'));
  assert.ok(ids.includes('searchEngineConverter'));
});

test('context menu includes engines with showInContextMenu true', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  const engineMenuItems = mod.contextMenus.filter(m =>
    m.id && m.id.startsWith('engine_') && m.parentId === 'searchEngineConverter'
  );
  /* Al menos Google, Brave, DuckDuckGo, Bing deben estar */
  assert.ok(engineMenuItems.length >= 4);
});

test('context menu default action uses default engine name', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  const defaultItem = mod.contextMenus.find(m => m.id === 'search_default');
  assert.ok(defaultItem);
  assert.ok(defaultItem.title.includes('Google'));
});

/* ============================================================================
 * Tests de badge dinamico
 * ============================================================================ */

test('background.js defines config with domain defaults', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  /* Si los menus se crean correctamente, config tiene los defaults */
  assert.ok(mod.contextMenus.length > 0);
});

test('setUninstallURL is called on install', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  assert.ok(mod.getUninstallUrl().includes('github.com'));
});

test('setUninstallURL is not called on update', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('update');
  assert.equal(mod.getUninstallUrl(), '');
});

test('badge shows G for Google URL via onActivated', () => {
  const mod = loadBackgroundModule();
  mod.tabs[0] = { id: 1, url: 'https://www.google.com/search?q=test', active: true };
  mod.fireOnActivated(1);
  assert.equal(mod.getBadgeText(), 'G');
});

test('badge shows B for Brave URL via onActivated', () => {
  const mod = loadBackgroundModule();
  mod.tabs[0] = { id: 1, url: 'https://search.brave.com/search?q=test', active: true };
  mod.fireOnActivated(1);
  assert.equal(mod.getBadgeText(), 'B');
});

test('badge clears for non-search URL', () => {
  const mod = loadBackgroundModule();
  mod.tabs[0] = { id: 1, url: 'https://example.com/', active: true };
  mod.fireOnActivated(1);
  assert.equal(mod.getBadgeText(), '');
});

test('omnibox opens tab with default engine', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  mod.fireOmniboxEnter('test query', 'newForegroundTab');
  assert.equal(mod.createdTabs.length, 1);
  assert.ok(mod.createdTabs[0].url.includes('google.com'));
  assert.ok(mod.createdTabs[0].url.includes('test%20query'));
});

test('omnibox supports "en <motor>" syntax', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  mod.fireOmniboxEnter('test en duckduckgo', 'newForegroundTab');
  assert.equal(mod.createdTabs.length, 1);
  assert.ok(mod.createdTabs[0].url.includes('duckduckgo.com'));
});

test('context menu click opens tab with selected engine', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  mod.fireContextMenuClick({
    menuItemId: 'engine_duckduckgo',
    selectionText: 'hello world'
  });
  assert.equal(mod.createdTabs.length, 1);
  assert.ok(mod.createdTabs[0].url.includes('duckduckgo.com'));
  assert.ok(mod.createdTabs[0].url.includes('hello%20world'));
});

test('context menu default action opens tab with default engine', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  mod.fireContextMenuClick({
    menuItemId: 'search_default',
    selectionText: 'test search'
  });
  assert.equal(mod.createdTabs.length, 1);
  assert.ok(mod.createdTabs[0].url.includes('google.com'));
});

test('command convert-to-default updates current tab', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  mod.tabs[0] = { id: 1, url: 'https://www.google.com/search?q=test', active: true };
  mod.fireCommand('convert-to-default');
  assert.equal(mod.updatedTabs.length, 1);
  assert.ok(mod.updatedTabs[0].props.url.includes('google.com'));
});

test('command convert-to-1 updates current tab with first visible engine', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  mod.tabs[0] = { id: 1, url: 'https://www.google.com/search?q=test', active: true };
  mod.fireCommand('convert-to-1');
  assert.equal(mod.updatedTabs.length, 1);
});

test('command with non-search URL does nothing', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  mod.tabs[0] = { id: 1, url: 'https://example.com/', active: true };
  mod.fireCommand('convert-to-default');
  assert.equal(mod.updatedTabs.length, 0);
});

test('omnibox with empty text does nothing', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  mod.fireOmniboxEnter('', 'newForegroundTab');
  assert.equal(mod.createdTabs.length, 0);
});

test('omnibox with unknown engine falls back to default', () => {
  const mod = loadBackgroundModule();
  mod.fireOnInstalled('install');
  mod.fireOmniboxEnter('test en nonengine', 'newForegroundTab');
  assert.equal(mod.createdTabs.length, 1);
  assert.ok(mod.createdTabs[0].url.includes('google.com'));
});