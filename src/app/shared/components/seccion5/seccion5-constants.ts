/**
 * ✅ SECCION5_CONSTANTS
 * Constantes centralizadas para Sección 5 - Institucionalidad AISD
 * - Campos observados para persistencia
 * - Configuración de fotos
 * - Configuración de tablas
 * - IDs de sección
 */

import { TableConfig } from 'src/app/core/services/tables/table-management.service';

export const SECCION5_WATCHED_FIELDS = [
  'parrafoSeccion5_institucionalidad',
  'institucionesSeccion5',
  'tituloInstituciones',
  'fuenteInstituciones',
  'grupoAISD',
  // Variantes con prefijos
  'parrafoSeccion5_institucionalidad_A1',
  'parrafoSeccion5_institucionalidad_A2',
  'institucionesSeccion5_A1',
  'institucionesSeccion5_A2',
  'tituloInstituciones_A1',
  'tituloInstituciones_A2',
  'fuenteInstituciones_A1',
  'fuenteInstituciones_A2',
  'grupoAISD_A1',
  'grupoAISD_A2',
  // Fotos con prefijos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaInstitucionalidad${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaInstitucionalidad${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaInstitucionalidad${i + 1}Imagen`),
];

export const SECCION5_PHOTO_PREFIX = {
  INSTITUCIONALIDAD: 'fotografiaInstitucionalidad'
} as const;

export const SECCION5_SECTION_ID = '3.1.4.A.1.1';
export const SECCION5_DEFAULT_SUBSECTION = '3.1.4.A.1.1';

/**
 * ✅ CONFIGURACIÓN DE TABLAS - SECCIÓN 5
 */

/**
 * Configuración para tabla de Instituciones (Cuadro N° 3.4)
 * Tabla de instituciones con SI/NO dinámico para disponibilidad
 */
export const SECCION5_TABLA_INSTITUCIONES_CONFIG: TableConfig = {
  tablaKey: 'tablepagina6',
  totalKey: 'institucion'
};

/**
 * Definición de columnas para tabla de Instituciones
 * Incluye: Institución, Disponibilidad (SI/NO), Ubicación
 */
export const SECCION5_COLUMNAS_INSTITUCIONES = [
  {
    field: 'categoria',
    label: 'Institución',
    type: 'text' as const,
    placeholder: 'Nombre de institución'
  },
  {
    field: 'respuesta',
    label: 'Disponibilidad',
    type: 'select' as const,
    allowedValues: ['SI', 'NO'],
    placeholder: 'Seleccionar'
  },
  {
    field: 'comentario',
    label: 'Ubicación',
    type: 'text' as const,
    placeholder: 'Ubicación específica'
  }
];

export const SECCION5_CONFIG = {
  sectionId: SECCION5_DEFAULT_SUBSECTION,
  title: 'Institucionalidad local',
  photoPrefix: SECCION5_PHOTO_PREFIX.INSTITUCIONALIDAD,
  maxPhotos: 10
} as const;

/**
 * ✅ SECCION5_TEMPLATES - Todos los textos visibles
 */
export const SECCION5_TEMPLATES = {
  // Títulos y encabezados
  tituloSeccion: 'Institucionalidad local',
  tituloSubseccion: 'Institucionalidad local — Editor',
  tituloEditarParrafos: 'Editar Párrafos',
  tituloVista: 'Institucionalidad local del Área de Influencia Social Directa',
  labelInstitucionalidadLocal: 'Institucionalidad local',

  // Labels
  labelInstitucionalidad: 'Institucionalidad - Texto Completo',
  labelInstituciones: 'Instituciones existentes – CC {COMUNIDAD}',
  labelTituloTabla: 'Título del Cuadro',
  labelTablaInstituciones: 'Tabla de Instituciones Existentes',
  labelFuenteTabla: 'Fuente del Cuadro',
  labelFotografias: 'Fotografías de Institucionalidad',
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',
  labelFuente: 'FUENTE',

  // Hints
  hintInstitucionalidad: 'Edite todo el bloque de texto sobre institucionalidad. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // Placeholders
  placeholderTituloTabla: 'Ej: Instituciones existentes – CC {{nombreComunidad}}',
  placeholderFuenteTabla: 'Ej: GEADES (2024)',
  placeholderProfesor: 'Ej: Local Comunal de la CC {{nombreComunidad}}',
  placeholderFotoFuente: 'Ej: GEADES, 2024',

  // Defaults
  tituloTablaDefault: 'Instituciones existentes – CC {{nombreComunidad}}',
  photoDefaultTitle: 'Local Comunal de la CC {COMUNIDAD}',
  fotoTituloDefault: 'Local Comunal de la CC {{nombreComunidad}}',
  fotoFuenteDefault: 'GEADES, 2024',
  fuenteTablaDefault: 'GEADES (2024)',
  sourceGeadesDefault: 'GEADES (2024)',

  // Textos por defecto para párrafos
  institucionalidadDefault: `En el siguiente cuadro se presentan las instituciones públicas y privadas que se encuentran dentro del Área de Influencia Social Directa (AISD) de la CC {{nombreComunidad}}, incluyendo cuáles de ellas se encuentran disponibles dentro de los límites de la comunidad.

Según el trabajo de campo realizado, las instituciones identificadas son las siguientes:`,

  // Texto largo para obtenerTextoInstitucionalidad()
  textoInstitucionalidadLargo: `La CC {COMUNIDAD} posee una estructura organizativa que responde a sus necesidades locales y a los principios de autogobierno indígena. La asamblea general comunal es la máxima autoridad, integrada por todos los comuneros hábiles que participan activamente en la toma de decisiones. Este sistema de gobierno rotativo permite que diversos miembros de la comunidad asuman responsabilidades de liderazgo, fortaleciendo así la distribución equitativa del poder y la representación de los intereses colectivos.

La organización comunal incluye diversas instituciones que trabajan de manera coordinada para cumplir con las funciones administrativas, educativas y sanitarias que requiere la comunidad. Entre las principales instituciones se encuentran la Asamblea General, la Junta Directiva Comunal, las organizaciones de base como las rondas campesinas, las instituciones educativas, los centros de salud, y las organizaciones de mujeres. Cada una de estas instituciones tiene responsabilidades específicas que contribuyen al bienestar integral de la comunidad.`,

  // Labels tabla
  labelColumnaInstitucion: 'Institución',
  labelColumnaDisponibilidad: 'Disponibilidad',
  labelColumnaUbicacion: 'Ubicación',

  // Valores tabla
  valorSI: 'SI',
  valorNO: 'NO',

  // Placeholders vacíos
  placeholderVacio: '____'
} as const;
