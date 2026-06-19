# Changelog

## [2.2.0] - 2026-06-19

### Añadido
- Modo oscuro automático (`prefers-color-scheme: dark`) con `<meta name="color-scheme">`
- Atajos de teclado globales (`chrome.commands`): Ctrl/Cmd+Shift+S convierte al motor predeterminado sin abrir popup
- Exportar/importar configuración como JSON para reinstalaciones o migraciones
- Motores personalizados del usuario: formulario para añadir motores propios con validación y sanitización
- Integración con omnibox: escribir `sc <término>` en la barra de direcciones, con sintaxis `sc <término> en <motor>`
- Badge dinámico en el icono: muestra la inicial del motor detectado en la pestaña activa
- `chrome.runtime.setUninstallURL` para captar feedback al desinstalar
- Internacionalización (i18n) con `_locales/es/` y `_locales/en/` en manifest
- `SECURITY.md` con política de reporte de vulnerabilidades
- `CONTRIBUTING.md` con guía de contribución
- Dependabot para dependencias npm y GitHub Actions
- ESLint 9 con flat config (reglas de seguridad: no-eval, no-implied-eval, eqeqeq, no-undef)
- Script `build-zip.mjs` que genera ZIP válido para Chrome Web Store
- Tests para background.js (menus, badge, omnibox, atajos, uninstall) con mocks de chrome.*
- Tests para motores personalizados (validateCustomEngine, buildCustomEnginesMap, getMergedEngines)

### Corregido
- Atajo Ctrl+K ahora funciona también en macOS (Cmd+K vía `e.metaKey`)
- `detectEngine` usa regex estricto para Amazon (rechaza URLs look-alike como `myamazon.example.com`)
- Estilos inline de popup.html movidos a popup.css (compatibles con CSP `style-src 'self'`)
- `aria-hidden` dinámico en `#configPanel` sincronizado con visibilidad
- `loadConfig` redundante eliminado al final de background.js
- `data:` eliminado de `img-src` en CSP (sin uso real)
- SortableJS actualizado de 1.15.6 a 1.15.7
- `configState` y `query` cambiados de `let` a `const` (prefer-const)
- Parámetro `isImageSearch` renombrado a `useImageSearch` en `buildSearchUrl` (evita shadow de la función global)

### Cambiado
- Migración a ES modules: `import`/`export` en engines.js, background.js y popup.js
- `minimum_chrome_version` subido de 102 a 121 (requerido para ES modules en service worker)
- `manifest.json`: añadido `short_name`, `homepage_url`, `default_locale`
- `name` y `description` del manifest internacionalizados vía `__MSG_*__`
- CI ampliado: lint + syntax + tests + build ZIP + artifact upload
- `.gitignore` ampliado (.DS_Store, *.zip, *.pem, .vscode/)
- `.editorconfig` para consistencia entre editores
- AUDIT movida a `docs/audits/`
- README ampliado con secciones de testing, lint, build y enlaces a docs

### Rendimiento
- Tests ampliados de 57 a 94 (cobertura de engines.js, background.js y custom engines)

## [2.1.1] - 2026-03-05

### Corregido
- Todas las tildes y acentos en textos en español (popup, políticas de privacidad, README)
- Versión en PRIVACY_POLICY.md (de 2.0 a 2.1.0)
- Número de motores en manifest.json (de "30+" a "33")
- Twitter renombrado a "X (Twitter)" con URL actualizada a x.com
- SearX renombrado a SearXNG
- Kagi y SearXNG recategorizados como "Privacidad" en lugar de "IA" en README
- Color de Wikipedia ajustado para mejor contraste (#636466 en lugar de #000000)
- Sincronización entre privacy-policy.html y PRIVACY_POLICY.md

### Accesibilidad
- `role="status"` y `aria-live="polite"` en el indicador de estado
- `role="alert"` en las notificaciones temporales
- `aria-hidden="true"` en todos los iconos de Font Awesome
- `aria-label` en botones de motor de búsqueda, botones de copiar y botón limpiar
- `aria-expanded` y `aria-controls` en el botón de configuración
- `:focus-visible` para todos los elementos interactivos
- Botón de copiar visible con foco de teclado (`:focus-within`)
- `@media (prefers-reduced-motion: reduce)` para desactivar animaciones

### Rendimiento
- Sortable.js reemplazado por Sortable.min.js (de 126 KB a 45 KB, -64%)
- FontAwesome subset con solo los 37 iconos usados (de 273 KB a 6.5 KB, -97%)
- Debounce en saveConfiguration() para reducir escrituras al storage

### Calidad de código
- Tests ampliados de 6 a 57 (cobertura de funciones ~85%)
- Magic numbers extraídos a constantes con nombre
- Valores por defecto de dominio centralizados via DOMAIN_DEFAULTS

## [2.1.0] - 2025-01-18

### Añadido
- 33 motores de búsqueda soportados
- Búsqueda rápida con campo de texto y selector de motor
- Menú contextual mejorado con acción rápida y submenú
- Detección de búsqueda de imágenes
- Botones de copiar URL convertida
- Atajos de teclado (Alt+1-9, Ctrl+K, ESC)
- Drag-and-drop para reordenar motores
- Configuración de dominios regionales (Amazon, YouTube)
- Configuración de motores visibles con checkboxes
- Motor predeterminado para menú contextual
- Content Security Policy restrictiva
- Política de privacidad
