# Patrón Correcto: Tablas Demográficas (Seccion 6)

## 🎯 Visión General

Las tablas demográficas de la Sección 6 siguen un patrón **de solo lectura en el formulario** que espeja exactamente la vista, donde:

- **Backend** proporciona datos brutos de demografía
- **Transformación** convierte datos a formato de tabla estándar
- **Almacenamiento** guarda datos con prefijo de grupo AISD
- **Presentación** muestra datos idénticos en vista y formulario (ambos read-only)

---

## 📋 Flujo Completo

### 1️⃣ Capa Backend (`/demograficos/datos`)

El backend devuelve un array con un objeto agregado:

```json
[
  {
    "hombres": 305,
    "mujeres": 305,
    "total": 610,
    "porcentaje_hombres": "50.00 %",
    "porcentaje_mujeres": "50.00 %",
    "matched": ["403060001", "403060002", "403060003"],
    "missing": []
  }
]
```

**Ubicación**: [`backend-lbs/src/modules/demograficos/demograficos.service.ts`](../../backend-lbs/src/modules/demograficos/demograficos.service.ts)

---

### 2️⃣ Capa de Transformación

Dos funciones transforman datos demográficos a formato de tabla estándar:

#### A. `transformPoblacionSexoDesdeDemograficos()`

**Ubicación**: [`src/app/core/config/table-transforms.ts`](../src/app/core/config/table-transforms.ts#L239)

```typescript
export function transformPoblacionSexoDesdeDemograficos(data: any): any[] {
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return [];

  // Transforma a 3 filas: Hombre, Mujer, Total
  return [
    { sexo: 'Hombre', casos: item.hombres || 0, porcentaje: item.porcentaje_hombres || '0 %' },
    { sexo: 'Mujer', casos: item.mujeres || 0, porcentaje: item.porcentaje_mujeres || '0 %' },
    { sexo: 'Total', casos: item.total || 0, porcentaje: '100.00 %' }
  ].filter(row => (row.casos || 0) > 0);
}
```

**Salida Esperada**:
```json
[
  { "sexo": "Hombre", "casos": 305, "porcentaje": "50.00 %" },
  { "sexo": "Mujer", "casos": 305, "porcentaje": "50.00 %" },
  { "sexo": "Total", "casos": 610, "porcentaje": "100.00 %" }
]
```

#### B. `transformPoblacionEtarioDesdeDemograficos()`

**Ubicación**: [`src/app/core/config/table-transforms.ts`](../src/app/core/config/table-transforms.ts#L258)

```typescript
export function transformPoblacionEtarioDesdeDemograficos(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  return arr.filter((row: any) => {
    const categoria = (row.categoria || '').toLowerCase().trim();
    // Excluir filas de Total - solo queremos categorías de edad
    return categoria !== 'total' && (row.casos || 0) > 0;
  });
}
```

**Salida Esperada**:
```json
[
  { "categoria": "0-14 años", "casos": 143, "porcentaje": "22.99 %" },
  { "categoria": "15-29 años", "casos": 91, "porcentaje": "14.63 %" },
  { "categoria": "30-44 años", "casos": 111, "porcentaje": "18.20 %" }
]
```

---

### 3️⃣ Capa de Almacenamiento

Los datos transformados se guardan **CON PREFIJO** en el Redux state:

**Ubicación**: [`src/app/shared/components/seccion6/seccion6-form.component.ts`](../src/app/shared/components/seccion6/seccion6-form.component.ts#L300)

```typescript
private cargarDatosDelBackend(): void {
  const prefijo = this.obtenerPrefijoGrupo();  // Ej: "_A1", "_A2"
  
  // Guardar población por sexo CON PREFIJO
  const tablaKeySexo = `poblacionSexoAISD${prefijo}`;  // "poblacionSexoAISD_A1"
  this.projectFacade.setField(this.seccionId, null, tablaKeySexo, datosTransformados);
  
  // También guardar sin prefijo para fallback
  this.projectFacade.setField(this.seccionId, null, 'poblacionSexoAISD', datosTransformados);
}
```

**Claves en State**:
- `poblacionSexoAISD_A1` (para grupo AISD 1)
- `poblacionSexoAISD_A2` (para grupo AISD 2)
- `poblacionEtarioAISD_A1` (para grupo AISD 1)
- etc.

---

### 4️⃣ Capa de Presentación - VISTA (Read-Only)

**Ubicación**: [`src/app/shared/components/seccion6/seccion6-view.component.html`](../src/app/shared/components/seccion6/seccion6-view.component.html)

```html
<table class="table-container">
  <thead>
    <tr>
      <th class="table-header">Sexo</th>
      <th class="table-header">Casos</th>
      <th class="table-header">Porcentaje</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let item of getPoblacionSexoConPorcentajes()">
      <td class="table-cell">
        <span appDataHighlight="database">{{ item.sexo }}</span>
      </td>
      <td class="table-cell">
        <span appDataHighlight="database">{{ item.casos }}</span>
      </td>
      <td class="table-cell">
        <span appDataHighlight="calculated">{{ item.porcentaje }}</span>
      </td>
    </tr>
  </tbody>
</table>
```

**Características**:
- ✅ Solo lectura (no hay inputs)
- ✅ Data highlight: datos de backend vs calculados
- ✅ Iteración simple con `*ngFor`
- ✅ Muestra exactamente lo que viene del backend

---

### 5️⃣ Capa de Presentación - FORMULARIO (Replicar Vista)

**Ubicación**: [`src/app/shared/components/seccion6/seccion6-form.component.html`](../src/app/shared/components/seccion6/seccion6-form.component.html)

**EL FORMULARIO DEBE SER IDÉNTICO A LA VISTA**, solo permitiendo editar:
- Título de la tabla
- Párrafo introductorio
- Fuente de la tabla

```html
<!-- Edición de metadatos -->
<div class="form-group" style="margin-bottom: 15px;">
  <label class="label">Título de la Tabla</label>
  <input 
    type="text" 
    class="form-control"
    [(ngModel)]="datos['tituloPoblacionSexoAISD' + obtenerPrefijoGrupo()]"
    (ngModelChange)="projectFacade.setField(seccionId, null, 'tituloPoblacionSexoAISD' + obtenerPrefijoGrupo(), $event)"
    placeholder="Ej: Población por sexo">
</div>

<!-- Tabla READ-ONLY (idéntica a la vista) -->
<table class="table-container">
  <thead>
    <tr>
      <th class="table-header">Sexo</th>
      <th class="table-header">Casos</th>
      <th class="table-header">Porcentaje</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let item of getPoblacionSexoConPorcentajes()">
      <td class="table-cell">
        <span>{{ item.sexo }}</span>
      </td>
      <td class="table-cell">
        <span>{{ item.casos }}</span>
      </td>
      <td class="table-cell">
        <span>{{ item.porcentaje }}</span>
      </td>
    </tr>
  </tbody>
</table>

<!-- Edición de fuente -->
<div class="form-group" style="margin-top: 15px;">
  <label class="label">Fuente de la Tabla</label>
  <input 
    type="text" 
    class="form-control"
    [(ngModel)]="datos['fuentePoblacionSexoAISD' + obtenerPrefijoGrupo()]"
    (ngModelChange)="projectFacade.setField(seccionId, null, 'fuentePoblacionSexoAISD' + obtenerPrefijoGrupo(), $event)"
    placeholder="Ej: GEADES, 2024">
</div>
```

**Diferencias clave respecto a editable**:
- ❌ SIN componente `app-dynamic-table` (que es editable)
- ❌ SIN botones "Agregar fila", "Eliminar fila"
- ❌ SIN filas extra de Total manual
- ✅ Tabla simple read-only como la vista
- ✅ Solo metadatos editables (título, fuente, párrafos)

---

## 🔄 Flujo de Datos Completo

```
┌─────────────────────────────────┐
│  Backend                        │
│  /demograficos/datos            │
│  {hombres: 305, mujeres: 305...}│
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Transformación                         │
│  transformPoblacionSexoDesdeDemograficos│
│  → [{sexo, casos, porcentaje}, ...]     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Redux State                            │
│  poblacionSexoAISD_A1: [...]            │
└────────────┬────────────────────────────┘
             │
        ┌────┴────┐
        │          │
        ▼          ▼
   ┌────────┐  ┌──────────┐
   │ VISTA  │  │FORMULARIO│
   │Read-Only Read-Only + Metadatos Editables
   └────────┘  └──────────┘
```

---

## 📌 Reglas Clave

| Aspecto | Regla |
|---------|-------|
| **Datos en Backend** | Propiedades de agregación: `hombres`, `mujeres`, `total` |
| **Transformación** | Crear array con formato {campo, casos, porcentaje} |
| **Almacenamiento** | Guardar CON prefijo: `poblacionSexoAISD${prefijo}` |
| **Formulario** | Read-only tabla + editable metadatos (título, fuente) |
| **Vista** | Solo lectura, sin interacción |
| **Botones CRUD** | ❌ NO hay (los datos vienen del backend) |
| **Total Manual** | ❌ NO agregar manualmente (está en transformación) |

---

## 💾 Archivos Clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `backend-lbs/src/modules/demograficos/demograficos.service.ts` | Backend que devuelve datos poblacionales |
| `src/app/core/config/table-transforms.ts` | Transformación de datos (2 funciones) |
| `src/app/shared/components/seccion6/seccion6-form.component.ts` | Formulario - carga y almacenamiento |
| `src/app/shared/components/seccion6/seccion6-form.component.html` | Formulario - presentación (debe ser read-only) |
| `src/app/shared/components/seccion6/seccion6-view.component.html` | Vista - presentación (read-only) |

---

## ✅ Checklist de Implementación

- [x] Backend devuelve datos demográficos agregados
- [x] Funciones de transformación convierten a formato estándar
- [x] Datos se guardan CON prefijo en state
- [x] Vista es read-only
- [ ] Formulario es read-only (PENDIENTE)
- [ ] Metadatos (título, fuente) son editables
- [ ] NO hay botones CRUD en tabla
- [ ] NO hay Total manual en formulario

---

## 🚀 Próximos Pasos

1. Remover `app-dynamic-table` del formulario
2. Usar tabla simple read-only como en la vista
3. Mantener edición de metadatos (título, fuente, párrafos)
4. Eliminar funciones Helper que calculaban totales manuales
