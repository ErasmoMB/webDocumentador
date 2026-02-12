/**
 * Constantes para Sección 24: Actividades Económicas AISI
 * Reutilizables entre form y view components
 */

export const SECCION24_PHOTO_PREFIXES = {
  centroPoblado: 'fotografiaCahuacho',
  actividades: 'fotografiaActividadesEconomicas',
  mercado: 'fotografiaMercado'
};

export const SECCION24_WATCHED_FIELDS = [
  'centroPobladoAISI',
  'actividadesEconomicasAISI',
  'ciudadOrigenComercio',
  'textoIntroActividadesEconomicasAISI',
  'textoActividadesEconomicasAISI',
  'textoMercadoProductos',
  'textoHabitosConsumo',
  'fuenteActividadesEconomicasAISI'
];

export const SECCION24_DEFAULT_TEXTS = {
  textoIntroActividadesEconomicasAISI: 'Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describirá la estructura y la diversidad de las actividades económicas en la capital distrital de ____, que forma parte del AISI.',
  
  textoIntroActividadesEconomicasAISILong: 'A partir de fuentes oficiales, se exploran las principales fuentes de ingresos y los sectores productivos más relevantes. En esta ocasión, se recurre a los datos provistos por los Censos Nacionales 2017.',
  
  textoActividadesEconomicasAISI: 'Del cuadro anterior, se aprecia que la actividad económica más frecuente es el grupo "Agricultura, ganadería, silvicultura y pesca". Esto se condice con las entrevistas aplicadas en campo, pues los informantes y autoridades declararon que la mayoría de la población se dedica principalmente a la agricultura y a la ganadería.',
  
  textoMercadoProductos: 'El centro poblado no cuenta con un mercado formal. El comercio es incipiente y se lleva a cabo principalmente a través de pequeñas bodegas.',
  
  textoHabitosConsumo: 'Los hábitos de consumo están basados principalmente en alimentos tradicionales y accesibles dentro de la comunidad. Los productos más consumidos incluyen tubérculos como papa y oca.',
  
  fuenteActividadesEconomicasAISI: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.'
};
