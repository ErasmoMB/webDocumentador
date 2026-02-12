📋 Guía de Migración de Secciones a MODO IDEAL (RESUMEN EJECUTIVO)

Fecha: 11 de febrero de 2026  
Última actualización: 11 de febrero de 2026  
Estado: ✅ Secciones 14-18 COMPLETADAS

---

## 🎯 LOS 3 PUNTOS CRÍTICOS (OBLIGATORIOS)

### 1️⃣ NO HAY SERVICIOS DE TEXTO 🚫

**Prohibido:**
```typescript
// ❌ PROHIBIDO
constructor(private textGenerator: SeccionXTextGeneratorService) { }
```

**Obligatorio - Métodos INLINE en el componente:**
```typescript
obtenerTexto(): string {
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  const customKey = `textoXXX${prefijo}`;
  if (this.datos[customKey]?.trim()) {
    return this.datos[customKey];
  }
  return 'Texto por defecto...';
}
```

---

### 2️⃣ SINCRONIZACIÓN VIEW ↔ FORM (4 PUNTOS OBLIGATORIOS)

Si la Vista NO se actualiza al editar en el Formulario, falta UNO de estos:

- **Punto 1:** Signal reactivo en View Component
  ```typescript
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => 
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );
  ```
- **Punto 2:** Métodos USAN formDataSignal()
  ```typescript
  obtenerTexto(): string {
    const formData = this.formDataSignal();  // ← CRÍTICO
    return formData['textoXXX'] || 'default';
  }
  ```
- **Punto 3:** Template INVOCA métodos (NO propiedades)
  ```html
  <p>{{ obtenerTexto() }}</p>  <!-- ✅ -->
  <!-- ❌ <p>{{ datos['texto'] }}</p> -->
  ```
- **Punto 4:** Constructor con effect()
  ```typescript
  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
    effect(() => {
      this.formDataSignal();
      this.cdRef.markForCheck();  // ← FUERZA RE-RENDER
    });
  }
  ```

---

### 3️⃣ CAMPOS BASE SIN PREFIJO EN onFieldChange()

- **Correcto:** override agrega prefijo automáticamente
  ```typescript
  this.onFieldChange('titulo', value)           // → 'tituloGrupo1'
  this.onFieldChange('parrafo', value)          // → 'parrafoGrupo1'
  ```
- **Incorrecto:** prefijo duplicado
  ```typescript
  this.onFieldChange('tituloGrupo1', value)     // → 'tituloGrupo1Grupo1' ❌
  ```

---

## 📁 ESTRUCTURA POR SECCIÓN (5 Archivos)

```
src/app/shared/components/seccionX/
├── seccionX-constants.ts              ← Constantes (CRÍTICO)
├── seccionX-form.component.ts         ← Edición (~400 líneas)
├── seccionX-form.component.html
├── seccionX-view.component.ts         ← Visualización (~400 líneas)
└── seccionX-view.component.html

src/app/shared/components/forms/
└── seccionX-form-wrapper.component.ts ← Mínimo (28 líneas)
```

---

## 🔧 CHECKLIST RÁPIDO DE MIGRACIÓN

**PASO 1: CREAR CONSTANTS**
- [ ] SECCIONX_WATCHED_FIELDS
- [ ] SECCIONX_PHOTO_PREFIXES (si hay fotos)

**PASO 2: FORM COMPONENT**
- [ ] readonly formDataSignal = computed()
- [ ] Signals aislados por prefijo
- [ ] Effects para reactividad
- [ ] Métodos obtenerTextoXXX() INLINE (SIN servicio)
- [ ] onFieldChange() pasa campo BASE (sin prefijo)

**PASO 3: VIEW COMPONENT**
- [ ] readonly formDataSignal = computed() (igual que form)
- [ ] Constructor con effect() + markForCheck()
- [ ] Copiar EXACTAMENTE métodos obtenerTextoXXX() del form
- [ ] Template invoca métodos: {{ obtenerTextoXXX() }}

**PASO 4: FORM-WRAPPER**
- [ ] 28 líneas máximo
- [ ] Solo delega: <app-seccionX-form [modoFormulario]="true">
- [ ] Extiende BaseSectionComponent

**PASO 5: TESTING CRÍTICO**
- [ ] Editar en Formulario → View se actualiza EN VIVO ✅
- [ ] FALLA si: View estática, no responde cambios

---

## 📊 ESTADO ACTUAL

| Sección                                   | Estado | Servicios        | Sincronización |
|--------------------------------------------|--------|------------------|----------------|
| 14 - Indicadores Educativos                | ✅     | ❌ Eliminados    | ✅ OK          |
| 15 - Aspectos Culturales                   | ✅     | ❌ Eliminados    | ✅ OK          |
| 16 - Infraestructura Productiva            | ✅     | ❌ Eliminados    | ✅ OK          |
| 17 - Índice Desarrollo Humano              | ✅     | ❌ Eliminados    | ✅ OK          |
| 18 - Necesidades Básicas Insatisfechas     | ✅     | ❌ Eliminados    | ✅ OK          |

---

## ⚡ REGLAS DE ORO

- Sección 19-24: Aplicar mismo patrón (14-18 como referencia)
- Copiar estructura de sección 15 (funciona perfectamente)
- Verificar los 4 puntos de sincronización antes de usar

---

## 📌 PROBLEMAS COMUNES RESUELTOS

| Problema                  | Causa                        | Solución                                 |
|---------------------------|------------------------------|------------------------------------------|
| Vista no actualiza        | this.datos estático          | Usar formDataSignal = computed()         |
| Cambios duplican prefijo  | Pasar campo CON prefijo      | Pasar campo BASE sin prefijo             |
| Métodos no sincronnizan   | No usan signal               | Todos los métodos: const data = this.formDataSignal() |
| Template estático         | Usa propiedades              | Cambiar a: {{ obtenerMétodo() }}         |
| Compilación falla         | Sintaxis bracket             | datos['campo'] en lugar de datos.campo   |

---

## 📚 ARCHIVOS DE REFERENCIA

- ✅ Sección 15 - Reactividad perfecta (modelo a seguir)
- ✅ Sección 4 - Form-wrapper minimalista (referencia)
- ✅ PrefijoHelper - Aislamiento de datos
- ✅ BaseSectionComponent - Base de todos los componentes

---

Compilación actual: ✅ SIN ERRORES  
Todas las secciones: ✅ EN MODO IDEAL  
Sincronización View-Form: ✅ FUNCIONANDO EN TIEMPO REAL