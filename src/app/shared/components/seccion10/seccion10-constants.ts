/**
 * ✅ SECCION10_CONSTANTS
 * Constantes centralizadas para Sección 10 - Servicios Básicos
 */

export const SECCION10_SECTION_ID = '3.1.4.A.1.6';
export const SECCION10_DEFAULT_SUBSECTION = '3.1.4.A.1.6';

export const SECCION10_CONFIG = {
  sectionId: SECCION10_SECTION_ID,
  title: 'Servicios básicos: Electricidad, energía y/o combustible, tecnología y comunicaciones',
  photoPrefix: 'fotografia10',
  maxPhotos: 10
} as const;

export const SECCION10_PHOTO_PREFIX = 'fotografia10';

// ✅ PATRÓN IDEAL - Prefijos de fotos específicos por tema
export const SECCION10_PHOTO_PREFIXES = {
  base: 'fotografia10'
};

// ✅ Todos los campos persistentes
export const SECCION10_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'provinciaSeleccionada',
  'parrafoSeccion10_servicios_basicos_intro',
  'textoServiciosAgua',
  'textoServiciosAguaDetalle',
  'textoServiciosDesague',
  'textoServiciosDesagueDetalle',
  'textoDesechosSolidos1',
  'textoDesechosSolidos2',
  'textoDesechosSolidos3',
  'textoElectricidad1',
  'textoElectricidad2',
  'textoEnergiaParaCocinar',
  'textoTecnologiaComunicaciones',
  'tituloAbastecimientoAgua',
  'tituloTiposSaneamiento',
  'tituloCoberturaElectrica',
  'tituloEnergiaCocinar',
  'tituloTecnologiaComunicaciones',
  'fuenteAbastecimientoAgua',
  'fuenteTiposSaneamiento',
  'fuenteCoberturaElectrica',
  'fuenteEnergiaCocinar',
  'fuenteTecnologiaComunicaciones',
  'abastecimientoAguaTabla',
  'tiposSaneamientoTabla',
  'alumbradoElectricoTabla',
  'energiaCocinarTabla',
  'tecnologiaComunicacionesTabla',
  // Fotos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografia10${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia10${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia10${i + 1}Imagen`),
];

/**
 * ✅ SECCION10_TEMPLATES - TODOS LOS TEXTOS VISIBLES
 */
export const SECCION10_TEMPLATES = {
  // Títulos y encabezados
  tituloSeccion: 'A.1.6. Servicios básicos: Electricidad, energía y/o combustible, tecnología y comunicaciones',
  tituloEditarParrafos: 'Editar Párrafos',
  tituloVista: 'A.1.6. Servicios básicos: Electricidad, energía y/o combustible, tecnología y comunicaciones',

  // Subtítulos de secciones
  subtituloServiciosAgua: 'a. Servicios de agua',
  subtituloServiciosDesague: 'b. Servicios básicos de desagüe',
  subtituloDesechosSolidos: 'c. Gestión y destino de los desechos sólidos',
  subtituloElectricidad: 'd. Electricidad',
  subtituloEnergiaCocinar: 'e. Energía para cocinar',
  subtituloTecnologiaComunicaciones: 'f. Tecnología de comunicaciones',

  // Labels para párrafos en formulario
  labelIntroduccion: 'Introducción - Servicios Básicos',
  labelServiciosAgua: 'Servicios de Agua - Texto Completo',
  labelServiciosAguaDetalle: 'Servicios de Agua - Detalle',
  labelServiciosDesague: 'Servicios de Desagüe - Texto Completo',
  labelServiciosDesagueDetalle: 'Servicios de Desagüe - Detalle',
  labelDesechosSolidos1: 'Desechos Sólidos - Párrafo 1',
  labelDesechosSolidos2: 'Desechos Sólidos - Párrafo 2',
  labelDesechosSolidos3: 'Desechos Sólidos - Párrafo 3',
  labelElectricidad1: 'Electricidad - Párrafo 1',
  labelElectricidad2: 'Electricidad - Párrafo 2',
  labelEnergiaCocinar: 'Energía para Cocinar - Texto Completo',
  labelTecnologiaComunicaciones: 'Tecnología de Comunicaciones',

  // Labels para tablas
  labelTituloAbastecimientoAgua: 'Título - Abastecimiento de Agua',
  labelTituloTiposSaneamiento: 'Título - Tipos de Saneamiento',
  labelTituloCoberturaElectrica: 'Título - Cobertura Eléctrica',
  labelTituloEnergiaCocinar: 'Título - Energía para Cocinar',
  labelTituloTecnologiaComunicaciones: 'Título - Tecnología de Comunicaciones',
  labelFuenteTablas: 'Fuente de las tablas',
  labelFuenteAbastecimientoAgua: 'Fuente - Abastecimiento de Agua',
  labelFuenteTiposSaneamiento: 'Fuente - Tipos de Saneamiento',
  labelFuenteCoberturaElectrica: 'Fuente - Cobertura Eléctrica',
  labelFuenteEnergiaCocinar: 'Fuente - Energía para Cocinar',
  labelFuenteTecnologiaComunicaciones: 'Fuente - Tecnología de Comunicaciones',

  // Placeholders
  placeholderTituloAbastecimientoAgua: 'Tipos de abastecimiento de agua en las viviendas – CC ____ (2017)',
  placeholderTituloTiposSaneamiento: 'Tipos de saneamiento en las viviendas – CC ____ (2017)',
  placeholderTituloCoberturaElectrica: 'Cobertura de alumbrado eléctrico en las viviendas – CC ____ (2017)',
  placeholderTituloEnergiaCocinar: 'Energía utilizada para cocinar en las viviendas – CC ____ (2017)',
  placeholderTituloTecnologiaComunicaciones: 'Tecnología de comunicaciones en las viviendas – CC ____ (2017)',
  placeholderFuente: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',

  // Hints
  hintParrafo: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintTitulo: 'Edite el título de la tabla',
  hintFuente: 'Indique la fuente de la tabla',

  // Títulos de tablas en vista
  labelTablaAbastecimientoAgua: 'Abastecimiento de Agua',
  labelTablaTiposSaneamiento: 'Tipos de Saneamiento',
  labelTablaCoberturaElectrica: 'Cobertura de Alumbrado Eléctrico',
  labelTablaEnergiaCocinar: 'Energía para Cocinar',
  labelTablaTecnologiaComunicaciones: 'Tecnología de Comunicaciones',

  // Etiquetas de columnas
  labelCategoria: 'Categoría',
  labelCasos: 'Casos',
  labelPorcentaje: 'Porcentaje',
  headerCategoria: 'Categoría',
  headerCasos: 'Casos',
  headerPorcentaje: 'Porcentaje',

  // Placeholders por tabla
  placeholderCategoriaAbastecimiento: 'Viviendas con abastecimiento de agua por red pública',
  placeholderCategoriaSaneamiento: 'Viviendas con saneamiento vía red pública',
  placeholderCategoriaElectricidad: 'Viviendas con acceso a electricidad',
  placeholderCategoriaEnergia: 'Leña',

  // Fuentes por defecto
  fuenteDefault: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',
  placeholderFuenteCoberturaElectrica: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',
  placeholderFuenteEnergiaCocinar: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',

  // Encabezados de formulario
  seccionEditarParrafos: 'Editar Párrafos',
  seccionTablas: 'Tablas de Datos',
  seccionFotografias: 'Fotografías',

  // Fotografías
  labelFotografiasDesechos: 'Fotografías de Desechos Sólidos',
  labelTituloFoto: 'Título de la fotografía',
  labelFuenteFoto: 'Fuente de la fotografía',
  labelImagenFoto: 'Fotografía - Imagen',
  placeholderTituloFoto: 'Ej: Contenedor de residuos sólidos y plásticos en el anexo Ayroca',
  placeholderFuenteFoto: 'Ej: GEADES, 2024',
  tituloDefaultFoto: 'Contenedor de residuos sólidos y plásticos en el anexo Ayroca',
  fuenteDefaultFoto: 'GEADES, 2024',

  // Botones
  botonSeleccionar: 'Seleccionar',

  // Placeholders genéricos
  placeholderVacio: '____'
} as const;

// Configuración de tablas
export const SECCION10_TABLE_CONFIGS = {
  ABASTECIMIENTO_AGUA: {
    tablaKeyBase: 'abastecimientoAguaTabla',
    campoTotal: 'categoria',
    campoCasos: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  TIPOS_SANEAMIENTO: {
    tablaKeyBase: 'tiposSaneamientoTabla',
    campoTotal: 'categoria',
    campoCasos: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  ALUMBRADO_ELECTRICO: {
    tablaKeyBase: 'alumbradoElectricoTabla',
    campoTotal: 'categoria',
    campoCasos: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  ENERGIA_COCINAR: {
    tablaKeyBase: 'energiaCocinarTabla',
    campoTotal: 'categoria',
    campoCasos: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  TELECOMUNICACIONES: {
    tablaKeyBase: 'tecnologiaComunicacionesTabla',
    campoTotal: 'medio',
    campoCasos: 'descripcion',
    campoPorcentaje: undefined
  }
};
