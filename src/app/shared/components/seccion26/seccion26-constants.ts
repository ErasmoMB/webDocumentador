/**
 * Constantes para Sección 26: Servicios Básicos (Agua, Saneamiento, Electricidad)
 * Reutilizables entre form y view components
 * 
 * MODO IDEAL: 100% de textos centralizados, 0% hardcodeados en templates
 */

export const SECCION26_SECTION_ID = '3.1.4.B.1.5';

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
  'textoDesagueCP',
  'textoDesechosSolidosCP',
  'textoElectricidadCP',
  'textoEnergiaCocinarCP',
  'cuadroTituloAbastecimiento',
  'cuadroFuenteAbastecimiento',
  'cuadroTituloSaneamiento',
  'cuadroFuenteSaneamiento',
  'cuadroTituloCobertura',
  'cuadroFuenteCobertura',
  'cuadroTituloCombustibles',
  'cuadroFuenteCombustibles',
  ...Array.from({ length: 10 }, (_, i) => `fotografiaDesechosSolidosAISI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaDesechosSolidosAISI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaDesechosSolidosAISI${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaElectricidadAISI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaElectricidadAISI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaElectricidadAISI${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaEnergiaCocinarAISI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaEnergiaCocinarAISI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaEnergiaCocinarAISI${i + 1}Imagen`),
];

export const SECCION26_TEMPLATES = {
  // ✅ TITULO DE SECCION
  tituloSeccion: 'B.1.5. Servicios básicos: Agua y desagüe; electricidad, energía y/o combustible; y disposición de residuos sólidos',
  
  // ✅ SECCIONES (LETRAS)
  titulSeccionA: 'a. Servicios de agua',
  titulSeccionB: 'b. Servicios básicos de desagüe',
  titulSeccionC: 'c. Gestión y destino de los desechos sólidos',
  titulSeccionD: 'd. Electricidad',
  titulSeccionE: 'e. Energía para cocinar',
  
  // ✅ LABELS DE FORMULARIO
  labelEditarParrafos: 'Editar Párrafos',
  labelParrafoIntro: 'Servicios Básicos - Introducción - Texto Completo',
  labelParrafoServicios: 'Servicios Básicos de Agua - Texto Completo',
  labelParrafoDesague: 'Servicios básicos de desagüe - Texto Completo',
  labelParrafoDesechos: 'Gestión y Destino de Desechos Sólidos - Texto Completo',
  labelParrafoElectricidad: 'Electricidad - Texto Completo',
  labelParrafoCocinar: 'Energía para Cocinar - Texto Completo',
  
  labelCuadroTitulo: 'Título del cuadro',
  labelCuadroFuente: 'Fuente del cuadro',
  
  // ✅ LABELS DE TABLAS
  labelTablaAbastecimiento: 'Tabla Tipos de abastecimiento de agua en las viviendas',
  labelTablaSaneamiento: 'Tabla Tipos de saneamiento en las viviendas',
  labelTablaCobertura: 'Tabla Cobertura de alumbrado eléctrico en las viviendas',
  labelTablaCombustibles: 'Tabla Combustibles para cocción en los hogares',
  
  // ✅ LABELS DE FOTOGRAFÍAS
  labelFotosDesechos: 'Fotografías de Desechos Sólidos',
  labelFotosElectricidad: 'Fotografías de Electricidad',
  labelFotosCocinar: 'Fotografías de Energía para Cocinar',
  
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',
  
  // ✅ PLACEHOLDERS DE FORMULARIO
  placeholderCuadroTitulo: 'Título del cuadro',
  placeholderCuadroFuente: 'Fuente del cuadro',
  
  placeholderFotoTituloDesechos: 'Ej: Contenedores de residuos sólidos',
  placeholderFotoTituloElectricidad: 'Ej: Infraestructura eléctrica',
  placeholderFotoTituloCocinar: 'Ej: Energía para cocinar',
  
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  
  // ✅ VALORES POR DEFECTO DE FOTOGRAFÍAS
  tituloFotoDesechosDefault: 'Contenedores de residuos sólidos',
  tituloFotoElectricidadDefault: 'Infraestructura eléctrica',
  tituloFotoCocinarDefault: 'Energía para cocinar',
  
  fuenteFotoDefault: 'GEADES, 2024',
  
  // ✅ TÍTULOS POR DEFECTO DE TABLAS
  cuadroTituloAbastecimientoDefault: 'Tipos de abastecimiento de agua en las viviendas – CP ____ (2017)',
  cuadroTituloSaneamientoDefault: 'Tipos de saneamiento en las viviendas – CP ____ (2017)',
  cuadroTituloCoberturaDefault: 'Cobertura de alumbrado eléctrico en las viviendas – CP ____ (2017)',
  cuadroTituloCombustiblesDefault: 'Combustibles para cocción en los hogares – CP ____ (2017)',
  
  // ✅ FUENTES POR DEFECTO DE TABLAS
  cuadroFuenteDefault: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.',
  
  // ✅ TEXTOS POR DEFECTO (INTRODUCCIÓN - 2 PÁRRAFOS)
  textoIntroP1Default: 'Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento.',
  
  textoIntroP2Default: 'En 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia al total de viviendas ocupadas presentes ({{viviendas}}), tal como realiza el Censo Nacional 2017.',
  
  // ✅ TEXTOS DESAGUE P2 (PARTE FIJA)
  textoDesagueP2Default: 'Por otra parte, se hallan otras categorías con porcentajes menores: red pública de desagüe fuera de la vivienda, pero dentro de la edificación; letrina (con tratamiento); pozo ciego o negro; y campo abierto o al aire libre, todas las cuales representan un 2,04 % cada una.',
};

export const SECCION26_DEFAULT_TEXTS = {
  textoIntroServiciosBasicosAISI: 'Los servicios básicos nos indican el nivel de desarrollo de una comunidad. El acceso al agua potable salubre, el saneamiento y la electricidad son derechos humanos fundamentales.',
  
  textoServiciosAguaAISI: 'Respecto al servicio de agua para consumo humano, existe cobertura de dicho recurso en las viviendas. Según los Censos Nacionales 2017, una proporción significativa cuenta con red pública dentro de la vivienda.',
  
  textoDesagueAISI: 'El servicio de desagüe es fundamental para mantener la salubridad de las viviendas. En la localidad, se cuenta con diferentes tipos de sistemas de saneamiento.',
  
  textoElectricidadAISI: 'La cobertura eléctrica es un indicador importante del nivel de desarrollo. En la localidad, existe acceso eléctrico en una proporción de las viviendas.',
  
  textoEnergiaCocinarAISI: 'Para la preparación de alimentos, los pobladores utilizan diversas fuentes de energía. El acceso a combustible limpio es importante para la salud.'
};

/**
 * ✅ PATRÓN DE SOLO LECTURA: Datos puros del backend
 * - Tablas se llenan automáticamente desde el backend
 * - NO se permite edición manual
 * - NO se calculan porcentajes (vienen del backend)
 * - NO hay botones agregar/eliminar filas
 */
export const SECCION26_TABLE_CONFIGS = {
  abastecimientoAgua: {
    tablaKey: 'abastecimientoAguaCpTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    permiteAgregarFilas: false,
    permiteEliminarFilas: false
  },
  saneamiento: {
    tablaKey: 'saneamientoCpTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    permiteAgregarFilas: false,
    permiteEliminarFilas: false
  },
  coberturaElectrica: {
    tablaKey: 'coberturaElectricaCpTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    permiteAgregarFilas: false,
    permiteEliminarFilas: false
  },
  combustiblesCocinar: {
    tablaKey: 'combustiblesCocinarCpTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    permiteAgregarFilas: false,
    permiteEliminarFilas: false
  }
};

/**
 * ✅ TRANSFORMACIONES DE DATOS DEL BACKEND
 * Mapean datos demográficos del backend a formato de tabla
 */

// Transforma datos de abastecimiento de agua
export const transformAbastecimientoAguaDesdeDemograficos = (data: any[]): any[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => ({
    categoria: item.categoria || item.nombre || '',
    casos: Number(item.casos) || 0,
    porcentaje: item.porcentaje || ''
  }));
};

// Transforma datos de saneamiento
export const transformSaneamientoDesdeDemograficos = (data: any[]): any[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => ({
    categoria: item.categoria || item.nombre || '',
    casos: Number(item.casos) || 0,
    porcentaje: item.porcentaje || ''
  }));
};

// Transforma datos de cobertura eléctrica
export const transformCoberturaElectricaDesdeDemograficos = (data: any[]): any[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => ({
    categoria: item.categoria || item.nombre || '',
    casos: Number(item.casos) || 0,
    porcentaje: item.porcentaje || ''
  }));
};

// Transforma datos de combustibles para cocinar
export const transformCombustiblesCocinarDesdeDemograficos = (data: any[]): any[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => ({
    categoria: item.categoria || item.nombre || '',
    casos: Number(item.casos) || 0,
    porcentaje: item.porcentaje || ''
  }));
};

/**
 * Helper para desenvuelto datos demográficos que vienen en nested structures
 */
export const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  
  // El backend puede devolver diferentes formatos
  if (Array.isArray(responseData) && responseData.length > 0) {
    return responseData[0]?.rows || responseData;
  }
  if (responseData.data) {
    const data = responseData.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.rows || data;
    }
    return Array.isArray(data) ? data : [];
  }
  if (responseData.rows && Array.isArray(responseData.rows)) {
    return responseData.rows;
  }
  return [];
};
