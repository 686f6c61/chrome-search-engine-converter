const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

function loadEnginesModule() {
  const enginesPath = path.join(__dirname, '..', 'extension', 'engines.js');
  const source = fs.readFileSync(enginesPath, 'utf8');
  const context = {};

  vm.createContext(context);
  vm.runInContext(
    `${source}
globalThis.__ENGINES_EXPORTS__ = {
  SEARCH_ENGINES,
  DEFAULT_CONFIG,
  DEFAULT_SEARCH_ENGINE_ID,
  validateDomain,
  normalizeDefaultSearchEngine,
  buildSearchUrl,
  extractQuery,
  detectEngine,
  isImageSearch
};`,
    context,
    { filename: 'engines.js' }
  );

  return context.__ENGINES_EXPORTS__;
}

const engines = loadEnginesModule();

test('registry has expected engine count', () => {
  assert.equal(Object.keys(engines.SEARCH_ENGINES).length, 33);
});

test('default visibility map matches registry keys', () => {
  const engineKeys = Object.keys(engines.SEARCH_ENGINES).sort();
  const visibilityKeys = Object.keys(engines.DEFAULT_CONFIG).sort();
  assert.deepEqual(visibilityKeys, engineKeys);
});

test('normalizeDefaultSearchEngine supports engineId and legacy buttonId', () => {
  assert.equal(engines.normalizeDefaultSearchEngine('google'), 'google');
  assert.equal(engines.normalizeDefaultSearchEngine('googleButton'), 'google');
  assert.equal(engines.normalizeDefaultSearchEngine('nonexistent'), engines.DEFAULT_SEARCH_ENGINE_ID);
});

test('buildSearchUrl validates configurable domains', () => {
  const amazonSafe = engines.buildSearchUrl('amazon', 'ssd 2tb', false, { amazonDomain: 'co.uk' });
  const amazonFallback = engines.buildSearchUrl('amazon', 'ssd 2tb', false, { amazonDomain: 'evil.com' });
  const youtubeSafe = engines.buildSearchUrl('youtube', 'lofi', false, { youtubeDomain: 'es' });
  const youtubeFallback = engines.buildSearchUrl('youtube', 'lofi', false, { youtubeDomain: 'attacker.tld' });

  assert.match(amazonSafe, /^https:\/\/www\.amazon\.co\.uk\/s\?k=ssd%202tb$/);
  assert.match(amazonFallback, /^https:\/\/www\.amazon\.es\/s\?k=ssd%202tb$/);
  assert.match(youtubeSafe, /^https:\/\/www\.youtube\.es\/results\?search_query=lofi$/);
  assert.match(youtubeFallback, /^https:\/\/www\.youtube\.com\/results\?search_query=lofi$/);
});

test('extractQuery handles malformed URI encodings safely', () => {
  const malformedUrl = 'https://www.google.com/search?q=%E0%A4%A';
  assert.doesNotThrow(() => engines.extractQuery(malformedUrl));
  assert.equal(engines.extractQuery(malformedUrl), null);
});

test('detectEngine recognizes youtube localized result pages', () => {
  const url = 'https://www.youtube.es/results?search_query=musica';
  assert.equal(engines.detectEngine(url), 'youtube');
});

