# Numeración Global de Tablas - Documentación Técnica

## Resumen

Este documento describe la implementación de la numeración global de tablas (cuadros) para grupos AISI y AISD dinámicos en el sistema Documentador.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE NUMERACIÓN DE TABLAS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Usuario navega a sección 3.1.4.B.1                         │
│      ↓                                                          │
│   2. Seccion21ViewComponent inicializa globalTableNumberSignal  │
│      ↓                                                          │
│   3. GlobalNumberingService.getGlobalTableNumber()             │
│      ↓                                                          │
│   4. Cálculo del offset global:                                 │
│      - Grupos AISD anteriores (36 tablas cada uno)              │
│      - Grupos AISI anteriores (22 tablas cada uno)              │
│      ↓                                                          │
│   5. Resultado: Cuadro N° 3.X                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Componentes Principales

### 1. GlobalNumberingService

**Archivo**: [`src/app/core/services/global-numbering.service.ts`](src/app/core/services/global-numbering.service.ts)

**Responsabilidades**:
- Calcular el offset global de tablas
- Generar números de tabla globales
- Definir la cantidad de tablas por tipo de sección

**Métodos clave**:

#### `TABLAS_POR_SECCION`

Define la cantidad de tablas por tipo de sección:

```typescript
private readonly TABLAS_POR_SECCION: Record<string, number> = {
  // AISD (36 tablas por grupo)
  '3.1.4.A': 1,
  '3.1.4.A.1': 1,
  '3.1.4.A.1.1': 1,
  '3.1.4.A.1.2': 2,
  '3.1.4.A.1.3': 3,
  // ... (total: 36 tablas)
  
  // AISI B.1 (22 tablas por grupo)
  '3.1.4.B.1': 1,
  '3.1.4.B.1.1': 2,
  '3.1.4.B.1.2': 3,
  '3.1.4.B.1.3': 1,
  // ... (total: 22 tablas)
  
  // AISI B.2 (22 tablas por grupo)
  '3.1.4.B.2': 1,
  '3.1.4.B.2.1': 2,
  '3.1.4.B.2.2': 3,
  // ... (total: 22 tablas)
};
```

**Totales**:
- **AISD**: 36 tablas por grupo
- **AISI**: 22 tablas por grupo

#### `calculateTableOffset(groupType: string, groupNumber: number): number`

Calcula el offset global de tablas contando:
1. Tablas de grupos AISD anteriores (36 tablas cada uno)
2. Tablas de grupos AISI anteriores (22 tablas cada uno)

```typescript
calculateTableOffset(groupType: string, groupNumber: number): number {
  const TABLAS_POR_GRUPO_AISD = 36;
  const TABLAS_POR_GRUPO_AISI = 22;
  
  if (groupType === 'AISD') {
    let offset = 0;
    const groups = this.getAISDGroups();
    for (let i = 0; i < groups.length; i++) {
      if (i + 1 >= groupNumber) break;
      offset += TABLAS_POR_GRUPO_AISD;
    }
    return offset;
  }
  
  if (groupType === 'AISI') {
    const aisdGroups = this.getAISDGroups();
    const tablasAISD = aisdGroups.length * TABLAS_POR_GRUPO_AISD;
    
    let offset = tablasAISD;
    const groups = this.getAISIGroups();
    for (let i = 0; i < groups.length; i++) {
      if (i + 1 >= groupNumber) break;
      offset += TABLAS_POR_GRUPO_AISI;
    }
    
    return offset;
  }
  
  return 0;
}
```

#### `getGlobalTableNumber(sectionId: string, localTableIndex: number): string`

Calcula el número global de una tabla basándose en:
- `sectionId`: ID de la sección (ej: `3.1.4.B.1`)
- `localTableIndex`: Índice de la tabla dentro de la sección (0-basado)

```typescript
getGlobalTableNumber(sectionId: string, localTableIndex: number): string {
  const groupNumber = this.extractGroupNumber(sectionId);
  const isAISI = this.isAISISection(sectionId);
  const isAISD = this.isAISDSection(sectionId);
  const groupType = isAISI ? 'AISI' : (isAISD ? 'AISD' : null);
  
  const groupOffset = this.calculateTableOffset(groupType || 'AISI', groupNumber);
  const base = 2;
  const globalNumber = base + groupOffset + localTableIndex;
  return `3.${globalNumber}`;
}
```

**Fórmula**:
- **AISD**: `3.(2 + (grupoAISD - 1) * 36 + localTableIndex)`
- **AISI**: `3.(2 + numGruposAISD * 36 + (grupoAISI - 1) * 22 + localTableIndex)`

#### `getAISIGroups(): { id: string; nombre: string }[]`

**IMPORTANTE**: Genera IDs correctos basados en el orden: `B.1`, `B.2`, `B.3`, etc.

```typescript
getAISIGroups(): { id: string; nombre: string }[] {
  const aisiGroups = this.projectFacade.groupsByType('AISI')();
  // Generar IDs correctos basados en el orden: B.1, B.2, B.3, etc.
  return aisiGroups.map((g, index) => ({ 
    id: `B.${index + 1}`, 
    nombre: g.nombre 
  }));
}
```

**Nota**: Este método es crítico porque el sistema de grupos internamente genera IDs como `A`, `B`, `C`, etc., pero para la numeración global necesitamos IDs como `B.1`, `B.2`, `B.3`, etc.

---

### 2. Seccion21ViewComponent

**Archivo**: [`src/app/shared/components/seccion21/seccion21-view.component.ts`](src/app/shared/components/seccion21/seccion21-view.component.ts)

**Responsabilidades**:
- Mantener el signal para el número global de tabla
- Mostrar el número de tabla en la UI

**Signal clave**:

```typescript
// Signal para número global de tabla
readonly globalTableNumberSignal: Signal<string> = computed(() => {
  // La tabla de ubicación es la primera (índice 0)
  const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  console.debug(`[SECCION21-VIEW] globalTableNumberSignal: Cuadro N° ${globalNum}`);
  return globalNum;
});
```

---

### 3. Seccion21FormComponent

**Archivo**: [`src/app/shared/components/seccion21/seccion21-form.component.ts`](src/app/shared/components/seccion21/seccion21-form.component.ts)

**Responsabilidades**:
- Mantener el signal para el número global de tabla
- Mostrar el número de tabla en la UI del formulario

**Signal clave**:

```typescript
// Signal para número global de tabla
readonly globalTableNumberSignal: Signal<string> = computed(() => {
  const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  console.debug(`[SECCION21-FORM] globalTableNumberSignal: Cuadro N° ${globalNum}`);
  return globalNum;
});
```

---

## Fórmulas de Cálculo

### AISD (Área de Influencia Social Directa)

```
Número Global = 2 + (grupoAISD - 1) * 36 + localTableIndex
```

**Ejemplos**:
- **A.1, Tabla 0**: `2 + (1 - 1) * 36 + 0 = 2` → `Cuadro N° 3.2`
- **A.1, Tabla 1**: `2 + (1 - 1) * 36 + 1 = 3` → `Cuadro N° 3.3`
- **A.2, Tabla 0**: `2 + (2 - 1) * 36 + 0 = 38` → `Cuadro N° 3.38`
- **A.2, Tabla 1**: `2 + (2 - 1) * 36 + 1 = 39` → `Cuadro N° 3.39`

### AISI (Área de Influencia Social Indirecta)

```
Número Global = 2 + numGruposAISD * 36 + (grupoAISI - 1) * 22 + localTableIndex
```

**Ejemplos (con 1 grupo AISD)**:
- **B.1, Tabla 0**: `2 + 1 * 36 + (1 - 1) * 22 + 0 = 38` → `Cuadro N° 3.38`
- **B.1, Tabla 1**: `2 + 1 * 36 + (1 - 1) * 22 + 1 = 39` → `Cuadro N° 3.39`
- **B.2, Tabla 0**: `2 + 1 * 36 + (2 - 1) * 22 + 0 = 60` → `Cuadro N° 3.60`
- **B.2, Tabla 1**: `2 + 1 * 36 + (2 - 1) * 22 + 1 = 61` → `Cuadro N° 3.61`

---

## Ejemplo de Flujo

### Escenario: 1 grupo AISD y 2 grupos AISI

#### Paso 1: Usuario navega a sección 3.1.4.B.1

```
1. Usuario navega a sección 3.1.4.B.1
2. Seccion21ViewComponent inicializa globalTableNumberSignal
3. GlobalNumberingService.getGlobalTableNumber() calcula:
   - groupType: 'AISI'
   - groupNumber: 1
   - numGruposAISD: 1
   - tablasAISD: 1 * 36 = 36
   - offset: 36 + (1 - 1) * 22 = 36
   - globalNumber: 2 + 36 + 0 = 38
4. Resultado: Cuadro N° 3.38
```

#### Paso 2: Usuario navega a sección 3.1.4.B.2

```
1. Usuario navega a sección 3.1.4.B.2
2. Seccion21ViewComponent inicializa globalTableNumberSignal
3. GlobalNumberingService.getGlobalTableNumber() calcula:
   - groupType: 'AISI'
   - groupNumber: 2
   - numGruposAISD: 1
   - tablasAISD: 1 * 36 = 36
   - offset: 36 + (2 - 1) * 22 = 58
   - globalNumber: 2 + 58 + 0 = 60
4. Resultado: Cuadro N° 3.60
```

---

## Tabla de Referencia

### AISD (36 tablas por grupo)

| Grupo | Tabla 0 | Tabla 1 | Tabla 2 | ... | Tabla 35 |
|-------|---------|---------|---------|-----|-----------|
| A.1   | 3.2     | 3.3     | 3.4     | ... | 3.37      |
| A.2   | 3.38    | 3.39    | 3.40    | ... | 3.73      |
| A.3   | 3.74    | 3.75    | 3.76    | ... | 3.109     |

### AISI (22 tablas por grupo, con 1 grupo AISD)

| Grupo | Tabla 0 | Tabla 1 | Tabla 2 | ... | Tabla 21 |
|-------|---------|---------|---------|-----|-----------|
| B.1   | 3.38    | 3.39    | 3.40    | ... | 3.59      |
| B.2   | 3.60    | 3.61    | 3.62    | ... | 3.81      |
| B.3   | 3.82    | 3.83    | 3.84    | ... | 3.103     |

---

## Troubleshooting

### Los números de tabla no son correctos

1. Verificar que `TABLAS_POR_SECCION` tiene los valores correctos
2. Verificar que `calculateTableOffset()` suma los offsets correctamente
3. Verificar que `extractGroupNumber()` extrae el número de grupo correcto
4. Verificar que `getAISIGroups()` genera IDs correctos (`B.1`, `B.2`, etc.)

### Los números de tabla se reinician en cada grupo

1. Verificar que `calculateTableOffset()` suma los offsets de grupos anteriores
2. Verificar que el loop de grupos AISI itera hasta el grupo actual - 1
3. Verificar que `numGruposAISD` se calcula correctamente

### Logs de depuración

Para habilitar logs de depuración, revisa la consola del navegador:

```
[SECCION21-VIEW] globalTableNumberSignal: Cuadro N° 3.38
[SECCION21-FORM] globalTableNumberSignal: Cuadro N° 3.38
```

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `global-numbering.service.ts` | Implementación de numeración global de tablas |
| `seccion21-view.component.ts` | Signal para número global de tabla |
| `seccion21-form.component.ts` | Signal para número global de tabla |

---

## Recursos

- [`AISI_GROUPS_ISOLATION.md`](AISI_GROUPS_ISOLATION.md) - Documentación de aislamiento de grupos AISI
- [`GLOBAL_NUMBERING_IMAGES.md`](GLOBAL_NUMBERING_IMAGES.md) - Documentación de numeración global de imágenes
- [`GRUPOS-DINAMICOS-AISI.md`](GRUPOS-DINAMICOS-AISI.md) - Documentación general de grupos AISI
