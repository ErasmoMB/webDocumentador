# Sprint 8 - Testing E2E: AutoLoad Pattern Validation

## Escenario: JSON → Sección 2 → Sección 6 Auto-Fill

### Prerrequisitos

- Backend FastAPI ejecutándose en http://localhost:8000
- Endpoint `/demograficos/datos` disponible
- JSON de prueba cargado con CC y Distrito

### Test Case 1: Cargar JSON y Configurar Sección 2

**Pasos:**
1. Cargar JSON con datos iniciales
2. Ir a Sección 2
3. Seleccionar CC "Ayroca" (o primer CC disponible)
4. Seleccionar 2-3 CCPP activos
5. **Verificar:** GroupConfigService tiene AISD guardado

**Validación (en Browser Console):**
```javascript
// Verificar localStorage
const config = JSON.parse(localStorage.getItem('documentador_group_config'));
console.log('AISD Group:', config.aisdGroup);
// Expected output:
// {
//   nombre: 'Ayroca',
//   tipo: 'AISD',
//   ccppActivos: ['0801', '0802', ...]
// }
```

---

### Test Case 2: Navegar a Sección 6 - Auto-Load Demográfica

**Pasos:**
1. Desde Sección 2, navegar a Sección 6
2. **Observar:** Tablas se llenan automáticamente
3. Esperar ~500ms para carga inicial

**Validación (Angular DevTools):**
- Comprobar que `getSectionKey()` retorna `'seccion6_aisd'`
- Comprobar que `getLoadParameters()` retorna `['0801', '0802', ...]`
- Comprobar que tabla "Población por Sexo" tiene datos

**Validación (Network Tab):**
```
GET /demograficos/datos?id_ubigeo=0801
GET /demograficos/datos?id_ubigeo=0802
...
Status: 200 ✓
```

---

### Test Case 3: Verificar Transformación de Datos

**Esperado en tabla (Sección 6):**

| Sexo | Casos | Porcentaje |
|------|-------|-----------|
| Hombres | 523 | 48,5% |
| Mujeres | 554 | 51,5% |

**Validación (console.log en seccion6.component.ts):**
```typescript
ngOnInit() {
  super.ngOnInit();
  console.log('Sección 6 data loaded:', this.datos);
  // Verifica que poblacionSexoAISD tiene estructura correcta
}
```

---

### Test Case 4: Cambiar Selección en Sección 2

**Pasos:**
1. Volver a Sección 2
2. Cambiar a CC diferente (ej: "Cayamarca")
3. Seleccionar CCPP diferentes
4. Guardar
5. Volver a Sección 6

**Esperado:** Tablas se actualizan con datos del nuevo CC

**Validación:**
- Tablas mostrarán datos diferentes
- Network tab mostrará nuevos requests con ubigeo diferente
- localStorage actualizado con nuevo CCPP

---

### Test Case 5: Sección 12 - AISI Auto-Load

**Pasos:**
1. Volver a Sección 2
2. Seleccionar Distrito (AISI)
3. Marcar CCPP activos
4. Navegar a Sección 12

**Esperado:**
- Tablas demográficas se llenan con datos distrital
- `getSectionKey()` retorna `'seccion12_aisi'`
- `getLoadParameters()` usa `getAISICCPPActivos()`

**Validación (Network):**
```
GET /demograficos/datos?ubigeo=150131
GET /demograficos/datos?ubigeo=150132
...
```

---

### Test Case 6: Cache Hit (Rendimiento)

**Pasos:**
1. Cargar Sección 6 → medir tiempo ~500ms (primera vez)
2. Navegar a otra sección
3. Volver a Sección 6

**Esperado:**
- Segunda carga ~50ms (desde cache)
- No hay requests HTTP (cache local)

**Validación (DevTools → Timing):**
```
First load: 487ms
Second load: 48ms ✓ (desde localStorage)
```

---

### Test Case 7: Fallback - Sin Configuración

**Pasos:**
1. Limpiar localStorage: 
   ```javascript
   localStorage.removeItem('documentador_group_config');
   ```
2. Recargar página
3. Ir directamente a Sección 6 (sin pasar por Sección 2)

**Esperado:**
- Sección 6 carga pero tablas no se auto-llenan
- Sin errores en console
- Tablas vacías (como antes del patrón)

---

### Test Case 8: Error Backend

**Pasos:**
1. Detener backend FastAPI
2. Ir a Sección 6 desde Sección 2

**Esperado:**
- Tabla mostrar datos vacíos (______)
- Console warning: `[AutoLoad] Error loading...`
- UI no se rompe

---

### Checklist de Validación

- [ ] Test Case 1: localStorage tiene AISD/AISI
- [ ] Test Case 2: Sección 6 carga datos automáticamente
- [ ] Test Case 3: Transformación aplica correctamente
- [ ] Test Case 4: Cambios en Sección 2 reflejan en Sección 6
- [ ] Test Case 5: Sección 12 AISI funciona correctamente
- [ ] Test Case 6: Cache hit ~50ms segunda carga
- [ ] Test Case 7: Fallback graceful sin configuración
- [ ] Test Case 8: Manejo de errores sin romper UI

---

## Métricas a Registrar

```
Métrica | Valor Esperado | Valor Real | Status
--------|----------------|-----------|--------
First Load Latency | <600ms | ? | ?
Cache Hit Latency | <100ms | ? | ?
Network Requests | 2-3 por sección | ? | ?
Cache Size | <5KB | ? | ?
Error Recovery | Graceful (sin UI break) | ? | ?
Secciones Migradas | 9/9 AISD, 1/10 AISI | ? | ?
```

---

## Evidencia Requerida

1. **Screenshots:**
   - Sección 6 con datos auto-lleados
   - Network tab mostrando requests
   - Datos en localStorage (DevTools)

2. **Videos (opcional):**
   - Flujo JSON → Sec 2 → Sec 6 → Tab poblada
   - Cambio en Sec 2 → actualización en Sec 6

3. **Console logs:**
   - Tiempo de carga
   - Estructura de datos
   - Mensajes de éxito

---

## Notas

- **Backend requerido:** SÍ (para requests reales)
- **Datos mock:** Solo si backend no disponible
- **Navegador:** Chrome/Edge (DevTools probados)
- **LocalStorage:** Limpiar antes de cada test si hay dudas

---

**Responsable:** Validación de patrón AutoLoad  
**Fecha Estimada:** Sprint 8  
**Duración:** ~2 horas de testing manual
