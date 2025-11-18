/**
 * ============================================================================
 * Search Engine Converter v2.0 - Popup Controller
 * ============================================================================
 *
 * @file        popup.js
 * @description Controlador principal del popup de la extensión. Gestiona la
 *              interfaz de usuario, detección de búsquedas, conversión entre
 *              motores, configuración y todas las interacciones del usuario.
 *
 * @author      @686f6c61
 * @repository  https://github.com/686f6c61/chrome-search-engine-converter
 * @license     MIT License
 * @version     2.0.0
 * @date        2025-01-18
 *
 * @requires    chrome.tabs - Para detección de URL actual y apertura de pestañas
 * @requires    chrome.storage - Para persistencia de configuración
 * @requires    Sortable.min.js - Para drag-and-drop en orden de botones
 *
 * ============================================================================
 * FUNCIONALIDADES PRINCIPALES:
 * ============================================================================
 * - Detección automática de búsquedas en 34+ motores
 * - Conversión de búsquedas manteniendo términos exactos
 * - Modo dual: Convertir búsquedas existentes / Realizar búsquedas nuevas
 * - Sistema de copiar URL al portapapeles sin abrir pestañas
 * - Atajos de teclado (Alt+1-9, Ctrl+K, ESC)
 * - Configuración completa (dominios, visibilidad, orden)
 * - Grid responsive adaptativo (2-4 columnas)
 * - Animaciones y feedback visual mejorado
 *
 * ============================================================================
 * ARQUITECTURA:
 * ============================================================================
 * El código está organizado en secciones funcionales:
 *
 * 1. ESTADO Y CONFIGURACIÓN
 *    - configState: Objeto global con toda la configuración
 *    - Estado por defecto y carga desde storage
 *
 * 2. INICIALIZACIÓN
 *    - DOMContentLoaded: Punto de entrada principal
 *    - Carga de configuración y setup de eventos
 *
 * 3. DETECCIÓN Y CONVERSIÓN
 *    - extractSearchQuery: Extrae términos desde URLs
 *    - handleEngineConversion: Maneja clics en botones de motores
 *    - buildSearchUrl: Construye URLs de destino
 *
 * 4. INTERFAZ DE USUARIO
 *    - updateEngineButtonVisibility: Muestra/oculta botones
 *    - setupQuickSearch: Modo búsqueda rápida
 *    - setupKeyboardShortcuts: Atajos de teclado
 *
 * 5. CONFIGURACIÓN
 *    - loadConfiguration: Carga desde storage
 *    - saveConfiguration: Guarda en storage
 *    - setupConfigurationPanel: Panel de opciones
 *
 * ============================================================================
 */

/**
 * ============================================================================
 * ESTADO Y CONFIGURACIÓN GLOBAL
 * ============================================================================
 */

/**
 * Estado de configuración global de la extensión
 * Contiene todas las preferencias del usuario
 *
 * @type {Object}
 * @property {string} amazonDomain - Dominio regional de Amazon
 * @property {string} youtubeDomain - Dominio regional de YouTube
 * @property {string} defaultSearchEngine - Motor predeterminado
 * @property {Array<string>} buttonOrder - Orden personalizado de botones
 * @property {Object} visibleEngines - Visibilidad de cada motor
 */
let configState = {
  amazonDomain: 'es',
  youtubeDomain: 'com',
  defaultSearchEngine: 'googleButton',
  buttonOrder: [],
  visibleEngines: {
    google: true,
    brave: true,
    duckduckgo: true,
    bing: true,
    amazon: true,
    youtube: true,
    wikipedia: true,
    twitter: true,
    github: false,
    gitlab: false,
    stackoverflow: false,
    reddit: false,
    pinterest: false,
    startpage: false,
    ecosia: false,
    qwant: false,
    yandex: false,
    baidu: false,
    ebay: false,
    aliexpress: false,
    etsy: false,
    scholar: false,
    archive: false,
    wolframalpha: false,
    spotify: false,
    soundcloud: false,
    vimeo: false,
    linkedin: false,
    tiktok: false,
    perplexity: false,
    kagi: false,
    searx: false,
    you: false
  }
};

/**
 * ============================================================================
 * INICIALIZACIÓN DEL POPUP
 * ============================================================================
 */

/**
 * Punto de entrada principal de la extensión
 * Se ejecuta cuando el DOM del popup está completamente cargado
 *
 * @listens DOMContentLoaded
 * @async
 * @returns {Promise<void>}
 *
 * @description
 * Inicializa todos los componentes de la interfaz en orden secuencial:
 * 1. Carga configuración guardada
 * 2. Configura event listeners de botones
 * 3. Inicializa búsqueda rápida
 * 4. Configura toggle de modos
 * 5. Activa botones de copiar
 * 6. Registra atajos de teclado
 * 7. Actualiza visibilidad de motores
 * 8. Inicializa drag-and-drop
 * 9. Detecta página actual
 */
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Popup initializing...');
  await loadConfiguration();
  setupEventListeners();
  setupQuickSearch();
  setupModeToggle();
  setupCopyButtons();
  setupKeyboardShortcuts();
  updateEngineButtonVisibility();
  initializeButtonOrdering();
  checkCurrentPage();
});

/**
 * ============================================================================
 * GESTIÓN DE INTERFAZ DE USUARIO
 * ============================================================================
 */

/**
 * Actualiza el mensaje de estado en el header del popup
 *
 * @function updateStatus
 * @param {string} message - Mensaje a mostrar
 * @param {string} [type='info'] - Tipo de mensaje: 'info', 'success', 'error', 'warning'
 * @returns {void}
 *
 * @description
 * Cambia el mensaje de estado con el icono apropiado y animación.
 * Los mensajes no-info incluyen animación de pulso por 2 segundos.
 *
 * @example
 * updateStatus('Búsqueda detectada correctamente', 'success');
 * updateStatus('No se detectó ninguna búsqueda', 'warning');
 */
function updateStatus(message, type = 'info') {
  const statusElement = document.getElementById('status');
  const statusContainer = document.querySelector('.status-container');

  statusElement.classList.remove('success', 'error', 'warning');
  statusContainer.classList.remove('pulse');

  let icon = 'fa-info-circle';
  if (type === 'success') {
    icon = 'fa-check-circle';
    statusElement.classList.add('success');
  } else if (type === 'error') {
    icon = 'fa-exclamation-circle';
    statusElement.classList.add('error');
  } else if (type === 'warning') {
    icon = 'fa-exclamation-triangle';
    statusElement.classList.add('warning');
  }

  statusElement.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

  if (type !== 'info') {
    statusContainer.classList.add('pulse');
    setTimeout(() => statusContainer.classList.remove('pulse'), 2000);
  }
}

// Load configuration from storage
async function loadConfiguration() {
  return new Promise((resolve) => {
    // Check if chrome.storage is available
    if (typeof chrome === 'undefined' || !chrome.storage) {
      console.warn('Chrome storage API not available');
      resolve();
      return;
    }

    try {
      chrome.storage.local.get('searchEngineConverterConfig', function(data) {
        if (chrome.runtime.lastError) {
          console.error('Error accessing storage:', chrome.runtime.lastError);
          resolve();
          return;
        }

        if (data.searchEngineConverterConfig) {
          try {
            const savedConfig = JSON.parse(data.searchEngineConverterConfig);
            Object.keys(savedConfig).forEach(key => {
              if (configState.hasOwnProperty(key)) {
                configState[key] = savedConfig[key];
              }
            });
            applyConfigToUI();
          } catch (error) {
            console.error('Error parsing configuration:', error);
          }
        }
        resolve();
      });
    } catch (error) {
      console.error('Error loading configuration:', error);
      resolve();
    }
  });
}

// Apply configuration to UI
function applyConfigToUI() {
  // Amazon domain
  const amazonDomainSelect = document.getElementById('amazonDomain');
  if (amazonDomainSelect) {
    amazonDomainSelect.value = configState.amazonDomain || 'es';
  }

  // YouTube domain
  const youtubeDomainSelect = document.getElementById('youtubeDomain');
  if (youtubeDomainSelect) {
    youtubeDomainSelect.value = configState.youtubeDomain || 'com';
  }

  // Default search engine
  const defaultSearchEngineSelect = document.getElementById('defaultSearchEngine');
  if (defaultSearchEngineSelect) {
    defaultSearchEngineSelect.value = configState.defaultSearchEngine || 'googleButton';
  }

  // Visibility checkboxes
  Object.keys(configState.visibleEngines).forEach(engine => {
    const checkbox = document.getElementById(`visible${engine.charAt(0).toUpperCase() + engine.slice(1)}`);
    if (checkbox) {
      checkbox.checked = configState.visibleEngines[engine];
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Engine conversion buttons
  const engineButtons = [
    { id: 'googleButton', engine: 'google' },
    { id: 'braveButton', engine: 'brave' },
    { id: 'duckduckgoButton', engine: 'duckduckgo' },
    { id: 'bingButton', engine: 'bing' },
    { id: 'amazonButton', engine: 'amazon' },
    { id: 'youtubeButton', engine: 'youtube' },
    { id: 'wikipediaButton', engine: 'wikipedia' },
    { id: 'twitterButton', engine: 'twitter' },
    { id: 'githubButton', engine: 'github' },
    { id: 'gitlabButton', engine: 'gitlab' },
    { id: 'stackoverflowButton', engine: 'stackoverflow' },
    { id: 'redditButton', engine: 'reddit' },
    { id: 'pinterestButton', engine: 'pinterest' },
    { id: 'startpageButton', engine: 'startpage' },
    { id: 'ecosiaButton', engine: 'ecosia' },
    { id: 'qwantButton', engine: 'qwant' },
    { id: 'yandexButton', engine: 'yandex' },
    { id: 'baiduButton', engine: 'baidu' },
    { id: 'ebayButton', engine: 'ebay' },
    { id: 'aliexpressButton', engine: 'aliexpress' },
    { id: 'etsyButton', engine: 'etsy' },
    { id: 'scholarButton', engine: 'scholar' },
    { id: 'archiveButton', engine: 'archive' },
    { id: 'wolframalphaButton', engine: 'wolframalpha' },
    { id: 'spotifyButton', engine: 'spotify' },
    { id: 'soundcloudButton', engine: 'soundcloud' },
    { id: 'vimeoButton', engine: 'vimeo' },
    { id: 'linkedinButton', engine: 'linkedin' },
    { id: 'tiktokButton', engine: 'tiktok' }
  ];

  engineButtons.forEach(({ id, engine }) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => handleEngineConversion(engine));
    }
  });

  // Configuration toggle
  const configToggleButton = document.getElementById('configToggleButton');
  const configPanel = document.getElementById('configPanel');

  if (configToggleButton && configPanel) {
    configToggleButton.addEventListener('click', function() {
      configPanel.classList.toggle('visible');
      configToggleButton.innerHTML = configPanel.classList.contains('visible') ?
        '<i class="fas fa-times"></i> Cerrar' :
        '<i class="fas fa-cog"></i> Configuración';
    });
  }

  // Domain selectors
  if (document.getElementById('amazonDomain')) {
    document.getElementById('amazonDomain').addEventListener('change', function() {
      configState.amazonDomain = this.value;
      saveConfiguration();
    });
  }

  if (document.getElementById('youtubeDomain')) {
    document.getElementById('youtubeDomain').addEventListener('change', function() {
      configState.youtubeDomain = this.value;
      saveConfiguration();
    });
  }

  if (document.getElementById('defaultSearchEngine')) {
    document.getElementById('defaultSearchEngine').addEventListener('change', function() {
      configState.defaultSearchEngine = this.value;
      saveConfiguration();
    });
  }

  // Visibility checkboxes
  Object.keys(configState.visibleEngines).forEach(engine => {
    const checkboxId = `visible${engine.charAt(0).toUpperCase() + engine.slice(1)}`;
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        configState.visibleEngines[engine] = checkbox.checked;
        updateEngineButtonVisibility();
        updateOrderList();
        updateQuickSearchEngines(); // Update dropdown in search mode
        saveConfiguration();
      });
    }
  });

  // Save button
  const saveButton = document.getElementById('saveConfigButton');
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      saveConfiguration();
      showNotification('Configuración guardada', 'success');
    });
  }
}

/**
 * ============================================================================
 * CONVERSIÓN DE BÚSQUEDAS
 * ============================================================================
 */

/**
 * Maneja la conversión de búsqueda al motor de destino seleccionado
 * Extrae los términos de búsqueda de la URL actual y abre nueva pestaña
 *
 * @function handleEngineConversion
 * @param {string} targetEngine - ID del motor de destino (google, brave, etc.)
 * @returns {void}
 *
 * @description
 * Función principal de conversión que:
 * 1. Obtiene la pestaña activa mediante chrome.tabs API
 * 2. Extrae términos de búsqueda de la URL actual
 * 3. Detecta si es búsqueda de imágenes
 * 4. Construye URL de destino con buildSearchUrl
 * 5. Abre nueva pestaña con la búsqueda convertida
 *
 * Incluye validación completa de Chrome APIs y manejo de errores.
 *
 * @example
 * // Usuario está en Google buscando "javascript"
 * handleEngineConversion('brave');
 * // Abre: https://search.brave.com/search?q=javascript
 */
function handleEngineConversion(targetEngine) {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    updateStatus('Error: Chrome API no disponible', 'error');
    return;
  }

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (chrome.runtime.lastError) {
      console.error('Error querying tabs:', chrome.runtime.lastError);
      updateStatus('Error al obtener pestaña activa', 'error');
      return;
    }

    if (!tabs || tabs.length === 0) {
      updateStatus('No se encontró pestaña activa', 'error');
      return;
    }

    const activeTab = tabs[0];
    const currentUrl = activeTab.url;

    // Detect image search
    const isImageSearch = currentUrl.includes('tbm=isch') ||
                         currentUrl.includes('/images') ||
                         currentUrl.includes('iax=images') ||
                         currentUrl.includes('images/search');

    // Extract query
    let query = extractQuery(currentUrl);

    if (!query) {
      updateStatus('No se detectó ninguna búsqueda', 'error');
      return;
    }

    // Build target URL
    const targetUrl = buildSearchUrl(targetEngine, query, isImageSearch);

    if (targetUrl) {
      chrome.tabs.create({ url: targetUrl });
      window.close();
    } else {
      updateStatus('Motor no soportado', 'error');
    }
  });
}

// Extract query from URL
function extractQuery(url) {
  const patterns = [
    /[?&]q=([^&]+)/,
    /[?&]search_query=([^&]+)/,
    /[?&]k=([^&]+)/,
    /[?&]search=([^&]+)/,
    /[?&]text=([^&]+)/,
    /[?&]wd=([^&]+)/,
    /[?&]_nkw=([^&]+)/,
    /[?&]SearchText=([^&]+)/,
    /[?&]query=([^&]+)/,
    /[?&]i=([^&]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return decodeURIComponent(match[1].replace(/\+/g, ' '));
    }
  }

  return null;
}

/**
 * Construye la URL de búsqueda para el motor especificado
 * Soporta 34+ motores con formatos de URL únicos y búsquedas de imágenes
 *
 * @function buildSearchUrl
 * @param {string} engine - ID del motor (google, brave, duckduckgo, etc.)
 * @param {string} query - Términos de búsqueda sin codificar
 * @param {boolean} [isImageSearch=false] - Si es búsqueda de imágenes
 * @returns {string|null} URL completa o null si el motor no existe
 *
 * @description
 * Construye URLs con el formato específico de cada motor. Maneja:
 * - Codificación automática de consultas (encodeURIComponent)
 * - Dominios regionales (Amazon, YouTube) desde configState
 * - Búsquedas de imágenes cuando el motor lo soporta
 * - Formatos especiales (Twitter hashtags, Reddit subreddits, etc.)
 *
 * @example
 * buildSearchUrl('google', 'typescript tutorial', false)
 * // Returns: 'https://www.google.com/search?q=typescript%20tutorial'
 *
 * @example
 * buildSearchUrl('amazon', 'laptop', false)
 * // Returns: 'https://www.amazon.es/s?k=laptop' (según configState.amazonDomain)
 *
 * @example
 * buildSearchUrl('google', 'cats', true)
 * // Returns: 'https://www.google.com/search?q=cats&tbm=isch'
 */
function buildSearchUrl(engine, query, isImageSearch = false) {
  const encodedQuery = encodeURIComponent(query);

  switch(engine) {
    case 'google':
      let googleUrl = `https://www.google.com/search?q=${encodedQuery}`;
      if (isImageSearch) googleUrl += '&tbm=isch';
      return googleUrl;

    case 'brave':
      return isImageSearch ?
        `https://search.brave.com/images?q=${encodedQuery}` :
        `https://search.brave.com/search?q=${encodedQuery}`;

    case 'duckduckgo':
      let ddgUrl = `https://duckduckgo.com/?q=${encodedQuery}`;
      if (isImageSearch) ddgUrl += '&iax=images&ia=images';
      return ddgUrl;

    case 'bing':
      return isImageSearch ?
        `https://www.bing.com/images/search?q=${encodedQuery}` :
        `https://www.bing.com/search?q=${encodedQuery}`;

    case 'amazon':
      return `https://www.amazon.${configState.amazonDomain}/s?k=${encodedQuery}`;

    case 'youtube':
      return `https://www.youtube.com/results?search_query=${encodedQuery}`;

    case 'wikipedia':
      return `https://es.wikipedia.org/wiki/Special:Search?search=${encodedQuery}`;

    case 'twitter':
      return `https://twitter.com/search?q=${encodedQuery}`;

    case 'github':
      return `https://github.com/search?q=${encodedQuery}`;

    case 'gitlab':
      return `https://gitlab.com/search?search=${encodedQuery}`;

    case 'stackoverflow':
      return `https://stackoverflow.com/search?q=${encodedQuery}`;

    case 'reddit':
      return `https://www.reddit.com/search/?q=${encodedQuery}`;

    case 'pinterest':
      return `https://www.pinterest.com/search/pins/?q=${encodedQuery}`;

    case 'startpage':
      return isImageSearch ?
        `https://www.startpage.com/sp/search?cat=images&q=${encodedQuery}` :
        `https://www.startpage.com/do/search?q=${encodedQuery}`;

    case 'ecosia':
      return isImageSearch ?
        `https://www.ecosia.org/images?q=${encodedQuery}` :
        `https://www.ecosia.org/search?q=${encodedQuery}`;

    case 'qwant':
      let qwantUrl = `https://www.qwant.com/?q=${encodedQuery}`;
      if (isImageSearch) qwantUrl += '&t=images';
      return qwantUrl;

    case 'yandex':
      return isImageSearch ?
        `https://yandex.com/images/search?text=${encodedQuery}` :
        `https://yandex.com/search/?text=${encodedQuery}`;

    case 'baidu':
      return isImageSearch ?
        `https://image.baidu.com/search/index?tn=baiduimage&word=${encodedQuery}` :
        `https://www.baidu.com/s?wd=${encodedQuery}`;

    case 'ebay':
      return `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}`;

    case 'aliexpress':
      return `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}`;

    case 'etsy':
      return `https://www.etsy.com/search?q=${encodedQuery}`;

    case 'scholar':
      return `https://scholar.google.com/scholar?q=${encodedQuery}`;

    case 'archive':
      return `https://archive.org/search?query=${encodedQuery}`;

    case 'wolframalpha':
      return `https://www.wolframalpha.com/input?i=${encodedQuery}`;

    case 'spotify':
      return `https://open.spotify.com/search/${encodedQuery}`;

    case 'soundcloud':
      return `https://soundcloud.com/search?q=${encodedQuery}`;

    case 'vimeo':
      return `https://vimeo.com/search?q=${encodedQuery}`;

    case 'linkedin':
      return `https://www.linkedin.com/search/results/all/?keywords=${encodedQuery}`;

    case 'tiktok':
      return `https://www.tiktok.com/search?q=${encodedQuery}`;

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

// Check current page
function checkCurrentPage() {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    console.warn('Chrome tabs API not available');
    updateStatus('Modo de prueba - API no disponible', 'warning');
    return;
  }

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (chrome.runtime.lastError) {
      console.error('Error querying tabs:', chrome.runtime.lastError);
      return;
    }

    if (!tabs || tabs.length === 0) {
      updateStatus('No se encontró pestaña activa', 'warning');
      return;
    }

    const activeTab = tabs[0];
    const url = activeTab.url || '';

    const engines = {
      'google.com/search': 'Google',
      'search.brave.com': 'Brave',
      'bing.com/search': 'Bing',
      'duckduckgo.com': 'DuckDuckGo',
      'amazon.': 'Amazon',
      'youtube.com/results': 'YouTube',
      'wikipedia.org': 'Wikipedia',
      'twitter.com/search': 'Twitter/X',
      'github.com/search': 'GitHub',
      'stackoverflow.com/search': 'Stack Overflow',
      'reddit.com/search': 'Reddit'
    };

    let currentEngine = null;
    let isSearchEngine = false;

    for (const [pattern, name] of Object.entries(engines)) {
      if (url.includes(pattern)) {
        currentEngine = name;
        isSearchEngine = true;
        break;
      }
    }

    if (isSearchEngine && currentEngine) {
      const isImageSearch = url.includes('tbm=isch') || url.includes('/images') || url.includes('iax=images');
      let statusMessage = `Motor detectado: ${currentEngine}`;
      if (isImageSearch) statusMessage += ' (Imágenes)';
      updateStatus(statusMessage, 'success');

      // Enable/disable buttons based on search type
      document.querySelectorAll('.engine-button').forEach(btn => {
        btn.disabled = false;
      });
    } else {
      updateStatus('No es una página de búsqueda compatible', 'warning');
      document.querySelectorAll('.engine-button').forEach(btn => {
        btn.disabled = true;
      });
    }
  });
}

// Update engine button visibility
function updateEngineButtonVisibility() {
  const engineMapping = {
    google: 'googleButton',
    brave: 'braveButton',
    duckduckgo: 'duckduckgoButton',
    bing: 'bingButton',
    amazon: 'amazonButton',
    youtube: 'youtubeButton',
    wikipedia: 'wikipediaButton',
    twitter: 'twitterButton',
    github: 'githubButton',
    gitlab: 'gitlabButton',
    stackoverflow: 'stackoverflowButton',
    reddit: 'redditButton',
    pinterest: 'pinterestButton',
    startpage: 'startpageButton',
    ecosia: 'ecosiaButton',
    qwant: 'qwantButton',
    yandex: 'yandexButton',
    baidu: 'baiduButton',
    ebay: 'ebayButton',
    aliexpress: 'aliexpressButton',
    etsy: 'etsyButton',
    scholar: 'scholarButton',
    archive: 'archiveButton',
    wolframalpha: 'wolframalphaButton',
    spotify: 'spotifyButton',
    soundcloud: 'soundcloudButton',
    vimeo: 'vimeoButton',
    linkedin: 'linkedinButton',
    tiktok: 'tiktokButton'
  };

  Object.entries(engineMapping).forEach(([engine, buttonId]) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.style.display = configState.visibleEngines[engine] ? '' : 'none';
    }
  });

  applyButtonOrder();
}

// Initialize button ordering
function initializeButtonOrdering() {
  const orderList = document.getElementById('buttonOrderList');
  if (!orderList || typeof Sortable === 'undefined') {
    console.warn('Sortable library not found');
    return;
  }

  updateOrderList();

  Sortable.create(orderList, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: function() {
      const newOrder = Array.from(orderList.children).map(li => li.getAttribute('data-id'));
      configState.buttonOrder = newOrder;
      saveConfiguration();
      applyButtonOrder();
    }
  });
}

// Update order list
function updateOrderList() {
  const orderList = document.getElementById('buttonOrderList');
  if (!orderList) return;

  orderList.innerHTML = '';

  // Complete engine info for ALL supported engines
  const engineInfo = {
    google: { icon: 'fab fa-google', color: '#4285F4', name: 'Google' },
    brave: { icon: 'fas fa-shield-alt', color: '#FB542B', name: 'Brave' },
    duckduckgo: { icon: 'fab fa-d-and-d', color: '#DE5833', name: 'DuckDuckGo' },
    bing: { icon: 'fab fa-microsoft', color: '#008373', name: 'Bing' },
    amazon: { icon: 'fab fa-amazon', color: '#FF9900', name: 'Amazon' },
    youtube: { icon: 'fab fa-youtube', color: '#FF0000', name: 'YouTube' },
    wikipedia: { icon: 'fab fa-wikipedia-w', color: '#000000', name: 'Wikipedia' },
    twitter: { icon: 'fab fa-twitter', color: '#1DA1F2', name: 'Twitter/X' },
    github: { icon: 'fab fa-github', color: '#333333', name: 'GitHub' },
    gitlab: { icon: 'fab fa-gitlab', color: '#FC6D26', name: 'GitLab' },
    stackoverflow: { icon: 'fab fa-stack-overflow', color: '#F58025', name: 'Stack Overflow' },
    reddit: { icon: 'fab fa-reddit', color: '#FF4500', name: 'Reddit' },
    pinterest: { icon: 'fab fa-pinterest', color: '#E60023', name: 'Pinterest' },
    startpage: { icon: 'fas fa-search', color: '#5B7FDE', name: 'Startpage' },
    ecosia: { icon: 'fas fa-tree', color: '#4CAF50', name: 'Ecosia' },
    qwant: { icon: 'fas fa-search', color: '#5C97FF', name: 'Qwant' },
    yandex: { icon: 'fas fa-search', color: '#FF0000', name: 'Yandex' },
    baidu: { icon: 'fas fa-search', color: '#2319DC', name: 'Baidu' },
    ebay: { icon: 'fas fa-shopping-cart', color: '#0064D2', name: 'eBay' },
    aliexpress: { icon: 'fas fa-shopping-bag', color: '#FF6900', name: 'AliExpress' },
    etsy: { icon: 'fas fa-store', color: '#F45800', name: 'Etsy' },
    scholar: { icon: 'fas fa-graduation-cap', color: '#4285F4', name: 'Google Scholar' },
    archive: { icon: 'fas fa-archive', color: '#000000', name: 'Archive.org' },
    wolframalpha: { icon: 'fas fa-calculator', color: '#DD1100', name: 'WolframAlpha' },
    spotify: { icon: 'fab fa-spotify', color: '#1DB954', name: 'Spotify' },
    soundcloud: { icon: 'fab fa-soundcloud', color: '#FF3300', name: 'SoundCloud' },
    vimeo: { icon: 'fab fa-vimeo', color: '#162221', name: 'Vimeo' },
    linkedin: { icon: 'fab fa-linkedin', color: '#0077B5', name: 'LinkedIn' },
    tiktok: { icon: 'fab fa-tiktok', color: '#000000', name: 'TikTok' },
    perplexity: { icon: 'fas fa-brain', color: '#20808D', name: 'Perplexity AI' },
    kagi: { icon: 'fas fa-search', color: '#FF6A00', name: 'Kagi' },
    searx: { icon: 'fas fa-search', color: '#3050FF', name: 'SearX' },
    you: { icon: 'fas fa-search', color: '#00B8D9', name: 'You.com' }
  };

  const visibleEngines = Object.keys(configState.visibleEngines)
    .filter(engine => configState.visibleEngines[engine]);

  visibleEngines.forEach(engine => {
    const info = engineInfo[engine];
    if (!info) {
      // Fallback for engines without defined info
      const li = document.createElement('li');
      li.setAttribute('data-id', `${engine}Button`);
      li.className = 'button-order-item';
      li.innerHTML = `
        <i class="fas fa-grip-lines"></i>
        <i class="fas fa-search" style="color: #666;"></i> ${engine.charAt(0).toUpperCase() + engine.slice(1)}
      `;
      orderList.appendChild(li);
      return;
    }

    const buttonId = `${engine}Button`;
    const li = document.createElement('li');
    li.setAttribute('data-id', buttonId);
    li.className = 'button-order-item';
    li.innerHTML = `
      <i class="fas fa-grip-lines"></i>
      <i class="${info.icon}" style="color: ${info.color};"></i> ${info.name}
    `;
    orderList.appendChild(li);
  });
}

// Apply button order
function applyButtonOrder() {
  const searchButtons = document.querySelector('.search-buttons');
  if (!searchButtons || !configState.buttonOrder.length) return;

  const orderedButtons = [];

  configState.buttonOrder.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button && button.style.display !== 'none') {
      orderedButtons.push(button);
    }
  });

  orderedButtons.forEach(button => {
    searchButtons.appendChild(button);
  });
}

// Save configuration
function saveConfiguration() {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    console.warn('Chrome storage API not available - configuration not saved');
    return;
  }

  try {
    chrome.storage.local.set({
      'searchEngineConverterConfig': JSON.stringify(configState)
    }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving configuration:', chrome.runtime.lastError);
      } else {
        console.log('Configuration saved successfully');
      }
    });
  } catch (error) {
    console.error('Error saving configuration:', error);
  }
}

/**
 * Muestra una notificación temporal en la esquina superior derecha
 *
 * @function showNotification
 * @param {string} message - Mensaje a mostrar
 * @param {string} [type='info'] - Tipo: 'info', 'success', 'error'
 * @returns {void}
 *
 * @description
 * Crea un elemento de notificación con auto-desaparición después de 3 segundos.
 * Si el contenedor no existe, lo crea dinámicamente. Las notificaciones se
 * apilan verticalmente y se remueven automáticamente con animación.
 *
 * @example
 * showNotification('URL copiada al portapapeles', 'success');
 * showNotification('Error al guardar configuración', 'error');
 */
function showNotification(message, type = 'info') {
  let container = document.getElementById('notification-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    `;
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    margin-bottom: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    opacity: 0;
    transition: opacity 0.3s;
  `;
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => notification.style.opacity = '1', 10);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        container.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * ============================================================================
 * BÚSQUEDA RÁPIDA Y MODOS
 * ============================================================================
 */

/**
 * Configura la funcionalidad de búsqueda rápida (modo Buscar)
 *
 * @function setupQuickSearch
 * @returns {void}
 *
 * @description
 * Inicializa el sistema de búsqueda rápida que permite realizar búsquedas
 * nuevas sin estar en una página de resultados. Configura:
 * - Event listeners para el campo de entrada
 * - Botón de limpiar (aparece/desaparece según el contenido)
 * - Búsqueda al presionar Enter
 * - Selector de motor (sincronizado con motores visibles)
 *
 * El motor seleccionado y los términos de búsqueda se combinan para
 * construir la URL mediante buildSearchUrl y abrir nueva pestaña.
 *
 * @example
 * // Usuario activa modo "Buscar", escribe "typescript", selecciona Google
 * // Presiona Enter → Abre https://www.google.com/search?q=typescript
 */
function setupQuickSearch() {
  const searchInput = document.getElementById('quickSearchInput');
  const clearButton = document.getElementById('clearSearchButton');
  const engineSelect = document.getElementById('quickSearchEngine');

  if (!searchInput) return;

  // Show/hide clear button
  searchInput.addEventListener('input', function() {
    clearButton.style.display = searchInput.value ? 'block' : 'none';
  });

  // Clear button functionality
  if (clearButton) {
    clearButton.addEventListener('click', function() {
      searchInput.value = '';
      clearButton.style.display = 'none';
      searchInput.focus();
    });
  }

  // Search on Enter key
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      performQuickSearch(searchInput.value.trim(), engineSelect.value);
    }
  });

  // Populate engine select with visible engines
  updateQuickSearchEngines();
}

// Update quick search engine options
function updateQuickSearchEngines() {
  const select = document.getElementById('quickSearchEngine');
  if (!select) return;

  select.innerHTML = '';

  // Complete list of ALL engines with proper names
  const engineNames = {
    google: 'Google',
    brave: 'Brave',
    duckduckgo: 'DuckDuckGo',
    bing: 'Bing',
    amazon: 'Amazon',
    youtube: 'YouTube',
    wikipedia: 'Wikipedia',
    twitter: 'Twitter/X',
    github: 'GitHub',
    gitlab: 'GitLab',
    stackoverflow: 'Stack Overflow',
    reddit: 'Reddit',
    pinterest: 'Pinterest',
    startpage: 'Startpage',
    ecosia: 'Ecosia',
    qwant: 'Qwant',
    yandex: 'Yandex',
    baidu: 'Baidu',
    ebay: 'eBay',
    aliexpress: 'AliExpress',
    etsy: 'Etsy',
    scholar: 'Google Scholar',
    archive: 'Archive.org',
    wolframalpha: 'WolframAlpha',
    spotify: 'Spotify',
    soundcloud: 'SoundCloud',
    vimeo: 'Vimeo',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    perplexity: 'Perplexity AI',
    kagi: 'Kagi',
    searx: 'SearX',
    you: 'You.com'
  };

  // Get all visible engines from config
  Object.keys(configState.visibleEngines).forEach(engineId => {
    if (configState.visibleEngines[engineId] === true) {
      const option = document.createElement('option');
      option.value = engineId;
      option.textContent = engineNames[engineId] || engineId.charAt(0).toUpperCase() + engineId.slice(1);
      select.appendChild(option);
    }
  });

  // If no engines are visible, add a default
  if (select.options.length === 0) {
    const option = document.createElement('option');
    option.value = 'google';
    option.textContent = 'Google (predeterminado)';
    select.appendChild(option);
  }
}

// Perform quick search
function performQuickSearch(query, engine) {
  const url = buildSearchUrl(engine, query);
  if (!url) {
    showNotification('Motor de búsqueda no válido', 'error');
    return;
  }

  if (typeof chrome === 'undefined' || !chrome.tabs) {
    // Fallback: open in new window
    window.open(url, '_blank');
    return;
  }

  try {
    chrome.tabs.create({ url: url }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error creating tab:', chrome.runtime.lastError);
        window.open(url, '_blank');
      } else {
        window.close();
      }
    });
  } catch (error) {
    console.error('Error in performQuickSearch:', error);
    window.open(url, '_blank');
  }
}

// Setup mode toggle
function setupModeToggle() {
  const convertButton = document.getElementById('convertModeButton');
  const searchButton = document.getElementById('searchModeButton');
  const quickSearchContainer = document.querySelector('.quick-search-container');
  const statusContainer = document.querySelector('.status-container');

  if (!convertButton || !searchButton) return;

  convertButton.addEventListener('click', function() {
    convertButton.classList.add('active');
    searchButton.classList.remove('active');
    quickSearchContainer.classList.remove('visible');
    statusContainer.style.display = 'block';
    checkCurrentPage();
  });

  searchButton.addEventListener('click', function() {
    searchButton.classList.add('active');
    convertButton.classList.remove('active');
    quickSearchContainer.classList.add('visible');
    statusContainer.style.display = 'none';

    // Focus search input
    setTimeout(() => {
      document.getElementById('quickSearchInput').focus();
    }, 100);
  });
}

// Setup copy buttons
function setupCopyButtons() {
  document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const engine = this.getAttribute('data-engine');
      copyConvertedUrl(engine, this);
    });
  });
}

// Copy converted URL to clipboard
function copyConvertedUrl(targetEngine, button) {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    showNotification('Chrome API no disponible', 'error');
    return;
  }

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
      showNotification('Error al obtener pestaña activa', 'error');
      return;
    }

    const activeTab = tabs[0];
    const currentUrl = activeTab.url;

    const query = extractQuery(currentUrl);
    if (!query) {
      showNotification('No se detectó ninguna búsqueda', 'error');
      return;
    }

    const isImageSearch = currentUrl.includes('tbm=isch') ||
                         currentUrl.includes('/images') ||
                         currentUrl.includes('iax=images');

    const targetUrl = buildSearchUrl(targetEngine, query, isImageSearch);

    if (targetUrl) {
      navigator.clipboard.writeText(targetUrl).then(() => {
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i>';

        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);

        showNotification('URL copiada al portapapeles', 'success');
      }).catch(err => {
        showNotification('Error al copiar URL', 'error');
      });
    }
  });
}

/**
 * ============================================================================
 * ATAJOS DE TECLADO
 * ============================================================================
 */

/**
 * Configura los atajos de teclado para navegación rápida
 *
 * @function setupKeyboardShortcuts
 * @returns {void}
 *
 * @description
 * Registra event listeners para atajos de teclado del popup:
 *
 * - Alt + 1-9: Convierte la búsqueda al motor en esa posición del grid
 * - Ctrl + K: Activa modo búsqueda y pone foco en campo de entrada
 * - ESC: Cierra el popup
 *
 * Los atajos Alt+1-9 consideran solo los motores visibles en el orden
 * personalizado por el usuario. Si hay menos de N motores visibles,
 * los atajos superiores no tienen efecto.
 *
 * @example
 * // Usuario tiene Google (1°), Brave (2°), DuckDuckGo (3°) visibles
 * // Presiona Alt+2 → Convierte a Brave
 * // Presiona Ctrl+K → Activa campo de búsqueda rápida
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Alt + number keys (1-9) for quick engine switching
    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        e.preventDefault();
        const visibleButtons = Array.from(document.querySelectorAll('.engine-button'))
          .filter(btn => btn.style.display !== 'none');

        if (visibleButtons[num - 1]) {
          visibleButtons[num - 1].click();
        }
      }
    }

    // Ctrl + K to focus quick search
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      document.getElementById('searchModeButton').click();
    }

    // ESC to close popup
    if (e.key === 'Escape') {
      window.close();
    }
  });
}
