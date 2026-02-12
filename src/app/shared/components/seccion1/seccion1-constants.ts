/**
 * ✅ SECCION1_CONSTANTS
 * Constantes centralizadas para Sección 1 - Ubicación del Proyecto
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados
 */

export const SECCION1_WATCHED_FIELDS: string[] = [
  'parrafoSeccion1_principal',
  'parrafoSeccion1_4',
  'objetivosSeccion1',
  'projectName',
  'distritoSeleccionado',
  'provinciaSeleccionada',
  'departamentoSeleccionado',
  'geoInfo',
  'centrosPobladosJSON',
  'jsonFileName',
  'jsonCompleto',
  'comunidadesCampesinas',
  // Fotos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion1${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion1${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion1${i + 1}Imagen`),
];

export const SECCION1_SECTION_ID = '3.1.1';
export const SECCION1_DEFAULT_SUBSECTION = '3.1.1';

export const SECCION1_CONFIG = {
  sectionId: '3.1.1',
  title: 'Ubicación del Proyecto',
  photoPrefix: 'fotografiaSeccion1',
  maxPhotos: 10,
};

export const OBJETIVO_DEFAULT_1 = 'Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera {projectName}.';

export const OBJETIVO_DEFAULT_2 = 'Brindar información básica de los poblados comprendidos en el área de influencia social donde se realizará el Proyecto que sirvan de base para poder determinar los posibles impactos sociales a originarse en esta primera etapa de exploración y, por ende, prevenir, reducir o mitigar las consecuencias negativas y potenciar las positivas.';

export const SECCION1_TEMPLATES = {
  // Títulos
  TITULO_FORM: '3.1. DESCRIPCIÓN Y CARACTERIZACIÓN - EDICIÓN',
  TITULO_VIEW: '3.1. DESCRIPCIÓN Y CARACTERIZACIÓN DE LOS ASPECTOS SOCIALES, CULTURALES Y ANTROPOLÓGICOS',
  SUBTITULO: 'Información geográfica, objetivos y fotografías',
  SECCION_OBJETIVOS: '3.1.1 Objetivos de la línea base social',
  
  // Labels del Formulario
  labelNombreProyecto: 'Nombre del Proyecto',
  labelSubirUBIGEO: 'Subir UBIGEO de Centro Poblado',
  labelInformacionGeografica: 'Información Geográfica',
  labelDepartamento: 'Departamento',
  labelProvincia: 'Provincia',
  labelDistrito: 'Distrito',
  labelParrafoPrincipal: 'Párrafo Principal',
  labelIntroduccionObjetivos: 'Introducción a Objetivos',
  labelObjetivos: 'Objetivos de la Línea Base Social',
  labelObjetivoN: 'Objetivo',
  labelFotografias: 'Fotografías',
  
  // Placeholders
  placeholderNombreProyecto: 'Ej: Proyecto Minero de Exploración',
  placeholderDepartamento: 'Ingrese el departamento',
  placeholderProvincia: 'Ingrese la provincia',
  placeholderDistrito: 'Ingrese el distrito',
  placeholderObjetivo: 'Escriba el objetivo...',
  placeholderFotoTitulo: 'Ej: Fotografía de la sección 1',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  
  // Hints
  hintParrafoPrincipal: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintIntroduccionObjetivos: 'Edite el texto completo. Deje vacío para usar el texto por defecto.',
  hintSeleccionarJSON: 'Seleccione un archivo JSON con datos de centros poblados',
  hintGeoAutomatica: 'Se completa automáticamente desde el JSON, pero puede editarlo',
  
  // Mensajes
  mensajeArchivoNoSeleccionado: 'Ningún archivo seleccionado',
  
  // Labels de Fotografías (Vista)
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
  
  // Labels de Fotografías (Formulario)
  labelFotoTituloCompleto: 'Título de la fotografía',
  labelFotoFuenteCompleto: 'Fuente de la fotografía',
  labelFotoImagenCompleto: 'Fotografía - Imagen',
  
  // Valores por defecto de Fotografías
  tituloFotoDefault: 'Sección 1',
  fuenteFotoDefault: 'GEADES, 2024',

  // Textos de secciones del formulario
  seccionInfoProyecto: 'Información del Proyecto',
  seccionCargarDatos: 'Cargar Datos de Centros Poblados',
  seccionEditarParrafos: 'Editar Párrafos',

  // Botones
  botonSeleccionarArchivo: 'Seleccionar archivo',
  botonAgregar: '➕ Agregar',
  botonEliminar: '🗑️ Eliminar',

  // Sección Objetivos
  seccionObjetivos: 'Objetivos Dinámicos',
} as const;
