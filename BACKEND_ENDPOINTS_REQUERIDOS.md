# 🔌 Backend - Endpoints Requeridos para Documentador LBS

## 📋 Resumen de Requerimientos

Este documento detalla **TODOS** los endpoints que necesita el backend para soportar las **30 secciones** del sistema Documentador LBS. Están organizados por grupo (AISD y AISI) y por tipo de dato.

---

## ⚠️ CONVENCIONES IMPORTANTES

### Parámetros Base
- **`id_ubigeo`** o **`ubigeo`**: Código UBIGEO (para centros poblados o distritos)
  - Formato esperado: Cadena numérica (ej: `403060001`)
  - **Importante**: El frontend filtrará automáticamente por centros poblados ACTIVOS (Sección 4)

### Formato de Respuesta
Todas las respuestas deben seguir este formato:
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": [
    // array de objetos o un solo objeto
  ],
  "status_code": 200
}
```

### Manejo de NULL/Vacíos
- Los campos vacíos o no disponibles deben retornar `null` o no incluirse en la respuesta
- El frontend manejará los valores faltantes automáticamente

---

## 🔷 GRUPO AISD - Comunidades Campesinas (Secciones 4-20)

### 📌 SECCIÓN 4: Información Referencial AISD (A.X.1)

**Estado**: Datos generados en el frontend desde JSON (no requiere backend)

#### Cuadro 3.3: Población y Viviendas por Centro Poblado
| Campo | Descripción | Tipo |
|-------|-----------|------|
| `ubicacion` / `centro_poblado` | Nombre del CCPP | string |
| `poblacion` | Población total | integer |
| `viviendas_empadronadas` | Viviendas empadronadas | integer |
| `viviendas_ocupadas` | Viviendas ocupadas | integer |

**Notas**:
- ✅ Generado desde JSON cargado por usuario
- ✅ Datos manuales agregados en el formulario
- ❌ No requiere endpoint backend

---

### 📌 SECCIÓN 6: Aspectos Demográficos - Población por Sexo (A.1.2)

#### Endpoint: `/demograficos/datos`
- **Método**: GET
- **Parámetros**: 
  - `id_ubigeo` (opcional): Código UBIGEO específico
- **Descripción**: Obtiene datos demográficos de población

#### Datos Esperados
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": [
    {
      "id_ubigeo": "403060001",
      "poblacion_total": 160,
      "hombres": 78,
      "mujeres": 82,
      "menores_1": null,
      "de_1_a_14": null,
      "de_15_a_29": 25,
      "de_30_a_44": 31,
      "de_45_a_64": 38,
      "mayores_65": null
    }
  ],
  "status_code": 200
}
```

#### Tabla de Salida en Sección 6
| Sexo | Casos | Porcentaje |
|------|-------|-----------|
| Hombre | 305 | 50,0% |
| Mujer | 305 | 50,0% |
| **Total** | **610** | **100,0%** |

**Cálculos en Frontend**:
- Suma de todos los valores de `hombres` y `mujeres` para centros poblados ACTIVOS
- Porcentajes calculados: `(casos / total) * 100`

---

### 📌 SECCIÓN 7: Población en Edad de Trabajar (PET) (A.X.6)

#### Endpoint: `/aisd/pet`
- **Método**: GET
- **Parámetros**: 
  - `id_ubigeo` (opcional): Código UBIGEO específico
- **Descripción**: Obtiene población en edad de trabajar (15+ años)

#### Datos Esperados
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": [
    {
      "id_ubigeo": "403060001",
      "categoría": "PET",
      "casos": 120,
      "porcentaje": null
    },
    {
      "id_ubigeo": "403060001",
      "categoría": "PNEA",
      "casos": 40,
      "porcentaje": null
    }
  ],
  "status_code": 200
}
```

#### Tabla de Salida en Sección 7
| Categoría | Casos | Porcentaje |
|-----------|-------|-----------|
| PET | 120 | 75,0% |
| PNEA | 40 | 25,0% |
| **Total** | **160** | **100,0%** |

**Notas**:
- PET = Población en Edad de Trabajar (15+ años)
- PNEA = Población No Económicamente Activa
- Porcentajes calculados en frontend

---

### 📌 SECCIÓN 8: Actividades Económicas (A.X.10)

#### Endpoint: `/economicos/principales`
- **Método**: GET
- **Parámetros**: 
  - `id_ubigeo` (opcional): Código UBIGEO específico
- **Descripción**: Actividades económicas principales por ubicación

#### Datos Esperados
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": [
    {
      "id_ubigeo": "403060001",
      "actividad": "Agricultura",
      "casos": 85,
      "porcentaje": 45.5
    },
    {
      "id_ubigeo": "403060001",
      "actividad": "Ganadería",
      "casos": 65,
      "porcentaje": 34.9
    },
    {
      "id_ubigeo": "403060001",
      "actividad": "Comercio",
      "casos": 40,
      "porcentaje": 21.5
    }
  ],
  "status_code": 200
}
```

#### Tabla de Salida en Sección 8
| Actividad | Casos | Porcentaje |
|-----------|-------|-----------|
| Agricultura | 85 | 45,5% |
| Ganadería | 65 | 34,9% |
| Comercio | 40 | 21,5% |
| **Total** | **190** | **100,0%** |

**Notas**:
- Agregación de todos los centros poblados ACTIVOS
- Porcentajes pueden venir del backend o calcularse en frontend

---

### 📌 SECCIÓN 9: Viviendas (A.X.12)

#### Endpoint Existente: `/aisd/materiales-construccion`
- **Método**: GET
- **Parámetros**: 
  - `id_ubigeo` (opcional): Código UBIGEO específico
- **Descripción**: Materiales de construcción de viviendas

#### Datos Esperados
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": [
    {
      "id_ubigeo": "403060001",
      "categoria": "Paredes",
      "tipo_material": "Ladrillo",
      "casos": 45,
      "porcentaje": null
    },
    {
      "id_ubigeo": "403060001",
      "categoria": "Paredes",
      "tipo_material": "Adobe",
      "casos": 32,
      "porcentaje": null
    },
    {
      "id_ubigeo": "403060001",
      "categoria": "Techo",
      "tipo_material": "Concreto",
      "casos": 50,
      "porcentaje": null
    }
  ],
  "status_code": 200
}
```

#### Tabla de Salida en Sección 9
| Categoría | Material | Casos | Porcentaje |
|-----------|----------|-------|-----------|
| Paredes | Ladrillo | 45 | 58,4% |
| Paredes | Adobe | 32 | 41,6% |
| Techo | Concreto | 50 | 64,9% |

**Notas**:
- Porcentajes calculados por categoría en frontend
- Totales parciales por categoría

---

### 📌 SECCIÓN 10: Servicios Básicos (A.X.13)

#### Endpoint: `/servicios/basicos`
- **Método**: GET
- **Parámetros**: 
  - `id_ubigeo` (opcional): Código UBIGEO específico
- **Descripción**: Servicios básicos (agua, desagüe, electricidad)

#### Datos Esperados
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": [
    {
      "id_ubigeo": "403060001",
      "servicio": "Agua",
      "tipo": "De red pública",
      "casos": 68,
      "porcentaje": 68.0
    },
    {
      "id_ubigeo": "403060001",
      "servicio": "Agua",
      "tipo": "De pozo",
      "casos": 32,
      "porcentaje": 32.0
    },
    {
      "id_ubigeo": "403060001",
      "servicio": "Desagüe",
      "tipo": "De red pública",
      "casos": 45,
      "porcentaje": 45.0
    },
    {
      "id_ubigeo": "403060001",
      "servicio": "Desagüe",
      "tipo": "Letrina",
      "casos": 55,
      "porcentaje": 55.0
    },
    {
      "id_ubigeo": "403060001",
      "servicio": "Electricidad",
      "tipo": "Tiene",
      "casos": 72,
      "porcentaje": 72.0
    },
    {
      "id_ubigeo": "403060001",
      "servicio": "Electricidad",
      "tipo": "No tiene",
      "casos": 28,
      "porcentaje": 28.0
    }
  ],
  "status_code": 200
}
```

#### Tabla de Salida en Sección 10
| Servicio | Tipo | Casos | Porcentaje |
|----------|------|-------|-----------|
| Agua | De red pública | 68 | 68,0% |
| Agua | De pozo | 32 | 32,0% |
| Desagüe | De red pública | 45 | 45,0% |
| Desagüe | Letrina | 55 | 55,0% |
| Electricidad | Tiene | 72 | 72,0% |
| Electricidad | No tiene | 28 | 28,0% |

**Notas**:
- Porcentajes agregados por servicio
- Los porcentajes pueden venir del backend

---

### 📌 SECCIONES 11-20: Información Complementaria AISD

**Estado**: Estas secciones contienen **principalmente datos MANUALES**

| Sección | Tema | Tipo de Datos | Backend |
|---------|------|---------------|---------|
| 11 | Transporte y Vías | Manual | ❌ No |
| 12 | Telecomunicaciones | Manual | ❌ No |
| 13 | Salud e Indicadores | Manual + Estadísticas | ⚠️ Parcial |
| 14 | Educación | Manual + Estadísticas | ⚠️ Parcial |
| 15 | Lengua | Automático (Backend) | ✅ Sí |
| 16 | Religión | Automático (Backend) | ✅ Sí |
| 17 | Natalidad/Mortalidad | Manual | ❌ No |
| 18 | Morbilidad | Manual | ❌ No |
| 19 | NBI | Automático (Backend) | ✅ Sí |
| 20 | Otras Características | Manual | ❌ No |

#### Endpoint para Sección 15 - Lenguas: `/vistas/lenguas-ubicacion`
- **Método**: GET
- **Parámetros**: `id_ubigeo`
- **Datos Esperados**:
```json
{
  "success": true,
  "data": [
    {
      "id_ubigeo": "403060001",
      "idioma": "Quechua",
      "casos": 450,
      "porcentaje": 73.8
    },
    {
      "id_ubigeo": "403060001",
      "idioma": "Español",
      "casos": 160,
      "porcentaje": 26.2
    }
  ],
  "status_code": 200
}
```

#### Endpoint para Sección 16 - Religiones: `/vistas/religiones-ubicacion`
- **Método**: GET
- **Parámetros**: `id_ubigeo`
- **Datos Esperados**:
```json
{
  "success": true,
  "data": [
    {
      "id_ubigeo": "403060001",
      "religion": "Católica",
      "casos": 480,
      "porcentaje": 78.7
    },
    {
      "id_ubigeo": "403060001",
      "religion": "Evangélica",
      "casos": 130,
      "porcentaje": 21.3
    }
  ],
  "status_code": 200
}
```

#### Endpoint para Sección 19 - NBI (Necesidades Básicas Insatisfechas): `/vistas/nbi-ubicacion`
- **Método**: GET
- **Parámetros**: `id_ubigeo`
- **Datos Esperados**:
```json
{
  "success": true,
  "data": [
    {
      "id_ubigeo": "403060001",
      "necesidad": "Viviendas inadecuadas",
      "casos": 28,
      "porcentaje": 28.0
    },
    {
      "id_ubigeo": "403060001",
      "necesidad": "Hacinamiento",
      "casos": 42,
      "porcentaje": 42.0
    },
    {
      "id_ubigeo": "403060001",
      "necesidad": "Servicios básicos",
      "casos": 55,
      "porcentaje": 55.0
    }
  ],
  "status_code": 200
}
```

---

## 🔵 GRUPO AISI - Distritos (Secciones 21-30)

### 📌 SECCIÓN 21: Información Referencial AISI (B.X.1)

#### Endpoint: `/aisi/informacion-referencial`
- **Método**: GET
- **Parámetros**: `ubigeo` (Código UBIGEO del distrito)
- **Descripción**: Información referencial del distrito

#### Datos Esperados
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": {
    "ubigeo": "040306",
    "distrito": "Huancayo",
    "provincia": "Huancayo",
    "departamento": "Junín",
    "centro_poblado_capital": "Huancayo",
    "este": 512345,
    "norte": 8742156,
    "altitud": 3271,
    "poblacion_total": 12450
  },
  "status_code": 200
}
```

**Notas**:
- Los datos de ubicación vienen del JSON cargado inicialmente
- Este endpoint complementa con datos de censo

---

### 📌 SECCIÓN 22: Centros Poblados AISI (B.X.2)

#### Endpoint: `/aisi/centros-poblados`
- **Método**: GET
- **Parámetros**: `ubigeo` (Código UBIGEO del distrito)
- **Descripción**: Lista de centros poblados por distrito

#### Datos Esperados
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": [
    {
      "ubigeo": "040306",
      "codigo": "403060001",
      "centro_poblado": "Huancayo",
      "categoria": "Capital distrital",
      "poblacion": 5200,
      "viviendas_empadronadas": 1040,
      "viviendas_ocupadas": 980
    },
    {
      "ubigeo": "040306",
      "codigo": "403060002",
      "centro_poblado": "Anexo El Progreso",
      "categoria": "Anexo",
      "poblacion": 850,
      "viviendas_empadronadas": 170,
      "viviendas_ocupadas": 155
    }
  ],
  "status_code": 200
}
```

---

### 📌 SECCIÓN 23: Población por Sexo AISI (B.X.4)

#### Endpoint: Ya existe `/demograficos/datos`
- **Método**: GET
- **Parámetros**: `id_ubigeo` (Distrito)
- **Descripción**: Población agregada del distrito

#### Datos de Salida
| Sexo | Casos | Porcentaje |
|------|-------|-----------|
| Hombre | 6245 | 50,1% |
| Mujer | 6205 | 49,9% |
| **Total** | **12450** | **100,0%** |

**Notas**:
- Se agregan todos los centros poblados del distrito
- Porcentajes calculados en frontend

---

### 📌 SECCIÓN 24: Población por Grupo Etario AISI (B.X.5)

#### Endpoint: Ya existe `/demograficos/datos`
- **Método**: GET
- **Parámetros**: `id_ubigeo` (Distrito)
- **Descripción**: Población por grupos etarios del distrito

#### Datos de Salida
| Grupo Etario | Casos | Porcentaje |
|--------------|-------|-----------|
| Menores de 1 | 180 | 1,4% |
| 1-14 años | 2850 | 22,9% |
| 15-29 años | 3200 | 25,7% |
| 30-44 años | 2850 | 22,9% |
| 45-64 años | 2100 | 16,9% |
| 65+ años | 1270 | 10,2% |
| **Total** | **12450** | **100,0%** |

---

### 📌 SECCIÓN 25: PET AISI (B.X.6)

#### Endpoint: Ya existe `/aisd/pet`
- **Método**: GET
- **Parámetros**: `id_ubigeo` (Distrito)
- **Descripción**: Población en edad de trabajar (15+)

#### Datos de Salida
| Categoría | Casos | Porcentaje |
|-----------|-------|-----------|
| PET | 9350 | 75,0% |
| PNEA | 3100 | 25,0% |
| **Total** | **12450** | **100,0%** |

---

### 📌 SECCIÓN 26: PEA Distrital AISI (B.X.7)

#### Endpoint: `/aisi/pea-distrital`
- **Método**: GET
- **Parámetros**: `ubigeo` (Distrito)
- **Descripción**: Población Económicamente Activa a nivel distrital

#### Datos Esperados
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": {
    "ubigeo": "040306",
    "pea_total": 5680,
    "pea_hombres": 3200,
    "pea_mujeres": 2480,
    "pea_ocupada": 5100,
    "pea_desocupada": 580,
    "tasa_ocupacion": 89.8,
    "tasa_desocupacion": 10.2
  },
  "status_code": 200
}
```

#### Tabla de Salida en Sección 26
| Indicador | Hombres | Mujeres | Total | % |
|-----------|---------|---------|-------|---|
| Ocupada | 1870 | 1430 | 3300 | 58,1% |
| Desocupada | 320 | 260 | 580 | 10,2% |
| **Total PEA** | **3200** | **2480** | **5680** | **100,0%** |

---

### 📌 SECCIÓN 27: Actividades Económicas AISI (B.X.8)

#### Endpoint: Ya existe `/economicos/principales`
- **Método**: GET
- **Parámetros**: `id_ubigeo` (Distrito)
- **Descripción**: Actividades económicas principales a nivel distrital

#### Datos de Salida
| Actividad | Casos | Porcentaje |
|-----------|-------|-----------|
| Agricultura | 2100 | 37,0% |
| Industria textil | 1200 | 21,1% |
| Comercio | 950 | 16,7% |
| Servicios | 850 | 15,0% |
| Construcción | 580 | 10,2% |

**Notas**:
- Agregación de todas las actividades del distrito
- Porcentajes pueden venir del backend

---

### 📌 SECCIÓN 28: Viviendas AISI (B.X.9)

#### Endpoint: `/aisi/viviendas-censo`
- **Método**: GET
- **Parámetros**: `ubigeo` (Distrito)
- **Descripción**: Datos de viviendas del censo a nivel distrital

#### Datos Esperados
```json
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": {
    "ubigeo": "040306",
    "viviendas_empadronadas": 2345,
    "viviendas_ocupadas": 2100,
    "viviendas_desocupadas": 245,
    "porcentaje_ocupacion": 89.6
  },
  "status_code": 200
}
```

#### Tabla de Salida en Sección 28
| Tipo | Cantidad | Porcentaje |
|------|----------|-----------|
| Ocupadas | 2100 | 89,6% |
| Desocupadas | 245 | 10,4% |
| **Total** | **2345** | **100,0%** |

**Notas**:
- Datos agregados a nivel de distrito
- Porcentajes pueden calcularse en frontend

---

### 📌 SECCIÓN 29: Servicios Básicos AISI (B.X.10)

#### Endpoint: Ya existe `/servicios/basicos`
- **Método**: GET
- **Parámetros**: `id_ubigeo` (Distrito)
- **Descripción**: Servicios básicos a nivel distrital

#### Datos de Salida
| Servicio | Tipo | Casos | Porcentaje |
|----------|------|-------|-----------|
| Agua | De red pública | 1680 | 80,0% |
| Agua | De pozo | 420 | 20,0% |
| Desagüe | De red pública | 1470 | 70,0% |
| Desagüe | Letrina | 630 | 30,0% |
| Electricidad | Tiene | 1890 | 90,0% |
| Electricidad | No tiene | 210 | 10,0% |

---

### 📌 SECCIÓN 30: Información Complementaria AISI

| Tema | Fuente | Estado |
|------|--------|--------|
| Lenguas | `/vistas/lenguas-ubicacion` | ✅ Existente |
| Religiones | `/vistas/religiones-ubicacion` | ✅ Existente |
| NBI | `/vistas/nbi-ubicacion` | ✅ Existente |

---

## 📊 RESUMEN DE ENDPOINTS POR IMPLEMENTAR

### Endpoints Existentes (Ya Implementados ✅)
```
✅ GET /demograficos/datos
✅ GET /demograficos/piramide
✅ GET /servicios/basicos
✅ GET /economicos/actividades
✅ GET /economicos/principales
✅ GET /educacion/niveles
✅ GET /educacion/por-ubicacion
✅ GET /vistas/lenguas-ubicacion
✅ GET /vistas/religiones-ubicacion
✅ GET /vistas/viviendas-ubicacion
✅ GET /vistas/energia-cocina-ubicacion
✅ GET /vistas/nbi-ubicacion
✅ GET /aisd/informacion-referencial
✅ GET /aisd/centros-poblados
✅ GET /aisd/poblacion-sexo
✅ GET /aisd/poblacion-etario
✅ GET /aisd/pet
✅ GET /aisd/materiales-construccion
✅ GET /aisi/informacion-referencial
✅ GET /aisi/centros-poblados
✅ GET /aisi/pea-distrital
✅ GET /aisi/viviendas-censo
```

### Endpoints a Verificar/Completar ⚠️
```
⚠️ GET /demograficos/datos - Verificar que retorna TODOS los campos esperados
⚠️ GET /servicios/basicos - Verificar estructura de respuesta con porcentajes
⚠️ GET /aisi/pea-distrital - Verificar que incluye desagregación por sexo
⚠️ GET /aisi/viviendas-censo - Verificar que incluye porcentaje de ocupación
```

### Endpoints No Encontrados (Necesitan Ser Creados) ❌
```
❌ Ninguno adicional requerido en este momento
```

**Nota**: Los endpoints están implementados pero es importante verificar que:
1. Retornan el formato JSON correcto
2. Incluyen todos los campos esperados
3. Manejan correctamente los parámetros `id_ubigeo` / `ubigeo`
4. Retornan `null` para valores faltantes

---

## 🔄 FLUJO DE DATOS POR SECCIÓN

### AISD (Comunidades Campesinas)

```
JSON Inicial
  ↓
Sección 2: Selecciona CCPP iniciales
  ↓
Sección 4: Confirma CCPP activos (CUADRO 3.3)
  ↓
Secciones 6-10: Consultan /demograficos/datos + /servicios/basicos
  ↓
  ├─ Sección 6: Población por Sexo
  ├─ Sección 7: PET
  ├─ Sección 8: Actividades Económicas
  ├─ Sección 9: Viviendas (Materiales)
  └─ Sección 10: Servicios Básicos
  
Secciones 11-20: Datos manuales + endpoints específicos
  ├─ Sección 15: /vistas/lenguas-ubicacion
  ├─ Sección 16: /vistas/religiones-ubicacion
  └─ Sección 19: /vistas/nbi-ubicacion
```

### AISI (Distritos)

```
JSON Inicial (UBIGEO de distrito)
  ↓
Sección 21: /aisi/informacion-referencial
  ↓
Sección 22: /aisi/centros-poblados
  ↓
Secciones 23-27: Consultan endpoints agregados a nivel distrital
  ├─ Sección 23: Población por Sexo
  ├─ Sección 24: Población por Grupo Etario
  ├─ Sección 25: PET
  ├─ Sección 26: /aisi/pea-distrital
  └─ Sección 27: Actividades Económicas
  
Secciones 28-30: Endpoints distrital + manuales
  ├─ Sección 28: /aisi/viviendas-censo
  ├─ Sección 29: /servicios/basicos (nivel distrital)
  └─ Sección 30: Endpoints de vistas + manual
```

---

## 📝 GUÍA DE IMPLEMENTACIÓN BACKEND

### Consideraciones Clave

1. **Parámetros Opcionales**
   - Todos los parámetros de ubicación deben ser opcionales
   - Si no se proporciona parámetro, retornar datos agregados o todos

2. **Formato de Respuesta Consistente**
   - Usar siempre el formato establecido con `success`, `message`, `data`, `status_code`
   - Mantener consistencia en nombres de campos (snake_case)

3. **Manejo de Nulos**
   - Valores no disponibles: retornar `null`
   - Campos opcionales pueden omitirse
   - El frontend manejará la presentación

4. **Agregaciones**
   - Cuando se consulta sin parámetro específico, agregar todos los registros
   - Usar `SUM()` para valores numéricos
   - Usar funciones apropiadas para porcentajes

5. **Caché**
   - Implementar caché de 1 hora para datos que no cambian frecuentemente
   - Los datos de censo (2017) no cambian → cachear
   - Datos de trabajo de campo → actualizables sin caché

6. **Validación**
   - Validar formato de UBIGEO (6 dígitos para distrito, 9 para centro poblado)
   - Retornar error 400 si parámetros inválidos
   - Retornar 404 si no hay datos

---

## 🧪 TESTING DEL BACKEND

### Prueba Mínima para Cada Endpoint

```bash
# Ejemplo: Obtener datos demográficos de un CCPP
GET /demograficos/datos?id_ubigeo=403060001

# Esperado:
{
  "success": true,
  "message": "Datos obtenidos correctamente",
  "data": [
    {
      "id_ubigeo": "403060001",
      "poblacion_total": 160,
      "hombres": 78,
      "mujeres": 82,
      ...
    }
  ],
  "status_code": 200
}
```

### Casos de Prueba por Endpoint

Para cada endpoint implementar pruebas para:
1. ✅ Con parámetro específico (CCPP exacto)
2. ✅ Sin parámetro (todos los CCPP agregados)
3. ✅ Con parámetro inválido (retorna 400)
4. ✅ UBIGEO no encontrado (retorna 404 o array vacío)
5. ✅ Formato de respuesta correcto
6. ✅ Campos requeridos presentes
7. ✅ Tipos de dato correctos

---

## 📞 SOPORTE Y CONTACTO

**Para consultas sobre:**
- Estructura de datos: Ver `DATOS_SECCIONES.md`
- Conexión frontend-formulario: Ver `CONEXION_SECCION_FORMULARIO.md`
- Tablas dinámicas: Ver `RECETA_TABLAS_DINAMICAS.md`
- Flujo completo: Ver `README_FLUJO_DATOS.md`

---

## 📅 Versión y Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 17-01-2026 | Creación del documento con especificación completa |

---

**DOCUMENTO DE REFERENCIA**  
**Documentador LBS - Backend Endpoints**  
**Última actualización**: 17 de enero de 2026
