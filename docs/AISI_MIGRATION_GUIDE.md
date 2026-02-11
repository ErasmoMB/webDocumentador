# Guia de Migracion para Secciones AISI

## Resumen

Este documento describe el proceso de migracion para implementar aislamiento de datos entre grupos AISI (Area de Influencia Social Indirecta) usando prefijos dinamicos.

## Objetivo

Cada grupo AISI (B.1, B.2, B.3...) debe tener:
- Sus propios datos aislados
- Sus propios titulos y fuentes
- Su propia numeracion global de tablas y fotos
- Sin interferencia entre grupos

## Arquitectura de Prefijos

### Sistema de Prefijos

| Grupo | Prefijo de Grupo | Ejemplo de Campo |
|-------|------------------|------------------|
| AISI-1 | _B1 | poblacionSexoAISI_B1, fotografiaCahuacho_B1 |
| AISI-2 | _B2 | poblacionSexoAISI_B2, fotografiaYauca_B2 |
| AISI-3 | _B3 | poblacionSexoAISI_B3, fotografiaTiticola_B3 |

### Prefijos de Fotos por Seccion

Cada subseccion tiene su propio prefijo de foto:

| SectionId | Prefijo Base | Ejemplo Completo |
|-----------|--------------|------------------|
| 3.1.4.B.1 | fotografiaCahuacho | fotografiaCahuacho_B1 |
| 3.1.4.B.1.1 | fotografiaCahuacho | fotografiaCahuacho_B1 |
| 3.1.4.B.1.2 | fotografiaPEA | fotografiaPEA_B1 |
| 3.1.4.B.1.3 | fotografiaCahuacho | fotografiaCahuacho_B1 |
| ... | ... | ... |

## Archivos Clave

### Servicios Centrales

1. src/app/core/services/global-numbering.service.ts
   - Calcula numeracion global de tablas y fotos
   - getGlobalTableNumber(sectionId, localTableIndex)
   - getGlobalPhotoNumber(sectionId, fotoIndex, photoPrefix)

2. src/app/core/services/photo-numbering.service.ts
   - Delega a GlobalNumberingService
   - getGlobalPhotoNumber(sectionId, fotoIndex)

3. src/app/core/services/aisi-group.service.ts
   - Maneja grupos AISI dinamicos
   - getCurrentAISIGroup()
   - getAllAISIGroups()

### Componentes de Referencia (Seccion 22)

- src/app/shared/components/seccion22/seccion22-form.component.ts
- src/app/shared/components/seccion22/seccion22-view.component.ts
- src/app/shared/components/seccion22/seccion22-form.component.html
- src/app/shared/components/seccion22/seccion22-view.component.html

## Pasos de Migracion

### Paso 1: Agregar Signal de Prefijo de Foto

```typescript
// En el componente (form o view)
private aisiGroupService = inject(AISIGroupService);

readonly photoPrefixSignal: Signal<string> = computed(() => {
  const grupo = this.aisiGroupService.getCurrentAISIGroup();
  if (!grupo) return 'fotografia';
  
  const prefijoCP = this.obtenerPrefijoCP(grupo);
  const prefijoGrupo = `_${grupo.prefijoGrupo}`; // ej: _B1
  return prefijoCP ? `${prefijoCP}${prefijoGrupo}` : `fotografia${prefijoGrupo}`;
});
```

### Paso 2: Actualizar Signals de Datos

```typescript
// ANTES (sin aislamiento)
readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
  return this.projectFacade.selectTableData(this.seccionId, null, 'poblacionSexoAISI')() ?? [];
});

// DESPUES (con aislamiento)
readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
  const prefijo = this.obtenerPrefijoGrupo();
  const tablaKey = prefijo ? `poblacionSexoAISI${prefijo}` : 'poblacionSexoAISI';
  return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
         this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
});
```

### Paso 3: Actualizar Handlers de Cambio

```typescript
// ANTES
onTituloCuadroPoblacionSexoChange(valor: string): void {
  this.projectFacade.updateField(this.seccionId, null, 'cuadroTituloPoblacionSexo', valor);
}

// DESPUES
onTituloCuadroPoblacionSexoChange(valor: string): void {
  const prefijo = this.obtenerPrefijoGrupo();
  const campoKey = prefijo ? `cuadroTituloPoblacionSexo${prefijo}` : 'cuadroTituloPoblacionSexo';
  this.projectFacade.updateField(this.seccionId, null, campoKey, valor);
}
```

### Paso 4: Actualizar HTML

```html
<!-- ANTES - SIN AISLAMIENT O (un solo tipo de foto por seccion) -->
<input type="text" class="form-control" [(ngModel)]="datos['cuadroTituloPoblacionSexo']">
<app-dynamic-table [tablaKey]="'poblacionSexoAISI'"></app-dynamic-table>
<img [src]="datos['fotografia1Imagen']" [alt]="'Fotografia 1'">

<!-- DESPUES - CON AISLAMIENT O (una sola foto generica) -->
<input type="text" class="form-control" [(ngModel)]="datos[cuadroTituloPoblacionSexoSignal()]">
<app-dynamic-table [tablaKey]="tablaKeyPoblacionSexoSignal()"></app-dynamic-table>
<img [src]="datos[photoPrefixSignal() + '1Imagen']" [alt]="'Fotografia 1'">

<!-- IMPORTANTE: MULTIPLES FOTOS POR SECCION -->
<!-- Cuando hay varios image-upload, cada uno necesita su propio prefijo + grupo -->
<app-image-upload
  [fotografias]="fotosActividadesSignal()"
  [sectionId]="seccionId"
  [photoPrefix]="'fotografiaActividadesEconomicas' + obtenerPrefijoGrupo()"
  [permitirMultiples]="true"
  ...>
</app-image-upload>

<app-image-upload
  [fotografias]="fotosMercadoSignal()"
  [sectionId]="seccionId"
  [photoPrefix]="'fotografiaMercado' + obtenerPrefijoGrupo()"
  [permitirMultiples]="true"
  ...>
</app-image-upload>
```

> Nota: obtenerPrefijoGrupo() retorna _B1, _B2, _B3, etc. El resultado sera:
> - fotografiaActividadesEconomicas_B1 para grupo B.1
> - fotografiaMercado_B1 para grupo B.1
> - fotografiaActividadesEconomicas_B2 para grupo B.2

### Paso 5: Agregar Numeracion Global

```typescript
// En el componente view
readonly globalTableNumberSignal: Signal<string> = computed(() => {
  return this.globalNumberingService.getGlobalTableNumber(this.seccionId, 0);
});

readonly globalTableNumberSignal2: Signal<string> = computed(() => {
  return this.globalNumberingService.getGlobalTableNumber(this.seccionId, 1);
});
```

```html
<!-- En el HTML del view -->
<p class="table-title">Cuadro Ndeg {{ globalTableNumberSignal() }}</p>
<app-table-wrapper [id]="'poblacion-sexo'" [hideNumber]="true">
  <app-dynamic-table [tablaKey]="tablaKeyPoblacionSexoSignal()"></app-dynamic-table>
</app-table-wrapper>

<p class="table-title">Cuadro Ndeg {{ globalTableNumberSignal2() }}</p>
<app-table-wrapper [id]="'poblacion-etario'" [hideNumber]="true">
  <app-dynamic-table [tablaKey]="tablaKeyPoblacionEtarioSignal()"></app-dynamic-table>
</app-table-wrapper>
```

### Paso 6: Eliminar Estructura Inicial de Tablas (Opcional)

Si las tablas se llenaran con datos del backend, eliminar la estructura inicial predefined:

```typescript
// En el config de la tabla (form component)
readonly miTablaConfig: TableConfig = {
  tablaKey: 'miTablaAISI',
  totalKey: 'categoria',
  campoTotal: 'casos',
  campoPorcentaje: 'porcentaje',
  noInicializarDesdeEstructura: true,  // Agregar este flag
  calcularPorcentajes: true,
  camposParaCalcular: ['casos']
};
```

**Resultado:**
- Si hay datos del backend -> se muestran
- Si no hay datos -> tabla vacia []

## Helper Functions

### obtenerPrefijoCP()

```typescript
private obtenerPrefijoCP(grupo?: any): string {
  if (!grupo?.centroPoblado) return '';
  
  const cp = grupo.centroPoblado.toLowerCase().replace(/\s+/g, '');
  const mapeo: Record<string, string> = {
    'cahuacho': 'Cahuacho',
    'yauca': 'Yauca',
    'titicola': 'Titicola',
    // agregar mas segun necesidad
  };
  
  return mapeo[cp] || cp.charAt(0).toUpperCase() + cp.slice(1);
}
```

### obtenerPrefijoGrupo()

```typescript
private obtenerPrefijoGrupo(): string {
  const grupo = this.aisiGroupService.getCurrentAISIGroup();
  if (!grupo) return '';
  return `_${grupo.prefijoGrupo}`; // ej: '_B1'
}
```

## Verificacion

### Checklist de Migracion

- [ ] Signals de datos usan prefijos
- [ ] Handlers de cambio usan prefijos
- [ ] HTML usa signals con prefijos
- [ ] Numeracion global funciona
- [ ] Fotos usan photoPrefixSignal
- [ ] Titulos y fuentes usan prefijos
- [ ] Datos no se mezclan entre grupos
- [ ] Debug logging configurado (opcional)
- [ ] Tablas sin estructura inicial (si aplica)
  - [ ] Agregado noInicializarDesdeEstructura: true
  - [ ] Verificado que backend llenara datos

### Debug Logging

Activar logs en global-numbering.service.ts:

```typescript
// Descomentar console.log en:
// - calculatePhotoOffset
// - getGlobalPhotoNumber
// - countImagesInSection
```

## Secciones por Migrar

| Seccion | Estado | Complejidad |
|---------|--------|-------------|
| 21 | ✅ Completada | Media |
| 22 | ✅ Completada | Media |
| 23 | ✅ Completada | Media |
| 24 | ✅ Completada | Media |
| 25 | ✅ Completada | Media |
| 26 | ✅ Completada | Media |
| 27 | ✅ Completada | Media |
| 28 | ✅ Completada | Media |
| 29 | ✅ Completada | Media |
| 30 | ✅ Completada | Media |
| 31-40 | ⏳ Pendiente | - |

## Problemas Comunes

### 1. Datos no se guardan correctamente

Sintoma: Los cambios no se reflejan al cambiar de grupo.

Solucion: Verificar que los handlers usen obtenerPrefijoGrupo() correctamente.

### 2. Numeracion global incorrecta

Sintoma: Las tablas/fotos muestran numeros incorrectos.

Solucion: Verificar calculatePhotoOffset y getGlobalTableNumber.

### 3. Fotos no se muestran

Sintoma: Las imagenes aparecen vacias.

Solucion: Verificar que photoPrefixSignal() genere el prefijo correcto.

## Eliminar Estructura Inicial de Tablas

Si las tablas se llenaran con datos del backend, eliminar la estructura inicial:

### Paso 1: Quitar estructuraInicial de los configs

```typescript
// ANTES (con estructura inicial)
readonly miTablaConfig: TableConfig = {
  tablaKey: 'miTablaAISI',
  estructuraInicial: [
    { categoria: 'Fila 1', casos: 0 },
    { categoria: 'Fila 2', casos: 0 }
  ],
  ...
};

// DESPUES (sin estructura inicial)
readonly miTablaConfig: TableConfig = {
  tablaKey: 'miTablaAISI',
  noInicializarDesdeEstructura: true,
  ...
};
```

### Paso 2: Verificar que los servicios respeten el flag

Los siguientes servicios ya fueron modificados para respetar noInicializarDesdeEstructura:

- table-initialization.service.ts
  - Si noInicializarDesdeEstructura: true, no crea ninguna fila

- table-handler-factory.service.ts
  - Si noInicializarDesdeEstructura: true, crea array vacio []

### Resultado

| Situacion | Resultado |
|-----------|-----------|
| Hay datos del backend | Se muestran los datos |
| No hay datos | Tabla vacia [] |
| Usuario/edita | Puede agregar filas |

### Importante

Si las tablas NO usan noInicializarDesdeEstructura, mantendran su comportamiento original:
- Con estructuraInicial: Usan la estructura predefined
- Sin estructuraInicial: Crean 1 fila vacia [{}]

## Recursos Adicionales

- Documentacion de Arquitectura
- Flujo de Datos
- Logica de Grupos AISI
- Implementacion de Grupos Dinamicos

---

Ultima actualizacion: 2024-02-11
Version: 1.0
