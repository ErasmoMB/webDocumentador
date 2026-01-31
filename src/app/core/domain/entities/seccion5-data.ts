/**
 * Representa una institución en la tabla de instituciones
 */
export interface Institucion {
  /** Categoría o nombre de la institución */
  categoria: string;
  /** Disponibilidad (SI/NO) */
  respuesta: string;
  /** Ubicación específica */
  comentario: string;
}

/**
 * Datos de la sección 5 - Institucionalidad local
 * Maneja información sobre la estructura organizativa de la comunidad
 */
export interface Seccion5Data {
  /** Párrafo descriptivo sobre la institucionalidad */
  parrafoSeccion5_institucionalidad?: string;

  /** Nombre del grupo/comunidad AISD */
  grupoAISD?: string;

  /** Título personalizado para la tabla de instituciones */
  tituloInstituciones?: string;

  /** Fuente de los datos de instituciones */
  fuenteInstituciones?: string;

  /** Tabla de instituciones existentes */
  tablepagina6?: Institucion[];

  /** Lista de comunidades campesinas (para contextos multi-comunidad) */
  comunidadesCampesinas?: Array<{ nombre: string }>;
}
