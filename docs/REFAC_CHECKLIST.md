# Checklist de Refactorización (MODO IDEAL)

Este archivo contiene una checklist corta y accionable que debe acompañar cada PR que refactorice una sección para cumplir con *MODO IDEAL PERFECTO*.

## Acceptance Criteria (obligatorio)
- [ ] Existe `Form-wrapper` con 29 líneas (copiar-pegar) y está registrado.
- [ ] `Form-component` y `View-component` separados con templates independientes.
- [ ] Todos los datos expuestos por Signals: `formDataSignal`, `parrafoSignal`, `fotosCacheSignal`, `photoFieldsHash` y `viewModel`.
- [ ] `viewModel` agrupa todos los campos necesarios y se usa en los templates (`viewModel()`).
- [ ] Fotos y metadatos (título/fuente) delegan en `projectFacade` y se persisten con `formChange.persistFields()` y `projectFacade.setFields()`.
- [ ] `ImageStorageService.saveImages()` llama a `stateAdapter.refreshFromStorage()` y a `ViewChildHelper.updateAllComponents('actualizarDatos')` cuando aplica.
- [ ] Efectos (`effect()`) que unen `formDataSignal()` y tablas (`selectField`/`selectTableData`) para `this.datos` si aplica.
- [ ] Plantillas usan Signals y no getters imperativos o métodos en template.
- [ ] `ChangeDetectionStrategy.OnPush` y `cdRef.markForCheck()` en effects donde sea necesario.
- [ ] Tests unitarios y E2E relevantes incluidos (ver `docs/E2E_TEMPLATES.md`).

## PR Checklist (revisores)
- [ ] Compila (`npm start`) sin warnings críticos.
- [ ] Tests unitarios pasan (`npm test`).
- [ ] Tests E2E pasan localmente o en CI (si se añade la suite).
- [ ] Revisar que no hay uso directo de `imageService` para leer fotos en Signals.
- [ ] Revisar que `persistFields()` persiste tanto claves con prefijo como la `claveBase` para tablas cuando aplica.
- [ ] Verificar que la sección aparece en `TableNumberingService` si contiene tablas numeradas.
- [ ] Documentation: actualizar `MODO_IDEAL_PERFECTO_ARQUITECTURA_100.md` y añadir ejemplo (si aplica) en `docs/EXAMPLES/`.

## Notas para autores
- Añade una breve descripción `Antes / Después` en la PR para facilitar revisión.
- Si existen dudas sobre prefijos, usar `PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)`.
- Incluye un pequeño snippet E2E en la descripción del PR si agregas nuevos flujos UX (fotos/tablas).