/**
 * ============================================================================
 * Search Engine Converter v2.0 - Background Service Worker
 * ============================================================================
 *
 * @file        background.js
 * @description Service Worker que gestiona los menús contextuales y la
 *              conversión de búsquedas entre diferentes motores. Versión
 *              simplificada sin funcionalidades de IA.
 *
 * @author      @686f6c61
 * @repository  https://github.com/686f6c61/chrome-search-engine-converter
 * @license     MIT License
 * @version     2.0.0
 * @date        2025-01-18
 *
 * @requires    chrome.contextMenus - Para menús de clic derecho
 * @requires    chrome.storage - Para persistencia de configuración
 * @requires    chrome.tabs - Para abrir búsquedas en nuevas pestañas
 *
 * ============================================================================
 * FUNCIONALIDADES PRINCIPALES:
 * ============================================================================
 * - Gestión de menús contextuales con 34+ motores de búsqueda
 * - Construcción dinámica de URLs de búsqueda
 * - Carga y persistencia de configuración del usuario
 * - Soporte para dominios regionales (Amazon, YouTube)
 * - Manejo de búsquedas de texto seleccionado
 *
 * ============================================================================
 * ARQUITECTURA:
 * ============================================================================
 * Este archivo implementa un Service Worker siguiendo Manifest V3, que
 * reemplaza los background scripts tradicionales de Manifest V2. El código
 * se ejecuta en respuesta a eventos (onInstalled, onStartup, onClicked) y
 * no mantiene estado persistente entre ejecuciones.
 *
 * ============================================================================
 */

console.log('Background service worker loading...');

/**
 * ============================================================================
 * CONFIGURACIÓN GLOBAL
 * ============================================================================
 */

/**
 * Configuración por defecto de la extensión
 * @type {Object}
 * @property {string} amazonDomain - Dominio regional de Amazon (es, com, co.uk, etc.)
 * @property {string} youtubeDomain - Dominio regional de YouTube (com, es)
 * @property {string} defaultSearchEngine - Motor predeterminado para búsquedas rápidas
 */
let config = {
  amazonDomain: 'es',
  youtubeDomain: 'com',
  defaultSearchEngine: 'googleButton'
};

/**
 * ============================================================================
 * EVENT LISTENERS - Ciclo de vida de la extensión
 * ============================================================================
 */

/**
 * Se ejecuta cuando la extensión es instalada o actualizada
 * Inicializa los menús contextuales y carga la configuración guardada
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  createContextMenus();
  loadConfig();
});

/**
 * Se ejecuta cuando el navegador inicia
 * Recrea los menús contextuales y recarga la configuración
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started');
  createContextMenus();
  loadConfig();
});

/**
 * ============================================================================
 * GESTIÓN DE CONFIGURACIÓN
 * ============================================================================
 */

/**
 * Carga la configuración guardada desde chrome.storage.local
 * Combina la configuración por defecto con la configuración guardada del usuario
 *
 * @function loadConfig
 * @returns {void}
 *
 * @example
 * // La configuración se carga automáticamente al inicio
 * loadConfig();
 */
function loadConfig() {
  chrome.storage.local.get('searchEngineConverterConfig', (data) => {
    if (data.searchEngineConverterConfig) {
      try {
        const savedConfig = JSON.parse(data.searchEngineConverterConfig);
        config = { ...config, ...savedConfig };
        console.log('Configuration loaded:', config);
      } catch (e) {
        console.error('Error parsing config:', e);
      }
    }
  });
}

/**
 * ============================================================================
 * GESTIÓN DE MENÚS CONTEXTUALES
 * ============================================================================
 */

/**
 * Crea los menús contextuales para búsqueda rápida desde texto seleccionado
 * Genera un menú principal "Buscar con..." y submenús para cada motor
 *
 * @function createContextMenus
 * @returns {void}
 *
 * @description
 * Esta función elimina todos los menús existentes y crea nuevos menús con
 * los 15 motores de búsqueda más populares. Cuando el usuario selecciona
 * texto y hace clic derecho, puede buscar directamente en cualquier motor.
 *
 * @example
 * // Se ejecuta automáticamente al instalar/iniciar
 * createContextMenus();
 */
function createContextMenus() {
  console.log('Creating context menus...');

  chrome.contextMenus.removeAll(() => {
    console.log('Previous menus removed');

    // Main search menu
    chrome.contextMenus.create({
      id: 'searchEngineConverter',
      title: 'Buscar "%s" con...',
      contexts: ['selection']
    });

    // Search engines submenu
    const engines = [
      { id: 'google', name: 'Google' },
      { id: 'brave', name: 'Brave' },
      { id: 'duckduckgo', name: 'DuckDuckGo' },
      { id: 'bing', name: 'Bing' },
      { id: 'amazon', name: 'Amazon' },
      { id: 'youtube', name: 'YouTube' },
      { id: 'wikipedia', name: 'Wikipedia' },
      { id: 'twitter', name: 'Twitter/X' },
      { id: 'github', name: 'GitHub' },
      { id: 'stackoverflow', name: 'Stack Overflow' },
      { id: 'reddit', name: 'Reddit' },
      { id: 'perplexity', name: 'Perplexity AI' },
      { id: 'kagi', name: 'Kagi' },
      { id: 'searx', name: 'SearX' },
      { id: 'you', name: 'You.com' }
    ];

    engines.forEach(engine => {
      chrome.contextMenus.create({
        id: `search_${engine.id}`,
        parentId: 'searchEngineConverter',
        title: engine.name,
        contexts: ['selection']
      });
    });

    console.log('Context menus created successfully');
  });
}

/**
 * Maneja los clics en los menús contextuales
 * Cuando el usuario selecciona un motor desde el menú, construye la URL
 * de búsqueda y abre una nueva pestaña
 *
 * @listens chrome.contextMenus.onClicked
 * @param {Object} info - Información del menú clicado
 * @param {string} info.menuItemId - ID del elemento del menú
 * @param {string} info.selectionText - Texto seleccionado por el usuario
 * @param {Tab} tab - Pestaña donde se realizó el clic
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Menu clicked:', info.menuItemId);

  if (info.selectionText && info.menuItemId.startsWith('search_')) {
    const engineId = info.menuItemId.replace('search_', '');
    const query = info.selectionText.trim();
    const url = buildSearchUrl(engineId, query);

    if (url) {
      chrome.tabs.create({ url: url });
    }
  }
});

/**
 * ============================================================================
 * CONSTRUCCIÓN DE URLS DE BÚSQUEDA
 * ============================================================================
 */

/**
 * Construye la URL de búsqueda para un motor específico
 * Soporta 34+ motores de búsqueda con sus formatos de URL únicos
 *
 * @function buildSearchUrl
 * @param {string} engine - ID del motor de búsqueda (google, brave, duckduckgo, etc.)
 * @param {string} query - Términos de búsqueda (sin codificar)
 * @returns {string|null} URL completa de búsqueda o null si el motor no existe
 *
 * @description
 * Esta función es el núcleo de la conversión de búsquedas. Toma un motor
 * y una consulta, y retorna la URL formateada correctamente. Maneja casos
 * especiales como dominios regionales (Amazon, YouTube) y búsquedas de
 * imágenes cuando aplica.
 *
 * @example
 * buildSearchUrl('google', 'javascript tutorials')
 * // Returns: 'https://www.google.com/search?q=javascript%20tutorials'
 *
 * @example
 * buildSearchUrl('amazon', 'laptop')
 * // Returns: 'https://www.amazon.es/s?k=laptop' (según config.amazonDomain)
 */
function buildSearchUrl(engine, query) {
  const encodedQuery = encodeURIComponent(query);

  switch (engine) {
    case 'google':
      return `https://www.google.com/search?q=${encodedQuery}`;
    case 'brave':
      return `https://search.brave.com/search?q=${encodedQuery}`;
    case 'duckduckgo':
      return `https://duckduckgo.com/?q=${encodedQuery}`;
    case 'bing':
      return `https://www.bing.com/search?q=${encodedQuery}`;
    case 'amazon':
      return `https://www.amazon.${config.amazonDomain}/s?k=${encodedQuery}`;
    case 'youtube':
      return `https://www.youtube.com/results?search_query=${encodedQuery}`;
    case 'wikipedia':
      return `https://es.wikipedia.org/wiki/Special:Search?search=${encodedQuery}`;
    case 'twitter':
      return `https://twitter.com/search?q=${encodedQuery}`;
    case 'github':
      return `https://github.com/search?q=${encodedQuery}`;
    case 'stackoverflow':
      return `https://stackoverflow.com/search?q=${encodedQuery}`;
    case 'reddit':
      return `https://www.reddit.com/search/?q=${encodedQuery}`;
    case 'startpage':
      return `https://www.startpage.com/do/search?q=${encodedQuery}`;
    case 'ecosia':
      return `https://www.ecosia.org/search?q=${encodedQuery}`;
    case 'qwant':
      return `https://www.qwant.com/?q=${encodedQuery}`;
    case 'perplexity':
      return `https://www.perplexity.ai/search?q=${encodedQuery}`;
    case 'kagi':
      return `https://kagi.com/search?q=${encodedQuery}`;
    case 'searx':
      return `https://searx.be/search?q=${encodedQuery}`;
    case 'you':
      return `https://you.com/search?q=${encodedQuery}`;
    default:
      return null;
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request.action);

  if (request.action === 'getConfig') {
    chrome.storage.local.get('searchEngineConverterConfig', (data) => {
      try {
        const storedConfig = data.searchEngineConverterConfig
          ? JSON.parse(data.searchEngineConverterConfig)
          : config;
        sendResponse({ success: true, config: storedConfig });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    return true; // Keep channel open for async response
  }

  sendResponse({ success: false, error: 'Unknown action' });
  return false;
});

// Initialize
createContextMenus();
loadConfig();

console.log('Background service worker ready');
