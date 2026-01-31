# Flujo de Datos

## Diagrama de Flujo Principal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUJO DE ESCRITURA                                  │
│                                                                              │
│   ┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│   │  USER   │───▶│  Component  │───▶│   Command   │───▶│   Facade    │     │
│   │ Action  │    │   Event     │    │   Object    │    │  dispatch() │     │
│   └─────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘     │
│                                                               │             │
│                                     ┌─────────────────────────┘             │
│                                     ▼                                       │
│                           ┌─────────────────┐                               │
│                           │   rootReducer   │                               │
│                           │                 │                               │
│                           │ Delega a sub-   │                               │
│                           │ reducers según  │                               │
│                           │ command.type    │                               │
│                           └────────┬────────┘                               │
│                                    │                                        │
│        ┌───────────────────────────┼───────────────────────────┐            │
│        ▼                           ▼                           ▼            │
│  ┌───────────┐            ┌───────────────┐           ┌──────────────┐     │
│  │ metadata  │            │ groupConfig   │           │   fields     │     │
│  │ Reducer   │            │   Reducer     │           │   Reducer    │     │
│  └─────┬─────┘            └───────┬───────┘           └──────┬───────┘     │
│        │                          │                          │              │
│        └──────────────────────────┼──────────────────────────┘              │
│                                   ▼                                         │
│                         ┌─────────────────┐                                 │
│                         │  NEW STATE      │                                 │
│                         │  (immutable)    │                                 │
│                         └────────┬────────┘                                 │
│                                  │                                          │
│                                  ▼                                          │
│                         ┌─────────────────┐                                 │
│                         │ Signal.update() │                                 │
│                         │ (notifica UI)   │                                 │
│                         └─────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUJO DE LECTURA                                    │
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────┐     │
│   │ ProjectState│───▶│  Selector   │───▶│  computed() │───▶│   UI    │     │
│   │   Signal    │    │  (pure fn)  │    │   Signal    │    │ binding │     │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Ejemplo Concreto: Actualizar Nombre de Proyecto

### 1. Usuario escribe en input

```typescript
// En el template
<input (input)="onNameChange($event.target.value)" />
```

### 2. Componente despacha Command

```typescript
// En el componente
onNameChange(name: string) {
  this.facade.dispatch({
    type: 'metadata/setProjectName',
    payload: { projectName: name }
  });
}
```

### 3. Facade recibe y procesa

```typescript
// En UIStoreContract
dispatch(command: ProjectStateCommand): void {
  const currentState = this.state();
  const newState = rootReducer(currentState, command);
  this.state.set(newState);
}
```

### 4. Reducer calcula nuevo estado

```typescript
// En metadata.reducer.ts
case 'metadata/setProjectName':
  return {
    ...state,
    projectName: command.payload.projectName,
    updatedAt: Date.now()
  };
```

### 5. UI se actualiza automáticamente

```typescript
// El Signal notifica a todos los computed que dependen de él
readonly projectName = this.facade.select(Selectors.getProjectName);
// ^ Este Signal se actualiza automáticamente
```

## Flujo de Persistencia

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AUTO-SAVE                                       │
│                                                                              │
│   ┌─────────────┐                                                           │
│   │ State Change│                                                           │
│   └──────┬──────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │  debounce   │───▶│  extract    │───▶│  validate   │                    │
│   │  (2000ms)   │    │ persistible │    │   schema    │                    │
│   └─────────────┘    └─────────────┘    └──────┬──────┘                    │
│                                                │                            │
│                              ┌─────────────────┘                            │
│                              ▼                                              │
│                     ┌─────────────────┐                                     │
│                     │  wrap in        │                                     │
│                     │  envelope:      │                                     │
│                     │  - schemaVersion│                                     │
│                     │  - savedAt      │                                     │
│                     │  - checksum     │                                     │
│                     └────────┬────────┘                                     │
│                              │                                              │
│                              ▼                                              │
│                     ┌─────────────────┐                                     │
│                     │  localStorage   │                                     │
│                     │  .setItem()     │                                     │
│                     └─────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOAD/RESTORE                                    │
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │ localStorage│───▶│   parse     │───▶│  validate   │                    │
│   │  .getItem() │    │    JSON     │    │  checksum   │                    │
│   └─────────────┘    └─────────────┘    └──────┬──────┘                    │
│                                                │                            │
│                              ┌─────────────────┤                            │
│                              │                 │                            │
│                              ▼                 ▼                            │
│                     ┌─────────────┐    ┌─────────────┐                     │
│                     │  version    │    │   schema    │                     │
│                     │  check      │    │  validate   │                     │
│                     └──────┬──────┘    └──────┬──────┘                     │
│                            │                  │                             │
│                            ▼                  │                             │
│              ┌─────────────────────┐          │                             │
│              │ needs migration?    │          │                             │
│              └──────────┬──────────┘          │                             │
│                         │                     │                             │
│            ┌────────────┴────────────┐        │                             │
│            │ YES                NO   │        │                             │
│            ▼                     │   │        │                             │
│   ┌─────────────┐                │   │        │                             │
│   │  migrate()  │                │   │        │                             │
│   └──────┬──────┘                │   │        │                             │
│          │                       │   │        │                             │
│          └───────────────────────┴───┘        │                             │
│                         │                     │                             │
│                         ▼                     │                             │
│                ┌─────────────────┐            │                             │
│                │ merge with      │◀───────────┘                             │
│                │ _internal       │                                          │
│                │ defaults        │                                          │
│                └────────┬────────┘                                          │
│                         │                                                   │
│                         ▼                                                   │
│                ┌─────────────────┐                                          │
│                │  LoadProject    │                                          │
│                │    Command      │                                          │
│                └─────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Flujo de Exportación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXPORT FLOW                                     │
│                                                                              │
│   ┌─────────────┐                                                           │
│   │ User clicks │                                                           │
│   │  "Export"   │                                                           │
│   └──────┬──────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │                    ExportService                            │           │
│   │                                                             │           │
│   │  1. Build Document (via DocumentBuilder)                    │           │
│   │     └── Uses ONLY Selectors to read state                   │           │
│   │                                                             │           │
│   │  2. Select Renderer based on format                         │           │
│   │     ├── JSON → JSONExporterService                          │           │
│   │     └── PDF  → PDFRendererService                           │           │
│   │                                                             │           │
│   │  3. Generate output                                         │           │
│   │                                                             │           │
│   │  4. Download file                                           │           │
│   └──────────────────────────────────────┬──────────────────────┘           │
│                                          │                                  │
│                                          ▼                                  │
│                                 ┌─────────────────┐                         │
│                                 │  Browser        │                         │
│                                 │  Download       │                         │
│                                 └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Flujo de Comandos Batch

Para operaciones atómicas que afectan múltiples partes del estado:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BATCH COMMAND                                      │
│                                                                              │
│   ┌───────────────────────────────────────────────────────────┐             │
│   │ { type: 'batch', payload: { commands: [cmd1, cmd2, cmd3] }}│             │
│   └────────────────────────────┬──────────────────────────────┘             │
│                                │                                             │
│                                ▼                                             │
│                      ┌─────────────────┐                                     │
│                      │  batchReducer   │                                     │
│                      └────────┬────────┘                                     │
│                               │                                              │
│          ┌────────────────────┼────────────────────┐                        │
│          ▼                    ▼                    ▼                        │
│   ┌────────────┐       ┌────────────┐       ┌────────────┐                  │
│   │   cmd1     │       │   cmd2     │       │   cmd3     │                  │
│   │  reducer   │       │  reducer   │       │  reducer   │                  │
│   └─────┬──────┘       └─────┬──────┘       └─────┬──────┘                  │
│         │                    │                    │                         │
│         └────────────────────┼────────────────────┘                         │
│                              ▼                                              │
│                    ┌─────────────────┐                                      │
│                    │  Combined State │                                      │
│                    │  (single update)│                                      │
│                    └─────────────────┘                                      │
│                                                                              │
│   ✅ UI recibe UNA sola notificación                                        │
│   ✅ Estado siempre consistente                                             │
│   ✅ Rollback atómico si falla                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Secuencia de Inicialización

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APP BOOTSTRAP                                        │
│                                                                              │
│   1. Angular initializes                                                     │
│      │                                                                       │
│      ▼                                                                       │
│   2. UIStoreContract provider created                                        │
│      │  - Creates Signal with INITIAL_PROJECT_STATE                          │
│      │  - Initializes Selectors                                              │
│      │                                                                       │
│      ▼                                                                       │
│   3. PersistenceService checks localStorage                                  │
│      │  ├── Found valid state → dispatch LoadProjectCommand                  │
│      │  └── Not found → keep INITIAL_PROJECT_STATE                           │
│      │                                                                       │
│      ▼                                                                       │
│   4. Components render                                                       │
│      │  - Bind to Selectors                                                  │
│      │  - Setup event handlers                                               │
│      │                                                                       │
│      ▼                                                                       │
│   5. User interacts                                                          │
│      │  - Commands dispatched                                                │
│      │  - State updates                                                      │
│      │  - Auto-save triggers                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Reglas de Flujo de Datos

### ✅ Permitido

| Origen | Puede acceder a |
|--------|-----------------|
| Component | Selectors (lectura), dispatch() (escritura) |
| Selector | ProjectState (solo lectura) |
| Reducer | Estado actual (lectura), retornar nuevo estado |
| Persistence | localStorage, Selectors |
| Export | Selectors (NUNCA estado directo) |

### ❌ Prohibido

| Origen | NO puede |
|--------|----------|
| Component | Leer state directamente, calcular datos derivados |
| Selector | Mutar estado, efectos secundarios |
| Reducer | Llamadas async, efectos secundarios |
| UI | Guardar copias del state, cachear valores |
