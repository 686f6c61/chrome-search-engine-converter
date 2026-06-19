# Politica de seguridad

## Reporte de vulnerabilidades

Si descubres una vulnerabilidad de seguridad en Search Engine Converter, por favor reportala de forma responsable.

### Como reportar

1. **No abras un issue publico** en GitHub con detalles de la vulnerabilidad.
2. Envía un correo a `security@686f6c61.dev` (o abre un [GitHub Security Advisory privado](https://github.com/686f6c61/chrome-search-engine-converter/security/advisories/new)) con:
   - Descripcion del problema
   - Pasos para reproducirlo
   - Impacto estimado
   - Sugerencia de mitigacion (opcional)

### Compromiso del maintainer

- **Ack inicial**: en menos de 48 horas.
- **Evaluacion**: en menos de 5 dias laborables.
- **Fix o mitigacion**: en menos de 30 dias para criticos, 90 para altos.
- **Disclosure coordinado**: publicamos el fix y un advisory en GitHub tras coordinar contigo la publicacion.

### Alcance

La politica cubre:

- Ejecucion de codigo remoto o inyeccion de scripts en el contexto de la extension
- Bypass de la Content Security Policy declarada en el manifest
- Fuga de datos o permisos no documentados
- Vulnerabilidades en dependencias de terceros (SortableJS, Font Awesome)

No cubre:

- Bugs funcionales sin impacto de seguridad (abre un issue normal)
- Vulnerabilidades en el propio navegador Chrome/Brave/Edge
- Ataques que requieran acceso fisico al dispositivo

### Recompensas

Este es un proyecto open source sin presupuesto de bug bounty. A cambio, reconocemos publicamente a quien reporta (con su consentimiento) en el advisory y el CHANGELOG.

## Medidas de seguridad implementadas

- **Manifest V3** con service worker aislado
- **Content Security Policy restrictiva**: `script-src 'self'; object-src 'none'; style-src 'self'; font-src 'self'; img-src 'self';` — sin `unsafe-inline`, sin `data:`, sin CDNs
- **Permisos minimos**: `activeTab`, `contextMenus`, `storage` (3 permisos)
- **Sin codigo remoto**: todas las dependencias empaquetadas localmente
- **Validacion de dominios** contra whitelists cerradas (Amazon, YouTube)
- **Codificacion de queries** con `encodeURIComponent` en todas las URLs construidas
- **Sin peticiones de red**: la extension no hace fetch/XHR a ningun servidor
- **Sin inyeccion de contenido**: no se inyectan scripts en paginas del usuario