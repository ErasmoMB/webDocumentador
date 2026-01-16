# 📋 Receta: Tablas Dinámicas Sincronizadas en Formularios

Esta guía explica cómo implementar una tabla dinámica funcional en el formulario de datos que esté completamente sincronizada con la tabla de la sección.

## 🎯 Objetivo

Crear una tabla que:
- ✅ Se muestre en el formulario con capacidad de edición
- ✅ Se sincronice automáticamente con la vista de sección
- ✅ Maneje prefijos automáticamente (`_A1`, `_A2`, `_B1`, `_B2`)
- ✅ Normalice claves (mayúsculas/minúsculas)
- ✅ Permita llenar campos vacíos desde otras fuentes de datos

---

## 📦 Componentes Necesarios

### Servicios Requeridos

```typescript
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { TableAdapterService } from 'src/app/core/services/table-adapter.service';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
```

### Componente HTML

```html
<app-dynamic-table
  [datos]="datos"
  [config]="miTablaConfig"
  [columns]="columnasTabla"
  [tablaKey]="'miTablaDatos'"
  [totalKey]="'campoPrincipal'"
  (tableUpdated)="onTablaActualizada()">
</app-dynamic-table>
```

---

## 🔧 Paso 1: Configurar la Tabla en TypeScript

### 1.1 Definir la Configuración de la Tabla

```typescript
export class MiSeccionFormWrapperComponent extends BaseSectionComponent {
  
  miTablaConfig: TableConfig = {
    tablaKey: 'miTablaDatos',
    totalKey: 'campoPrincipal',
    campoTotal: 'campoPrincipal',
    campoPorcentaje: '',
    estructuraInicial: [{
      campoPrincipal: '',
      campo2: '',
      campo3: ''
    }]
  };
}
```

**Parámetros importantes:**
- `tablaKey`: Nombre del campo en `datos` que contiene el array
- `totalKey`: Campo principal de la tabla (usado para identificar filas)
- `estructuraInicial`: Estructura de una fila vacía

### 1.2 Agregar Campos a `watchedFields`

```typescript
override watchedFields: string[] = [
  'miTablaDatos',
  'miTablaCampo1',
  'miTablaCampo2',
  'miTablaCampo3',
  // ... otros campos relacionados
];
```

---

## 🎨 Paso 2: Configurar el HTML

### 2.1 Definir las Columnas

```typescript
get columnasTabla(): TableColumn[] {
  return [
    { 
      field: 'campoPrincipal', 
      label: 'Campo Principal', 
      type: 'text', 
      placeholder: 'Ej: Valor ejemplo' 
    },
    { 
      field: 'campo2', 
      label: 'Campo 2', 
      type: 'text', 
      placeholder: 'Ej: Otro valor' 
    },
    { 
      field: 'campo3', 
      label: 'Campo 3', 
      type: 'number', 
      placeholder: 'Ej: 0' 
    }
  ];
}
```

### 2.2 Usar el Componente en el HTML

```html
<div class="form-field" style="margin-top: 15px;">
  <label class="label">Mi Tabla</label>
  <app-dynamic-table
    [datos]="datos"
    [config]="miTablaConfig"
    [columns]="columnasTabla"
    [tablaKey]="'miTablaDatos'"
    [totalKey]="'campoPrincipal'"
    (tableUpdated)="onTablaActualizada()">
  </app-dynamic-table>
</div>
```

---

## 🔄 Paso 3: Implementar la Lógica de Inicialización

### 3.1 Método de Inicialización Completo

```typescript
inicializarTablas(): void {
  if (this.sincronizando || !this.datos) {
    return;
  }
  
  this.sincronizando = true;
  const prefijo = this.obtenerPrefijoGrupo();
  
  const prefijosPosibles = ['', '_A1', '_A2', '_B1', '_B2'];
  let prefijoDetectado = prefijo;
  
  if (!prefijo) {
    for (const prefijoTest of prefijosPosibles) {
      const campoTest = `miTablaCampoPrincipal${prefijoTest}`;
      if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '') {
        prefijoDetectado = prefijoTest;
        console.log(`[MiComponente] Prefijo detectado: ${prefijoTest}`);
        break;
      }
    }
  }
  
  const tieneArrayValido = this.datos.miTablaDatos && 
    Array.isArray(this.datos.miTablaDatos) &&
    this.datos.miTablaDatos.length > 0 &&
    this.datos.miTablaDatos.some((fila: any) => {
      const campoPrincipal = fila.campoPrincipal || fila.CampoPrincipal || '';
      return campoPrincipal && campoPrincipal.toString().trim() !== '' && campoPrincipal !== '____';
    });
  
  if (tieneArrayValido) {
    this.normalizarArrayTabla(prefijoDetectado);
  } else {
    const tieneDatosIndividuales = !!(this.datos[`miTablaCampoPrincipal${prefijoDetectado}`] || 
      this.datos.miTablaCampoPrincipal);
    
    if (tieneDatosIndividuales) {
      this.sincronizarDesdeCamposIndividuales(prefijoDetectado);
    } else {
      this.crearTablaVacia();
    }
  }
  
  setTimeout(() => {
    this.sincronizando = false;
  }, 0);
}
```

### 3.2 Normalizar Array (Manejo de Mayúsculas/Minúsculas)

```typescript
normalizarArrayTabla(prefijo: string): void {
  if (!this.datos.miTablaDatos || !Array.isArray(this.datos.miTablaDatos)) {
    return;
  }
  
  const arrayNormalizado = this.datos.miTablaDatos.map((fila: any) => {
    return {
      campoPrincipal: fila.campoPrincipal || fila.CampoPrincipal || '',
      campo2: fila.campo2 || fila.Campo2 || '',
      campo3: fila.campo3 || fila.Campo3 || ''
    };
  });
  
  this.datos.miTablaDatos = arrayNormalizado;
  this.formularioService.actualizarDato('miTablaDatos', arrayNormalizado);
}
```

### 3.3 Sincronizar desde Campos Individuales

```typescript
sincronizarDesdeCamposIndividuales(prefijo: string): void {
  this.tableAdapter.sincronizarArrayDesdeCamposIndividuales(
    this.datos,
    'miTablaDatos',
    {
      baseField: 'miTabla',
      fields: ['CampoPrincipal', 'Campo2', 'Campo3']
    },
    prefijo,
    1,
    false,
    true
  );
  
  if (this.datos.miTablaDatos && Array.isArray(this.datos.miTablaDatos) && 
      this.datos.miTablaDatos.length > 0) {
    const primeraFila = this.datos.miTablaDatos[0];
    if (!primeraFila.campoPrincipal || primeraFila.campoPrincipal.toString().trim() === '') {
      primeraFila.campoPrincipal = this.obtenerValorPorDefecto();
      this.formularioService.actualizarDato('miTablaDatos', this.datos.miTablaDatos);
    }
  }
}
```

### 3.4 Crear Tabla Vacía

```typescript
crearTablaVacia(): void {
  const valorPorDefecto = this.obtenerValorPorDefecto();
  const filaInicial = {
    campoPrincipal: valorPorDefecto,
    campo2: this.datos.miTablaCampo2 || '',
    campo3: this.datos.miTablaCampo3 || ''
  };
  
  this.datos.miTablaDatos = [filaInicial];
  this.formularioService.actualizarDato('miTablaDatos', this.datos.miTablaDatos);
}
```

---

## 🔄 Paso 4: Sincronización Bidireccional

### 4.1 Sincronizar Tabla → Campos Individuales

```typescript
sincronizarCamposDesdeTablas(): void {
  if (this.sincronizando) {
    return;
  }
  
  this.sincronizando = true;
  const prefijo = this.obtenerPrefijoGrupo();
  
  const prefijosPosibles = ['', '_A1', '_A2', '_B1', '_B2'];
  let prefijoDetectado = prefijo;
  
  if (!prefijo) {
    for (const prefijoTest of prefijosPosibles) {
      const campoTest = `miTablaCampoPrincipal${prefijoTest}`;
      if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '') {
        prefijoDetectado = prefijoTest;
        break;
      }
    }
  }
  
  this.tableAdapter.sincronizarCamposIndividualesDesdeArray(
    this.datos,
    'miTablaDatos',
    {
      baseField: 'miTabla',
      fields: ['CampoPrincipal', 'Campo2', 'Campo3']
    },
    prefijoDetectado,
    1,
    false,
    false
  );
  
  this.formularioService.actualizarDatos(this.datos);
  
  setTimeout(() => {
    this.sincronizando = false;
  }, 0);
}
```

### 4.2 Sincronizar Campos Individuales → Tabla

```typescript
sincronizarTablasDesdeCampos(): void {
  if (this.sincronizando || !this.datos) {
    return;
  }
  
  this.sincronizando = true;
  const prefijo = this.obtenerPrefijoGrupo();
  
  const prefijosPosibles = ['', '_A1', '_A2', '_B1', '_B2'];
  let prefijoDetectado = prefijo;
  
  if (!prefijo) {
    for (const prefijoTest of prefijosPosibles) {
      const campoTest = `miTablaCampoPrincipal${prefijoTest}`;
      if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '') {
        prefijoDetectado = prefijoTest;
        break;
      }
    }
  }
  
  const tieneDatosIndividuales = !!(this.datos[`miTablaCampoPrincipal${prefijoDetectado}`] || 
    this.datos.miTablaCampoPrincipal);
  
  if (tieneDatosIndividuales || !this.datos.miTablaDatos || this.datos.miTablaDatos.length === 0) {
    this.tableAdapter.sincronizarArrayDesdeCamposIndividuales(
      this.datos,
      'miTablaDatos',
      {
        baseField: 'miTabla',
        fields: ['CampoPrincipal', 'Campo2', 'Campo3']
      },
      prefijoDetectado,
      1,
      false,
      false
    );
  }
  
  setTimeout(() => {
    this.sincronizando = false;
  }, 0);
}
```

### 4.3 Handler de Actualización de Tabla

```typescript
onTablaActualizada(): void {
  console.log('[MiComponente] Tabla actualizada');
  this.sincronizarCamposDesdeTablas();
  this.cdRef.detectChanges();
}
```

---

## 🎯 Paso 5: Llenar Campos Vacíos desde Otras Fuentes

### 5.1 Ejemplo: Llenar Localidad desde AISD2

```typescript
normalizarArrayTabla(prefijo: string): void {
  if (!this.datos.miTablaDatos || !Array.isArray(this.datos.miTablaDatos)) {
    return;
  }
  
  let valorDesdeOtraTabla = '';
  
  if (this.datos.otraTablaDatos && Array.isArray(this.datos.otraTablaDatos) && 
      this.datos.otraTablaDatos.length > 0) {
    const primeraFilaOtraTabla = this.datos.otraTablaDatos[0];
    const campoRelevante = primeraFilaOtraTabla?.campoRelevante || primeraFilaOtraTabla?.CampoRelevante || '';
    if (campoRelevante && campoRelevante.toString().trim() !== '' && campoRelevante !== '____') {
      valorDesdeOtraTabla = campoRelevante.toString().trim();
    }
  }
  
  if (!valorDesdeOtraTabla) {
    const prefijosPosibles = ['', '_A1', '_A2', '_B1', '_B2'];
    for (const prefijoTest of prefijosPosibles) {
      const campoTest = `otraTablaFila1CampoRelevante${prefijoTest}`;
      if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '' && 
          this.datos[campoTest] !== '____') {
        valorDesdeOtraTabla = this.datos[campoTest].toString().trim();
        break;
      }
    }
  }
  
  const arrayNormalizado = this.datos.miTablaDatos.map((fila: any) => {
    const campoPrincipal = fila.campoPrincipal || fila.CampoPrincipal || '';
    const campoPrincipalFinal = campoPrincipal && campoPrincipal.toString().trim() !== '' && 
      campoPrincipal !== '____' 
      ? campoPrincipal 
      : (this.datos.miTablaCampoPrincipal && 
         this.datos.miTablaCampoPrincipal.toString().trim() !== '' && 
         this.datos.miTablaCampoPrincipal !== '____'
        ? this.datos.miTablaCampoPrincipal 
        : (valorDesdeOtraTabla || ''));
    
    return {
      campoPrincipal: campoPrincipalFinal,
      campo2: fila.campo2 || fila.Campo2 || '',
      campo3: fila.campo3 || fila.Campo3 || ''
    };
  });
  
  this.datos.miTablaDatos = arrayNormalizado;
  this.formularioService.actualizarDato('miTablaDatos', arrayNormalizado);
}
```

---

## 🔄 Paso 6: Detección de Cambios en Arrays (CRÍTICO)

### 6.1 Problema: Los Cambios No Se Reflejan en la Vista de Sección

Si los cambios en la tabla del formulario no se reflejan en la vista de sección, el problema está en el método `detectarCambios()` del componente de sección. La comparación `!==` no funciona para arrays porque compara referencias, no contenido.

### 6.2 Solución: Comparación Profunda de Arrays

**En el componente de sección** (ej: `seccion4.component.ts`):

```typescript
protected override detectarCambios(): boolean {
  const datosActuales = this.formularioService.obtenerDatos();
  const prefijo = this.obtenerPrefijoGrupo();
  const campoConPrefijo = prefijo ? `grupoAISD${prefijo}` : 'grupoAISD';
  const grupoAISDActual = datosActuales[campoConPrefijo] || datosActuales['grupoAISD'] || null;
  const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
  const grupoAISDEnDatos = this.datos.grupoAISD || null;
  
  let hayCambios = false;
  
  for (const campo of this.watchedFields) {
    const valorActual = (datosActuales as any)[campo] || null;
    const valorAnterior = this.datosAnteriores[campo] || null;
    
    let haCambiado = false;
    
    if (Array.isArray(valorActual) || Array.isArray(valorAnterior)) {
      haCambiado = JSON.stringify(valorActual) !== JSON.stringify(valorAnterior);
    } else if (typeof valorActual === 'object' && valorActual !== null || 
               typeof valorAnterior === 'object' && valorAnterior !== null) {
      haCambiado = JSON.stringify(valorActual) !== JSON.stringify(valorAnterior);
    } else {
      haCambiado = valorActual !== valorAnterior;
    }
    
    if (haCambiado) {
      hayCambios = true;
      if (Array.isArray(valorActual)) {
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      } else if (typeof valorActual === 'object' && valorActual !== null) {
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      } else {
        this.datosAnteriores[campo] = valorActual;
      }
    }
  }
  
  const hayCambioGrupoAISD = grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos;
  
  if (hayCambioGrupoAISD || hayCambios) {
    return true;
  }
  
  return false;
}
```

**Puntos clave:**
- ✅ Usar `JSON.stringify()` para comparar arrays y objetos
- ✅ Hacer copia profunda al guardar: `JSON.parse(JSON.stringify(valorActual))`
- ✅ Limpiar caché en `actualizarDatosCustom()` cuando se detectan cambios

### 6.3 Limpiar Caché en `actualizarDatosCustom()`

```typescript
protected override actualizarDatosCustom(): void {
  this.filasCache = null;
  this.ultimoPrefijoCache = null;
  this.cargarFotografias();
  
  if (this.datos.miTablaDatos && Array.isArray(this.datos.miTablaDatos)) {
    console.log('[MiComponente] actualizarDatosCustom - miTablaDatos actualizada', {
      length: this.datos.miTablaDatos.length,
      primerElemento: this.datos.miTablaDatos[0]
    });
  }
}
```

**Importante:** Si el componente de sección usa caché (como `filasCache`), siempre limpiarlo en `actualizarDatosCustom()`.

---

## 🔧 Paso 7: Integración en el Ciclo de Vida

### 7.1 En `onInitCustom()`

```typescript
protected override onInitCustom(): void {
  this.inicializarTablas();
  
  this.stateSubscription = this.stateService.datos$.subscribe(() => {
    if (!this.sincronizando) {
      this.cdRef.detectChanges();
    }
  });
}
```

### 7.2 En `actualizarDatosCustom()`

```typescript
protected override actualizarDatosCustom(): void {
  if (!this.sincronizando && this.datos) {
    setTimeout(() => {
      this.sincronizarTablasDesdeCampos();
    }, 0);
  }
}
```

---

## 📝 Ejemplo Completo: Tabla AISD1

### TypeScript

```typescript
export class Seccion4FormWrapperComponent extends BaseSectionComponent {
  private sincronizando: boolean = false;
  
  tablaAISD1Config: TableConfig = {
    tablaKey: 'tablaAISD1Datos',
    totalKey: 'localidad',
    campoTotal: 'localidad',
    campoPorcentaje: '',
    estructuraInicial: [{
      localidad: '',
      coordenadas: '',
      altitud: '',
      distrito: '',
      provincia: '',
      departamento: ''
    }]
  };
  
  override watchedFields: string[] = [
    'tablaAISD1Datos',
    'tablaAISD1Localidad',
    'tablaAISD1Coordenadas',
    'tablaAISD1Altitud',
    'tablaAISD1Distrito',
    'tablaAISD1Provincia',
    'tablaAISD1Departamento'
  ];
  
  constructor(
    formularioService: FormularioService,
    // ... otros servicios
    private tableAdapter: TableAdapterService
  ) {
    super(formularioService, /* ... */);
  }
  
  inicializarTablas(): void {
    if (this.sincronizando || !this.datos) return;
    
    this.sincronizando = true;
    const prefijo = this.obtenerPrefijoGrupo();
    
    if (this.datos.tablaAISD1Datos && Array.isArray(this.datos.tablaAISD1Datos) && 
        this.datos.tablaAISD1Datos.length > 0) {
      this.normalizarArrayAISD1();
    } else {
      this.sincronizarDesdeCamposIndividuales(prefijo);
    }
    
    setTimeout(() => {
      this.sincronizando = false;
    }, 0);
  }
  
  onTablaAISD1Updated(): void {
    this.sincronizarCamposDesdeTablas();
    this.cdRef.detectChanges();
  }
}
```

### HTML

```html
<app-dynamic-table
  [datos]="datos"
  [config]="tablaAISD1Config"
  [columns]="[
    { field: 'localidad', label: 'Localidad', type: 'text', placeholder: 'Ej: ' + obtenerNombreComunidadActual() },
    { field: 'coordenadas', label: 'Coordenadas', type: 'text', placeholder: 'Ej: 18L E: 660 619 m N: 8 291 173 m' },
    { field: 'altitud', label: 'Altitud', type: 'text', placeholder: 'Ej: 3 599 msnm' },
    { field: 'distrito', label: 'Distrito', type: 'text', placeholder: 'Ej: ' + (datos.distritoSeleccionado || '') },
    { field: 'provincia', label: 'Provincia', type: 'text', placeholder: 'Ej: ' + (datos.provinciaSeleccionada || '') },
    { field: 'departamento', label: 'Departamento', type: 'text', placeholder: 'Ej: ' + (datos.departamentoSeleccionado || '') }
  ]"
  [tablaKey]="'tablaAISD1Datos'"
  [totalKey]="'localidad'"
  (tableUpdated)="onTablaAISD1Updated()">
</app-dynamic-table>
```

---

## ✅ Checklist de Implementación

- [ ] Configurar `TableConfig` con estructura inicial
- [ ] Agregar campos a `watchedFields`
- [ ] Definir columnas en el componente
- [ ] Implementar `inicializarTablas()`
- [ ] Implementar normalización de array
- [ ] Implementar sincronización bidireccional
- [ ] Agregar handler `onTablaActualizada()`
- [ ] Integrar en `onInitCustom()` y `actualizarDatosCustom()`
- [ ] **Implementar comparación profunda en `detectarCambios()` del componente de sección**
- [ ] Limpiar caché en `actualizarDatosCustom()` del componente de sección
- [ ] Manejar prefijos automáticamente
- [ ] Llenar campos vacíos desde otras fuentes (si aplica)
- [ ] Probar sincronización tabla ↔ campos individuales
- [ ] Probar con diferentes prefijos (`_A1`, `_A2`, etc.)

---

## 🐛 Troubleshooting

### La tabla no se muestra
- Verificar que `tablaKey` coincida con el nombre del campo en `datos`
- Verificar que `estructuraInicial` esté definida correctamente
- Revisar que `inicializarTablas()` se llame en `onInitCustom()`

### Los datos no se sincronizan
- Verificar que `watchedFields` incluya todos los campos relevantes
- Revisar que `sincronizarCamposDesdeTablas()` se llame en `onTablaActualizada()`
- Verificar que `sincronizando` se maneje correctamente para evitar loops

### Los cambios en la tabla no se reflejan en la vista de sección
- **CRÍTICO:** Implementar comparación profunda en `detectarCambios()` usando `JSON.stringify()` para arrays
- Verificar que el campo de la tabla esté en `watchedFields` del componente de sección
- Asegurarse de limpiar el caché en `actualizarDatosCustom()` del componente de sección
- Verificar que `actualizarDatosCustom()` se llame cuando `detectarCambios()` retorna `true`

### Los prefijos no se detectan
- Verificar que los campos con prefijo existan en `datos`
- Revisar la lógica de detección de prefijos en `inicializarTablas()`
- Asegurarse de buscar en todos los prefijos posibles: `['', '_A1', '_A2', '_B1', '_B2']`

### Campos vacíos no se llenan
- Verificar la lógica de llenado en `normalizarArrayTabla()`
- Revisar que las fuentes de datos alternativas estén disponibles
- Asegurarse de actualizar el servicio después de llenar: `this.formularioService.actualizarDato()`

---

## 📚 Referencias

- `TableManagementService`: Gestión básica de tablas
- `TableAdapterService`: Sincronización entre arrays y campos individuales
- `DynamicTableComponent`: Componente visual de la tabla
- `BaseSectionComponent`: Clase base con métodos comunes

---

---

## ⚠️ Nota Importante sobre Sincronización

Para que los cambios en la tabla del formulario se reflejen en la vista de sección, es **CRÍTICO** que el componente de sección implemente comparación profunda de arrays en `detectarCambios()`. Sin esto, los cambios en arrays no se detectarán porque JavaScript compara referencias, no contenido.

**Siempre usar:**
```typescript
if (Array.isArray(valorActual) || Array.isArray(valorAnterior)) {
  haCambiado = JSON.stringify(valorActual) !== JSON.stringify(valorAnterior);
}
```

**Nunca usar:**
```typescript
if (valorActual !== valorAnterior) { // ❌ No funciona para arrays
```

---

**Última actualización:** Basado en la implementación de `seccion4-form-wrapper.component.ts` y `seccion4.component.ts`
