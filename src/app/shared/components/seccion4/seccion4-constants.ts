/**
 * ✅ SECCION4_CONSTANTS
 * Constantes centralizadas para Sección 4 - Caracterización Socioeconómica
 * - Campos observados para persistencia
 * - Configuración de fotos
 * - IDs de sección
 */

export const SECCION4_WATCHED_FIELDS: string[] = [
  // Tablas base (sin prefijo)
  'tablaAISD1Datos',
  'tablaAISD2Datos',
  // Tablas con prefijos dinámicos AISD (_A1 a _A10)
  ...Array.from({ length: 10 }, (_, i) => `tablaAISD1Datos_A${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `tablaAISD2Datos_A${i + 1}`),
  // Tablas con prefijos dinámicos AISI (_B1 a _B10)
  ...Array.from({ length: 10 }, (_, i) => `tablaAISD1Datos_B${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `tablaAISD2Datos_B${i + 1}`),
  // Totales de tablas
  ...Array.from({ length: 10 }, (_, i) => `tablaAISD2TotalPoblacion_A${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `tablaAISD2TotalViviendasEmpadronadas_A${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `tablaAISD2TotalViviendasOcupadas_A${i + 1}`),
  // Párrafos
  'parrafoSeccion4_introduccion_aisd',
  'parrafoSeccion4_comunidad_completo',
  'parrafoSeccion4_caracterizacion_indicadores',
  // Párrafos con prefijos
  ...Array.from({ length: 10 }, (_, i) => `parrafoSeccion4_introduccion_aisd_A${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `parrafoSeccion4_comunidad_completo_A${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `parrafoSeccion4_caracterizacion_indicadores_A${i + 1}`),
  // Títulos y fuentes
  'cuadroTituloAISD1',
  'cuadroTituloAISD2',
  'cuadroFuenteAISD1',
  'cuadroFuenteAISD2',
  ...Array.from({ length: 10 }, (_, i) => `cuadroTituloAISD1_A${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `cuadroTituloAISD2_A${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `cuadroFuenteAISD1_A${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `cuadroFuenteAISD2_A${i + 1}`),
  // Fotos con prefijos (10 máximo por tipo)
  // campos base (sin prefijo de grupo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Imagen`),
  // también vigilar variantes con sufijos de grupo (_A1, _B1) para sincronización reactiva
  ...['', '_A1','_A2','_A3','_A4','_A5','_A6','_A7','_A8','_A9','_A10', '_B1','_B2','_B3','_B4','_B5','_B6','_B7','_B8','_B9','_B10'].flatMap(sufijo => [
    ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Titulo${sufijo}`),
    ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Fuente${sufijo}`),
    ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Imagen${sufijo}`),
    ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Titulo${sufijo}`),
    ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Fuente${sufijo}`),
    ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Imagen${sufijo}`)
  ]).flat(),
];

export const SECCION4_PHOTO_PREFIXES = {
  UBICACION: 'fotografiaUbicacionReferencial',
  POBLACION: 'fotografiaPoblacionViviendas'
} as const;

export const SECCION4_SECTION_ID = '3.1.4';
export const SECCION4_DEFAULT_SUBSECTION = '3.1.4.A.1';

export const SECCION4_CONFIG = {
  sectionId: SECCION4_DEFAULT_SUBSECTION,
  title: 'Caracterización socioeconómica de las Áreas de Influencia Social',
  photoPrefix: 'fotografiaUbicacionReferencial', // prefijo principal
  maxPhotos: 10
} as const;

// Configuración de tablas
export const SECCION4_TABLA_AISD1_CONFIG = {
  tablaKey: 'tablaAISD1Datos',
  totalKey: 'localidad',
  campoTotal: 'localidad',
  estructuraInicial: [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }]
};

export const SECCION4_TABLA_AISD2_CONFIG = {
  tablaKey: 'tablaAISD2Datos',
  totalKey: 'punto',
  campoTotal: 'punto',
  estructuraInicial: [{ punto: '', codigo: '', poblacion: '', viviendasEmpadronadas: '', viviendasOcupadas: '' }]
};

export const SECCION4_COLUMNAS_AISD1 = [
  { field: 'localidad', label: 'Localidad', type: 'text' as const, placeholder: 'Nombre de localidad' },
  { field: 'coordenadas', label: 'Coordenadas', type: 'text' as const, placeholder: 'Lat, Long' },
  { field: 'altitud', label: 'Altitud (m)', type: 'text' as const, placeholder: 'Altitud' },
  { field: 'distrito', label: 'Distrito', type: 'text' as const, placeholder: 'Distrito' },
  { field: 'provincia', label: 'Provincia', type: 'text' as const, placeholder: 'Provincia' },
  { field: 'departamento', label: 'Departamento', type: 'text' as const, placeholder: 'Departamento' }
];

export const SECCION4_COLUMNAS_AISD2 = [
  { field: 'punto', label: 'Punto de Población (INEI)', type: 'text' as const, placeholder: 'Punto de Población' },
  { field: 'codigo', label: 'Código', type: 'text' as const, placeholder: 'Código' },
  { field: 'poblacion', label: 'Población', type: 'text' as const, placeholder: '0' },
  { field: 'viviendasEmpadronadas', label: 'Viviendas empadronadas', type: 'text' as const, placeholder: '0' },
  { field: 'viviendasOcupadas', label: 'Viviendas ocupadas', type: 'text' as const, placeholder: '0' }
];

/**
 * ✅ SECCION4_TEMPLATES - Todos los textos visibles
 */
export const SECCION4_TEMPLATES = {
  // Títulos y encabezados
  tituloSeccion: '3.1.4. Caracterización socioeconómica — Editor',
  tituloEditarParrafos: 'Editar Párrafos',
  tituloVista: '3.1.4. Caracterización socioeconómica de las Áreas de Influencia Social',
  tituloAISD: 'A. Caracterización socioeconómica del Área de Influencia Social Directa (AISD)',
  tituloA1ComunidadCampesina: 'A.1. Comunidad Campesina',

  // Labels para párrafos en formulario
  labelIntroduccionAISD: 'Introducción AISD',
  labelDescripcionComunidad: 'Descripción de la Comunidad',
  labelCaracterizacionIndicadores: 'Caracterización - Indicadores',

  // Labels para tablas
  labelTituloTablaUbicacion: 'Título de tabla - Ubicación referencial (A.1)',
  labelTituloTabla: 'Título de tabla - Cantidad total de población y viviendas (A.2)',
  labelFuenteTablas: 'Fuente de las tablas',
  labelFuenteTablaA1: 'Fuente - Ubicación referencial (A.1)',
  labelFuenteTablaA2: 'Fuente - Población y viviendas (A.2)',

  // Placeholders
  placeholderTituloUbicacion: 'Ej: Ubicación referencial - CC Comunidad',
  placeholderTituloPoblacion: 'Ej: Cantidad total de población y viviendas',
  placeholderFuente: 'Ej: GEADES (2024)',

  // Labels de tablas en vistas
  labelTablaUbicacionReferencial: 'Ubicación referencial',
  labelTablaPoblacionViviendas: 'Población y viviendas',

  // Fotografías
  labelFotografiasUbicacion: 'Fotografías - Ubicación Referencial',
  labelFotografiasOblacion: 'Fotografías - Población y Viviendas',
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',

  // Encabezados de tabla AISD1
  headerLocalidad: 'Localidad',
  headerCoordenadas: 'Coordenadas',
  headerAltitud: 'Altitud',
  headerDistrito: 'Distrito',
  headerProvincia: 'Provincia',
  headerDepartamento: 'Departamento',

  // Encabezados de tabla AISD2
  headerPunto: 'Punto de Población (INEI)',
  headerCodigo: 'Código',
  headerCategoria: 'Categoría',
  headerPoblacion: 'Población',
  headerTotal: 'Total',

  // Fuentes por defecto
  fuenteAISD1Default: 'GEADES (2024)',
  fuenteAISD2Default: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',

  // Etiquetas
  labelFuente: 'FUENTE:',
  labelCC: 'CC',

  // Textos por defecto para párrafos
  introduccionAISDDefault: `Se ha determinado como Área de Influencia Social Directa (AISD) a la CC {{nombreComunidad}}. Esta delimitación se justifica en los criterios de propiedad de terreno superficial, además de la posible ocurrencia de impactos directos como la contratación de mano de obra local, adquisición de bienes y servicios, así como logística. En los siguientes apartados se desarrolla la caracterización socioeconómica y cultural de la comunidad delimitada como parte del AISD.`,

  descripcionComunidadDefault: `La CC {{nombreComunidad}} se encuentra ubicada predominantemente dentro del distrito de {{distrito}}, provincia de {{provincia}}; no obstante, sus límites comunales abarcan pequeñas áreas de los distritos de Puyusca y de Pausa, del departamento de {{departamento}}. Esta comunidad se caracteriza por su historia y tradiciones que se mantienen vivas a lo largo de los años. Se encuentra compuesta por el anexo {{nombreComunidad}}, el cual es el centro administrativo comunal, además de los sectores agropecuarios de Yuracranra, Tastanic y Faldahuasi. ello se pudo validar durante el trabajo de campo, así como mediante la Base de Datos de Pueblos Indígenas u Originarios (BDPI). Sin embargo, en la actualidad, estos sectores agropecuarios no cuentan con población permanente y la mayor parte de los comuneros se concentran en el anexo {{nombreComunidad}}.

En cuanto al nombre "{{nombreComunidad}}", según los entrevistados, este proviene de una hierba que se empleaba para elaborar moldes artesanales para queso; no obstante, ya no se viene utilizando en el presente y es una práctica que ha ido reduciéndose paulatinamente. Por otro lado, cabe mencionar que la comunidad sehalla al este de la CC Sondor, al norte del CP {{grupoAISI}} y al oeste del anexo Nauquipa.

Asimismo, la CC {{nombreComunidad}} es reconocida por el Ministerio de Cultura como parte de los pueblos indígenas u originarios, específicamente como parte del pueblo quechua. Esta identidad es un pilar fundamental de la comunidad, influyendo en sus prácticas agrícolas, celebraciones y organización social. La oficialización de la comunidad por parte del Estado peruano se remonta al 24 de agosto de 1987, cuando fue reconocida mediante RD N°495 – 87 – MAG – DR – VIII – A. Este reconocimiento formalizó la existencia y los derechos de la comunidad, fortaleciendo su posición y legitimidad dentro del marco legal peruano. Posteriormente, las tierras de la comunidad fueron tituladas el 28 de marzo de 1996, conforme consta en la Ficha 90000300, según la BDPI. Esta titulación ha sido crucial para la protección y manejo de sus recursos naturales, permitiendo a la comunidad planificar y desarrollar proyectos que beneficien a todos sus comuneros. La administración de estas tierras ha sido un factor clave en la preservación de su cultura y en el desarrollo sostenible de la comunidad.`,

  caracterizacionIndicadoresDefault: `Para la caracterización de los indicadores demográficos y aquellos relacionados a viviendas, se emplea la sumatoria de casos obtenida al considerar aquellos puntos de población que conforman la CC {{nombreComunidad}}. En el siguiente cuadro, se presenta aquellos puntos de población identificados por el INEI que se encuentran dentro de la comunidad en cuestión.`,

  // Placeholders vacíos
  placeholderVacio: '____'
} as const;
