# Guía de Estilos Frontend - Estándares de Diseño

## Introducción

Este documento define los estándares de CSS para mantener **consistencia visual** en todas las secciones del Documentador. 

**Regla de Oro:** 
> **USA `shared.css` PARA TODO. NO AGREGUES CSS LOCAL A LAS SECCIONES.**

---

## ¿Por Qué Esto Importa?

**Antes (Inconsistente):**
- Sección 2: Tabla con bordes azules
- Sección 6: Tabla con bordes negros
- Sección 10: Tabla con bordes grises
- **Resultado:** UI confusa, falta de cohesión

**Después (Consistente):**
- TODAS usan `shared.css`
- TODAS las tablas igual
- Colores, tamaños, espacios uniforme
- **Resultado:** UI profesional, predecible

---

## Patrón Correcto: Sección 6

La **Sección 6 es el modelo a seguir:**

```
seccion6/
├── seccion6.component.html      ← HTML con clases de shared.css
├── seccion6.component.ts        ← Lógica, sin CSS
└── seccion6.component.css       ← VACÍO ✓
```

**Porqué funciona:**
- ✅ Usa clases estándar: `.table-container`, `.table-header`, `.table-cell`
- ✅ Sin estilos inline (`style="..."`)
- ✅ Sin CSS local que override
- ✅ Heredan automáticamente toda actualización a `shared.css`

---

## Clases CSS Disponibles en `shared.css`

### Tablas

```css
/* Contenedor de tabla */
.table-container
  - width: 100%
  - border-collapse: collapse
  - Márgenes y espacios automáticos

/* Header de tabla */
.table-header, .table-header-first, .table-header-last
  - background: #e6e6e6
  - border: 1px black
  - font-weight: bold
  - text-align: center

/* Celda de tabla */
.table-cell
  - border: 1px black
  - padding: 7px
  - text-align: center

/* Fila de totales */
.table-row-total
  - background-color: #d3d3d3
  - font-weight: bold

/* Título de tabla */
.table-title, .table-title-main
  - text-align: center
  - font-weight: 700
  - Márgenes automáticos
```

### Formularios

```css
/* Etiqueta */
.label
  - font-weight: 600
  - color: #0b274e
  - margin-top: 15px
  - margin-bottom: 5px

/* Inputs */
input[type="text"], input[type="number"], select, textarea
  - width: 100%
  - padding: 8px
  - border: 1px solid
  - Estilos consistentes

/* Botones */
.btn, button
  - Colores: primary, secondary
  - Padding, bordes, sombras definidas
```

### Imágenes

```css
.fotografia
  - text-align: center
  - margin: 20px 0

.fotografia-imagen
  - max-width: 100%
  - max-height: 400px
  - display: block
  - margin: auto
```

### Paneles

```css
.panel-gold
  - border: 2px solid #ccc
  - border-radius: 8px
  - background: white
  - box-shadow: suave
  - padding: 20px
```

---

## Cómo Usar en HTML

### ✅ CORRECTO - Usa clases globales

```html
<table class="table-container">
  <thead>
    <tr>
      <th class="table-header">Columna 1</th>
      <th class="table-header">Columna 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="table-cell">Valor</td>
      <td class="table-cell">100</td>
    </tr>
    <tr class="table-row-total">
      <td class="table-cell"><strong>Total</strong></td>
      <td class="table-cell">100</td>
    </tr>
  </tbody>
</table>
```

### ❌ INCORRECTO - Estilos inline/local

```html
<!-- NUNCA HAGAS ESTO -->
<table style="border: 2px blue; background: yellow;">
  <tr style="background: green; padding: 20px;">
    <td style="color: red; font-size: 18px;">Malo</td>
  </tr>
</table>
```

### ❌ INCORRECTO - CSS local en component.css

```css
/* seccion2.component.css */
table {
  border: 3px purple;  /* ❌ Override - rompe consistencia */
  margin: 50px;       /* ❌ Diferente de otras secciones */
}

.custom-header {     /* ❌ Clase local, no reutilizable */
  background: orange;
}
```

---

## Checklist para Nueva Sección

Cuando crees una nueva sección, verifica:

- [ ] **`seccion-X.component.css` está VACÍO**
  - Si tiene estilos, muévelos a `shared.css`
  
- [ ] **HTML usa clases de `shared.css`**
  - `.table-container`, `.table-header`, `.table-cell`
  - `.label`, `.form-control`, `.btn`
  - `.fotografia`, `.fotografia-imagen`
  
- [ ] **SIN estilos inline** (`style="..."`)
  - Si necesitas estilo especial, agrégalo a `shared.css` con nueva clase
  
- [ ] **SIN clases locales** para lógica visual
  - Solo use clases de `shared.css`
  
- [ ] **Colores vienen de CSS variables**
  ```css
  :root {
    --primary-color: #000000;
    --secondary-color: #d32f2f;
    --bg-table-header: #e6e6e6;
    /* etc */
  }
  ```

---

## Si Necesitas Nuevo Estilo

**NO** crees CSS local. En su lugar:

1. Agrega la clase a `shared.css`
2. Úsala en TODAS las secciones que la necesiten

**Ejemplo:**

```css
/* En shared.css */
.table-row-highlight {
  background-color: #fffaf0;
  border-left: 3px solid #c46902;
}
```

```html
<!-- En cualquier sección -->
<tr class="table-row-highlight">
  <td class="table-cell">Dato importante</td>
</tr>
```

---

## Variables CSS Disponibles

Usa SIEMPRE variables en lugar de hardcoding colores/espacios:

```css
:root {
  /* Colores */
  --primary-color: #000000;
  --secondary-color: #d32f2f;
  --border-color: #cccccc;
  --bg-table-header: #e6e6e6;
  --bg-form: #f7f7f7;
  
  /* Espaciados */
  --spacing-xs: 5px;
  --spacing-sm: 10px;
  --spacing-md: 15px;
  --spacing-lg: 20px;
  
  /* Bordes */
  --border-radius: 8px;
  
  /* Sombras */
  --shadow-soft: 0 0 4px 4px rgba(0, 0, 0, 0.2);
}
```

**Uso:**
```css
/* ✅ BIEN */
padding: var(--spacing-lg);
color: var(--primary-color);
border-radius: var(--border-radius);

/* ❌ MAL */
padding: 20px;
color: #000;
border-radius: 8px;
```

---

## Auditoría: Encontrar CSS Inconsistente

Para revisar qué secciones tienen CSS local:

```bash
# Ver tamaño de archivos CSS
ls -lh src/app/shared/components/seccion*/seccion*.component.css

# Buscar secciones con CSS no vacío
find . -name "seccion*.component.css" ! -empty -type f
```

**Resultado esperado:**
- Sección 6: **VACÍO** ✓
- Otras secciones: **También VACÍAS** ✓

Si encuentras una con contenido, **mueve ese CSS a `shared.css`**.

---

## Resumen

| Aspecto | ✅ CORRECTO | ❌ INCORRECTO |
|---------|-----------|-------------|
| **CSS** | En `shared.css` | En component.css local |
| **Clases** | De `shared.css` | Clases custom locales |
| **Estilos** | Via clases CSS | Style inline |
| **Colores** | Variables CSS | Hardcoded |
| **Tablas** | `.table-container`, `.table-cell` | `<table style="..."` |
| **Labels** | `.label` class | `style="font-weight:600"` |

---

## Referencia Rápida: Clases Principales

```html
<!-- Tabla -->
<table class="table-container">
  <thead>
    <tr>
      <th class="table-header">Encabezado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="table-cell">Celda</td>
    </tr>
    <tr class="table-row-total">
      <td class="table-cell"><strong>Total</strong></td>
    </tr>
  </tbody>
</table>

<!-- Formulario -->
<label class="label">Campo</label>
<input type="text" class="form-control">
<button class="btn btn-primary">Guardar</button>

<!-- Panel -->
<div class="panel-gold">
  <h3>Contenido</h3>
</div>

<!-- Imagen -->
<div class="fotografia">
  <img class="fotografia-imagen" src="...">
  <p>Descripción</p>
</div>
```

---

## Preguntas Frecuentes

**P: ¿Puedo agregar estilos inline para urgencias?**
A: NO. Siempre agrega a `shared.css`. Toma 2 minutos más pero asegura consistencia.

**P: ¿Y si otras secciones usan estilo diferente?**
A: Actualizarlas también. La inconsistencia es deuda técnica que crece.

**P: ¿Qué pasa si cambio `shared.css`?**
A: TODAS las secciones se actualizan automáticamente. Por eso es poderoso.

**P: ¿Puedo override con `!important`?**
A: NO. Si necesitas override, es señal de mal diseño. Refactoriza en `shared.css`.

---

## Contacto / Preguntas

Si encuentras una sección con CSS inconsistente o necesitas agregar nuevo estilo:
- Reporta en este documento
- Agrega a `shared.css` (no a component local)
- Actualiza todas las secciones que lo usen

