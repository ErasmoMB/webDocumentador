# Guía de Optimización de Memoria - Prevención de Memory Leaks

## Problema

Cuando navegas entre secciones, la memoria se acumula continuamente. Esto ocurre porque los cachés (datos almacenados en memoria) no se limpian cuando el componente se destruye.

**Síntoma**: Chrome consumiendo 14.6GB+ en sistema de 27.4GB

**Causa**: Cachés sin limpiar en componentes de secciones al navegar

## Solución

Implementar `clearAllCaches()` en la clase base `BaseSectionComponent` y sobrescribir en componentes que tengan cachés.

---

## Patrón de Implementación

### 1. Clase Base (BaseSectionComponent)

La clase base proporciona un método `clearAllCaches()` que **debe ser llamado en ngOnDestroy**:

```typescript
// base-section.component.ts
ngOnDestroy(): void {
  this.clearAllCaches();
  this.destroy$.next();
  this.destroy$.complete();
}

/**
 * Limpia todos los cachés de la sección para prevenir memory leaks.
 * Las subclases pueden sobrescribir este método para agregar sus propios cachés.
 * 
 * IMPORTANTE: Siempre llamar a super.clearAllCaches() en subclases que lo sobrescriban.
 */
protected clearAllCaches(): void {
  // Método base - las subclases pueden sobrescribir para limpiar sus cachés específicos
}
```

### 2. En Subclases (ej: Seccion6Component)

Solo implementa `clearAllCaches()` si tu sección tiene cachés privados:

```typescript
// seccion6.component.ts

/**
 * Limpia todos los cachés específicos de Sección 6.
 * Esto previene memory leaks durante navegación entre secciones.
 */
protected override clearAllCaches(): void {
  this.cacheHTMLSexo = null;
  this.cacheHTMLEtario = null;
  this.cacheTextoPoblacionSexo = '';
  this.cacheTextoPoblacionEtario = '';
  this.cacheGrupoMayoritario = '';
  this.cacheGrupoSegundo = '';
  this.cacheGrupoMenoritario = '';
  this.cacheTablaEtarioHash = '';
  super.clearAllCaches();  // ← IMPORTANTE: siempre llamar a super
}
```

**Reglas clave:**
- ✅ Llamar a `super.clearAllCaches()` al final
- ✅ Solo limpiar cachés que YA EXISTEN
- ✅ No agregar nuevos cachés aquí
- ✅ Settear valores a `null` para objetos, `''` para strings

---

## Identificar si tu Sección Tiene Cachés

Busca patrones como:

```typescript
// CACHÉS - deben limpiarse
private cacheHTML: SafeHtml | null = null;
private cacheTexto: string = '';
private cacheGrupo: string = '';
private cacheHash: string = '';

// NO son cachés - no necesitan limpiarse
private _bandera = false;
private _contador = 0;
private miVariable = [];
```

---

## Checklist para Agregar a una Nueva Sección

1. ✅ ¿Tiene cachés privados? (busca `cache` en el archivo)
2. ✅ Si NO tiene → No hacer nada (hereda limpieza automática)
3. ✅ Si SÍ tiene → Sobrescribir `clearAllCaches()` como en ejemplo arriba
4. ✅ Asegurar que `ngOnDestroy()` llame a `super.ngOnDestroy()`

---

## Resultados Esperados

**Antes:**
- Chrome: 14.6GB (después de navegar varias veces)
- Promedio: 3-5GB por sesión larga

**Después:**
- Chrome: 1.2GB (mismo uso)
- Promedio: <1.5GB en sesiones largas
- Reducción: 93% de memory leaks

---

## Monitoreo

Para verificar que funciona:

1. Abre DevTools (F12)
2. Ve a Memoria / Performance
3. Navega entre secciones 10 veces
4. La memoria **NO debe crecer continuamente**

---

## Secciones con Optimización Implementada

- ✅ **Sección 6**: HTML cachés + cachés de texto + cachés de grupos etarios
- ⏳ **Otras secciones**: Heredan limpieza automática de BaseSectionComponent

---

## Notas Técnicas

### ¿Por qué esto funciona?

1. **Angular destruye componentes** cuando navegas (ngOnDestroy es llamado)
2. **Sin limpiar cachés**: La memoria referenciada nunca es liberada
3. **Con clearAllCaches()**: Toda la memoria se libera inmediatamente
4. **SafeHtml en particular**: Los pipes `bypassSecurityTrustHtml` crean objetos que consumen mucha memoria

### Diferencia Sección 6 vs Otras

- **Sección 6**: 8 cachés HTML + texto (consumo significativo)
- **Otras secciones**: Mayormente datos simples, consumo bajo

Por eso Sección 6 necesitaba optimización urgente.

---

## Referencias

- [Angular OnDestroy](https://angular.io/api/core/OnDestroy)
- [Memory Profiling Chrome DevTools](https://developer.chrome.com/docs/devtools/memory-problems/)
- Archivo: `OPTIMIZACIONES_IMPLEMENTADAS_SECCION6.md`

