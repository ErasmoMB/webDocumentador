# ✅ Checklist - Verificación de Secciones

Guía genérica para verificar la implementación correcta de cualquier sección.

---

## Primero rcrea una tabla de el cheklist  y de acuerdo a la seccion en la que trabajemos empiesa con el checklist

## 1️⃣ Datos del Backend (Prioridad Alta)

### Conexión con Backend si esque hay datos del backend
- [ ] Endpoint identificado y correcto
- [ ] Agregación de múltiples códigos UBIGEO activos (si aplica)
- [ ] Transformación de datos backend → frontend
- [ ] Cálculo de porcentajes en frontend (no vienen del backend)
- [ ] Manejo de valores `null` (convertidos a `0` o valor por defecto)

### Datos Obtenidos y Transformados
- [ ] Datos obtenidos del backend (números absolutos)
- [ ] Agregación correcta de múltiples centros poblados (si aplica)
- [ ] Datos guardados con prefijo (`campo_A1`, `campo_A2`, etc.)

---

## 2️⃣ Conexión Sección-Formulario (Prioridad Alta)

### Tablas Dinámicas con Prefijos
- [ ] Métodos `getTablaKeyX()` con prefijo dinámico
- [ ] Métodos `getTablaX()` para leer datos con prefijo
- [ ] HTML formulario: `[tablaKey]="getTablaKeyX()"` (dinámico)
- [ ] HTML plantilla: `*ngFor="let item of getTablaX()"` (con prefijo)
- [ ] Totales calculados correctamente desde la tabla

### Campos Simples con Fallbacks
- [ ] Método `obtenerNombreComunidadActual()` con múltiples fallbacks (si aplica)
- [ ] Uso de `PrefijoHelper` para valores con prefijo
- [ ] HTML usa métodos en lugar de acceso directo a `datos`

### Párrafos Sincronizados
- [ ] Métodos `obtenerTextoX()` - texto plano con valores reemplazados
- [ ] Métodos `obtenerTextoXConResaltado()` - HTML con resaltados
- [ ] Reemplazo de placeholders (`___`, `CC___`) en texto personalizado
- [ ] Conexión con datos de tablas (totales, porcentajes) en párrafos
- [ ] Vista previa: `[innerHTML]="obtenerTextoXConResaltado()"`
- [ ] Editor: `[value]="obtenerTextoX()"` - mismo texto sin resaltados
- [ ] Sincronización: editor y vista previa muestran el mismo contenido

### Fotografías con Actualización Inmediata
- [ ] Cache `fotografiasCache` para vista previa
- [ ] `fotografiasFormMulti` para formulario
- [ ] Método `getFotografiasX()` que prioriza cache
- [ ] `onFotografiasChange()` actualiza cache y fuerza detección
- [ ] Fotografías se reflejan inmediatamente en vista previa

---

## 3️⃣ Resaltados Visuales (Prioridad Baja)

### 4 Tipos de Resaltados Implementados
- [ ] `'section'` - Cyan (#00bcd4) - Datos de otras secciones
- [ ] `'backend'` - Lila (#9c27b0) - Datos del backend
- [ ] `'calculated'` - Verde (#4caf50) - Valores calculados
- [ ] `'manual'` - Amarillo (#ffff00) - Datos manuales

### Aplicación en Componentes
- [ ] Directiva `appDataSource` configurada
- [ ] Clases CSS definidas en `shared.css`
- [ ] Tablas: casos/valores (lila), porcentajes (verde)
- [ ] Párrafos: resaltados según origen de datos
- [ ] `DomSanitizer` para HTML seguro (si aplica)

---

*Usar este checklist para verificar cada sección implementada*
