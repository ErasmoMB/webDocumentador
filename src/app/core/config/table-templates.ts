/**
 * TABLE_TEMPLATES - Registry de estructuras iniciales para tablas dinámicas
 * 
 * PATRÓN: Registry Pattern con TypeScript `as const`
 * 
 * BENEFICIOS:
 * - Single Source of Truth: Cambios en UN solo lugar
 * - Reutilizable: Múltiples secciones usan mismos templates
 * - Type Safety: TypeScript infiere tipos automáticamente
 * - Mantenible: Fácil agregar/modificar templates
 * 
 * USO:
 * ```typescript
 * import { TABLE_TEMPLATES } from '@core/config/table-templates';
 * 
 * estructuraInicial: structuredClone(TABLE_TEMPLATES.EDAD_RANGES_PET)
 * ```
 * 
 * NOTA: Usar structuredClone() para obtener copia profunda sin mutación
 */

export const TABLE_TEMPLATES = {
  /**
   * Rangos de edad para Población Económicamente Activa (PET)
   * Secciones: 7, 8 (Aspectos económicos)
   * Rango: 15 años a más (edad laboral)
   */
  EDAD_RANGES_PET: [
    { categoria: '15 a 29 años', casos: 0 },
    { categoria: '30 a 44 años', casos: 0 },
    { categoria: '45 a 64 años', casos: 0 },
    { categoria: '65 años a más', casos: 0 }
  ],

  /**
   * Rangos de edad para Población Total (Demografía)
   * Secciones: 6 (Aspectos demográficos)
   * Rango: 0 años a más (toda la población)
   */
  EDAD_RANGES_POBLACION: [
    { categoria: '0 a 14 años', casos: 0 },
    { categoria: '15 a 29 años', casos: 0 },
    { categoria: '30 a 44 años', casos: 0 },
    { categoria: '45 a 64 años', casos: 0 },
    { categoria: '65 años a más', casos: 0 }
  ],

  /**
   * Categorías de sexo (Hombre/Mujer)
   * Secciones: 6, y otras que requieran desagregación por sexo
   */
  SEXO_CATEGORIAS: [
    { sexo: 'Hombres', casos: 0 },
    { sexo: 'Mujeres', casos: 0 }
  ],

  /**
   * Fila vacía por defecto
   * Usar cuando no hay estructura predefinida
   */
  FILA_VACIA: [
    { categoria: '', casos: 0 }
  ]
} as const;

/**
 * Helper para clonar templates sin mutación
 * Usa structuredClone (nativo en navegadores modernos)
 */
export function cloneTemplate<T>(template: readonly T[]): T[] {
  return structuredClone(template as T[]);
}
