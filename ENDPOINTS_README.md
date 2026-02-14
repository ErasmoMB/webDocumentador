# API Endpoints - Backend LBS

Documentación completa de todos los endpoints disponibles en el backend del Sistema de Información de Demográficos.

---

## 📋 Tabla de Contenidos

1. [Demográficos](#demográficos)
2. [Centros Poblados](#centros-poblados)
3. [Ubicaciones](#ubicaciones)
4. [Educación](#educación)
5. [Vistas Agregadas](#vistas-agregadas)
6. [Servicios Básicos](#servicios-básicos)
7. [Económicos](#económicos)
8. [AISD](#aisd)
9. [AISI](#aisi)
10. [Salud](#salud)
11. [Imágenes](#imágenes)

---

## 🏘️ Demográficos

### Endpoints POST - Datos Básicos

Todos estos endpoints requieren un body con formato:
```json
{
  "codigos": ["string"]
}
```

| Endpoint | Descripción |
|----------|-------------|
| `POST /demograficos/datos` | Datos demográficos generales |
| `POST /demograficos/pet-grupo` | Población económicamente activa por grupo |
| `POST /demograficos/pea` | Población económicamente activa |
| `POST /demograficos/pea-ocupada-desocupada` | PEA con estado ocupada/desocupada |
| `POST /demograficos/etario` | Distribución etaria de la población |
| `POST /demograficos/condicion-ocupacion` | Condición de ocupación |
| `POST /demograficos/materiales-construccion` | Materiales de construcción de viviendas |
| `POST /demograficos/saneamiento` | Tipos de saneamiento |
| `POST /demograficos/alumbrado` | Tipos de alumbrado |
| `POST /demograficos/seguro-salud` | Cobertura de seguro de salud |
| `POST /demograficos/educacion` | Datos educativos |
| `POST /demograficos/alfabetizacion` | Tasas de alfabetización |
| `POST /demograficos/idh` | Índice de Desarrollo Humano |
| `POST /demograficos/nbi` | Necesidades Básicas Insatisfechas |
| `POST /demograficos/actividad-economica` | Actividades económicas principales |
| `POST /demograficos/tipo-vivienda` | Tipos de vivienda |
| `POST /demograficos/lengua` | Idiomas/lenguas habladas |
| `POST /demograficos/abastecimiento-agua` | Fuentes de abastecimiento de agua |

### Endpoints POST - Datos por Centro Poblado (CPP)

| Endpoint | Descripción |
|----------|-------------|
| `POST /demograficos/condicion-ocupacion-cpp` | Condición de ocupación por CPP |
| `POST /demograficos/materiales-por-cpp` | Materiales de construcción por CPP |
| `POST /demograficos/abastecimiento-agua-por-cpp` | Abastecimiento de agua por CPP |
| `POST /demograficos/saneamiento-por-cpp` | Saneamiento por CPP |
| `POST /demograficos/alumbrado-por-cpp` | Alumbrado por CPP |
| `POST /demograficos/combustibles-cocina-por-cpp` | Combustibles para cocina por CPP |
| `POST /demograficos/seguro-salud-por-cpp` | Seguro de salud por CPP |
| `POST /demograficos/religion-por-cpp` | Religión por CPP |

---

## 🏢 Centros Poblados

### Endpoints POST

| Endpoint | Método | Body | Descripción |
|----------|--------|------|-------------|
| `POST /centros-poblados/por-codigos-ubigeo` | POST | `{ "codigos": ["string"] }` | Obtener centros poblados por códigos UBIGEO |

---

## 📍 Ubicaciones

### Endpoints GET

| Endpoint | Descripción |
|----------|-------------|
| `GET /ubicaciones/centros-poblados` | Lista de todos los centros poblados |
| `GET /ubicaciones/provincias` | Lista de provincias |
| `GET /ubicaciones/distritos` | Lista de distritos |
| `GET /ubicaciones/departamentos` | Lista de departamentos |
| `GET /ubicaciones/resumen/{idUbigeo}` | Resumen de ubicación específica |
| `GET /ubicaciones/ubicaciones` | Ubicaciones con datos demográficos |

---

## 🎓 Educación

### Endpoints GET

| Endpoint | Descripción |
|----------|-------------|
| `GET /educacion/por-ubicacion` | Datos educativos por ubicación |
| `GET /educacion/niveles` | Niveles educativos disponibles |
| `GET /educacion/tasa-analfabetismo` | Tasas de analfabetismo por ubicación |
| `GET /educacion/principales` | Datos educativos principales |

---

## 📊 Vistas Agregadas

### Endpoints GET

Estos endpoints devuelven datos preagregados desde vistas de base de datos.

| Endpoint | Descripción |
|----------|-------------|
| `GET /vistas/lenguas` | Resumen de lenguas habladas |
| `GET /vistas/lenguas-ubicacion` | Lenguas por ubicación |
| `GET /vistas/religiones` | Resumen de religiones |
| `GET /vistas/religiones-ubicacion` | Religiones por ubicación |
| `GET /vistas/viviendas` | Resumen de tipos de vivienda |
| `GET /vistas/viviendas-ubicacion` | Viviendas por ubicación |
| `GET /vistas/energia-cocina` | Resumen de energía para cocina |
| `GET /vistas/energia-cocina-ubicacion` | Energía para cocina por ubicación |
| `GET /vistas/nbi` | Necesidades Básicas Insatisfechas |
| `GET /vistas/nbi-ubicacion` | NBI por ubicación |

---

## 🚰 Servicios Básicos

### Endpoints GET

| Endpoint | Descripción |
|----------|-------------|
| `GET /servicios/basicos` | Servicios básicos disponibles |
| `GET /servicios/resumen` | Resumen general de servicios |

### Endpoints POST

| Endpoint | Body | Descripción |
|----------|------|-------------|
| `POST /servicios/por-codigos` | `{ "codigos": ["string"] }` | Servicios por códigos específicos |

---

## 💼 Económicos

### Endpoints GET

| Endpoint | Descripción |
|----------|-------------|
| `GET /economicos/actividades` | Listado de actividades económicas |
| `GET /economicos/principales` | Actividades económicas principales |

---

## 🏛️ AISD (Análisis Integral a nivel de Sectores Decentralizados)

### Endpoints GET

| Endpoint | Descripción |
|----------|-------------|
| `GET /aisd/informacion-referencial` | Información referencial AISD |
| `GET /aisd/pet` | Población Económicamente Activa AISD |
| `GET /aisd/materiales-construccion` | Materiales de construcción AISD |

### Endpoints POST

| Endpoint | Body | Descripción |
|----------|------|-------------|
| `POST /pea/actividades-ocupadas` | `{ "codigos": ["string"] }` | PEA por actividades ocupadas |

---

## 🏘️ AISI (Análisis Integral de Sectores Integrados)

### Endpoints GET

| Endpoint | Descripción |
|----------|-------------|
| `GET /aisi/informacion-referencial` | Información referencial AISI |
| `GET /aisi/centros-poblados` | Centros poblados AISI |
| `GET /aisi/pea-distrital` | PEA a nivel distrital |
| `GET /aisi/viviendas-censo` | Viviendas del censo AISI |

---

## ⚕️ Salud

### Endpoints GET

| Endpoint | Descripción |
|----------|-------------|
| `GET /salud/seguro-salud` | Cobertura de seguro de salud |

### Endpoints POST

| Endpoint | Body | Descripción |
|----------|------|-------------|
| `POST /salud/seguro-salud/por-codigos` | `{ "codigos": ["string"] }` | Seguro de salud por códigos |

---

## 🖼️ Imágenes

### Endpoints POST

| Endpoint | Body | Descripción |
|----------|------|-------------|
| `POST /imagenes/upload` | FormData | Subir nueva imagen |

### Endpoints GET

| Endpoint | Descripción |
|----------|-------------|
| `GET /imagenes/{imageId}` | Obtener imagen específica |
| `GET /imagenes/formulario/{formularioId}` | Obtener imágenes de un formulario |

### Endpoints DELETE

| Endpoint | Descripción |
|----------|-------------|
| `DELETE /imagenes/{imageId}` | Eliminar imagen específica |
| `DELETE /imagenes/formulario/{formularioId}` | Eliminar todas las imágenes de un formulario |

---

## 📌 Notas Importantes

### Parámetros Comunes

- **codigos**: Array de strings con códigos UBIGEO o identificadores específicos
- **idUbigeo**: Identificador de ubicación geográfica
- **imageId**: Identificador único de imagen
- **formularioId**: Identificador único de formulario

### Formato de Respuesta

Todas las respuestas siguen el patrón:
```json
{
  "data": {},
  "message": "string",
  "status": "success|error"
}
```

### Headers Requeridos

```
Content-Type: application/json
Authorization: Bearer {token} (si es requerido)
```

---

## 🔗 Base URL

```
http://localhost:3000/api
```

---

**Última actualización:** 13 de febrero de 2026
