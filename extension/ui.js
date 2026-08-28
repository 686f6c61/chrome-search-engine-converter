/**
 * ============================================================================
 * ui.js - Utilidades de interfaz compartidas (popup y options)
 * ============================================================================
 *
 * - applyI18n(): traduce el DOM estatico mediante atributos data-i18n*,
 *   usando chrome.i18n.getMessage. Nunca toca innerHTML.
 * - showNotification(): toast temporal construido con createElement/textContent.
 *
 * @file        ui.js
 * @author      @686f6c61
 * @license     MIT
 * ============================================================================
 */

const NOTIFICATION_DISPLAY_DURATION = 3000;
const NOTIFICATION_FADE_DURATION = 300;

/**
 * Traduce los elementos con atributos data-i18n, data-i18n-title,
 * data-i18n-placeholder y data-i18n-aria.
 *
 * @param {Document|HTMLElement} [root=document] - raiz donde buscar
 */
export function applyI18n(root = document) {
  const translate = (key) =>
    typeof chrome !== 'undefined' && chrome.i18n
      ? chrome.i18n.getMessage(key)
      : '';

  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const message = translate(el.getAttribute('data-i18n'));
    if (message) {
      el.textContent = message;
    }
  });

  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const message = translate(el.getAttribute('data-i18n-title'));
    if (message) {
      el.setAttribute('title', message);
    }
  });

  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const message = translate(el.getAttribute('data-i18n-placeholder'));
    if (message) {
      el.setAttribute('placeholder', message);
    }
  });

  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const message = translate(el.getAttribute('data-i18n-aria'));
    if (message) {
      el.setAttribute('aria-label', message);
    }
  });
}

/**
 * Devuelve un mensaje i18n con placeholders, o una cadena vacia si no existe.
 *
 * @param {string} key - clave del mensaje
 * @param {string|Array<string>} [substitutions] - valores para $1..$n
 * @returns {string}
 */
export function msg(key, substitutions) {
  if (typeof chrome === 'undefined' || !chrome.i18n) {
    return '';
  }
  return chrome.i18n.getMessage(key, substitutions);
}

/**
 * Muestra una notificacion temporal en la esquina superior derecha.
 *
 * @param {string} message - texto a mostrar
 * @param {string} [type='info'] - 'info' | 'success' | 'error'
 */
export function showNotification(message, type = 'info') {
  let container = document.getElementById('notification-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.className = 'notification notification-' + type;
  notification.setAttribute('role', 'alert');
  notification.textContent = message;

  container.appendChild(notification);
  /* Forzar reflow para que la transicion de opacidad se aplique */
  void notification.offsetWidth;
  notification.classList.add('visible');

  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => {
      if (notification.parentNode) {
        container.removeChild(notification);
      }
    }, NOTIFICATION_FADE_DURATION);
  }, NOTIFICATION_DISPLAY_DURATION);
}
