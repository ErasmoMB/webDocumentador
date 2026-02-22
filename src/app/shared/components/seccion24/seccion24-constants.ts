/**
 * ✅ SECCION24_CONSTANTS
 * Constantes centralizadas para Sección 24 - Actividades Económicas AISI
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados
 */

export const SECCION24_SECTION_ID = '3.1.4.B.1.3';

export const SECCION24_PHOTO_PREFIXES = {
  // ❌ ELIMINADO: fotografiaCahuacho causaba conflictos con secciones 22, 25, 29
  actividades: 'fotografiaActividadesEconomicas',
  mercado: 'fotografiaMercado',
  habitosConsumo: 'fotografiaHabitosConsumo'  // ✅ UNICO para sección 24
};

export const SECCION24_WATCHED_FIELDS = [
  'centroPobladoAISI',
  'actividadesEconomicasAISI',
  'ciudadOrigenComercio',
  'cuadroTituloActividadesEconomicasAISI',
  'textoIntroActividadesEconomicasAISI',
  'textoActividadesEconomicasAISI',
  'textoMercadoProductos',
  'textoHabitosConsumo',
  'fuenteActividadesEconomicasAISI',
  ...Array.from({ length: 10 }, (_, i) => `fotografiaActividadesEconomicas${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaActividadesEconomicas${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaActividadesEconomicas${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaMercado${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaMercado${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaMercado${i + 1}Imagen`),
  // ✅ CAMBIADO: fotografiaCahuacho → fotografiaHabitosConsumo
  ...Array.from({ length: 10 }, (_, i) => `fotografiaHabitosConsumo${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaHabitosConsumo${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaHabitosConsumo${i + 1}Imagen`)
];

export const SECCION24_CONFIG = {
  sectionId: SECCION24_SECTION_ID,
  title: 'Actividades económicas de la población',
  photoPrefix: 'fotografiaHabitosConsumo',  // ✅ UNICO para sección 24
  maxPhotos: 10
};

export const SECCION24_TEMPLATES = {
  // Títulos y encabezados
  tituloSeccion: 'B.1.3. Actividades económicas de la población',
  tituloEditarParrafos: 'Editar Párrafos',
  tituloMercado: 'a. Mercado y comercialización de productos',
  tituloHabitos: 'b. Hábitos de consumo',

  // Labels de párrafos
  labelIntroParrafo1: 'Actividades Económicas - Introducción - Párrafo 1',
  labelIntroParrafo2: 'Actividades Económicas - Introducción - Párrafo 2',
  labelAnalisisTextoCompleto: 'Actividades Económicas - Análisis - Texto Completo',
  labelMercadoTextoCompleto: 'Mercado y comercialización - Texto Completo',
  labelHabitosTextoCompleto: 'Hábitos de consumo - Texto Completo',

  // Labels de formularios
  labelCuadroTitulo: 'Título del cuadro',
  labelCuadroPrincipal: 'PEA Ocupada según actividad económica – CP {centroPoblado} (2017)',
  labelFuente: 'Fuente (Cifras)',
  labelCiudadOrigen: 'Ciudad de origen del comercio',
  labelFotosActividades: 'Fotografías de Actividades Económicas',
  labelFotosMercado: 'Fotografías de Mercado',
  labelFotosHabitos: 'Fotografías de Hábitos de Consumo',

  // Labels de tabla
  labelActividadEconomica: 'Actividad Económica',
  labelCasos: 'Casos',
  labelPorcentaje: 'Porcentaje',

  // Labels de imagen
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',

  // Placeholders
  placeholderCuadroTitulo: 'PEA Ocupada según actividad económica – CP ____ (2017)',
  placeholderActividad: 'Ej: Agricultura, ganadería, silvicultura y pesca',
  placeholderCasos: '0',
  placeholderPorcentaje: '0,00 %',
  placeholderFuente: 'Ej: Censos Nacionales 2017: XII de Población, VII de Vivienda...',
  placeholderCiudadOrigen: 'Ej: Caravelí',

  // URLs de image-upload
  labelTituloFoto: 'Título de la fotografía',
  labelFuenteFoto: 'Fuente de la fotografía',
  labelImagenFoto: 'Fotografía - Imagen',

  // Valores por defecto
  centroPobladoDefault: '____'
};

export const SECCION24_DEFAULT_TEXTS = {
  // Textos principales por defecto
  textoIntroActividadesEconomicasAISI: 'Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describirá la estructura y la diversidad de las actividades económicas en la capital distrital de ____, que forma parte del AISI.',
  
  textoIntroActividadesEconomicasAISILong: 'A partir de fuentes oficiales, se exploran las principales fuentes de ingresos y los sectores productivos más relevantes dentro del CP ____ (capital distrital). En esta ocasión, se recurre a los datos provistos por los Censos Nacionales 2017.',
  
  textoActividadesEconomicasAISI: 'Del cuadro anterior, se aprecia que la actividad económica más frecuente dentro del CP ____ es el grupo "Agricultura, ganadería, silvicultura y pesca" con un ____%. Esto se condice con las entrevistas aplicadas en campo, pues los informantes y autoridades declararon que la mayoría de la población se dedica principalmente a la agricultura y a la ganadería. La segunda actividad más frecuente dentro de esta localidad es la de "Administración pública y defensa; planes de seguridad social de afiliación obligatoria" con ____%.', 
  
  textoMercadoProductos: 'El CP ____ no cuenta con un mercado formal que centralice las actividades comerciales de la localidad. El comercio en este lugar es incipiente y se lleva a cabo principalmente a través de pequeñas bodegas. Estas bodegas atienden la demanda cotidiana en la localidad, pero la oferta sigue siendo limitada y gran parte de los productos llega desde ____. Además, la comercialización de productos en ____ se complementa con la presencia de comerciantes mayoristas que viajan hacia la localidad para comprar y vender productos. La mayoría de estos comerciantes provienen de la ciudad de ____, desde donde abastecen las bodegas locales con mercancías diversas.',
  
  textoHabitosConsumo: 'En la capital distrital de ____, los hábitos de consumo están basados principalmente en alimentos tradicionales y accesibles dentro de la comunidad. Los productos más consumidos incluyen tubérculos (como papa y oca) y verduras, los cuales son esenciales en la dieta diaria de los hogares. Estos productos se adquieren tanto a través de la producción local, como es el caso de la papa y la oca, como de compras a pequeños comerciantes que llegan a la capital distrital desde ____.',
  
  fuenteActividadesEconomicasAISI: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.',

  // Valores por defecto
  cuadroTituloDefault: 'PEA Ocupada según actividad económica – CP ____ (2017)',
  centroPobladoDefault: '____',
  ciudadOrigenDefault: 'Caravelí'
};
