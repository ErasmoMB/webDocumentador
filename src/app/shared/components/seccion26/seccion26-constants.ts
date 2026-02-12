/**
 * Constantes para Sección 26: Servicios Básicos (Agua, Saneamiento, Electricidad)
 * Reutilizables entre form y view components
 */

export const SECCION26_PHOTO_PREFIXES = {
  desechos: 'fotografiaDesechosSolidosAISI',
  electricidad: 'fotografiaElectricidadAISI',
  cocinar: 'fotografiaEnergiaCocinarAISI'
};

export const SECCION26_WATCHED_FIELDS = [
  'centroPobladoAISI',
  'abastecimientoAguaCpTabla',
  'saneamientoCpTabla',
  'coberturaElectricaCpTabla',
  'combustiblesCocinarCpTabla',
  'textoIntroServiciosBasicosAISI',
  'textoServiciosAguaAISI',
  'textoDesagueAISI',
  'textoElectricidadAISI',
  'textoEnergiaCocinarAISI'
];

export const SECCION26_DEFAULT_TEXTS = {
  textoIntroServiciosBasicosAISI: 'Los servicios básicos nos indican el nivel de desarrollo de una comunidad. El acceso al agua potable salubre, el saneamiento y la electricidad son derechos humanos fundamentales.',
  
  textoServiciosAguaAISI: 'Respecto al servicio de agua para consumo humano, existe cobertura de dicho recurso en las viviendas. Según los Censos Nacionales 2017, una proporción significativa cuenta con red pública dentro de la vivienda.',
  
  textoDesagueAISI: 'El servicio de desagüe es fundamental para mantener la salubridad de las viviendas. En la localidad, se cuenta con diferentes tipos de sistemas de saneamiento.',
  
  textoElectricidadAISI: 'La cobertura eléctrica es un indicador importante del nivel de desarrollo. En la localidad, existe acceso eléctrico en una proporción de las viviendas.',
  
  textoEnergiaCocinarAISI: 'Para la preparación de alimentos, los pobladores utilizan diversas fuentes de energía. El acceso a combustible limpio es importante para la salud.'
};

export const SECCION26_TABLE_CONFIGS = {
  abastecimientoAgua: {
    tablaKey: 'abastecimientoAguaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  },
  saneamiento: {
    tablaKey: 'saneamientoCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  },
  coberturaElectrica: {
    tablaKey: 'coberturaElectricaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  },
  combustiblesCocinar: {
    tablaKey: 'combustiblesCocinarCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  }
};
