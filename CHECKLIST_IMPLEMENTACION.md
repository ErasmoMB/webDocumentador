# Checklist de Implementación - Auto Load Backend

## Estado General

**Servicios Creados**: ✅ 3/3  
**Componentes Base Creados**: ✅ 1/1  
**Utilities Creadas**: ✅ 1/1  
**Documentación**: ✅ 3/3  

---

## Fase 1: Infraestructura (✅ Completada)

### Servicios Principales

- [x] **BackendDataMapperService** (`backend-data-mapper.service.ts`)
  - [x] Mapea secciones a endpoints
  - [x] Configuración centralizada
  - [x] Transformaciones de datos
  - [x] 8 transformadores predefinidos

- [x] **AutoBackendDataLoaderService** (`auto-backend-data-loader.service.ts`)
  - [x] Orquesta carga de datos
  - [x] Manejo de caché
  - [x] Agregación automática
  - [x] Manejo de errores

- [x] **AutoLoadSectionComponent** (`auto-load-section.component.ts`)
  - [x] Clase base reutilizable
  - [x] Lifecycle hooks
  - [x] Gestión de suscripciones
  - [x] Métodos abstractos para customización

### Utilities

- [x] **SectionAutoLoadHelper** (`section-auto-load-helper.ts`)
  - [x] Validación de datos
  - [x] Transformación de datos
  - [x] Fusión de datos
  - [x] Métodos estáticos

---

## Fase 2: Implementación en Secciones AISD

### Sección 6 (Demografía)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar `getSectionKey()` → "seccion6_aisd"
- [ ] Implementar `getLoadParameters()` → códigos CCPP activos
- [ ] Implementar `onInitCustom()` → lógica específica
- [ ] Implementar `onDataChange()` → validaciones
- [ ] Inyectar `AutoBackendDataLoaderService`
- [ ] Remover métodos de carga manual
- [ ] Testing: verificar carga de datos

**Endpoints que cargan automáticamente**:
- `/demograficos/datos` → poblacionSexoAISD, poblacionEtarioAISD

---

### Sección 7 (PET)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos
- [ ] Inyectar `AutoBackendDataLoaderService`
- [ ] Remover lógica de carga manual

**Endpoints que cargan automáticamente**:
- `/aisd/pet` → petAISD

---

### Sección 8 (Actividades Económicas)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos
- [ ] Inyectar `AutoBackendDataLoaderService`

**Endpoints que cargan automáticamente**:
- `/economicos/principales` → actividadesEconomicasAISD

---

### Sección 9 (Viviendas)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos
- [ ] Inyectar `AutoBackendDataLoaderService`

**Endpoints que cargan automáticamente**:
- `/aisd/materiales-construccion` → materialesConstruccionAISD

---

### Sección 10 (Servicios Básicos)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos
- [ ] Inyectar `AutoBackendDataLoaderService`

**Endpoints que cargan automáticamente**:
- `/servicios/basicos` → serviciosBasicosAISD

---

### Sección 15 (Lenguas)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos
- [ ] Inyectar `AutoBackendDataLoaderService`

**Endpoints que cargan automáticamente**:
- `/vistas/lenguas-ubicacion` → lenguasAISD

---

### Sección 16 (Religiones)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos
- [ ] Inyectar `AutoBackendDataLoaderService`

**Endpoints que cargan automáticamente**:
- `/vistas/religiones-ubicacion` → religionesAISD

---

### Sección 19 (NBI)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos
- [ ] Inyectar `AutoBackendDataLoaderService`

**Endpoints que cargan automáticamente**:
- `/vistas/nbi-ubicacion` → nbiAISD

---

## Fase 3: Implementación en Secciones AISI

### Sección 21 (Información Referencial)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos (ubigeo de distrito)
- [ ] Inyectar `AutoBackendDataLoaderService`

**Endpoints que cargan automáticamente**:
- `/aisi/informacion-referencial` → informacionReferencialAISI

---

### Sección 22 (Centros Poblados)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos

**Endpoints que cargan automáticamente**:
- `/aisi/centros-poblados` → centrosPobladosAISI

---

### Sección 23 (Población por Sexo)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos
- [ ] Inyectar `AutoBackendDataLoaderService`

**Endpoints que cargan automáticamente**:
- `/demograficos/datos` → poblacionSexoAISI

---

### Sección 24 (Población por Etario)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos

**Endpoints que cargan automáticamente**:
- `/demograficos/datos` → poblacionEtarioAISI

---

### Sección 25 (PET)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos

**Endpoints que cargan automáticamente**:
- `/aisd/pet` → petAISI

---

### Sección 26 (PEA Distrital)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos

**Endpoints que cargan automáticamente**:
- `/aisi/pea-distrital` → peaDistrital

---

### Sección 27 (Actividades Económicas)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos

**Endpoints que cargan automáticamente**:
- `/economicos/principales` → actividadesEconomicasAISI

---

### Sección 28 (Viviendas)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos

**Endpoints que cargan automáticamente**:
- `/aisi/viviendas-censo` → viviendasCensoAISI

---

### Sección 29 (Servicios Básicos)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos

**Endpoints que cargan automáticamente**:
- `/servicios/basicos` → serviciosBasicosAISI

---

### Sección 30 (Información Complementaria)

- [ ] Cambiar a `AutoLoadSectionComponent`
- [ ] Implementar métodos abstractos (múltiples campos)

**Endpoints que cargan automáticamente**:
- `/vistas/lenguas-ubicacion` → lenguasAISI
- `/vistas/religiones-ubicacion` → religionesAISI
- `/vistas/nbi-ubicacion` → nbiAISI

---

## Fase 4: Testing

### Tests Unitarios (Por hacer)

- [ ] BackendDataMapperService
  - [ ] getConfig() retorna configuración correcta
  - [ ] getMapping() retorna mapeo específico
  - [ ] Transformaciones son correctas
  
- [ ] AutoBackendDataLoaderService
  - [ ] loadSectionData() retorna Observable
  - [ ] Caché funciona correctamente
  - [ ] Agregación suma valores correctos
  - [ ] Errores se manejan gracefully

- [ ] AutoLoadSectionComponent
  - [ ] ngOnInit() llama loadAutoSectionData()
  - [ ] processLoadedData() fusiona datos correctamente
  - [ ] ngOnDestroy() limpia suscripciones

### Tests de Integración (Por hacer)

- [ ] Carga datos de un CCPP
- [ ] Carga y agrega múltiples CCPP
- [ ] Cambio de seccionId recarga datos
- [ ] Caché mejora rendimiento
- [ ] Errores del backend se manejan

### Tests E2E (Por hacer)

- [ ] Usuario abre Sección 6 → datos se cargan automáticamente
- [ ] Usuario cambia de grupo AISD → datos se actualizan
- [ ] Tablas muestran datos correctos
- [ ] Porcentajes se calculan correctamente

---

## Fase 5: Validación

### Antes de Ir a Producción

- [ ] Todos los servicios inyectados correctamente
- [ ] No hay errores en consola
- [ ] Datos se cargan en < 1s (con caché)
- [ ] No hay memory leaks (suscripciones limpias)
- [ ] Caché se invalida correctamente después de editar
- [ ] Agregación de múltiples CCPP suma correctamente
- [ ] Transformaciones generan estructura correcta
- [ ] Errores del backend no causan crashes

### Verificación de Endpoints

- [ ] `/demograficos/datos` retorna población y grupos etarios
- [ ] `/aisd/pet` retorna PET y PNEA
- [ ] `/economicos/principales` retorna actividades
- [ ] `/aisd/materiales-construccion` retorna materiales
- [ ] `/servicios/basicos` retorna servicios
- [ ] `/vistas/lenguas-ubicacion` retorna idiomas
- [ ] `/vistas/religiones-ubicacion` retorna religiones
- [ ] `/vistas/nbi-ubicacion` retorna NBI
- [ ] `/aisi/informacion-referencial` retorna info distrito
- [ ] `/aisi/centros-poblados` retorna CCPP
- [ ] `/aisi/pea-distrital` retorna PEA
- [ ] `/aisi/viviendas-censo` retorna viviendas

---

## Fase 6: Optimización

- [ ] Revisar tiempo de carga
- [ ] Implementar OnPush ChangeDetection en componentes
- [ ] Evaluar duración de caché (1 hora es suficiente?)
- [ ] Agregar logging para debugging
- [ ] Documentar cambios en README

---

## Resumen de Cambios

### Archivos Nuevos

1. ✅ `backend-data-mapper.service.ts` (340 líneas)
2. ✅ `auto-backend-data-loader.service.ts` (210 líneas)
3. ✅ `auto-load-section.component.ts` (125 líneas)
4. ✅ `section-auto-load-helper.ts` (105 líneas)
5. ✅ `GUIA_IMPLEMENTACION_AUTO_LOAD.md`
6. ✅ `ARQUITECTURA_TECNICA_AUTO_LOAD.md`
7. ✅ `CHECKLIST_IMPLEMENTACION.md` (este archivo)

### Archivos a Modificar (por sección)

- [ ] Sección 6: `seccion6.component.ts`
- [ ] Sección 7: `seccion7.component.ts`
- [ ] Sección 8: `seccion8.component.ts`
- [ ] ... (16 secciones en total)

### Archivos Sin Cambios

- ✅ `BackendApiService` - Funciona sin cambios
- ✅ `CacheService` - Funciona sin cambios
- ✅ `FormularioService` - Funciona sin cambios
- ✅ `FieldMappingService` - Puede coexistir

---

## Métricas de Éxito

| Métrica | Target | Actual |
|---------|--------|--------|
| % de secciones con auto-load | 100% | 0% |
| Tiempo promedio de carga | < 1s | ? |
| Errores de caché | 0 | ? |
| Suscripciones no limpias | 0 | ? |
| Transformaciones incorrectas | 0 | ? |
| Tests pasando | 100% | ? |

---

## Próximos Pasos

1. **Inmediato**: Completar Fase 2 (Sección 6)
2. **Corto plazo**: Completar Fases 2-3 (todas las secciones)
3. **Medio plazo**: Fase 4 (Testing)
4. **Largo plazo**: Fase 5-6 (Validación y Optimización)

---

**Checklist de Implementación**  
**Documentador LBS - Auto Load Backend**  
**Actualización**: 17 de enero de 2026

---

### Cómo Usar Este Checklist

1. Imprimir o abrir en navegador
2. Marcar tareas conforme se completen
3. Seguir orden de fases
4. Confirmar que cada sección funciona antes de continuar
5. Ejecutar tests antes de marcar como completa
