/**
 * Tests para las nuevas funciones de engines.js (motores personalizados).
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

function loadEnginesModule() {
  const enginesPath = path.join(__dirname, '..', 'extension', 'engines.js');
  let source = fs.readFileSync(enginesPath, 'utf8');
  /* Strip export keywords para poder cargar en VM (CommonJS) */
  source = source.replace(/\bexport\s+(const|function|let|var|class)\b/g, '$1');
  const context = {};

  vm.createContext(context);
  vm.runInContext(
    `${source}
globalThis.__ENGINES_EXPORTS__ = {
  SEARCH_ENGINES,
  DEFAULT_CONFIG,
  DEFAULT_SEARCH_ENGINE_ID,
  DOMAIN_DEFAULTS,
  VALID_AMAZON_DOMAINS,
  VALID_YOUTUBE_DOMAINS,
  STORAGE_KEY,
  IMAGE_SEARCH_INDICATORS,
  QUERY_PATTERNS,
  CUSTOM_ENGINE_ID_PREFIX,
  CUSTOM_ENGINE_ICONS,
  CUSTOM_ENGINE_COLORS,
  validateDomain,
  normalizeDefaultSearchEngine,
  buildSearchUrl,
  extractQuery,
  detectEngine,
  isImageSearch,
  safeDecodeURIComponent,
  validateCustomEngine,
  buildCustomEnginesMap,
  getMergedEngines
};`,
    context,
    { filename: 'engines.js' }
  );

  return context.__ENGINES_EXPORTS__;
}

const engines = loadEnginesModule();

/* ============================================================================
 * validateCustomEngine
 * ============================================================================ */

test('validateCustomEngine accepts a valid engine', () => {
  const result = engines.validateCustomEngine({
    name: 'Mi Motor',
    searchUrl: 'https://mimotor.com/?q={query}',
    icon: 'fas fa-search',
    color: '#4285F4'
  });

  assert.ok(result);
  assert.equal(result.name, 'Mi Motor');
  assert.ok(result.id.startsWith(engines.CUSTOM_ENGINE_ID_PREFIX));
  assert.equal(result.buttonId, result.id + 'Button');
  assert.equal(result.searchUrl, 'https://mimotor.com/?q={query}');
  assert.equal(result.icon, 'fas fa-search');
  assert.equal(result.color, '#4285F4');
  assert.equal(result.visibleByDefault, true);
  assert.equal(result.showInContextMenu, true);
  assert.equal(result.hasCopyButton, true);
  assert.equal(result.queryParam, null);
  assert.equal(result.imageSearchUrl, null);
  assert.ok(result.detectionPattern.length > 0);
});

test('validateCustomEngine rejects empty name', () => {
  assert.equal(engines.validateCustomEngine({
    name: '',
    searchUrl: 'https://mimotor.com/?q={query}'
  }), null);
  assert.equal(engines.validateCustomEngine({
    name: '   ',
    searchUrl: 'https://mimotor.com/?q={query}'
  }), null);
});

test('validateCustomEngine rejects missing searchUrl', () => {
  assert.equal(engines.validateCustomEngine({
    name: 'Mi Motor',
    searchUrl: ''
  }), null);
});

test('validateCustomEngine rejects non-https URLs', () => {
  assert.equal(engines.validateCustomEngine({
    name: 'Mi Motor',
    searchUrl: 'http://mimotor.com/?q={query}'
  }), null);
  assert.equal(engines.validateCustomEngine({
    name: 'Mi Motor',
    searchUrl: 'ftp://mimotor.com/?q={query}'
  }), null);
});

test('validateCustomEngine rejects URLs without {query}', () => {
  assert.equal(engines.validateCustomEngine({
    name: 'Mi Motor',
    searchUrl: 'https://mimotor.com/'
  }), null);
});

test('validateCustomEngine falls back to default icon for invalid icon', () => {
  const result = engines.validateCustomEngine({
    name: 'Mi Motor',
    searchUrl: 'https://mimotor.com/?q={query}',
    icon: 'fas fa-hack-attempt'
  });
  assert.equal(result.icon, 'fas fa-search');
});

test('validateCustomEngine falls back to default color for invalid color', () => {
  const result = engines.validateCustomEngine({
    name: 'Mi Motor',
    searchUrl: 'https://mimotor.com/?q={query}',
    color: 'red'
  });
  assert.equal(result.color, '#4285F4');
});

test('validateCustomEngine truncates long names', () => {
  const longName = 'A'.repeat(50);
  const result = engines.validateCustomEngine({
    name: longName,
    searchUrl: 'https://mimotor.com/?q={query}'
  });
  assert.equal(result.name.length, 30);
});

test('validateCustomEngine rejects null/undefined input', () => {
  assert.equal(engines.validateCustomEngine(null), null);
  assert.equal(engines.validateCustomEngine(undefined), null);
  assert.equal(engines.validateCustomEngine('string'), null);
});

test('validateCustomEngine generates id if not provided', () => {
  const result = engines.validateCustomEngine({
    name: 'Mi Motor',
    searchUrl: 'https://mimotor.com/?q={query}'
  });
  assert.ok(result.id.startsWith(engines.CUSTOM_ENGINE_ID_PREFIX));
  assert.ok(result.id.length > engines.CUSTOM_ENGINE_ID_PREFIX.length);
});

/* ============================================================================
 * buildCustomEnginesMap
 * ============================================================================ */

test('buildCustomEnginesMap returns empty object for non-array input', () => {
  assert.equal(Object.keys(engines.buildCustomEnginesMap(null)).length, 0);
  assert.equal(Object.keys(engines.buildCustomEnginesMap(undefined)).length, 0);
  assert.equal(Object.keys(engines.buildCustomEnginesMap({})).length, 0);
  assert.equal(Object.keys(engines.buildCustomEnginesMap('string')).length, 0);
});

test('buildCustomEnginesMap returns empty object for empty array', () => {
  assert.equal(Object.keys(engines.buildCustomEnginesMap([])).length, 0);
});

test('buildCustomEnginesMap filters out invalid engines', () => {
  const raw = [
    { name: 'Valid', searchUrl: 'https://valid.com/?q={query}' },
    { name: '', searchUrl: 'https://invalid.com/?q={query}' },
    { name: 'Also Valid', searchUrl: 'https://also.com/?q={query}' },
    null,
    { name: 'No URL', searchUrl: '' }
  ];

  const result = engines.buildCustomEnginesMap(raw);
  assert.equal(Object.keys(result).length, 2);
});

test('buildCustomEnginesMap deduplicates by id', () => {
  const raw = [
    { id: 'custom_abc', name: 'First', searchUrl: 'https://first.com/?q={query}' },
    { id: 'custom_abc', name: 'Duplicate', searchUrl: 'https://second.com/?q={query}' }
  ];

  const result = engines.buildCustomEnginesMap(raw);
  assert.equal(Object.keys(result).length, 1);
  assert.equal(result.custom_abc.name, 'First');
});

/* ============================================================================
 * getMergedEngines
 * ============================================================================ */

test('getMergedEngines returns only predefined engines without custom', () => {
  const merged = engines.getMergedEngines([]);
  assert.equal(Object.keys(merged).length, Object.keys(engines.SEARCH_ENGINES).length);
  assert.ok(merged.google);
  assert.ok(merged.brave);
});

test('getMergedEngines includes custom engines', () => {
  const custom = [
    { name: 'Mi Motor', searchUrl: 'https://mimotor.com/?q={query}' }
  ];
  const merged = engines.getMergedEngines(custom);
  assert.ok(merged.google);
  const customKeys = Object.keys(merged).filter(k => k.startsWith(engines.CUSTOM_ENGINE_ID_PREFIX));
  assert.equal(customKeys.length, 1);
});

test('getMergedEngines custom engines do not overwrite predefined', () => {
  /* Si un motor personalizado tiene id 'google', no debe sobrescribir el predefinido
     porque validateCustomEngine fuerza el prefijo custom_ */
  const custom = [
    { id: 'google', name: 'Fake Google', searchUrl: 'https://fake.com/?q={query}' }
  ];
  const merged = engines.getMergedEngines(custom);
  assert.equal(merged.google.name, 'Google');
  assert.notEqual(merged.google.searchUrl, 'https://fake.com/?q={query}');
});

/* ============================================================================
 * buildSearchUrl con motor personalizado
 * ============================================================================ */

test('buildSearchUrl works with custom engine', () => {
  /* El motor debe tener un id estable para que buildSearchUrl lo encuentre */
  const custom = [
    { id: 'custom_test1', name: 'Mi Motor', searchUrl: 'https://mimotor.com/?q={query}' }
  ];
  const merged = engines.getMergedEngines(custom);
  assert.ok(merged.custom_test1, 'custom_test1 should be in merged map');

  const url = engines.buildSearchUrl('custom_test1', 'test query', false, {}, custom);
  assert.ok(url, 'URL should not be null');
  assert.ok(url.includes('https://mimotor.com/'));
  assert.ok(url.includes('test%20query'));
});