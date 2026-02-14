# Guía: Editar Párrafos y Persistencia (Sección 1 y Sección 2)

Este documento resume el patrón correcto para que los cambios hechos en **Editar Párrafos**:

1. Se reflejen inmediatamente en la vista.
2. Se mantengan después de recargar la página.
3. No sean sobrescritos por texto autogenerado.

---

## Problema observado

### Síntomas
- El usuario editaba párrafos en formulario, pero en vista no se veían todos los cambios.
- Tras recargar (`F5`), algunos párrafos volvían al texto generado por plantilla.
- En `seccion2`, Introducción funcionaba, pero AISD/AISI no.
- En `seccion1`, el párrafo principal podía ser sobrescrito por lógica automática.

### Causa raíz
- La vista de algunos párrafos **ignoraba el valor manual persistido** y regeneraba siempre desde templates.
- La inicialización de campos se ejecutaba en un momento donde podía **pisar estado restaurado**.
- Existía auto-persistencia en primer ciclo de `createAutoSyncField`, provocando escrituras iniciales no deseadas.
- En `seccion1`, la función de autogeneración actualizaba el párrafo principal incluso cuando ya había texto manual.

---

## Regla de oro

Para cualquier párrafo editable:

1. **Prioridad 1:** texto manual guardado (`selectField`).
2. **Prioridad 2:** texto generado automáticamente (template).
3. **Nunca** regenerar automáticamente si ya existe texto manual no vacío.

Patrón recomendado:

```ts
const manual = this.projectFacade.selectField(this.seccionId, null, 'campoParrafo')();
if (manual && String(manual).trim().length > 0) {
  return manual;
}
return this.generarTextoTemplate();
```

---

## Patrón de implementación

### 1) Formulario (edición)
- Usar `createAutoSyncField('campoParrafo', '')`.
- Vincular en `app-paragraph-editor` con `[value]` y `(valueChange)`.
- En inicialización, cargar primero valor guardado; solo usar fallback generado si no existe.

### 2) Vista (render)
- En métodos `obtenerTexto...`, consultar primero texto manual guardado.
- Solo si no hay manual, generar texto dinámico.

### 3) Inicialización
- Ejecutar carga de campos en `onInitCustom()` (después de restore de estado), no en constructor.

### 4) Auto-sync base
- Evitar persistir el valor inicial en la primera ejecución del `effect` de `createAutoSyncField`.
- Persistir únicamente cambios reales del usuario o actualizaciones explícitas.

---

## Casos específicos corregidos

### Sección 2
- AISD y AISI en vista ahora respetan `parrafoSeccion2_aisd_completo` y `parrafoSeccion2_aisi_completo` cuando existen.
- La inicialización en formulario ya no fuerza regeneración por defecto cuando hay texto persistido.

### Sección 1
- `actualizarParrafoPrincipal()` ahora sale temprano si ya existe `parrafoSeccion1_principal` guardado.
- Se evita sobreescribir el párrafo editado manualmente por cambios de ubicación.

### Sección 3
- La lista de fuentes secundarias debe leerse y persistirse en el mismo bloque de datos de sección para evitar discrepancias entre formulario y vista.
- La persistencia de imágenes debe usar el flujo estándar del componente base (coordinador de fotos), evitando lógica especial en la sección.
- El `photoPrefix` debe ser único y consistente entre formulario, vista y constants.
- No usar `key` dinámico en el `image-upload` cuando su valor cambia por render, porque puede reinicializar el componente y perder estado visual.

---

## Checklist para nuevas secciones

Antes de cerrar una sección con “Editar Párrafos”, validar:

- [ ] Cada párrafo editable tiene campo persistido único.
- [ ] La vista consulta primero valor manual (`selectField`) y luego fallback.
- [ ] No hay regeneración automática que pise texto manual existente.
- [ ] La inicialización no corre en constructor si depende de estado restaurado.
- [ ] `F5` conserva exactamente los párrafos editados.
- [ ] Cambiar formulario -> volver a vista refleja texto sin recarga extra.
- [ ] Formulario y vista leen/escriben con el mismo `seccionId` efectivo.
- [ ] `PHOTO_PREFIX` es idéntico en formulario, vista y constants.
- [ ] Si la sección no es dinámica por grupo, no aplicar sufijo de grupo en claves de imagen.
- [ ] Si la sección sí es dinámica, aplicar prefijo/sufijo de grupo de forma consistente en guardado y lectura.

---

## Anti-patrones a evitar

1. **Ignorar manual en vista**
```ts
// ❌ Incorrecto
return this.generarTextoTemplate();
```

2. **Sobrescribir siempre al iniciar**
```ts
// ❌ Incorrecto
this.parrafoX.update(this.generarTextoTemplate());
```

3. **Autogenerar sin condición de preservación**
```ts
// ❌ Incorrecto
this.parrafoPrincipal.update(textoGenerado);
```

4. **Manejo de fotos distinto al patrón base en una sección aislada**
```ts
// ❌ Incorrecto: override manual de guardado/carga sin usar flujo base
override onFotografiasChange(fotografias) {
  this.fotografiasLocal = fotografias;
}
```

5. **Prefijo inconsistente entre form/view/constants**
```ts
// ❌ Incorrecto
// form: fotografiaSeccion3
// view: fotografia3
// constants: fotografiaX
```

---

## Verificación de arquitectura (rápida)

Al cerrar una corrección, confirmar:

1. **Respeta arquitectura base**
  - Se usa `BaseSectionComponent` + `createAutoSyncField` + `FormChangeService`.
  - No se introduce un canal paralelo de persistencia para una sección puntual.

2. **Prefijos correctos**
  - Claves de imágenes y campos derivan del prefijo oficial de la sección.
  - En secciones con grupos dinámicos, el sufijo de grupo no se duplica.

3. **Aislamiento de datos**
  - Cada valor se persiste por `seccionId + fieldName` (y grupo cuando aplica).
  - Cambios de una sección no pisan datos de otra.

4. **Paridad formulario/vista**
  - Lo que ve el formulario es exactamente lo que consume la vista.
  - Cambiar sección y regresar no modifica el estado previamente guardado.

---

## Resultado esperado de UX

- El usuario edita un párrafo en formulario.
- Cambia a vista y ve exactamente ese texto.
- Recarga la página y el texto permanece igual.
- El texto automático solo aplica cuando el campo está vacío.
