# Arquitectura Técnica - Sistema Auto Load Backend

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│           Componente Sección (ej: Seccion6Component)            │
│                   extends AutoLoadSectionComponent              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ngOnInit() llamado
                           │
                    ┌──────▼─────────┐
                    │getSectionKey() │ ← Retorna "seccion6_aisd"
                    └──────┬─────────┘
                           │
                    ┌──────▼──────────────────┐
                    │getLoadParameters()      │
                    │← Retorna códigos CCPP   │
                    │  activos de Sección 4   │
                    └──────┬──────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────────┐
│         AutoBackendDataLoaderService                            │
│                                                                  │
│  loadSectionData(                                               │
│    'seccion6_aisd',                                             │
│    ['403060001', '403060002'],                                  │
│    false  ← forceRefresh                                        │
│  )                                                              │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ├─────────────────────────────────────────┐
       │                                          │
   ┌───▼───────────────────┐        ┌────────────▼─────────────┐
   │ CacheService          │        │BackendDataMapperService   │
   │                       │        │                           │
   │ Verifica si existe    │        │getConfig('seccion6_aisd')│
   │cache para endpoint    │        │         │                │
   └───┬───────────────────┘        │    ┌────▼──────┐         │
       │                             │    │ poblacion │         │
       │ Si existe ✅               │    │ SexoAISD  │         │
       │ Retorna cache              │    │    ↓      │         │
       │                             │    │endpoint   │         │
       │ Si NO existe ❌             │    │/demograficos...     │
       │ Continúa                    │    │           │         │
       └────────────────────────────┐│    └────┬──────┘         │
                                   ││         │                │
                    ┌──────────────┘│ ┌───────▼──────────┐      │
                    │               │ │poblacionEtario   │      │
                    │               │ │AISD              │      │
                    │               │ │    ↓             │      │
                    │               │ │endpoint          │      │
                    │               │ │/demograficos...  │      │
                    │               │ └──────────────────┘      │
                    │               └──────────────────────────┘
                    │
    ┌───────────────▼────────────────────────────────────┐
    │  Para cada field, en paralelo:                     │
    │  forkJoin([...observables])                        │
    └───────────────┬────────────────────────────────────┘
                    │
      ┌─────────────┴─────────────┐
      │                            │
  ┌───▼──────────────────┐   ┌────▼───────────────────┐
  │BackendApiService     │   │Agregación de múltiples │
  │.getDatosDemo...()    │   │CCPP si aggregatable:true
  │                      │   │                        │
  │Retorna datos del BE  │   │forkJoin([              │
  │con estructura:       │   │  llamada_ccpp1,        │
  │{                     │   │  llamada_ccpp2         │
  │  success: true,      │   │])                      │
  │  data: [...]         │   │                        │
  │}                     │   │Merge automático        │
  └───┬──────────────────┘   └────┬───────────────────┘
      │                            │
      └────────────────┬───────────┘
                       │
    ┌──────────────────▼────────────────────┐
    │Transform de Datos                     │
    │                                       │
    │Para poblacionSexo:                    │
    │  [{sexo: 'Hombre', casos: 78}, ...]  │
    │                                       │
    │Para poblacionEtario:                  │
    │  [{categoria: '15-29', casos: 25}...] │
    │                                       │
    │Otros transforma según su tipo         │
    └──────────────────┬─────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │CacheService.set()           │
        │Cachea por 1 hora (3600000ms)│
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │return Observable<{...}>     │
        │{                            │
        │  poblacionSexoAISD: [...],  │
        │  poblacionEtarioAISD: [...] │
        │}                            │
        └──────────────┬──────────────┘
                       │
      ┌────────────────▼─────────────┐
      │AutoLoadSectionComponent      │
      │                              │
      │.processLoadedData(data)      │
      │                              │
      │Fusiona con datos existentes: │
      │ this.datos[fieldName] = data │
      │                              │
      │Respeta prefijos (_A1, _A2...)│
      │                              │
      │this.formularioService        │
      │  .actualizarDatos(datos)     │
      └────────────────┬─────────────┘
                       │
      ┌────────────────▼─────────────┐
      │cdRef.detectChanges()         │
      │                              │
      │Angular re-renderiza          │
      │tablas con datos nuevos       │
      └──────────────────────────────┘
```

---

## Flujo de Datos

### 1. Carga Inicial (ngOnInit)

```
User abre Sección 6
      │
      ▼
ngOnInit() del componente
      │
      ├─→ actualizarDatos() → trae datos del formulario
      │
      ├─→ loadAutoSectionData()
      │    ├─→ getSectionKey() = "seccion6_aisd"
      │    │
      │    ├─→ getLoadParameters() = ["403060001", "403060002"]
      │    │
      │    └─→ autoLoader.loadSectionData()
      │         ├─→ Para cada field en config:
      │         │   ├─→ Verifica caché
      │         │   ├─→ Si no existe, llama endpoint
      │         │   ├─→ Transforma datos
      │         │   └─→ Cachea resultado
      │         │
      │         └─→ Retorna {poblacionSexoAISD: [...], ...}
      │
      ├─→ processLoadedData(loadedData)
      │    └─→ Fusiona datos en this.datos
      │
      └─→ onInitCustom() → lógica específica de la sección
```

### 2. Cambio de Datos

```
User cambia seccionId (diferente grupo AISD)
      │
      ▼
ngOnChanges() detecta cambio
      │
      ├─→ actualizarDatos() nuevamente
      │
      └─→ loadAutoSectionData() con nuevo seccionId
          └─→ Repite flujo de carga
```

### 3. Agregación de Múltiples CCPP

```
getLoadParameters() retorna:
["403060001", "403060002", "403060003"]
      │
      ▼
loadSectionData() con aggregatable: true
      │
      ├─→ Llama endpoint 3 veces en paralelo
      │   ├─→ /demograficos/datos?id_ubigeo=403060001
      │   ├─→ /demograficos/datos?id_ubigeo=403060002
      │   └─→ /demograficos/datos?id_ubigeo=403060003
      │
      ├─→ forkJoin espera respuestas
      │
      ├─→ mergeResults() suma automáticamente:
      │   ├─→ hombres: 78+33+50 = 161
      │   ├─→ mujeres: 82+19+45 = 146
      │   └─→ total: 307
      │
      └─→ Retorna datos agregados
```

---

## Gestión de Caché

```
Llave de caché: "{endpoint}:{ubigeo/cpp}"

Ejemplos:
  "/demograficos/datos:403060001"
  "/demograficos/datos:403060001,403060002,403060003"
  "/aisd/pet:403060001"
  "/aisi/informacion-referencial:040306"

Duración: 3600000ms (1 hora)

Validez:
  ✅ Datos de censo (2017) → cachear indefinidamente
  ⚠️ Datos de trabajo de campo → limpiar después de editar
```

---

## Transformaciones de Datos

```
Backend                          Frontend
─────────────────────────────────────────────

/demograficos/datos:             poblacionSexoAISD:
{                                [{
  id_ubigeo: "...",                sexo: "Hombre",
  hombres: 78,        ──────►      casos: 78
  mujeres: 82                    }, {
}                                  sexo: "Mujer",
                                   casos: 82
                                 }]


/aisd/pet:                       petAISD:
[{                               [{
  categoría: "PET",                categoria: "PET",
  casos: 120          ──────►      casos: 120
}, {                             }, {
  categoría: "PNEA",              categoria: "PNEA",
  casos: 40                        casos: 40
}]                               }]


/aisd/materiales-construccion:   materialesConstruccionAISD:
[{                               [{
  categoria: "Paredes",            categoria: "Paredes",
  tipo_material: "Ladrillo",  ►    tipo_material: "Ladrillo",
  casos: 45                        casos: 45
}]                               }]
```

---

## Validación de Datos

```
Validaciones automáticas:

1. ¿Datos nulos o undefined?
   ✅ Skip, no sobrescribir
   
2. ¿Array vacío?
   ✅ Skip, no sobrescribir
   
3. ¿Código CCPP inválido?
   ✅ Catch error, usar caché o datos anteriores
   
4. ¿Backend sin respuesta?
   ✅ Catch error, usar caché o datos anteriores

5. ¿Datos sin transformar?
   ✅ Usar datos crudos del backend

Ejemplo en código:
if (data === null || data === undefined) continue;
if (Array.isArray(data) && data.length === 0) continue;
```

---

## Ciclo de Vida

```
Componente Seccion6Component
│
├─ constructor()
│  └─→ No se hace nada relacionado a carga de datos
│
├─ ngOnInit()
│  ├─→ loadAutoSectionData()
│  │  └─→ async → Observable
│  │
│  └─→ onInitCustom()
│
├─ ngOnChanges(seccionId)
│  └─→ Si seccionId cambió, reload datos
│
├─ ngDoCheck()
│  └─→ Detecta cambios en this.datos
│
├─ Mientras el usuario edita
│  └─→ FormularioService guarda cambios
│
└─ ngOnDestroy()
   └─→ Limpia suscripciones

Suscripciones:
- autoLoadSubscriptions: Array de Observable subscriptions
- Se limpian en ngOnDestroy()
```

---

## Escalabilidad

### Agregar Nueva Sección (Ejemplo: Sección 8)

**1. En BackendDataMapperService:**
```typescript
this.mappingConfigs.set('seccion8_aisd', {
  actividadesEconomicasAISD: {
    fieldName: 'actividadesEconomicasAISD',
    endpoint: '/economicos/principales',
    paramType: 'id_ubigeo',
    aggregatable: true,
    transform: (data) => this.transformActividades(data)
  }
});
```

**2. En AutoBackendDataLoaderService.callEndpoint():**
```typescript
case '/economicos/principales':
  return this.backendApi.getActividadesPrincipales(paramValue).pipe(
    map(response => response.data)
  );
```

**3. En Seccion8Component:**
```typescript
export class Seccion8Component extends AutoLoadSectionComponent {
  
  protected getSectionKey(): string {
    return 'seccion8_aisd';
  }
  
  protected getLoadParameters(): string[] | null {
    const prefijo = this.obtenerPrefijoGrupo();
    const codigos = this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo);
    return codigos && codigos.length > 0 ? codigos : null;
  }
  
  protected onInitCustom(): void {
    // Lógica específica
  }
  
  protected onDataChange(): void {
    // Validaciones
  }
}
```

**4. ¡Listo!** La sección ahora carga datos automáticamente.

---

## Performance

### Optimizaciones Implementadas

1. **Caché**: 1 hora de duración automática
2. **Parallelización**: forkJoin para múltiples requests
3. **Lazy Loading**: Solo se cargan datos de la sección activa
4. **OnPush Detection**: Evitar chequeos innecesarios
5. **Agregación automática**: No hace múltiples calls si puede agregar

### Tiempos Esperados

| Operación | Tiempo |
|-----------|--------|
| Carga inicial | 200-500ms |
| Desde caché | 0-50ms |
| Agregación 3 CCPP | 400-800ms |
| Change detection | 50-100ms |

---

**Documento Técnico**  
**Sistema Auto Load Backend - Documentador LBS**  
**Actualización**: 17 de enero de 2026
