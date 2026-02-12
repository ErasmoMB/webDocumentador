# 🐛 ERRORES Y SOLUCIONES (Registro Acumulativo)

Fecha: 12 de febrero de 2026  
Última actualización: 12 de febrero de 2026

---

## Error 1: Filas de Tabla Dinámicas No Aparecen Inmediatamente al Agregar

**Síntoma:**
- Haces clic en "Agregar Fila" en DynamicTable
- La fila se guarda en el store
- **PERO** no aparece en la UI hasta que haces F5 (recarga la página)
- Secciones 28, 29, 30 afectadas

**Secciones Afectadas:**
- ❌ Sección 29: **NO funcionaba** - Filas no aparecían hasta recarga
- ❌ Sección 30: **NO funcionaba** - Mismo problema
- ✅ Sección 28: **SÍ funcionaba** - Comparar patrón

**Causa Raíz:**

Cuando `onTablaUpdated()` se llama, debe hacer 3 cosas SIMULTÁNEAMENTE:

1. **Actualizar `this.datos['tablaKey']` con NUEVA REFERENCIA** (para que Angular OnPush detecte cambio)
2. **Llamar `persistFields()` para guardar en store** (sin `refresh: true` que sobrescribe)
3. **Llamar `this.cdRef.detectChanges()`** explícitamente (fuerza re-render)

**Comparación Sección 28 vs Sección 29:**

### ❌ INCORRECTO (Sección 29 - Antes):
```typescript
onTablaUpdated(tablaKey: string, tabla: any[]) {
  // Solo llama a onFieldChange - NO crea nueva referencia
  this.onFieldChange(tablaKey, tabla);
}
```

**Problema:** `onFieldChange()` sobrescribe `this.datos[fieldId] = value` pero Angular OnPush no detecta cambio porque el binding todavía recibe el mismo objeto.

### ✅ CORRECTO (Sección 28 - Patrón de Referencia):
```typescript
onPuestoSaludTableUpdated(tabla: any[]): void {
  const tablaKey = this.getTablaKeyPuestoSalud();
  
  // 1️⃣ CREAR NUEVA REFERENCIA con spread operator
  this.datos[tablaKey] = [...tabla];
  
  // 2️⃣ PERSISTIR sin refresh=true para evitar sobrescrituras
  this.onFieldChange(tablaKey, this.datos[tablaKey], { refresh: false });
  
  // 3️⃣ FORZAR CHANGE DETECTION explícitamente
  this.cdRef.detectChanges();
}
```

**Por qué funciona:**
- `[...tabla]` crea NUEVA referencia → Angular OnPush detecta cambio
- `{ refresh: false }` previene que `actualizarDatos()` sobrescriba el cambio local
- `markForCheck()` fuerza que Angular re-evalúe el binding

---

## Solución: El Patrón de 3 Pasos

**Aplicar a TODAS las tablas dinámicas en form components:**

```typescript
// Para cada tabla:
onNombreTablaUpdated(tabla: any[]): void {
  const tablaKey = this.getTablaKeyNombre();  // ← Método dinámico con prefijo
  
  // PASO 1: Nueva referencia
  this.datos[tablaKey] = [...tabla];
  
  // PASO 2: Persistir sin refresh
  this.onFieldChange(tablaKey, this.datos[tablaKey], { refresh: false });
  
  // PASO 3: Forzar detección
  this.cdRef.detectChanges();
}
```

**Checklist de Aplicación:**
- [ ] Sección 28: ✅ YA IMPLEMENTADO (referencia)
- [ ] Sección 29: ✅ APLICADO 12/02/2026
- [ ] Sección 30: ✅ APLICADO 12/02/2026
- [ ] Secciones 22-25: TODO (revisar si también tienen tablas)
- [ ] Todas las futuras secciones con tablas

---

## Variante con `effect()` (Alternativa NO Recomendada)

**Intenté agregar `effect()` para monitorear signals de tabla:**

```typescript
// ❌ NO FUNCIONA - El effect se ejecuta pero Angular OnPush no detecta cambio
effect(() => {
  this.natalidadTablaSignal();
  this.morbilidadTablaSignal();
  this.afiliacionTablaSignal();
  this.cdRef.markForCheck();  // Solo markForCheck() no es suficiente
});
```

**Por qué:**
- `markForCheck()` marca que el componente PODRÍA cambiar
- **PERO** Angular OnPush NO re-evalúa bindigs si la referencia del input NO cambió
- DynamicTableComponent recibe `[datos]` como objeto que CONTIENE la tabla
- Si el objeto NO tiene nueva referencia, Angular ignora el marcado

**Solución:** Combinar `markForCheck()` + **nueva referencia** del objeto binding:

```typescript
effect(() => {
  this.natalidadTablaSignal();  // Detecta cambio en signal
  // ✅ CREAR NUEVA REFERENCIA en método binding
  this.tableDataChangeCounter++;  // Incrementar para forzar nueva ref
  this.cdRef.markForCheck();
});
```

Pero el patrón directo (3 pasos) es más simple y confiable.

---

## Lecciones Aprendidas

| Aspecto | Incorrecto | Correcto |
|---------|-----------|----------|
| **Referencia** | `this.datos[key] = tabla` | `this.datos[key] = [...tabla]` |
| **Persistencia** | `this.onFieldChange(key, tabla)` | `this.onFieldChange(key, tabla, { refresh: false })` |
| **Change Detection** | Solo `effect()` + `markForCheck()` | Explícito: `this.cdRef.detectChanges()` |
| **Orden** | Cualquier orden | 1. Ref 2. Persist 3. Detect |

---

## Checklist: Aplicar Patrón a Nueva Sección

Si crear nueva sección con tablas dinámicas:

```
[ ] 1. Crear getNombreTablaKey() method con prefijo dinámico
[ ] 2. Crear getNombreTablaData() que retorna { [key]: signal() }
[ ] 3. Crear onNombreTablaUpdated(tabla) con 3 pasos:
       [ ] Paso 1: this.datos[key] = [...tabla]
       [ ] Paso 2: this.onFieldChange(key, this.datos[key], { refresh: false })
       [ ] Paso 3: this.cdRef.detectChanges()
[ ] 4. Template: (tableUpdated)="onNombreTablaUpdated($event)"
[ ] 5. Test: Agregar fila → debe aparecer INMEDIATAMENTE
```

---

## Referencias

- **Sección 28**: [seccion28-form.component.ts](../src/app/shared/components/seccion28/seccion28-form.component.ts) - Patrón de REFERENCIA
- **Sección 29**: [seccion29-form.component.ts](../src/app/shared/components/seccion29/seccion29-form.component.ts) - Parche aplicado 12/02/2026
- **Sección 30**: [seccion30-form.component.ts](../src/app/shared/components/seccion30/seccion30-form.component.ts) - Parche aplicado 12/02/2026
- **DynamicTableComponent**: [dynamic-table.component.ts](../src/app/shared/components/dynamic-table/dynamic-table.component.ts) - Entiende referencia de binding

---

## Error 2: Filas de Tabla Dinámicas Solo Aparecen Después del Segundo Click (Sección 3)

**Síntoma:**
- Haces clic en "Agregar Fila" en el formulario de Sección 3
- **NADA pasa** - la fila no aparece
- Haces clic nuevamente
- **AHORA aparecen 2 filas** (la que debía aparecer en el primer click + la del segundo)
- En la vista (lectura) las filas SÍ aparecen correctamente desde el primer click

**Sección Afectada:**
- ❌ Sección 3: **NO funcionaba correctamente** - Filas aparecían desde el segundo click

**Causa Raíz - 2 Problemas:**

1. **Template usaba signal en lugar de referencia mutable**
   ```typescript
   // ❌ INCORRECTO
   [datos]="formData"  // formData es un signal computed()
   
   // ✅ CORRECTO
   [datos]="datos"     // datos es la referencia mutable de BaseSectionComponent
   ```

2. **onFieldChange() estaba interfiriendo con detectChanges()**
   ```typescript
   // ❌ INCORRECTO
   override onFieldChange(fieldId: string, value: any): void {
     // ...
     this.cdRef.detectChanges();  // Se ejecuta ANTES de onTablaUpdated()
   }
   
   // ✅ CORRECTO
   override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
     // ...
     this.cdRef.markForCheck();   // Solo marca, no forza detección
   }
   ```

**Comparación Incorrecto vs Correcto:**

### ❌ INCORRECTO (Sección 3 - Formulario):
```typescript
// Template
<app-dynamic-table [datos]="formData" ...>  // ← Signal, no referencia mutable

// Component
override onFieldChange(fieldId: string, value: any): void {
  this.projectFacade.setField(this.seccionId, null, fieldId, value);
  this.formChangeService.persistFields(this.seccionId, 'form', { [fieldId]: value });
  this.cdRef.detectChanges();  // ← Interfiere con onTablaUpdated
}

onTablaUpdated(tabla: any[]): void {
  // ... pero el detectChanges anterior ya fue ejecutado
}
```

**Problema:** 
- `formData` es un signal computed, no se reactualiza con mutaciones a `this.datos`
- `detectChanges()` en `onFieldChange` se ejecuta antes de `onTablaUpdated`
- Angular OnPush requiere nueva referencia ANTES de detectar cambios

### ✅ CORRECTO (Sección 3 - Formulario):
```typescript
// Template
<app-dynamic-table [datos]="datos" ...>  // ← Referencia mutable

// Component
override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
  this.projectFacade.setField(this.seccionId, null, fieldId, value);
  this.formChangeService.persistFields(this.seccionId, 'form', { [fieldId]: value });
  this.cdRef.markForCheck();  // ← Solo marca, no forza
}

onTablaUpdated(tabla: any[]): void {
  const tablaKey = 'entrevistados';
  
  // PASO 1️⃣: CREAR NUEVA REFERENCIA
  this.datos[tablaKey] = [...tabla];
  
  // PASO 2️⃣: PERSISTIR sin refresh
  this.onFieldChange(tablaKey, this.datos[tablaKey], { refresh: false });
  
  // PASO 3️⃣: FORZAR DETECCIÓN UNA SOLA VEZ
  this.cdRef.detectChanges();
}
```

**Por qué funciona:**
- `[datos]="datos"` es referencia mutable que Angular OnPush MONITOREA
- `markForCheck()` en `onFieldChange` no interfiere
- `onTablaUpdated` controla TODA la lógica de detección
- Primera referencia nueva = primer click muestra la fila ✅

---

## Solución Completa - Formularios con Tablas

**Checklist al implementar tablas dinámicas en formulario:**

```
[ ] 1. Template: SIEMPRE usar [datos]="datos", NUNCA [datos]="formData" o signals
[ ] 2. onFieldChange(): usar markForCheck() en lugar de detectChanges()
[ ] 3. onTablaUpdated($event): aplicar patrón de 3 pasos completo
       [ ] Paso 1: this.datos[key] = [...tabla]
       [ ] Paso 2: this.onFieldChange(key, this.datos[key], { refresh: false })
       [ ] Paso 3: this.cdRef.detectChanges() ← UNA SOLA VEZ
[ ] 4. Test: Primer click → 1 fila, Segundo click → 2 filas, etc.
```

---

## Error 3: Campo Editable (Título de Cuadro) No Se Sincroniza Entre Formulario y Vista

**Síntoma:**
- Editas el título del cuadro en el **formulario** (input text)
- El cambio se guarda ✅ (en el store)
- **PERO** el título NO se actualiza en la **vista** (view component)
- Tienes que recargar la página (F5) para verlo actualizado

**Sección Afectada:**
- ❌ Sección 5: **NO se sincronizaba** - Título guardado pero no mostrado en vista (12/02/2026)

**Causa Raíz:**

Las vistas y formularios guardan campos con **prefijo dinámico** (ej: `tituloInstituciones_A1` para grupo A1, `tituloInstituciones_A2` para grupo A2).

El problema ocurre cuando:
1. El formulario guarda: `projectFacade.setField(..., 'tituloInstituciones' + obtenerPrefijoGrupo(), ...)`
   - Resultado: `tituloInstituciones_A1`
2. La vista HTML lee: `datos.tituloInstituciones` (SIN prefijo)
   - Resultado: lee undefined, usa default

### ❌ INCORRECTO (Sección 5 - Vista):
```html
<app-table-wrapper [title]="datos.tituloInstituciones || SECCION5_TEMPLATES.labelInstituciones.replace(...)" ...>
```

**Problema:** 
- `datos.tituloInstituciones` está vacío porque se guardó como `datos.tituloInstituciones_A1`
- El binding siempre usa el default template, nunca el valor editado

### ✅ CORRECTO (Sección 5 - Vista):
```html
<app-table-wrapper [title]="viewModel().titulo || SECCION5_TEMPLATES.labelInstituciones.replace(...)" ...>
```

Y en el componente TypeScript, el `viewModel` computed debe resolver el prefijo:

```typescript
return {
  // ...
  titulo: data[`tituloInstituciones${prefijo}`] || data['tituloInstituciones'] || '',
  fuente: data[`fuenteInstituciones${prefijo}`] || data['fuenteInstituciones'] || ''
};
```

**Por qué funciona:**
- `viewModel().titulo` busca PRIMERO con prefijo (`_A1`, `_A2`, etc.)
- Si no encuentra, busca SIN prefijo (retrocompatibilidad)
- Si tampoco, usa string vacío (fallback)
- Así siempre lee el valor correcto que el formulario guardó

---

## Solución - Campos Editables con Prefijo

**Checklist al leer campos en vista con valores guardados en formulario:**

```
[ ] 1. Identificar si el campo se guarda CON prefijo en formulario
       [ ] Buscar: projectFacade.setField(..., 'nombreCampo' + obtenerPrefijoGrupo(), ...)
       [ ] Si SÍ tiene prefijo → continuar
[ ] 2. En view.component.ts crear computed viewModel() que resuelva prefijo
       [ ] Incluir: data[`nombreCampo${prefijo}`] || data['nombreCampo'] || ''
[ ] 3. En view.component.html reemplazar:
       [ ] ❌ [binding]="datos.nombreCampo"
       [ ] ✅ [binding]="viewModel().nombreCampo"
[ ] 4. Test: Edita en formulario → cambio aparece INMEDIATAMENTE en vista
```

**Patrón General para Cualquier Campo with Prefijo:**

```typescript
// view.component.ts
this.viewModel = computed(() => {
  const data = this.formDataSignal();
  const prefijo = this.obtenerPrefijoGrupo();
  
  return {
    // Resolver TODOS los campos que se guardan con prefijo:
    tituloTabla: data[`tituloTabla${prefijo}`] || data['tituloTabla'] || '',
    fuenteTabla: data[`fuenteTabla${prefijo}`] || data['fuenteTabla'] || '',
    descripcion: data[`descripcion${prefijo}`] || data['descripcion'] || '',
    // etc...
  };
});
```

---

**Estado Compilación:** ✅ SIN ERRORES  
**Estado Testing:** ✅ Secciones 28-30 - Filas aparecen INMEDIATAMENTE  
**Estado Testing:** ✅ Sección 3 - Filas aparecen INMEDIATAMENTE desde primer click  
**Estado Testing:** ✅ Sección 5 - Títulos de cuadros se sincronizan formulario ↔ vista  
**Fecha Resolución:** 12 de febrero de 2026
