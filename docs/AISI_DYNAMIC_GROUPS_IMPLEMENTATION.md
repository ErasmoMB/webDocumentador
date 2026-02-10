# Implementación de Grupos AISI Dinámicos con Prefijos

## Resumen

Este documento describe cómo se implementó el sistema de grupos AISI (Área de Influencia Social Indirecta) dinámicos para la Sección 21, permitiendo crear múltiples sub-secciones (B.1, B.2, B.3, etc.) con datos completamente aislados entre sí.

## Problema Original

Cuando se creaban múltiples grupos AISI (B.1, B.2, B.3), todos compartían los mismos datos porque los campos estaban hardcodeados sin prefijos:

```typescript
// ❌ ANTES: Todos los grupos compartían el mismo campo
datos['centroPobladoAISI'] = 'Cahuacho'; // Compartido por todos
datos['ubicacionCpTabla'] = [...];        // Compartido por todos
PHOTO_PREFIX = 'fotografiaCahuacho';       // Compartido por todos
```

Esto causaba que:
- B.1 mostrara datos de B.6
- Las fotografías se mezclaran entre grupos
- Los títulos mostraran valores incorrectos

## Solución: Sistema de Prefijos Dinámicos

### 1. Arquitectura del Sistema de Prefijos

El sistema se basa en extraer un prefijo del ID de sección y usarlo para nombrar todos los campos:

```
ID de sección: 3.1.4.B.1
Prefijo extraído: _B1

Campos con prefijo:
- centroPobladoAISI_B1
- ubicacionCpTabla_B1
- fotografiaCahuacho_B1
- cuadroTituloUbicacionCp_B1
- cuadroFuenteUbicacionCp_B1
```

### 2. Componentes Clave

#### PrefijoHelper (`prefijo-helper.ts`)

```typescript
export class PrefijoHelper {
  /**
   * Extrae el prefijo del grupo AISI/AISD de un ID de sección
   * Ejemplo: '3.1.4.B.1' → '_B1', '3.1.4.A.1' → '_A1'
   */
  static obtenerPrefijoGrupo(seccionId: string): string {
    const match = seccionId.match(/[A-Z]\.\d+$/);
    if (match) {
      const grupo = match[0]; // ej: "B.1"
      return '_' + grupo.replace(/\./g, ''); // ej: "_B1"
    }
    return '';
  }

  /**
   * Obtiene el valor de un campo aplicando el prefijo del grupo
   */
  static obtenerValorConPrefijo(
    datos: Record<string, any>,
    campoBase: string,
    seccionId: string
  ): any {
    const prefijo = this.obtenerPrefijoGrupo(seccionId);
    const campoConPrefijo = campoBase + prefijo;
    return datos[campoConPrefijo] ?? datos[campoBase] ?? null;
  }
}
```

#### BaseSectionComponent (`base-section.component.ts`)

```typescript
export class BaseSectionComponent {
  protected obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  protected logGrupoActual(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    console.log(`[${this.seccionId}] Prefijo: ${prefijo}`);
  }
}
```

### 3. Implementación en Seccion21FormComponent

#### PHOTO_PREFIX Dinámico

```typescript
// En el constructor
const prefijo = this.obtenerPrefijoGrupo();
this.PHOTO_PREFIX = prefijo 
  ? `fotografiaCahuacho${prefijo}`  // fotografiaCahuacho_B1
  : 'fotografiaCahuacho';
```

#### Signals con Prefijos

```typescript
readonly parrafoAisiSignal: Signal<string> = computed(() => {
  const centro = PrefijoHelper.obtenerValorConPrefijo(
    this.formDataSignal(), 
    'centroPobladoAISI', 
    this.seccionId
  );
  return `...CP ${centro}, capital distrital...`;
});

readonly centroPobladoAisiSignal: Signal<string> = computed(() => {
  return this.getCentroPobladoAISI() || '____';
});

getCentroPobladoAISI(): string {
  const data = this.formDataSignal();
  return PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId);
}
```

#### Tabla de Ubicación con Prefijo

```typescript
getTablaKeyUbicacionCp(): string {
  const prefijo = this.obtenerPrefijoGrupo();
  return prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
}

get ubicacionCpConfig(): any {
  return {
    tablaKey: this.getTablaKeyUbicacionCp(),
    estructuraInicial: [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }]
  };
}
```

### 4. Implementación en Seccion21ViewComponent

#### Actualización de Títulos Dinámicos

```typescript
protected override actualizarTitulo(): void {
  const grupoAISI = this.obtenerGrupoAISI();
  const centro = PrefijoHelper.obtenerValorConPrefijo(
    this.datos, 
    'centroPobladoAISI', 
    this.seccionId
  );
  
  this.setTitle(`3.1.4.${grupoAISI} - ${centro || '____'}`);
}
```

#### Restauración de Valores con Prefijo

```typescript
protected override actualizarValoresConPrefijo(): void {
  const prefijo = this.obtenerPrefijoGrupo();
  
  // Restaurar centroPobladoAISI
  const centroPrefijado = `centroPobladoAISI${prefijo}`;
  if (this.datos[centroPrefijado]) {
    this.datos['centroPobladoAISI'] = this.datos[centroPrefijado];
  }
  
  // Restaurar tabla de ubicación
  const tablaPrefijada = `ubicacionCpTabla${prefijo}`;
  if (this.datos[tablaPrefijada]) {
    this.datos['ubicacionCpTabla'] = this.datos[tablaPrefijada];
  }
}
```

### 5. Plantilla HTML con Signals Dinámicos

```html
<!-- Título del grupo B.1 -->
<h4 class="section-title">B.1. Centro Poblado {{ centroPobladoAisiSignal() }}</h4>

<!-- Label de fotografías -->
<label class="label">{{ labelFotografiasSignal() }}</label>

<!-- Placeholder del título del cuadro -->
<input type="text" 
  placeholder="Ubicación referencial – Centro Poblado {{ centroPobladoAisiSignal() }}">

<!-- Placeholder de fotografías -->
<app-image-upload
  placeholderTitulo="Ej: {{ tituloDefaultFotoSignal() }}"
  tituloDefault="{{ tituloDefaultFotoSignal() }}">
</app-image-upload>
```

### 6. Routing Dinámico

En `seccion.component.ts`:

```typescript
resolveComponentId(seccionId: string): string {
  const match = seccionId.match(/^3\.1\.4\.([A-Z])\.(\d+)$/);
  if (match) {
    const grupo = match[1]; // 'A' o 'B'
    const numero = match[2]; // '1', '2', '3', etc.
    
    // Si es seccion21 con grupo B y número >= 1
    if (grupo === 'B' && Number(numero) >= 1) {
      return 'app-seccion21'; // Usar componente seccion21
    }
  }
  return `app-${seccionId.replace(/\./g, '-')}`;
}
```

## Resultado

### Antes de la Implementación

| Grupo | Centro Poblado Mostrado | Problema |
|-------|-------------------------|----------|
| B.1 | Cahuacho | Incorrecto |
| B.2 | Cahuacho | Incorrecto |
| B.3 | Cahuacho | Incorrecto |

### Después de la Implementación

| Grupo | Centro Poblado Mostrado | Datos Aislados |
|-------|-------------------------|----------------|
| B.1 | Distrito 4 | ✅ |
| B.2 | Distrito 3 | ✅ |
| B.3 | [nombre del grupo] | ✅ |

## Archivos Modificados

1. `webDocumentador/src/app/shared/utils/prefijo-helper.ts` - Nuevo archivo
2. `webDocumentador/src/app/shared/components/base-section.component.ts` - Añadido `obtenerPrefijoGrupo()`
3. `webDocumentador/src/app/shared/components/seccion21/seccion21-form.component.ts` - PHOTO_PREFIX y campos dinámicos
4. `webDocumentador/src/app/shared/components/seccion21/seccion21-form.component.html` - Plantilla con signals
5. `webDocumentador/src/app/shared/components/seccion21/seccion21-view.component.ts` - Títulos y valores con prefijos
6. `webDocumentador/src/app/pages/seccion/seccion.component.ts` - Routing dinámico

## Cómo Agregar Nuevos Grupos AISI

1. El usuario crea un nuevo grupo AISI desde la interfaz
2. Se genera automáticamente un ID como `3.1.4.B.4`
3. El sistema extrae el prefijo `_B4`
4. Todos los campos se guardan con el prefijo `_B4`
5. Los datos quedan completamente aislados de otros grupos

## Consideraciones Futuras

- El sistema es extensible a otras secciones que necesiten grupos dinámicos
- Se puede aplicar el mismo patrón a AISD (Área de Influencia Social Directa)
- Los prefijos funcionan con cualquier número de grupos (B.1 a B.N)
