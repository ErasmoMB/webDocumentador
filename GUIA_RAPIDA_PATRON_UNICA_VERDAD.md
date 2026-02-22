# Guía Rápida: Patrón UNICA_VERDAD para Secciones

## Resumen

Esta guía describe los pasos para implementar correctamente el patrón **UNICA_VERDAD** en una nueva sección, incluyendo el cálculo automático de totales/porcentajes y la persistencia en Redis.

---

## Pasos a Seguir

### Paso 1: Analizar la Estructura de la Tabla

Antes de programar, analizar cómo funciona la tabla:

**Preguntar:**
- ¿La tabla tiene una fila "Total"?
- ¿Tiene múltiples categorías (como Paredes, Techos, Pisos)?
- ¿Los porcentajes son globales (toda la tabla) o por categoría?
- ¿Qué campo identifica la fila "Total"? (ej: 'categoria', 'indicador')
- ¿Qué campo contiene los números a sumar? (ej: 'casos')

**Estructuras posibles:**

| Tipo | Ejemplo | Cálculo |
|------|---------|---------|
| **Simple** | PET, PEA, Nivel Educativo | Una fila Total global |
| **Por Categoría** | Materiales (Paredes/Techo/Piso) | Total por cada categoría |
| **Por Sexo** | Población Hombre/Mujer | Casos = H + M, % por género |

---

### Paso 2: Configurar la Tabla (TableConfig)

⚠️ **IMPORTANTE**: Los campos `totalKey` y `campoTotal` son **OBLIGATORIOS** para que funcione el cálculo de porcentajes. Si están vacíos, el cálculo falla silenciosamente.

```typescript
// En el componente (no en constants)
readonly miTablaConfigSignal: Signal<TableConfig> = computed(() => ({
  tablaKey: `miTabla${this.obtenerPrefijo()}`,
  totalKey: 'categoria',           // ✅ OBLIGATORIO: Campo que identifica la fila Total
  campoTotal: 'casos',             // ✅ OBLIGATORIO: Campo numérico a sumar
  campoPorcentaje: 'porcentaje',  // Campo de porcentaje
  permiteAgregarFilas: true,
  permiteEliminarFilas: true,
  noInicializarDesdeEstructura: true,
  calcularPorcentajes: true        // ✅ IMPORTANTE: Habilitar cálculo
}));
```

**Valores comunes para `totalKey`:**
- `categoria` - para tablas de nivel educativo, materiales, etc.
- `indicador` - para tablas de indicadores como analfabetismo
- `tipoMaterial` - para tablas de construcción

---

### Paso 3: Inyectar Servicios en el Constructor

```typescript
constructor(
  cdRef: ChangeDetectorRef,
  injector: Injector,
  private backendApi: BackendApiService,
  private formChange: FormChangeService,        // ✅ Para persistencia
  private tableFacade: TableManagementFacade    // ✅ Para cálculos
) {
  super(cdRef, injector);
}
```

**No olvidar el import:**
```typescript
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
```

---

### Paso 4: Método de Carga Condicional (onInitCustom)

⚠️ **CRÍTICO**: Siempre verificar si hay datos persistidos ANTES de cargar del backend. Si no se hace, los datos siempre se sobrescribirán.

```typescript
protected override onInitCustom(): void {
  this.cargarFotografias();
  
  // ✅ VERIFICAR SI YA EXISTEN DATOS PERSISTIDOS antes de cargar del backend
  const prefijo = this.obtenerPrefijoGrupo();
  const formData = this.formDataSignal();
  
  const tablaKey = `miTabla${prefijo}`;
  const existingData = formData[tablaKey];
  
  if (!existingData || !Array.isArray(existingData) || existingData.length === 0) {
    console.log('[SECCIONX] No hay datos persistidos, cargando del backend...');
    this.cargarDatosDelBackend();
  } else {
    console.log('[SECCIONX] Datos persistidos encontrados, no se carga del backend');
  }
}
```

---

### Paso 5: Cargar Datos del Backend con Cálculo

> **⚠️ IMPORTANTE**: Hay DOS formas de calcular totales/porcentajes. Debes elegir la correcta según tu tabla:
>
> - **`tableFacade.calcularTotalesYPorcentajes()`**: Calcula porcentajes pero **NO agrega fila Total**
> - **`TablePercentageHelper.calcularPorcentajesSimple()`**: Calcula porcentajes **Y AGREGA la fila Total automáticamente**
>
> **Usa el segundo método si quieres que la fila Total sea visible en el formulario (igual que en la vista).**

```typescript
import { TablePercentageHelper } from 'src/app/core/services/data/table-percentage.helper';

private cargarDatosDelBackend(): void {
  const codigos = [...this.getCodigosCentrosPobladosAISD()];
  const prefijo = this.obtenerPrefijoGrupo();
  
  this.backendApi.postMiEndpoint(codigos).subscribe({
    next: (response: any) => {
      let datosTransformados = this.transformarDatos(response?.data || []);
      
      if (datosTransformados.length > 0) {
        const tablaKey = `miTabla${prefijo}`;
        
        // ✅ OPCIÓN A: Calcular SIN fila Total (tableFacade)
        // Úsalo si la fila Total ya existe en los datos o no la necesitas
        const config = this.miTablaConfigSignal();
        const tmp: Record<string, any> = { [tablaKey]: structuredClone(datosTransformados) };
        this.tableFacade.calcularTotalesYPorcentajes(tmp, { 
          ...config, 
          tablaKey: tablaKey 
        });
        datosTransformados = tmp[tablaKey] || datosTransformados;
        
        // ✅ OPCIÓN B: Calcular CON fila Total (TablePercentageHelper)
        // Úsalo si quieres que el formulario muestre la fila Total como la vista
        // datosTransformados = TablePercentageHelper.calcularPorcentajesSimple(datosTransformados, '1');
        
        // ✅ GUARDAR EN PROJECTSTATEFACADE
        this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
        
        // ✅ PERSISTIR EN REDIS (con Y sin prefijo)
        try {
          this.formChange.persistFields(
            this.seccionId, 
            'table', 
            { [tablaKey]: datosTransformados, 'miTabla': datosTransformados }, 
            { notifySync: true }
          );
        } catch (e) { console.error(e); }
        
        this.cdRef.markForCheck();
      }
    }
  });
}
```

---

### Paso 6: Método de Actualización (onTableUpdated)

> **⚠️ IMPORTANTE**: Aplica lo mismo que en Paso 5 - usa el método correcto según si necesitas la fila Total visible.

```typescript
import { TablePercentageHelper } from 'src/app/core/services/data/table-percentage.helper';

onMiTablaUpdated(updatedData?: any[]): void {
  // ✅ LEER DEL SIGNAL REACTIVO
  const formData = this.formDataSignal();
  const prefijo = this.obtenerPrefijoGrupo();
  const tablaKey = `miTabla${prefijo}`;
  let tablaActual = updatedData || formData[tablaKey] || [];
  
  // ✅ OPCIÓN A: Calcular SIN fila Total (tableFacade)
  const config = this.miTablaConfigSignal();
  const tmp: Record<string, any> = { [tablaKey]: structuredClone(tablaActual) };
  this.tableFacade.calcularTotalesYPorcentajes(tmp, { 
    ...config, 
    tablaKey: tablaKey 
  });
  tablaActual = tmp[tablaKey] || tablaActual;
  
  // ✅ OPCIÓN B: Calcular CON fila Total (TablePercentageHelper)
  // Úsalo si quieres que el formulario muestre la fila Total como la vista
  // tablaActual = TablePercentageHelper.calcularPorcentajesSimple(tablaActual, '1');
  
  // ✅ GUARDAR EN PROJECTSTATEFACADE (con y sin prefijo)
  this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
  this.projectFacade.setField(this.seccionId, null, 'miTabla', tablaActual);
  
  // ✅ PERSISTIR EN REDIS (con Y sin prefijo)
  try {
    this.formChange.persistFields(
      this.seccionId, 
      'table', 
      { [tablaKey]: tablaActual, 'miTabla': tablaActual }, 
      { notifySync: true }
    );
  } catch (e) {
    console.error(`[SECCIONX] ⚠️ Could not save:`, e);
  }
  
  this.cdRef.markForCheck();
}
```

---

### Paso 7: Cálculo por Categoría (Si Aplica)

Para tablas como "Materiales de Construcción" donde cada categoría tiene su propio Total:

```typescript
private calcularTotalesYPorcentajesPorCategoria(tabla: any[]): any[] {
  if (!tabla || tabla.length === 0) return tabla;
  
  const tablaClon = JSON.parse(JSON.stringify(tabla));
  
  // Agrupar por categoría (excluyendo filas Total)
  const categorias = new Map<string, any[]>();
  
  tablaClon.forEach((row: any) => {
    const tipoMat = row.tipoMaterial || '';
    const isTotal = tipoMat.toString().toLowerCase() === 'total';
    
    if (!isTotal) {
      const cat = row.categoria || '';
      if (!categorias.has(cat)) categorias.set(cat, []);
      categorias.get(cat)!.push(row);
    }
  });
  
  // Calcular para cada categoría
  categorias.forEach((filas, categoria) => {
    const totalCategoria = filas.reduce((sum, row) => 
      sum + (parseFloat(row.casos) || 0), 0);
    
    // Porcentajes por fila
    filas.forEach((row: any) => {
      const casos = parseFloat(row.casos) || 0;
      if (totalCategoria > 0) {
        row.porcentaje = (casos / totalCategoria * 100).toFixed(2).replace('.', ',') + ' %';
      } else {
        row.porcentaje = '0,00 %';
      }
    });
    
    // Actualizar fila Total de esta categoría
    const filaTotal = tablaClon.find((row: any) => 
      row.categoria === categoria && 
      (row.tipoMaterial || '').toString().toLowerCase() === 'total'
    );
    
    if (filaTotal) {
      filaTotal.casos = totalCategoria;
      filaTotal.porcentaje = '100,00 %';
    }
  });
  
  return tablaClon;
}
```

---

## Checklist de Verificación

Antes de terminar, verificar:

- [ ] `totalKey` tiene el nombre correcto del campo que identifica la fila Total
- [ ] `campoTotal` tiene el nombre correcto del campo numérico
- [ ] `calcularPorcentajes: true` en la config
- [ ] `formDataSignal()` lee de ProjectStateFacade
- [ ] `projectFacade.setField()` guarda en memoria
- [ ] `formChange.persistFields()` con `{ notifySync: true }` persiste en Redis
- [ ] **Persiste con ambas claves**: `[tablaKey]: datos, 'nombreTabla': datos`
- [ ] Cálculo de totales/porcentajes se ejecuta:
  - [ ] Al cargar datos del backend
  - [ ] Al editar la tabla (onTableUpdated)
- [ ] `onInitCustom()` verifica datos existentes antes de cargar del backend
- [ ] **Método de cálculo correcto**:
  - [ ] `tableFacade.calcularTotalesYPorcentajes()` → Si NO necesitas fila Total
  - [ ] `TablePercentageHelper.calcularPorcentajesSimple()` → Si SÍ necesitas fila Total visible (igual que View)

---

## Errores Comunes y Soluciones

| Error | Solución |
|-------|----------|
| No calcula porcentajes | Verificar `totalKey` y `campoTotal` NO estén vacíos en la config |
| Total incorrecto | Verificar que `totalKey` coincida con el campo que tiene "Total" |
| No persiste | Agregar persistencia con **ambas claves** (con y sin prefijo) |
| Datos siempre se sobrescriben | Verificar `onInitCustom()` verifica datos persistidos primero |
| Tabla por categorías no funciona | Usar método personalizado `calcularTotalesYPorcentajesPorCategoria()` |
| Error "tableFacade not found" | Inyectar `TableManagementFacade` en constructor |
| Cálculo falla silenciosamente | Revisar consola - puede haber warning pero no error visible |
| **Fila Total no aparece en Form** | Usar `TablePercentageHelper.calcularPorcentajesSimple()` en lugar de `tableFacade` |

---

## Cómo Debugear

Para verificar si la persistencia funciona, revisa la consola del navegador:

```javascript
// Deberías ver estos mensajes:
[SessionData] 💾 Guardando: key=formulario_datos
[SessionData] ✅ Guardado exitoso: {ok: true, ...}
[PERSISTENCE] 🔥 saveSectionState called for: 3.1.4.A.1.X
[PERSISTENCE] 📦 table keys: ['miTabla_A1', 'miTabla']
```

---

## Referencias

- Sección 6 (Referencia): `seccion6-form.component.ts`
- Sección 7 (Referencia): `seccion7-form.component.ts`
- Sección 9 (Ejemplo con categorías): `seccion9-form.component.ts`
- Sección 14 (Ejemplo completo): `seccion14-form.component.ts`
- Sección 15 (Ejemplo con TablePercentageHelper): `seccion15-form.component.ts`
