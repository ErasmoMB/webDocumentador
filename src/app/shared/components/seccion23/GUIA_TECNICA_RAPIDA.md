# SECCIÓN 23 - GUÍA DE REFERENCIA RÁPIDA

## 🔧 PATRÓN DE PREFIJOS

```
CORRECTO para Sección 23:
├─ fotografia1Imagen_B1      (imagen guardada)
├─ fotografia1Titulo_B1       (título de foto)
├─ fotografia1Fuente_B1       (fuente de foto)
├─ textoPETIntro_B1           (párrafo 1)
├─ textoPET_B1                (párrafo 2)
└─ peaDistritoSexoTabla_B1    (tabla)

INCORRECTO:
├─ fotografiaPEA1Imagen_B1    ❌ Prefijo inconsistente
├─ fotografia1Imagen           ❌ Sin grupo
└─ PEAfotografia1Imagen_B1    ❌ Orden incorrecto
```

---

## 📌 FLUJO DE IMAGEN

```
1) Usuario selecciona imagen en UI
   ↓
2) ImageUploadComponent emite evento (fotografiasChange)
   ↓
3) onFotografiasChange() recibe FotoItem[]
   ↓
4) Construye updates: {fotografia1Imagen_B1: base64, fotografia1Titulo_B1: "Título", ...}
   ↓
5) Guarda en ProjectFacade: projectFacade.setFields()
   ↓
6) Persiste en Backend: formChange.persistFields()
   ↓
7) fotosCacheSignal detecta cambio y se recalcula
   ↓
8) Vista se actualiza automáticamente
```

---

## 🧩 COMPONENTES CLAVE

### A) Signal para Párrafos
```typescript
readonly textoPETIntroSignal: Signal<string> = computed(() => {
  const prefijo = this.obtenerPrefijoGrupo();            // "_B1", "_A1", etc
  const fieldKey = prefijo 
    ? `textoPETIntro${prefijo}` 
    : 'textoPETIntro_AISI';
  
  const manual = this.projectFacade.selectField(
    this.seccionId, 
    null, 
    fieldKey
  )() || '';
  
  if (manual && manual.trim().length > 0) return manual;
  
  // Fallback a template con placeholders
  return SECCION23_TEMPLATES.petIntroDefault;
});
```

### B) Signal para Fotos
```typescript
readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
  const fotos: FotoItem[] = [];
  const basePrefix = 'fotografia';                    // IMPORTANTE: sin "PEA"
  const groupPrefix = this.obtenerPrefijoGrupo();
  
  for (let i = 1; i <= 10; i++) {
    const imgKey = groupPrefix 
      ? `${basePrefix}${i}Imagen${groupPrefix}` 
      : `${basePrefix}${i}Imagen`;
    
    const imagen = this.projectFacade.selectField(
      this.seccionId, 
      null, 
      imgKey
    )();
    
    if (imagen) {
      fotos.push({
        titulo: this.projectFacade.selectField(
          this.seccionId, 
          null, 
          `${basePrefix}${i}Titulo${groupPrefix}`
        )() || '',
        fuente: this.projectFacade.selectField(
          this.seccionId, 
          null, 
          `${basePrefix}${i}Fuente${groupPrefix}`
        )() || '',
        imagen
      } as FotoItem);
    }
  }
  return fotos;
});
```

### C) Handler de Fotografías
```typescript
override onFotografiasChange(fotografias: FotoItem[]): void {
  const prefix = 'fotografia';                         // CRUCIAL: mismo que signal
  const groupPrefix = this.obtenerPrefijoGrupo();
  const updates: Record<string, any> = {};
  
  // PASO 1: Limpiar slots anteriores
  for (let i = 1; i <= 10; i++) {
    const imgKey = groupPrefix 
      ? `${prefix}${i}Imagen${groupPrefix}` 
      : `${prefix}${i}Imagen`;
    updates[imgKey] = '';
    updates[`${prefix}${i}Titulo${groupPrefix || ''}`] = '';
    updates[`${prefix}${i}Fuente${groupPrefix || ''}`] = '';
  }
  
  // PASO 2: Guardar nuevas
  fotografias.forEach((foto, index) => {
    if (foto.imagen) {
      const idx = index + 1;
      updates[groupPrefix 
        ? `${prefix}${idx}Imagen${groupPrefix}` 
        : `${prefix}${idx}Imagen`] = foto.imagen;
      updates[groupPrefix 
        ? `${prefix}${idx}Titulo${groupPrefix}` 
        : `${prefix}${idx}Titulo`] = foto.titulo || '';
      updates[groupPrefix 
        ? `${prefix}${idx}Fuente${groupPrefix}` 
        : `${prefix}${idx}Fuente`] = foto.fuente || '';
    }
  });
  
  // PASO 3: Persistir en 2 capas
  this.projectFacade.setFields(this.seccionId, null, updates);
  try {
    this.formChange.persistFields(this.seccionId, 'images', updates);
  } catch (e) {}
  
  this.fotografiasFormMulti = fotografias;
  this.cdRef.markForCheck();
}
```

### D) ViewModel (Agregar todo)
```typescript
readonly viewModel: Signal<any> = computed(() => ({
  ...this.formDataSignal(),
  petGruposEdad: this.petGruposEdadSignal(),
  peaDistritoSexo: this.peaDistritoSexoSignal(),
  peaOcupadaDesocupada: this.peaOcupadaDesocupadaSignal(),
  fotos: this.fotosCacheSignal(),              // ← Fotos agregadas
  textos: {
    petIntro: this.textoPETIntroSignal(),
    pet: this.textoPETSignal(),
    indicadoresDistritales: this.textoIndicadoresDistritalesSignal(),
    pea: this.textoPEASignal(),
    empleo: this.textoEmpleoSignal(),
    empleoDependiente: this.textoEmpleoDependienteSignal(),
    ingresos: this.textoIngresosSignal(),
    indiceDesempleo: this.textoIndiceDesempleoSignal(),
    peaFull: this.textoPEASignalFull(),
    analisisPEA: this.textoAnalisisPEASignal()
  }
}));
```

---

## 🎯 DEBUGGING

### Las imágenes no persisten:
1. ✅ Verificar que prefijo en `onFotografiasChange` = prefijo en `fotosCacheSignal`
2. ✅ Confirmar que `formChange.persistFields()` no lanza excepciones
3. ✅ Revisar Redux/SessionStorage que las claves están
4. ✅ Verificar grupo AISI actual con `obtenerPrefijoGrupo()`

### Los párrafos no muestran template:
1. ✅ Verificar que template tiene `____` no `{{variable}}`
2. ✅ Confirmar que el signal retorna template cuando vacío
3. ✅ Revisar que viewModel() está siendo usado en HTML

### Cambio de grupo no actualiza datos:
1. ✅ Verificar que `obtenerPrefijoGrupo()` detecta cambio
2. ✅ Confirmar que signals son `computed()` no `signal()`
3. ✅ Revisar que `cdRef.markForCheck()` se llama en handlers

---

## 📊 CHECKLIST DE INTEGRACIÓN

```typescript
// Antes de terminar, verificar:

☑ Prefijo fotografia (sin "PEA"):
  - En fotosCacheSignal
  - En onFotografiasChange
  - En photoPrefixSignal

☑ Templates tienen ____ :
  - petIntroDefault
  - empleoSituacionDefault
  - ingresosDefault
  - indiceDesempleoDefault
  - Etc.

☑ Signals son computed():
  - fotosCacheSignal
  - Todos los textoParagrafo*Signal

☑ ViewModel agrega todo:
  - fotos: this.fotosCacheSignal()
  - Todos los textos en textos object

☑ HTML usa viewModel():
  - [value]="viewModel().textos.petIntro"
  - [fotografias]="fotosCacheSignal()"
  - (fotografiasChange)="onFotografiasChange($event)"

☑ Handlers son override:
  - onFotografiasChange()
  - Otros que sea necesarios
```

---

## 🔗 REFERENCIAS

- **Sección 21**: `src/app/shared/components/seccion21/`
- **Base Component**: `src/app/shared/components/base-section.component.ts`
- **Constants**: `src/app/shared/components/seccion23/seccion23-constants.ts`
- **Template**: `src/app/shared/components/seccion23/seccion23-form.component.html`
