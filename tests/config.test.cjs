/**
 * Tests para config.js (estado de configuracion compartido popup/options).
 * Carga engines.js + config.js en un contexto VM (sin API de chrome) y
 * verifica el saneado de datos procedentes de storage o ficheros importados.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

function loadConfigModule() {
  const enginesPath = path.join(__dirname, '..', 'extension', 'engines.js');
  const configPath = path.join(__dirname, '..', 'extension', 'config.js');
  const strip = (src) => src
    .replace(/\bexport\s+(const|function|let|var|class)\b/g, '$1')
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');

  const context = { URL };
  vm.createContext(context);
  vm.runInContext(strip(fs.readFileSync(enginesPath, 'utf8')), context, { filename: 'engines.js' });
  vm.runInContext(
    strip(fs.readFileSync(configPath, 'utf8')) + `
globalThis.__CONFIG_EXPORTS__ = {
  defaultConfigState,
  sanitizeVisibleEngines,
  sanitizeButtonOrder,
  applySavedConfiguration,
  loadConfigState,
  getVisibleEngineIdsInOrder
};`,
    context,
    { filename: 'config.js' }
  );
  return context.__CONFIG_EXPORTS__;
}

const config = loadConfigModule();

test('loadConfigState devuelve el estado por defecto sin API de chrome', async () => {
  const state = await config.loadConfigState();
  assert.equal(state.defaultSearchEngine, 'google');
  assert.equal(state.amazonDomain, 'es');
  assert.equal(Array.from(state.customEngines).length, 0);
});

test('applySavedConfiguration descarta motores personalizados invalidos', () => {
  const state = config.defaultConfigState();
  config.applySavedConfiguration(state, {
    customEngines: [
      { id: 'custom_ok', name: 'Ok', searchUrl: 'https://ok.test/?q={query}' },
      { id: 'custom_http', name: 'Http', searchUrl: 'http://evil.test/?q={query}' },
      { id: 'custom_noquery', name: 'NoQuery', searchUrl: 'https://noquery.test/' },
      'string',
      null
    ]
  });
  assert.equal(state.customEngines.length, 1);
  assert.equal(state.customEngines[0].id, 'custom_ok');
});

test('applySavedConfiguration rechaza ids de la cadena de prototipo', () => {
  const state = config.defaultConfigState();
  config.applySavedConfiguration(state, { defaultSearchEngine: '__proto__' });
  assert.equal(state.defaultSearchEngine, 'google');

  config.applySavedConfiguration(state, { defaultSearchEngine: 'constructor' });
  assert.equal(state.defaultSearchEngine, 'google');
});

test('applySavedConfiguration acepta un motor personalizado como predeterminado', () => {
  const state = config.defaultConfigState();
  config.applySavedConfiguration(state, {
    defaultSearchEngine: 'custom_ok',
    customEngines: [{ id: 'custom_ok', name: 'Ok', searchUrl: 'https://ok.test/?q={query}' }]
  });
  assert.equal(state.defaultSearchEngine, 'custom_ok');
});

test('applySavedConfiguration normaliza buttonOrder y visibleEngines con personalizados', () => {
  const state = config.defaultConfigState();
  config.applySavedConfiguration(state, {
    customEngines: [{ id: 'custom_ok', name: 'Ok', searchUrl: 'https://ok.test/?q={query}' }],
    visibleEngines: { custom_ok: false, google: 'yes', inventado: true },
    buttonOrder: ['custom_okButton', 'googleButton', 'googleButton', 'inventadoButton', 42]
  });

  assert.equal(state.visibleEngines.custom_ok, false);
  assert.equal(state.visibleEngines.google, true, 'valores no booleanos se ignoran');
  assert.equal(state.visibleEngines.inventado, undefined);
  assert.deepEqual(Array.from(state.buttonOrder), ['custom_okButton', 'googleButton']);
});

test('getVisibleEngineIdsInOrder respeta el orden guardado y anade el resto', () => {
  const state = config.defaultConfigState();
  state.visibleEngines = { google: true, brave: true, duckduckgo: true };
  state.buttonOrder = ['duckduckgoButton', 'braveButton'];

  const engines = {
    google: { buttonId: 'googleButton' },
    brave: { buttonId: 'braveButton' },
    duckduckgo: { buttonId: 'duckduckgoButton' }
  };

  assert.deepEqual(
    Array.from(config.getVisibleEngineIdsInOrder(state, engines)),
    ['duckduckgo', 'brave', 'google']
  );
});

test('getVisibleEngineIdsInOrder ignora buttonIds desconocidos', () => {
  const state = config.defaultConfigState();
  state.buttonOrder = ['fantasmaButton'];

  const ordered = Array.from(config.getVisibleEngineIdsInOrder(state, {
    google: { buttonId: 'googleButton' }
  }));
  assert.ok(!ordered.includes('fantasma'));
  assert.ok(ordered.includes('google'));
});
