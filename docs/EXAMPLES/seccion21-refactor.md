# Ejemplo: Refactorización Sección 21 → MODO IDEAL

Resumen rápido:
- **Objetivo:** Migrar Sección 21 para cumplir con la guía MODO IDEAL (Signals, viewModel, Form-wrapper 29 líneas, sync fotos/tablas inmediata).
- **Estado actual:** Form y View creados; persistencia ajustada; sincronización implementada parcialmente; falta E2E y docs finales.

## Pasos aplicados
1. Crear `seccion21-form-wrapper.component.ts` (29 líneas exactas).
2. Implementar `seccion21-form.component.ts` con Signals: `formDataSignal`, `parrafoAisiSignal`, `parrafoCentroSignal`, `fotosCacheSignal`, `photoFieldsHash`, `viewModel`.
3. Implementar `seccion21-view.component.ts` duplicando los Signals (solo lectura) y usando `viewModel()` en template.
4. Ajustar `seccion.component.ts` para usar `seccion21View` en preview (izquierda) y `seccion21` (wrapper) en la derecha.
5. Asegurar que `ImageStorageService.saveImages()` persiste y llama a `stateAdapter.refreshFromStorage()` y `ViewChildHelper.updateAllComponents('actualizarDatos')`.
6. Persistir tablas tanto con clave prefijo como con clave base.

## Checks realizados
- [x] Form-wrapper añadido y registrado.
- [x] Signals y viewModel implementados.
- [x] Tabla `ubicacionCp` muestra headers y tiene add/delete deshabilitados según requerimiento.
- [x] Cambios en fotos/títulos/fuentes se reflejan en preview sin recargar.
- [ ] E2E tests añadidos (pendiente).
- [ ] Eliminar legacy `seccion21.component.ts` si ya no se usa (pendiente).

## Recomendaciones finales
- Agregar E2E usando `docs/E2E_TEMPLATES.md` como base.
- Añadir un test unitario que cubra `photoFieldsHash` y comportamiento de `fotosCacheSignal`.
- Actualizar PR con la checklist `docs/REFAC_CHECKLIST.md` y una nota `Antes / Después`.