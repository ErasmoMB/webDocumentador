# Arquitectura del Sistema

## Visión General

webDocumentador utiliza una arquitectura de **estado centralizado inmutable** con separación estricta entre lectura y escritura. El sistema está diseñado para ser predecible, testeable y mantenible.

### Características Clave

- **Grupos Dinámicos AISD/AISI**: Soporte para múltiples grupos con datos aislados
- **Sistema de Prefijos**: Aislamiento de datos entre grupos usando prefijos (`_A1`, `_B1`, etc.)
- **Numeración Global**: Imágenes y tablas con números consecutivos en todo el documento
- **Signals Reactivos**: Angular Signals para reactividad eficiente
- **Commands/Reducers**: Patrón de diseño para actualizaciones de estado predecibles

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Components │  │   Pages     │  │  Features   │  │   Shared    │        │
│  │  (Display)  │  │  (Routes)   │  │  (Modules)  │  │ (Reusable)  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                   │                                         │
│                     ┌─────────────┴─────────────┐                           │
│                     │    UIStoreContract        │                           │
│                     │  ┌─────────┐ ┌─────────┐  │                           │
│                     │  │Selectors│ │dispatch()│ │                           │
│                     │  │ (read)  │ │(command) │  │                           │
│                     │  └────┬────┘ └────┬────┘  │                           │
│                     └───────┼───────────┼───────┘                           │
└─────────────────────────────┼───────────┼───────────────────────────────────┘
                              │           │
┌─────────────────────────────┼───────────┼───────────────────────────────────┐
│                         STATE LAYER     │                                    │
│                              │           │                                    │
│         ┌────────────────────┘           └────────────────────┐              │
│         ▼                                                     ▼              │
│  ┌──────────────┐                                   ┌──────────────┐         │
│  │   Selectors  │                                   │   Commands   │         │
│  │ (Pure Fns)   │                                   │ (Immutable)  │         │
│  │              │                                   │              │         │
│  │ state → data │                                   │ {type,payload}│        │
│  └──────┬───────┘                                   └──────┬───────┘         │
│         │                                                  │                 │
│         │              ┌──────────────────┐                │                 │
│         └──────────────┤  ProjectState    ├────────────────┘                 │
│                        │ Signal<State>    │                                  │
│                        │                  │                                  │
│                        │ ┌──────────────┐ │                                  │
│                        │ │  metadata    │ │                                  │
│                        │ │  groupConfig │ │                                  │
│                        │ │  sections    │ │                                  │
│                        │ │  fields      │ │                                  │
│                        │ │  tables      │ │                                  │
│                        │ │  images      │ │                                  │
│                        │ │  _internal   │ │                                  │
│                        │ └──────────────┘ │                                  │
│                        └────────┬─────────┘                                  │
│                                 │                                            │
│                        ┌────────▼─────────┐                                  │
│                        │    Reducers      │                                  │
│                        │                  │                                  │
│                        │ (state, cmd)     │                                  │
│                        │     => state     │                                  │
│                        └──────────────────┘                                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼─────────────────────────────────────────────┐
│                         EXTERNAL LAYER                                        │
│                                 │                                             │
│    ┌────────────────────────────┼────────────────────────────┐               │
│    │                            │                            │               │
│    ▼                            ▼                            ▼               │
│ ┌──────────────┐      ┌──────────────┐           ┌──────────────┐           │
│ │ Persistence  │      │    Export    │           │  API/Backend │           │
│ │              │      │              │           │              │           │
│ │ localStorage │      │ JSON / PDF   │           │ HTTP calls   │           │
│ │ autoSave     │      │ download     │           │              │           │
│ └──────────────┘      └──────────────┘           └──────────────┘           │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Capas del Sistema

### 1. Presentation Layer (UI)

**Ubicación:** `src/app/features/`, `src/app/pages/`, `src/app/shared/`

**Responsabilidades:**
- Renderizar datos provenientes de Selectors
- Capturar eventos de usuario
- Despachar Commands al Store
- **NO** calcular datos derivados
- **NO** acceder directamente al estado

**Ejemplo de componente correcto:**
```typescript
@Component({...})
export class MiComponente {
  // ✅ Correcto: usar Selectors
  readonly projectName = this.facade.select(Selectors.getProjectName);
  
  // ✅ Correcto: despachar Commands
  onSave(name: string) {
    this.facade.dispatch({ 
      type: 'metadata/setProjectName', 
      payload: { projectName: name } 
    });
  }
  
  // ❌ Incorrecto: calcular en componente
  // get total() { return this.items.reduce(...) }
}
```

### 2. State Layer (Core)

**Ubicación:** `src/app/core/state/`

#### ProjectState
Estructura inmutable que representa todo el estado de la aplicación:

```typescript
interface ProjectState {
  metadata: ProjectMetadata;      // Nombre, consultora, etc.
  groupConfig: GroupConfigState;  // Grupos AISD/AISI
  ccppRegistry: CCPPRegistry;     // Comunidades campesinas
  sections: SectionsState;        // Estado de secciones
  fields: FieldsState;            // Campos de formulario
  tables: TablesState;            // Tablas de datos
  images: ImagesState;            // Imágenes/fotografías
  globalRegistry: GlobalRegistry; // Datos globales
  _internal: InternalState;       // Estado efímero (NO persistir)
}
```

#### Selectors
Funciones puras que extraen y transforman datos del estado:

```typescript
// Selector simple
getProjectName: (state) => state.metadata.projectName

// Selector con transformación
getAISDGroups: (state) => state.groupConfig.aisd.map(g => ({
  id: g.id,
  nombre: g.nombre,
  level: calculateLevel(g.id)
}))

// Selector compuesto
getSectionProgress: (state, sectionId) => {
  const fields = getFieldsForSection(state, sectionId);
  const filled = fields.filter(f => f.value !== '');
  return { total: fields.length, completed: filled.length };
}
```

#### Commands
Objetos inmutables que describen intenciones de cambio:

```typescript
// Command simple
{ type: 'metadata/setProjectName', payload: { projectName: 'Nuevo' } }

// Command compuesto
{ type: 'field/update', payload: { 
  sectionId: '1.1', 
  groupId: 'A', 
  fieldName: 'nombre', 
  value: 'Juan' 
}}

// Batch command
{ type: 'batch', payload: { 
  commands: [cmd1, cmd2, cmd3] 
}}
```

#### Reducers
Funciones puras que procesan comandos y retornan nuevo estado:

```typescript
function metadataReducer(state: ProjectMetadata, cmd: MetadataCommand): ProjectMetadata {
  switch (cmd.type) {
    case 'metadata/setProjectName':
      return { ...state, projectName: cmd.payload.projectName };
    default:
      return state;
  }
}
```

### 3. External Layer

#### Persistence (`src/app/core/persistence/`)
- **persistence.contract.ts**: Tipos y validación
- **storage.adapter.ts**: Abstracción sobre localStorage
- **persistence.service.ts**: Orquestador de guardado/carga

#### Export (`src/app/core/export/`)
- **export.contract.ts**: Tipos de documento exportado
- **document-builder.service.ts**: Construye documento usando Selectors
- **pdf-renderer.service.ts**: Genera PDF
- **json-exporter.service.ts**: Genera JSON firmado

## Principios de Diseño

### Inmutabilidad
Todo el estado es inmutable. Los reducers **nunca** mutan el estado existente:

```typescript
// ✅ Correcto
return { ...state, name: newName };

// ❌ Incorrecto
state.name = newName;
return state;
```

### Unidireccionalidad
El flujo de datos es siempre en una dirección:

```
UI → Command → Reducer → State → Selector → UI
```

### Separación de Responsabilidades

| Capa | Puede | No Puede |
|------|-------|----------|
| UI | Leer Selectors, Despachar Commands | Acceder estado directamente, Calcular datos |
| Selectors | Leer estado, Transformar datos | Modificar estado, Efectos secundarios |
| Commands | Describir intención | Contener lógica, Ejecutar acciones |
| Reducers | Calcular nuevo estado | Efectos secundarios, Llamadas async |
| Persistence | Leer/escribir storage | Modificar estado en memoria |
| Export | Leer via Selectors | Acceder estado directamente |

## Convenciones de Código

### Nombres de Archivos
- Models: `*.model.ts`
- Services: `*.service.ts`
- Contracts: `*.contract.ts`
- Tests: `*.spec.ts`

### Nombres de Commands
```typescript
'domain/action'  // Ej: 'metadata/setProjectName', 'field/update'
```

### Nombres de Selectors
```typescript
get*     // Obtener dato: getProjectName, getFields
is*      // Boolean: isDirty, isComplete
has*     // Existencia: hasChanges, hasErrors
count*   // Conteo: countFields, countImages
```

## Testing

### Tests de Reducers
```typescript
it('should update project name', () => {
  const state = INITIAL_STATE;
  const cmd = { type: 'metadata/setProjectName', payload: { projectName: 'Test' }};
  const result = metadataReducer(state, cmd);
  expect(result.projectName).toBe('Test');
});
```

### Tests de Selectors
```typescript
it('should calculate progress', () => {
  const state = createTestState();
  const progress = Selectors.getSectionProgress(state, '1.1');
  expect(progress.completed).toBe(5);
  expect(progress.total).toBe(10);
});
```

## Métricas

- **Tests totales**: 598
- **Cobertura**: Ver `coverage/` después de `npm run test:coverage`
- **Build time**: ~5s (producción)

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
