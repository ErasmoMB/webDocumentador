# Patrón: Cargar Datos del Backend en Tablas de Solo Lectura

## Descripción General

Este documento describe el patrón implementado en la **Sección 6 (Aspectos Demográficos)** para cargar datos del backend en tablas que son de **solo lectura** en el formulario (sin botones de agregar/eliminar filas ni fila de totales adicional), y que además se muestran correctamente en la **vista** del documento.

## Problema Original

Las tablas de demografía (población por sexo y población por grupo etario) necesitaban:
1. **Cargarse automáticamente desde el backend** al abrir el formulario
2. **Ser de solo lectura** - los datos vienen del backend y no deben ser editados manualmente
3. **No mostrar** botones de agregar fila, eliminar fila, ni fila de totales adicional
4. **Verse correctamente** tanto en el formulario como en la vista del documento

## Solución Implementada

### 1. Configuración de Tabla en Constants (seccion6-constants.ts)

```typescript
export const SECCION6_TABLA_POBLACION_SEXO_CONFIG: TableConfig = {
  tablaKey: 'poblacionSexoAISD',
  totalKey: '',           // ✅ Sin fila de total adicional
  campoTotal: '',         // ✅ Sin campo total
  campoPorcentaje: '',    // ✅ Sin cálculo de porcentaje automático
  calcularPorcentajes: false,
  camposParaCalcular: ['casos'],
  noInicializarDesdeEstructura: true,  // ✅ No inicializar desde estructura
  permiteAgregarFilas: false,           // ✅ Ocultar botón agregar
  permiteEliminarFilas: false           // ✅ Ocultar botón eliminar
};
```

**Propiedades clave:**
- `permiteAgregarFilas: false` - Oculta el botón "+ Agregar Fila"
- `permiteEliminarFilas: false` - Oculta los botones "×" de eliminar cada fila
- `campoTotal: ''` - No muestra fila de totales adicional
- `noInicializarDesdeEstructura: true` - No inicializa con estructura vacía

### 2. Carga de Datos desde el Backend (seccion6-form.component.ts)

```typescript
private cargarDatosDelBackend(): void {
  // ✅ USAR getCodigosCentrosPobladosAISD() DEL GRUPO ACTUAL
  const codigosArray = this.getCodigosCentrosPobladosAISD();
  const codigos = [...codigosArray]; // Copia mutable

  if (!codigos || codigos.length === 0) {
    debugLog('[SECCION6] ⚠️ No hay centros poblados en el grupo actual');
    return;
  }

  // Cargar datos de sexo
  this.backendApi.postDatosDemograficos(codigos).subscribe({
    next: (response: any) => {
      const datosTransformados = transformPoblacionSexoDesdeDemograficos(
        unwrapDemograficoData(response?.data || [])
      );
      
      // 4. Guardar CON prefijo y SIN prefijo (fallback)
      const prefijo = this.obtenerPrefijoGrupo();
      const tablaKey = `poblacionSexoAISD${prefijo}`;
      this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
      this.projectFacade.setField(this.seccionId, null, 'poblacionSexoAISD', datosTransformados);
    }
  });

  // 5. Cargar datos de grupo etario
  this.backendApi.postEtario(codigos).subscribe({ ... });
}
```

**Puntos importantes:**
- ✅ **AISLAMIENTO POR GRUPO**: Se usa `getCodigosCentrosPobladosAISD()` de la clase base `BaseSectionComponent`
- Este método devuelve solo los `ccppIds` específicos del grupo AISD actual
- Cada grupo (A.1, A.2, etc.) cargará sus propios datos demográficos basados en sus centros poblados
- Se obtiene el prefijo del grupo actual y se guarda en claves separadas (`poblacionSexoAISD_A1`, `_A2`, etc.)
- Se usa `[...codigosArray]` para crear una copia mutable del array readonly

### 3. Functions Helper para Desarrollo de Datos

```typescript
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  
  // El backend puede devolver diferentes formatos
  if (Array.isArray(responseData) && responseData.length > 0) {
    return responseData[0]?.rows || responseData;
  }
  if (responseData.data) {
    const data = responseData.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.rows || data;
    }
    return data;
  }
  return [];
};
```

### 4. Configuración en Tables Registry (tables-registry.config.ts)

```typescript
TABLES_REGISTRY.set('seccion6_aisd', [
  {
    sectionKey: 'seccion6_aisd',
    fieldName: 'poblacionSexoAISD',
    tablaKey: 'poblacionSexoAISD',
    endpoint: '/demograficos/datos',    // Endpoint del backend
    method: 'POST',
    paramType: 'id_ubigeo',
    transformType: 'custom',
    customTransform: transformPoblacionSexoDesdeDemograficos,
    editable: false,   // ✅ No editable - datos del backend
    columns: [
      { field: 'sexo', label: 'Sexo', type: 'text' },
      { field: 'casos', label: 'Casos', type: 'number' },
      { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
    ]
  }
]);
```

### 5. Sincronización entre Formulario y Vista

El patrón asegura que los datos se compartan entre formulario y vista mediante el **state centralizado**:

**En el Formulario (seccion6-form.component.ts):**
```typescript
readonly sectionDataSignal: Signal<Record<string, any>> = computed(() => {
  return this.projectFacade.selectSectionFields(this.seccionId, null)();
});

readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
  const prefijo = this.prefijoGrupoSignal();
  const data = this.sectionDataSignal();
  const tablaKey = `poblacionSexoAISD${prefijo}`;
  return data[tablaKey] || data['poblacionSexoAISD'] || [];
});
```

**En la Vista (seccion6-view.component.ts):**
```typescript
readonly vistDataSignal: Signal<Record<string, any>> = computed(() => {
  return this.projectFacade.selectSectionFields(this.seccionId, null)();
});

// Lee los mismos datos que el formulario
getPoblacionSexoConPorcentajes(): any[] {
  const prefijo = this.obtenerPrefijoGrupo();
  const tablaConPrefijo = prefijo ? this.datos[`poblacionSexoAISD${prefijo}`] : null;
  if (tablaConPrefijo && this.tieneContenidoRealDemografia(tablaConPrefijo)) {
    return tablaConPrefijo;
  }
  // Fallback a versión sin prefijo
  return this.datos.poblacionSexoAISD || [];
}
```

### 6. Cómo el Componente DynamicTable Usa la Configuración

En el template del `DynamicTableComponent`:

```html
<!-- Botón agregar fila - se oculta si permiteAgregarFilas es false -->
<button 
  *ngIf="showAddButton && tableData?.length > 0 && !modoVista && (config?.permiteAgregarFilas !== false)"
  type="button" 
  class="btn btn-secondary mt-sm" 
  (click)="onAdd()">
  + Agregar Fila
</button>

<!-- Botón eliminar fila - se oculta si permiteEliminarFilas es false -->
<button 
  type="button" 
  class="btn-icon" 
  (click)="onDelete(i)" 
  *ngIf="canDelete(i) && !modoVista && (config?.permiteEliminarFilas !== false)"
  title="Eliminar fila">
  ×
</button>

<!-- Fila de total - solo se muestra si existe config.campoTotal -->
<tr *ngIf="getTotalRow() && !modoVista" class="total-row">
  ...
</tr>
```

## Flujo Completo de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND                                        │
│  /demograficos/datos  →  /demograficos/etario                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Seccion6FormComponent.cargarDatosDelBackend()            │
│  1. Obtiene centros poblados                                           │
│  2. Extrae códigos (ubigeo)                                            │
│  3. Llama al backend API                                               │
│  4. Transforma datos (unwrap + transform)                               │
│  5. Guarda en state:                                                   │
│     - poblacionSexoAISD_A1 (con prefijo)                              │
│     - poblacionSexoAISD (sin prefijo, fallback)                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼ (State centralizado via ProjectFacade)
┌─────────────────────────────────────────────────────────────────────────┐
│                         VISTA                                           │
│  - Seccion6ViewComponent                                              │
│  - Lee: sectionDataSignal / vistDataSignal                            │
│  - Muestra: getPoblacionSexoConPorcentajes()                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Beneficios del Patrón

1. **Datos de solo lectura**: Los datos demográficos vienen del backend y no pueden ser editados manualmente
2. **Interfaz limpia**: Sin botones de agregar/eliminar que no tienen sentido para datos externos
3. **Sincronización automática**: Los datos se comparten entre formulario y vista mediante el state
4. **Fallback robusto**: Si no hay prefijo de grupo, usa la versión sin prefijo
5. **Transformación flexible**: Los datos del backend se pueden transformar antes de guardar

## Propiedades de TableConfig Resumen

| Propiedad | Valor para Solo Lectura | Propósito |
|-----------|------------------------|-----------|
| `permiteAgregarFilas` | `false` | Ocultar botón agregar |
| `permiteEliminarFilas` | `false` | Ocultar botón eliminar |
| `campoTotal` | `''` | No mostrar fila de total |
| `totalKey` | `''` | No calcular total |
| `campoPorcentaje` | `''` | No calcular porcentaje |
| `calcularPorcentajes` | `false` | No calcular automáticamente |
| `noInicializarDesdeEstructura` | `true` | No iniciar con estructura vacía |
| `editable` | `false` | En registry, indica que no es editable |

## Ejemplo de Uso en Otras Secciones

Para implementar el mismo patrón en otra sección:

1. **Definir la configuración en constants:**
```typescript
export const SECCIONXX_TABLA_CONFIG: TableConfig = {
  tablaKey: 'miTablaCampo',
  permiteAgregarFilas: false,
  permiteEliminarFilas: false,
  campoTotal: '',
  campoPorcentaje: '',
  calcularPorcentajes: false,
  noInicializarDesdeEstructura: true
};
```

2. **Crear método de carga en el componente:**
```typescript
private cargarDatosDelBackend(): void {
  const centrosPoblados = this.projectFacade.allPopulatedCenters()();
  const codigos = centrosPoblados.map(cp => cp.codigo || cp.ubigeo);
  
  this.backendApi.postMiEndpoint(codigos).subscribe({
    next: (response) => {
      const datos = transformMiDatos(response?.data);
      this.projectFacade.setField(this.seccionId, null, 'miTablaCampo', datos);
    }
  });
}
```

3. **Llamar en onInitCustom:**
```typescript
protected override onInitCustom(): void {
  this.cargarDatosDelBackend();
}
```

4. **Registrar en tables-registry.config.ts:**
```typescript
TABLES_REGISTRY.set('seccionxx_aisd', [
  {
    sectionKey: 'seccionxx_aisd',
    fieldName: 'miTablaCampo',
    endpoint: '/mi-endpoint',
    method: 'POST',
    editable: false,
    // ...
  }
]);
```
