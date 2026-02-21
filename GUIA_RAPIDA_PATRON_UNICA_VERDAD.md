# Guía Rápida: Patrón UNICA_VERDAD para Secciones

## Resumen

Esta guía describe los pasos para implementar correctamente el patrón **UNICA_VERDAD** en una nueva sección, incluyendo el cálculo automático de totales/porcentajes y la persistencia en Redis.

---

## Pasos a Seguir

### Paso 1: Analizar la Estructura de la Tabla

Antes de programar, analizar cómo funciona la tabla:

**Preguntar:**
- ¿La tabla tiene una fila "Total"?
- ¿Tiene múltiples categorías (como Paredes, Techos, Pisos)?
- ¿Los porcentajes son globales (toda la tabla) o por categoría?

**Estructuras posibles:**

| Tipo | Ejemplo | Cálculo |
|------|---------|---------|
| **Simple** | PET, PEA | Una fila Total global |
| **Por Categoría** | Materiales (Paredes/Techo/Piso) | Total por cada categoría |
| **Por Sexo** | Población Hombre/Mujer | Casos = H + M, % por género |

---

### Paso 2: Configurar la Tabla (Constants)

En `seccionX-constants.ts`:

```typescript
export const SECCIONX_TABLA_CONFIG: TableConfig = {
  tablaKey: 'miTabla',
  totalKey: 'categoria',           // Campo que identifica la fila Total
  campoTotal: 'casos',            // Campo a sumar
  campoPorcentaje: 'porcentaje',  // Campo de porcentaje
  calcularPorcentajes: true,      // Habilitar cálculo
  camposParaCalcular: ['casos'],
  permiteAgregarFilas: true,
  permiteEliminarFilas: true
};
```

---

### Paso 3: Inyectar Servicios en el Constructor

```typescript
constructor(
  cdRef: ChangeDetectorRef,
  injector: Injector,
  private sanitizer: DomSanitizer,
  private globalNumbering: GlobalNumberingService,
  private backendApi: BackendApiService,
  private formChange: FormChangeService,        // ✅ Para persistencia
  private tableFacade: TableManagementFacade    // ✅ Para cálculos
) {
  super(cdRef, injector);
}
```

**No olvidar el import:**
```typescript
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
```

---

### Paso 4: Método de Carga Condicional (onInitCustom)

```typescript
protected override onInitCustom(): void {
  const prefijo = this.obtenerPrefijoGrupo();
  const formData = this.formDataSignal();
  
  const tablaKey = prefijo ? `miTabla${prefijo}` : 'miTabla';
  const existingData = formData[tablaKey];
  
  if (!existingData || !Array.isArray(existingData) || existingData.length === 0) {
    console.log('[SECCIONX] No hay datos persistidos, cargando del backend...');
    this.inicializarTablasVacias();
    this.cargarDatosDelBackend();
  } else {
    console.log('[SECCIONX] Datos persistidos encontrados');
  }
  
  this.cargarFotografias();
}
```

---

### Paso 5: Cargar Datos del Backend con Cálculo

```typescript
private cargarDatosDelBackend(): void {
  const codigos = [...this.getCodigosCentrosPobladosAISD()];
  
  this.backendApi.postMiEndpoint(codigos).subscribe({
    next: (response: any) => {
      let datosTransformados = this.transformarDatos(response?.data || []);
      
      // ✅ CALCULAR TOTALES Y PORCENTAJES
      if (datosTransformados.length > 0) {
        const prefijo = this.obtenerPrefijoGrupo();
        const tablaKey = prefijo ? `miTabla${prefijo}` : 'miTabla';
        
        // Opción A: Cálculo simple
        const tmp: Record<string, any> = { [tablaKey]: structuredClone(datosTransformados) };
        this.tableFacade.calcularTotalesYPorcentajes(tmp, { 
          ...this.miConfig, 
          tablaKey: tablaKey 
        });
        datosTransformados = tmp[tablaKey] || datosTransformados;
        
        // Opción B: Cálculo por categoría (si aplica)
        // datosTransformados = this.calcularTotalesYPorcentajesPorCategoria(datosTransformados);
        
        // ✅ GUARDAR EN PROJECTSTATEFACADE
        this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
        
        // ✅ PERSISTIR EN REDIS
        try {
          this.formChange.persistFields(
            this.seccionId, 
            'table', 
            { [tablaKey]: datosTransformados }, 
            { notifySync: true }
          );
        } catch (e) { console.error(e); }
      }
    }
  });
}
```

---

### Paso 6: Método de Actualización (onTableUpdated)

```typescript
onMiTablaUpdated(updatedData?: any[]): void {
  // ✅ LEER DEL SIGNAL REACTIVO
  const formData = this.formDataSignal();
  const prefijo = this.obtenerPrefijoGrupo();
  const tablaKey = prefijo ? `miTabla${prefijo}` : 'miTabla';
  let tablaActual = updatedData || formData[tablaKey] || [];
  
  // ✅ CALCULAR TOTALES Y PORCENTAJES
  // Opción A: Cálculo simple
  const tmp: Record<string, any> = { [tablaKey]: structuredClone(tablaActual) };
  this.tableFacade.calcularTotalesYPorcentajes(tmp, { 
    ...this.miConfig, 
    tablaKey: tablaKey 
  });
  tablaActual = tmp[tablaKey] || tablaActual;
  
  // Opción B: Cálculo por categoría (si aplica)
  // tablaActual = this.calcularTotalesYPorcentajesPorCategoria(tablaActual);
  
  // ✅ GUARDAR EN PROJECTSTATEFACADE
  this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
  
  // ✅ PERSISTIR EN REDIS
  try {
    this.formChange.persistFields(
      this.seccionId, 
      'table', 
      { [tablaKey]: tablaActual }, 
      { notifySync: true }
    );
    console.log(`[SECCIONX] ✅ Data saved to session-data`);
  } catch (e) {
    console.error(`[SECCIONX] ⚠️ Could not save:`, e);
  }
  
  this.cdRef.markForCheck();
}
```

---

### Paso 7: Cálculo por Categoría (Si Aplica)

Para tablas como "Materiales de Construcción" donde cada categoría tiene su propio Total:

```typescript
private calcularTotalesYPorcentajesPorCategoria(tabla: any[]): any[] {
  if (!tabla || tabla.length === 0) return tabla;
  
  const tablaClon = JSON.parse(JSON.stringify(tabla));
  
  // Agrupar por categoría (excluyendo filas Total)
  const categorias = new Map<string, any[]>();
  
  tablaClon.forEach((row: any) => {
    const tipoMat = row.tipoMaterial || '';
    const isTotal = tipoMat.toString().toLowerCase() === 'total';
    
    if (!isTotal) {
      const cat = row.categoria || '';
      if (!categorias.has(cat)) categorias.set(cat, []);
      categorias.get(cat)!.push(row);
    }
  });
  
  // Calcular para cada categoría
  categorias.forEach((filas, categoria) => {
    const totalCategoria = filas.reduce((sum, row) => 
      sum + (parseFloat(row.casos) || 0), 0);
    
    // Porcentajes por fila
    filas.forEach((row: any) => {
      const casos = parseFloat(row.casos) || 0;
      if (totalCategoria > 0) {
        row.porcentaje = (casos / totalCategoria * 100).toFixed(2).replace('.', ',') + ' %';
      } else {
        row.porcentaje = '0,00 %';
      }
    });
    
    // Actualizar fila Total de esta categoría
    const filaTotal = tablaClon.find((row: any) => 
      row.categoria === categoria && 
      (row.tipoMaterial || '').toString().toLowerCase() === 'total'
    );
    
    if (filaTotal) {
      filaTotal.casos = totalCategoria;
      filaTotal.porcentaje = '100,00 %';
    }
  });
  
  return tablaClon;
}
```

---

## Checklist de Verificación

Antes de terminar, verificar:

- [ ] `formDataSignal()` lee de ProjectStateFacade
- [ ] `projectFacade.setField()` guarda en memoria
- [ ] `formChange.persistFields()` con `{ notifySync: true }` persiste en Redis
- [ ] Cálculo de totales/porcentajes se ejecuta:
  - [ ] Al cargar datos del backend
  - [ ] Al editar la tabla (onTableUpdated)
- [ ] `onInitCustom()` verifica datos existentes antes de cargar del backend

---

## Errores Comunes

| Error | Solución |
|-------|----------|
| No calcula porcentajes | Verificar `calcularPorcentajes: true` en config |
| Total incorrecto | Verificar `totalKey` y `campoTotal` en config |
| No persiste | Agregar `formChange.persistFields()` con `notifySync: true` |
| Tabla por categorías no funciona | Usar método personalizado `calcularTotalesYPorcentajesPorCategoria()` |
| Error "tableFacade not found" | Inyectar `TableManagementFacade` en constructor |

---

## Referencias

- Sección 6 (Referencia): `seccion6-form.component.ts`
- Sección 7 (Referencia): `seccion7-form.component.ts`
- Sección 9 (Ejemplo con categorías): `seccion9-form.component.ts`
