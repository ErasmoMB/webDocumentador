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

**Estado Compilación:** ✅ SIN ERRORES  
**Estado Testing:** ✅ Secciones 28-30 - Filas aparecen INMEDIATAMENTE  
**Fecha Resolución:** 12 de febrero de 2026
