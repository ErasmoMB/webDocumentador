/**
 * Constantes para Sección 25: Características de Viviendas AISI
 * Reutilizables entre form y view components
 */

export const SECCION25_PHOTO_PREFIX = 'fotografiaCahuacho';

export const SECCION25_WATCHED_FIELDS = [
  'centroPobladoAISI',
  'tiposViviendaAISI',
  'condicionOcupacionAISI',
  'materialesViviendaAISI',
  'textoViviendaAISI',
  'textoOcupacionViviendaAISI',
  'textoEstructuraAISI',
  'cuadroTituloTiposVivienda',
  'cuadroFuenteTiposVivienda',
  'cuadroTituloCondicionOcupacion',
  'cuadroFuenteCondicionOcupacion',
  'cuadroTituloMaterialesVivienda',
  'cuadroFuenteMaterialesVivienda'
];

export const SECCION25_DEFAULT_TEXTS = {
  textoViviendaAISI: 'La caracterización de las viviendas es fundamental para entender el nivel de vida y las condiciones de habitabilidad de la población. En el Centro Poblado ____, se presentan diferentes tipos de vivienda con características específicas en cuanto a sus materiales de construcción.',
  
  textoOcupacionViviendaAISI: 'La condición de ocupación de las viviendas refleja aspectos importantes sobre la densidad poblacional y la utilización del espacio habitacional. Según los datos disponibles, se observa que la mayoría de las viviendas se encuentran ocupadas.',
  
  textoEstructuraAISI: 'La estructura física de las viviendas está determinada por los materiales utilizados en su construcción. Los muros, techos y pisos son componentes clave que definen la calidad y durabilidad de las viviendas.'
};

export const SECCION25_TABLE_CONFIGS = {
  tiposVivienda: {
    tablaKey: 'tiposViviendaAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  },
  condicionOcupacion: {
    tablaKey: 'condicionOcupacionAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  },
  materialesVivienda: {
    tablaKey: 'materialesViviendaAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  }
};
