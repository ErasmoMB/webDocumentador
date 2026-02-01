# Guía de Navegación de Flujo AISD/AISI

## Descripción General

El servicio `SectionFlowNavigationService` implementa un flujo de navegación secuencial entre las secciones de caracterización socioeconómica (AISD y AISI).

## Flujo Implementado

```
A.1.1 → A.1.2 → ... → A.1.16 → A.2.1 → ... → A.2.16 → B.1.1 → ... → B.1.9 → B.2.1 → ... → B.2.9 → [FIN]
```

### Detalles por Grupo:

- **Grupos AISD (A)**: 16 subsecciones cada uno (A.1.1 hasta A.1.16)
  - Ejemplo: A.1 → A.2 → A.3 (según cantidad de comunidades campesinas)

- **Grupos AISI (B)**: 9 subsecciones cada uno (B.1.1 hasta B.1.9)
  - Ejemplo: B.1 → B.2 → B.3 (según cantidad de centros poblados)

## Comportamiento de Navegación

### Siguiente (→)
1. Si hay subsecciones posteriores en el grupo actual → avanzar a la siguiente subsección
2. Si se alcanza la última subsección del grupo actual:
   - Si hay más grupos del mismo tipo → ir a la primera subsección del siguiente grupo
   - Si es el último grupo AISD → ir a B.1.1 (primer grupo AISI)
   - Si es el último grupo AISI → retorna `null` (fin del flujo)

### Anterior (←)
1. Si hay subsecciones anteriores en el grupo actual → retroceder a la subsección anterior
2. Si se está en la primera subsección del grupo actual:
   - Si hay grupos anteriores del mismo tipo → ir a la última subsección del grupo anterior
   - Si es el primer grupo AISI → ir al último grupo AISD
   - Si es el primer grupo AISD → retorna `null` (inicio del flujo)

## Integración en el Componente

### Propiedades Disponibles

```typescript
// En SeccionComponent
puedeIrSiguienteFlow: boolean;  // Indica si hay siguiente en el flujo
puedeIrAnteriorFlow: boolean;   // Indica si hay anterior en el flujo
posicionFlowActual: string;     // Posición actual, ej: "A.1.16" o "B.2.5"
```

### Métodos Disponibles

```typescript
// Navegar al siguiente
irAlSiguienteFlow(): void

// Navegar al anterior
irAlAnteriorFlow(): void
```

### Template HTML

Los botones se muestran automáticamente en la cabecera de preview cuando se navega por secciones AISD/AISI:

```html
<!-- Botones de navegación del flujo (solo en 3.1.4.A.* y 3.1.4.B.*) -->
<div class="flow-nav-buttons" *ngIf="posicionFlowActual">
  <button 
    class="btn btn-sm btn-ghost" 
    (click)="irAlAnteriorFlow()" 
    [disabled]="!puedeIrAnteriorFlow">
    ← Anterior
  </button>
  <button 
    class="btn btn-sm btn-ghost" 
    (click)="irAlSiguienteFlow()" 
    [disabled]="!puedeIrSiguienteFlow">
    Siguiente →
  </button>
</div>

<!-- Posición actual en el flujo -->
<p class="flow-position" *ngIf="posicionFlowActual">
  Posición en flujo: <strong>{{ posicionFlowActual }}</strong>
</p>
```

## Ejemplo de Uso

### Scenario 1: Dos comunidades campesinas (AISD)

Si el usuario carga un JSON con 2 comunidades campesinas:

1. Navega a `3.1.4.A.1.1` → ve "A.1.1"
2. Click "Siguiente" → `3.1.4.A.1.2`
3. Click "Siguiente" (16 veces) → `3.1.4.A.1.16`
4. Click "Siguiente" → `3.1.4.A.2.1` (siguiente comunidad)
5. Click "Siguiente" (16 veces) → `3.1.4.A.2.16`
6. Click "Siguiente" → `3.1.4.B.1.1` (cambio a AISI)
7. Continúa con centros poblados...

### Scenario 2: Un solo centro poblado (AISI)

Si el usuario tiene solo 1 centro poblado y está en `3.1.4.B.1.9`:

1. Navega a `3.1.4.B.1.9` → ve "B.1.9"
2. Click "Siguiente" → `null` (fin del flujo, botón deshabilitado)

## Métodos del Servicio

### `getNextSection(currentSectionId: string): string | null`
Calcula la siguiente sección en el flujo.

```typescript
// Ejemplo
const next = sectionFlow.getNextSection('3.1.4.A.1.16');
// Retorna: '3.1.4.A.2.1' (si hay más grupos AISD)
// Retorna: '3.1.4.B.1.1' (si no hay más grupos AISD)
// Retorna: null (si no hay más secciones)
```

### `getPreviousSection(currentSectionId: string): string | null`
Calcula la sección anterior en el flujo.

### `getFlowInfo(currentSectionId: string): FlowInfo | null`
Retorna información completa sobre el flujo actual:

```typescript
interface FlowInfo {
  currentPosition: string;      // "A.1.16"
  nextPosition: string | null;  // "A.2.1" o null
  previousPosition: string | null; // "A.1.15" o null
  hasNext: boolean;
  hasPrevious: boolean;
}
```

### `hasNextSection(currentSectionId: string): boolean`
Verifica si hay siguiente sin navegar.

### `hasPreviousSection(currentSectionId: string): boolean`
Verifica si hay anterior sin navegar.

## Características Clave

✅ **Integración automática**: Se actualiza al cargar cada sección
✅ **Detección de grupos dinámicos**: Lee del ProjectFacade para conocer cantidad de grupos
✅ **Fallback a datos legacy**: Si ProjectFacade falla, usa datos del FormularioService
✅ **Botones contextuales**: Solo se muestran en secciones AISD/AISI (3.1.4.A.* y 3.1.4.B.*)
✅ **Posición visible**: Muestra al usuario dónde está en el flujo (ej: "A.1.16")

## Notas Técnicas

- La sección debe tener formato `3.1.4.A.{grupo}.{subseccion}` o `3.1.4.B.{grupo}.{subseccion}`
- Los números de subsecciones son fijos: 16 para AISD, 9 para AISI
- El número de grupos es dinámico y se obtiene de:
  1. ProjectFacade.aisdGroups() / ProjectFacade.aisiGroups()
  2. Fallback a datos['comunidadesCampesinas'] / datos['distritosAISI']

## Mejoras Futuras

- [ ] Agregar atajos de teclado (Ctrl+← y Ctrl+→)
- [ ] Guardar posición actual para recuperar al recargar
- [ ] Animación suave entre secciones
- [ ] Indicador de progreso (X de Y subsecciones completadas)
