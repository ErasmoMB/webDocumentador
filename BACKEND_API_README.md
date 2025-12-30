# Documentación de API Backend - FastAPI

## Información General

**Base URL:** `http://localhost:8000/api/v1`

**Framework:**** FastAPI  
**Servidor:** Uvicorn

---

## Endpoints Disponibles

### 1. Población

#### 1.1. Obtener Población por Códigos de Centro Poblado

**Endpoint:** `GET /api/v1/poblacion/`

**Descripción:** Obtiene datos agregados de población para uno o más centros poblados especificados por sus códigos CPP.

**Parámetros:**

| Nombre | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| `cpp` | string | Sí | Códigos de centro poblado separados por coma |

**Ejemplo de Request:**
```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/poblacion/?cpp=101010001%2C101010002' \
  -H 'accept: application/json'
```

**Ejemplo de Response (200 OK):**
```json
{
  "success": true,
  "message": "Datos de población obtenidos correctamente",
  "data": {
    "poblacion": {
      "total_varones": 15160,
      "total_mujeres": 16907,
      "total_poblacion": 32067,
      "porcentaje_varones": "47.28%",
      "porcentaje_mujeres": "52.72%",
      "edad_0_14": 7913,
      "edad_15_29": 9237,
      "edad_30_44": 6874,
      "edad_45_64": 5455,
      "edad_65_mas": 2588
    }
  },
  "status_code": 200
}
```

**Estructura de Datos:**
- `total_varones`: Número total de varones
- `total_mujeres`: Número total de mujeres
- `total_poblacion`: Población total
- `porcentaje_varones`: Porcentaje de varones (formato string con %)
- `porcentaje_mujeres`: Porcentaje de mujeres (formato string con %)
- `edad_0_14`: Población de 0 a 14 años
- `edad_15_29`: Población de 15 a 29 años
- `edad_30_44`: Población de 30 a 44 años
- `edad_45_64`: Población de 45 a 64 años
- `edad_65_mas`: Población de 65 años o más

---

#### 1.2. Obtener Población por Distrito

**Endpoint:** `GET /api/v1/poblacion/distrito`

**Descripción:** Obtiene datos de población para todos los centros poblados de un distrito específico.

**Parámetros:**

| Nombre | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| `distrito` | string | Sí | Nombre del distrito |

**Ejemplo de Request:**
```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/poblacion/distrito?distrito=CHACHAPOYAS' \
  -H 'accept: application/json'
```

**Ejemplo de Response (200 OK):**
```json
{
  "success": true,
  "message": "Datos de población para CHACHAPOYAS obtenidos correctamente",
  "data": [
    {
      "cpp": "101010001",
      "centro_poblado": "CHACHAPOYAS",
      "departamento": "AMAZONAS",
      "provincia": "CHACHAPOYAS",
      "distrito": "CHACHAPOYAS",
      "total": 32026,
      "hombres": 15131,
      "mujeres": 16895
    },
    {
      "cpp": "101010002",
      "centro_poblado": "CACLIC",
      "departamento": "AMAZONAS",
      "provincia": "CHACHAPOYAS",
      "distrito": "CHACHAPOYAS",
      "total": 41,
      "hombres": 29,
      "mujeres": 12
    }
  ],
  "status_code": 200
}
```

**Estructura de Datos (Array):**
Cada elemento del array contiene:
- `cpp`: Código del centro poblado
- `centro_poblado`: Nombre del centro poblado
- `departamento`: Nombre del departamento
- `provincia`: Nombre de la provincia
- `distrito`: Nombre del distrito
- `total`: Población total
- `hombres`: Número de hombres
- `mujeres`: Número de mujeres

---

#### 1.3. Obtener Población por Provincia

**Endpoint:** `GET /api/v1/poblacion/provincia`

**Descripción:** Obtiene datos de población para todos los centros poblados de una provincia específica.

**Parámetros:**

| Nombre | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| `provincia` | string | Sí | Nombre de la provincia |

**Ejemplo de Request:**
```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/poblacion/provincia?provincia=CHACHAPOYAS' \
  -H 'accept: application/json'
```

**Ejemplo de Response (200 OK):**
```json
{
  "success": true,
  "message": "Datos de población para CHACHAPOYAS obtenidos correctamente",
  "data": [
    {
      "cpp": "101010001",
      "centro_poblado": "CHACHAPOYAS",
      "departamento": "AMAZONAS",
      "provincia": "CHACHAPOYAS",
      "distrito": "CHACHAPOYAS",
      "total": 32026,
      "hombres": 15131,
      "mujeres": 16895
    }
  ],
  "status_code": 200
}
```

**Estructura de Datos:**
Idéntica a la del endpoint por distrito. Retorna un array con todos los centros poblados de la provincia especificada.

---

### 2. Censo

#### 2.1. Obtener PEA/No PEA por Distrito

**Endpoint:** `GET /api/v1/censo/pea-nopea`

**Descripción:** Obtiene datos de Población Económicamente Activa (PEA) y No PEA para un distrito específico.

**Parámetros:**

| Nombre | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| `distrito` | string | Sí | Nombre del distrito |

**Ejemplo de Request:**
```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/censo/pea-nopea?distrito=CHACHAPOYAS' \
  -H 'accept: application/json'
```

**Ejemplo de Response (200 OK):**
```json
{
  "success": true,
  "message": "Datos PEA/No PEA para CHACHAPOYAS obtenidos correctamente",
  "data": {
    "pea": 14934,
    "no_pea": 10215,
    "porcentaje_pea": "59.38%",
    "porcentaje_no_pea": "40.62%",
    "ocupada": 14394,
    "desocupada": 540,
    "porcentaje_ocupada": "96.38%",
    "porcentaje_desocupada": "3.62%"
  },
  "status_code": 200
}
```

**Estructura de Datos:**
- `pea`: Población Económicamente Activa (número)
- `no_pea`: Población No Económicamente Activa (número)
- `porcentaje_pea`: Porcentaje de PEA (formato string con %)
- `porcentaje_no_pea`: Porcentaje de No PEA (formato string con %)
- `ocupada`: Población ocupada (número)
- `desocupada`: Población desocupada (número)
- `porcentaje_ocupada`: Porcentaje de población ocupada (formato string con %)
- `porcentaje_desocupada`: Porcentaje de población desocupada (formato string con %)

---

## Estructura General de Respuestas

Todas las respuestas exitosas siguen el siguiente formato:

```json
{
  "success": true,
  "message": "Mensaje descriptivo de la operación",
  "data": { /* Datos específicos del endpoint */ },
  "status_code": 200
}
```

### Campos Comunes:
- `success`: Boolean que indica si la operación fue exitosa
- `message`: Mensaje descriptivo del resultado
- `data`: Objeto o array con los datos solicitados
- `status_code`: Código HTTP de la respuesta

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 422 | Validation Error - Error de validación en los parámetros |

### Ejemplo de Error (422):

```json
{
  "detail": [
    {
      "loc": ["string", 0],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

---

## Notas de Uso

1. **Formato de Códigos CPP:** Los códigos de centro poblado deben estar separados por comas sin espacios.
   - ✅ Correcto: `101010001,101010002`
   - ❌ Incorrecto: `101010001, 101010002`

2. **Nombres de Ubicación:** Los nombres de distrito y provincia deben coincidir exactamente con los nombres en la base de datos (mayúsculas/minúsculas).

3. **Headers Requeridos:** Todas las peticiones deben incluir el header:
   ```
   Accept: application/json
   ```

4. **URL Encoding:** Al usar curl o herramientas similares, los parámetros deben estar correctamente codificados (URL encoding).

---

## Integración con Frontend Angular

Para integrar estos endpoints en el proyecto Angular, se recomienda:

1. **Actualizar la URL base del API** en `src/assets/env.js`:
   ```javascript
   API_URL: 'http://localhost:8000/api/v1'
   ```

2. **Usar los servicios existentes:**
   - `ConfigService`: Para obtener la URL base del API
   - `DataService`: Para centralizar las llamadas HTTP
   - `HttpClient`: Para realizar las peticiones

3. **Ejemplo de implementación en DataService:**
   ```typescript
   getPoblacionByCpp(cpp: string[]): Observable<any> {
     if (this.configService.isMockMode()) {
       return this.getSharedData('poblacion');
     }
     const params = new HttpParams().set('cpp', cpp.join(','));
     return this.http.get(`${this.configService.getApiUrl()}/poblacion/`, { params });
   }
   ```

---

## Ejemplos de Uso

### Obtener población de múltiples centros poblados:
```bash
GET http://localhost:8000/api/v1/poblacion/?cpp=101010001,101010002,101010003
```

### Obtener todos los centros poblados de un distrito:
```bash
GET http://localhost:8000/api/v1/poblacion/distrito?distrito=CHACHAPOYAS
```

### Obtener datos de PEA de un distrito:
```bash
GET http://localhost:8000/api/v1/censo/pea-nopea?distrito=CHACHAPOYAS
```

---

## Contacto y Soporte

Para más información sobre el backend, consultar la documentación de FastAPI en:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

