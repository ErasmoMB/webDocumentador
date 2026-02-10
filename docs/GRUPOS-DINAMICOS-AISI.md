Aislamiento de Grupos AISI - Confirmación
¡SÍ! Todo está completamente separado. Así funciona:

## 🗺️ Auto-Poblar Tabla Ubicación CP

Cuando entras a un grupo AISI (ej. B.1), la tabla `ubicacionCpTabla{prefijo}` se **auto-pobla** con los datos del centro poblado del grupo:

```
ubicacionCpTabla_B1 se poblará con:
  • localidad: "SAN PEDRO" (nombre del CP)
  • coordenadas: "765432, 8765431" (este, norte)
  • altitud: "2450 m.s.n.m."
  • distrito: "SAN PEDRO"
  • provincia: "CANCHIS"
  • departamento: "CUSCO"

ubicacionCpTabla_B3 se poblará con datos diferentes del CP de B.3
```

✅ **No sobreescribe datos guardados** - Si ya hay datos en la tabla, los respeta
✅ **Usa datos del CCPP** - Extrae coordenadas, altitud y ubicación del registro del centro poblado
✅ **Aislamiento completo** - Cada grupo tiene su propia tabla con sus propios datos

Diagrama de Aislamiento
┌─────────────────────────────────────────────────────────────────┐
│ 🗺️ GRUPO AISI: B.1 - SAN PEDRO                                │
│ 📂 URL: seccion/3.1.4.B.1.*                                   │
│ 📝 Datos guardados con prefijo: _B1                            │
│                                                                 │
│   • tablaPoblacion_B1  → tablaPoblacion_B3 (vacío, separado)   │
│   • parrafos_B1        → parrafos_B3 (vacío, separado)         │
│   • imagenes_B1        → imagenes_B3 (vacío, separado)         │
│   • CP: ['0214090010', '0214090059', ...] (47 CP)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🗺️ GRUPO AISI: B.3 - OTRO DISTRITO                           │
│ 📂 URL: seccion/3.1.4.B.3.*                                   │
│ 📝 Datos guardados con prefijo: _B3                            │
│                                                                 │
│   • tablaPoblacion_B3  → tablaPoblacion_B1 (vacío, separado)   │
│   • parrafos_B3        → parrafos_B1 (vacío, separado)         │
│   • imagenes_B3        → imagenes_B1 (vacío, separado)        │
│   • CP: [códigos diferentes del B.3]                          │
└─────────────────────────────────────────────────────────────────┘
Flujo de Aislamiento
Usuario entra a 3.1.4.B.1.2

PrefijoHelper extrae _B1

Busca datos con sufijo _B1

Datos del B.1: tablaPoblacion_B1

Usuario entra a 3.1.4.B.3.2

PrefijoHelper extrae _B3

Busca datos con sufijo _B3

Datos del B.3: tablaPoblacion_B3

Modifica tabla en B.1

Se guarda como tablaPoblacion_B1

Modifica tabla en B.3

Se guarda como tablaPoblacion_B3

NO afecta B.3

NO afecta B.1

Ejemplo Real
Acción	Grupo B.1	Grupo B.3
Entra a sección 2.2	Ve sus tablas	Sus tablas están vacías
Modifica tabla poblacional	Guarda en poblacionSexoTabla_B1	-
Agrega imágenes	Guarda con _B1	-
Va al otro grupo	-	Tabla poblacionSexoTabla_B3 vacía
Modifica en B.3	-	Guarda en poblacionSexoTabla_B3
Regresa a B.1	Sus cambios están ahí	-
Verificación en Consola
// En cualquier sección AISI
console.log('🗺️ GRUPO ACTUAL:', this.getAISIGroupDebugInfo());

// Salida para B.1:
// {
//   seccionId: '3.1.4.B.1.2',
//   prefijo: '_B1',
//   grupo: { id: 'B.1', nombre: 'SAN PEDRO', ccppCount: 47 }
// }

// Salida para B.3:
// {
//   seccionId: '3.1.4.B.3.2',
//   prefijo: '_B3',
//   grupo: { id: 'B.3', nombre: 'OTRO DISTRITO', ccppCount: XX }
// }
Resumen
✅ NO hay mezclas - Cada grupo AISI tiene sus propios datos

✅ Aislamiento completo - Modificaciones en B.1 no afectan B.3

✅ Prefijos correctos - _B1 vs _B3 separan los datos

✅ Herencia de CP - Cada grupo tiene sus centros poblados específicos