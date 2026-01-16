# 📊 Resumen de Datos - Sección 9 (Viviendas)

## Tabla de Datos y Fuentes

| Dato | Fuente | Automático |
|------|--------|------------|
| **Nombre de Comunidad (grupoAISD)** | Sección 2/4 | ✅ Sí |
| **Total Viviendas Empadronadas** | Sección 4 (`tablaAISD2TotalViviendasEmpadronadas`) | ✅ Sí |
| **Total Viviendas Ocupadas** | Sección 4 (`tablaAISD2TotalViviendasOcupadas`) | ✅ Sí |
| **Porcentaje Viviendas Ocupadas** | Calculado (Ocupadas / Empadronadas) | ✅ Sí |
| **Tabla Condición de Ocupación** | ⏸️ Manual (pendiente backend) | ❌ No |
| └─ Categoría | ⏸️ Manual | ❌ No |
| └─ Casos | ⏸️ Manual | ❌ No |
| └─ Porcentaje | Calculado automáticamente | ✅ Sí |
| **Tabla Tipos de Materiales** | ⏸️ Manual (pendiente backend) | ❌ No |
| └─ Categoría | ⏸️ Manual | ❌ No |
| └─ Tipo de Material | ⏸️ Manual | ❌ No |
| └─ Casos | ⏸️ Manual | ❌ No |
| └─ Porcentaje | Calculado automáticamente | ✅ Sí |
| **Párrafo Viviendas (textoViviendas)** | Manual (con valores dinámicos) | ⚠️ Parcial |
| └─ Nombre Comunidad | Sección 2/4 | ✅ Sí |
| └─ Total Viviendas | Sección 4 | ✅ Sí |
| └─ Viviendas Ocupadas | Sección 4 | ✅ Sí |
| └─ Porcentaje Ocupadas | Calculado | ✅ Sí |
| └─ Texto base | Manual | ❌ No |
| **Párrafo Estructura (textoEstructura)** | Manual (con valores dinámicos) | ⚠️ Parcial |
| └─ Nombre Comunidad | Sección 2/4 | ✅ Sí |
| └─ Porcentajes de Materiales | Tabla Tipos de Materiales | ✅ Sí |
| └─ Texto base | Manual | ❌ No |
| **Fotografías Estructura** | Manual | ❌ No |

---

## 🔄 Flujo de Datos

### 1. Datos Automáticos (Sección 4 → Sección 9)

```
Sección 4 (Cuadro 3.3)
  ├─ tablaAISD2TotalViviendasEmpadronadas
  │   └─→ Sección 9: getTotalViviendasEmpadronadas()
  │
  └─ tablaAISD2TotalViviendasOcupadas
      └─→ Sección 9: getViviendasOcupadas()
```

### 2. Datos Calculados

```
Total Viviendas Ocupadas / Total Viviendas Empadronadas
  └─→ getPorcentajeViviendasOcupadas()

Tabla Condición de Ocupación
  └─ Porcentajes calculados automáticamente por fila

Tabla Tipos de Materiales
  └─ Porcentajes calculados automáticamente por fila
```

### 3. Datos Manuales

- **Tabla Condición de Ocupación**: Usuario ingresa categorías y casos
- **Tabla Tipos de Materiales**: Usuario ingresa categorías, tipos y casos
- **Párrafos**: Usuario puede editar texto completo o dejar que se genere automáticamente
- **Fotografías**: Usuario sube imágenes manualmente

---

## ⏸️ Pendiente (Backend)

### Tabla Condición de Ocupación
- **Endpoint**: Por definir
- **Datos esperados**: Categorías de ocupación (ocupadas, desocupadas, etc.) con casos
- **Transformación**: Agregar porcentajes calculados

### Tabla Tipos de Materiales
- **Endpoint**: Por definir
- **Datos esperados**: Materiales de construcción (paredes, techos, pisos) con casos
- **Transformación**: Agregar porcentajes calculados

---

## 📝 Notas Importantes

1. **Dependencia de Sección 4**: La Sección 9 depende de los totales calculados en la Sección 4 (Cuadro 3.3).

2. **Cálculo de Porcentajes**: Todos los porcentajes se calculan automáticamente en el frontend, no vienen del backend.

3. **Prefijos Dinámicos**: Las tablas `condicionOcupacionTabla` y `tiposMaterialesTabla` se guardan con prefijos (ej: `condicionOcupacionTabla_A1`) para soportar múltiples comunidades.

4. **Párrafos Dinámicos**: Los párrafos pueden generarse automáticamente usando valores de otras secciones, pero el usuario puede editarlos manualmente.

5. **Resaltados Visuales**:
   - **Cyan (data-section)**: Datos de otras secciones (nombres, totales)
   - **Verde (data-calculated)**: Porcentajes calculados
   - **Amarillo (data-manual)**: Datos ingresados manualmente
