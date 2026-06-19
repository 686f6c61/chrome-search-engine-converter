# Guia de contribucion

Gracias por tu interes en contribuir a Search Engine Converter. Esta guia describe el flujo de trabajo para que tu contribucion se integre sin friccion.

## Antes de empezar

1. **Abre un issue** describiendo el cambio que quieres hacer (bug, feature, mejora de docs). Espera a que se discuta antes de abrir un PR grande.
2. **Verifica que no exista ya** un issue o PR similar activo.
3. **Indica si es un bugfix** (trivial) o una **feature** (requiere discusión de diseño).

## Flujo de trabajo

```bash
# 1. Fork + clone
git clone https://github.com/<tu-usuario>/chrome-search-engine-converter.git
cd chrome-search-engine-converter

# 2. Rama para tu cambio
git checkout -b fix/descripcion-corta

# 3. Instala dependencias (solo devDependencies para tests)
npm install

# 4. Verifica que todo pasa antes de empezar
npm run check

# 5. Haz tus cambios

# 6. Verifica que todo sigue pasando
npm run check

# 7. Commit con mensaje descriptivo
git commit -m "fix: descripción del cambio"

# 8. Push y PR
git push origin fix/descripcion-corta
```

## Estilo de codigo

- **Sin dependencias nuevas** sin justificacion previa. La extension mantiene cero dependencias en runtime; todo va empaquetado.
- **Sin emojis** en codigo, commits, PRs o docs.
- **Castellano neutro** en comentarios, docs y mensajes de commit. Nombres de variables y funciones en ingles.
- **Funciones pequenas** con responsabilidad unica.
- **JSDoc** en funciones publicas.
- **Sin `console.log`** en codigo de produccion (solo en tests si es necesario).

## Tests

- Toda nueva logica en `engines.js` debe tener tests en `tests/engines.smoke.test.cjs`.
- Usa `node:test` y `node:assert/strict` (ya configurados).
- Ejecuta `npm run check` antes de cada commit.

## Mensajes de commit

Formato [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>: <descripcion corta>
```

Tipos validos:

- `feat`: nueva funcionalidad
- `fix`: correccion de bug
- `docs`: solo documentacion
- `refactor`: refactor sin cambio de comportamiento
- `test`: solo tests
- `chore`: tareas de mantenimiento (deps, CI, config)

Ejemplos:

```
feat: anadir motor Perplexity al registro
fix: corregir deteccion de YouTube con dominio regional
docs: ampliar README con seccion de testing
```

## Reglas adicionales

- **Sin co-autoria**: no anadir lineas `Co-Authored-By` ni mencionar a la IA en commits.
- **Commits atomicos**: un cambio logico por commit.
- **PRs pequenos**: si tu PR tiene mas de 300 lineas, considera dividirlo.
- **Respecta la arquitectura SSOT**: `engines.js` es la unica fuente de verdad para motores. No dupliques configuracion de motores en otros ficheros.
- **Accesibilidad**: cualquier cambio de UI debe mantener o mejorar WCAG 2.1 AA. Verifica foco visible, ARIA labels y contraste.

## Estructura del proyecto

Consulta el README para la estructura de directorios. Los ficheros clave:

- `extension/engines.js` — registro de motores (SSOT)
- `extension/popup.js` — controlador del popup
- `extension/background.js` — service worker (menu contextual, atajos)
- `extension/popup.css` — estilos del popup
- `tests/` — tests con `node:test`
- `.github/workflows/ci.yml` — pipeline de CI

## Code of conduct

Sé respetuoso y constructivo. No se tolera acoso, lenguaje excluyente ni ataques personales. Los PRs que violen esta regla se cierran sin merge.