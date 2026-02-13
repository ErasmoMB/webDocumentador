# Guía para Reactividad Inmediata en Secciones

Este documento explica cómo implementar reactividad inmediata en Angular usando Signals, basándose en la solución implementada en la Sección 2.

## Tabla de Contenidos

1. [Problema Original](#problema-original)
2. [Solución Implementada](#solución-implementada)
3. [Principios de Angular Signals](#principios-de-angular-signals)
4. [Patrón para Párrafos Dinámicos](#patrón-para-párrafos-dinámicos)
5. [Patrón para Tablas Dinámicas](#patrón-para-tablas-dinámicas)
6. [Guía Paso a Paso para Refactorizar](#guía-paso-a-paso-para-refactorizar)
7. [Ejemplo Completo](#ejemplo-completo)
8. [Casos de Uso Comunes](#casos-de-uso-comunes)

---

## Problema Original

### Síntomas
- Al cambiar el nombre de una comunidad campesina, el párrafo no se actualizaba inmediatamente
- Era necesario recargar la página para ver los cambios
- Los placeholders como `{{comunidades}}` aparecían literalmente en el texto

### Causas Identificadas

1. **Effect sin acceso a valores**: El effect llamaba signals sin usar sus valores:
   ```typescript
   // ❌ INCORRECTO - No registra dependencia
   effect(() => {
     this.aisdGroups();  // Solo llama, no usa el valor
     this.textoAISDFormateado();
   });
   ```

2. **Texto manual cacheado**: Las funciones retornaban texto cacheado sin regenerar:
   ```typescript
   // ❌ INCORRECTO - Retorna texto cacheado
   obtenerTextoSeccion2AISDCompleto(): string {
     const manual = this.projectFacade.selectField(...)();
     if (manual && manual.trim().length > 0) return manual; // ❌ Cacheado!
     // ...
   }
   ```

3. **Replace sin bandera global**: Solo reemplazaba la primera ocurrencia:
   ```typescript
   // ❌ INCORRECTO - Solo primera ocurrencia
   .replace('{{comunidades}}', valor)
   ```

---

## Solución Implementada

### 1. Effect con acceso a valores

```typescript
// ✅ CORRECTO - Registra dependencias
effect(() => {
  const aisd = this.aisdGroups();  // Accede al valor
  const aisi = this.aisiGroups();
  const ubicacion = this.ubicacionGlobal();
  const texto = this.textoAISDFormateado();
  
  this.cdRef.markForCheck();
});
```

### 2. Regeneración de texto

```typescript
// ✅ CORRECTO - Siempre regenera
obtenerTextoSeccion2AISDCompleto(): string {
  const comunidades = this.obtenerTextoComunidades();
  // ... usa template para regenerar siempre
  return generarTexto({ comunidades, ... });
}
```

### 3. ReplaceAll para todos los placeholders

```typescript
// ✅ CORRECTO - Reemplaza todas las ocurrencias
const textoBase = template
  .replaceAll('{{comunidades}}', valor)
  .replace(/{{distrito}}/g, distrito)
  .replace(/{{departamento}}/g, departamento);
```

---

## Principios de Angular Signals

### 1. Signals son funciones queleen valores

```typescript
const count = signal(0);

console.log(count());       // ✅ Lee el valor (0)
console.log(count.value);   // ❌ No recomendado
```

### 2. Computed crea señales derivadas

```typescript
const aisdGroups = signal<Group[]>([]);

const comunidadesNombres = computed(() => 
  aisdGroups().map(g => g.nombre)
);
```

### 3. Effect se ejecuta cuando cambian las dependencias

```typescript
effect(() => {
  console.log('Valor cambió a:', this.aisdGroups());
  // Se ejecuta cada vez que aisdGroups() cambia
});
```

### 4. ChangeDetectionStrategy.OnPush

Con Signals, Angular detecta cambios automáticamente, pero necesitamos marcar para check:

```typescript
constructor(private cdRef: ChangeDetectorRef) {
  effect(() => {
    // Trabajar con signals
    this.cdRef.markForCheck(); // ✅ Necesario para OnPush
  });
}
```

---

## Patrón para Párrafos Dinámicos

### Estructura del Template

```typescript
// constantes.ts
export const SECTION_TEMPLATES = {
  parrafoTemplate: `El área de {{provincia}} en {{departamento}}...`,
};
```

### Componente de Vista

```typescript
// view.component.ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionViewComponent extends BaseSectionComponent {
  
  // 1. Signal para datos de entrada
  readonly datos: Signal<Datos> = this.projectFacade.selectField(...);

  // 2. Computed para datos derivados
  readonly ubicacion = computed(() => ({
    provincia: this.projectFacade.selectField(...)() || '____',
    departamento: this.projectFacade.selectField(...)() || '____',
  }));

  // 3. Computed para texto formateado
  readonly textoFormateado = computed(() => {
    const datos = this.datos();
    const ubicacion = this.ubicacion();
    
    return this.generarTexto(datos, ubicacion);
  });

  // 4. Effect para sincronización
  constructor(...) {
    super(...);
    effect(() => {
      this.datos();
      this.textoFormateado();
      this.cdRef.markForCheck();
    });
  }

  private generarTexto(datos: Datos, ubicacion: any): string {
    return SECTION_TEMPLATES.parrafoTemplate
      .replaceAll('{{provincia}}', ubicacion.provincia)
      .replace(/{{departamento}}/g, ubicacion.departamento);
  }
}
```

### Template HTML

```html
<!-- view.component.html -->
<div [innerHTML]="textoFormateado()"></div>
```

---

## Patrón para Tablas Dinámicas

### Computed para datos de tabla

```typescript
readonly tablaDatos = computed(() => {
  const datos = this.projectFacade.selectTableData(...)();
  return datos.map(d => ({
    ...d,
    campoDerivado: this.calcularCampoDerivado(d)
  }));
});
```

### Effect para cuando cambian los datos fuente

```typescript
constructor(...) {
  super(...);
  effect(() => {
    const datos = this.datosFuente();
    if (datos.length > 0) {
      // Actualizar tabla cuando cambian los datos fuente
      this.actualizarTabla(datos);
    }
    this.cdRef.markForCheck();
  });
}
```

---

## Guía Paso a Paso para Refactorizar

### Paso 1: Identificar datos fuente

```typescript
// ¿Qué datos cambian y deben reflejarse en otro lugar?
- Nombre de comunidad campesina
- Datos de ubicación (provincia, departamento, distrito)
- Datos de tablas
- Datos de otras secciones
```

### Paso 2: Crear signals para datos fuente

```typescript
// En BaseSectionComponent o componente específico
readonly datosFuente = this.projectFacade.selectField(seccionId, null, campo)();
```

### Paso 3: Crear computed para texto/tabla derivada

```typescript
readonly textoDerivado = computed(() => {
  const datos = this.datosFuente();
  return this.generarDesdePlantilla(datos);
});
```

### Paso 4: Agregar effect para sincronización

```typescript
constructor(...) {
  super(...);
  effect(() => {
    this.datosFuente();      // Lee el valor
    this.textoDerivado();      // Lee el computed
    this.cdRef.markForCheck(); // Marca para re-render
  });
}
```

### Paso 5: Usar replaceAll para placeholders múltiples

```typescript
private generarDesdePlantilla(datos: any): string {
  return PLANTILLA
    .replaceAll('{{placeholder1}}', datos.valor1)
    .replace(/{{placeholder2}}/g, datos.valor2);
}
```

---

## Ejemplo Completo

### Sección 2 - Comunidades Campesinas

```typescript
// seccion2-view.component.ts
@Component({
  selector: 'app-seccion2-view',
  templateUrl: './seccion2-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Seccion2ViewComponent extends BaseSectionComponent {

  // Signals de datos fuente (vienen del store)
  readonly aisdGroups: Signal<readonly GroupDefinition[]> = 
    this.projectFacade.groupsByType('AISD');
  
  readonly ubicacionGlobal = computed(() => 
    this.projectFacade.ubicacionGlobal()
  );

  // Signal derivado para nombres
  readonly comunidadesNombres = computed(() => 
    this.aisdGroups().map(g => g.nombre)
  );

  // Computed para texto formateado
  readonly textoAISDFormateado = computed(() => {
    const nombres = this.comunidadesNombres();
    const ubicacion = this.ubicacionGlobal();
    
    return this.generarTextoAISD({
      comunidades: this.obtenerTextoComunidades(nombres),
      distrito: ubicacion.distrito || '____',
      departamento: ubicacion.departamento || '____',
    });
  });

  // Effect para sincronización
  constructor(...) {
    super(...);
    effect(() => {
      this.aisdGroups();              // Dependencia 1
      this.ubicacionGlobal();          // Dependencia 2
      this.textoAISDFormateado();     // Dependencia 3
      this.cdRef.markForCheck();      // Re-render
    });
  }

  private generarTextoAISD(params: {
    comunidades: string;
    distrito: string;
    departamento: string;
  }): string {
    return SECCION2_TEMPLATES.textoAISDTemplate
      .replaceAll('{{comunidades}}', params.comunidades)
      .replace(/{{distrito}}/g, params.distrito)
      .replace(/{{departamento}}/g, params.departamento);
  }
}
```

---

## Casos de Uso Comunes

### 1. Heredar datos de otra sección

```typescript
// Obtener dato de sección 1
readonly datoSeccion1 = computed(() => 
  this.projectFacade.selectField('3.1.1', null, 'geoInfo')()
);

// Usar en sección 2
readonly textoConDatoHeredad = computed(() => {
  const dato1 = this.datoSeccion1();
  return PLANTILLA.replace(/{{dato1}}/g, dato1?.valor || '____');
});
```

### 2. Actualizar títulos de tablas dinámicamente

```typescript
readonly tituloTabla = computed(() => {
  const comunidad = this.comunidadActual();
  const año = this.añoSeleccionado();
  return `Población de ${comunidad} - ${año}`;
});
```

### 3. Modificar fuentes de tablas

```typescript
readonly fuenteTabla = computed(() => {
  const fuenteManual = this.projectFacade.selectField(...)();
  if (fuenteManual?.trim()) return fuenteManual;
  
  // Generar automáticamente
  const dato = this.datoRelevante();
  return `INEI (${new Date().getFullYear()}) - ${dato}`;
});
```

### 4. Párrafos con múltiples secciones

```typescript
readonly parrafoCompleto = computed(() => {
  const seccion1 = this.generarSeccion1();
  const seccion2 = this.generarSeccion2();
  const seccion3 = this.generarSeccion3();
  
  return `${seccion1}\n\n${seccion2}\n\n${seccion3}`;
});
```

### 5. Datos calculados desde tablas

```typescript
readonly totalesCalculados = computed(() => {
  const tabla = this.tablaDatos();
  return {
    total: tabla.reduce((sum, row) => sum + row.valor, 0),
    promedio: tabla.length > 0 
      ? tabla.reduce((sum, row) => sum + row.valor, 0) / tabla.length 
      : 0
  };
});
```

---

## Checklist para Refactorización

- [ ] Identificar datos fuente que deben ser reactivos
- [ ] Crear signals para datos fuente usando `projectFacade.selectField()`
- [ ] Crear computed signals para datos derivados
- [ ] Implementar funciones de generación de texto/tabla
- [ ] Usar `replaceAll()` para placeholders múltiples
- [ ] Agregar effect en constructor para sincronización
- [ ] Llamar `cdRef.markForCheck()` en effect
- [ ] Verificar ChangeDetectionStrategy.OnPush
- [ ] Probar cambios en tiempo real sin recargar

---

## Errores Comunes y Soluciones

### Error: "El computed no se actualiza"

**Causa**: No se accede al valor del signal en el effect.

```typescript
// ❌ No funciona
effect(() => {
  this.aisdGroups();  // Solo llama
});

// ✅ Funciona
effect(() => {
  const grupos = this.aisdGroups();  // Accede al valor
});
```

### Error: "Solo cambia el primer placeholder"

**Causa**: Usar `replace()` en lugar de `replaceAll()`.

```typescript
// ❌ Solo primero
.replace('{{placeholder}}', valor)

// ✅ Todos
.replaceAll('{{placeholder}}', valor)
```

### Error: "Necesito recargar para ver cambios"

**Causa**: El effect no tiene todas las dependencias.

```typescript
// ❌ Faltan dependencias
effect(() => {
  this.textoFormateado();  // Solo uno
});

// ✅ Todas las dependencias
effect(() => {
  this.datos1();
  this.datos2();
  this.datos3();
  this.textoFormateado();
});
```

---

## Recursos Adicionales

- [Angular Signals Documentation](https://angular.io/guide/signals)
- [Change Detection with Signals](https://angular.io/guide/change-detection)
- [Reactive State Management](https://angular.io/guide/observables-in-angular)

---

**Fecha de creación**: 2024
**Basado en**: Sección 2 - Delimitación de Áreas de Influencia Social
