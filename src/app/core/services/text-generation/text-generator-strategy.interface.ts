/**
 * Interfaz para estrategias de generación de texto
 * Permite diferentes implementaciones para diferentes secciones o contextos
 */
export interface TextGeneratorStrategy {
  /**
   * Identificador único de la estrategia (ej: 'seccion2', 'seccion3', etc.)
   */
  readonly sectionId: string;

  /**
   * Verifica si esta estrategia puede generar texto para el contexto dado
   */
  puedeGenerar(contexto: TextGenerationContext): boolean;

  /**
   * Genera el texto según el contexto y los datos proporcionados
   */
  generarTexto(datos: any, contexto: TextGenerationContext): string;
}

/**
 * Contexto para la generación de texto
 */
export interface TextGenerationContext {
  /**
   * ID de la sección (ej: '3.1.2', '3.1.3')
   */
  sectionId: string;

  /**
   * Tipo de texto a generar (ej: 'introduccion', 'completo', 'metodologia')
   */
  textType: string;

  /**
   * Parámetros adicionales específicos del contexto
   */
  params?: Record<string, any>;
}
