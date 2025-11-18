# SEARCH ENGINE CONVERTER V2.0

Extensión para navegadores basados en Chromium que permite convertir búsquedas entre más de 34 motores diferentes manteniendo los términos exactos de búsqueda. Compatible con Chrome, Brave y Microsoft Edge.

[![Versión](https://img.shields.io/badge/versión-2.0-blue)](https://github.com/686f6c61/chrome-search-engine-converter)
[![Chrome](https://img.shields.io/badge/Chrome-compatible-brightgreen)](https://github.com/686f6c61/chrome-search-engine-converter)
[![Brave](https://img.shields.io/badge/Brave-compatible-brightgreen)](https://github.com/686f6c61/chrome-search-engine-converter)
[![Edge](https://img.shields.io/badge/Edge-compatible-brightgreen)](https://github.com/686f6c61/chrome-search-engine-converter)

---

## DESCRIPCIÓN

Search Engine Converter es una extensión ligera desarrollada con JavaScript vanilla y Manifest V3 que facilita la navegación entre diferentes motores de búsqueda sin perder el contexto de la consulta. La extensión detecta automáticamente la búsqueda actual y permite cambiar al motor deseado con un solo clic.

La versión 2.0 representa una reescritura completa del proyecto, eliminando dependencias innecesarias y optimizando el rendimiento. Se ha reducido el tamaño en un 26% respecto a la versión anterior, mientras se añaden nuevas funcionalidades enfocadas en la productividad del usuario.

---

## CAPTURAS DE PANTALLA

### Interfaz Principal
![Popup Principal](assets/01%20Search%20Engine%20Converter.png)

Vista principal mostrando el modo dual Convertir/Buscar con los motores de búsqueda disponibles en grid responsive.

### Panel de Configuración
![Configuración](assets/02%20Configuracion.png)

Panel de configuración con opciones de dominios regionales y selección de motores visibles.

### Orden Personalizado
![Orden de Botones](assets/03%20Orden%20botones.png)

Sistema de drag-and-drop para personalizar el orden de los motores en el popup.

### Modo Búsqueda Rápida
![Búsqueda Rápida](assets/04%20Buscador.png)

Modo búsqueda con campo de entrada y selector de motor filtrado por motores visibles.

---

## CARACTERÍSTICAS PRINCIPALES

### Novedades de la Versión 2.0

La versión 2.0 introduce mejoras significativas en la experiencia de usuario y el rendimiento:

**Búsqueda Rápida con Modo Dual**
Sistema de dos modos que permite alternar entre conversión de búsquedas existentes y realización de búsquedas nuevas directamente desde el popup. El modo búsqueda incluye un campo de entrada con autocompletado y selector de motor.

**Sistema de Copiar URL**
Función que permite copiar la URL convertida al portapapeles sin necesidad de abrir una nueva pestaña. Incluye feedback visual y notificaciones de confirmación.

**Atajos de Teclado**
Implementación completa de atajos de teclado para navegación rápida. Soporta Alt+1-9 para conversión directa, Ctrl+K para activar búsqueda rápida y ESC para cerrar el popup.

**Interfaz Mejorada**
Grid responsive que se adapta automáticamente al tamaño de la ventana, mostrando entre 2 y 4 columnas. Incluye animaciones ripple, transiciones suaves y estados visuales mejorados.

**Motores con IA**
Incorporación de cuatro nuevos motores de búsqueda especializados en inteligencia artificial: Perplexity AI, Kagi, SearX y You.com.

### Funcionalidades Core

**Conversión Instantánea**
Detección automática del motor de búsqueda actual y extracción de los términos de búsqueda. Soporta más de 34 motores diferentes con sus variantes regionales.

**Menú Contextual**
Integración con el menú contextual del navegador que permite buscar texto seleccionado en cualquier motor mediante clic derecho.

**Configuración Avanzada**
Panel de configuración completo que permite personalizar dominios regionales, visibilidad de motores, orden de botones mediante drag-and-drop y motor predeterminado para búsquedas rápidas.

**Detección de Contexto**
Reconocimiento automático de búsquedas de imágenes, manteniendo el contexto al realizar la conversión entre motores que soporten esta funcionalidad.

**Rendimiento Optimizado**
Extensión desarrollada con JavaScript vanilla sin frameworks pesados. Tamaño total de 111KB con validaciones robustas de la Chrome Extension API.

---

## MOTORES SOPORTADOS

La extensión soporta más de 34 motores de búsqueda organizados en las siguientes categorías:

### Motores Generalistas

- **Google** - Motor de búsqueda más utilizado a nivel mundial
- **Brave Search** - Motor privado sin rastreadores ni anuncios personalizados
- **DuckDuckGo** - Motor enfocado en privacidad sin perfiles de usuario
- **Bing** - Motor de búsqueda de Microsoft
- **Startpage** - Proxy de Google con privacidad mejorada
- **Ecosia** - Motor ecológico que planta árboles con las búsquedas
- **Qwant** - Motor europeo que respeta la privacidad
- **Yandex** - Motor de búsqueda ruso
- **Baidu** - Motor de búsqueda chino

### Motores con Inteligencia Artificial

Nuevos en la versión 2.0:

- **Perplexity AI** - Motor conversacional con capacidades de IA generativa
- **Kagi** - Motor premium sin publicidad con mejoras mediante IA
- **You.com** - Motor con integración de IA para respuestas contextuales
- **SearX** - Meta-motor privado y descentralizado de código abierto

### Redes Sociales

- **Twitter/X** - Búsqueda en publicaciones y perfiles
- **Reddit** - Búsqueda en comunidades y discusiones
- **LinkedIn** - Red profesional y búsqueda de empleo
- **Pinterest** - Búsqueda visual de contenido creativo
- **TikTok** - Búsqueda de videos cortos

### Contenido Multimedia

- **YouTube** - Plataforma de videos con soporte multi-región
- **Spotify** - Búsqueda de música y podcasts
- **SoundCloud** - Plataforma de música independiente
- **Vimeo** - Videos de alta calidad

### Comercio Electrónico

- **Amazon** - Búsqueda de productos con soporte para múltiples dominios regionales (.es, .com, .co.uk, .de, .fr, .it)
- **eBay** - Subastas y comercio de productos nuevos y usados
- **AliExpress** - Plataforma de comercio internacional
- **Etsy** - Mercado de productos artesanales y vintage

### Desarrollo de Software

- **GitHub** - Búsqueda de repositorios y código fuente
- **GitLab** - Plataforma alternativa de control de versiones
- **Stack Overflow** - Red de preguntas y respuestas técnicas

### Recursos Académicos

- **Wikipedia** - Enciclopedia colaborativa multilingüe
- **Google Scholar** - Búsqueda de literatura académica y científica
- **Archive.org** - Biblioteca digital y archivo histórico de internet
- **WolframAlpha** - Motor computacional y base de conocimiento

---

## INSTALACIÓN

### Requisitos Previos

- Navegador basado en Chromium (Chrome 88+, Brave 1.20+, Edge 88+)
- Git (opcional, para clonar el repositorio)

### Instalación mediante Modo Desarrollador

Este método es el recomendado para pruebas y desarrollo:

1. **Obtener el código fuente**
   ```bash
   git clone https://github.com/686f6c61/chrome-search-engine-converter.git
   cd chrome-search-engine-converter
   ```

2. **Acceder al gestor de extensiones**
   - Chrome: Navegar a `chrome://extensions/`
   - Brave: Navegar a `brave://extensions/`
   - Edge: Navegar a `edge://extensions/`

3. **Activar el modo desarrollador**
   Localizar el interruptor "Modo de desarrollador" en la esquina superior derecha de la página y activarlo.

4. **Cargar la extensión**
   - Hacer clic en el botón "Cargar extensión sin empaquetar"
   - Navegar hasta la carpeta del repositorio clonado
   - Seleccionar la carpeta `extension`
   - Confirmar la selección

5. **Verificar la instalación**
   La extensión debería aparecer en la lista con su icono. El icono también será visible en la barra de herramientas del navegador.

### Instalación mediante Paquete ZIP

Método alternativo para distribución:

```bash
cd extension
zip -r ../search-engine-converter-v2.0.zip .
```

Luego arrastrar el archivo ZIP generado a la página `chrome://extensions/` con el modo desarrollador activado.

---

## USO

### Conversión de Búsquedas Existentes

Modo principal de operación para convertir búsquedas ya realizadas:

1. Realizar una búsqueda en cualquier motor soportado
2. Hacer clic en el icono de la extensión en la barra de herramientas
3. El popup mostrará el motor detectado y los términos de búsqueda
4. Seleccionar el motor de destino haciendo clic en su botón
5. Se abrirá una nueva pestaña con la búsqueda convertida

La extensión detecta automáticamente si la búsqueda actual es de imágenes y mantiene ese contexto al realizar la conversión.

### Búsqueda Rápida (Modo Búsqueda)

Nueva funcionalidad en v2.0 que permite realizar búsquedas sin estar en una página de resultados:

1. Hacer clic en el icono de la extensión
2. Activar el modo "Buscar" mediante el toggle superior
3. Introducir los términos de búsqueda en el campo de texto
4. Seleccionar el motor deseado del menú desplegable
5. Presionar Enter o hacer clic fuera del campo

El dropdown muestra únicamente los motores que has marcado como visibles en la configuración.

### Búsqueda desde Menú Contextual

Método rápido para buscar texto seleccionado:

1. Seleccionar texto en cualquier página web
2. Hacer clic derecho sobre la selección
3. En el menú contextual, seleccionar "Buscar [texto] con..."
4. Elegir el motor de búsqueda del submenú
5. Se abrirá una nueva pestaña con los resultados

### Copiar URL sin Abrir Pestaña

Funcionalidad útil para compartir o guardar búsquedas:

1. Estando en una página de búsqueda, abrir el popup
2. Pasar el cursor sobre el botón del motor deseado
3. Aparecerá un icono de copiar en la esquina superior derecha del botón
4. Hacer clic en el icono de copiar
5. La URL convertida se copiará al portapapeles
6. Aparecerá una notificación de confirmación

### Atajos de Teclado

Sistema completo de navegación mediante teclado:

- **Alt + 1 a 9**: Convierte la búsqueda actual al motor correspondiente según su posición en el grid (Alt+1 para el primero, Alt+2 para el segundo, etc.)
- **Ctrl + K**: Activa el modo búsqueda rápida y pone el foco en el campo de entrada
- **ESC**: Cierra el popup de la extensión
- **Enter**: Ejecuta la búsqueda rápida cuando el campo de entrada tiene el foco

### Panel de Configuración

Acceso completo a las opciones de personalización:

**Dominios Regionales**
Configuración de dominios específicos para Amazon (España, USA, Reino Unido, Alemania, Francia, Italia) y YouTube (Global, España).

**Motor Predeterminado**
Selección del motor que se utilizará por defecto en las búsquedas desde el menú contextual.

**Visibilidad de Motores**
Lista de checkboxes que permite mostrar u ocultar motores específicos. Los cambios se reflejan inmediatamente en el grid de botones y en el dropdown del modo búsqueda.

**Orden de Botones**
Lista ordenable mediante drag-and-drop que permite personalizar la posición de cada motor en el grid. El orden se guarda automáticamente al soltar el elemento.

---

## ESTRUCTURA DEL PROYECTO

```
chrome-search-engine-converter/
├── extension/
│   ├── manifest.json          # Manifest V3 con permisos mínimos
│   ├── background.js          # Service Worker (175 líneas)
│   ├── popup.html             # Interfaz del popup
│   ├── popup.js               # Lógica principal (993 líneas)
│   ├── Sortable.min.js        # Librería para drag-and-drop
│   ├── DOCUMENTATION.md       # Documentación técnica interna
│   └── images/
│       ├── icon128.png
│       └── icon256.png
├── README.md                  # Este archivo
├── CHANGELOG.md               # Historial de versiones
├── INSTALL.md                 # Guía de instalación detallada
├── PRIVACY_POLICY.md          # Política de privacidad
└── assets/                    # Recursos adicionales
```

### Arquitectura Técnica

**Manifest V3**
La extensión utiliza la última versión del sistema de manifiestos de Chrome, que ofrece mejor seguridad y rendimiento. Los Service Workers reemplazan a los background scripts tradicionales.

**JavaScript Vanilla**
Sin dependencias de frameworks como React, Vue o Angular. Esto reduce significativamente el tamaño del bundle y mejora los tiempos de carga.

**Storage API**
Utilización de `chrome.storage.local` para persistencia de configuración. Incluye validaciones robustas y manejo de errores para contextos donde la API no está disponible.

**Tabs API**
Gestión de pestañas mediante `chrome.tabs` con fallbacks a `window.open` cuando la API no está disponible o falla.

**Context Menus API**
Creación dinámica de menús contextuales mediante `chrome.contextMenus` con soporte para más de 15 motores en el submenú.

---

## PRIVACIDAD Y SEGURIDAD

### Política de Privacidad

La extensión ha sido diseñada con privacidad por defecto:

**Sin Recopilación de Datos**
No se recopila, almacena ni transmite ningún tipo de información personal, términos de búsqueda o historial de navegación.

**Funcionamiento Local**
Toda la lógica se ejecuta localmente en el navegador. No hay servidores externos, APIs de terceros ni conexiones salientes.

**Almacenamiento Local**
La única información guardada es la configuración del usuario (dominios, visibilidad de motores, orden de botones) mediante `chrome.storage.local`.

**Sin Analíticas**
No se utiliza Google Analytics, Mixpanel ni ningún otro servicio de analítica o telemetría.

**Código Abierto**
El código fuente completo está disponible públicamente para auditoría y verificación.

### Permisos Solicitados

La extensión solicita únicamente cuatro permisos esenciales:

- **activeTab**: Necesario para leer la URL de la pestaña activa y detectar el motor de búsqueda actual
- **contextMenus**: Requerido para añadir opciones al menú contextual del navegador
- **storage**: Utilizado exclusivamente para guardar la configuración del usuario de forma local
- **tabs**: Necesario para abrir nuevas pestañas con las búsquedas convertidas

### Content Security Policy

Política de seguridad de contenido restrictiva implementada en el manifest:

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'none'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data:;"
  }
}
```

Esta configuración previene la ejecución de código no autorizado y limita los recursos externos a los estrictamente necesarios (Font Awesome e iconos).

---

## DESARROLLO

### Configuración del Entorno

Requisitos para contribuir al proyecto:

- Node.js no es necesario (JavaScript vanilla)
- Editor de código con soporte para JavaScript ES6+
- Navegador Chromium para pruebas
- Git para control de versiones

### Flujo de Trabajo Local

1. Clonar el repositorio
   ```bash
   git clone https://github.com/686f6c61/chrome-search-engine-converter.git
   cd chrome-search-engine-converter
   ```

2. Realizar cambios en la carpeta `extension`

3. Recargar la extensión
   - Navegar a `chrome://extensions/`
   - Hacer clic en el icono de recarga de la extensión
   - O usar Ctrl+R en la página de extensiones

4. Probar los cambios
   - Abrir el popup y verificar la funcionalidad
   - Inspeccionar con DevTools (clic derecho en popup → Inspeccionar)
   - Verificar la consola del Service Worker

### Guía de Contribución

Proceso recomendado para contribuir:

1. **Fork del repositorio**
   Crear una copia del repositorio en tu cuenta de GitHub.

2. **Crear rama de feature**
   ```bash
   git checkout -b feature/descripcion-breve
   ```

3. **Realizar cambios**
   - Mantener la consistencia del código existente
   - Añadir comentarios para lógica compleja
   - Actualizar documentación si es necesario

4. **Commit con mensaje descriptivo**
   ```bash
   git commit -m "Añade funcionalidad X para mejorar Y"
   ```

5. **Push a tu fork**
   ```bash
   git push origin feature/descripcion-breve
   ```

6. **Abrir Pull Request**
   Describir los cambios realizados y el problema que resuelven.

### Estándares de Código

- Utilizar JavaScript ES6+ con sintaxis moderna
- Preferir `const` sobre `let`, evitar `var`
- Usar funciones flecha para callbacks
- Implementar manejo de errores con try-catch
- Validar disponibilidad de Chrome APIs antes de usarlas
- Comentar funciones complejas con propósito y parámetros
- Mantener líneas de menos de 100 caracteres cuando sea posible

---

## COMPARACIÓN DE VERSIONES

### Cambios entre v1.2 y v2.0

| Aspecto | v1.2 | v2.0 | Mejora |
|---------|------|------|--------|
| Tamaño total | 150KB | 111KB | -26% |
| Archivos JavaScript | 7 | 3 | -57% |
| Líneas de código | 1771 | 993 | -44% |
| Motores soportados | 30 | 34 | +13% |
| Funcionalidad IA integrada | Sí | No | Simplificación |
| Búsqueda rápida | No | Sí | Nueva |
| Copiar URL | No | Sí | Nueva |
| Atajos de teclado | No | Sí (6 atajos) | Nueva |
| Animaciones | Básicas | Avanzadas | Mejorada |
| Grid responsive | 2 columnas | 2-4 columnas | Mejorada |
| Permisos requeridos | 6 + hosts | 4 | -33% |
| Dependencias externas | 4 módulos | 1 módulo | -75% |
| Complejidad | Alta | Media | Reducida |

### Funcionalidades Eliminadas

**Sistema de IA con OpenAI**
Se eliminó la integración completa con OpenAI que permitía captura de pantalla y análisis mediante GPT-4. Esto incluye:

- Captura selectiva de áreas de pantalla
- Análisis de imágenes con Vision API
- Cifrado AES-GCM de claves API
- Sistema de rate limiting
- Módulos de sanitización HTML

**Razones de la eliminación:**
- Complejidad innecesaria para el caso de uso principal
- Dependencias pesadas (crypto-utils, sanitizer, rate-limiter)
- Permisos adicionales requeridos (scripting, host_permissions)
- Costos de API para los usuarios
- Superficie de ataque ampliada

### Funcionalidades Añadidas

**Sistema de Búsqueda Rápida**
Modo dual que permite alternar entre conversión de búsquedas existentes y realización de nuevas búsquedas desde el popup.

**Sistema de Copiar URL**
Copia la URL convertida al portapapeles sin abrir nueva pestaña, útil para compartir o guardar búsquedas.

**Atajos de Teclado Completos**
Seis atajos implementados para navegación rápida sin uso del ratón.

**Motores con IA**
Cuatro nuevos motores especializados: Perplexity AI, Kagi, SearX y You.com.

**Grid Responsive Mejorado**
Sistema adaptativo que muestra entre 2 y 4 columnas según el espacio disponible.

**Animaciones y Efectos**
Animaciones ripple en botones, transiciones suaves y feedback visual mejorado.

---

## SOLUCIÓN DE PROBLEMAS

### La extensión no detecta la búsqueda

**Síntoma**: El popup muestra "No se detectó ninguna búsqueda" o los botones están deshabilitados.

**Causas posibles**:
- La página actual no es una página de resultados de búsqueda reconocida
- El motor de búsqueda utiliza un formato de URL no estándar
- Estás en una página protegida (chrome://, about://, file://)

**Soluciones**:
- Verificar que estás en una página de resultados válida
- Usar el modo "Buscar" en su lugar para búsquedas nuevas
- Reportar el motor no soportado como issue en GitHub

### Los botones no aparecen en el popup

**Síntoma**: El grid de botones está vacío o muestra muy pocos motores.

**Causa**: Todos o la mayoría de motores están ocultos en la configuración.

**Solución**:
1. Abrir el panel de configuración
2. En la sección "Motores visibles en el popup"
3. Marcar los checkboxes de los motores deseados
4. Hacer clic en "Guardar"
5. Cerrar y reabrir el popup

### El dropdown del modo búsqueda está vacío

**Síntoma**: Al activar el modo "Buscar", el selector de motor no muestra opciones.

**Causa**: No hay motores marcados como visibles en la configuración.

**Solución**: Mismo procedimiento que el problema anterior. El dropdown muestra únicamente los motores visibles.

### Error al cargar la extensión

**Síntoma**: "No se pudo cargar el manifiesto" o errores de carga en `chrome://extensions/`.

**Causas posibles**:
- Carpeta incorrecta seleccionada
- Archivos modificados o corruptos
- manifest.json con errores de sintaxis

**Soluciones**:
1. Verificar que seleccionaste la carpeta `extension`, no la raíz del repositorio
2. Comprobar que `manifest.json` existe en la raíz de la carpeta seleccionada
3. Revisar la consola de errores en `chrome://extensions/` para detalles específicos
4. Clonar nuevamente el repositorio si los archivos están corruptos

### Las búsquedas de imágenes no se convierten correctamente

**Síntoma**: Al convertir una búsqueda de imágenes, el motor de destino muestra resultados generales.

**Causa**: El motor de destino no soporta búsqueda de imágenes o usa un formato diferente.

**Motores que soportan imágenes**:
- Google (tbm=isch)
- Bing (/images/search)
- Brave (/images)
- DuckDuckGo (iax=images)
- Startpage (cat=images)
- Ecosia (/images)
- Qwant (t=images)
- Yandex (/images/search)
- Baidu (/image)

### La configuración no se guarda

**Síntoma**: Los cambios en la configuración se pierden al cerrar el popup.

**Causa**: Problema con `chrome.storage.local` o falta hacer clic en "Guardar".

**Soluciones**:
1. Asegurarse de hacer clic en el botón "Guardar" después de realizar cambios
2. Verificar que no hay errores en la consola del popup (F12)
3. Comprobar que el permiso `storage` está otorgado en `chrome://extensions/`
4. Intentar recargar la extensión

---

## LICENCIA

Este proyecto está licenciado bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

```
MIT License

Copyright (c) 2024 @686f6c61

Se concede permiso, libre de cargos, a cualquier persona que obtenga una copia
de este software y de los archivos de documentación asociados (el "Software"),
para utilizar el Software sin restricción, incluyendo sin limitación los derechos
a usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar, y/o
vender copias del Software, y a permitir a las personas a las que se les
proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones...
```

---

## AUTOR Y CONTACTO

**Desarrollador**: [@686f6c61](https://github.com/686f6c61)

**Repositorio**: [chrome-search-engine-converter](https://github.com/686f6c61/chrome-search-engine-converter)

### Reportar Problemas

Para reportar bugs, solicitar features o hacer preguntas:

1. Verificar que el problema no esté ya reportado en [Issues](https://github.com/686f6c61/chrome-search-engine-converter/issues)
2. Abrir un nuevo issue con etiqueta apropiada (bug, enhancement, question)
3. Incluir información detallada:
   - Versión de la extensión
   - Navegador y versión
   - Pasos para reproducir el problema
   - Comportamiento esperado vs actual
   - Capturas de pantalla si aplica

### Recursos Adicionales

- [Guía de instalación completa](INSTALL.md)
- [Historial de cambios](CHANGELOG.md)
- [Política de privacidad](PRIVACY_POLICY.md)
- [Documentación técnica interna](extension/DOCUMENTATION.md)

---

**Desarrollado para la comunidad de desarrolladores que valoran la privacidad, el rendimiento y el código abierto.**
