# 📊 Documentación de Datos por Sección

Este documento registra los datos obtenidos, calculados y manuales para cada sección del proyecto.

---

## 📋 Sección 6: Aspectos Demográficos (A.1.2)

### 🎯 Descripción
Sección que muestra la población según sexo y grupo etario para las Comunidades Campesinas (AISD).

### 📥 Datos del Backend (Resaltado Lila)

#### Endpoint Utilizado
- **URL**: `/demograficos/datos`
- **Método**: `GET`
- **Parámetros**: `id_ubigeo` (código UBIGEO del centro poblado)

#### Cómo se Obtienen los Datos
1. Se obtienen los **códigos UBIGEO activos** de la Sección 4 (Cuadro 3.3)
2. Para cada código UBIGEO activo se hace una petición HTTP GET al endpoint `/demograficos/datos`
3. El backend devuelve un objeto con números absolutos para cada código UBIGEO
4. Los datos de todos los códigos UBIGEO se **agregan** (suman) en un solo objeto

#### Datos Obtenidos del Backend
El backend devuelve **únicamente números absolutos** (sin porcentajes). Para cada código UBIGEO:

```json
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
```

#### Proceso de Agregación
Después de obtener los datos de cada código UBIGEO, se suman todos los valores:

- `hombres` = suma de todos los `hombres` de cada código UBIGEO
- `mujeres` = suma de todas las `mujeres` de cada código UBIGEO
- `de_1_a_14` = suma de todos los `de_1_a_14` de cada código UBIGEO
- `de_15_a_29` = suma de todos los `de_15_a_29` de cada código UBIGEO
- `de_30_a_44` = suma de todos los `de_30_a_44` de cada código UBIGEO
- `de_45_a_64` = suma de todos los `de_45_a_64` de cada código UBIGEO
- `mayores_65` = suma de todos los `mayores_65` de cada código UBIGEO

**Ejemplo de agregación:**
- Código 403060001: `hombres: 78, mujeres: 82`
- Código 403060002: `hombres: 33, mujeres: 19`
- Código 403060003: `hombres: 50, mujeres: 45`
- ... (otros 12 códigos)
- **Resultado agregado**: `hombres: 305, mujeres: 305`

#### Transformación de Datos
Los números absolutos agregados se transforman al formato de tabla:

**Población por Sexo:**
- Se crean dos objetos con `sexo` (texto generado en frontend) y `casos` (del backend)
- Los porcentajes se calculan después (ver sección "Datos Calculados")

**Población por Grupo Etario:**
- Se crean objetos con `categoria` (texto generado en frontend) y `casos` (del backend)
- Los porcentajes se calculan después (ver sección "Datos Calculados")

### 🟢 Datos Calculados en el Frontend (Resaltado Verde)

#### Porcentajes
Todos los porcentajes se calculan dinámicamente en el frontend usando la fórmula:

```typescript
porcentaje = (valor / total) * 100
```

**Ejemplos:**
- `porcentajeHombres = (hombres / (hombres + mujeres)) * 100`
- `porcentajeGrupoEtario = (casosGrupo / totalGruposEtarios) * 100`

**Ubicación del cálculo:**
- `field-mapping.service.ts` líneas 424-425 (población por sexo)
- `field-mapping.service.ts` línea 461 (población por grupo etario)

#### Totales
- **Total Población por Sexo**: Suma de `hombres + mujeres`
- **Total Población por Grupo Etario**: Suma de todos los grupos etarios

### 📝 Datos Manuales (Resaltado Amarillo)

Los siguientes campos requieren entrada manual del usuario:
- `textoPoblacionSexoAISD`: Texto descriptivo sobre población por sexo (opcional, tiene texto por defecto)
- `textoPoblacionEtarioAISD`: Texto descriptivo sobre población por grupo etario (opcional, tiene texto por defecto)
- Fotografías de aspectos demográficos (opcional)

### 🔵 Datos de Otras Secciones (Resaltado Azul)

- `grupoAISD`: Nombre de la Comunidad Campesina (obtenido de otras secciones)
- `tablaAISD2TotalPoblacion`: Total de población (obtenido de la Sección 4)

### 🔑 Dependencias

#### Códigos UBIGEO Activos
Los datos se obtienen basándose en los **códigos UBIGEO activos** definidos en:
- **Sección 4** (Cuadro 3.3: "Cantidad total de población y viviendas")
- Este cuadro es la **fuente de verdad** para determinar qué centros poblados se incluyen en los cálculos AISD

#### Servicios Utilizados
- `FieldMappingService`: Mapea campos a endpoints del backend
- `SectionDataLoaderService`: Carga datos de secciones
- `CentrosPobladosActivosService`: Gestiona códigos UBIGEO activos
- `UbigeoHelperService`: Obtiene códigos UBIGEO para consultas

### 📊 Estructura de Datos Guardados

Los datos se guardan con prefijo según el grupo AISD:
- `poblacionSexoAISD_A1`: Para Comunidad Campesina A1
- `poblacionSexoAISD_A2`: Para Comunidad Campesina A2
- `poblacionEtarioAISD_A1`: Para Comunidad Campesina A1
- `poblacionEtarioAISD_A2`: Para Comunidad Campesina A2

### ⚠️ Notas Importantes

1. **Códigos Activos**: Si no hay códigos UBIGEO activos en la Sección 4, no se pueden cargar datos
2. **Valores Null**: Algunos grupos etarios pueden venir como `null` del backend, se convierten a `0`
3. **Agregación**: Los datos de múltiples centros poblados se suman antes de calcular porcentajes
4. **Recálculo**: Si el usuario modifica los números manualmente, los porcentajes se recalculan automáticamente

---

## 📋 Próximas Secciones

_(Se irán agregando conforme se completen)_

---
