# Documentación: Patrón UNICA_VERDAD en Sección 7 (PEA)

Este documento describe cómo se implementó el patrón **UNICA_VERDAD** en la Sección 7 (Población Económicamente Activa - PEA) para lograr:
- ✅ Persistencia de datos en tablas
- ✅ Cálculo automático de totales y porcentajes
- ✅ Persistencia de imágenes con título y fuente

## Concepto Central

**UNICA_VERDAD** significa que **ProjectStateFacade** es la única fuente de verdad para los datos de la sección. Todos los componentes (Form, View) leen y escriben exclusivamente desde/hacia ProjectStateFacade.

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   FORMULARIO    │◄───────►│  ProjectStateFacade  │◄───────►│     VISTA      │
│   (Seccion7     │         │  (Signal Store)      │         │   (Seccion7    │
│    FormComponent)          │                      │         │    ViewComponent)
└─────────────────┘         └──────────────────────┘         └─────────────────┘
        │                            ▲                                 │
        │                            │                                 │
        └────────────────────────────┴─────────────────────────────────┘
                                     │
                                     ▼
                           ┌─────────────────────┐
                           │   Session-Data       │
                           │     (Redis)          │
                           │   TTL: 7 días        │
                           └─────────────────────┘
```

---

## 1. Configuración de la Sección

### 1.1 Flags de reactividad (en Form y View)

```typescript
// En seccion7-form.component.ts y seccion7-view.component.ts
override useReactiveSync: boolean = true;
override readonly PHOTO_PREFIX = 'fotografiaPEA';
```

### 1.2 Importaciones necesarias

```typescript
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
```

---

## 2. Formulario (Form)

### 2.1 Signals para leer datos

```typescript
// SEÑAL PRINCIPAL: Lee TODOS los datos de la sección desde ProjectStateFacade
readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
  return this.projectFacade.selectSectionFields(this.seccionId, null)();
});

// Signals específicos para tablas
readonly petTablaSignal: Signal<any[]> = computed(() => {
  const formData = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
  return Array.isArray(formData[petTablaKey]) ? formData[petTablaKey] : [];
});

readonly peaTablaSignal: Signal<any[]> = computed(() => {
  const formData = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
  return Array.isArray(formData[peaTablaKey]) ? formData[peaTablaKey] : [];
});

readonly peaOcupadaTablaSignal: Signal<any[]> = computed(() => {
  const formData = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
  return Array.isArray(formData[peaOcupadaTablaKey]) ? formData[peaOcupadaTablaKey] : [];
});
```

### 2.2 Inyección de servicios en el constructor

```typescript
constructor(
  cdRef: ChangeDetectorRef,
  injector: Injector,
  private sanitizer: DomSanitizer,
  private globalNumbering: GlobalNumberingService,
  private backendApi: BackendApiService,
  private tableFacade: TableManagementFacade,
  private formChange: FormChangeService  // ✅ IMPORTANTE para persistencia en Redis
) {
  super(cdRef, injector);
  // ... effects
}
```

### 2.3 Template del Form (HTML) - CLAVE

```html
<!-- ✅ CRÍTICO: Pasar formDataSignal() NO datos legacy -->

<!-- Tabla PET -->
<app-dynamic-table
  [datos]="formDataSignal()"
  [config]="petConfig"
  [columns]="columnasTableaPET"
  [sectionId]="seccionId"
  [tablaKey]="'petTabla' + obtenerPrefijo()"
  (tableUpdated)="onTablaPETActualizada()">
</app-dynamic-table>

<!-- Tabla PEA -->
<app-dynamic-table
  [datos]="formDataSignal()"
  [config]="peaConfig"
  [columns]="columnasTableaPEA"
  [sectionId]="seccionId"
  [tablaKey]="'peaTabla' + obtenerPrefijo()"
  (tableUpdated)="onTablaPEAActualizada()">
</app-dynamic-table>

<!-- Tabla PEA Ocupada -->
<app-dynamic-table
  [datos]="formDataSignal()"
  [config]="peaOcupadaConfig"
  [columns]="columnasTableaPEAOcupada"
  [sectionId]="seccionId"
  [tablaKey]="'peaOcupadaTabla' + obtenerPrefijo()"
  (tableUpdated)="onTablaPEAOcupadaActualizada()">
</app-dynamic-table>
```

### 2.4 Guardar datos de tablas con cálculo de porcentajes

```typescript
onTablaPETActualizada(): void {
  // ✅ LEER DEL SIGNAL REACTIVO (no de this.datos)
  const formData = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
  let tablaActual = formData[petTablaKey] || [];
  
  // ✅ CALCULAR TOTALES Y PORCENTAJES
  const config = this.petConfig;
  const tmp: Record<string, any> = { [petTablaKey]: structuredClone(tablaActual) };
  this.tableFacade.calcularTotalesYPorcentajes(tmp, { ...config, tablaKey: petTablaKey });
  tablaActual = tmp[petTablaKey] || tablaActual;
  
  // ✅ GUARDAR EN PROJECTSTATEFACADE (UNICA VERDAD)
  this.projectFacade.setField(this.seccionId, null, petTablaKey, tablaActual);
  this.projectFacade.setField(this.seccionId, null, 'petTabla', tablaActual);
  
  // ✅ GUARDAR EN SESSION-DATA (Redis) - CRÍTICO PARA PERSISTENCIA
  try {
    this.formChange.persistFields(this.seccionId, 'table', { [petTablaKey]: tablaActual }, { notifySync: true });
    console.log(`[SECCION7] ✅ PET data saved to session-data`);
  } catch (e) {
    console.error(`[SECCION7] ⚠️ Could not save to session-data:`, e);
  }
  
  this.cdRef.markForCheck();
}
```

### 2.5 Guardar datos de tablas PEA/PEA Ocupada con cálculo de porcentajes

```typescript
onTablaPEAActualizada(): void {
  // ✅ LEER DEL SIGNAL REACTIVO
  const formData = this.formDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
  let tablaActual = formData[peaTablaKey] || [];
  
  // ✅ CALCULAR TOTALES Y PORCENTAJES PARA PEA
  tablaActual = this.calcularPorcentajesPEA(tablaActual);
  
  // ✅ GUARDAR EN PROJECTSTATEFACADE
  this.projectFacade.setField(this.seccionId, null, peaTablaKey, tablaActual);
  this.projectFacade.setField(this.seccionId, null, 'peaTabla', tablaActual);
  
  // ✅ GUARDAR EN SESSION-DATA (Redis)
  try {
    this.formChange.persistFields(this.seccionId, 'table', { [peaTablaKey]: tablaActual }, { notifySync: true });
  } catch (e) {
    console.error(e);
  }
  
  this.cdRef.markForCheck();
}
```

### 2.6 Método de cálculo de porcentajes para PEA

```typescript
private calcularPorcentajesPEA(tabla: any[]): any[] {
  if (!tabla || tabla.length === 0) return tabla;
  
  const tablaClon = JSON.parse(JSON.stringify(tabla));
  
  // Separar la fila Total de las filas de datos
  const filaTotalIndex = tablaClon.findIndex((row: any) => 
    row.categoria && row.categoria.toString().toLowerCase() === 'total'
  );
  
  const filasDatos = filaTotalIndex >= 0
    ? tablaClon.filter((_: any, i: number) => i !== filaTotalIndex)
    : tablaClon;
  const filaTotal = filaTotalIndex >= 0 ? tablaClon[filaTotalIndex] : null;

  // Calcular totales
  let totalHombres = 0;
  let totalMujeres = 0;
  let totalCasos = 0;
  
  filasDatos.forEach((row: any) => {
    const hombres = Number(row.hombres) || 0;
    const mujeres = Number(row.mujeres) || 0;
    row.casos = hombres + mujeres;
    totalHombres += hombres;
    totalMujeres += mujeres;
    totalCasos += row.casos;
  });

  // Calcular porcentajes para cada fila
  filasDatos.forEach((row: any) => {
    const h = Number(row.hombres) || 0;
    const m = Number(row.mujeres) || 0;
    const c = Number(row.casos) || 0;

    row.porcentajeHombres = totalHombres > 0 ? this.formatPorcentaje((h / totalHombres) * 100) : '0,00 %';
    row.porcentajeMujeres = totalMujeres > 0 ? this.formatPorcentaje((m / totalMujeres) * 100) : '0,00 %';
    row.porcentaje = totalCasos > 0 ? this.formatPorcentaje((c / totalCasos) * 100) : '0,00 %';
  });

  // Actualizar la fila Total
  if (filaTotal) {
    filaTotal.hombres = totalHombres;
    filaTotal.mujeres = totalMujeres;
    filaTotal.casos = totalCasos;
    filaTotal.porcentajeHombres = '100,00 %';
    filaTotal.porcentajeMujeres = '100,00 %';
    filaTotal.porcentaje = '100,00 %';
  }

  return tablaClon;
}

private formatPorcentaje(value: number): string {
  return value.toFixed(2).replace('.', ',') + ' %';
}
```

### 2.7 Guardar fotos (UNICA_VERDAD puro)

```typescript
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
  
  this.fotografiasSeccion7 = fotografias;
  this.cdRef.markForCheck();
}
```

### 2.8 Cargar fotos (desde ProjectStateFacade)

```typescript
override cargarFotografias(): void {
  const formData = this.formDataSignal();
  const prefijo = this.obtenerPrefijoGrupo();
  
  const fotos: FotoItem[] = [];

  for (let i = 1; i <= 10; i++) {
    const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;
    const imagen = formData[imagenKey];

    if (imagen && typeof imagen === 'string' && imagen.startsWith('data:')) {
      const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`;
      const numeroKey = `${this.PHOTO_PREFIX}${i}Numero${prefijo}`;

      fotos.push({
        imagen: imagen,
        titulo: formData[tituloKey] || '',
        fuente: formData[fuenteKey] || '',
        numero: formData[numeroKey] || i
      });
    }
  }
  
  this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
}
```

### 2.9 Cargar datos del backend con persistencia

```typescript
private cargarDatosDelBackend(): void {
  const codigosArray = this.getCodigosCentrosPobladosAISD();
  const codigos = [...codigosArray];
  const prefijo = this.obtenerPrefijoGrupo();

  // 1. Cargar PET
  this.backendApi.postPetGrupo(codigos).subscribe({
    next: (response: any) => {
      const datosTransformados = transformPETDesdeDemograficos(
        unwrapDemograficoData(response?.data || [])
      );
      const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
      
      // ✅ Calcular totales y porcentajes antes de guardar
      const tmp: Record<string, any> = { [petTablaKey]: structuredClone(datosTransformados) };
      this.tableFacade.calcularTotalesYPorcentajes(tmp, { ...this.petConfig, tablaKey: petTablaKey });
      const tablaFinal = tmp[petTablaKey] || datosTransformados;
      
      // ✅ Guardar en ProjectStateFacade
      this.projectFacade.setField(this.seccionId, null, petTablaKey, tablaFinal);
      this.projectFacade.setField(this.seccionId, null, 'petTabla', tablaFinal);
      
      // ✅ Guardar en Session-Data (Redis)
      try {
        this.formChange.persistFields(this.seccionId, 'table', { [petTablaKey]: tablaFinal }, { notifySync: true });
      } catch (e) {
        console.error(e);
      }
    }
  });

  // 2. Cargar PEA (similar...)
  // 3. Cargar PEA Ocupada (similar...)
}
```

### 2.10 Inicialización correcta (NO borrar datos existentes)

```typescript
protected override onInitCustom(): void {
  // ✅ VERIFICAR SI YA EXISTEN DATOS PERSISTIDOS antes de cargar del backend
  const prefijo = this.obtenerPrefijoGrupo();
  const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
  const existingPetData = this.formDataSignal()[petTablaKey];
  
  // Solo cargar del backend si no hay datos persistidos
  if (!existingPetData || !Array.isArray(existingPetData) || existingPetData.length === 0) {
    console.log('[SECCION7] No hay datos persistidos, cargando del backend...');
    this.cargarDatosDelBackend();
  } else {
    console.log('[SECCION7] Datos persistidos encontrados, no se carga del backend');
  }
  
  this.cargarFotografias();
  this.fotografiasSeccion7 = [...this.fotografiasCache];
}
```

---

## 3. Vista (View)

### 3.1 Signals para leer datos

```typescript
readonly viewDataSignal: Signal<Record<string, any>> = computed(() => {
  return this.projectFacade.selectSectionFields(this.seccionId, null)();
});

readonly petTablaSignal: Signal<any[]> = computed(() => {
  const viewData = this.viewDataSignal();
  const prefijo = this.prefijoGrupoSignal();
  const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
  return Array.isArray(viewData[petTablaKey]) ? viewData[petTablaKey] : [];
});

readonly peaTablaSignal: Signal<any[]> = computed(() => {
  const viewData = this.viewDataSignal();
  const prefijo = this.prefijoGrupoSignal();
  const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
  return Array.isArray(viewData[peaTablaKey]) ? viewData[peaTablaKey] : [];
});

readonly peaOcupadaTablaSignal: Signal<any[]> = computed(() => {
  const viewData = this.viewDataSignal();
  const prefijo = this.prefijoGrupoSignal();
  const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
  return Array.isArray(viewData[peaOcupadaTablaKey]) ? viewData[peaOcupadaTablaKey] : [];
});
```

### 3.2 Effect para detectar cambios en tablas

```typescript
constructor(...) {
  super(cdRef, injector);
  
  // ✅ EFFECT: Monitorear cambios en tablas PET, PEA, PEA Ocupada
  const seccion7ViewTablas = this;
  let inicializadoTablas = false;
  
  effect(() => {
    // Leer los signals de tablas para detectar cambios
    const petTabla = this.petTablaSignal();
    const peaTabla = this.peaTablaSignal();
    const peaOcupadaTabla = this.peaOcupadaTablaSignal();
    
    // Skip primer inicio
    if (!inicializadoTablas) {
      inicializadoTablas = true;
      return;
    }
    
    seccion7ViewTablas.cdRef.markForCheck();
  }, { allowSignalWrites: true });
}
```

### 3.3 PhotoFieldsHash (para detectar cambios en fotos)

```typescript
readonly photoFieldsHash: Signal<string> = computed(() => {
  const prefijo = this.prefijoGrupoSignal();
  const prefix = this.PHOTO_PREFIX;
  let hash = '';
  
  for (let i = 1; i <= 10; i++) {
    const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo${prefijo}`)();
    const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente${prefijo}`)();
    const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen${prefijo}`)();
    hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
  }
  
  return hash;
});
```

### 3.4 Cargar fotos (con protección contra loop)

```typescript
override cargarFotografias(): void {
  const formData = this.viewDataSignal();
  const prefijo = this.prefijoGrupoSignal();
  
  // Contar fotos reales en formData
  const fotoKeys = Object.keys(formData || {}).filter(k => 
    k.includes('fotografia') && k.includes('Imagen')
  );
  
  let fotosReales = 0;
  for (const key of fotoKeys) {
    const valor = formData[key];
    if (valor && typeof valor === 'string' && valor.startsWith('data:')) {
      fotosReales++;
    }
  }
  
  // Solo mantener cache si la cantidad es exactamente igual
  const cacheCount = this.fotografiasCache?.length || 0;
  if (cacheCount > 0 && cacheCount === fotosReales) {
    // Verificar si títulos/fuentes cambiaron
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
      this.fotografiasVista = [...this.fotografiasCache];
      this.cdRef.markForCheck();
      return;
    }
  }
  
  // Cargar las fotos directamente del signal
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

---

## 4. Pattern Checklist

Para implementar UNICA_VERDAD en otra sección, sigue esta checklist:

### 4.1 Configuración
- [ ] Usar `useReactiveSync: boolean = true`
- [ ] Definir `PHOTO_PREFIX` constante
- [ ] Importar `FormChangeService`

### 4.2 Form
- [ ] Crear `formDataSignal` que lee de `projectFacade.selectSectionFields()`
- [ ] Inyectar `FormChangeService` en el constructor
- [ ] En template, pasar `formDataSignal()` a dynamic-table (NO `datos`)
- [ ] En `onTableChange()`, guardar en `projectFacade.setField()` Y `formChange.persistFields()`
- [ ] Override `onFotografiasChange()` para guardar SOLO en `projectFacade.setField()`
- [ ] Override `cargarFotografias()` para leer de `formDataSignal()`
- [ ] En `onInitCustom()`, verificar si ya existen datos antes de cargar del backend

### 4.3 View
- [ ] Crear `viewDataSignal` que lee de `projectFacade.selectSectionFields()`
- [ ] Crear signals para cada tabla
- [ ] Override `cargarFotografias()` para leer de `viewDataSignal()` con protección
- [ ] Crear `photoFieldsHash` computed que lee cada campo de foto
- [ ] Usar effect con flag para cargar fotos al inicio (evitar loop)

### 4.4 Limpieza
- [ ] Eliminar mensajes de debug de producción
- [ ] Verificar que no haya llamadas a `super.onFotografiasChange()`

---

## 5. Errores Comunes y Soluciones

### 5.1 Datos se pierden al cambiar de sección
**Problema**: Se llama a un método que inicializa las tablas como arrays vacíos cada vez que se carga la sección.
**Solución**: Verificar si ya existen datos antes de cargar del backend:
```typescript
const existingData = this.formDataSignal()[tablaKey];
if (!existingData || existingData.length === 0) {
  this.cargarDatosDelBackend();
}
```

### 5.2 Tablas no persisten
**Problema**: Se pasa `[datos]="datos"` en lugar de `[datos]="formDataSignal()"`
**Solución**: Siempre pasar `formDataSignal()` al componente dynamic-table

### 5.3 Porcentajes no se actualizan
**Problema**: Se lee de `this.datos[clave]` en lugar del signal reactivo
**Solución**: Leer siempre del signal reactivo:
```typescript
const formData = this.formDataSignal();
let tablaActual = formData[tablaKey] || [];
```

### 5.4 Fotos no persisten
**Problema**: No se guarda en Session-Data
**Solución**: Guardar tanto en ProjectStateFacade como en Session-Data

### 5.5 Fotos/títulos no se actualizan en View
**Problema**: La lógica de protección mantenía cache cuando no debía
**Solución**: Verificar cantidad Y títulos/fuentes antes de mantener cache

---

## 6. Flujo de Datos Completo

```
Usuario edita tabla
       │
       ▼
Form.onTablaActualizada()
       │
       ├── Lee datos de formDataSignal() (NO de this.datos)
       │
       ├── Calcula totales y porcentajes
       │
       ▼
projectFacade.setField() ──► ProjectStateFacade (Signal Store)
       │
       ▼
formChange.persistFields() ──► Session-Data (Redis)
       │
       ▼
View se actualiza automáticamente via signals
```

```
Usuario edita foto/título/fuente
       │
       ▼
Form.onFotografiasChange()
       │
       ├── Guarda imagen en ProjectStateFacade
       ├── Guarda título en ProjectStateFacade
       ├── Guarda fuente en ProjectStateFacade
       │
       ▼
View se actualiza automáticamente via photoFieldsHash effect
```

---

## 7. Referencias

- **ProjectStateFacade**: `src/app/core/services/state/project-state.facade.ts`
- **FormChangeService**: `src/app/core/services/state/form-change.service.ts`
- **BaseSectionComponent**: `src/app/shared/components/base-section.component.ts`
- **Sección 7 Form**: `src/app/shared/components/seccion7/seccion7-form.component.ts`
- **Sección 7 View**: `src/app/shared/components/seccion7/seccion7-view.component.ts`

---

## 8. Diferencias con Sección 6

La Sección 7 tiene 3 tablas (PET, PEA, PEA Ocupada) vs Sección 6 que tiene 2 (Sexo, Etario). La lógica de persistencia y el patrón UNICA_VERDAD son exactamente los mismos.
