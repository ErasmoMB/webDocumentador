# Análisis del Patrón UNICA_VERDAD en Secciones 8-30

Este documento analiza el estado actual de implementación del patrón **UNICA_VERDAD** en las secciones 8 a 30 del sistema webDocumentador.

## Definición del Patrón

**UNICA_VERDAD** significa que:
1. **Lectura**: Los componentes leen datos desde `ProjectStateFacade` (Signal Store) usando `formDataSignal`
2. **Escritura**: Los componentes escriben datos en `ProjectStateFacade` y luego persisten en `Session-Data` (Redis) usando `formChange.persistFields()`

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   FORMULARIO    │◄───────►│  ProjectStateFacade  │◄───────►│     VISTA       │
│                 │         │    (Signal Store)    │         │                 │
│ formDataSignal │         │                      │         │  viewDataSignal│
│      +         │         │                      │         │      +          │
│ formChange.    │         │                      │         │    Effects     │
│ persistFields()│         │                      │         │                 │
└─────────────────┘         └──────────────────────┘         └─────────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │   Session-Data      │
                         │     (Redis)         │
                         │   TTL: 7 días       │
                         └─────────────────────┘
```

## Resumen de Estados (ACTUALIZADO)

| Sección | formDataSignal (Lectura) | persistFields (Escritura) | Estado |
|---------|--------------------------|---------------------------|--------|
| 1       | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 2       | ⚠️ Parcial               | ✅ Sí                     | ⚠️ PARCIAL |
| 3       | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 4       | ✅ Sí                    | ⚠️ Parcial                | ⚠️ PARCIAL |
| 5       | ❓ No verificado         | ❓ No verificado          | ❓ N/A |
| 6       | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 7       | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 8       | ✅ Sí                    | ✅ Sí (CORREGIDO)         | ✅ IDEAL |
| 9       | ✅ Sí                    | ✅ Sí (CORREGIDO)         | ✅ IDEAL |
| 10      | ✅ Sí                    | ✅ Sí (CORREGIDO)         | ✅ IDEAL |
| 11      | ✅ Sí                    | ✅ Sí (CORREGIDO)         | ✅ IDEAL |
| 12      | ✅ Sí (Form + View)           | ✅ Sí (CORREGIDO)           | ✅ **IDEAL** |
| 13      | ✅ Sí                   | ⚠️ persist: false         | ⚠️ PARCIAL |
| 14      | ✅ Sí                    | ✅ Sí (CORREGIDO)         | ✅ **IDEAL** |
| 15      | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| **16**  | ✅ Sí (usa BaseSection) | ✅ Sí (via super.onFieldChange) | ✅ **IDEAL** (corregido análisis) |
| 17      | ⚠️ Parcial               | ✅ Sí                     | ⚠️ PARCIAL |
| 18      | ✅ Sí (Form + View)           | ✅ Sí (CORREGIDO)           | ✅ **IDEAL** |
| 19      | ✅ Sí                    | ✅ Sí (CORREGIDO)         | ✅ IDEAL |
| 20      | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 21      | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 22      | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 23      | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 24      | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 25      | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 26      | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 27      | ✅ Sí                    | ✅ Sí                     | ✅ IDEAL |
| 28      | ❓ No verificado         | ❓ No verificado          | ❓ N/A |
| 29      | ✅ Sí                    | ⚠️ Parcial                | ⚠️ PARCIAL |
| 30      | ✅ Sí                    | ⚠️ Parcial                | ⚠️ PARCIAL |

---

## Análisis Detallado por Sección

### ✅ SECCIÓN 1 - Identificación del Centro Poblado
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado (para campos de formulario y tablas)
- **Estado**: IDEAL - La sección usa el patrón completo

### ⚠️ SECCIÓN 2 - Ubicación Geográfica
- **formDataSignal**: ⚠️ Parcial (usa approach mixto)
- **persistFields**: ✅ Implementado
- **Estado**: PARCIAL - Funciona pero no es puro
- **Notas**: Usa `formChangeService` directamente en lugar de `formChange`

### ✅ SECCIÓN 3 - Historia y Origen
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### ⚠️ SECCIÓN 4 - Límites y extensión
- **formDataSignal**: ✅ Implementado
- **persistFields**: ⚠️ Parcial
- **Estado**: PARCIAL - Puede tener problemas de persistencia

### ❓ SECCIÓN 5 - No verificada

### ✅ SECCIÓN 6 - Demografía (PATRÓN DE REFERENCIA)
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado para tablas PET, PEA, PEA Ocupada
- **Estado**: IDEAL - Documentada como referencia

### ✅ SECCIÓN 7 - PEA (YA CORREGIDA)
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado para las 3 tablas principales
- **Estado**: IDEAL - Corregida en esta sesión

---

### 🚨 SECCIÓN 8 - Actividades Económicas
- **formDataSignal**: ✅ Implementado (líneas 140-395)
- **persistFields**: ❌ NO IMPLEMENTADO
- **Estado**: CRÍTICO - Los datos NO persisten en Redis
- **Problema**: Solo guarda en `this.datos` localmente, no en Session-Data
- **Solución**: Agregar `formChange.persistFields()` en todos los métodos que modifican datos

### 🚨 SECCIÓN 9 - Educación
- **formDataSignal**: ✅ Implementado (líneas 276-424)
- **persistFields**: ❌ NO IMPLEMENTADO
- **Estado**: CRÍTICO - Los datos NO persisten en Redis
- **Problema**: Usa `projectFacade.setField()` pero no llama a `formChange.persistFields()`
- **Solución**: Agregar llamadas a `formChange.persistFields()` después de `projectFacade.setField()`

### 🚨 SECCIÓN 10 - Salud
- **formDataSignal**: ✅ Implementado (líneas 189-431)
- **persistFields**: ❌ NO IMPLEMENTADO
- **Estado**: CRÍTICO
- **Problema**: Tiene tablas (agua, saneamiento, alumbrado, energía, comunicaciones) pero sin persistencia

### 🚨 SECCIÓN 11 - Vivienda
- **formDataSignal**: ✅ Implementado (líneas 73-133)
- **persistFields**: ❌ NO IMPLEMENTADO
- **Estado**: CRÍTICO

### 🚨 SECCIÓN 12 - Servicios Públicos
- **formDataSignal**: ⚠️ Solo en View, NO en Form
- **persistFields**: ❌ NO IMPLEMENTADO
- **Estado**: CRÍTICO - El Form NO usa signals, usa `this.datos` directamente

### ⚠️ SECCIÓN 13 - Organizaciones
- **formDataSignal**: ✅ Implementado
- **persistFields**: ⚠️ Usa `persist: false` (línea 589, 598, 609)
- **Estado**: PARCIAL - No persiste en Redis, solo actualiza state
- **Problema**: `{ persist: false }` significa que NO guarda en Redis

### ⚠️ SECCIÓN 14 - Infraestructura
- **formDataSignal**: ✅ Implementado
- **persistFields**: ⚠️ Usa `persist: false` (línea 317, 336)
- **Estado**: PARCIAL

### ✅ SECCIÓN 15 - Proyectos
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### 🚨 SECCIÓN 16 - Actividades Productivas
- **formDataSignal**: ✅ Implementado
- **persistFields**: ❌ NO IMPLEMENTADO
- **Estado**: CRÍTICO

### ⚠️ SECCIÓN 17 - Fogones
- **formDataSignal**: ⚠️ Parcial
- **persistFields**: ✅ Implementado
- **Estado**: PARCIAL

### 🚨 SECCIÓN 18 - Comunicación y Transporte
- **formDataSignal**: ❌ NO IMPLEMENTADO
- **persistFields**: ❌ NO IMPLEMENTADO
- **Estado**: LEGACY - No usa signals, usa `this.datos` directamente

### 🚨 SECCIÓN 19 -Religion
- **formDataSignal**: ✅ Implementado (líneas 104-196)
- **persistFields**: ❌ NO IMPLEMENTADO
- **Estado**: CRÍTICO

### ✅ SECCIÓN 20 - Lengua
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### ✅ SECCIÓN 21 - Historia Local
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### ✅ SECCIÓN 22 - Demografía
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### ✅ SECCIÓN 23 - Población
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### ✅ SECCIÓN 24 - Actividades Económicas
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### ✅ SECCIÓN 25 - Vivienda
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### ✅ SECCIÓN 26 - Saneamiento
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### ✅ SECCIÓN 27 - Transporte
- **formDataSignal**: ✅ Implementado
- **persistFields**: ✅ Implementado
- **Estado**: IDEAL

### ❓ SECCIÓN 28 - No verificada

### ⚠️ SECCIÓN 29 - Telecomunicaciones
- **formDataSignal**: ✅ Implementado
- **persistFields**: ⚠️ Parcial
- **Estado**: PARCIAL

### ⚠️ SECCIÓN 30 - Deportes
- **formDataSignal**: ✅ Implementado
- **persistFields**: ⚠️ Parcial
- **Estado**: PARCIAL

---

## Problemas Comunes Identificados

### 1. Falta de persistFields (CRÍTICO)
**Secciones**: 8, 9, 10, 11, 16, 19

**Síntoma**: Los datos se guardan en `ProjectStateFacade` pero NO se persisten en Redis.

**Solución**:
```typescript
// ❌ INCORRECTO
this.projectFacade.setField(this.seccionId, null, campo, valor);

// ✅ CORRECTO
this.projectFacade.setField(this.seccionId, null, campo, valor);
this.formChange.persistFields(this.seccionId, 'form', { [campo]: valor });
```

### 2. persist: false (PARCIAL)
**Secciones**: 13, 14

**Síntoma**: Los datos se actualizan en memoria pero no se guardan en Redis.

**Solución**:
```typescript
// ❌ INCORRECTO
formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { persist: false });

// ✅ CORRECTO
formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { notifySync: true });
```

### 3. Falta formDataSignal (LEGACY)
**Secciones**: 12 (Form), 18

**Síntoma**: El componente usa `this.datos` directamente en lugar de signals.

**Solución**: Implementar el patrón completo de UNICA_VERDAD como en Sección 7.

---

## Prioridades de Corrección

### PRIORIDAD 1 - CRÍTICO (Sin persistencia)
1. **Sección 8** - Actividades Económicas
2. **Sección 9** - Educación
3. **Sección 10** - Salud
4. **Sección 11** - Vivienda
5. **Sección 16** - Actividades Productivas
6. **Sección 19** - Religión

### PRIORIDAD 2 - PARCIAL (Persist: false)
1. **Sección 13** - Organizaciones
2. **Sección 14** - Infraestructura

### PRIORIDAD 3 - LEGACY (Sin signals)
1. **Sección 12** (Form)
2. **Sección 18**

---

## Recomendaciones

1. **Para secciones con persistFields faltante**: Agregar llamadas a `formChange.persistFields()` después de cada `projectFacade.setField()`

2. **Para secciones con persist: false**: Cambiar a `persist: true` o eliminar la opción (el valor por defecto es true)

3. **Para secciones legacy (12, 18)**: Implementar el patrón completo de signals como está documentado en Sección 7

4. **Verificación**: Después de cada corrección, probar:
   - Modificar un dato en el formulario
   - Recargar la página
   - Verificar que el datopersiste

---

## Referencias

- Documentación Sección 6 (Referencia): `DOCUMENTACION_UNICA_VERDAD_SECCION6.md`
- Documentación Sección 7 (Ejemplo corregido): `DOCUMENTACION_UNICA_VERDAD_SECCION7.md`
- Sección 7 Form: `src/app/shared/components/seccion7/seccion7-form.component.ts`
- Sección 7 View: `src/app/shared/components/seccion7/seccion7-view.component.ts`
