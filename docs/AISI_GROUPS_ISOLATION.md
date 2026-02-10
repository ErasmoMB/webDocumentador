# Aislamiento de Grupos AISI - Documentación Técnica

## Resumen

Este documento describe cómo se implementó el aislamiento de datos entre grupos AISI (B.1, B.2, B.3, etc.) en el sistema Documentador.

---

## Problema Original

Cuando un usuario:
1. Seleccionaba CCPPs en el grupo B.1
2. Navegaba al grupo B.2
3. Los CCPPs de B.1 seguían visibles en B.2

**Causa raíz**: Los CCPPs se sincronizaban de sección 2 a sección 21 mediante dispatch a Redux, pero `GroupConfigService` (que usa localStorage) no recibía la actualización.

---

## Arquitectura de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                        FUENTES DE DATOS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Redux Store (UIStoreService)                                 │
│   ├── districtConfig (datos del proyecto)                      │
│   ├── groupConfig (configuración de grupos)                     │
│   └── sectionData (datos de cada sección)                      │
│                                                                 │
│   GroupConfigService (localStorage)                             │
│   └── Configuración persistente de grupos y CCPPs               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Solución Implementada

### 1. Sincronización Bidireccional

Se agregó un método en [`project-state.facade.ts`](webDocumentador/src/app/core/state/project-state.facade.ts:583) que intercepta los dispatch de Redux y sincroniza hacia `GroupConfigService`:

```typescript
private syncFromReduxToGroupConfig(
  state: ProjectState, 
  groupConfigService: GroupConfigService
): void {
  // Sincronizar AISD
  if (state.groupConfig?.aisd?.length > 0) {
    const aisdActualizados = state.groupConfig.aisd.map((g: any) => ({
      id: g.id,
      nombre: g.nombre,
      ccppActivos: g.ccppIds || []
    }));
    // Actualizar GroupConfigService
    groupConfigService.configSubject.next({
      ...currentConfig,
      aisd: aisdActualizados,
      lastUpdated: Date.now()
    });
  }

  // Sincronizar AISI
  if (state.groupConfig?.aisi?.length > 0) {
    const aisiActualizados = state.groupConfig.aisi.map((g: any, index: number) => ({
      id: g.id || `B.${index + 1}`,
      nombre: g.nombre,
      ccppActivos: g.ccppIds || []
    }));
    // Actualizar GroupConfigService
    groupConfigService.configSubject.next({
      ...currentConfig,
      aisi: aisiActualizados,
      lastUpdated: Date.now()
    });
  }
}
```

### 2. Lectura de Datos con Prefijo

Uso de [`PrefijoHelper.obtenerPrefijoGrupo()`](webDocumentador/src/app/shared/utils/prefijo-helper.ts) para extraer el prefijo del `sectionId`:

```typescript
// sectionId: "3.1.4.B.1.2"
// Resultado: "_B1"

const prefijo = PrefijoHelper.obtenerPrefijoGrupo('3.1.4.B.1.2');
// prefijo = "_B1"
```

### 3. Persistencia de Datos Prefijada

**Lectura** (primero con prefijo, luego sin fallback):
```typescript
const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
const datos = this.projectFacade.obtenerDatos();
const tabla = datos[tablaKey]; // Sin fallback a clave base
```

**Escritura** (clave prefijada + clave base para compatibilidad):
```typescript
const updates: Record<string, any> = {};
if (prefijo) {
  updates[`ubicacionCpTabla${prefijo}`] = tabla;
}
updates['ubicacionCpTabla'] = tabla; // Compatibilidad legacy
this.projectFacade.setFields(sectionId, null, updates);
```

### 4. Aislamiento de Fotos

Las fotos se guardan con prefijo dinámico basado en el grupo:

```typescript
const prefijo = this.obtenerPrefijoGrupo(); // "_B1"
const prefix = prefijo ? `fotografia${prefijo}` : 'fotografia';
// prefix = "fotografia_B1"

// Claves generadas:
// - fotografia_B11Imagen
// - fotografia_B12Imagen
// - fotografia_B13Imagen
```

---

## Verificación de Aislamiento

### Log de Debug (Sección 21)

```javascript
🗺️ GRUPO AISI: B.2 - Distrito 2
Centros Poblados (3): (3) ['403060001', '403060002', '403060003']
```

Este log se implementa en [`seccion21-view.component.ts`](webDocumentador/src/app/shared/components/seccion21/seccion21-view.component.ts:36):

```typescript
effect(() => {
  const grupo = this.obtenerGrupoActualAISI();
  if (grupo) {
    const ccppIds = grupo.ccppIds || [];
    console.log(`🗺️ GRUPO AISI: ${grupo.id} - ${grupo.nombre || 'Sin nombre'}`);
    console.log(`Centros Poblados (${ccppIds.length}):`, ccppIds);
  }
});
```

### Prueba Manual

1. Navegar a sección 3.1.4.B.1
2. Ver log: `🗺️ GRUPO AISI: B.1 - Cahuacho`
3. Navegar a sección 3.1.4.B.2
4. Ver log: `🗺️ GRUPO AISI: B.2 - Distrito 2`
5. Los CCPPs son diferentes entre grupos ✅

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `project-state.facade.ts` | Agregado `syncFromReduxToGroupConfig()` |
| `group-config.service.ts` | Métodos `setAISICCPPActivos()`, `setAISDCCPPActivos()` |
| `seccion21-view.component.ts` | Effect para loguear grupo actual |
| `seccion21-form.component.ts` | Lectura con `PrefijoHelper.obtenerValorConPrefijo()` |
| `base-section.component.ts` | `obtenerGrupoActualAISI()`, `obtenerCCPPIdsDelGrupoAISI()` |

---

## Convenciones de Nombres

### Prefijos de Grupos

- **AISD**: `_A1`, `_A2`, ... (Comunidades Campesinas)
- **AISI**: `_B1`, `_B2`, ... (Distritos)

### Claves de Datos

```
// Sin prefijo (legacy)
ubicacionCpTabla
centroPobladoAISI
fotografia1Imagen

// Con prefijo (aislado)
ubicacionCpTabla_B1
centroPobladoAISI_B1
fotografia1Imagen_B1
```

---

## Troubleshooting

### Los CCPPs no se actualizan al navegar

1. Verificar que `syncFromReduxToGroupConfig()` se ejecuta
2. Verificar que `GroupConfigService.configSubject` tiene los datos correctos
3. Verificar que la sección usa `PrefijoHelper.obtenerPrefijoGrupo()`

### Datos mezclados entre grupos

1. Verificar que no hay fallback a clave base en la lectura
2. Verificar que la escritura usa prefijo correcto
3. Verificar que `sectionId` tiene el formato correcto: `3.1.4.B.{N}.{M}`

---

## Recursos

- [`GRUPOS-DINAMICOS-AISI.md`](GRUPOS-DINAMICOS-AISI.md) - Documentación general
- [`AISI_GROUPS_LOGIC.md`](AISI_GROUPS_LOGIC.md) - Lógica de grupos
- [`IMPLEMENTACION_TABLAS_IMAGENES_PARRAFO.md`](IMPLEMENTACION_TABLAS_IMAGENES_PARRAFO.md) - Implementación de tablas
