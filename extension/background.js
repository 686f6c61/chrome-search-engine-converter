/**
 * ============================================================================
 * background.js - Service Worker (Manifest V3)
 * ============================================================================
 *
 * Este archivo se ejecuta como service worker de la extension. Su unica
 * responsabilidad es gestionar los menus contextuales (clic derecho) para
 * buscar texto seleccionado en cualquier motor de busqueda.
 *
 * Ciclo de vida del service worker:
 *   - onInstalled: Se ejecuta al instalar/actualizar la extension
 *   - onStartup: Se ejecuta al iniciar Chrome
 *   - El service worker puede terminar en cualquier momento cuando esta inactivo
 *   - Por eso se recrea el estado (menus + config) en ambos eventos
 *
 * Seguridad:
 *   - import dinámico carga solo archivos locales empaquetados en la extensión
 *   - Los dominios de Amazon/YouTube se validan contra whitelists de engines.js
 *   - La configuracion se parsea con try/catch para manejar datos corruptos
 *   - No se ejecuta codigo dinamico ni se cargan scripts remotos
 *
 * Permisos necesarios (manifest.json):
 *   - contextMenus: Para crear el menu "Buscar con..."
 *   - storage: Para leer la configuracion del usuario
 *   - activeTab: No se usa aqui, solo en popup.js
 *
 * @file        background.js
 * @author      @686f6c61
 * @license     MIT
 * ============================================================================
 */

/* Carga el registro centralizado de motores (SEARCH_ENGINES, buildSearchUrl, etc.) */
import {
  STORAGE_KEY,
  DEFAULT_SEARCH_ENGINE_ID,
  DOMAIN_DEFAULTS,
  SEARCH_ENGINES,
  DEFAULT_CONFIG,
  validateDomain,
  normalizeDefaultSearchEngine,
  buildSearchUrl,
  extractQuery,
  detectEngine,
  isImageSearch
} from './engines.js';

/**
 * Configuracion en memoria del service worker.
 * Se carga desde chrome.storage.local en cada inicio.
 * Se usa para dominios configurables y accion rapida de menu contextual.
 */
let config = {
  amazonDomain: DOMAIN_DEFAULTS.amazon,
  youtubeDomain: DOMAIN_DEFAULTS.youtube,
  defaultSearchEngine: DEFAULT_SEARCH_ENGINE_ID,
  customEngines: []
};

const CONTEXT_MENU_DEFAULT_ID = 'search_default';
const CONTEXT_MENU_SEPARATOR_ID = 'search_separator';
const CONTEXT_MENU_GROUP_ID = 'searchEngineConverter';
const CONTEXT_MENU_ENGINE_PREFIX = 'engine_';

/* --- Eventos del ciclo de vida del service worker --- */

/** Al instalar o actualizar la extension: recrear menus y cargar config */
chrome.runtime.onInstalled.addListener((details) => {
  loadConfig(createContextMenus);

  /* Al desinstalar, abrir encuesta breve para captar feedback */
  if (details.reason === 'install') {
    chrome.runtime.setUninstallURL('https://github.com/686f6c61/chrome-search-engine-converter/issues/new?labels=uninstall-feedback&title=Motivo+de+desinstalacion');
  }
});

/** Al iniciar Chrome: recrear menus y cargar config (el SW pudo haber muerto) */
chrome.runtime.onStartup.addListener(() => {
  loadConfig(createContextMenus);
});

/* --- Funciones principales --- */

/**
 * Carga la configuracion guardada del usuario desde chrome.storage.local.
 * Valida los dominios contra las whitelists de engines.js para evitar
 * que datos corruptos o manipulados generen URLs a dominios no autorizados.
 */
function loadConfig(onComplete) {
  chrome.storage.local.get(STORAGE_KEY, (data) => {
    if (data[STORAGE_KEY]) {
      try {
        const savedConfig = JSON.parse(data[STORAGE_KEY]);
        const nextConfig = { ...config };

        if (validateDomain('amazon', savedConfig.amazonDomain)) {
          nextConfig.amazonDomain = savedConfig.amazonDomain;
        }

        if (validateDomain('youtube', savedConfig.youtubeDomain)) {
          nextConfig.youtubeDomain = savedConfig.youtubeDomain;
        }

        nextConfig.defaultSearchEngine = normalizeDefaultSearchEngine(savedConfig.defaultSearchEngine);

        if (Array.isArray(savedConfig.customEngines)) {
          nextConfig.customEngines = savedConfig.customEngines;
        }

        config = nextConfig;
      } catch (_) {
        /* JSON corrupto en storage: se mantienen los valores por defecto */
      }
    }

    if (typeof onComplete === 'function') {
      onComplete();
    }
  });
}

function getDefaultEngineId() {
  return normalizeDefaultSearchEngine(config.defaultSearchEngine);
}

/**
 * Crea el arbol de menus contextuales.
 * Genera un submenu "Buscar '%s' con..." con un hijo por cada motor que
 * tenga showInContextMenu: true en SEARCH_ENGINES.
 *
 * Se llama removeAll() primero para evitar duplicados al recrear.
 */
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    const defaultEngineId = getDefaultEngineId();
    const defaultEngine = SEARCH_ENGINES[defaultEngineId] || SEARCH_ENGINES[DEFAULT_SEARCH_ENGINE_ID];

    /* Accion rapida: usa el motor predeterminado del usuario */
    chrome.contextMenus.create({
      id: CONTEXT_MENU_DEFAULT_ID,
      title: `Buscar "%s" en ${defaultEngine.name}`,
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: CONTEXT_MENU_SEPARATOR_ID,
      type: 'separator',
      contexts: ['selection']
    });

    /* Menu padre: submenu con todos los motores habilitados para contexto */
    chrome.contextMenus.create({
      id: CONTEXT_MENU_GROUP_ID,
      title: 'Buscar "%s" con...',
      contexts: ['selection']
    });

    /* Submenus: uno por cada motor con showInContextMenu habilitado */
    const menuEngines = Object.values(SEARCH_ENGINES)
      .filter(engine => engine.showInContextMenu);

    menuEngines.forEach(engine => {
      chrome.contextMenus.create({
        id: `${CONTEXT_MENU_ENGINE_PREFIX}${engine.id}`,
        parentId: CONTEXT_MENU_GROUP_ID,
        title: engine.name,
        contexts: ['selection']
      });
    });
  });
}

/* --- Listener de clicks en el menu contextual --- */

/**
 * Cuando el usuario selecciona un motor del menu contextual:
 *   1. Detecta si clico accion rapida (motor por defecto) o submenu (engine_<id>)
 *   2. Construye la URL con buildSearchUrl() de engines.js
 *   3. Abre una nueva pestana con la busqueda
 */
chrome.contextMenus.onClicked.addListener((info) => {
  if (!info.selectionText || typeof info.menuItemId !== 'string') {
    return;
  }

  const query = info.selectionText.trim();
  if (!query) {
    return;
  }

  let engineId = null;

  if (info.menuItemId === CONTEXT_MENU_DEFAULT_ID) {
    engineId = getDefaultEngineId();
  } else if (info.menuItemId.startsWith(CONTEXT_MENU_ENGINE_PREFIX)) {
    engineId = info.menuItemId.slice(CONTEXT_MENU_ENGINE_PREFIX.length);
  }

  if (!engineId) {
    return;
  }

  const url = buildSearchUrl(engineId, query, false, config, config.customEngines || []);

  if (url) {
    chrome.tabs.create({ url: url });
  }
});

/* Refrescar config/menus al cambiar preferencias en popup */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes[STORAGE_KEY]) {
    return;
  }

  loadConfig(createContextMenus);
});

/* ============================================================================
 * ATAJOS DE TECLADO GLOBALES (chrome.commands)
 * ============================================================================
 * Permiten convertir la busqueda de la pestana actual sin abrir el popup.
 * El usuario los configura en chrome://extensions/shortcuts.
 * ============================================================================ */

chrome.commands.onCommand.addListener((command) => {
  if (!command || !command.startsWith('convert-to-')) return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs || tabs.length === 0) return;

    const activeTab = tabs[0];
    const url = activeTab.url || '';
    const query = extractQuery(url);

    if (!query) return;

    let targetEngineId = null;

    if (command === 'convert-to-default') {
      targetEngineId = getDefaultEngineId();
    } else {
      const match = command.match(/^convert-to-(\d+)$/);
      if (!match) return;
      const position = parseInt(match[1], 10);

      const visibleEngineIds = Object.keys(DEFAULT_CONFIG).filter(
        (id) => DEFAULT_CONFIG[id]
      );
      if (position < 1 || position > visibleEngineIds.length) return;
      targetEngineId = visibleEngineIds[position - 1];
    }

    if (!targetEngineId) return;

    const imgSearch = isImageSearch(url);
    const targetUrl = buildSearchUrl(targetEngineId, query, imgSearch, config, config.customEngines || []);

    if (targetUrl) {
      chrome.tabs.update(activeTab.id, { url: targetUrl });
    }
  });
});

/* ============================================================================
 * OMNIBOX (barra de direcciones)
 * ============================================================================
 * Permite al usuario escribir "sc <termino>" en la barra de direcciones para
 * buscar directamente en su motor predeterminado sin abrir el popup.
 *
 * Sintaxis soportada:
 *   sc <termino>               -> busca en el motor predeterminado
 *   sc <termino> en <motor>    -> busca en el motor indicado (por nombre)
 * ============================================================================ */

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const trimmed = (text || '').trim();
  if (!trimmed) return;

  let query = trimmed;
  let engineId = getDefaultEngineId();

  /* Sintaxis: "<termino> en <motor>" */
  const match = trimmed.match(/^(.+?)\s+en\s+([a-zA-Z0-9_-]+)$/i);
  if (match) {
    query = match[1];
    const requestedEngine = match[2].toLowerCase();

    /* Buscar por id, nombre o buttonId (case-insensitive) */
    const engines = SEARCH_ENGINES;
    for (const [id, engine] of Object.entries(engines)) {
      if (
        id.toLowerCase() === requestedEngine ||
        engine.name.toLowerCase() === requestedEngine ||
        engine.buttonId.toLowerCase() === requestedEngine
      ) {
        engineId = id;
        break;
      }
    }
  }

  const url = buildSearchUrl(engineId, query, false, config, config.customEngines || []);
  if (!url) return;

  /* disposition: "currentTab" | "newForegroundTab" | "newBackgroundTab" */
  if (disposition === 'newForegroundTab' || disposition === 'newBackgroundTab') {
    chrome.tabs.create({ url, active: disposition === 'newForegroundTab' });
  } else {
    chrome.tabs.update({ url });
  }
});

/* Sugerencias mientras el usuario escribe en la omnibox */
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    suggest([]);
    return;
  }

  const defaultEngine = SEARCH_ENGINES[getDefaultEngineId()];
  const defaultName = defaultEngine ? defaultEngine.name : 'Google';
  const suggestions = [
    {
      content: trimmed,
      description: `Buscar "${trimmed}" en ${defaultName} (predeterminado)`
    }
  ];

  /* Sugerir motores adicionales si el texto no contiene " en " */
  if (!/\s+en\s+/i.test(trimmed)) {
    const popularEngines = ['google', 'duckduckgo', 'brave', 'bing', 'wikipedia', 'youtube'];
    popularEngines.forEach(id => {
      const engine = SEARCH_ENGINES[id];
      if (engine && id !== getDefaultEngineId()) {
        suggestions.push({
          content: `${trimmed} en ${engine.name}`,
          description: `Buscar "${trimmed}" en ${engine.name}`
        });
      }
    });
  }

  suggest(suggestions.slice(0, 6));
});

/* ============================================================================
 * BADGE DINAMICO EN EL ICONO
 * ============================================================================
 * Muestra una letra sobre el icono de la extension indicando el motor
 * detectado en la pestana activa. Actualiza al cambiar de pestana o URL.
 * ============================================================================ */

const ENGINE_BADGE_LABELS = {
  google: 'G',
  brave: 'B',
  duckduckgo: 'D',
  bing: 'B',
  amazon: 'A',
  youtube: 'Y',
  wikipedia: 'W',
  twitter: 'X',
  github: 'G',
  gitlab: 'G',
  stackoverflow: 'S',
  reddit: 'R',
  pinterest: 'P',
  startpage: 'S',
  ecosia: 'E',
  qwant: 'Q',
  yandex: 'Y',
  baidu: 'B',
  ebay: 'E',
  aliexpress: 'A',
  etsy: 'E',
  scholar: 'S',
  archive: 'A',
  wolframalpha: 'W',
  spotify: 'S',
  soundcloud: 'S',
  vimeo: 'V',
  linkedin: 'L',
  tiktok: 'T',
  perplexity: 'P',
  kagi: 'K',
  searx: 'X',
  you: 'U'
};

const ENGINE_BADGE_COLORS = {
  google: '#4285F4',
  brave: '#FB542B',
  duckduckgo: '#DE5833',
  bing: '#008373',
  amazon: '#FF9900',
  youtube: '#FF0000',
  wikipedia: '#636466',
  twitter: '#000000',
  reddit: '#FF4500',
  spotify: '#1DB954',
  github: '#333333',
  linkedin: '#0077B5'
};

/**
 * Actualiza el badge del icono segun el motor detectado en una URL.
 * Si no se detecta motor, limpia el badge.
 *
 * @param {string} url - URL de la pestana activa
 */
function updateBadgeForUrl(url) {
  if (!url) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  const engineId = detectEngine(url);
  if (!engineId) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  const label = ENGINE_BADGE_LABELS[engineId] || '';
  const color = ENGINE_BADGE_COLORS[engineId] || '#212121';

  chrome.action.setBadgeText({ text: label });
  chrome.action.setBadgeBackgroundColor({ color });
}

/* Actualizar badge al cambiar de pestana activa */
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    updateBadgeForUrl(tab.url);
  });
});

/* Actualizar badge al navegar dentro de una pestana */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || tabs.length === 0) return;
      if (tabs[0].id === tabId) {
        updateBadgeForUrl(tab.url || tabs[0].url);
      }
    });
  }
});

/* --- Inicializacion inmediata --- */
/* El SW puede despertar por un evento contextMenu sin que se dispare
   onInstalled ni onStartup. En ese caso solo necesitamos tener la config
   cargada en memoria; los menus ya fueron creados en onInstalled/onStartup. */
loadConfig();
