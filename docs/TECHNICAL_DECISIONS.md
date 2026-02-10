# Decisiones Técnicas

Este documento explica las decisiones arquitectónicas clave del proyecto y su justificación.

## 1. ¿Por qué Commands?

### Problema que resolvemos

Sin Commands, los componentes modifican el estado de formas impredecibles:

```typescript
// ❌ Sin Commands - Caótico
component1.service.updateName('test');
component2.directState.name = 'otro';
component3.http.post('/save', data).subscribe(r => state.name = r.name);
```

### Solución

Commands son objetos inmutables que **describen intenciones**, no ejecutan acciones:

```typescript
// ✅ Con Commands - Predecible
{ type: 'metadata/setProjectName', payload: { projectName: 'test' } }
```

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Serializable** | Puede guardarse, enviarse, reproducirse |
| **Trazable** | Cada cambio tiene un tipo identificable |
| **Testeable** | Input/output puro, sin mocks |
| **Time-travel** | Posibilidad de undo/redo |
| **Debugging** | Log de todos los cambios |

### Ejemplo de debugging

```typescript
// Interceptor de commands para debugging
dispatch(command: ProjectStateCommand): void {
  console.log('[COMMAND]', command.type, command.payload);
  // ... procesar
}

// Output:
// [COMMAND] metadata/setProjectName { projectName: 'Proyecto A' }
// [COMMAND] field/update { sectionId: '1.1', fieldName: 'nombre', value: 'Juan' }
// [COMMAND] batch { commands: [...] }
```

---

## 2. ¿Por qué Reducers?

### Problema que resolvemos

Lógica de actualización dispersa y difícil de testear:

```typescript
// ❌ Sin Reducers - Disperso
class Service1 {
  updateField(id, value) {
    const field = this.findField(id);
    field.value = value;
    field.lastModified = Date.now();
    field.dirty = true;
    this.notifyChanges();
    this.validateField(field);
    // ... más lógica mezclada
  }
}
```

### Solución

Reducers son **funciones puras** que calculan el nuevo estado:

```typescript
// ✅ Con Reducers - Función pura
function fieldReducer(state: FieldsState, cmd: FieldCommand): FieldsState {
  switch (cmd.type) {
    case 'field/update':
      return updateField(state, cmd.payload);
    // ...
  }
}

// Función auxiliar pura
function updateField(state: FieldsState, payload: UpdateFieldPayload): FieldsState {
  const key = generateKey(payload);
  return {
    ...state,
    byKey: {
      ...state.byKey,
      [key]: {
        ...state.byKey[key],
        state: {
          ...state.byKey[key].state,
          value: payload.value,
          lastModified: Date.now(),
          dirty: true
        }
      }
    }
  };
}
```

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Predecible** | Mismo input → mismo output |
| **Testeable** | Sin mocks, sin setup complejo |
| **Composable** | Reducers pequeños combinados |
| **Sin efectos** | No hay llamadas HTTP, localStorage, etc. |

### Ejemplo de test

```typescript
describe('fieldReducer', () => {
  it('should update field value', () => {
    const state = createInitialState();
    const command = { 
      type: 'field/update', 
      payload: { sectionId: '1', fieldName: 'nombre', value: 'Test' }
    };
    
    const result = fieldReducer(state, command);
    
    expect(result.byKey['1::null::nombre'].state.value).toBe('Test');
    expect(result.byKey['1::null::nombre'].state.dirty).toBe(true);
  });
});
```

---

## 3. ¿Por qué Selectors?

### Problema que resolvemos

Componentes accediendo y transformando datos de forma inconsistente:

```typescript
// ❌ Sin Selectors - Inconsistente
// Componente A
const groups = this.state.groupConfig.aisd.filter(g => g.parentId === null);

// Componente B
const groups = this.state.groupConfig.aisd
  .filter(g => !g.parentId)
  .map(g => ({ ...g, level: 0 }));

// Componente C calcula diferente...
```

### Solución

Selectors son **funciones puras** que son la ÚNICA forma de leer el estado:

```typescript
// ✅ Con Selectors - Único punto de verdad
export const Selectors = {
  getRootAISDGroups: (state: ProjectState): GroupOption[] =>
    state.groupConfig.aisd
      .filter(g => g.parentId === null)
      .map(g => ({
        id: g.id,
        nombre: g.nombre,
        level: 0,
        hasChildren: state.groupConfig.aisd.some(c => c.parentId === g.id)
      }))
};

// Todos los componentes usan el mismo selector
const groups = this.facade.select(Selectors.getRootAISDGroups);
```

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Consistencia** | Misma lógica de transformación en toda la app |
| **Encapsulación** | UI no conoce estructura interna del state |
| **Memoización** | Posibilidad de cachear resultados |
| **Refactoring** | Cambiar estructura interna sin afectar UI |
| **Testeable** | Funciones puras fáciles de testear |

### Patrón de uso en componentes

```typescript
@Component({...})
export class MiComponente {
  // Selector simple
  readonly projectName = this.facade.select(Selectors.getProjectName);
  
  // Selector con parámetro
  readonly sectionFields = computed(() => 
    Selectors.getFieldsForSection(this.facade.state(), this.sectionId())
  );
  
  // Selector compuesto
  readonly progress = computed(() => {
    const fields = Selectors.getFieldsForSection(this.facade.state(), this.sectionId());
    return Selectors.calculateProgress(fields);
  });
}
```

---

## 4. ¿Por qué Estado Inmutable?

### Problema que resolvemos

Mutaciones accidentales que causan bugs difíciles de rastrear:

```typescript
// ❌ Estado mutable - Bugs sutiles
const state = { items: [1, 2, 3] };
const copy = state;
copy.items.push(4);
// ¡state.items también tiene 4!
```

### Solución

Todo el estado es `readonly` y se reemplaza, nunca se muta:

```typescript
// ✅ Estado inmutable
interface ProjectState {
  readonly metadata: ProjectMetadata;
  readonly groupConfig: GroupConfigState;
  // ...
}

// Actualización crea nuevo objeto
const newState = {
  ...oldState,
  metadata: {
    ...oldState.metadata,
    projectName: 'nuevo'
  }
};
```

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Detección de cambios** | Angular detecta cambios por referencia (===) |
| **Sin efectos colaterales** | Imposible mutar accidentalmente |
| **Time-travel** | Guardar estados anteriores para undo |
| **Debugging** | Comparar estados fácilmente |

---

## 5. ¿Por qué Signals en lugar de RxJS?

### Contexto

Angular 17+ introduce Signals como alternativa a RxJS para estado reactivo.

### Razones de elección

| Aspecto | RxJS | Signals |
|---------|------|---------|
| Curva de aprendizaje | Alta | Baja |
| Boilerplate | Mucho | Poco |
| Memory leaks | Posibles (subscriptions) | Imposibles |
| Performance | Buena | Mejor (fine-grained) |
| Template binding | Necesita `async` pipe | Directo |

### Ejemplo comparativo

```typescript
// RxJS
readonly projectName$ = this.store.select(state => state.metadata.projectName);

// Template: {{ projectName$ | async }}
// Requiere: unsubscribe en ngOnDestroy

// Signals
readonly projectName = this.facade.select(Selectors.getProjectName);

// Template: {{ projectName() }}
// No requiere cleanup
```

---

## 6. ¿Por qué UIStoreContract?

### Problema que resolvemos

Sin contrato, cualquier parte de la app puede acceder al estado de cualquier forma:

```typescript
// ❌ Sin contrato - Acoplamiento
class Component1 {
  // Accede directo
  this.store.state.metadata.projectName = 'nuevo';
}

class Component2 {
  // Usa servicio diferente
  this.otherService.getName();
}
```

### Solución

`UIStoreContract` define la ÚNICA interfaz entre UI y Store:

```typescript
// ✅ Con contrato - Desacoplado
export const UIStoreContract = {
  // LECTURA: Solo a través de Selectors
  select<T>(selector: (state: ProjectState) => T): Signal<T>;
  
  // ESCRITURA: Solo a través de Commands
  dispatch(command: ProjectStateCommand): void;
}
```

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **API clara** | Dos métodos: `select()` y `dispatch()` |
| **Testeable** | Mock fácil del contrato |
| **Evolucionable** | Cambiar implementación sin afectar UI |
| **Documentado** | Contrato es la documentación |

---

## 7. ¿Por qué separar Persistence y Export?

### Principio de Responsabilidad Única

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   Persistence                          Export                               │
│   ────────────                         ──────                               │
│   - Guarda/carga estado                - Genera documentos                  │
│   - localStorage                       - PDF/JSON para usuario              │
│   - Auto-save                          - Formato legible                    │
│   - Versionado interno                 - Metadata de exportación            │
│   - Migración de esquemas              - No requiere reimportar             │
│                                                                              │
│   Usa:                                 Usa:                                 │
│   - State directo                      - SOLO Selectors                     │
│   - StorageAdapter                     - DocumentBuilder                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Por qué Export usa SOLO Selectors

1. **Consistencia**: Misma vista de datos que ve el usuario
2. **Encapsulación**: No conoce estructura interna
3. **Mantenibilidad**: Cambios en state no afectan export
4. **Testeable**: Mock de selectores es simple

---

## 8. Decisiones de Naming

### Commands: `domain/action`

```typescript
'metadata/setProjectName'     // ✅ Claro
'groupConfig/addGroup'        // ✅ Claro
'SET_PROJECT_NAME'            // ❌ Estilo Redux antiguo
'updateName'                  // ❌ Ambiguo
```

### Selectors: `get*`, `is*`, `has*`, `count*`

```typescript
getProjectName()              // ✅ Obtener valor
isProjectDirty()              // ✅ Boolean
hasUnsavedChanges()           // ✅ Boolean de existencia
countTotalFields()            // ✅ Número
projectName()                 // ❌ Ambiguo (¿getter o setter?)
```

### Files: `*.contract.ts`, `*.model.ts`, `*.service.ts`

```typescript
persistence.contract.ts       // ✅ Define tipos y validación
project-state.model.ts        // ✅ Define interfaces
export.service.ts             // ✅ Lógica de negocio
```

---

## 9. Resumen de Decisiones

| Decisión | Justificación |
|----------|---------------|
| Commands | Intenciones serializables, traceables, testeables |
| Reducers | Lógica pura, predecible, sin efectos |
| Selectors | Única fuente de lectura, encapsulación |
| Inmutabilidad | Detección de cambios, debugging, time-travel |
| Signals | Simple, performante, sin memory leaks |
| UIStoreContract | API clara, desacoplamiento, testeable |
| Separation Persistence/Export | SRP, diferentes responsabilidades |
| Sistema de Prefijos | Aislamiento de datos entre grupos AISD/AISI |
| Numeración Global | Imágenes y tablas consecutivas en todo el documento |

---

## 10. Sistema de Prefijos para Aislamiento de Datos

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

## 11. Sistema de Numeración Global

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

## 10. Lecciones Aprendidas

1. **Empezar con tipos estrictos**: `readonly` en todas las interfaces desde el inicio
2. **Tests primero**: Escribir tests de reducers antes de implementar
3. **Selectores pequeños**: Componer selectores complejos de simples
4. **Commands atómicos**: Un command = una intención clara
5. **Batch para operaciones relacionadas**: Evita estados inconsistentes intermedios
