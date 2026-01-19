# Guía de Implementación - Auto Load Backend Data

## Resumen

Este documento describe cómo integrar la carga automática de datos desde el backend en las secciones del Documentador LBS de forma escalable y limpia.

---

## Arquitectura

### 1. BackendDataMapperService
**Ubicación**: `src/app/core/services/backend-data-mapper.service.ts`

Mapea cada sección con sus campos y endpoints asociados. Centraliza la configuración de transformaciones de datos.

**Uso**:
```typescript
const mapping = this.mapper.getMapping('seccion6_aisd', 'poblacionSexoAISD');
```

### 2. AutoBackendDataLoaderService
**Ubicación**: `src/app/core/services/auto-backend-data-loader.service.ts`

Orquesta la carga de datos desde el backend. Maneja:
- Caché automático
- Agregación de múltiples CCPP
- Transformación de datos
- Manejo de errores

**Uso**:
```typescript
this.autoLoader.loadSectionData('seccion6_aisd', cppCodes, false)
  .subscribe(data => { /* usar data */ });
```

### 3. AutoLoadSectionComponent
**Ubicación**: `src/app/shared/components/auto-load-section.component.ts`

Clase base que automatiza la carga de datos en cualquier sección. Implementa:
- Lifecycle hooks mejorados
- Carga automática en ngOnInit
- Procesamiento de datos cargados
- Gestión de suscripciones

### 4. SectionAutoLoadHelper
**Ubicación**: `src/app/shared/utils/section-auto-load-helper.ts`

Utilidades estáticas para validar, transformar y fusionar datos cargados.

---

## Implementación en Secciones

### Paso 1: Cambiar Clase Base

**Antes**:
```typescript
export class Seccion6Component extends BaseSectionComponent {
```

**Después**:
```typescript
export class Seccion6Component extends AutoLoadSectionComponent {
```

### Paso 2: Inyectar AutoBackendDataLoaderService

**Antes**:
```typescript
constructor(
  formularioService: FormularioService,
  fieldMapping: FieldMappingService,
  sectionDataLoader: SectionDataLoaderService,
  imageService: ImageManagementService,
  photoNumberingService: PhotoNumberingService,
  cdRef: ChangeDetectorRef,
  private tableService: TableManagementService,
  private stateService: StateService,
  private centrosPobladosActivos: CentrosPobladosActivosService,
  private sanitizer: DomSanitizer
) {
  super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
}
```

**Después**:
```typescript
constructor(
  formularioService: FormularioService,
  fieldMapping: FieldMappingService,
  sectionDataLoader: SectionDataLoaderService,
  imageService: ImageManagementService,
  photoNumberingService: PhotoNumberingService,
  cdRef: ChangeDetectorRef,
  private autoLoader: AutoBackendDataLoaderService,
  private tableService: TableManagementService,
  private stateService: StateService,
  private centrosPobladosActivos: CentrosPobladosActivosService,
  private sanitizer: DomSanitizer
) {
  super(
    formularioService,
    fieldMapping,
    sectionDataLoader,
    imageService,
    photoNumberingService,
    cdRef,
    autoLoader
  );
}
```

### Paso 3: Implementar Métodos Abstractos

```typescript
protected getSectionKey(): string {
  return 'seccion6_aisd';
}

protected getLoadParameters(): string[] | null {
  const prefijo = this.obtenerPrefijoGrupo();
  const codigosActivos = this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo);
  return codigosActivos && codigosActivos.length > 0 ? codigosActivos : null;
}

protected onInitCustom(): void {
  this.verificarCargaDatos();
  if (!this.modoFormulario) {
    this.stateSubscription = this.stateService.datos$.subscribe(() => {
      this.cargarFotografias();
      this.cdRef.detectChanges();
    });
  }
}

protected onDataChange(): void {
  this.eliminarFilasTotal('poblacionSexoAISD', 'sexo');
  this.eliminarFilasTotal('poblacionEtarioAISD', 'categoria');
}
```

### Paso 4: Remover Métodos de Carga Manual

Eliminar métodos como `loadPoblacionData()` o `loadDatosDesdeBackend()` ya que la clase base lo hace automáticamente.

---

## Configuración de Nuevas Secciones

Para agregar una nueva sección al sistema de auto-carga:

### En BackendDataMapperService

```typescript
this.mappingConfigs.set('seccionN_aisd', {
  fieldName1: {
    fieldName: 'fieldName1',
    endpoint: '/endpoint/path',
    paramType: 'id_ubigeo',
    aggregatable: true,
    transform: (data) => this.transformFunction(data)
  },
  fieldName2: {
    fieldName: 'fieldName2',
    endpoint: '/otro/endpoint',
    paramType: 'ubigeo',
    aggregatable: false,
    transform: (data) => data
  }
});
```

### Parámetros de Configuración

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fieldName` | string | Nombre del campo en datos |
| `endpoint` | string | Ruta del endpoint backend |
| `paramType` | 'id_ubigeo' \| 'ubigeo' | Tipo de parámetro (CCPP o distrito) |
| `aggregatable` | boolean | Permite agregar múltiples CCPP |
| `transform` | function | Transforma respuesta del backend |

---

## Caché y Rendimiento

El sistema implementa caché automático de 1 hora para todos los datos del backend.

### Forzar Recarga

```typescript
this.autoLoader.loadSectionData('seccion6_aisd', cppCodes, true)
  .subscribe(data => { /* datos frescos */ });
```

### Limpiar Caché Específico

```typescript
this.autoLoader.clearCache('/demograficos/datos');
```

### Limpiar Todo el Caché

```typescript
this.autoLoader.clearCache();
```

---

## Validación de Datos Cargados

```typescript
const isValid = SectionAutoLoadHelper.validateLoadedData(
  loadedData,
  ['poblacionSexoAISD', 'poblacionEtarioAISD']
);
```

---

## Fusión de Datos

```typescript
const merged = SectionAutoLoadHelper.mergeWithExistingData(
  this.datos,
  loadedData,
  prefijo,
  preserveIfExists = true
);
```

---

## Secciones Implementadas

### AISD (Comunidades Campesinas)

| Sección | Estado | Backend | Clave Sección |
|---------|--------|---------|---------------|
| 6 | ✅ Listo | /demograficos/datos | seccion6_aisd |
| 7 | ⏳ Pendiente | /aisd/pet | seccion7_aisd |
| 8 | ⏳ Pendiente | /economicos/principales | seccion8_aisd |
| 9 | ⏳ Pendiente | /aisd/materiales-construccion | seccion9_aisd |
| 10 | ⏳ Pendiente | /servicios/basicos | seccion10_aisd |
| 15 | ⏳ Pendiente | /vistas/lenguas-ubicacion | seccion15_aisd |
| 16 | ⏳ Pendiente | /vistas/religiones-ubicacion | seccion16_aisd |
| 19 | ⏳ Pendiente | /vistas/nbi-ubicacion | seccion19_aisd |

### AISI (Distritos)

| Sección | Estado | Backend | Clave Sección |
|---------|--------|---------|---------------|
| 21 | ⏳ Pendiente | /aisi/informacion-referencial | seccion21_aisi |
| 22 | ⏳ Pendiente | /aisi/centros-poblados | seccion22_aisi |
| 23 | ⏳ Pendiente | /demograficos/datos | seccion23_aisi |
| 24 | ⏳ Pendiente | /demograficos/datos | seccion24_aisi |
| 25 | ⏳ Pendiente | /aisd/pet | seccion25_aisi |
| 26 | ⏳ Pendiente | /aisi/pea-distrital | seccion26_aisi |
| 27 | ⏳ Pendiente | /economicos/principales | seccion27_aisi |
| 28 | ⏳ Pendiente | /aisi/viviendas-censo | seccion28_aisi |
| 29 | ⏳ Pendiente | /servicios/basicos | seccion29_aisi |
| 30 | ⏳ Pendiente | Múltiples endpoints | seccion30_aisi |

---

## Manejo de Errores

La carga automática manejará errores gracefully:

- Si el backend falla: usa caché o datos anteriores
- Si los datos están vacíos: no sobrescribe datos existentes
- Logs en consola para debugging

---

## Escalabilidad

### Agregar Nuevo Endpoint

1. Crear método en `BackendApiService`
2. Agregar case en `AutoBackendDataLoaderService.callEndpoint()`
3. Crear transformación en `BackendDataMapperService`
4. Configurar mapping en `initializeMappings()`

### Cambiar Transformación

Actualizar solo el método transform correspondiente sin afectar otras secciones.

### Actualizar Caché

Limpiar caché sin necesidad de reiniciar la aplicación:
```typescript
loader.clearCache('/endpoint');
```

---

## Testing

```typescript
it('debería cargar datos de población', () => {
  const spy = jasmine.createSpy('loadSectionData')
    .and.returnValue(of({ 
      poblacionSexoAISD: [...] 
    }));

  component.ngOnInit();
  expect(spy).toHaveBeenCalled();
});
```

---

**Última actualización**: 17 de enero de 2026
