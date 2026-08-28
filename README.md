# Search Engine Converter v2.3.0

Extensión para navegadores Chromium que convierte búsquedas entre 33 motores diferentes manteniendo los términos exactos. Compatible con Chrome, Brave y Edge.

[![Version](https://img.shields.io/badge/version-2.3.0-blue)](https://github.com/686f6c61/chrome-search-engine-converter)
[![Chrome](https://img.shields.io/badge/Chrome-compatible-brightgreen)](https://github.com/686f6c61/chrome-search-engine-converter)
[![Brave](https://img.shields.io/badge/Brave-compatible-brightgreen)](https://github.com/686f6c61/chrome-search-engine-converter)
[![Edge](https://img.shields.io/badge/Edge-compatible-brightgreen)](https://github.com/686f6c61/chrome-search-engine-converter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Capturas de pantalla

### Interfaz principal
![Popup principal](assets/screenshot_1_main.png)

Un único flujo: la caja se autorellena con la búsqueda detectada y la rejilla convierte a cualquier motor. Los primeros nueve botones muestran su atajo Alt+N.

### Búsqueda directa
![Búsqueda directa](assets/screenshot_2_search.png)

Si la pestaña no es una búsqueda, la caja queda vacía y con el foco: escribe y pulsa un motor (o Enter para usar el predeterminado).

### Página de opciones
![Opciones](assets/screenshot_3_config.png)

Toda la configuración vive en su propia página (`options_ui`): motor predeterminado, dominios y visibilidad. Guardado automático, sin botón Guardar.

### Orden personalizable
![Orden de botones](assets/screenshot_4_order.png)

Arrastra para reordenar, o mueve con teclado usando las flechas.

### Todos los motores
![33 motores](assets/screenshot_5_all_engines.png)

Los 33 motores soportados se activan o desactivan individualmente.

---

## Funcionalidades

- **Conversión instantánea**: detecta automáticamente el motor de búsqueda actual, autorellena la caja de búsqueda y permite convertir a cualquier otro motor soportado
- **33 motores**: Google, Brave, DuckDuckGo, Bing, Amazon, YouTube, Wikipedia, X (Twitter), GitHub, GitLab, Stack Overflow, Reddit, Pinterest, Startpage, Ecosia, Qwant, Yandex, Baidu, eBay, AliExpress, Etsy, Google Scholar, Internet Archive, Wolfram Alpha, Spotify, SoundCloud, Vimeo, LinkedIn, TikTok, Perplexity, Kagi, SearXNG, You.com
- **Búsqueda directa**: escribe un término y busca en cualquier motor sin necesidad de navegar a su página; Enter usa el motor predeterminado
- **Menú contextual mejorado**: acción rápida con motor predeterminado + submenú completo para elegir cualquier motor
- **Detección de imágenes**: si estás en búsqueda de imágenes, la conversión mantiene el modo imágenes
- **Copiar URL**: copia la URL convertida al portapapeles sin abrir nueva pestaña
- **Atajos de teclado**: Alt+1-9 conversión directa, Ctrl/Cmd+K búsqueda rápida, ESC cerrar popup
- **Atajos globales**: Ctrl/Cmd+Shift+S convierte la búsqueda actual al motor predeterminado sin abrir el popup (configurable en `chrome://extensions/shortcuts`)
- **Página de opciones**: configuración completa fuera del popup (motor predeterminado, dominios regionales, visibilidad, orden, copia de seguridad y motores personalizados), con autoguardado e indicador visual
- **Interfaz i18n**: todos los textos de la interfaz traducidos al inglés y al español (`chrome.i18n`), como el manifest
- **Personalización**: motores visibles, orden drag-and-drop (con alternativa por teclado), dominios regionales (Amazon, YouTube), pistas Alt+N en los botones
- **Exportar/importar configuración**: guarda tus preferencias como JSON y restáuralas en otra instalación
- **Modo oscuro**: se adapta automáticamente al tema del sistema (`prefers-color-scheme: dark`)
- **Accesibilidad**: navegación completa por teclado, ARIA labels, soporte para lectores de pantalla, respeto a `prefers-reduced-motion`

---

## Instalación

### Desde código fuente (modo desarrollador)

```bash
git clone https://github.com/686f6c61/chrome-search-engine-converter.git
```

1. Abrir `chrome://extensions/` (o `brave://extensions/` o `edge://extensions/`)
2. Activar "Modo de desarrollador"
3. Pulsar "Cargar extensión sin empaquetar"
4. Seleccionar la carpeta `extension/`

### Desde Chrome Web Store

*(Pendiente de publicación)*

---

## Tests

```bash
npm test
```

Ejecuta 108 tests con el runner nativo de Node.js (`node:test`). Los tests verifican el registro de motores, funciones de búsqueda, validación de dominios, detección de motores, saneado de la configuración compartida (popup/opciones) y casos edge (URLs malformadas, dominios inválidos, ids de la cadena de prototipo).

### Cobertura

```bash
npm run test:coverage
```

### Lint

```bash
npm run lint
```

ESLint con reglas de seguridad (no-eval, no-implied-eval, eqeqeq) y prevención de bugs (no-undef, no-redeclare).

### Build del ZIP para Web Store

```bash
npm run build
```

Genera `dist/search-engine-converter-v<version>.zip` con solo el contenido de `extension/`, listo para subir a la Chrome Web Store.

---

## Estructura del proyecto

```
chrome-search-engine-converter/
  .github/
    workflows/
      ci.yml                 # CI: lint + tests + build ZIP + artifact
  extension/
    _locales/
      es/messages.json       # Mensajes en español (i18n)
      en/messages.json       # Mensajes en inglés (i18n)
    manifest.json            # Manifest V3, permisos mínimos, i18n
    engines.js               # Registro centralizado de 33 motores (SSOT)
    background.js            # Service Worker (menú contextual + atajos globales)
    popup.html               # Popup: flujo único detección-búsqueda (esqueleto mínimo)
    popup.js                 # Controlador del popup
    popup.css                # Estilos del popup
    options.html             # Página de opciones (options_ui)
    options.js               # Controlador de opciones (autoguardado, reorden, personalizados)
    options.css              # Estilos de la página de opciones
    config.js                # Estado de configuración compartido (saneado + persistencia)
    ui.js                    # Utilidades de UI compartidas (i18n por atributos, notificaciones)
    Sortable.min.js          # Librería drag-and-drop (local, 45 KB)
    privacy-policy.html      # Política de privacidad (versión Web Store)
    css/
      fontawesome.min.css    # Font Awesome 6 subset (37 iconos, 6.5 KB)
      fonts.css              # Declaraciones @font-face
      ui.css                 # Tokens de color, modo oscuro y notificaciones compartidos
    fonts/
      fa-solid-900.woff2     # Iconos sólidos (subset)
      fa-brands-400.woff2    # Iconos de marcas (subset)
      roboto-{400,500,700}.woff2  # Fuente Roboto
    images/
      icon{16,32,48,128,256}.png  # Iconos en todos los tamaños
  scripts/
    build-zip.mjs            # Empaquetado a ZIP para Web Store
  tests/
    engines.smoke.test.cjs   # Tests de funciones críticas
    engines.custom.test.cjs  # Tests de motores personalizados y regresiones de seguridad
    background.test.cjs      # Tests del service worker con mocks de chrome.*
    config.test.cjs          # Tests del saneado de configuración compartido
  .editorconfig              # Consistencia de indentación entre editores
  .gitignore
  eslint.config.js           # ESLint flat config (reglas de seguridad)
  SECURITY.md                # Política de reporte de vulnerabilidades
  CONTRIBUTING.md            # Guía de contribución
  package.json               # Scripts de validación, lint, build
  LICENSE                    # MIT License
  README.md
  CHANGELOG.md
  PRIVACY_POLICY.md          # Política de privacidad completa
```

### Arquitectura

- **engines.js** es la única fuente de verdad (SSOT) para todos los motores. Define configuración, URLs, patrones de detección y funciones de búsqueda/extracción. Lo consumen `background.js`, `popup.js`, `config.js` y `options.js` como módulos ES.
- **config.js** centraliza carga, saneado y persistencia del estado; popup y opciones comparten la misma lógica de validación.
- **popup.js** genera la rejilla dinámicamente desde el registro combinado (predefinidos + personalizados) y detecta la búsqueda de la pestaña activa.
- **background.js** crea los menús contextuales, gestiona las búsquedas desde el clic derecho y los atajos de teclado globales (`chrome.commands`).
- **_locales/** contiene los mensajes internacionalizados (i18n) en español e inglés. El manifest usa `__MSG_*__` para traducir nombre y descripción.
- **Cero dependencias externas**: fuentes, iconos y Sortable.min.js están empaquetados localmente. No se carga ningún recurso remoto.

---

## Privacidad y seguridad

- **Sin recopilación de datos**: no se envía información a servidores externos
- **100% local**: toda la lógica se ejecuta en el navegador
- **Sin analíticas**: no se usa Google Analytics ni ningún servicio de telemetría
- **Código abierto**: todo el código está disponible para auditoría

### Permisos (4 permisos mínimos)

| Permiso | Uso |
|---------|-----|
| `activeTab` | Lee la URL de la pestaña activa para detectar el motor y extraer el término de búsqueda |
| `contextMenus` | Crea el menú de clic derecho para buscar texto seleccionado |
| `storage` | Guarda preferencias del usuario localmente |
| `omnibox` | Permite buscar desde la barra de direcciones con el keyword `sc` |

### Content Security Policy

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'none'; style-src 'self'; font-src 'self'; img-src 'self';"
}
```

Solo se permite cargar recursos locales (`'self'`). Sin `unsafe-inline`, sin `data:`, sin CDN externos.

---

## Motores soportados

| Categoría | Motores |
|-----------|---------|
| Generalistas | Google, Brave, DuckDuckGo, Bing, Startpage, Ecosia, Qwant, Yandex, Baidu |
| IA | Perplexity, You.com |
| Privacidad | Kagi, SearXNG, Startpage |
| Redes sociales | X (Twitter), Reddit, LinkedIn, Pinterest, TikTok |
| Multimedia | YouTube, Spotify, SoundCloud, Vimeo |
| Comercio | Amazon, eBay, AliExpress, Etsy |
| Desarrollo | GitHub, GitLab, Stack Overflow |
| Académico | Wikipedia, Google Scholar, Internet Archive, Wolfram Alpha |

---

## Licencia

[MIT License](LICENSE) - [@686f6c61](https://github.com/686f6c61)

## Enlaces

- [Política de privacidad](PRIVACY_POLICY.md)
- [Changelog](CHANGELOG.md)
- [Guía de contribución](CONTRIBUTING.md)
- [Política de seguridad](SECURITY.md)
