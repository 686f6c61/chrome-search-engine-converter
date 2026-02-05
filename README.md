# Search Engine Converter v2.0

Extension para navegadores Chromium que convierte busquedas entre mas de 33 motores diferentes manteniendo los terminos exactos. Compatible con Chrome, Brave y Edge.

[![Version](https://img.shields.io/badge/version-2.0-blue)](https://github.com/686f6c61/chrome-search-engine-converter)
[![Chrome](https://img.shields.io/badge/Chrome-compatible-brightgreen)](https://github.com/686f6c61/chrome-search-engine-converter)
[![Brave](https://img.shields.io/badge/Brave-compatible-brightgreen)](https://github.com/686f6c61/chrome-search-engine-converter)
[![Edge](https://img.shields.io/badge/Edge-compatible-brightgreen)](https://github.com/686f6c61/chrome-search-engine-converter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Capturas de pantalla

### Interfaz principal
![Popup principal](store/screenshot_1_main.png)

Vista principal con motor detectado y botones de conversion en grid de 2 columnas.

### Busqueda rapida
![Busqueda rapida](store/screenshot_2_search.png)

Modo busqueda con campo de texto y selector de motor para buscar directamente.

### Configuracion
![Configuracion](store/screenshot_3_config.png)

Panel de configuracion con dominios regionales, visibilidad de motores y checkboxes individuales.

### Orden personalizable
![Orden de botones](store/screenshot_4_order.png)

Drag-and-drop para reordenar los motores en el popup.

### Todos los motores
![33 motores](store/screenshot_5_all_engines.png)

Los 33 motores de busqueda soportados.

---

## Funcionalidades

- **Conversion instantanea**: detecta automaticamente el motor de busqueda actual y permite convertir a cualquier otro motor soportado
- **33 motores**: Google, Brave, DuckDuckGo, Bing, Amazon, YouTube, Wikipedia, Twitter/X, GitHub, GitLab, Stack Overflow, Reddit, Pinterest, Startpage, Ecosia, Qwant, Yandex, Baidu, eBay, AliExpress, Etsy, Google Scholar, Internet Archive, Wolfram Alpha, Spotify, SoundCloud, Vimeo, LinkedIn, TikTok, Perplexity, Kagi, SearX, You.com
- **Busqueda rapida**: escribe un termino y busca en cualquier motor sin necesidad de navegar a su pagina
- **Menu contextual**: selecciona texto, clic derecho y busca en el motor que prefieras
- **Deteccion de imagenes**: si estas en busqueda de imagenes, la conversion mantiene el modo imagenes
- **Copiar URL**: copia la URL convertida al portapapeles sin abrir nueva pestana
- **Atajos de teclado**: Alt+1-9 conversion directa, Ctrl+K busqueda rapida, ESC cerrar popup
- **Personalizacion**: motores visibles, orden drag-and-drop, dominios regionales (Amazon, YouTube)

---

## Instalacion

### Desde codigo fuente (modo desarrollador)

```bash
git clone https://github.com/686f6c61/chrome-search-engine-converter.git
```

1. Abrir `chrome://extensions/` (o `brave://extensions/` o `edge://extensions/`)
2. Activar "Modo de desarrollador"
3. Pulsar "Cargar extension sin empaquetar"
4. Seleccionar la carpeta `extension/`

### Desde Chrome Web Store

*(Pendiente de publicacion)*

---

## Estructura del proyecto

```
chrome-search-engine-converter/
  extension/
    manifest.json           # Manifest V3, permisos minimos
    engines.js              # Registro centralizado de 33 motores (SSOT)
    background.js           # Service Worker (menu contextual)
    popup.html              # Interfaz del popup (esqueleto minimo)
    popup.js                # Controlador del popup (genera HTML dinamico)
    popup.css               # Estilos del popup
    Sortable.js             # Libreria drag-and-drop (local, sin minificar)
    privacy-policy.html     # Politica de privacidad
    css/
      fontawesome.min.css   # Font Awesome 6 (local)
      fonts.css             # Declaraciones @font-face
    fonts/
      fa-solid-900.woff2    # Iconos solidos
      fa-brands-400.woff2   # Iconos de marcas
      roboto-{400,500,700}.woff2  # Fuente Roboto
    images/
      icon{16,32,48,128,256}.png  # Iconos en todos los tamanos
  store/                    # Assets para Chrome Web Store
  LICENSE                   # MIT License
  README.md
```

### Arquitectura

- **engines.js** es la unica fuente de verdad (SSOT) para todos los motores. Define configuracion, URLs, patrones de deteccion y funciones de busqueda/extraccion. Lo consumen tanto `background.js` como `popup.js` via `importScripts()` y `<script>`.
- **popup.js** genera todo el HTML dinamicamente desde `SEARCH_ENGINES` - botones, checkboxes, selects, lista de orden.
- **background.js** crea los menus contextuales y gestiona las busquedas desde el clic derecho.
- **Cero dependencias externas**: fuentes, iconos y Sortable.js estan empaquetados localmente. No se carga ningun recurso remoto.

---

## Privacidad y seguridad

- **Sin recopilacion de datos**: no se envia informacion a servidores externos
- **100% local**: toda la logica se ejecuta en el navegador
- **Sin analiticas**: no se usa Google Analytics ni ningun servicio de telemetria
- **Codigo abierto**: todo el codigo esta disponible para auditoria

### Permisos (3 permisos minimos)

| Permiso | Uso |
|---------|-----|
| `activeTab` | Lee la URL de la pestana activa para detectar el motor y extraer el termino de busqueda |
| `contextMenus` | Crea el menu de clic derecho para buscar texto seleccionado |
| `storage` | Guarda preferencias del usuario localmente |

### Content Security Policy

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'none'; style-src 'self'; font-src 'self'; img-src 'self' data:;"
}
```

Solo se permite cargar recursos locales (`'self'`). Sin `unsafe-inline`, sin CDN externos.

---

## Motores soportados

| Categoria | Motores |
|-----------|---------|
| Generalistas | Google, Brave, DuckDuckGo, Bing, Startpage, Ecosia, Qwant, Yandex, Baidu |
| IA | Perplexity, Kagi, SearX, You.com |
| Redes sociales | Twitter/X, Reddit, LinkedIn, Pinterest, TikTok |
| Multimedia | YouTube, Spotify, SoundCloud, Vimeo |
| Comercio | Amazon, eBay, AliExpress, Etsy |
| Desarrollo | GitHub, GitLab, Stack Overflow |
| Academico | Wikipedia, Google Scholar, Internet Archive, Wolfram Alpha |

---

## Licencia

[MIT License](LICENSE) - [@686f6c61](https://github.com/686f6c61)

Politica de privacidad: [privacy-policy.html](extension/privacy-policy.html)
