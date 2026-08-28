/**
 * ============================================================================
 * options.js - Pagina de opciones (v2.3.0)
 * ============================================================================
 *
 * Configuracion completa de la extension. Guardado automatico con debounce:
 * no existe boton Guardar; el indicador "Guardado" confirma cada escritura.
 *
 * Seguridad:
 *   - Todo el DOM dinamico se construye con createElement/textContent
 *   - Lo que se lee de storage pasa por applySavedConfiguration (saneado)
 *   - Cada motor personalizado nuevo pasa por validateCustomEngine
 *
 * Accesibilidad:
 *   - Reordenacion posible por teclado (botones subir/bajar) ademas del
 *     arrastre con SortableJS
 *   - roles status/aria-live en el indicador de guardado y en la vista previa
 *
 * @file        options.js
 * @author      @686f6c61
 * @license     MIT
 * ============================================================================
 */

import {
  CUSTOM_ENGINE_ICONS,
  normalizeDefaultSearchEngine,
  validateDomain,
  validateCustomEngine,
  getMergedEngines
} from './engines.js';
import {
  applySavedConfiguration,
  defaultConfigState,
  getVisibleEngineIdsInOrder,
  loadConfigState,
  saveConfigState
} from './config.js';
import { applyI18n, msg, showNotification } from './ui.js';

const DEBOUNCE_SAVE_DELAY = 300;
const SAVE_STATE_DURATION = 2000;
const EXPORT_FORMAT = 'search-engine-converter-config';
const EXPORT_VERSION = 1;

let configState = defaultConfigState();
let _saveDebounceTimer = null;
let _saveStateTimer = null;

/* ============================================================================
 * INICIALIZACION
 * ============================================================================ */

document.addEventListener('DOMContentLoaded', async function () {
  applyI18n(document);
  renderVersionLabel();

  configState = await loadConfigState();

  renderAll();
  setupStaticListeners();
  initSortableOrder();
});

function renderVersionLabel() {
  const label = document.getElementById('versionLabel');
  if (label && typeof chrome !== 'undefined' && chrome.runtime) {
    label.textContent = 'v' + chrome.runtime.getManifest().version;
  }
}

function getEngines() {
  return getMergedEngines(configState.customEngines);
}

/** Vuelve a renderizar todas las secciones dinamicas. */
function renderAll() {
  renderDefaultEngineOptions();
  applyConfigToControls();
  renderVisibilityCheckboxes();
  renderOrderList();
  renderCustomEngineIconOptions();
  renderCustomEngineList();
}

/* ============================================================================
 * GUARDADO AUTOMATICO
 * ============================================================================ */

/**
 * Autoguardado con debounce y confirmacion visual ("Guardado").
 */
function saveConfiguration() {
  if (_saveDebounceTimer) {
    clearTimeout(_saveDebounceTimer);
  }

  _saveDebounceTimer = setTimeout(() => {
    saveConfigState(configState);
    flashSaveState();
  }, DEBOUNCE_SAVE_DELAY);
}

function flashSaveState() {
  const indicator = document.getElementById('saveState');
  if (!indicator) return;

  indicator.textContent = msg('optSaved');
  indicator.classList.add('visible');

  if (_saveStateTimer) {
    clearTimeout(_saveStateTimer);
  }
  _saveStateTimer = setTimeout(() => {
    indicator.classList.remove('visible');
  }, SAVE_STATE_DURATION);
}

/* ============================================================================
 * MOTOR PREDETERMINADO
 * ============================================================================ */

function renderDefaultEngineOptions() {
  const select = document.getElementById('defaultSearchEngine');
  if (!select) return;

  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }

  const engines = getEngines();
  Object.entries(engines).forEach(([id, engine]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = engine.name;
    select.appendChild(option);
  });

  select.value = normalizeDefaultSearchEngine(
    configState.defaultSearchEngine,
    configState.customEngines
  );
}

/* ============================================================================
 * DOMINIOS
 * ============================================================================ */

function applyConfigToControls() {
  const amazonDomain = document.getElementById('amazonDomain');
  if (amazonDomain) {
    amazonDomain.value = configState.amazonDomain;
  }

  const youtubeDomain = document.getElementById('youtubeDomain');
  if (youtubeDomain) {
    youtubeDomain.value = configState.youtubeDomain;
  }
}

/* ============================================================================
 * VISIBILIDAD
 * ============================================================================ */

/**
 * Checkbox por motor visible. El id del input es 'visible' + EngineId con la
 * primera letra en mayuscula (convencion historica del guardado).
 */
function visibilityCheckboxId(engineId) {
  return 'visible' + engineId.charAt(0).toUpperCase() + engineId.slice(1);
}

function renderVisibilityCheckboxes() {
  const container = document.getElementById('visibilityCheckboxes');
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const engines = getEngines();
  Object.keys(configState.visibleEngines).forEach((engineId) => {
    const engine = engines[engineId];
    if (!engine) return;

    const label = document.createElement('label');
    label.className = 'visibility-item';
    label.htmlFor = visibilityCheckboxId(engineId);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = visibilityCheckboxId(engineId);
    checkbox.checked = configState.visibleEngines[engineId] !== false;
    checkbox.addEventListener('change', function () {
      configState.visibleEngines[engineId] = checkbox.checked;
      renderOrderList();
      saveConfiguration();
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + engine.name));
    container.appendChild(label);
  });
}

/* ============================================================================
 * ORDEN DE BOTONES (drag & drop + teclado)
 * ============================================================================ */

function makeOrderItem(engineId, engine, position, total) {
  const li = document.createElement('li');
  li.className = 'order-item';
  li.setAttribute('data-engine-id', engineId);

  const grip = document.createElement('i');
  grip.className = 'fas fa-grip-lines';
  grip.setAttribute('aria-hidden', 'true');
  li.appendChild(grip);

  const icon = document.createElement('i');
  icon.className = engine.icon;
  icon.style.color = engine.color;
  icon.setAttribute('aria-hidden', 'true');
  li.appendChild(icon);

  const name = document.createElement('span');
  name.className = 'order-item-name';
  name.textContent = engine.name;
  li.appendChild(name);

  const controls = document.createElement('span');
  controls.className = 'order-controls';

  const upButton = document.createElement('button');
  upButton.type = 'button';
  upButton.className = 'order-move';
  upButton.disabled = position === 0;
  upButton.setAttribute('aria-label', msg('optMoveUp') + ' ' + engine.name);
  upButton.textContent = String.fromCharCode(8593); /* flecha ↑: el subset FA no tiene glifos de flecha */
  upButton.addEventListener('click', () => moveEngineInOrder(engineId, -1));

  const downButton = document.createElement('button');
  downButton.type = 'button';
  downButton.className = 'order-move';
  downButton.disabled = position === total - 1;
  downButton.setAttribute('aria-label', msg('optMoveDown') + ' ' + engine.name);
  downButton.textContent = String.fromCharCode(8595); /* flecha ↓ */
  downButton.addEventListener('click', () => moveEngineInOrder(engineId, 1));

  controls.appendChild(upButton);
  controls.appendChild(downButton);
  li.appendChild(controls);

  return li;
}

function renderOrderList() {
  const list = document.getElementById('buttonOrderList');
  if (!list) return;

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  const engines = getEngines();
  const orderedIds = getVisibleEngineIdsInOrder(configState, engines);

  orderedIds.forEach((engineId, index) => {
    list.appendChild(makeOrderItem(engineId, engines[engineId], index, orderedIds.length));
  });

  /* buttonOrder queda normalizado al orden visible real (los ocultos se
     reubicaran al final cuando vuelvan a activarse) */
  configState.buttonOrder = orderedIds.map(engineId => engines[engineId].buttonId);
}

/** Mueve un motor visible una posicion arriba/abajo (fallback de teclado). */
function moveEngineInOrder(engineId, delta) {
  const engines = getEngines();
  const orderedIds = getVisibleEngineIdsInOrder(configState, engines);
  const index = orderedIds.indexOf(engineId);
  const target = index + delta;

  if (index === -1 || target < 0 || target >= orderedIds.length) {
    return;
  }

  orderedIds.splice(target, 0, ...orderedIds.splice(index, 1));
  configState.buttonOrder = orderedIds.map(id => engines[id].buttonId);
  renderOrderList();
  saveConfiguration();
}

/** Arrastre con SortableJS; si no esta disponible, quedan las flechas. */
function initSortableOrder() {
  const list = document.getElementById('buttonOrderList');
  if (!list || typeof Sortable === 'undefined') {
    return;
  }

  Sortable.create(list, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    handle: '.fa-grip-lines',
    onEnd: function () {
      const engines = getEngines();
      const newOrder = Array.from(list.children)
        .map(li => li.getAttribute('data-engine-id'))
        .filter(id => engines[id]);
      configState.buttonOrder = newOrder.map(id => engines[id].buttonId);
      renderOrderList();
      saveConfiguration();
    }
  });
}

/* ============================================================================
 * MOTORES PERSONALIZADOS
 * ============================================================================ */

function renderCustomEngineIconOptions() {
  const select = document.getElementById('customEngineIcon');
  if (!select) return;

  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }

  CUSTOM_ENGINE_ICONS.forEach((iconClass) => {
    const option = document.createElement('option');
    option.value = iconClass;
    option.textContent = iconClass.replace('fas fa-', '');
    select.appendChild(option);
  });
}

function renderCustomEngineList() {
  const list = document.getElementById('customEngineList');
  if (!list) return;

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  if (configState.customEngines.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'order-item empty-item';
    empty.textContent = msg('optNoCustom');
    list.appendChild(empty);
    return;
  }

  configState.customEngines.forEach((engine) => {
    const li = document.createElement('li');
    li.className = 'order-item custom-item';

    const icon = document.createElement('i');
    icon.className = engine.icon;
    icon.style.color = engine.color;
    icon.setAttribute('aria-hidden', 'true');
    li.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'order-item-name';
    name.textContent = engine.name;
    li.appendChild(name);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'custom-delete';
    deleteButton.setAttribute('aria-label', msg('optDeleteCustom', engine.name));
    deleteButton.textContent = String.fromCharCode(215); /* × */
    deleteButton.addEventListener('click', () => removeCustomEngine(engine.id));
    li.appendChild(deleteButton);

    list.appendChild(li);
  });
}

/** Vista previa en vivo de la URL del motor que se esta creando. */
function updateCustomPreview() {
  const preview = document.getElementById('customPreview');
  const urlInput = document.getElementById('customEngineUrl');
  if (!preview || !urlInput) return;

  const raw = urlInput.value.trim();
  if (!raw) {
    preview.textContent = '';
    return;
  }

  const sample = raw.includes('{query}')
    ? raw.replace(/\{query\}/g, encodeURIComponent('termino de ejemplo'))
    : raw;
  preview.textContent = msg('optPreview') + ' ' + sample;
  preview.classList.toggle('invalid', !validateCustomEngine({
    name: 'preview',
    searchUrl: raw
  }));
}

function addCustomEngine(event) {
  if (event) {
    event.preventDefault();
  }

  const nameInput = document.getElementById('customEngineName');
  const urlInput = document.getElementById('customEngineUrl');
  const iconSelect = document.getElementById('customEngineIcon');
  const colorInput = document.getElementById('customEngineColor');

  if (!nameInput || !urlInput) return;

  const validated = validateCustomEngine({
    name: nameInput.value,
    searchUrl: urlInput.value,
    icon: iconSelect ? iconSelect.value : 'fas fa-search',
    color: colorInput ? colorInput.value : '#4285F4'
  });

  if (!validated) {
    showNotification(msg('optCustomInvalid'), 'error');
    return;
  }

  if (configState.customEngines.some(engine => engine.id === validated.id)) {
    showNotification(msg('optCustomDupe'), 'error');
    return;
  }

  configState.customEngines.push(validated);
  configState.visibleEngines[validated.id] = true;

  nameInput.value = '';
  urlInput.value = '';
  updateCustomPreview();

  renderAll();
  saveConfiguration();
  showNotification(msg('optCustomAdded'), 'success');
}

function removeCustomEngine(engineId) {
  configState.customEngines = configState.customEngines.filter(engine => engine.id !== engineId);

  delete configState.visibleEngines[engineId];
  const buttonId = engineId + 'Button';
  configState.buttonOrder = configState.buttonOrder.filter(id => id !== buttonId);

  if (configState.defaultSearchEngine === engineId) {
    configState.defaultSearchEngine = normalizeDefaultSearchEngine(
      null,
      configState.customEngines
    );
  }

  renderAll();
  saveConfiguration();
  showNotification(msg('optCustomRemoved'), 'info');
}

/* ============================================================================
 * COPIA DE SEGURIDAD
 * ============================================================================ */

function exportConfiguration() {
  const exportData = {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    config: configState
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'search-engine-converter-config.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showNotification(msg('optExported'), 'success');
}

function importConfiguration(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      if (!data || data.format !== EXPORT_FORMAT || !data.config) {
        showNotification(msg('optImportBadFormat'), 'error');
        return;
      }

      /* applySavedConfiguration sanea campo a campo; partimos del estado
         actual para no perder campos no presentes en el fichero */
      applySavedConfiguration(configState, data.config);
      renderAll();
      saveConfiguration();
      showNotification(msg('optImported'), 'success');
    } catch (_) {
      showNotification(msg('optImportReadError'), 'error');
    }

    event.target.value = '';
  };
  reader.readAsText(file);
}

/* ============================================================================
 * LISTENERS ESTATICOS
 * ============================================================================ */

function setupStaticListeners() {
  const defaultSelect = document.getElementById('defaultSearchEngine');
  if (defaultSelect) {
    defaultSelect.addEventListener('change', function () {
      configState.defaultSearchEngine = normalizeDefaultSearchEngine(
        this.value,
        configState.customEngines
      );
      saveConfiguration();
    });
  }

  const amazonDomain = document.getElementById('amazonDomain');
  if (amazonDomain) {
    amazonDomain.addEventListener('change', function () {
      configState.amazonDomain = validateDomain('amazon', this.value) ? this.value : 'es';
      saveConfiguration();
    });
  }

  const youtubeDomain = document.getElementById('youtubeDomain');
  if (youtubeDomain) {
    youtubeDomain.addEventListener('change', function () {
      configState.youtubeDomain = validateDomain('youtube', this.value) ? this.value : 'com';
      saveConfiguration();
    });
  }

  const customForm = document.getElementById('customEngineForm');
  if (customForm) {
    customForm.addEventListener('submit', addCustomEngine);
  }

  const urlInput = document.getElementById('customEngineUrl');
  if (urlInput) {
    urlInput.addEventListener('input', updateCustomPreview);
  }

  const exportButton = document.getElementById('exportConfigButton');
  if (exportButton) {
    exportButton.addEventListener('click', exportConfiguration);
  }

  const importButton = document.getElementById('importConfigButton');
  if (importButton) {
    importButton.addEventListener('click', function () {
      const fileInput = document.getElementById('importConfigFile');
      if (fileInput) {
        fileInput.click();
      }
    });
  }

  const fileInput = document.getElementById('importConfigFile');
  if (fileInput) {
    fileInput.addEventListener('change', importConfiguration);
  }
}
