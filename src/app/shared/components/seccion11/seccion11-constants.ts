/**
 * Constantes compartidas para Sección 11 - Transporte y Telecomunicaciones
 * Usadas en form y view para evitar duplicación
 */

export const SECCION11_SECTION_ID = '3.1.4.A.1.7';
export const SECCION11_DEFAULT_SUBSECTION = '3.1.4.A.1.7';

export const SECCION11_CONFIG = {
  sectionId: SECCION11_SECTION_ID,
  title: 'A.1.7. Infraestructura en transportes y comunicaciones',
  photoPrefix: 'fotografiaTransporte',
  maxPhotos: 10
} as const;

export const SECCION11_PHOTO_PREFIX_TRANSPORTE = 'fotografiaTransporte';
export const SECCION11_PHOTO_PREFIX_TELECOMUNICACIONES = 'fotografiaTelecomunicaciones';

// ✅ Todos los campos persistentes
export const SECCION11_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'provinciaSeleccionada',
  'distritoSeleccionado',
  'parrafoSeccion11_transporte_completo',
  'parrafoSeccion11_telecomunicaciones_completo',
  'costoTransporteMinimo',
  'costoTransporteMaximo',
  'telecomunicacionesTabla',
  'tituloTelecomunicaciones',
  'fuenteTelecomunicaciones',
  // Fotos Transporte (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTransporte${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTransporte${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTransporte${i + 1}Imagen`),
  // Fotos Telecomunicaciones (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTelecomunicaciones${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTelecomunicaciones${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTelecomunicaciones${i + 1}Imagen`),
];

/**
 * ✅ SECCION11_TEMPLATES - TODOS LOS TEXTOS VISIBLES
 */
export const SECCION11_TEMPLATES = {
  // Títulos y encabezados
  tituloSeccion: 'A.1.7. Infraestructura en transportes y comunicaciones',
  tituloEditarParrafos: 'Editar Párrafos',
  tituloVista: 'A.1.7. Infraestructura en transportes y comunicaciones',

  // Subtítulos de secciones
  subtituloTransporte: 'a. Transporte',
  subtituloTelecomunicaciones: 'b. Telecomunicaciones',

  // Labels para párrafos
  labelTransporteParagrafo: 'Transporte - Texto Completo',
  labelTelecomunicacionesParagrafo: 'Telecomunicaciones - Texto Completo',

  // Hints para párrafos
  hintTransporte: 'Edite todo el bloque de texto sobre transporte. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintTelecomunicaciones: 'Edite todo el bloque de texto sobre telecomunicaciones. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintParrafo: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // Costo de transporte
  labelCostoMinimo: 'Costo Transporte Mínimo (S/.)',
  labelCostoMaximo: 'Costo Transporte Máximo (S/.)',
  placeholderCostoMinimo: '0',
  placeholderCostoMaximo: '0',

  // Fotografías Transporte
  labelFotografiasTransporte: 'Fotografías de Transporte',
  labelTituloFotoTransporte: 'Título de la fotografía',
  labelFuenteFotoTransporte: 'Fuente de la fotografía',
  labelImagenFotoTransporte: 'Fotografía - Imagen',
  placeholderTituloFotoTransporte: 'Ej: Infraestructura de transporte en la CC Ayroca',
  placeholderFuenteFotoTransporte: 'Ej: GEADES, 2024',
  tituloDefaultFotoTransporte: 'Infraestructura de transporte en la CC Ayroca',
  fuenteDefaultFotoTransporte: 'GEADES, 2024',

  // Telecomunicaciones - Títulos y Fuentes
  labelTituloTelecomunicaciones: 'Título de la Tabla',
  placeholderTituloTelecomunicaciones: 'Servicios de telecomunicaciones – CC ____',
  labelTablaTelecomunicaciones: 'Tabla Servicios de Telecomunicaciones',
  labelFuenteTelecomunicaciones: 'Fuente de la Tabla',
  placeholderFuenteTelecomunicaciones: 'GEADES (2024)',

  // Columnas de tabla
  labelMedioComunicacion: 'Medio de comunicación',
  labelDescripcion: 'Descripción',
  placeholderMedioComunicacion: 'Emisoras de radio',
  placeholderDescripcion: '--',

  // Fotografías Telecomunicaciones
  labelFotografiasTelecomunicaciones: 'Fotografías de Telecomunicaciones',
  labelTituloFotoTelecomunicaciones: 'Título de la fotografía',
  labelFuenteFotoTelecomunicaciones: 'Fuente de la fotografía',
  labelImagenFotoTelecomunicaciones: 'Fotografía - Imagen',
  placeholderTituloFotoTelecomunicaciones: 'Ej: Vivienda con antena de DIRECTV en el anexo Ayroca',
  placeholderFuenteFotoTelecomunicaciones: 'Ej: GEADES, 2024',
  tituloDefaultFotoTelecomunicaciones: 'Vivienda con antena de DIRECTV en el anexo Ayroca',
  fuenteDefaultFotoTelecomunicaciones: 'GEADES, 2024',

  // Encabezados genéricos
  seccionEditarParrafos: 'Editar Párrafos',

  // Placeholders genéricos
  placeholderVacio: '____'
} as const;

// Configuración de tablas
export const SECCION11_TABLE_CONFIGS = {
  TELECOMUNICACIONES: {
    tablaKeyBase: 'telecomunicacionesTabla',
    campoTotal: 'medio',
    campoCasos: 'descripcion',
    campoPorcentaje: undefined
  }
};

// Campos de costo de transporte
export const SECCION11_COSTO_TRANSPORTE = {
  MINIMO_KEY_BASE: 'costoTransporteMinimo',
  MAXIMO_KEY_BASE: 'costoTransporteMaximo'
};
