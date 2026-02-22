# 📋 Guía Completa: Implementar Tablas Manuales en Secciones

## Índice
1. [Overview](#overview)
2. [Configuración Básica](#configuración-básica)
3. [Paso a Paso: Desactivar Backend](#paso-a-paso-desactivar-backend)
4. [Paso a Paso: Configurar Tabla Manual](#paso-a-paso-configurar-tabla-manual)
5. [Paso a Paso: Handler de Tabla](#paso-a-paso-handler-de-tabla)
6. [Paso a Paso: Vista (View Component)](#paso-a-paso-vista-view-component)
7. [Ejemplo Completo: Sección 9](#ejemplo-completo-sección-9)
8. [Testing y Validación](#testing-y-validación)

---

## Overview

Una **tabla manual** permite a los usuarios ingresar datos directamente en el formulario sin depender de un endpoint del backend. Los datos se calculan automáticamente (totales, porcentajes) y se guardan en Redis.

### Características clave:
- ✅ Usuario agrega filas manualmente con botón "+ Agregar Fila"
- ✅ Cálculo automático de porcentajes y totales
- ✅ Los datos se almacenan en tiempo real (persistencia en Redis)
- ✅ La vista muestra los datos formateados correctamente
- ✅ Compatible con prefijos de grupo (_A1, _A2, etc.)

---

## Configuración Básica

### Archivos involucrados en una tabla manual:

```
seccion{N}/
├── seccion{N}-constants.ts         ← Configuración y constantes
├── seccion{N}-form.component.ts    ← Formulario (agregar/editar)
├── seccion{N}-form.component.html  ← HTML del formulario
├── seccion{N}-view.component.ts    ← Lectura de datos
└── seccion{N}-view.component.html  ← Mostrar datos en vista
```

---

## Paso a Paso: Desactivar Backend

Si tu tabla carga datos del backend automáticamente, primero hay que deshabilitarlo.

### Paso 1: Identificar el endpoint
En `seccion{N}-form.component.ts`, busca métodos como:
```typescript
private cargarDatosDelBackend(): void {
  this.backendApi.post[TuEndpoint](codigos).subscribe({
    // ...
  });
}
```

### Paso 2: Comentar/Deshabilitar la llamada
En el método `onInitCustom()`, comenta la llamada al endpoint:

```typescript
protected override onInitCustom(): void {
  // ...
  
  if (!tieneDatosPersistidos) {
    console.log('[TuSeccion] Inicializando tablas vacías (modo manual)');
    this.inicializarTablasVacias();
    // ❌ COMENTADO: this.cargarDatosDelBackend();
  }
  
  this.cargarFotografias();
}
```

### Paso 3: Opcional - Añadir flag de control
Para facilitar el cambio en el futuro:

```typescript
// Flag para control manual del backend
private skipBackendLoading: boolean = true;  // ← true = modo manual

protected override onInitCustom(): void {
  if (!tieneDatosPersistidos) {
    this.inicializarTablasVacias();
    if (!this.skipBackendLoading) {
      this.cargarDatosDelBackend();
    }
  }
}
```

---

## Paso a Paso: Configurar Tabla Manual

### Paso 1: Definir la configuración en constants

En `seccion{N}-constants.ts`, asegúrate de que **`totalKey` esté vacío** (no sea el nombre de un campo):

```typescript
/**
 * Para tablas MANUALES: totalKey vacío permite agregar filas normalmente
 * Si totalKey='categoria', interfiere con la adición de filas
 */
export const SECCION{N}_TABLA_{NOMBRE}_CONFIG: TableConfig = {
  tablaKey: '{nombreTabla}Tabla',
  
  // ⭐ IMPORTANTE: totalKey VACÍO para modo manual
  totalKey: '',                              // ← VACÍO
  
  // Campos para calcular
  campoTotal: 'casos',                      // El campo que contiene números
  campoPorcentaje: 'porcentaje',            // El campo para mostrar %
  
  // Opciones
  calcularPorcentajes: true,                // Habilitar cálculo automático
  camposParaCalcular: ['casos'],            // Qué campos se usan para calcular
  noInicializarDesdeEstructura: true,       // No llenar con datos iniciales
  
  // Permisos de usuario
  permiteAgregarFilas: true,                // ✅ Botón "+ Agregar Fila"
  permiteEliminarFilas: true                // ✅ Botón eliminar fila
};
```

### Paso 2: Verificar estructura de datos esperada

Define también la estructura de columnas:

```typescript
export const SECCION{N}_COLUMNAS_TABLA: TableColumn[] = [
  {
    field: 'categoria',
    label: 'Categoría',
    type: 'text',
    placeholder: 'Ej: Viviendas ocupadas'
  },
  {
    field: 'casos',
    label: 'Casos',
    type: 'number',
    placeholder: '0'
  },
  {
    field: 'porcentaje',
    label: 'Porcentaje',
    type: 'text',
    placeholder: '0,00 %'
  }
];
```

---

## Paso a Paso: Handler de Tabla

El handler se encarga de recibir cambios de la tabla, calcular porcentajes/totales y guardar.

### Paso 1: Importar dependencias en form.component.ts

```typescript
import { TablePercentageHelper } from '../../utils/table-percentage-helper';
```

### Paso 2: Crear el getter para la configuración

```typescript
get miTablaConfig(): TableConfig {
  return {
    ...SECCION{N}_TABLA_CONFIG,
    tablaKey: this.getTablaKey()
  };
}

getTablaKey(): string {
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  return prefijo ? `miTabla${prefijo}` : 'miTabla';
}
```

### Paso 3: Implementar el handler `onTableUpdated()`

```typescript
onMiTablaTableUpdated(updatedData?: any[]): void {
  // 1️⃣ Obtener datos actuales
  const formData = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const tablaKey = prefijo ? `miTabla${prefijo}` : 'miTabla';
  const tablaKeyBase = 'miTabla';
  
  // 2️⃣ Usar datos del evento o del formulario
  let tablaActual = updatedData || formData[tablaKey] || [];
  
  // 3️⃣ CALCULAR PORCENTAJES Y TOTAL
  if (tablaActual.length > 0) {
    // Clonar para no mutar original
    const tablaClon = JSON.parse(JSON.stringify(tablaActual));
    
    // Usar TablePercentageHelper (igual que sección 8)
    tablaActual = TablePercentageHelper.calcularPorcentajesSimple(tablaClon, tablaKey) 
                  || tablaActual;
  }
  
  console.log('[TuSeccion] 💾 Guardando tabla con cálculos:', tablaActual);
  
  // 4️⃣ GUARDAR en estado (con y sin prefijo)
  this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
  this.projectFacade.setField(this.seccionId, null, tablaKeyBase, tablaActual);
  
  // 5️⃣ PERSISTIR en Redis
  try {
    this.formChange.persistFields(this.seccionId, 'table', 
      { [tablaKey]: tablaActual, [tablaKeyBase]: tablaActual }, 
      { notifySync: true }
    );
    console.log('[TuSeccion] ✅ Tabla guardada en Redis');
  } catch (e) {
    console.error('[TuSeccion] ⚠️ Error guardando:', e);
  }
  
  this.cdRef.markForCheck();
}
```

### Paso 4: Conectar el handler en el HTML

En `seccion{N}-form.component.html`:

```html
<app-dynamic-table
  [datos]="formDataSignal()"
  [config]="miTablaConfig"
  [columns]="[
    { field: 'categoria', label: 'Categoría', type: 'text' },
    { field: 'casos', label: 'Casos', type: 'number' },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text' }
  ]"
  [sectionId]="seccionId"
  [tablaKey]="getTablaKey()"
  [showAddButton]="true"
  [showDeleteButton]="true"
  (tableUpdated)="onMiTablaTableUpdated($event)">
</app-dynamic-table>
```

---

## Paso a Paso: Vista (View Component)

La vista debe **formatear correctamente** los valores que pueden ser objetos.

### Paso 1: Agregar método formateador

En `seccion{N}-view.component.ts`:

```typescript
/**
 * Convierte valores que pueden ser objetos { value: '...', isCalculated: true }
 * a strings simples para mostrar en la vista
 */
formatearValorTabla(valor: any): string {
  // Si es objeto con propiedad 'value'
  if (valor && typeof valor === 'object' && valor.value !== undefined) {
    return String(valor.value);
  }
  // Si es string o número
  if (valor !== null && valor !== undefined) {
    return String(valor);
  }
  // Valor vacío
  return '';
}
```

### Paso 2: Getter para obtener datos

```typescript
getMiTablaData(): any[] {
  const prefijo = this.obtenerPrefijoGrupo();
  const tablaKey = prefijo ? `miTabla${prefijo}` : 'miTabla';
  return this.datos[tablaKey] || [];
}
```

### Paso 3: Usar el formateador en HTML

En `seccion{N}-view.component.html`:

```html
<table class="table-container">
  <thead>
    <tr>
      <th class="table-header">Categoría</th>
      <th class="table-header">Casos</th>
      <th class="table-header">Porcentaje</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let item of getMiTablaData()">
      <td class="table-cell">
        <span>{{ formatearValorTabla(item.categoria) }}</span>
      </td>
      <td class="table-cell">
        <span>{{ formatearValorTabla(item.casos) }}</span>
      </td>
      <td class="table-cell">
        <span>{{ formatearValorTabla(item.porcentaje) }}</span>
      </td>
    </tr>
  </tbody>
</table>
```

---

## Ejemplo Completo: Sección 9

### Archivos modificados:

#### 1. `seccion9-constants.ts`
```typescript
export const SECCION9_TABLA_CONDICION_OCUPACION_CONFIG: TableConfig = {
  tablaKey: 'condicionOcupacionTabla',
  totalKey: '',                              // ✅ VACÍO
  campoTotal: 'casos',
  campoPorcentaje: 'porcentaje',
  calcularPorcentajes: true,
  camposParaCalcular: ['casos'],
  noInicializarDesdeEstructura: true,
  permiteAgregarFilas: true,
  permiteEliminarFilas: true
};
```

#### 2. `seccion9-form.component.ts` (inicio)
```typescript
// Flag para controlar backend
private skipCondicionBackend: boolean = true;

protected override onInitCustom(): void {
  this.limpiarFilaLegadaCondicion();
  
  const prefijo = this.obtenerPrefijoGrupo();
  const formData = this.formDataSignal();
  const condicionOcupacionKey = prefijo 
    ? `condicionOcupacionTabla${prefijo}` 
    : 'condicionOcupacionTabla';
  const existingData = formData[condicionOcupacionKey];
  
  const tieneDatos = existingData && Array.isArray(existingData) 
    && existingData.length > 0;
  
  if (!tieneDatos) {
    console.log('[SECCION9] Modo manual - sin cargar backend');
    this.inicializarTablasVacias();
    // ❌ NO cargar del backend
  }
  
  this.cargarFotografias();
}
```

#### 3. `seccion9-form.component.ts` (handler)
```typescript
onCondicionOcupacionTableUpdated(updatedData?: any[]): void {
  const formData = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const tablaKey = prefijo 
    ? `condicionOcupacionTabla${prefijo}` 
    : 'condicionOcupacionTabla';
  const tablaKeyBase = 'condicionOcupacionTabla';
  
  let tablaActual = updatedData || formData[tablaKey] || [];
  
  // Calcular porcentajes
  if (tablaActual.length > 0) {
    const tablaClon = JSON.parse(JSON.stringify(tablaActual));
    tablaActual = TablePercentageHelper.calcularPorcentajesSimple(
      tablaClon, 
      tablaKey
    ) || tablaActual;
  }
  
  // Guardar
  this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
  this.projectFacade.setField(this.seccionId, null, tablaKeyBase, tablaActual);
  
  try {
    this.formChange.persistFields(this.seccionId, 'table', 
      { [tablaKey]: tablaActual, [tablaKeyBase]: tablaActual }, 
      { notifySync: true }
    );
  } catch (e) {
    console.error(e);
  }
  
  this.cdRef.markForCheck();
}
```

#### 4. `seccion9-form.component.html`
```html
<app-dynamic-table
  [datos]="formDataSignal()"
  [config]="condicionOcupacionConfig"
  [columns]="[
    { field: 'categoria', label: 'Condición de ocupación', type: 'text' },
    { field: 'casos', label: 'Casos', type: 'number' },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text' }
  ]"
  [sectionId]="seccionId"
  [tablaKey]="getTablaKeyCondicionOcupacion()"
  [showAddButton]="true"
  [showDeleteButton]="true"
  (tableUpdated)="onCondicionOcupacionTableUpdated($event)">
</app-dynamic-table>
```

#### 5. `seccion9-view.component.ts`
```typescript
formatearValorTabla(valor: any): string {
  if (valor && typeof valor === 'object' && valor.value !== undefined) {
    return String(valor.value);
  }
  if (valor !== null && valor !== undefined) {
    return String(valor);
  }
  return '';
}

getCondicionOcupacionData(): any[] {
  const prefijo = this.obtenerPrefijoGrupo();
  const tablaKey = prefijo 
    ? `condicionOcupacionTabla${prefijo}` 
    : 'condicionOcupacionTabla';
  return this.datos[tablaKey] || [];
}
```

#### 6. `seccion9-view.component.html`
```html
<tr *ngFor="let item of getCondicionOcupacionData()">
  <td class="table-cell">
    <span>{{ formatearValorTabla(item.categoria) }}</span>
  </td>
  <td class="table-cell">
    <span>{{ formatearValorTabla(item.casos) }}</span>
  </td>
  <td class="table-cell">
    <span>{{ formatearValorTabla(item.porcentaje) }}</span>
  </td>
</tr>
```

---

## Testing y Validación

### Checklist de validación:

- [ ] **Formulario abre sin errores**
  - Consola: sin errores de TypeScript
  - Tabla aparece vacía o con datos guardados

- [ ] **Agregar fila funciona**
  - Botón "+ Agregar Fila" es visible
  - Click genera nueva fila editable
  - Segundas clicks agregan más filas (sin límite)

- [ ] **Cálculos automáticos**
  - Ingreso "Viviendas ocupadas | 141"
  - Automáticamente aparece porcentaje "85,98 %"
  - Fila "Total | 141 | 100,00 %" aparece o se actualiza

- [ ] **Persistencia en Redis**
  - Recarga la página (F5)
  - Los datos siguen ahí (no se borraron)
  - Consola: logs de persistencia

- [ ] **Vista muestra datos correctamente**
  - No hay "[object Object]"
  - Números y textos aparecen claros
  - Porcentajes con formato "XX,XX %"

- [ ] **Eliminación de filas**
  - Botón "×" en cada fila (excepto Total)
  - Fila se elimina
  - Porcentajes se recalculan automáticamente

### Logs útiles para debuggear:

En el navegador, abre la **consola (F12)** y busca:

```
[TuSeccion] 💾 Guardando tabla con cálculos
[TuSeccion] ✅ Tabla guardada en Redis
[DynamicTable] 📋 getEditableRows
```

---

## Conclusión

### Pasos resumidos para crear una tabla manual:

1. ✅ **Desactivar endpoint** en `onInitCustom()`
2. ✅ **Configurar tabla** con `totalKey: ''` en constants
3. ✅ **Implementar handler** con `TablePercentageHelper`
4. ✅ **Conectar en HTML** con evento `(tableUpdated)`
5. ✅ **Formatear en vista** con `formatearValorTabla()`

**Resultado**: Usuario obtiene tabla completamente funcional, sin dependencias de backend, con cálculos automáticos y persistencia.

