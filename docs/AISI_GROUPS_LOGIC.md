# Lógica de Grupos AISI - Documentación Técnica

## Overview

El sistema maneja grupos AISI dinámicos que contienen centros poblados. Cada grupo AISI (B.1, B.2, B.3, etc.) tiene sus propios centros poblados asociados, y los datos se heredan correctamente entre las secciones 2.1 a 3.0 de cada grupo.

## Estructura de Grupos AISI

```
 GRUPO AISI: B.1 - SAN PEDRO
 ├── ID: B.1
 ├── Nombre: SAN PEDRO
 └── Centros Poblados: ['0214090010', '0214090059', '0214090027', ...] (47 CP)
```

## Navegación de Secciones

```
http://localhost:4200/seccion/3.1.4.B.1      → Grupo B.1 (SAN PEDRO)
http://localhost:4200/seccion/3.1.4.B.1.1    → Sección 2.1 del Grupo B.1
http://localhost:4200/seccion/3.1.4.B.1.9    → Sección 3.0 del Grupo B.1
                                                   
http://localhost:4200/seccion/3.1.4.B.3      → Grupo B.3 (otro distrito)
http://localhost:4200/seccion/3.1.4.B.3.1    → Sección 2.1 del Grupo B.3
```

## Uso del AISIGroupService

### Inyección del Servicio

```typescript
import { AISIGroupService } from 'src/app/core/services/aisi-group.service';

constructor(
  private aisiGroupService = inject(AISIGroupService)
) {}
```

### Métodos Disponibles

#### 1. Identificar el Grupo AISI Actual

```typescript
// Verificar si la sección es AISI
const esAISI = aisiGroupService.esSeccionAISI('3.1.4.B.1'); // true

// Obtener prefijo del grupo
const prefijo = aisiGroupService.obtenerPrefijoAISI('3.1.4.B.1'); // '_B1'

// Obtener índice del grupo (0-based)
const indice = aisiGroupService.obtenerIndiceGrupoAISI('3.1.4.B.1'); // 0

// Obtener definición del grupo
const grupo = aisiGroupService.obtenerGrupoActual('3.1.4.B.1');
// { id: 'B.1', nombre: 'SAN PEDRO', ccppIds: [...] }
```

#### 2. Obtener Centros Poblados del Grupo

```typescript
// Obtener códigos de centros poblados
const codigos = aisiGroupService.obtenerCodigosCentrosPoblados('3.1.4.B.1');
// ['0214090010', '0214090059', '0214090027', ...]

// Obtener nombres de centros poblados (para autocompletar)
const nombres = aisiGroupService.obtenerNombresCentrosPoblados('3.1.4.B.1');
// ['SAN PEDRO', 'CANGREJAL', 'LA LAGUNA', ...]
```

#### 3. Conversión Código ↔ Nombre

```typescript
// Obtener nombre por código
const nombre = aisiGroupService.obtenerNombrePorCodigo('3.1.4.B.1', '0214090010');
// 'SAN PEDRO'

// Obtener código por nombre
const codigo = aisiGroupService.obtenerCodigoPorNombre('3.1.4.B.1', 'SAN PEDRO');
// '0214090010'

// Verificar pertenencia
const pertenece = aisiGroupService.perteneceAlGrupoActual('3.1.4.B.1', '0214090010');
// true
```

#### 4. Información de Debug

```typescript
const debug = aisiGroupService.obtenerInfoDebug('3.1.4.B.1');
// {
//   seccionId: '3.1.4.B.1',
//   prefijo: '_B1',
//   esSeccionAISI: true,
//   grupo: { id: 'B.1', nombre: 'SAN PEDRO', ccppCount: 47 },
//   centrosPoblados: { count: 47, codigos: [...], nombres: [...] }
// }
```

## Uso desde BaseSectionComponent

Todas las secciones que extienden `BaseSectionComponent` tienen acceso a métodos de conveniencia:

```typescript
// Obtener códigos de CP del grupo AISI actual
const codigosCP = this.getCodigosCentrosPobladosAISI();

// Obtener nombres de CP para autocompletar
const nombresCP = this.getNombresCentrosPobladosAISI();

// Obtener nombre de un CP por su código
const nombre = this.getNombreCentroPobladoPorCodigoAISI('0214090010');

// Verificar si un CP pertenece al grupo actual
const pertenece = this.perteneceCentroPobladoAlGrupoAISI('0214090010');

// Debug info
const debug = this.getAISIGroupDebugInfo();
```

## Ejemplo: Llenar Campo con Nombre de CP

```typescript
// En una sección AISI (ej: seccion21, seccion22, etc.)
onCentroPobladoSeleccionado(codigoCP: string): void {
  // Obtener el nombre del centro poblado
  const nombreCP = this.getNombreCentroPobladoPorCodigoAISI(codigoCP);
  
  // Guardar en los datos de la sección
  this.datos.centroPobladoAISI = nombreCP;
  
  // Persistir el cambio
  this.onFieldChange('centroPobladoAISI', nombreCP);
}
```

## Ejemplo: Autocompletar con Nombres de CP

```typescript
// En el template HTML
<input 
  type="text" 
  [ngbTypeahead]="buscarCentrosPoblados"
  (selectItem)="onSeleccionarCentroPoblado($event)"
>

// En el componente
buscarCentrosPoblados = (text$: Observable<string>) => {
  const nombresCP = this.getNombresCentrosPobladosAISI();
  return text$.pipe(
    debounceTime(200),
    map(term => nombresCP.filter(n => 
      n.toLowerCase().includes(term.toLowerCase())
    ))
  );
};

onSeleccionarCentroPoblado(event: any): void {
  const nombreSeleccionado = event.item;
  const codigo = this.getCodigoCentroPobladoPorNombreAISI(nombreSeleccionado);
  this.datos.codigoCentroPobladoAISI = codigo;
}
```

## Cómo Funciona el Prefijo

El `PrefijoHelper` extrae el prefijo del `seccionId`:

| seccionId | prefijo | grupo |
|-----------|---------|-------|
| `3.1.4.B.1` | `_B1` | B.1 (índice 0) |
| `3.1.4.B.2` | `_B2` | B.2 (índice 1) |
| `3.1.4.B.3` | `_B3` | B.3 (índice 2) |
| `3.1.4.A.1` | `_A1` | A.1 (AISD, no AISI) |

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    Grupo AISI: B.1                          │
│                    SAN PEDRO                                │
├─────────────────────────────────────────────────────────────┤
│ Centros Poblados:                                          │
│ ├── 0214090010 - SAN PEDRO                                │
│ ├── 0214090059 - CANGREJAL                                │
│ ├── 0214090027 - LA LAGUNA                                │
│ └── ... (47 total)                                        │
├─────────────────────────────────────────────────────────────┤
│ Secciones (usan los CP del grupo):                         │
│ ├── 3.1.4.B.1.1 - Sección 2.1                           │
│ ├── 3.1.4.B.1.2 - Sección 2.2                           │
│ ├── ...                                                   │
│ └── 3.1.4.B.1.9 - Sección 3.0                           │
└─────────────────────────────────────────────────────────────┘
```

## Evitar Mezclas de Datos

Para asegurar que los datos no se mezclen entre grupos AISI:

1. **Usar Prefijos Correctos**: Los datos se guardan con el prefijo del grupo
   - `centroPobladoAISI_B.1` para el grupo B.1
   - `centroPobladoAISI_B.3` para el grupo B.3

2. **Usar el Servicio para Lectura**: Siempre usar `AISIGroupService` para obtener datos del grupo actual

3. **Verificar Pertenencia**: Antes de mostrar datos, verificar que pertenezcan al grupo actual

## Verificación en Tiempo de Ejecución

Para depurar qué grupo AISI está activo y qué centros poblados tiene:

```typescript
ngOnInit(): void {
  // Loguear información de debug
  console.log('🗺️ GRUPO AISI ACTUAL:', this.getAISIGroupDebugInfo());
  
  // Verificar códigos de CP
  const codigos = this.getCodigosCentrosPobladosAISI();
  console.log('[DEBUG] centrosPobladosSeleccionados:', codigos);
}
```

## Notas Importantes

1. **Grupos Dinámicos**: Los grupos AISI se crean dinámicamente y pueden ser B.1, B.2, B.3, etc.

2. **Herencia de Datos**: Cada sección dentro de un grupo AISI hereda los mismos centros poblados

3. **Aislamiento**: Los datos de un grupo AISI no se mezclan con otros grupos

4. **Persistencia**: Los datos se guardan con prefijos para mantener el aislamiento entre grupos
