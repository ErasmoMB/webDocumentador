/**
 * ✅ SECCION2_CONSTANTS
 * Constantes centralizadas para Sección 2
 * - Campos observados para persistencia
 * - Configuración de grupos (AISD, AISI)
 */

export const SECCION2_WATCHED_FIELDS = [
  'parrafoSeccion2_introduccion',
  'parrafoSeccion2_aisd_completo',
  'parrafoSeccion2_aisi_completo',
  'comunidadesCampesinas',
  'distritosAISI',
  'aisdComponente1',
  'aisdComponente2',
  'geoInfo',
  // Fotos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion2${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion2${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion2${i + 1}Imagen`),
];

export const SECCION2_CONFIG = {
  sectionId: '3.1.2',
  title: 'Delimitación de las áreas de influencia social',
  photoPrefix: 'fotografiaSeccion2',
  maxPhotos: 10,
};

export const SECCION2_TEMPLATES = {
  // ========== TEXTOS PRINCIPALES ==========
  introduccionDefault: `En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia. Asimismo, el área de influencia social de un Proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho Proyecto). El criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.En base a estos criterios se han identificado las áreas de influencia social directa e indirecta:`,

  // ========== TÍTULOS Y ENCABEZADOS ==========
  tituloSeccion: 'Delimitación de las áreas de influencia social',
  tituloFormulario: 'Delimitación de Áreas de Influencia Social',
  tituloEditarParagrafos: 'Editar Párrafos',
  tituloFotografias: 'Fotografías',
  tituloAISD: 'A. Áreas de influencia social directa (AISD)',
  tituloAISI: 'B. Áreas de influencia social indirecta (AISI)',

  // ========== SECCIÓN AISD (Comunidades Campesinas) ==========
  labelAISDTitle: 'Comunidad Campesina',
  labelAISDCentrosPoblados: 'Seleccionar Centros Poblados para AISD',
  labelAISDNombre: 'Comunidad Campesina (CC) AISD',
  placeholderAISDNombre: 'Ingrese el nombre de la comunidad campesina',
  hintAISDNombre: 'Asigne un nombre a la Comunidad Campesina.',
  hintAISDCentros: 'Seleccione los centros poblados que formarán parte del AISD. Debe seleccionar al menos uno.',
  btnAISDSeleccionarTodos: 'Seleccionar Todos',
  btnAISDDeseleccionarTodos: 'Deseleccionar Todos',
  btnAISDEliminar: 'Eliminar',
  btnAISDAgregar: '+ Agregar Otra Comunidad Campesina',
  msgAISDSinCentros: 'No hay centros poblados disponibles para esta comunidad',

  // ========== SECCIÓN AISI (Distritos) ==========
  labelAISITitle: 'Distrito',
  labelAISICentrosPoblados: 'Seleccionar Centros Poblados para AISI',
  labelAISINombre: 'Distrito AISI',
  placeholderAISINombre: 'Ingrese el nombre del distrito',
  hintAISINombre: 'Asigne un nombre a Distrito.',
  hintAISICentros: 'Seleccione los centros poblados que formarán parte del AISI. Debe seleccionar al menos uno.',
  btnAISISeleccionarTodos: 'Seleccionar Todos',
  btnAISIDeseleccionarTodos: 'Deseleccionar Todos',
  btnAISIEliminar: 'Eliminar',
  btnAISIAgregar: '+ Agregar Otro Distrito',
  msgAISISinCentros: 'No hay centros poblados disponibles para este distrito',

  // ========== PÁRRAFOS EDITABLES ==========
  labelIntroduccion: 'Introducción - Delimitación de Áreas',
  hintIntroduccion: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  labelAISD: 'Área de Influencia Social Directa (AISD)',
  hintAISD: 'Edite el texto completo de AISD. Deje vacío para usar el texto automáticamente generado.',
  labelAISI: 'Área de Influencia Social Indirecta (AISI)',
  hintAISI: 'Edite el texto completo de AISI. Deje vacío para usar el texto automáticamente generado.',

  // ========== FOTOGRAFÍAS ==========
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',
  placeholderFotoTitulo: 'Ej: Fotografía de la sección 2',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  tituloFotoDefault: 'Sección 2',
  fuenteFotoDefault: 'GEADES, 2024',

  // ========== TEMPLATES DINÁMICOS PARA GENERACIÓN AUTOMÁTICA ==========
  // AISD: Párrafo generado automáticamente con placeholders {{...}}
  textoAISDTemplate: `El Área de influencia social directa (AISD) se delimita en torno a la comunidad campesina (CC) {{comunidades}}, cuya área comunal se encuentra predominantemente en el distrito de {{distrito}} y en menor proporción en los distritos de Puyusca y de Pausa, pertenecientes al departamento de {{departamento}}. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Esta comunidad posee y gestiona las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto. La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de esta comunidad requiere una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de la comunidad. Los impactos directos en la CC {{comunidades}}, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y la comunidad promoverá un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de la CC {{comunidades}}.`,

  // AISI: Párrafo generado automáticamente con placeholders {{...}}
  textoAISITemplate: `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el {{distritos}}, capital distrital de la jurisdicción homónima, en la provincia de {{provincia}}, en el departamento de {{departamento}}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`,

  // AISI: Template para múltiples distritos
  textoAISIMultiplesTemplate: `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por los distritos de {{distritos}}, capitales distritales de sus respectivas jurisdicciones, en la provincia de {{provincia}}, en el departamento de {{departamento}}. Esta delimitación se debe a que estas localidades son los centros políticos de las jurisdicciones donde se ubica el Proyecto, así como al hecho de que mantienen una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, son las localidades de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`,

  // AISI: Template fallback sin distritos
  textoAISIFallbackTemplate: `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el {{placeholderDistrito}}, capital distrital de la jurisdicción homónima, en la provincia de {{provincia}}, en el departamento de {{departamento}}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`,
};
