# Search Engine Converter - Politica de privacidad

**Ultima actualizacion**: 5 de febrero de 2026
**Version de la extension**: 2.0
**Desarrollador**: [@686f6c61](https://github.com/686f6c61)

---

## 1. Introduccion

Search Engine Converter es una extension de navegador de codigo abierto que permite convertir busquedas entre mas de 33 motores de busqueda diferentes. Esta politica de privacidad describe de forma transparente como la extension maneja (o no maneja) los datos del usuario.

La extension esta disponible como software libre bajo licencia MIT y su codigo fuente completo puede ser auditado en [GitHub](https://github.com/686f6c61/chrome-search-engine-converter).

---

## 2. Datos recopilados

**Esta extension no recopila ningun dato personal del usuario.**

De forma especifica:

- No se recopilan nombres, direcciones de correo electronico ni identificadores personales
- No se registran los terminos de busqueda introducidos por el usuario
- No se almacena el historial de navegacion ni las URLs visitadas
- No se recopilan datos de geolocalizacion
- No se generan perfiles de usuario ni identificadores de seguimiento
- No se recopilan datos demograficos, de comportamiento ni de uso
- No se recopila informacion del dispositivo, sistema operativo ni navegador
- No se utilizan cookies ni tecnologias de rastreo equivalentes

---

## 3. Almacenamiento local

La extension utiliza la API `chrome.storage.local` exclusivamente para guardar las preferencias de configuracion del usuario dentro del propio navegador. Los datos almacenados son:

| Dato | Descripcion | Ejemplo |
|------|-------------|---------|
| Dominio de Amazon | Region preferida del usuario para busquedas en Amazon | `es`, `com`, `de` |
| Dominio de YouTube | Region preferida para YouTube | `com`, `es` |
| Motores visibles | Que motores de busqueda aparecen en el popup | `{google: true, bing: false}` |
| Orden de botones | Posicion personalizada de cada motor en el grid | `[googleButton, braveButton, ...]` |
| Motor predeterminado | Motor usado por defecto en el menu contextual | `googleButton` |

**Caracteristicas del almacenamiento:**

- Todos los datos se almacenan **localmente en el navegador** del usuario mediante `chrome.storage.local`
- Los datos **nunca se transmiten** a ningun servidor, API o servicio externo
- Los datos **nunca se comparten** con terceros, socios comerciales ni anunciantes
- Los datos se pueden eliminar en cualquier momento desinstalando la extension o limpiando los datos de la extension desde la configuracion del navegador (`chrome://extensions/`)
- No se utiliza `chrome.storage.sync`, por lo que los datos **no se sincronizan** entre dispositivos

---

## 4. Permisos solicitados y justificacion

La extension solicita unicamente tres permisos, todos estrictamente necesarios para su funcionamiento:

### 4.1. `activeTab`

- **Que hace**: permite a la extension leer la URL de la pestana activa unicamente cuando el usuario interactua con ella (hace clic en el icono de la extension o usa un atajo de teclado)
- **Para que se usa**: detectar que motor de busqueda esta usando el usuario y extraer el termino de busqueda de la URL para poder convertirlo a otro motor
- **Que NO hace**: no accede al contenido de la pagina (DOM, texto, imagenes), no lee datos de formularios, no intercepta la navegacion, no funciona en segundo plano y no tiene acceso a pestanas inactivas
- **Cuando se activa**: solo cuando el usuario interactua explicitamente con la extension

### 4.2. `contextMenus`

- **Que hace**: permite crear entradas en el menu contextual del navegador (clic derecho)
- **Para que se usa**: ofrecer al usuario la posibilidad de seleccionar texto en cualquier pagina web y buscarlo directamente en el motor de busqueda que prefiera, sin necesidad de abrir el popup
- **Que NO hace**: no accede al contenido de las paginas, no modifica el comportamiento del navegador ni intercepta otros menus

### 4.3. `storage`

- **Que hace**: permite almacenar y recuperar datos en el almacenamiento local del navegador
- **Para que se usa**: guardar las preferencias de configuracion del usuario (motores visibles, orden de botones, dominios regionales, motor predeterminado) para que persistan entre sesiones
- **Que NO hace**: no sincroniza datos entre dispositivos, no envia datos a servidores externos, no almacena datos personales ni de navegacion

---

## 5. Comunicaciones de red

La extension **no realiza ninguna comunicacion de red**. No se envian ni reciben datos a traves de internet.

De forma especifica:

- No se realizan peticiones HTTP/HTTPS a ningun servidor
- No se utilizan APIs externas ni servicios en la nube
- No se cargan recursos remotos (scripts, estilos, fuentes ni imagenes)
- Todas las dependencias (Font Awesome, Roboto, Sortable.js) estan empaquetadas localmente dentro de la extension
- La Content Security Policy (CSP) de la extension restringe explicitamente la carga de recursos a `'self'` (solo ficheros locales de la extension)

La CSP configurada en el manifiesto de la extension es:

```
script-src 'self'; object-src 'none'; style-src 'self'; font-src 'self'; img-src 'self' data:;
```

Esta politica impide por diseno la carga de cualquier recurso externo.

---

## 6. Uso de codigo remoto

La extension **no utiliza codigo remoto** de ninguna forma:

- No se ejecuta codigo descargado dinamicamente
- No se cargan scripts desde CDN u otros servidores externos
- No se utiliza ejecucion dinamica de codigo (ni funciones constructoras de codigo, ni temporizadores con cadenas de texto, ni ninguna otra tecnica equivalente)
- Todo el codigo JavaScript se incluye como archivos estaticos dentro del paquete de la extension
- El codigo fuente no minificado esta disponible publicamente para su inspeccion

---

## 7. Datos compartidos con terceros

**No se comparten datos con terceros.** No existen terceros, socios ni proveedores de servicios involucrados en el funcionamiento de la extension.

Cuando el usuario convierte una busqueda a otro motor, la extension simplemente abre una nueva pestana del navegador con la URL del motor de destino y el termino de busqueda. Esta navegacion es identica a la que el usuario realizaria manualmente escribiendo la URL en la barra de direcciones. La extension no actua como intermediario ni proxy en esta comunicacion.

---

## 8. Seguridad

Las medidas de seguridad implementadas incluyen:

- **Manifest V3**: la extension utiliza la ultima version del sistema de manifiestos de Chrome, que proporciona un modelo de seguridad mejorado con Service Workers aislados
- **Content Security Policy restrictiva**: solo se permite la ejecucion de codigo y la carga de recursos locales
- **Sin inyeccion de contenido**: la extension no inyecta scripts ni modifica el contenido de las paginas web
- **Validacion de datos**: los dominios configurables (Amazon, YouTube) se validan contra una lista cerrada de valores permitidos antes de ser utilizados
- **Sin ejecucion de codigo dinamico**: no se usan mecanismos de ejecucion dinamica de codigo de ningun tipo
- **Permisos minimos**: se solicitan unicamente los tres permisos estrictamente necesarios

---

## 9. Datos de menores

La extension no esta dirigida a menores de 13 anos y no recopila conscientemente datos de menores. Dado que la extension no recopila ningun tipo de dato personal, no existe riesgo de recopilacion inadvertida de datos de menores.

---

## 10. Cambios en esta politica

Cualquier cambio en esta politica de privacidad se publicara en este mismo documento dentro del repositorio de GitHub. La fecha de "ultima actualizacion" en la cabecera del documento se modificara para reflejar la revision mas reciente.

Dado que la extension no recopila datos, no se requiere consentimiento adicional del usuario ante cambios en la politica.

---

## 11. Derechos del usuario

El usuario puede en cualquier momento:

- **Inspeccionar el codigo fuente** en [GitHub](https://github.com/686f6c61/chrome-search-engine-converter) para verificar estas afirmaciones
- **Eliminar sus preferencias** desinstalando la extension o limpiando sus datos desde `chrome://extensions/`
- **Desactivar o desinstalar** la extension sin consecuencia alguna
- **Contactar al desarrollador** mediante un issue en GitHub para cualquier consulta relacionada con la privacidad

---

## 12. Contacto

Para cualquier consulta, duda o solicitud relacionada con esta politica de privacidad:

- **Issues de GitHub**: [github.com/686f6c61/chrome-search-engine-converter/issues](https://github.com/686f6c61/chrome-search-engine-converter/issues)
- **Repositorio**: [github.com/686f6c61/chrome-search-engine-converter](https://github.com/686f6c61/chrome-search-engine-converter)
