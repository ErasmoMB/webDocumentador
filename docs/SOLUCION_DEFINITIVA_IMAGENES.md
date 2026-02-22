# Solución Definitiva para Imágenes en Secciones

## Problema Original

Las secciones 26, 27 y 30 presentaban tres problemas:
1. No se mostraba la imagen ingresada en la vista
2. No permitía editar el título y fuente de la imagen
3. No tenía persistencia

## Causa Raíz

El problema principal era la **duplicación del grupo en las keys** de las fotografías:

```typescript
// ❌ INCORRECTO: El prefijo ya incluía el grupo
readonly photoPrefixSignalDesechos: Signal<string> = computed(() => {
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId); // _B1
  return `fotografiaDesechosSolidosAISI${prefijo}`; // fotografiaDesechosSolidosAISI_B1
});

// Luego en onFotografiasChange:
const imgKey = `${prefix}${i}Imagen${groupPrefix}`; 
// Resultado: fotografiaDesechosSolidosAISI_B11Imagen_B1 (DUPLICADO!)
```

## Solución

### 1. PhotoPrefixSignal debe retornar solo la base (sin grupo)

```typescript
// ✅ CORRECTO: Solo la base, sin grupo
readonly photoPrefixSignalDesechos: Signal<string> = computed(() => {
  return 'fotografiaDesechosSolidosAISI';
});
```

### 2. El grupo se pasa por separado a loadImages

```typescript
// ✅ CORRECTO: Pasar el grupo como tercer parámetro
const grupo = this.obtenerPrefijo(); // _B1
const fotos = this.imageService.loadImages(
  this.seccionId, 
  this.photoPrefixSignalDesechos(), // fotografiaDesechosSolidosAISI
  grupo // _B1
);
// Resultado correcto: fotografiaDesechosSolidosAISI1Imagen_B1
```

### 3. onFotografiasChange debe usar el prefijo base y agregar el grupo

```typescript
override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
  const prefix = customPrefix || ''; // fotografiaDesechosSolidosAISI
  const groupPrefix = this.obtenerPrefijo(); // _B1
  
  // Keys correctas: fotografiaDesechosSolidosAISI1Imagen_B1
  const imgKey = `${prefix}${i}Imagen${groupPrefix}`;
}
```

## Archivos Modificados

### seccion26-form.component.ts
- `photoPrefixSignalDesechos`: retorna `'fotografiaDesechosSolidosAISI'`
- `photoPrefixSignalElectricidad`: retorna `'fotografiaElectricidadAISI'`
- `photoPrefixSignalCocinar`: retorna `'fotografiaEnergiaCocinarAISI'`
- Llamadas a `loadImages` actualizadas para pasar el grupo

### seccion26-view.component.ts
- `photoPrefixSignalDesechos`, `photoPrefixSignalElectricidad`, `photoPrefixSignalCocinar`: retornan solo la base
- Llamadas a `loadImages` actualizadas para pasar el grupo

### seccion27-form.component.ts
- `photoPrefixSignalTransporte`: retorna `'fotografiaTransporteAISI'`
- `photoPrefixSignalTelecomunicaciones`: retorna `'fotografiaTelecomunicacionesAISI'`

### seccion27-view.component.ts
- `photoPrefixSignalTransporte`, `photoPrefixSignalTelecomunicaciones`: retornan solo la base
- Llamadas a `loadImages` actualizadas para pasar el grupo

## Vista: Mostrar Título y Fuente

Para mostrar el título y fuente en la vista, agregar atributos `[mostrarTitulo]` y `[mostrarFuente]`:

```html
<!-- ✅ CORRECTO -->
<app-image-upload 
  [modoVista]="true" 
  [fotografias]="viewModel().fotosDesechos" 
  [mostrarTitulo]="true" 
  [mostrarFuente]="true">
</app-image-upload>
```

## Persistencia

La persistencia se maneja en `onFotografiasChange` usando dos capas:

```typescript
// Capa 1: ProjectFacade
this.projectFacade.setFields(this.seccionId, null, updates);

// Capa 2: Backend
this.formChange.persistFields(this.seccionId, 'images', updates);
```

## Patrón General

Para cualquier sección nueva que use imágenes:

1. **Definir photoPrefixSignal** - retornar solo la base (sin grupo)
2. **Llamar loadImages** con el grupo como tercer parámetro
3. **En onFotografiasChange** - usar prefijo base y agregar grupo para crear keys
4. **En view** - agregar `[mostrarTitulo]="true"` y `[mostrarFuente]="true"`

## Ejemplo de Keys Correctas

- Input: prefix=`fotografiaDesechosSolidosAISI`, group=`_B1`, index=`1`
- Output: `fotografiaDesechosSolidosAISI1Imagen_B1`
- Output: `fotografiaDesechosSolidosAISI1Titulo_B1`
- Output: `fotografiaDesechosSolidosAISI1Fuente_B1`
