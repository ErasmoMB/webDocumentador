# 📋 FLUJO DEL PROYECTO - Web Documentador

## 🎯 Descripción General

Este documento describe el flujo completo del sistema de documentación de proyectos mineros, incluyendo la gestión dinámica de grupos AISD (Áreas de Influencia Social Directa) y AISI (Áreas de Influencia Social Indirecta).

---

## 📊 Estructura del JSON de Entrada

El sistema soporta JSONs con la siguiente estructura:

### Ejemplo de JSON

```json
{
  "CAHUACHO": [
    {
      "ITEM": 1,
      "UBIGEO": 40306,
      "CODIGO": 403060001,
      "CCPP": "Cahuacho",
      "CATEGORIA": "Capital distrital",
      "POBLACION": 160,
      "DPTO": "Arequipa",
      "PROV": "Caraveli",
      "DIST": "Cahuacho",
      "ESTE": 663078,
      "NORTE": 8285498,
      "ALTITUD": 3423
    },
    {
      "ITEM": 2,
      "CCPP": "Sondor",
      "DIST": "Cahuacho",
      ...
    }
  ],
  "CCPP SAN PEDRO": [
    {
      "ITEM": 1,
      "CCPP": "ACUSHA",
      "DIST": "SAN PEDRO",
      ...
    }
  ],
  "CCPP LIMA": [
    {
      "ITEM": 1,
      "CCPP": "CHURLIN ALTO",
      "DIST": "PATIVILCA",
      ...
    }
  ]
}
```

### Interpretación del JSON

| Elemento | Significado | Ejemplo |
|----------|-------------|---------|
| **KEY del JSON** | Nombre del Grupo AISD (Comunidad Campesina) | `"CAHUACHO"`, `"CCPP SAN PEDRO"` |
| **Items dentro de KEY** | Centros Poblados de esa Comunidad Campesina | Cahuacho, Sondor, Paucaray... |
| **Campo DIST** | Identificador del Grupo AISI (Distrito) | `"Cahuacho"`, `"SAN PEDRO"` |
| **Items con mismo DIST** | Centros Poblados relacionados a ese Distrito | Todos los items donde DIST="Cahuacho" |

---

## 🔄 Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECCIÓN 1                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  1. Ingresar Nombre del Proyecto                        │    │
│  │  2. Cargar archivo JSON                                 │    │
│  │  3. JSON se guarda en Estado Global (localStorage)      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SECCIÓN 2                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  PARSEO AUTOMÁTICO DEL JSON:                            │    │
│  │                                                          │    │
│  │  ┌──────────────────┐    ┌──────────────────┐           │    │
│  │  │   GRUPOS AISD    │    │   GRUPOS AISI    │           │    │
│  │  │  (Com. Campesinas)│    │   (Distritos)    │           │    │
│  │  ├──────────────────┤    ├──────────────────┤           │    │
│  │  │ A.1 = KEY[0]     │    │ B.1 = DIST único │           │    │
│  │  │ A.2 = KEY[1]     │    │ B.2 = DIST único │           │    │
│  │  │ A.3 = KEY[2]     │    │ B.3 = DIST único │           │    │
│  │  │ ...              │    │ ...              │           │    │
│  │  └──────────────────┘    └──────────────────┘           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  VISUALIZACIÓN:                                          │    │
│  │  • Mostrar grupos AISD identificados con sus CP          │    │
│  │  • Mostrar grupos AISI identificados con sus CP          │    │
│  │  • Permitir seleccionar/deseleccionar CP por grupo       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  CREAR NUEVOS GRUPOS:                                    │    │
│  │  • Botón "Agregar Otra Comunidad Campesina" (AISD)       │    │
│  │  • Botón "Agregar Otro Distrito" (AISI)                  │    │
│  │  • Seleccionar CP disponibles del JSON                   │    │
│  │  • Asignar nombre al nuevo grupo                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ÍNDICE DINÁMICO                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  AISD (Comunidades Campesinas):                         │    │
│  │  ├── A.1 (CAHUACHO)                                     │    │
│  │  │   ├── A.1.1 Descripción                              │    │
│  │  │   ├── A.1.2 Datos demográficos                       │    │
│  │  │   ├── ...                                            │    │
│  │  │   └── A.1.20 (última subsección)                     │    │
│  │  ├── A.2 (CCPP SAN PEDRO)                               │    │
│  │  │   ├── A.2.1 Descripción                              │    │
│  │  │   ├── ...                                            │    │
│  │  │   └── A.2.20                                         │    │
│  │  └── A.N... (grupos adicionales creados)                │    │
│  │                                                          │    │
│  │  AISI (Distritos):                                       │    │
│  │  ├── B.1 (Distrito Cahuacho)                            │    │
│  │  │   ├── B.1.1 Descripción                              │    │
│  │  │   ├── B.1.2 Características                          │    │
│  │  │   ├── ...                                            │    │
│  │  │   └── B.1.9 (última subsección)                      │    │
│  │  ├── B.2 (Distrito San Pedro)                           │    │
│  │  │   └── ...                                            │    │
│  │  └── B.N... (grupos adicionales creados)                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                NUMERACIÓN GLOBAL                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  IMÁGENES: Consecutivas en todo el documento            │    │
│  │  ├── Imagen 3.1 (Sección 1)                             │    │
│  │  ├── Imagen 3.2 (Sección 1)                             │    │
│  │  ├── Imagen 3.3 (Sección 2)                             │    │
│  │  ├── Imagen 3.4 (Sección A.1.1)                         │    │
│  │  ├── Imagen 3.5 (Sección A.1.2)                         │    │
│  │  └── ... (sin duplicados)                               │    │
│  │                                                          │    │
│  │  TABLAS: Consecutivas en todo el documento              │    │
│  │  ├── Tabla 3.1 (Sección 1)                              │    │
│  │  ├── Tabla 3.2 (Sección A.1.1)                          │    │
│  │  └── ... (sin duplicados)                               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitectura de Grupos

### Grupos AISD (Comunidades Campesinas)

| Identificador | Origen | Contenido |
|---------------|--------|-----------|
| A.1 | Primera KEY del JSON | CP dentro de esa KEY |
| A.2 | Segunda KEY del JSON | CP dentro de esa KEY |
| A.N | KEY N o grupo creado manualmente | CP seleccionados |

**Subsecciones por grupo AISD:** A.X.1 hasta A.X.20 (20 subsecciones)

### Grupos AISI (Distritos)

| Identificador | Origen | Contenido |
|---------------|--------|-----------|
| B.1 | Primer valor único de DIST | CP con ese DIST |
| B.2 | Segundo valor único de DIST | CP con ese DIST |
| B.N | DIST N o grupo creado manualmente | CP seleccionados |

**Subsecciones por grupo AISI:** B.X.1 hasta B.X.9 (9 subsecciones)

---

## 📝 Funcionalidades por Sección

### Sección 1 - Carga de Datos
- ✅ Ingresar nombre del proyecto
- ✅ Cargar archivo JSON
- ✅ Visualizar datos del JSON
- ✅ Editar párrafos
- ✅ Agregar imágenes
- ✅ Objetivos dinámicos (agregar/eliminar)

### Sección 2 - Gestión de Grupos
- ✅ Parseo automático del JSON
- ✅ Identificación de grupos AISD (KEYs)
- ✅ Identificación de grupos AISI (DIST únicos)
- ✅ Visualización de centros poblados por grupo
- ✅ Selección/deselección de centros poblados
- ✅ Crear nuevos grupos AISD
- ✅ Crear nuevos grupos AISI
- ✅ Editar nombre de grupos
- ✅ Persistencia en estado global

### Todas las Secciones
- ✅ Modo Vista (visualización formateada)
- ✅ Modo Formulario (edición)
- ✅ Edición de párrafos
- ✅ Edición de tablas
- ✅ Gestión de imágenes
- ✅ Numeración global automática

---

## 🔢 Sistema de Numeración Global

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

## 💾 Persistencia de Datos

### Estado Global (ProjectStateFacade)
```typescript
{
  // Datos del proyecto
  projectName: string,
  
  // JSON cargado
  centrosPobladosJSON: any[],
  jsonFileName: string,
  
  // Grupos AISD
  aisdGroups: [
    {
      id: string,
      nombre: string,
      centrosPobladosSeleccionados: string[]
    }
  ],
  
  // Grupos AISI
  aisiGroups: [
    {
      id: string,
      nombre: string,
      centrosPobladosSeleccionados: string[]
    }
  ],
  
  // Contadores globales
  imageCounter: number,
  tableCounter: number,
  
  // Datos de secciones
  seccion1: { ... },
  seccion2: { ... },
  ...
}
```

### localStorage
Todos los datos se persisten automáticamente en localStorage para recuperación entre sesiones.

---

## 🎨 Componentes Clave

| Componente | Responsabilidad |
|------------|-----------------|
| `BaseSectionComponent` | Clase base con funcionalidad común |
| `Seccion1Component` | Carga de JSON y datos del proyecto |
| `Seccion2Component` | Gestión de grupos AISD/AISI |
| `ProjectStateFacade` | Gestión centralizada del estado |
| `ReactiveStateAdapter` | Sincronización reactiva |
| `PhotoNumberingService` | Numeración global de imágenes |
| `TableNumberingService` | Numeración global de tablas |

---

## 🚀 Guía de Implementación

### Para agregar una nueva sección:

```typescript
export class NuevaSeccionComponent extends BaseSectionComponent {
  @Input() override seccionId: string = 'X.Y.Z';
  override useReactiveSync: boolean = true;
  
  override watchedFields: string[] = [
    'campoEspecifico1',
    'campoEspecifico2'
  ];
  
  // Heredas automáticamente:
  // - Gestión de estado reactiva
  // - Persistencia automática
  // - Gestión de fotos
  // - Numeración global
}
```

### Para crear un nuevo grupo AISD:

1. Usuario hace clic en "Agregar Otra Comunidad Campesina"
2. Se muestra lista de todos los CP disponibles del JSON
3. Usuario selecciona los CP que desea incluir
4. Usuario asigna un nombre al grupo
5. Se crea grupo A.N automáticamente
6. Se generan subsecciones A.N.1 hasta A.N.20

### Para crear un nuevo grupo AISI:

1. Usuario hace clic en "Agregar Otro Distrito"
2. Se muestra lista de todos los CP disponibles del JSON
3. Usuario selecciona los CP que desea incluir
4. Usuario asigna un nombre al grupo
5. Se crea grupo B.N automáticamente
6. Se generan subsecciones B.N.1 hasta B.N.9

---

## 📋 Checklist de Funcionalidades

### Sección 1
- [x] Nombre del proyecto
- [x] Carga de JSON
- [x] Objetivos dinámicos
- [x] Edición de párrafos
- [x] Gestión de imágenes
- [x] Persistencia automática
- [x] Llenar datos de prueba

### Sección 2
- [x] Herencia BaseSectionComponent
- [x] Sincronización reactiva
- [x] Persistencia unificada
- [ ] Parseo automático AISD (KEYs del JSON)
- [ ] Parseo automático AISI (DIST únicos)
- [ ] Visualización de CP por grupo
- [ ] Crear nuevos grupos AISD
- [ ] Crear nuevos grupos AISI
- [ ] Edición de grupos existentes
- [x] Llenar datos de prueba

### Sistema Global
- [ ] Numeración global de imágenes
- [ ] Numeración global de tablas
- [ ] Índice dinámico según grupos
- [x] Persistencia en localStorage
- [x] Arquitectura mantenible

---

## 📚 Referencias

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del proyecto
- [DATA_FLOW.md](./DATA_FLOW.md) - Flujo de datos
- [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md) - Decisiones técnicas

---

*Última actualización: 30 de enero de 2026*
