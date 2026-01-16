# 📋 README - FLUJO DE DATOS DEL DOCUMENTADOR LBS

## 🎯 PROPÓSITO
Este documento explica qué datos se llenan automáticamente, de dónde provienen, y qué campos debes ingresar manualmente.

---

## 🎨 SISTEMA DE COLORES (Resaltado)

| Color | Clase CSS | Significado |
|-------|-----------|-------------|
| 🟣 **Lila/Morado** | `.data-backend` | Dato que viene directamente del backend (API/BD) |
| 🟢 **Verde** | `.data-calculated` | Dato calculado automáticamente (ej: porcentajes) |
| 🟡 **Amarillo** | `.data-manual` | Dato que debes ingresar manualmente |
| 🔵 **Cyan** | `.data-section` | Dato que viene de otra sección |

---

## 📊 FUENTES DE DATOS

### 1️⃣ Archivo JSON (Cargado por el usuario)
El archivo JSON contiene información de centros poblados:
- `UBIGEO`: Código de ubicación geográfica
- `CODIGO`: Código del centro poblado
- `CCPP`: Nombre del centro poblado
- `CATEGORIA`: Tipo (Capital distrital, Anexo, Caserío, etc.)
- `POBLACION`: Número de habitantes
- `DPTO`, `PROV`, `DIST`: Departamento, provincia, distrito
- `ESTE`, `NORTE`: Coordenadas UTM
- `ALTITUD`: Altitud en m.s.n.m.

### 2️⃣ Backend API (Datos del Censo 2017)
El backend proporciona:
- **Demografía**: Población por sexo, grupos etarios
- **Servicios Básicos**: Agua, desagüe, electricidad (con porcentajes)
- **Vivienda**: Materiales de construcción
- **Economía**: Actividades económicas principales
- **Educación**: Niveles educativos
- **Otros**: Lenguas, religiones, NBI

### 3️⃣ Cálculos Automáticos (Frontend)
Se calculan automáticamente:
- Porcentajes de todas las tablas demográficas
- Totales de población agregados
- Porcentajes de grupos etarios
- Porcentajes de PET

---

## 📖 FLUJO SECCIÓN POR SECCIÓN

### SECCIÓN 1: Introducción
| Campo | Fuente | Acción |
|-------|--------|--------|
| Nombre del proyecto | Manual | ✏️ Ingresar |
| Párrafos introductorios | Manual | ✏️ Ingresar/Editar |
| Objetivos | Manual | ✏️ Ingresar |

**Qué hacer**: Completa el nombre del proyecto y redacta los objetivos.

---

### SECCIÓN 2: Área de Influencia Social
| Campo | Fuente | Acción |
|-------|--------|--------|
| Departamento | JSON | 🔄 Automático al cargar JSON |
| Provincia | JSON | 🔄 Automático |
| Distrito | JSON | 🔄 Automático |
| Comunidades Campesinas | Manual | ✏️ Crear y nombrar |
| Centros Poblados | JSON | ☑️ Seleccionar de lista (inicial) |
| Distritos AISI | JSON | 🔄 Detectados automáticamente |

**Qué hacer**:
1. Carga el archivo JSON
2. Crea las comunidades campesinas y asígnales nombre
3. Selecciona los centros poblados para cada comunidad (selección inicial)
4. Los párrafos se generan automáticamente

**⚠️ IMPORTANTE**: Esta es una selección **inicial/exploratoria**. La **confirmación definitiva** se hace en la **Sección 4**.

---

### SECCIÓN 3: Metodología
| Campo | Fuente | Acción |
|-------|--------|--------|
| Descripción metodología | Manual | ✏️ Redactar |
| Cantidad entrevistas | Manual | ✏️ Ingresar número |
| Cantidad encuestas | Manual | ✏️ Ingresar número |
| Fecha trabajo de campo | Manual | ✏️ Seleccionar fecha |
| Fuentes secundarias | Predefinido | 📝 Revisar/Editar si necesario |

---

### SECCIÓN 4: Introducción AISD

#### **CUADRO 3.3: Cantidad total de población y viviendas**

**⚠️ ESTA TABLA ES LA FUENTE DE VERDAD PARA TODO EL GRUPO AISD**

| Campo | Fuente | Acción |
|-------|--------|--------|
| Punto de Población | JSON/Backend | 🔄 Se llena automáticamente |
| Código | JSON/Backend | 🔄 Se llena automáticamente |
| Población | Backend | 🔄 Se llena automáticamente |
| Viviendas Empadronadas | Manual | ✏️ Ingresar |
| Viviendas Ocupadas | Manual | ✏️ Ingresar |

**Funcionalidad Crítica**:
- ✅ Los centros poblados que aparecen aquí son los que se usarán en **TODAS** las secciones AISD
- ✅ Si eliminas una fila, ese centro poblado **NO se considerará** en demografía, vivienda, servicios, etc.
- ✅ Los cambios aquí se sincronizan automáticamente con la Sección 2
- ✅ Todas las consultas al backend usan solo los códigos activos de esta tabla

**Qué hacer**:
1. Revisa la tabla que se llenó automáticamente desde la Sección 2
2. **Elimina filas** de centros poblados que NO quieres considerar
3. Completa las viviendas empadronadas y ocupadas (manual)
4. Los datos de las demás secciones se actualizarán automáticamente

### SECCIÓN 5: Institucionalidad AISD
| Campo | Fuente | Acción |
|-------|--------|--------|
| Texto institucionalidad | Manual | ✏️ Redactar |
| Programas sociales | Manual | ✏️ Listar |

---

### SECCIÓN 6: Demografía AISD (A.X.4 - A.X.5)

#### Tabla: Población por Sexo
| Columna | Fuente | Resaltado |
|---------|--------|-----------|
| Sexo | Backend | 🟣 Lila |
| Casos | Backend | 🟣 Lila |
| Porcentaje | **Calculado** | 🟢 Verde |
| **Total** | **Calculado** | 🟢 Verde |

**Cómo se obtienen los datos**:
1. Sistema toma los códigos **ACTIVOS** de la Sección 4 (Cuadro 3.3)
2. Para cada código activo → Consulta `/demograficos/datos?id_ubigeo={codigo}`
3. Agrega los valores de hombres y mujeres de todos los CCPP activos
4. **Calcula porcentajes**: `(casos / total) * 100`

**⚠️ IMPORTANTE**: Solo se usan los centros poblados que están **activos en la Sección 4**, no todos los seleccionados en la Sección 2.

---

### SECCIÓN 7: PET y PEA (A.X.6 - A.X.9)

#### Tabla: PET
| Columna | Fuente | Resaltado |
|---------|--------|-----------|
| Categoría | Backend | 🟣 Lila |
| Casos | Backend | 🟣 Lila |
| Porcentaje | **Calculado** | 🟢 Verde |

**Nota**: La PET incluye solo población de 15+ años.

#### Tabla: PEA (Nivel Distrital)
| Columna | Fuente | Resaltado |
|---------|--------|-----------|
| Categoría | Backend/Manual | 🟣/🟡 |
| Valores | Backend/Manual | 🟣/🟡 |

**Nota**: Los datos de PEA son a nivel DISTRITAL, no por comunidad.

---

### SECCIÓN 8: Actividades Económicas (A.X.10)
| Campo | Fuente | Resaltado |
|-------|--------|-----------|
| Actividad principal | Backend | 🟣 Lila |
| Cantidad trabajadores | Backend | 🟣 Lila |
| Porcentaje | Backend/Calculado | 🟣/🟢 |
| Descripción detallada | Manual | 🟡 Amarillo |

---

### SECCIÓN 9: Vivienda (A.X.12)

#### Tabla: Materiales de Construcción
| Columna | Fuente | Resaltado |
|---------|--------|-----------|
| Material | Backend | 🟣 Lila |
| Casos | Backend | 🟣 Lila |
| Porcentaje | **Calculado** | 🟢 Verde |

---

### SECCIÓN 10: Servicios Básicos (A.X.13)

#### Tabla: Agua, Desagüe, Electricidad
| Columna | Fuente | Resaltado |
|---------|--------|-----------|
| Tipo servicio | Backend | 🟣 Lila |
| Casos | Backend | 🟣 Lila |
| Porcentaje | **Backend** | 🟣 Lila |

**Nota especial**: Esta es una de las pocas tablas donde los porcentajes vienen directamente del backend (endpoint `/servicios/basicos`).

---

### SECCIONES 11-20: Información Complementaria AISD
La mayoría son campos **MANUALES** que requieren trabajo de campo:
- Transporte y vías de acceso
- Telecomunicaciones
- Salud y educación
- Natalidad y mortalidad
- Morbilidad
- Religión, festividades, costumbres

---

## 🔷 GRUPO AISI (Secciones 21-30)

### SECCIÓN 21: Información Referencial AISI (B.X.1)
| Campo | Fuente | Resaltado |
|-------|--------|-----------|
| Distrito | JSON | 🟣 Lila |
| UBIGEO | JSON | 🟣 Lila |
| Provincia | JSON | 🟣 Lila |
| Departamento | JSON | 🟣 Lila |
| CP Capital | JSON | 🟣 Lila |
| Coordenadas | JSON | 🟣 Lila |
| Altitud | JSON | 🟣 Lila |

**100% AUTOMÁTICO** - Todos los datos vienen del JSON.

---

### SECCIÓN 22: Centros Poblados AISI (B.X.2)
| Columna | Fuente | Resaltado |
|---------|--------|-----------|
| Centro Poblado | JSON | 🟣 Lila |
| Código | JSON | 🟣 Lila |
| Categoría | JSON | 🟣 Lila |
| Población | JSON/Backend | 🟣 Lila |
| Viviendas Empadronadas | Manual | 🟡 Amarillo |
| Viviendas Ocupadas | Manual | 🟡 Amarillo |

---

### SECCIONES 23-25: Demografía AISI
Similar a las secciones AISD pero agregado a nivel distrital:
- Población por sexo
- Población por grupo etario
- PET

**Todos los porcentajes son CALCULADOS (🟢 Verde)**.

---

### SECCIÓN 26: PEA Distrital (B.X.6)
| Columna | Fuente | Resaltado |
|---------|--------|-----------|
| Categoría | Backend | 🟣 Lila |
| Hombres | Backend | 🟣 Lila |
| Mujeres | Backend | 🟣 Lila |
| Total | Backend/Calculado | 🟣/🟢 |
| Porcentaje | Backend/Calculado | 🟣/🟢 |

---

### SECCIÓN 27: Actividades Económicas AISI (B.X.7)
| Columna | Fuente | Resaltado |
|---------|--------|-----------|
| Actividad | Backend | 🟣 Lila |
| Casos | Backend | 🟣 Lila |
| Porcentaje | **Backend** | 🟣 Lila |

**Nota**: Los porcentajes vienen del backend (endpoint `/economicos/principales`).

---

### SECCIONES 28-29: Vivienda y Servicios AISI
Similar a AISD pero a nivel distrital.

---

## 📈 RESUMEN DE AUTOMATIZACIÓN

| Grupo | Secciones | Automatización |
|-------|-----------|----------------|
| **AISD** | 4-20 | ~45% |
| **AISI** | 21-30 | ~87% |

---

## ⚠️ DATOS QUE SIEMPRE SON MANUALES

Estos campos **SIEMPRE** requieren ingreso manual:
1. Nombre del proyecto
2. Texto de institucionalidad
3. Descripción de transporte y telecomunicaciones
4. Información de establecimientos de salud
5. Información de instituciones educativas
6. Festividades y costumbres
7. Descripción de hábitos de consumo
8. Sistema de desechos sólidos

---

## 🔧 CÓMO FUNCIONAN LOS CÁLCULOS

### Porcentajes
```
Porcentaje = (valor / total) * 100
Formato: XX,XX %
```

### Totales Agregados
```
Total = suma de todos los casos de la tabla
```

### PET (Población en Edad de Trabajar)
```
PET = suma de grupos etarios de 15+ años
```

---

## 📝 NOTAS TÉCNICAS

1. **Los datos del backend requieren conexión activa** al servidor API.
2. **El JSON se guarda en localStorage** para persistencia.
3. **Los cálculos se realizan en tiempo real** cuando cambian los datos base.
4. **El sistema es escalable**: soporta múltiples comunidades y distritos.

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Los datos no se cargan
- Verifica que el backend esté ejecutándose
- Revisa la consola del navegador para errores
- Asegúrate de haber cargado el JSON correctamente

### Los porcentajes muestran "____"
- Los datos base (casos) pueden estar vacíos
- Verifica que los centros poblados estén seleccionados

### Los totales no coinciden
- Revisa que no haya filas "Total" duplicadas
- Los totales se calculan excluyendo filas que contengan "Total" en el nombre

---

**Documento de Referencia**  
**Sistema Documentador LBS v1.0**  
**Última actualización**: 16 de enero de 2026
