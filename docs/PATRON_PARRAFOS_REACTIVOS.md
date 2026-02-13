# 📋 Patrón de Párrafos Reactivos

## Resumen ejecutivo

Los **párrafos en las secciones se dividen en dos categorías** según su contenido:

| Tipo | Ubicación | Cuando | Ejemplo |
|------|-----------|--------|---------|
| **Párrafos estáticos** (solo texto puro) | `*-constants.ts` | No tienen campos dinámicos | "Los objetivos son..." |
| **Párrafos dinámicos** (con campos a llenar) | `*-view.component.ts` | Contienen placeholders `____` que se reemplazan | "El proyecto ____ está en..." |

---

## 🎯 Regla de Oro

✅ **CONSTANTS:**
```typescript
// ❌ NO va aquí si tiene placeholders
export const PARRAFO_CON_PROYECTO = 'El proyecto ____ se encuentra...';

// ✅ SÍ va aquí - es puro texto
export const OBJETIVO_DEFAULT = 'Establecer la línea base ambiental...';
```

✅ **VIEW.COMPONENT.TS:**
```typescript
// ✅ SI tiene placeholders que se reemplazan dinámicamente
private reemplazarPlaceholdersEnParrafo(texto: string): string {
  const proyecto = this.projectNameSignal() || '____';
  return texto.replace(/El proyecto ____/g, `El proyecto ${proyecto}`);
}
```

---

## 📚 Ejemplo Completo: Sección 1

### 1️⃣ **Constants (seccion1-constants.ts)**

**Almacena SOLO párrafos estáticos sin placeholders:**

```typescript
export const SECCION1_TEMPLATES = {
  // ✅ Texto puro - VA EN CONSTANTS
  labelNombreProyecto: 'Nombre del Proyecto',
  labelDepartamento: 'Departamento',
  seccionEditarParrafos: 'Editar Párrafos',
  
  // ✅ Objetivo básico - VA EN CONSTANTS
  hintParrafoPrincipal: 'Este es el párrafo introductorio de la sección',
};

// ✅ Estos van aquí porque NO tienen placeholders
export const OBJETIVO_DEFAULT_1 = 'Caracterizar {projectName} en todos sus aspectos sociodemográficos';
export const OBJETIVO_DEFAULT_2 = 'Establecer la línea base inicial del proyecto';
```

---

### 2️⃣ **View Component TS (seccion1-view.component.ts)**

**Aquí van todos los párrafos con placeholders dinámicos:**

```typescript
export class Seccion1ViewComponent extends BaseSectionComponent {
  // =====================================
  // ✅ SIGNALS PARA CAMPOS DINÁMICOS
  // =====================================
  readonly projectNameSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'projectName')() || '____';
  });

  readonly departamentoSeleccionadoSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['departamentoSeleccionado'] ?? formData['geoInfo']?.DPTO ?? '';
  });

  readonly provinciaSeleccionadaSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['provinciaSeleccionada'] ?? formData['geoInfo']?.PROV ?? '';
  });

  readonly distritoSeleccionadoSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['distritoSeleccionado'] ?? formData['geoInfo']?.DIST ?? '';
  });

  // =====================================
  // ✅ PARRAFO COMPUTED - REACTIVO
  // =====================================
  readonly parrafoPrincipalSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    const guardado = formData['parrafoSeccion1_principal'];
    
    // Si hay un párrafo guardado, reemplazar placeholders
    if (guardado) return this.reemplazarPlaceholdersEnParrafo(guardado);
    
    // Si no, generar el texto con placeholders iniciales
    return this.obtenerTextoParrafoPrincipal();
  });

  // =====================================
  // ✅ MÉTODO: Generar párrafo CON placeholders
  // =====================================
  private obtenerTextoParrafoPrincipal(): string {
    // Lee los valores ACTUALES de los Signals
    const proyecto = this.projectNameSignal() || '____';
    const distrito = this.distritoSeleccionadoSignal() || '____';
    const provincia = this.provinciaSeleccionadaSignal() || '____';
    const departamento = this.departamentoSeleccionadoSignal() || '____';
    
    // ✅ Retorna párrafo CON todos los valores interpolados
    return `Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ${proyecto}, como un patrón de referencia inicial.

El proyecto ${proyecto} se encuentra ubicado en el distrito de ${distrito}, en la provincia de ${provincia}, en el departamento de ${departamento}, bajo la administración del Gobierno Regional de ${departamento}.

Este estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental.`;
  }

  // =====================================
  // ✅ MÉTODO: Reemplazar placeholders en párrafo guardado
  // =====================================
  private reemplazarPlaceholdersEnParrafo(texto: string): string {
    let resultado = texto;
    
    // Lee los valores ACTUALES de los Signals
    const proyecto = this.projectNameSignal() || '____';
    const distrito = this.distritoSeleccionadoSignal() || '____';
    const provincia = this.provinciaSeleccionadaSignal() || '____';
    const departamento = this.departamentoSeleccionadoSignal() || '____';
    
    // 🔍 Reemplaza todos los placeholders (____)
    resultado = resultado.replace(/El proyecto ____/g, `El proyecto ${proyecto}`);
    resultado = resultado.replace(/en el distrito de ____/g, `en el distrito de ${distrito}`);
    resultado = resultado.replace(/en la provincia de ____/g, `en la provincia de ${provincia}`);
    resultado = resultado.replace(/en el departamento de ____/g, `en el departamento de ${departamento}`);
    resultado = resultado.replace(/Regional de ____/g, `Regional de ${departamento}`);
    
    return resultado;
  }
}
```

---

### 3️⃣ **View Component HTML (seccion1-view.component.html)**

**Usa el Signal computed para renderizar:**

```html
<div class="seccion-view-content">
  <h2>3.1. DESCRIPCIÓN Y CARACTERIZACIÓN</h2>
  
  <!-- ✅ El párrafo se renderiza con el Signal computed -->
  <div *ngIf="parrafoPrincipalSignal() as parrafo" 
       class="text-justify" 
       [innerHTML]="formatearParrafo(parrafo)">
  </div>
  
  <!-- ✅ Se actualiza automáticamente cuando cambian los Signals -->
</div>
```

---

## 🔄 Flujo de Reactividad

```
┌─────────────────────────────────────────────────────────────┐
│ USUARIO ESCRIBE NOMBRE EN EL FORMULARIO                    │
│ (ej: "Proyecto Minero ABC")                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Signal: projectName.update('Proyecto Minero ABC')          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Signal: projectNameSignal() lee el valor ACTUAL            │
│ ("Proyecto Minero ABC")                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Computed: parrafoPrincipalSignal() se recalcula             │
│ - Llama obtenerTextoParrafoPrincipal()                     │
│ - Lee projectNameSignal() = "Proyecto Minero ABC"          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Retorna: "Este componente... del proyecto Proyecto Minero  │
│ ABC..."                                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ HTML: [innerHTML]="formatearParrafo()" se actualiza        │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist: ¿Dónde va cada párrafo?

### En CONSTANTS:
- ✅ Títulos de secciones
- ✅ Descripciones de campos
- ✅ Instrucciones para el usuario
- ✅ Objetivos por defecto (que no tienen placeholders)
- ✅ Cualquier texto que **NO cambie basado en datos del usuario**

### En VIEW.COMPONENT.TS:
- ✅ Párrafos con placeholders `____`
- ✅ Párrafos que se generan dinámicamente
- ✅ Textos que cambian según campos llenados
- ✅ Cualquier texto que **DEPENDA de Signals o datos reactivos**

---

## 🎓 Por qué este patrón funciona

| Aspecto | Beneficio |
|---------|-----------|
| **Separación de responsabilidades** | Constants = Datos estáticos, TS = Lógica reactiva |
| **Reactividad automática** | Signals + computed = sin suscripciones manuales |
| **Sincronización inmediata** | Los cambios en Signals se reflejan al instante en el HTML |
| **Fácil mantenimiento** | Si cambia el formato del párrafo, es un solo lugar |
| **Type-safe** | TypeScript valida tipos automáticamente |

---

## 🚫 Errores Comunes

```typescript
// ❌ MALO: Párrafo con placeholders en constants
export const PARRAFO_MALO = 'El proyecto ____ está en ____';
// Problema: Nunca se reemplazan los placeholders, se ve "____" en vista

// ✅ CORRECTO: En view.component.ts como método
private obtenerTextoParrafoPrincipal(): string {
  const proyecto = this.projectNameSignal() || '____';
  return `El proyecto ${proyecto} está en...`;
  // Los valores siempre frescos
}

// ❌ MALO: Leer datos viejos
private reemplazarPárrafo(texto: string): string {
  const proyecto = this.datos.projectName;  // ← Dato viejo
  return texto.replace(/____/g, proyecto);
}

// ✅ CORRECTO: Leer Signal actual
private reemplazarPárrafo(texto: string): string {
  const proyecto = this.projectNameSignal();  // ← Signal siempre fresco
  return texto.replace(/____/g, proyecto);
}
```

---

## 📝 Resumen

**Tres reglas simples:**

1. **Texto puro** → `constants.ts`
2. **Texto con placeholders** → `view.component.ts` (como método privado)
3. **Renderer** → `computed()` Signal que llama al método
4. **HTML** → `{{ signalComputed() }}`

Aplicando esto, **toda sección tendrá reactividad automática e inmediata** como la Sección 1. ✨
