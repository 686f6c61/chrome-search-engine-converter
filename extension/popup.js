/**
 * ============================================================================
 * popup.js - Controlador del popup (v2.3.0)
 * ============================================================================
 *
 * Unico flujo de interfaz:
 *   1. Detecta si la pestana activa es una pagina de busqueda.
 *      - Si lo es: autorellena la caja con el termino y muestra "Detectado".
 *      - Si no: deja la caja vacia y lista para escribir.
 *   2. La rejilla de motores ejecuta siempre la misma accion: buscar el texto
 *      de la caja en el motor pulsado (conversion o busqueda rapida son la
 *      misma operacion). Enter busca en el motor predeterminado.
 *
 * La configuracion (visibilidad, orden, dominios, personalizados, import/
 * export) NO vive aqui: se abrio en options.html. El popup solo lee.
 *
 * Accesibilidad:
 *   - aria-live en el chip de estado
 *   - Alt+1..9 activan los primeros nueve botones; el numero se pinta en el
 *     boton como pista visual
 *   - Ctrl/Cmd+K enfoca la caja; Esc cierra el popup
 *   - Titulos ("Buscar en X") generados con chrome.i18n
 *
 * Seguridad:
 *   - Todo el DOM se construye con createElement/textContent (sin innerHTML)
 *   - La config llega ya saneada por loadConfigState() de config.js
 *
 * @file        popup.js
 * @author      @686f6c61
 * @license     MIT
 * ============================================================================
 */

import {
  STORAGE_KEY,
  buildSearchUrl,
  detectEngine,
  extractQuery,
  getMergedEngines,
  isImageSearch,
  normalizeDefaultSearchEngine
} from './engines.js';
import {
  applySavedConfiguration,
  defaultConfigState,
  getVisibleEngineIdsInOrder,
  loadConfigState
} from './config.js';
import { applyI18n, msg, showNotification } from './ui.js';

const COPY_FEEDBACK_DURATION = 2000;
const MAX_SHORTCUT_BADGE = 9;

/** Estado de configuracion (solo lectura en el popup) */
let configState = defaultConfigState();

/** Contexto de la pestana activa */
const pageContext = {
  engineId: null,
  query: null,
  imgSearch: false,
  /** true cuando el usuario ha editado la caja manualmente */
  userEdited: false
};

/* ============================================================================
 * INICIALIZACION
 * ============================================================================ */

document.addEventListener('DOMContentLoaded', async function () {
  applyI18n();
  renderVersionLabel();

  configState = await loadConfigState();
  renderEngineGrid();

  setupEventListeners();
  await detectCurrentPage();
});

function renderVersionLabel() {
  const label = document.getElementById('versionLabel');
  if (!label) return;
  const manifest = typeof chrome !== 'undefined' && chrome.runtime
    ? chrome.runtime.getManifest()
    : null;
  label.textContent = manifest ? 'v' + manifest.version : '';
}

/* ============================================================================
 * REJILLA DE MOTORES
 * ============================================================================ */

/**
 * Renderiza la rejilla: un boton por motor visible, en el orden guardado.
 * Cada boton lleva el badge Alt+N (primeros nueve) y tooltip traducido.
 */
function renderEngineGrid() {
  const container = document.getElementById('engineGrid');
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const engines = getMergedEngines(configState.customEngines);
  const orderedIds = getVisibleEngineIdsInOrder(configState, engines);

  orderedIds.forEach((id, index) => {
    const engine = engines[id];
    if (!engine) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = engine.buttonId;
    button.className = 'search-button engine-button';
    button.setAttribute('data-engine-id', id);
    button.disabled = true;

    const icon = document.createElement('i');
    icon.className = engine.icon;
    icon.style.color = engine.color;
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'engine-name';
    nameSpan.textContent = engine.name;
    button.appendChild(nameSpan);

    if (index < MAX_SHORTCUT_BADGE) {
      const badge = document.createElement('span');
      badge.className = 'shortcut-badge';
      badge.textContent = String(index + 1);
      badge.setAttribute('aria-hidden', 'true');
      button.appendChild(badge);
    }

    updateButtonTitle(button, id);
    button.addEventListener('click', () => runEngine(id));
    container.appendChild(button);
  });

  /* Al menos debe poder buscarse escribiendo en la caja */
  refreshButtonStates();
}

/**
 * Actualiza el tooltip de un boton segun el contexto:
 * conversion (hay busqueda detectada sin editar) o busqueda rapida.
 */
function updateButtonTitle(button, engineId) {
  const engines = getMergedEngines(configState.customEngines);
  const engine = engines[engineId];
  if (!engine || !button) return;

  const isConversion = Boolean(pageContext.query) && !pageContext.userEdited;
  const key = isConversion ? 'tooltipConvert' : 'tooltipSearch';
  button.title = msg(key, engine.name);
  button.setAttribute('aria-label', button.title);
}

function refreshButtonTitles() {
  const container = document.getElementById('engineGrid');
  if (!container) return;
  container.querySelectorAll('.engine-button').forEach((btn) => {
    updateButtonTitle(btn, btn.getAttribute('data-engine-id'));
  });
}

/**
 * Habilita los botones cuando hay texto que buscar (detectado o escrito).
 */
function refreshButtonStates() {
  const hasText = getQueryFromInput().length > 0;
  document.querySelectorAll('.engine-button').forEach((btn) => {
    btn.disabled = !hasText;
  });
}

/* ============================================================================
 * DETECCION DE LA PAGINA ACTUAL
 * ============================================================================ */

/**
 * Lee la pestana activa y prepara el contexto: rellena la caja con el
 * termino detectado o deja la caja vacia para busqueda manual.
 */
async function detectCurrentPage() {
  const statusChip = document.getElementById('statusChip');
  const input = document.getElementById('quickSearchInput');

  if (typeof chrome === 'undefined' || !chrome.tabs) {
    if (statusChip) statusChip.textContent = msg('statusManualOnly');
    refreshButtonStates();
    return;
  }

  let activeTab = null;
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tabs && tabs.length > 0 ? tabs[0] : null;
  } catch (_) {
    activeTab = null;
  }

  const url = activeTab && activeTab.url ? activeTab.url : '';
  const engines = getMergedEngines(configState.customEngines);
  const engineId = detectEngine(url, engines);
  const query = engineId ? extractQuery(url, engines) : null;

  pageContext.engineId = engineId;
  pageContext.query = query;
  pageContext.imgSearch = engineId && query ? isImageSearch(url) : false;
  pageContext.userEdited = false;

  if (input) {
    input.value = query || '';
  }

  if (statusChip) {
    if (engineId && query) {
      const engineName = engines[engineId].name;
      const suffix = pageContext.imgSearch ? ' · ' + msg('statusImages') : '';
      statusChip.textContent = msg('statusDetected', [engineName, suffix]);
      statusChip.classList.add('detected');
    } else {
      statusChip.textContent = msg('statusNotSearch');
      statusChip.classList.remove('detected');
    }
  }

  refreshButtonTitles();
  refreshButtonStates();

  /* Si no hay busqueda detectada, el foco va directo a la caja */
  if (input && !query && typeof input.focus === 'function') {
    input.focus();
  }
}

/* ============================================================================
 * EJECUCION DE BUSQUEDA / CONVERSION
 * ============================================================================ */

/**
 * Texto actual de la caja (recortado). Es la fuente unica para construir
 * la URL: si venia detectado y no se toco, equivale a convertir.
 */
function getQueryFromInput() {
  const input = document.getElementById('quickSearchInput');
  return input ? input.value.trim() : '';
}

/**
 * Construye la URL del motor con el texto actual y abre la pestana.
 *
 * @param {string} engineId - id del motor (predefinido o personalizado)
 */
function runEngine(engineId) {
  const query = getQueryFromInput();
  if (!query) {
    showNotification(msg('statusNoQuery'), 'error');
    return;
  }

  const useImages = pageContext.imgSearch && !pageContext.userEdited;
  const targetUrl = buildSearchUrl(
    engineId,
    query,
    useImages,
    configState,
    configState.customEngines
  );

  if (!targetUrl) {
    showNotification(msg('statusEngineInvalid'), 'error');
    return;
  }

  openUrl(targetUrl);
}

/** Abre la URL en una pestana nueva y cierra el popup. */
function openUrl(url) {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    window.open(url, '_blank');
    return;
  }

  try {
    chrome.tabs.create({ url }, function () {
      if (chrome.runtime.lastError) {
        window.open(url, '_blank');
      } else {
        window.close();
      }
    });
  } catch (_) {
    window.open(url, '_blank');
  }
}

/** Motor predeterminado normalizado (puede ser personalizado). */
function getDefaultEngineId() {
  return normalizeDefaultSearchEngine(
    configState.defaultSearchEngine,
    configState.customEngines
  );
}

/* ============================================================================
 * EVENTOS
 * ============================================================================ */

function setupEventListeners() {
  const input = document.getElementById('quickSearchInput');
  const clearButton = document.getElementById('clearSearchButton');
  const optionsButton = document.getElementById('openOptionsButton');

  if (input) {
    input.addEventListener('input', function () {
      pageContext.userEdited = true;
      if (clearButton) {
        clearButton.classList.toggle('visible', input.value.length > 0);
      }
      refreshButtonTitles();
      refreshButtonStates();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        runEngine(getDefaultEngineId());
      }
    });
  }

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      input.value = '';
      input.focus();
      pageContext.userEdited = true;
      clearButton.classList.remove('visible');
      refreshButtonTitles();
      refreshButtonStates();
    });
  }

  if (optionsButton) {
    optionsButton.addEventListener('click', function () {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
      window.close();
    });
  }

  setupCopyButton();
  setupKeyboardShortcuts();
  setupStorageSync();
}

/**
 * Boton de copiar: copia al portapapeles la URL que se abriria con el motor
 * predeterminado, sin navegar. Muestra feedback breve (check).
 */
function setupCopyButton() {
  const copyButton = document.getElementById('copyUrlButton');
  if (!copyButton) return;

  copyButton.addEventListener('click', function () {
    const query = getQueryFromInput();
    if (!query) {
      showNotification(msg('statusNoQuery'), 'error');
      return;
    }

    const useImages = pageContext.imgSearch && !pageContext.userEdited;
    const targetUrl = buildSearchUrl(
      getDefaultEngineId(),
      query,
      useImages,
      configState,
      configState.customEngines
    );

    if (!targetUrl) {
      showNotification(msg('statusEngineInvalid'), 'error');
      return;
    }

    navigator.clipboard.writeText(targetUrl).then(() => {
      flashCopied(copyButton);
      showNotification(msg('copiedToClipboard'), 'success');
    }).catch(() => {
      showNotification(msg('copyFailed'), 'error');
    });
  });
}

/** Cambia el icono del boton a una check durante un momento. */
function flashCopied(button) {
  const icon = button.querySelector('i');
  if (!icon) return;

  icon.className = 'fas fa-check';
  setTimeout(() => {
    icon.className = 'fas fa-copy';
  }, COPY_FEEDBACK_DURATION);
}

/**
 * Atajos del popup:
 *   - Alt+1..9: activa el boton N de la rejilla
 *   - Ctrl/Cmd+K: enfoca la caja de busqueda
 *   - Esc: cierra el popup
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= MAX_SHORTCUT_BADGE) {
        e.preventDefault();
        const buttons = Array.from(document.querySelectorAll('.engine-button'))
          .filter(btn => !btn.disabled);
        const target = buttons[num - 1];
        if (target) {
          target.click();
        }
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      const input = document.getElementById('quickSearchInput');
      if (input) {
        input.focus();
        input.select();
      }
      return;
    }

    if (e.key === 'Escape') {
      window.close();
    }
  });
}

/**
 * Si el usuario cambia opciones en otra ventana mientras el popup esta
 * abierto, refrescar config y rejilla conservando lo que haya escrito.
 */
function setupStorageSync() {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.onChanged) {
    return;
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[STORAGE_KEY]) {
      return;
    }

    const typedBefore = pageContext.userEdited
      ? getQueryFromInput()
      : null;

    try {
      const fresh = defaultConfigState();
      applySavedConfiguration(fresh, JSON.parse(changes[STORAGE_KEY].newValue));
      configState = fresh;
    } catch (_) {
      return;
    }

    renderEngineGrid();
    detectCurrentPage().then(() => {
      if (typedBefore !== null) {
        const input = document.getElementById('quickSearchInput');
        if (input) {
          input.value = typedBefore;
        }
        pageContext.userEdited = true;
        refreshButtonTitles();
        refreshButtonStates();
      }
    });
  });
}
