# Documentación: Patrón UNICA_VERDAD en Sección 6

Este documento describe cómo se implementó el patrón **UNICA_VERDAD** en la Sección 6 (Demografía) para servir como referencia para otras secciones.

## Concepto Central

**UNICA_VERDAD** significa que **ProjectStateFacade** es la única fuente de verdad para los datos de la sección. Todos los componentes (Form, View) leen y escriben exclusivamente desde/hacia ProjectStateFacade.

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   FORMULARIO    │◄───────►│  ProjectStateFacade  │◄───────►│     VISTA      │
│   (Seccion6     │         │  (Signal Store)      │         │   (Seccion6    │
│    FormComponent)          │                      │         │    ViewComponent)
└─────────────────┘         └──────────────────────┘         └─────────────────┘
        │                            ▲                                 │
        │                            │                                 │
        └────────────────────────────┴─────────────────────────────────┘
                                     │
                                     ▼
                           ┌─────────────────────┐
                           │   Session-Data     │
                           │     (Redis)        │
                           │   TTL: 7 días      │
                           └─────────────────────┘
```

## 1. Configuración de la Sección

### 1.1 Constantes (seccion6-constants.ts)

```typescript
export const SECCION6_CONFIG = {
  sectionId: '3.1.4.A.1.2',
  title: 'Aspectos Demográficos',
  photoPrefix: 'fotografiaDemografia',  // IMPORTANTE: prefijo consistente
  maxPhotos: 10
} as const;
```

### 1.2 Flags de reactividad (en Form y View)

```typescript
// En seccion6-form.component.ts y seccion6-view.component.ts
override useReactiveSync: boolean = true;
override readonly PHOTO_PREFIX = SECCION6_CONFIG.photoPrefix;
```

## 2. Formulario (Form)

### 2.1 Signals para leer datos

```typescript
// SEÑAL PRINCIPAL: Lee TODOS los datos de la sección desde ProjectStateFacade
readonly sectionDataSignal: Signal<Record<string, any>> = computed(() => {
  return this.projectFacade.selectSectionFields(this.seccionId, null)();
});

// Signals específicos para tablas (opcional, para facilitar acceso)
readonly poblacionSexoSignal = computed(() => {
  const data = this.sectionDataSignal();
  const prefijo = this.prefijoGrupoSignal();
  const tablaKey = `poblacionSexoAISD${prefijo}`;
  return data[tablaKey] || [];
});
```

### 2.2 Guardar datos de tablas

```typescript
// GUARDAR en ProjectStateFacade cuando el usuario edita una tabla
onTableChange(tablaKey: string, datos: any[]): void {
  // 1. Guardar en ProjectStateFacade (UNICA VERDAD)
  this.projectFacade.setField(this.seccionId, null, tablaKey, datos);
  this.projectFacade.setTableData(this.seccionId, null, tablaKey, datos);
  
  // 2. Actualizar señal local si es necesario
  this.cdRef.markForCheck();
}
```

### 2.3 Guardar fotos (UNICA_VERDAD puro)

```typescript
// ✅ Override: UNICA_VERDAD - Solo guardar en ProjectStateFacade
// ELIMINADO: super.onFotografiasChange() que escribía en PhotoCoordinator (legacy)
override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
  const prefijo = this.prefijoGrupoSignal();
  
  // ✅ GUARDAR EN PROJECTSTATEFACADE - ÚNICA FUENTE DE VERDAD
  for (let i = 0; i < fotografias.length; i++) {
    const foto = fotografias[i];
    const idx = i + 1;
    
    const imgKey = `${this.PHOTO_PREFIX}${idx}Imagen${prefijo}`;
    const titKey = `${this.PHOTO_PREFIX}${idx}Titulo${prefijo}`;
    const fuenteKey = `${this.PHOTO_PREFIX}${idx}Fuente${prefijo}`;
    
    this.projectFacade.setField(this.seccionId, null, imgKey, foto.imagen);
    this.projectFacade.setField(this.seccionId, null, titKey, foto.titulo);
    this.projectFacade.setField(this.seccionId, null, fuenteKey, foto.fuente);
  }
  
  // Actualizar referencia local
  this.fotografiasFormMulti = fotografias;
  this.cdRef.markForCheck();
}
```

### 2.4 Cargar fotos (desde ProjectStateFacade)

```typescript
// ✅ OVERRIDE: Leer DEL SIGNAL REACTIVO (sectionDataSignal)
override cargarFotografias(): void {
  const formData = this.sectionDataSignal();  // ✅ LEER DEL SIGNAL REACTIVO
  const prefijo = this.prefijoGrupoSignal();
  
  const fotos: FotoItem[] = [];
  
  for (let i = 1; i <= 10; i++) {
    const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;
    const imagen = formData[imagenKey];
    
    if (imagen && typeof imagen === 'string' && imagen.startsWith('data:')) {
      const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`;
      
      fotos.push({
        imagen: imagen,
        titulo: formData[tituloKey] || '',
        fuente: formData[fuenteKey] || '',
        numero: i
      });
    }
  }
  
  this.fotografiasCache = [...fotos];
  this.fotografiasFormMulti = [...fotos];
  this.cdRef.markForCheck();
}
```

### 2.5 Template del Form (HTML)

```html
<!-- Tablas: Pasar sectionDataSignal() al dynamic-table -->
<app-dynamic-table
  [datos]="sectionDataSignal()"
  [config]="poblacionSexoConfig"
  [columns]="poblacionSexoColumns"
  [sectionId]="seccionId"
  [tablaKey]="'poblacionSexoAISD' + obtenerPrefijoGrupo()"
  [fieldName]="'poblacionSexoAISD'"
  (tableChange)="onPoblacionSexoChange($event)">
</app-dynamic-table>
```

## 3. Vista (View)

### 3.1 Signals para leer datos

```typescript
// SEÑAL PRINCIPAL: Lee TODOS los datos de la sección desde ProjectStateFacade
readonly vistDataSignal: Signal<Record<string, any>> = computed(() => {
  return this.projectFacade.selectSectionFields(this.seccionId, null)();
});

// Signals específicos para tablas
readonly poblacionSexoRowsSignal = computed(() => {
  const data = this.vistDataSignal();
  const prefijo = this.prefijoGrupoSignal();
  const tablaKey = `poblacionSexoAISD${prefijo}`;
  return data[tablaKey] || [];
});
```

### 3.2 Cargar fotos (con protección contra loop - CORREGIDO)

```typescript
// ✅ OVERRIDE: Leer DEL SIGNAL REACTIVO (vistDataSignal)
override cargarFotografias(): void {
  const formData = this.vistDataSignal();
  const prefijo = this.prefijoGrupoSignal();
  
  // ✅ Protección: Contar fotos reales en formData
  const fotoKeys = Object.keys(formData).filter(k => k.includes('Fotografia') && k.includes('Imagen'));
  let fotosReales = 0;
  for (const key of fotoKeys) {
    if (formData[key]?.startsWith('data:')) fotosReales++;
  }
  
  // ✅ SOLO mantener cache si la cantidad de fotos es EXACTAMENTE IGUAL
  // Si fotosReales > cache, hay nuevas fotos que deben cargarse
  const cacheCount = this.fotografiasCache?.length || 0;
  if (cacheCount > 0 && cacheCount === fotosReales) {
    // Misma cantidad, verificar si títulos/fuentes cambiaron
    let necesitaRecarga = false;
    for (let i = 0; i < cacheCount; i++) {
      const foto = this.fotografiasCache[i];
      const titKey = `${this.PHOTO_PREFIX}${i + 1}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX}${i + 1}Fuente${prefijo}`;
      if (formData[titKey] !== foto.titulo || formData[fuenteKey] !== foto.fuente) {
        necesitaRecarga = true;
        break;
      }
    }
    if (!necesitaRecarga) {
      // Títulos sin cambios, mantener cache
      this.fotografiasVista = [...this.fotografiasCache];
      this.cdRef.markForCheck();
      return;
    }
    // Si necesita recarga, continúa el procesamiento normal
  }
  
  const fotos: FotoItem[] = [];
  
  for (let i = 1; i <= 10; i++) {
    const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;
    const imagen = formData[imagenKey];
    
    if (imagen && imagen.startsWith('data:')) {
      const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`;
      
      fotos.push({
        imagen: imagen,
        titulo: formData[tituloKey] || '',
        fuente: formData[fuenteKey] || '',
        numero: i
      });
    }
  }
  
  this.fotografiasCache = [...fotos];
  this.fotografiasVista = [...fotos];
  this.cdRef.markForCheck();
}
```

**Nota**: Esta lógica sustituye a la versión anterior que tenía el bug de mantener cache cuando `cache.length > 0 && fotosReales > 0`. El bug causaba que cuando `cache=1` y `fotosReales=4`, el sistema mantenía datos anticuados sin detectar que había más fotos.

### 3.3 Effect para cargar fotos al inicio (sin loop infinito)

```typescript
constructor(...) {
  super(cdRef, injector);
  
  // ✅ Cargar fotos al inicio
  this.cargarFotografias();
  
  // ✅ EFFECT: Monitorear cambios de fotos
  // IMPORTANTE: Flag para evitar loop infinito
  const fotogramasView = this;
  let inicializadoView = false;
  
  effect(() => {
    const hash = fotogramasView.photoFieldsHash();
    
    // Skip primer inicio - fotos ya cargadas en constructor
    if (!inicializadoView) {
      inicializadoView = true;
      return;
    }
    
    // Solo recargar si hay cambios en fotos
    if (hash && hash.includes('|1|')) {
      fotogramasView.cargarFotografias();
      fotogramasView.fotografiasVista = [...fotogramasView.fotografiasCache];
      fotogramasView.cdRef.markForCheck();
    }
  }, { allowSignalWrites: true });
}
```

### 3.4 PhotoFieldsHash (para detectar cambios)

```typescript
readonly photoFieldsHash: Signal<string> = computed(() => {
  const prefijo = this.prefijoGrupoSignal();
  const prefix = this.PHOTO_PREFIX;
  let hash = '';
  
  for (let i = 1; i <= 10; i++) {
    const tituloKey = `${prefix}${i}Titulo${prefijo}`;
    const fuenteKey = `${prefix}${i}Fuente${prefijo}`;
    const imagenKey = `${prefix}${i}Imagen${prefijo}`;
    
    const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
    const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
    const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();
    
    hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
  }
  
  return hash;
});
```

## 4. Pattern Checklist

Para implementar UNICA_VERDAD en otra sección, sigue esta checklist:

### 4.1 Configuración
- [ ] Definir `SECCION6_CONFIG` con `sectionId`, `title`, `photoPrefix`, `maxPhotos`
- [ ] Usar `useReactiveSync: boolean = true`
- [ ] Definir `PHOTO_PREFIX` constante

### 4.2 Form
- [ ] Crear `sectionDataSignal` que lee de `projectFacade.selectSectionFields()`
- [ ] En `onTableChange()`, guardar en `projectFacade.setField()` y `projectFacade.setTableData()`
- [ ] Override `onFotografiasChange()` para guardar SOLO en `projectFacade.setField()` (sin `super()`)
- [ ] Override `cargarFotografias()` para leer de `sectionDataSignal()`
- [ ] En template, pasar `sectionDataSignal()` a dynamic-table

### 4.3 View
- [ ] Crear `vistDataSignal` que lee de `projectFacade.selectSectionFields()`
- [ ] Override `cargarFotografias()` para leer de `vistDataSignal()` con protección
- [ ] Crear `photoFieldsHash` computed que lee cada campo de foto
- [ ] Usar effect con flag para cargar fotos al inicio (evitar loop)
- [ ] En template, pasar `vistDataSignal()` a dynamic-table

### 4.4 Limpieza
- [ ] Eliminar mensajes de debug (cajas rojas/verdes)
- [ ] Eliminar console.log de producción
- [ ] Verificar que no haya llamadas a `super.onFotografiasChange()`

## 5. Errores Comunes y Soluciones

### 5.1 Loop infinito en Effect
**Problema**: El effect se ejecuta múltiples veces consumiendo memoria.
**Solución**: Usar flag fuera del effect y skip en primera ejecución.

### 5.2 Fotos desaparecen al recargar
**Problema**: Las fotos se guardan con claves incorrectas.
**Solución**: Usar siempre `PHOTO_PREFIX` consistente (`fotografiaDemografia`) en todas las operaciones.

### 5.3 Tablas vacías en Form
**Problema**: Se pasa el array directamente en lugar del objeto.
**Solución**: Pasar `sectionDataSignal()` (objeto) no `poblacionSexoSignal()` (array).

### 5.4 Datos no persisten
**Problema**: Se guarda en localStorage o memoria temporal.
**Solución**: Siempre guardar en `projectFacade.setField()`.

### 5.5 Fotos/títulos no se actualizan en View después de editar
**Problema**: La lógica de protección mantenía cache cuando `cache.length > 0 && fotosReales > 0`, pero si había más fotos reales que en cache (ej: cache=1, reales=4), mantenía datos anticuados.
**Solución**: La protección ahora verifica:
1. Solo mantiene cache si `cacheCount === fotosReales` (misma cantidad)
2. Verifica si los títulos/fuentes cambiaron comparando con formData
3. Si hay discrepancia, recarga correctamente los datos.

## 6. Flujo de Datos

```
Usuario edita tabla
       │
       ▼
Form.onTableChange()
       │
       ▼
projectFacade.setField() ──► ProjectStateFacade (Signal Store)
       │                              │
       │                              ▼
       │                     Session-Data (Redis)
       │                              │
       ▼                              ▼
Form.sectionDataSignal() ◄──── View.vistDataSignal()
       │                              │
       ▼                              ▼
  UI se actualiza               UI se actualiza
```

## 7. Referencias

- **ProjectStateFacade**: `src/app/core/services/state/project-state.facade.ts`
- **BaseSectionComponent**: `src/app/shared/components/base-section.component.ts`
- **Sección 6 Form**: `src/app/shared/components/seccion6/seccion6-form.component.ts`
- **Sección 6 View**: `src/app/shared/components/seccion6/seccion6-view.component.ts`
- **Sección 7 Form**: `src/app/shared/components/seccion7/seccion7-form.component.ts`
- **Sección 7 View**: `src/app/shared/components/seccion7/seccion7-view.component.ts`

## 8. Diferencias con Otras Secciones

### Sección 7 (PEA - Población Económicamente Activa)
La Sección 7 usa un sistema de grupos de fotos más complejo (`photoGroupsConfig`), pero sigue el mismo patrón UNICA_VERDAD:
- **Form**: `formDataSignal()` + effect con skip + `cargarFotografias()` override
- **View**: `viewDataSignal()` + effect con skip + `cargarFotografias()` con protección
- **Fotos**: Usa `fotografiaPEA` como prefijo (definido en `SECCION7_PHOTO_PREFIX.PEA`)

Las diferencias principales:
- Sección 7 tiene 3 tablas (PET, PEA, PEA Ocupada) vs Sección 6 que tiene 2 (Sexo, Etario)
- Sección 7 usa `cargarTodosLosGrupos()` del base component para el sistema de grupos de fotos
- La lógica de protección en View es la misma (verificar cantidad y títulos)
