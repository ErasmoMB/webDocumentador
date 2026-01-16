# ✅ Checklist - Sección 7: PET y PEA

## Estado del Checklist

| Categoría | Item | Estado | Notas |
|-----------|------|--------|-------|
| **1️⃣ Datos del Backend** | | | |
| | Endpoint identificado | ✅ | `/demograficos/datos` |
| | Agregación UBIGEO activos | ✅ | Usa códigos de Sección 4 |
| | Transformación backend → frontend | ✅ | `transformarPET()` |
| | Cálculo porcentajes frontend | ✅ | Calculados en frontend |
| | Manejo valores `null` | ✅ | Convertidos a `0` |
| | Datos guardados con prefijo | ✅ | `petTabla_A1` |
| **2️⃣ Conexión Sección-Formulario** | | | |
| **Tablas** | | | |
| | `getTablaKeyX()` dinámico | ✅ | `getTablaKeyPET()` agregado |
| | `getTablaX()` con prefijo | ✅ | `getTablaPET()` existe |
| | HTML formulario dinámico | ✅ | Usa `getTablaKeyPET()` |
| | HTML plantilla con prefijo | ✅ | Usa `getPETTablaSinTotal()` |
| | Totales calculados | ✅ | `getTotalPET()` |
| **Campos Simples** | | | |
| | `obtenerNombreComunidadActual()` | ✅ | Heredado de BaseSection |
| | Uso `PrefijoHelper` | ✅ | En `getTablaPET()` |
| | HTML usa métodos | ✅ | Usa `obtenerNombreComunidadActual()` |
| **Párrafos** | | | |
| | `obtenerTextoX()` | ✅ | `obtenerTextoSeccion7SituacionEmpleoCompleto()` |
| | `obtenerTextoXConResaltado()` | ❌ | Falta para vista previa |
| | Reemplazo placeholders | ❌ | No implementado |
| | Conexión con tablas | ❌ | No usa datos de PET en párrafos |
| | Vista previa `[innerHTML]` | ❌ | Usa `formatearParrafo()` sin resaltados |
| | Editor `[value]` | ✅ | Usa `obtenerTextoX()` |
| | Sincronización | ❌ | Falta |
| **Fotografías** | | | |
| | Cache `fotografiasCache` | ❌ | Falta |
| | `fotografiasFormMulti` | ✅ | Existe |
| | `getFotografiasX()` prioriza cache | ❌ | No prioriza cache |
| | `onFotografiasChange()` actualiza cache | ❌ | No actualiza cache |
| | Actualización inmediata | ❌ | Falta `cdRef.detectChanges()` |
| **3️⃣ Resaltados Visuales** | | | |
| | Tipos implementados | ✅ | 4 tipos en shared.css |
| | `appDataSource` configurada | ✅ | En tabla PET |
| | Tablas: casos (lila), % (verde) | ✅ | Implementado |
| | Párrafos con resaltados | ❌ | Falta |

---

## Próximo paso: Conexión Sección-Formulario

**Prioridad**: Tablas Dinámicas → Párrafos → Fotografías
