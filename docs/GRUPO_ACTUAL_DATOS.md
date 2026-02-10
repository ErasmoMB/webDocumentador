# Datos del Grupo Actual

## Descripción General

Este documento describe cómo el sistema gestiona y accede a los datos del grupo actual (AISD y AISI) en cada sección del documento.

---

## Estructura de Grupos

### Grupos AISD (Comunidades Campesinas)

| Atributo | Valor |
|----------|-------|
| **Identificador** | A.1, A.2, A.3... |
| **Origen** | Keys del JSON cargado en Sección 1 |
| **Subsecciones** | A.X.1 hasta A.X.20 |
| **Rango de secciones** | 4 - 20 |

### Grupos AISI (Distritos)

| Atributo | Valor |
|----------|-------|
| **Identificador** | B.1, B.2, B.3... |
| **Origen** | Valores únicos de `DIST` en el JSON |
| **Subsecciones** | B.X.1 hasta B.X.9 |
| **Rango de secciones** | 21 - 30+ |

---

## Métodos Disponibles

### En `BaseSectionComponent`

#### `obtenerPrefijoGrupo(): string`

Obtiene el prefijo del grupo actual según el `seccionId`.

```typescript
/**
 * @returns Prefijo del grupo (ej: '_A1', '_B2', '_C3')
 */
obtenerPrefijoGrupo(): string
```

**Ejemplos:**
- `3.1.4.A.1` → `"_A1"`
- `3.1.4.B.2` → `"_B2"`
- `3.1.4.C.3` → `"_C3"`

**Nota:** Este prefijo se usa para aislar los datos entre grupos. Ver [`AISI_GROUPS_ISOLATION.md`](./AISI_GROUPS_ISOLATION.md) para más detalles.

---

#### `obtenerIndiceGrupo(): number`

Obtiene el índice numérico del grupo actual.

```typescript
/**
 * @returns Índice del grupo (ej: 1, 2, 3)
 */
obtenerIndiceGrupo(): number
```

**Ejemplos:**
- `3.1.4.A.1` → `1`
- `3.1.4.B.2` → `2`

---

#### `obtenerPrefijoSeccionActual(): string`

Obtiene el prefijo de la sección actual (sin el subíndice).

```typescript
/**
 * @returns Prefijo de sección (ej: 'A.1', 'B.2')
 */
obtenerPrefijoSeccionActual(): string
```

---

#### `obtenerNumeroSeccion(): string`

Extrae el número de sección del `seccionId`.

```typescript
/**
 * @returns Número de sección (ej: '4', '21')
 */
obtenerNumeroSeccion(): string
```

---

#### `esGrupoAISI(seccionId?: string): boolean`

Determina si la sección actual corresponde a un grupo AISI.

```typescript
/**
 * @param seccionId - ID de sección opcional (usa seccionId actual si no se proporciona)
 * @returns true si es grupo AISI (B.X), false si es AISD (A.X)
 */
esGrupoAISI(seccionId?: string): boolean
```

---

#### `obtenerNombreGrupoActual(): string`

Obtiene el nombre del grupo actual (AISD o AISI).

```typescript
/**
 * @returns Nombre del grupo (ej: 'CAHUACHO', 'DISTRITO1')
 */
obtenerNombreGrupoActual(): string
```

---

#### `obtenerCentroPobladoAISI(): string`

Obtiene el nombre del centro poblado AISI actual.

```typescript
/**
 * @returns Nombre del centro poblado AISI (ej: 'D1', 'D2')
 */
obtenerCentroPobladoAISI(): string
```

---

#### `obtenerCentrosPobladosDeGrupoAISI(): any[]`

Obtiene el array de centros poblados del grupo AISI actual.

```typescript
/**
 * @returns Array de centros poblados del grupo AISI actual
 */
obtenerCentrosPobladosDeGrupoAISI(): any[]
```

---

#### `obtenerCentrosPobladosDeGrupoAISD(): any[]`

Obtiene el array de centros poblados del grupo AISD actual.

```typescript
/**
 * @returns Array de centros poblados del grupo AISD actual
 */
obtenerCentrosPobladosDeGrupoAISD(): any[]
```

---

#### `obtenerNombreDistritoActual(): string`

Obtiene el nombre del distrito (grupo AISI) actual.

```typescript
/**
 * @returns Nombre del distrito (ej: 'D1', 'D2')
 */
obtenerNombreDistritoActual(): string
```

---

#### `obtenerInformacionReferencialAISI(): any`

Obtiene la información referencial AISI del grupo actual.

```typescript
/**
 * @returns Objeto con información referencial AISI
 */
obtenerInformacionReferencialAISI(): any
```

---

## Ejemplo de Uso en Componente

```typescript
export class Seccion21FormComponent extends BaseSectionComponent {

  protected override onInitCustom(): void {
    // Obtener nombre del grupo AISI actual
    const nombreGrupo = this.obtenerNombreDistritoActual();
    console.log(`Grupo AISI actual: ${nombreGrupo}`);

    // Obtener centros poblados del grupo
    const cpList = this.obtenerCentrosPobladosDeGrupoAISI();
    console.log(`Centros poblados: ${cpList.length}`);

    // Obtener centro poblado AISI (primero o seleccionado)
    const cpAISI = this.obtenerCentroPobladoAISI();
    console.log(`Centro poblado: ${cpAISI}`);
  }
}
```

---

## Flujo de Datos

### Carga de JSON (Sección 1)

```
JSON → Se guarda en estado global (localStorage)
      ↓
      ├─→ Keys del JSON → Grupos AISD (A.1, A.2, ...)
      └─→ Valores DIST → Grupos AISI (B.1, B.2, ...)
```

### Navegación entre Secciones

```
Usuario navega a: /seccion/3.1.4.B.1
                  ↓
           BaseSectionComponent.detectChanges()
                  ↓
           identifica grupo: B.1 (AISI)
                  ↓
           carga datos del grupo B.1
                  ↓
           componentes muestran datos del grupo
```

### Persistencia de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADO GLOBAL                            │
│  ┌─────────────────────────────────────────────────┐       │
│  │ aisdGroups: [                                   │       │
│  │   { id: 'A.1', nombre: 'CAHUACHO', ... },      │       │
│  │   { id: 'A.2', nombre: 'SAN PEDRO', ... }      │       │
│  │ ]                                               │       │
│  │                                                  │       │
│  │ aisiGroups: [                                   │       │
│  │   { id: 'B.1', nombre: 'D1', ... },            │       │
│  │   { id: 'B.2', nombre: 'D2', ... }             │       │
│  │ ]                                               │       │
│  │                                                  │       │
│  │ seccion3_1_4_B_1: { ... }  // Datos específicos │
│  │ seccion3_1_4_B_2: { ... }  // del grupo         │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Archivos Clave

| Archivo | Responsabilidad |
|---------|-----------------|
| [`base-section.component.ts`](../src/app/shared/components/base-section.component.ts) | Clase base con métodos de grupo |
| [`seccion2.component.ts`](../src/app/shared/components/seccion2/seccion2.component.ts) | Gestión de grupos AISD/AISI |
| [`project-state.facade.ts`](../src/app/core/state/project-state.facade.ts) | Facade del estado global |
| [`formulario-store.service.ts`](../src/app/core/services/formulario-store.service.ts) | Servicio de almacenamiento |

---

## Mejores Prácticas

### ✅ Hacer

```typescript
// Usar métodos de BaseSectionComponent
const nombre = this.obtenerNombreGrupoActual();
const cps = this.obtenerCentrosPobladosDeGrupoAISD();
```

### ❌ No Hacer

```typescript
// NO acceder directamente al estado sin usar los métodos
const grupo = this.datos['aisdGroups'][0]; // Evitar

// NO hardcodear nombres de grupos
if (this.seccionId.includes('A.1')) { // Evitar
```

---

## Logs de Depuración

El sistema incluye logs para facilitar la depuración:

```typescript
// En BaseSectionComponent
console.log(`[BaseSection] Grupo actual: ${this.obtenerPrefijoGrupo()}`);
console.log(`[BaseSection] ¿Es AISI? ${this.esGrupoAISI()}`);
console.log(`[BaseSection] Nombre grupo: ${this.obtenerNombreGrupoActual()}`);

// En Seccion21FormComponent
console.log(`[Seccion21] Auto-llenando centroPobladoAISI: "${centroPobladoAISI}"`);
console.log(`[Seccion21] Título actualizado a: "B.1. Centro Poblado ${centroPobladoAISI}"`);
```

---

## 🔐 Sistema de Prefijos para Aislamiento de Datos

### Propósito

El sistema de prefijos asegura que los datos de cada grupo AISI (B.1, B.2, B.3, etc.) y AISD (A.1, A.2, etc.) estén completamente aislados, evitando mezclas de información entre grupos.

### Cómo Funciona

```
ID de sección: 3.1.4.B.1
Prefijo extraído: _B1

Campos con prefijo:
- centroPobladoAISI_B1
- ubicacionCpTabla_B1
- fotografia_B1
- cuadroTituloUbicacionCp_B1
```

### Prefijos por Tipo de Grupo

| Tipo de Grupo | Prefijo | Ejemplo |
|---------------|---------|---------|
| AISD (Comunidades Campesinas) | `_A1`, `_A2`, `_A3` | `3.1.4.A.1` → `_A1` |
| AISI (Distritos) | `_B1`, `_B2`, `_B3` | `3.1.4.B.1` → `_B1` |

### Aislamiento de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│ 🗺️ GRUPO AISI: B.1 - SAN PEDRO                                │
│ 📂 URL: seccion/3.1.4.B.1.*                                   │
│ 📝 Datos guardados con prefijo: _B1                            │
│                                                                 │
│   • tablaPoblacion_B1  → tablaPoblacion_B3 (vacío, separado)   │
│   • parrafos_B1        → parrafos_B3 (vacío, separado)         │
│   • imagenes_B1        → imagenes_B3 (vacío, separado)         │
│   • CP: ['0214090010', '0214090059', ...] (47 CP)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🗺️ GRUPO AISI: B.3 - OTRO DISTRITO                           │
│ 📂 URL: seccion/3.1.4.B.3.*                                   │
│ 📝 Datos guardados con prefijo: _B3                            │
│                                                                 │
│   • tablaPoblacion_B3  → tablaPoblacion_B1 (vacío, separado)   │
│   • parrafos_B3        → parrafos_B1 (vacío, separado)         │
│   • imagenes_B3        → imagenes_B1 (vacío, separado)        │
│   • CP: [códigos diferentes del B.3]                          │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes Clave

- **[`PrefijoHelper`](../src/app/shared/utils/prefijo-helper.ts)**: Extrae el prefijo del `sectionId`
- **[`BaseSectionComponent`](../src/app/shared/components/base-section.component.ts)**: Proporciona métodos para obtener el prefijo
- **[`GlobalNumberingService`](../src/app/core/services/global-numbering.service.ts)**: Calcula numeración global con prefijos

**Documentación detallada:** Ver [`AISI_GROUPS_ISOLATION.md`](./AISI_GROUPS_ISOLATION.md) para más información.

---

## 🔢 Sistema de Numeración Global

### Propósito

El sistema de numeración global asegura que las imágenes y tablas tengan números consecutivos en todo el documento, sin duplicados.

### Imágenes

```
Capítulo 3: Línea Base Social
├── 3.1 - Primera imagen del documento
├── 3.2 - Segunda imagen del documento
├── 3.3 - Tercera imagen del documento
└── 3.N - N-ésima imagen (consecutivo)
```

### Tablas

```
Capítulo 3: Línea Base Social
├── 3.1 - Primera tabla del documento
├── 3.2 - Segunda tabla del documento
├── 3.3 - Tercera tabla del documento
└── 3.N - N-ésima tabla (consecutivo)
```

**Regla:** No puede existir duplicados. Si una sección tiene imagen 3.5, la siguiente sección continúa con 3.6.

**Implementación:** Ver [`GLOBAL_NUMBERING_IMAGES.md`](./GLOBAL_NUMBERING_IMAGES.md) y [`GLOBAL_NUMBERING_TABLES.md`](./GLOBAL_NUMBERING_TABLES.md) para más detalles.

---

*Última actualización: 10 de febrero de 2026*
