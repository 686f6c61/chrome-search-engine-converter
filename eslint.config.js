/**
 * ESLint flat config para Search Engine Converter.
 *
 * Reglas orientadas a seguridad (no-eval, no-implied-eval, no-new-func,
 * no-script-url) y a prevenir bugs comunes (no-undef, eqeqeq, no-redeclare).
 * El estilo de formato se delega en .editorconfig.
 */
import globals from 'globals';

/* Globales exportados por engines.js que se cargan via <script> o importScripts */
const enginesGlobals = {
  ...globals.browser,
  ...globals.serviceworker,
  chrome: 'readonly',
  Sortable: 'readonly',
  html2canvas: 'readonly',
  SEARCH_ENGINES: 'readonly',
  DEFAULT_CONFIG: 'readonly',
  DEFAULT_SEARCH_ENGINE_ID: 'readonly',
  DOMAIN_DEFAULTS: 'readonly',
  VALID_AMAZON_DOMAINS: 'readonly',
  VALID_YOUTUBE_DOMAINS: 'readonly',
  STORAGE_KEY: 'readonly',
  IMAGE_SEARCH_INDICATORS: 'readonly',
  QUERY_PATTERNS: 'readonly',
  validateDomain: 'readonly',
  normalizeDefaultSearchEngine: 'readonly',
  buildSearchUrl: 'readonly',
  extractQuery: 'readonly',
  detectEngine: 'readonly',
  isImageSearch: 'readonly',
  safeDecodeURIComponent: 'readonly',
  CUSTOM_ENGINE_ID_PREFIX: 'readonly',
  CUSTOM_ENGINE_ICONS: 'readonly',
  CUSTOM_ENGINE_COLORS: 'readonly',
  validateCustomEngine: 'readonly',
  buildCustomEnginesMap: 'readonly',
  getMergedEngines: 'readonly'
};

/* Reglas compartidas */
const sharedRules = {
  'no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    caughtErrorsIgnorePattern: '^_'
  }],
  'no-undef': 'error',
  'no-redeclare': 'error',
  eqeqeq: ['error', 'always'],
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  'no-script-url': 'error',
  'no-shadow': 'warn',
  'prefer-const': 'warn',
  'no-var': 'error',
  'no-constant-condition': ['error', { checkLoops: false }],
  'no-prototype-builtins': 'warn',
  'no-useless-escape': 'warn'
};

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'extension/Sortable.min.js',
      'extension/css/fontawesome.min.css',
      'extension/fonts/**'
    ]
  },
  {
    files: ['extension/engines.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
        chrome: 'readonly',
        Sortable: 'readonly',
        html2canvas: 'readonly'
      }
    },
    rules: {
      ...sharedRules,
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        varsIgnorePattern: '^(STORAGE_KEY|VALID_AMAZON_DOMAINS|VALID_YOUTUBE_DOMAINS|DEFAULT_SEARCH_ENGINE_ID|DOMAIN_DEFAULTS|SEARCH_ENGINES|IMAGE_SEARCH_INDICATORS|QUERY_PATTERNS|DEFAULT_CONFIG|normalizeDefaultSearchEngine|buildSearchUrl|safeDecodeURIComponent|extractQuery|detectEngine|isImageSearch|validateDomain|CUSTOM_ENGINE_ID_PREFIX|CUSTOM_ENGINE_ICONS|CUSTOM_ENGINE_COLORS|validateCustomEngine|buildCustomEnginesMap|getMergedEngines)$'
      }]
    }
  },
  {
    files: ['extension/background.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: enginesGlobals
    },
    rules: sharedRules
  },
  {
    files: ['extension/popup.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        chrome: 'readonly',
        Sortable: 'readonly',
        html2canvas: 'readonly'
      }
    },
    rules: sharedRules
  },
  {
    files: ['tests/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error'
    }
  }
];