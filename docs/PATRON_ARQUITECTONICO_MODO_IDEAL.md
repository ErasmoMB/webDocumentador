# 🎯 PATRÓN ARQUITECTÓNICO - MODO IDEAL (Secciones 1-5)

**Análisis comparativo de 5 secciones en MODO IDEAL**  
**Fecha:** 1 de febrero de 2026

---

## 📋 TABLA COMPARATIVA - CARACTERÍSTICAS CLAVE

| Característica | Sec. 1 | Sec. 2 | Sec. 3 | Sec. 4 | Sec. 5 | Patrón Común |
|---|---|---|---|---|---|---|
| **Extends BaseSectionComponent** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **@Input seccionId** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **@Input modoFormulario** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **Implements OnDestroy** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **PHOTO_PREFIX** | ✅ | ✅ | ✅ | ✅✅ (2) | ✅ | ✅ **SIEMPRE** |
| **useReactiveSync** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **Signals computed()** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **Effects automáticos** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **photoFieldsHash Signal** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **onFotografiasChange()** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **Form-Wrapper mínimo** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **Sin RxJS manual** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |
| **Sin setTimeout** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **SIEMPRE** |

---

## 🏗️ ESTRUCTURA ARQUITECTÓNICA COMÚN

### 1️⃣ COMPONENTES (Siempre 3)

```
Sección X
├── seccionX-form-wrapper.component.ts      ← MÍNIMO (25-30 líneas)
├── seccionX.component.ts                   ← Principal (con lógica)
├── seccionX-view.component.ts              ← Vista (delegación)
└── [opcional] seccionX-view-internal.component.ts ← Si tiene UI compleja
```

**Patrón:**
- **Wrapper:** Extiende BaseSectionComponent, template inline, solo delegación
- **Componente Principal:** Toda la lógica, Signals, effects
- **View:** Misma estructura que Main pero para modo lectura

---

### 2️⃣ SIGNALS COMUNES (En TODAS las secciones)

```typescript
// PATTERN 1: Datos de formulario
readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
  return this.projectFacade.selectSectionFields(this.seccionId, null)();
});

// PATTERN 2: Párrafos/Textos
readonly parrafoSignal: Signal<string> = computed(() => {
  // Lógica de obtención de párrafo
});

// PATTERN 3: Tablas (si aplica)
readonly tablaSignal: Signal<any[]> = computed(() => {
  const formData = this.formularioDataSignal();
  return Array.isArray(formData['tabla']) ? formData['tabla'] : [];
});

// PATTERN 4: Fotografías (CRÍTICO)
readonly photoFieldsHash: Signal<string> = computed(() => {
  let hash = '';
  for (let i = 1; i <= 10; i++) {
    const titulo = this.projectFacade.selectField(...)();
    const fuente = this.projectFacade.selectField(...)();
    const imagen = this.projectFacade.selectField(...)();
    hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
  }
  return hash;
});

// PATTERN 5: ViewModel (Opcional pero recomendado)
readonly viewModel: Signal<any> = computed(() => {
  return {
    datos: this.formDataSignal(),
    texto: this.parrafoSignal(),
    tabla: this.tablaSignal()
  };
});
```

---

### 3️⃣ EFFECTS COMUNES (En TODAS las secciones)

```typescript
// EFFECT 1: Auto-sync datos
effect(() => {
  const formData = this.formularioDataSignal();
  this.datos = { ...formData };
  this.cdRef.markForCheck();
});

// EFFECT 2: Monitorear cambios de fotografías
effect(() => {
  this.photoFieldsHash();  // ← Dispara cuando CUALQUIER foto cambia
  this.cargarFotografias();  // ← Se ejecuta automáticamente
  this.fotografiasFormMulti = [...this.fotografiasCache];
  this.cdRef.markForCheck();
}, { allowSignalWrites: true });

// EFFECT 3+: Específicos por sección (Sec2 tiene más)
effect(() => {
  // Lógica específica de sincronización
});
```

---

### 4️⃣ MÉTODOS OBLIGATORIOS (En TODAS las secciones)

```typescript
// MÉTODO 1: Inicialización
protected override onInitCustom(): void {
  this.cargarFotografias();
  // Sincronización inicial
  this.fotografiasFormMulti = [...this.fotografiasCache];
}

// MÉTODO 2: Cambios detectados
protected override detectarCambios(): boolean {
  return false;  // ← Signals se encargan
}

// MÉTODO 3: Actualizar prefijos
protected override actualizarValoresConPrefijo(): void {
  // No necesario, Signals ya sincronizados
}

// MÉTODO 4: Datos personalizados
protected override actualizarDatosCustom(): void {
  this.cargarFotografias();  // Recargar fotos si hay cambios
}

// MÉTODO 5: Cambios de fotografías
override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
  super.onFotografiasChange(fotografias, customPrefix);
  this.fotografiasFormMulti = fotografias;  // Sincronizar localmente
  this.cdRef.markForCheck();
}
```

---

## 🔄 FLUJO DE DATOS - PATRÓN UNIVERSAL

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUJO DE DATOS COMÚN                     │
└─────────────────────────────────────────────────────────────┘

USUARIO EN FORMULARIO
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. onFieldChange(fieldId, value)                            │
│    → super.onFieldChange() → FormChangeService              │
│    → projectFacade.setField(seccionId, groupId, fieldId)    │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ProjectState actualiza (estado centralizado inmutable)    │
│    → Reducers puros sin side effects                        │
│    → Estado nuevo en memoria                                 │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Signals REACCIONAN automáticamente                        │
│    → formDataSignal() detecta cambio                         │
│    → photoFieldsHash() recalcula si hay fotos               │
│    → Todos los computed() que dependen se actualizan        │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Effects se DISPARAN automáticamente                       │
│    → EFFECT 1: Auto-sync form data                          │
│    → EFFECT 2: cargarFotografias() si photoFieldsHash cambió│
│    → EFFECT 3+: Lógica específica de sincronización         │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Componentes locales se actualizan                         │
│    → this.datos = {...formData}                             │
│    → this.fotografiasFormMulti = [...fotosRecargadas]       │
│    → this.cdRef.markForCheck()                              │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Template re-renderiza (OnPush + markForCheck)            │
│    → Binding {{ }} se actualizan                            │
│    → *ngIf y *ngFor recalculan                              │
│    → UI muestra cambios al usuario                          │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. FormComponent → ViewComponent (cuando modo cambia)        │
│    → *ngIf="modoFormulario" → muestra u oculta              │
│    → ViewComponent recibe MISMO projectState                │
│    → Signals en View también reaccionan                     │
│    → Vista también se actualiza automáticamente              │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Persistencia automática (via FormChangeService)          │
│    → LocalStorage actualizado                               │
│    → IndexedDB sincronizado                                 │
│    → Backend (si aplica) actualizado                        │
└─────────────────────────────────────────────────────────────┘
        ↓
USUARIO VE CAMBIOS EN AMBOS MODOS (Form + View) ✅
```

---

## 🔧 FUNCIONALIDADES COMPARTIDAS

### 1️⃣ IMÁGENES (Todas las secciones)

**Patrón común:**
```typescript
override readonly PHOTO_PREFIX = 'fotografiaSeccion[N]';
override useReactiveSync: boolean = true;

readonly photoFieldsHash: Signal<string> = computed(() => {
  // Monitorea 10 imágenes máximo (título, fuente, imagen)
  // Crea hash que cambia si CUALQUIER campo cambia
});

effect(() => {
  this.photoFieldsHash();
  this.cargarFotografias();
  this.fotografiasFormMulti = [...this.fotografiasCache];
  this.cdRef.markForCheck();
});

override onFotografiasChange(fotografias: FotoItem[]): void {
  super.onFotografiasChange(fotografias);
  this.fotografiasFormMulti = fotografias;
  this.cdRef.markForCheck();
}
```

**Sincronización:**
- ✅ User agrega foto → photoFieldsHash cambia → effect() se dispara
- ✅ cargarFotografias() recarga → fotografiasFormMulti se actualiza
- ✅ Template re-renderiza → User ve foto
- ✅ View recibe mismo estado → ViewComponent también ve foto

---

### 2️⃣ PÁRRAFOS (Todas las secciones)

**Patrón común:**
```typescript
readonly parrafoSignal: Signal<string> = computed(() => {
  const formData = this.formularioDataSignal();
  const prefijo = this.obtenerPrefijoGrupo();
  
  // Intentar leer con prefijo primero
  const fieldKey = `parrafo[Seccion][X]${prefijo}`;
  const fieldKeyNoPrefix = `parrafo[Seccion][X]`;
  
  const manual = formData[fieldKey] || formData[fieldKeyNoPrefix];
  if (manual && manual.trim().length > 0) return manual;
  
  // Fallback a generated text
  return this.textGenerator.obtenerTextoSeccion[X](formData);
});
```

**Sincronización:**
- ✅ User edita párrafo → formDataSignal se actualiza
- ✅ parrafoSignal recomputa automáticamente
- ✅ ViewComponent recibe Signal reactivo
- ✅ Vista muestra párrafo actualizado

---

### 3️⃣ TABLAS (Secciones 2, 3, 4, 5)

**Patrón común:**
```typescript
readonly tablaSignal: Signal<any[]> = computed(() => {
  const formData = this.formularioDataSignal();
  const datos = formData['tablaKey'];
  return Array.isArray(datos) ? datos : [];
});

onTablaActualizada(): void {
  const datosActuales = this.tablaSignal();
  this.onFieldChange('tablaKey', datosActuales, { refresh: false });
  this.cdRef.markForCheck();
}
```

**Sincronización:**
- ✅ User agrega/edita fila → onTablaActualizada() se ejecuta
- ✅ onFieldChange() persiste automáticamente
- ✅ tablaSignal recomputa
- ✅ ViewComponent ve misma tabla

---

### 4️⃣ CONEXIÓN FORM ↔ VIEW (CRÍTICA - PATRÓN UNIVERSAL)

**Clave: MISMO PROJECTSTATE**

```
┌─────────────────────────────┐
│   FormComponent             │
│  (seccionX-form.component)  │
├─────────────────────────────┤
│ readonly dataSignal =       │
│   computed(() => {          │
│     projectFacade.select... │
│   });                       │
│                             │
│ effect(() => {              │
│   dataSignal();             │
│   cargarFotografias();      │
│ });                         │
└────────────┬────────────────┘
             │
        LEER/ESCRIBIR
             ↓
┌────────────────────────────────┐
│    ProjectState (CENTRALIZADO)  │
│   ✅ UNA SOLA FUENTE DE VERDAD │
│   ✅ Estado inmutable           │
│   ✅ Reducers puros            │
└────────────┬───────────────────┘
             │
        LEER (Solo)
             ↓
┌─────────────────────────────┐
│   ViewComponent             │
│  (seccionX-view.component)  │
├─────────────────────────────┤
│ readonly dataSignal =       │
│   computed(() => {          │
│     projectFacade.select... │
│   });                       │
│                             │
│ effect(() => {              │
│   dataSignal();             │
│   cargarFotografias();      │
│ });                         │
└─────────────────────────────┘
```

**¿Cómo funciona la sincronización?**

1. **FormComponent escribe:** `onFieldChange('field', value)`
2. **ProjectState se actualiza:** Estado único cambia
3. **Ambos Signals reaccionan:** `dataSignal()` se recalcula en Form y View
4. **Ambos Effects se disparan:** Form y View cargan fotos
5. **Ambos templates se actualizan:** Form ve cambio, View ve cambio

---

## 📊 COMPARATIVA DE SEÑALES POR SECCIÓN

| Signal | Sec. 1 | Sec. 2 | Sec. 3 | Sec. 4 | Sec. 5 |
|--------|--------|--------|--------|--------|--------|
| **formDataSignal** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **parrafoSignal** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **photoFieldsHash** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **tablaSignal** | - | ✅ | ✅ | ✅ | ✅ |
| **gruposSignal** | - | ✅ | - | - | - |
| **viewModel** | - | - | ✅ | ✅ | ✅ |

---

## ✅ CHECKLIST UNIVERSAL - APLICABLE A TODA SECCIÓN

```
┌─ ESTRUCTURA ─────────────────────────────┐
│ ✅ Extiende BaseSectionComponent         │
│ ✅ @Input seccionId                      │
│ ✅ @Input modoFormulario                 │
│ ✅ Implements OnDestroy                  │
│ ✅ ChangeDetectionStrategy.OnPush        │
└──────────────────────────────────────────┘

┌─ SIGNALS ────────────────────────────────┐
│ ✅ formDataSignal = computed()           │
│ ✅ parrafoSignal = computed()            │
│ ✅ [tabla]Signal = computed() (si aplica)│
│ ✅ photoFieldsHash = computed()          │
│ ✅ viewModel = computed() (opcional)     │
└──────────────────────────────────────────┘

┌─ EFFECTS ────────────────────────────────┐
│ ✅ EFFECT 1: Auto-sync form data        │
│ ✅ EFFECT 2: Monitoreo de fotografías   │
│ ✅ EFFECT 3+: Lógica específica         │
└──────────────────────────────────────────┘

┌─ MÉTODOS ────────────────────────────────┐
│ ✅ onInitCustom()                        │
│ ✅ detectarCambios() = false             │
│ ✅ actualizarValoresConPrefijo()         │
│ ✅ actualizarDatosCustom()               │
│ ✅ onFotografiasChange()                 │
└──────────────────────────────────────────┘

┌─ FORM-WRAPPER ───────────────────────────┐
│ ✅ Existe form-wrapper.component.ts      │
│ ✅ Extiende BaseSectionComponent         │
│ ✅ Template inline                       │
│ ✅ 25-30 líneas máximo                   │
│ ✅ Sin lógica, solo delegación           │
└──────────────────────────────────────────┘

┌─ CALIDAD ────────────────────────────────┐
│ ✅ Sin RxJS subscriptions manuales       │
│ ✅ Sin setTimeout                        │
│ ✅ Sin flags duplicados                  │
│ ✅ Persistencia automática                │
│ ✅ Form↔View sincronizados               │
└──────────────────────────────────────────┘
```

---

## 🎯 PATRÓN APLICABLE A NUEVAS SECCIONES

**Plantilla universal para cualquier sección nueva:**

```typescript
import { Component, Input, OnDestroy, ChangeDetectorRef, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccionX',
  templateUrl: './seccionX.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ...]
})
export class SeccionXComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.X';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaSeccionX';
  override useReactiveSync: boolean = true;

  fotografiasSeccionX: FotoItem[] = [];

  // ✅ SIGNALS
  readonly formDataSignal: Signal<any> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  readonly parrafoSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const manual = data['parrafoSeccionX'];
    return manual || 'Texto por defecto';
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(..., `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(..., `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(..., `${this.PHOTO_PREFIX}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  readonly viewModel: Signal<any> = computed(() => ({
    datos: this.formDataSignal(),
    parrafo: this.parrafoSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    // ✅ EFFECT 1
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2
    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.fotografiasSeccionX = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.fotografiasSeccionX = [...this.fotografiasCache];
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    super.onFotografiasChange(fotografias);
    this.fotografiasSeccionX = fotografias;
    this.cdRef.markForCheck();
  }
}
```

---

## 📈 VENTAJAS DEL PATRÓN UNIVERSAL

| Ventaja | Beneficio |
|---------|-----------|
| **Consistencia** | Todas las secciones funcionan igual |
| **Predecibilidad** | Bugs son fáciles de identificar |
| **Mantenibilidad** | Nuevo dev entiende patrón rápidamente |
| **Escalabilidad** | Nuevas secciones siguen template |
| **Performance** | Signals + OnPush = rendering óptimo |
| **Reactividad** | Cambios se propagan automáticamente |
| **Sincronización** | Form↔View siempre en sync |

---

## 🗂️ TABLAS CON ESTRUCTURA FIJA (Sección 7 - Patrón Avanzado)

**Para secciones con tablas de estructura predefinida (categorías fijas, porcentajes calculados)**

### 📊 Características de Tablas con Estructura Fija

**Cuándo usar este patrón:**
- ✅ Las filas de categorías NO cambian (son fijas)
- ✅ Los porcentajes se calculan dinámicamente (no editables)
- ✅ Solo algunos campos son editables (ej: casos, hombres, mujeres)
- ✅ Siempre hay una fila de Total (no editable)
- ✅ El usuario NO puede agregar/eliminar filas

**Ejemplo real: Sección 7 (PET, PEA, PEA Ocupada)**

---

### 1️⃣ DEFINIR DATOS INICIALES EN SIGNALS

```typescript
// ✅ Tabla PET con estructura fija
readonly petTablaSignal: Signal<any[]> = computed(() => {
  const formData = this.formularioDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
  const tablaActual = Array.isArray(formData[petTablaKey]) ? formData[petTablaKey] : [];
  
  // Si no hay datos, retornar estructura inicial SIEMPRE
  if (tablaActual.length === 0) {
    return [
      { categoria: '15 a 29 años', casos: 0, porcentaje: '0,00 %' },
      { categoria: '30 a 44 años', casos: 0, porcentaje: '0,00 %' },
      { categoria: '45 a 64 años', casos: 0, porcentaje: '0,00 %' },
      { categoria: '65 años a más', casos: 0, porcentaje: '0,00 %' },
      { categoria: 'Total', casos: 0, porcentaje: '100,00 %' }
    ];
  }
  
  return tablaActual;
});

// ✅ Tabla PEA con estructura fija y género
readonly peaTablaSignal: Signal<any[]> = computed(() => {
  const formData = this.formularioDataSignal();
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
  const tablaActual = Array.isArray(formData[peaTablaKey]) ? formData[peaTablaKey] : [];
  
  if (tablaActual.length === 0) {
    return [
      { 
        categoria: 'PEA', 
        hombres: 0, porcentajeHombres: '0,00 %', 
        mujeres: 0, porcentajeMujeres: '0,00 %', 
        casos: 0, porcentaje: '0,00 %' 
      },
      { 
        categoria: 'No PEA', 
        hombres: 0, porcentajeHombres: '0,00 %', 
        mujeres: 0, porcentajeMujeres: '0,00 %', 
        casos: 0, porcentaje: '0,00 %' 
      },
      { 
        categoria: 'Total', 
        hombres: 0, porcentajeHombres: '100,00 %', 
        mujeres: 0, porcentajeMujeres: '100,00 %', 
        casos: 0, porcentaje: '100,00 %' 
      }
    ];
  }
  
  return tablaActual;
});
```

---

### 2️⃣ CONFIGURAR COLUMNAS EN SERVICE

**Patrón: Usar `readonly: true` para columnas no editables**

```typescript
// seccionX-table-config.service.ts
@Injectable({ providedIn: 'root' })
export class SeccionXTableConfigService {

  getColumnasTabla(): TableColumn[] {
    return [
      // ❌ NO EDITABLE: Categorías son fijas
      { field: 'categoria', label: 'Categoría', type: 'text', readonly: true },
      
      // ✅ EDITABLE: Solo datos numéricos
      { field: 'casos', label: 'Casos', type: 'number', dataType: 'number' },
      
      // ❌ NO EDITABLE: Porcentajes calculados dinámicamente
      { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
    ];
  }

  getColumnasConGenero(): TableColumn[] {
    return [
      // ❌ NO EDITABLE
      { field: 'categoria', label: 'Categoría', type: 'text', readonly: true },
      
      // ✅ EDITABLE
      { field: 'hombres', label: 'Hombres', type: 'number', dataType: 'number' },
      
      // ❌ NO EDITABLE: % automático
      { field: 'porcentajeHombres', label: '% Hombres', type: 'text', readonly: true },
      
      // ✅ EDITABLE
      { field: 'mujeres', label: 'Mujeres', type: 'number', dataType: 'number' },
      
      // ❌ NO EDITABLE: % automático
      { field: 'porcentajeMujeres', label: '% Mujeres', type: 'text', readonly: true },
      
      // ❌ NO EDITABLE: Se calcula como hombres + mujeres
      { field: 'casos', label: 'Total', type: 'number', readonly: true },
      
      // ❌ NO EDITABLE: % automático
      { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
    ];
  }
}
```

---

### 3️⃣ CONFIGURAR TABLA EN TEMPLATE

**Patrón: Ocultar botones agregar/eliminar**

```html
<!-- Template del formulario -->
<label class="label">Tabla PET - Editable</label>
<app-dynamic-table
  [datos]="datos"
  [config]="petConfig"
  [columns]="tableCfg.getColumnasTabla()"
  [sectionId]="seccionId"
  [tablaKey]="'petTabla'"
  [showAddButton]="false"              <!-- 🔴 OCULTAR botón agregar -->
  [showDeleteButton]="false"           <!-- 🔴 OCULTAR botón eliminar -->
  (tableUpdated)="onTablaPETActualizada()">
</app-dynamic-table>
```

---

### 4️⃣ MANEJAR CAMBIOS DE TABLA

**Patrón: Persistir + Recalcular porcentajes**

```typescript
export class SeccionXFormComponent extends BaseSectionComponent {

  onTablaPETActualizada(): void {
    // ✅ 1. Leer tabla actual desde datos legacy
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const tablaActual = this.datos[petTablaKey] || [];
    
    // ✅ 2. Persistir cambios al projectFacade
    this.projectFacade.setField(this.seccionId, null, petTablaKey, tablaActual);
    
    // ✅ 3. Recalcular porcentajes automáticamente
    this.calcularPorcentajesPET();
    this.cdRef.markForCheck();
  }

  calcularPorcentajesPET(): void {
    const tabla = this.petTablaSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';

    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return;

    // Calcular total de todos los casos (excepto Total)
    const totalPET = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        return sum + (parseInt(item.casos) || 0);
      }
      return sum;
    }, 0);

    if (totalPET === 0) return;

    // Mapear tabla con porcentajes recalculados
    const tablaActualizada = tabla.map((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';

      // Fila Total siempre es 100%
      if (categoria.includes('total')) {
        return {
          ...item,
          porcentaje: '100,00 %'
        };
      }

      // Calcular porcentaje para otras filas
      const casos = parseInt(item.casos) || 0;
      const porcentaje = ((casos / totalPET) * 100);
      const porcentajeFormateado = porcentaje.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).replace('.', ',') + ' %';

      return {
        ...item,
        porcentaje: porcentajeFormateado
      };
    });

    // ✅ Persistir tabla con porcentajes calculados
    this.projectFacade.setField(this.seccionId, null, petTablaKey, tablaActualizada);
  }
}
```

---

### 5️⃣ SINCRONIZAR FORM ↔ VIEW (TABLAS)

**Patrón: Effects para auto-sync**

```typescript
export class SeccionXFormComponent extends BaseSectionComponent {

  constructor(cdRef: ChangeDetectorRef, injector: Injector, ...) {
    super(cdRef, injector);

    // ✅ EFFECT: Sincronizar tabla PET automáticamente
    effect(() => {
      const tabla = this.petTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
      const datosActuales = this.datos[petTablaKey];
      
      // Solo actualizar si cambió
      if (JSON.stringify(tabla) !== JSON.stringify(datosActuales)) {
        this.datos[petTablaKey] = tabla;
      }
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT: Sincronizar tabla PEA automáticamente
    effect(() => {
      const tabla = this.peaTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
      const datosActuales = this.datos[peaTablaKey];
      
      if (JSON.stringify(tabla) !== JSON.stringify(datosActuales)) {
        this.datos[peaTablaKey] = tabla;
      }
      this.cdRef.markForCheck();
    });
  }
}
```

**En el componente VIEW:**

```typescript
export class SeccionXViewInternalComponent extends BaseSectionComponent {

  readonly petTablaSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const tablaActual = Array.isArray(formData[petTablaKey]) ? formData[petTablaKey] : [];
    
    // Misma estructura inicial que en Form
    if (tablaActual.length === 0) {
      return [
        { categoria: '15 a 29 años', casos: 0, porcentaje: '0,00 %' },
        // ...
      ];
    }
    
    return tablaActual;
  });

  constructor(cdRef: ChangeDetectorRef, injector: Injector, ...) {
    super(cdRef, injector);

    // ✅ EFFECT: AUTO-SYNC desde Signal
    effect(() => {
      const tabla = this.petTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
      this.datos[petTablaKey] = tabla;  // ← Auto-actualiza
      this.cdRef.markForCheck();
    });
  }

  getTablaPET(): any[] {
    return this.petTablaSignal();  // ← Siempre sincronizada
  }
}
```

---

### 📋 CHECKLIST - TABLAS CON ESTRUCTURA FIJA

```
✅ ESTRUCTURA INICIAL
  [ ] ¿Tabla tiene datos iniciales en Signal computed()?
  [ ] ¿Estructura no cambia (siempre mismas categorías)?
  [ ] ¿Hay fila de Total que no se edita?

✅ CONFIGURACIÓN DE COLUMNAS
  [ ] ¿Columna 'categoria' tiene readonly: true?
  [ ] ¿Columnas de % tienen readonly: true?
  [ ] ¿Columnas editables están claramente marcadas?
  [ ] ¿Campos calculados (como 'casos' en PEA) están readonly?

✅ TEMPLATE
  [ ] ¿showAddButton="false" oculta botón agregar?
  [ ] ¿showDeleteButton="false" oculta botón eliminar?
  [ ] ¿La tabla llama onTabla*Actualizada() en (tableUpdated)?

✅ PERSISTENCIA
  [ ] ¿onTabla*Actualizada() persiste con projectFacade.setField()?
  [ ] ¿calcularPorcentajes*() recalcula y persiste?
  [ ] ¿No hay setTimeout para sincronización?

✅ SINCRONIZACIÓN
  [ ] ¿Hay effect() que sincroniza tabla en Form?
  [ ] ¿Hay effect() que sincroniza tabla en View?
  [ ] ¿Form y View comparten formDataSignal?
  [ ] ¿Cambios en Form se reflejan en View sin retraso?

✅ REACTIVIDAD
  [ ] ¿tablaSignal es computed()?
  [ ] ¿Tabla se actualiza al editar celdas?
  [ ] ¿Porcentajes se recalculan automáticamente?
  [ ] ¿Cambios persisten al recargar la página?
```

---

### 🎯 EJEMPLO COMPLETO: Sección 7

**Ubicación de archivos:**
```
src/app/shared/components/
├── forms/
│   └── seccion7-form-wrapper.component.ts          (28 líneas)
├── seccion7/
│   ├── seccion7-form.component.ts                  (875 líneas - con tablas)
│   ├── seccion7-form.component.html
│   ├── seccion7-view-internal.component.ts         (772 líneas)
│   └── seccion7-view.component.html

src/app/core/services/domain/
└── seccion7-table-config.service.ts                (3 tablas configuradas)
```

**Tablas implementadas:**
1. **PET** (Población en Edad de Trabajar)
   - 5 filas fijas: 15-29, 30-44, 45-64, 65+, Total
   - Editable: casos
   - Readonly: categoría, porcentaje

2. **PEA** (Población Económicamente Activa)
   - 3 filas fijas: PEA, No PEA, Total
   - Editable: hombres, mujeres
   - Readonly: categoría, casos, porcentaje*, %Hombres, %Mujeres

3. **PEA Ocupada**
   - 3 filas fijas: Ocupada, Desocupada, Total
   - Editable: hombres, mujeres
   - Readonly: categoría, casos, porcentaje*, %Hombres, %Mujeres

---

## 🎓 CONCLUSIÓN

**Se ha identificado un PATRÓN UNIVERSAL y CLARO en todas las 5 secciones MODO IDEAL:**

1. ✅ **Estructura:** Siempre BaseSectionComponent + wrapper + view
2. ✅ **Signals:** formDataSignal, parrafoSignal, photoFieldsHash, viewModel
3. ✅ **Effects:** Mínimo 2 (auto-sync + fotos), máximo 4+
4. ✅ **Métodos:** onInitCustom, detectarCambios, actualizarValoresConPrefijo, onFotografiasChange
5. ✅ **Sincronización:** ProjectState centralizado → Signals reactivos → Effects automáticos
6. ✅ **Form↔View:** MISMO estado, ambos leen vía Signals, Vista sincronizada automáticamente
7. ✅ **Tablas:** Estructura fija con datos iniciales, readonly para categorías/porcentajes, botones ocultos

**Este patrón es aplicable a CUALQUIER sección futura, incluyendo variantes con tablas avanzadas.**

