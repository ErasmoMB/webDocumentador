# Arquitectura del Sistema

## Visión General

webDocumentador utiliza una arquitectura de **estado centralizado inmutable** con separación estricta entre lectura y escritura. El sistema está diseñado para ser predecible, testeable y mantenible.

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
