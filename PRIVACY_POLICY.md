# Search Engine Converter - Politica de privacidad

**Ultima actualizacion**: febrero 2026

## Datos recopilados

Esta extension **no recopila, almacena ni transmite datos personales** del usuario a ningun servidor externo.

## Almacenamiento local

La extension utiliza `chrome.storage.local` unicamente para guardar las preferencias de configuracion del usuario:

- Dominio de Amazon y YouTube seleccionado
- Motores de busqueda visibles en el popup
- Orden personalizado de los botones
- Motor predeterminado para el menu contextual

Estos datos permanecen en el navegador del usuario y **nunca se envian a terceros**.

## Permisos

La extension solicita los permisos minimos necesarios:

| Permiso | Uso |
|---------|-----|
| `activeTab` | Lee la URL de la pestana activa cuando el usuario interactua con la extension, para detectar el motor de busqueda y extraer el termino de busqueda. No accede al contenido de la pagina. |
| `contextMenus` | Crea una entrada en el menu del clic derecho para buscar texto seleccionado en otros motores. |
| `storage` | Guarda las preferencias del usuario localmente en el navegador. |

## Comunicaciones externas

La extension **no realiza ninguna peticion de red**. Toda la funcionalidad se ejecuta localmente en el navegador. No hay servidores, APIs de terceros ni conexiones salientes.

## Analiticas

No se utiliza Google Analytics, Mixpanel ni ningun otro servicio de analitica o telemetria.

## Codigo abierto

El codigo fuente completo esta disponible para auditoria en [GitHub](https://github.com/686f6c61/chrome-search-engine-converter).

## Contacto

Para consultas sobre privacidad, abrir un issue en [github.com/686f6c61/chrome-search-engine-converter/issues](https://github.com/686f6c61/chrome-search-engine-converter/issues).
