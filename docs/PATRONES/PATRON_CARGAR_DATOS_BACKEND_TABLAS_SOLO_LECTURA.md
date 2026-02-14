# Patrón: Cargar Datos del Backend en Tablas de Solo Lectura

## Descripción General

Este documento describe el **patrón estándar** para implementar tablas que se llenan automáticamente con datos del backend, sin permitir edición manual. Este patrón se ha implementado exitosamente en:
- **Sección 6**: Aspectos Demográficos (población por sexo y grupo etario)  
- **Sección 7**: Población Económicamente Activa (PET, PEA, PEA Ocupada)

## Cuándo Usar Este Patrón

✅ **Úsalo cuando**:
- Los datos vienen del backend y **NO deben ser editados** manualmente
- Necesitas **llenar automáticamente** las tablas al abrir el formulario
- Quieres mostrar datos exactos **sin filtros ni cálculos** adicionales
- Los datos deben verse **iguales** en formulario y vista

❌ **NO lo uses cuando**:
- Los usuarios deben poder agregar/eliminar filas manualmente
- Necesitas cálculos o transformaciones complejas de los datos
- Los datos son editables o requieren validación de usuario

## Problema Que Resuelve

Las tablas necesitan:
1. **Cargarse automáticamente desde el backend** al abrir el formulario
2. **Ser de solo lectura** - los datos vienen del backend exactamente como están
3. **No mostrar** botones de agregar/eliminar filas ni controles de edición
4. **Verse exactamente igual** tanto en el formulario como en la vista
5. **NO duplicar filas Total** - el backend ya las envía
6. **NO aplicar estilos especiales** a ninguna fila (todas iguales)

## 🚀 PASOS PARA IMPLEMENTAR (Guía Rápida)

### Paso 1: Configurar la Tabla en Constants
En tu archivo `seccionX-constants.ts`:

```typescript
export const SECCIONX_TABLA_MI_TABLA_CONFIG: TableConfig = {
  tablaKey: 'miTablaKey',
  totalKey: '',                    // ✅ Sin fila de total
  campoTotal: '',                  // ✅ Sin cálculo total
  campoPorcentaje: '',             // ✅ Sin cálculo porcentaje
  calcularPorcentajes: false,      // ✅ No calcular automáticamente
  camposParaCalcular: ['casos'],   // Los campos que ya vienen calculados
  noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
  permiteAgregarFilas: false,      // ✅ Ocultar botón agregar
  permiteEliminarFilas: false      // ✅ Ocultar botón eliminar
};
```

### Paso 2: Función de Transformación de Datos
Crea una función que mapee los datos del backend a tu formato de tabla:

```typescript
const transformMiTablaDesdeDemograficos = (data: any[]): any[] => {
  return data.map(item => ({
    // Mapea EXACTAMENTE los campos del backend a tu tabla
    campo1: item.nombre_campo_backend1,
    campo2: item.nombre_campo_backend2,
    campo3: item.nombre_campo_backend3,
    // 🚨 IMPORTANTE: NO AGREGAR FILAS TOTAL AQUÍ
    // El backend ya las envía, solo mapear los datos
  }));
};
```

### Paso 3: Método de Carga en el Componente
En tu `seccionX-form.component.ts`, agrega:

```typescript
private cargarDatosDelBackend(): void {
  // 1. Obtener los códigos de centros poblados del grupo actual
  const codigosArray = this.getCodigosCentrosPobladosAISD();
  const codigos = [...codigosArray]; // Copia mutable

  if (!codigos || codigos.length === 0) {
    debugLog('[SECCIONX] ⚠️ No hay centros poblados');
    return;
  }

  // 2. Llamar al backend para cada tabla que necesites
  this.backendApi.postMiEndpoint(codigos).subscribe({
    next: (response: any) => {
      // 3. Transformar datos usando tu función
      const datosTransformados = transformMiTablaDesdeDemograficos(
        unwrapDemograficoData(response?.data || [])
      );
      
      // 4. Guardar con prefijo del grupo y sin prefijo (fallback)
      const prefijo = this.obtenerPrefijoGrupo();
      const tablaKey = `miTablaKey${prefijo}`;
      this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
      this.projectFacade.setField(this.seccionId, null, 'miTablaKey', datosTransformados);
    },
    error: (error) => console.error('[SECCIONX] Error:', error)
  });
}
```

### Paso 4: Inicializar Tablas Vacías
En el mismo componente, agrega:

```typescript
private inicializarTablasVacias(): void {
  const prefijo = this.obtenerPrefijoGrupo();
  
  // Inicializar cada tabla como array vacío
  this.projectFacade.setField(this.seccionId, null, `miTablaKey${prefijo}`, []);
  this.projectFacade.setField(this.seccionId, null, 'miTablaKey', []);
}
```

### Paso 5: Llamar Métodos en onInitCustom
```typescript
protected override onInitCustom(): void {
  super.onInitCustom();
  this.inicializarTablasVacias();  // Primero vacías
  this.cargarDatosDelBackend();    // Luego llenar con backend
}
```

### Paso 6: Signals para Leer los Datos
```typescript
readonly miTablaSignal: Signal<any[]> = computed(() => {
  const prefijo = this.prefijoGrupoSignal();
  const data = this.sectionDataSignal();
  const tablaKey = `miTablaKey${prefijo}`;
  return data[tablaKey] || data['miTablaKey'] || [];
});
```

### Paso 7: Usar en el Template
```html
<dynamic-table 
  [tableData]="miTablaSignal()"
  [config]="SECCIONX_TABLA_MI_TABLA_CONFIG"
  [modoVista]="false">
</dynamic-table>
```

### Paso 7.1: ⚠️ CRÍTICO - Template HTML para Vista
En `seccionX-view.component.html`, **NUNCA** uses:
```html
<!-- ❌ MAL: No usar estas clases ni estilos especiales -->
<tr *ngFor="let item of datos" [class.total-row]="item.categoria === 'Total'">
  <td><strong *ngIf="item.categoria === 'Total'">{{ item.categoria }}</strong></td>
</tr>
```

✅ **CORRECTO**: Todas las filas iguales, sin estilos especiales:
```html
<tr *ngFor="let item of datos">
  <td><span [appDataSource]="'backend'">{{ item.categoria }}</span></td>
  <td><span [appDataSource]="'backend'">{{ item.casos }}</span></td>
  <td><span [appDataSource]="'backend'">{{ item.porcentaje }}</span></td>
</tr>
```

### Paso 8: Configurar Vista (seccionX-view.component.ts)
```typescript
getMiTablaData(): any[] {
  const prefijo = this.obtenerPrefijoGrupo();
  const tablaConPrefijo = prefijo ? this.datos[`miTablaKey${prefijo}`] : null;
  if (tablaConPrefijo && tablaConPrefijo.length > 0) {
    return tablaConPrefijo;
  }
  return this.datos.miTablaKey || [];
}
```

## 📋 CHECKLIST DE IMPLEMENTACIÓN

Para usar este patrón en cualquier sección, marca cada paso:

- [ ] **Constants**: ✅ Creado TableConfig con `permiteAgregarFilas: false`  
- [ ] **Transform**: ✅ Función de transformación que mapea backend → frontend
- [ ] **Backend**: ✅ Método `cargarDatosDelBackend()` que llama al API
- [ ] **Vacías**: ✅ Método `inicializarTablasVacias()` que inicializa arrays vacíos
- [ ] **Init**: ✅ Llamar ambos métodos en `onInitCustom()`
- [ ] **Signals**: ✅ Signal computed que lee los datos con prefijo/fallback
- [ ] **Template**: ✅ `<dynamic-table>` usando el signal y config
- [ ] **Vista**: ✅ Método getter en `seccionX-view.component.ts`
- [ ] **🚨 NO DUPLICAR TOTAL**: ✅ Verificar que NO se agregue filas Total en código
- [ ] **🚨 SIN ESTILOS ESPECIALES**: ✅ No usar `[class.total-row]` ni `<strong>` en template
- [ ] **Verificar**: ✅ Datos se ven iguales en formulario y vista

## 📊 EJEMPLOS REALES

### Ejemplo 1: Sección 6 - Aspectos Demográficos

**Constants (seccion6-constants.ts):**
```typescript
export const SECCION6_TABLA_POBLACION_SEXO_CONFIG: TableConfig = {
  tablaKey: 'poblacionSexoAISD',
  totalKey: '',
  campoTotal: '',
  campoPorcentaje: '',
  calcularPorcentajes: false,
  camposParaCalcular: ['casos'],
  noInicializarDesdeEstructura: true,
  permiteAgregarFilas: false,
  permiteEliminarFilas: false
};
```

**Transform Function:**
```typescript
const transformPoblacionSexoDesdeDemograficos = (data: any[]): any[] => {
  return data.map(item => ({
    sexo: item.sexo || '',
    casos: parseFloat(item.casos) || 0,
    porcentaje: item.porcentaje || ''
  }));
};
```

**Carga de Datos:**

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

## 🚨 ERRORES COMUNES A EVITAR

### ❌ Error 1: Duplicar Filas Total
**Problema**: Agregar manualmente filas Total cuando el backend ya las envía
```typescript
// ❌ MAL: No hacer esto si el backend ya envía la fila Total
const filaTotal = { categoria: 'Total', casos: total, porcentaje: '100,00 %' };
tablaConPorcentajes.push(filaTotal);
```
**Solución**: Dejar que el backend envíe la fila Total
```typescript
// ✅ BIEN: Solo devolver los datos del backend sin modificar
return tablaConPorcentajes;
```

### ❌ Error 2: Estilos Especiales para Fila Total
**Problema**: Hacer que la fila Total se vea diferente con CSS o negritas
```html
<!-- ❌ MAL: No usar estilos especiales -->
<tr [class.total-row]="item.categoria === 'Total'">
  <td><strong *ngIf="item.categoria === 'Total'">{{ item.categoria }}</strong></td>
</tr>
```
**Solución**: Todas las filas con el mismo estilo
```html
<!-- ✅ BIEN: Todas las filas iguales -->
<tr *ngFor="let item of datos">
  <td><span [appDataSource]="'backend'">{{ item.categoria }}</span></td>
</tr>
```

### ❌ Error 3: Duplicación en Form Y View Components
**Problema**: Tanto el form component como el view component agregan Total
**Solución**: Verificar AMBOS archivos:
- `seccionX-form.component.ts`
- `seccionX-view.component.ts`

## Beneficios del Patrón

1. **Datos exactos del backend**: Sin modificaciones, cálculos o agregados manuales
2. **Interfaz limpia**: Sin botones de agregar/eliminar que no tienen sentido para datos externos
3. **Estilo uniforme**: Todas las filas se ven iguales, sin destacar ninguna
4. **Sincronización automática**: Los datos se comparten entre formulario y vista mediante el state
5. **Fallback robusto**: Si no hay prefijo de grupo, usa la versión sin prefijo
6. **Sin duplicaciones**: Una sola fuente de verdad (el backend)

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
