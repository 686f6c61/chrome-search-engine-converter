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
 *   - importScripts() carga solo archivos locales empaquetados en la extension
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
importScripts('engines.js');

/**
 * Configuracion en memoria del service worker.
 * Se carga desde chrome.storage.local en cada inicio.
 * Solo se usan los campos de dominio para construir URLs.
 */
let config = {
  amazonDomain: 'es',
  youtubeDomain: 'com',
  defaultSearchEngine: 'googleButton'
};

/* --- Eventos del ciclo de vida del service worker --- */

/** Al instalar o actualizar la extension: recrear menus y cargar config */
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
  loadConfig();
});

/** Al iniciar Chrome: recrear menus y cargar config (el SW pudo haber muerto) */
chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
  loadConfig();
});

/* --- Funciones principales --- */

/**
 * Carga la configuracion guardada del usuario desde chrome.storage.local.
 * Valida los dominios contra las whitelists de engines.js para evitar
 * que datos corruptos o manipulados generen URLs a dominios no autorizados.
 */
function loadConfig() {
  chrome.storage.local.get(STORAGE_KEY, (data) => {
    if (data[STORAGE_KEY]) {
      try {
        const savedConfig = JSON.parse(data[STORAGE_KEY]);

        /* Validar dominio de Amazon contra whitelist */
        if (savedConfig.amazonDomain && !VALID_AMAZON_DOMAINS.includes(savedConfig.amazonDomain)) {
          savedConfig.amazonDomain = 'es';
        }
        /* Validar dominio de YouTube contra whitelist */
        if (savedConfig.youtubeDomain && !VALID_YOUTUBE_DOMAINS.includes(savedConfig.youtubeDomain)) {
          savedConfig.youtubeDomain = 'com';
        }

        config = { ...config, ...savedConfig };
      } catch (_) {
        /* JSON corrupto en storage: se mantienen los valores por defecto */
      }
    }
  });
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
    /* Menu padre: aparece al seleccionar texto y hacer clic derecho */
    chrome.contextMenus.create({
      id: 'searchEngineConverter',
      title: 'Buscar "%s" con...',
      contexts: ['selection']
    });

    /* Submenus: uno por cada motor con showInContextMenu habilitado */
    const menuEngines = Object.values(SEARCH_ENGINES)
      .filter(engine => engine.showInContextMenu);

    menuEngines.forEach(engine => {
      chrome.contextMenus.create({
        id: `search_${engine.id}`,
        parentId: 'searchEngineConverter',
        title: engine.name,
        contexts: ['selection']
      });
    });
  });
}

/* --- Listener de clicks en el menu contextual --- */

/**
 * Cuando el usuario selecciona un motor del menu contextual:
 *   1. Extrae el ID del motor desde el menuItemId (formato: "search_<engineId>")
 *   2. Construye la URL con buildSearchUrl() de engines.js
 *   3. Abre una nueva pestana con la busqueda
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.selectionText && info.menuItemId.startsWith('search_')) {
    const engineId = info.menuItemId.replace('search_', '');
    const query = info.selectionText.trim();
    const url = buildSearchUrl(engineId, query, false, config);

    if (url) {
      chrome.tabs.create({ url: url });
    }
  }
});

/* --- Inicializacion inmediata --- */
/* Necesario porque el SW puede despertarse por un evento contextMenu
   sin que se dispare onInstalled ni onStartup */
createContextMenus();
loadConfig();
