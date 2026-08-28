/**
 * ============================================================================
 * config.js - Estado de configuracion compartido
 * ============================================================================
 *
 * Logica de carga, saneado y persistencia de la configuracion del usuario,
 * usada tanto por popup.js como por options.js. Background.js tiene su
 * propia lectura minima (solo necesita motor por defecto y dominios).
 *
 * Seguridad:
 *   - Todo lo que llega de chrome.storage o de un fichero importado pasa por
 *     applySavedConfiguration(), que sanea campo a campo:
 *       dominios -> validateDomain (whitelist cerrada)
 *       motor por defecto -> normalizeDefaultSearchEngine (Object.hasOwn)
 *       personalizados -> validateCustomEngine (https + {query} obligatorios)
 *       visibilidad y orden -> listas blancas de ids existentes
 *
 * @file        config.js
 * @author      @686f6c61
 * @license     MIT
 * ============================================================================
 */

import {
  SEARCH_ENGINES,
  DEFAULT_CONFIG,
  DEFAULT_SEARCH_ENGINE_ID,
  DOMAIN_DEFAULTS,
  STORAGE_KEY,
  validateDomain,
  validateCustomEngine,
  normalizeDefaultSearchEngine
} from './engines.js';

/**
 * Estado de configuracion por defecto (recien instalada).
 * @returns {Object} copia nueva del estado inicial
 */
export function defaultConfigState() {
  return {
    amazonDomain: DOMAIN_DEFAULTS.amazon,
    youtubeDomain: DOMAIN_DEFAULTS.youtube,
    defaultSearchEngine: DEFAULT_SEARCH_ENGINE_ID,
    visibleEngines: { ...DEFAULT_CONFIG },
    buttonOrder: [],
    customEngines: []
  };
}

/**
 * Sanea el mapa de visibilidad: solo ids conocidos (predefinidos + extras
 * personalizados), y solo valores booleanos.
 */
export function sanitizeVisibleEngines(visibleEngines, extraEngineIds = []) {
  const safeVisibleEngines = { ...DEFAULT_CONFIG };

  extraEngineIds.forEach((engineId) => {
    safeVisibleEngines[engineId] = true;
  });

  if (!visibleEngines || typeof visibleEngines !== 'object') {
    return safeVisibleEngines;
  }

  Object.keys(safeVisibleEngines).forEach((engineId) => {
    if (typeof visibleEngines[engineId] === 'boolean') {
      safeVisibleEngines[engineId] = visibleEngines[engineId];
    }
  });

  return safeVisibleEngines;
}

/**
 * Sanea la lista de orden: solo buttonIds conocidos, sin duplicados.
 */
export function sanitizeButtonOrder(buttonOrder, extraButtonIds = []) {
  if (!Array.isArray(buttonOrder)) {
    return [];
  }

  const validButtonIds = new Set([
    ...Object.values(SEARCH_ENGINES).map(engine => engine.buttonId),
    ...extraButtonIds
  ]);
  const safeOrder = [];

  buttonOrder.forEach((buttonId) => {
    if (
      typeof buttonId === 'string' &&
      validButtonIds.has(buttonId) &&
      !safeOrder.includes(buttonId)
    ) {
      safeOrder.push(buttonId);
    }
  });

  return safeOrder;
}

/**
 * Aplica una configuracion guardada (storage o fichero importado) sobre el
 * estado, saneando cada campo. Los datos invalidos se ignoran en silencio.
 *
 * @param {Object} state - configState a mutar
 * @param {Object} savedConfig - objeto procedente de storage o de un JSON externo
 */
export function applySavedConfiguration(state, savedConfig) {
  if (!savedConfig || typeof savedConfig !== 'object') {
    return;
  }

  if (validateDomain('amazon', savedConfig.amazonDomain)) {
    state.amazonDomain = savedConfig.amazonDomain;
  }

  if (validateDomain('youtube', savedConfig.youtubeDomain)) {
    state.youtubeDomain = savedConfig.youtubeDomain;
  }

  /* Sanear los motores personalizados ANTES de usar sus ids en el resto de
     campos: cada uno pasa por validateCustomEngine (https + {query}) */
  const sanitizedCustomEngines = Array.isArray(savedConfig.customEngines)
    ? savedConfig.customEngines.map(validateCustomEngine).filter(Boolean)
    : null;

  state.defaultSearchEngine = normalizeDefaultSearchEngine(
    savedConfig.defaultSearchEngine,
    sanitizedCustomEngines || []
  );

  const customIds = sanitizedCustomEngines
    ? sanitizedCustomEngines.map(engine => engine.id)
    : [];
  const customButtonIds = customIds.map(id => id + 'Button');

  state.visibleEngines = sanitizeVisibleEngines(savedConfig.visibleEngines, customIds);
  state.buttonOrder = sanitizeButtonOrder(savedConfig.buttonOrder, customButtonIds);

  if (sanitizedCustomEngines) {
    state.customEngines = sanitizedCustomEngines;
  }
}

/**
 * Carga la configuracion desde chrome.storage.local sobre un estado nuevo.
 * JSON corrupto o API no disponible -> estado por defecto (nunca rechaza).
 *
 * @returns {Promise<Object>} configState listo para usar
 */
export function loadConfigState() {
  const state = defaultConfigState();

  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      resolve(state);
      return;
    }

    try {
      chrome.storage.local.get(STORAGE_KEY, (data) => {
        if (chrome.runtime.lastError) {
          resolve(state);
          return;
        }

        if (data[STORAGE_KEY]) {
          try {
            applySavedConfiguration(state, JSON.parse(data[STORAGE_KEY]));
          } catch (_) {
            /* Configuracion corrupta: se usan los valores por defecto */
          }
        }

        resolve(state);
      });
    } catch (_) {
      resolve(state);
    }
  });
}

/**
 * Persiste el estado completo en chrome.storage.local.
 * @param {Object} state - configState a guardar
 */
export function saveConfigState(state) {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return;
  }

  try {
    chrome.storage.local.set({ [STORAGE_KEY]: JSON.stringify(state) });
  } catch (_) {
    /* Cuota superada o API no disponible: la proxima modificacion reintentara */
  }
}

/**
 * Ids de motores visibles ordenados segun configState.buttonOrder, con los
 * no listados al final (orden de declaracion).
 *
 * @param {Object} state - configState
 * @param {Object} engines - mapa combinado de motores (predefinidos + personalizados)
 * @returns {Array<string>} engineIds visibles en orden
 */
export function getVisibleEngineIdsInOrder(state, engines) {
  const buttonIdToEngineId = new Map(
    Object.entries(engines).map(([id, engine]) => [engine.buttonId, id])
  );

  const ordered = [];
  const added = new Set();

  state.buttonOrder.forEach((buttonId) => {
    const engineId = buttonIdToEngineId.get(buttonId);
    if (engineId && state.visibleEngines[engineId] && !added.has(engineId)) {
      ordered.push(engineId);
      added.add(engineId);
    }
  });

  Object.keys(state.visibleEngines).forEach((engineId) => {
    if (state.visibleEngines[engineId] && !added.has(engineId)) {
      ordered.push(engineId);
      added.add(engineId);
    }
  });

  return ordered;
}
