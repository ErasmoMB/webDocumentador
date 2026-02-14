/**
 * Constantes para Sección 25: Características de Viviendas AISI
 * Reutilizables entre form y view components
 */

export const SECCION25_PHOTO_PREFIX = 'fotografiaCahuacho';

// ✅ Nuevos prefijos de fotos específicos por tema (MEJORA APLICADA)
export const SECCION25_PHOTO_PREFIXES = {
  centroPoblado: 'fotografiaCahuacho',
  vivienda: 'fotografiaViviendaAISI',
  estructura: 'fotografiaEstructuraAISI'
};

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

export const SECCION25_TEMPLATES = {
  // Textos principales por defecto
  tituloSeccion: 'B.1.4. Vivienda',
  
  // Párrafos por defecto (fallback)
  textoViviendaDefault: 'La caracterización de las viviendas es fundamental para entender el nivel de vida y las condiciones de habitabilidad de la población. En el Centro Poblado ____, se presentan diferentes tipos de vivienda con características específicas en cuanto a sus materiales de construcción.',
  
  textoOcupacionDefault: 'La condición de ocupación de las viviendas refleja aspectos importantes sobre la densidad poblacional y la utilización del espacio habitacional. Según los datos disponibles, se observa que la mayoría de las viviendas se encuentran ocupadas.',
  
  textoEstructuraDefault: 'La estructura física de las viviendas está determinada por los materiales utilizados en su construcción. Los muros, techos y pisos son componentes clave que definen la calidad y durabilidad de las viviendas.',
  
  // Labels de formulario
  labelTextoVivienda: 'Texto — Vivienda',
  labelTextoCuadroTitulo: 'Título de la Tabla',
  labelTextoFuente: 'Fuente de la Tabla',
  labelTextoOcupacion: 'Texto — Ocupación de vivienda',
  labelTextoEstructura: 'Texto — Estructura',
  
  // Placeholders
  placeholderTituloTiposVivienda: 'Ej: Tipos de Vivienda',
  placeholderFuenteTiposVivienda: 'Ej: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.',
  placeholderTituloCondicionOcupacion: 'Ej: Condición de Ocupación',
  placeholderFuenteCondicionOcupacion: 'Ej: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.',
  placeholderTituloMaterialesVivienda: 'Ej: Tipos de materiales de la vivienda',
  placeholderFuenteMaterialesVivienda: 'Ej: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.',
  
  // Columnas tabla
  columnCategoria: 'Categoría',
  columnCasos: 'Casos',
  columnPorcentaje: 'Porcentaje',
  columnTipoMaterial: 'Tipo de material',
  
  // Placeholders para tabla
  placeholderCategoriaVivienda: 'Ej: Casa independiente',
  placeholderCasos: '0',
  placeholderPorcentaje: '0,00 %',
  placeholderCategoriaOcupacion: 'Ej: Ocupada, con personas presentes',
  
  // Títulos predeterminados para tablas
  tituloTiposViviendaDefault: 'Tipos de Vivienda',
  tituloCondicionOcupacionDefault: 'Condición de Ocupación',
  tituloMaterialesViviendaDefault: 'Tipos de materiales de la vivienda',
  
  // Fuentes predeterminadas
  fuenteDefault: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.',
  
  // Textos auxiliares
  labelCuadros: 'Cuadros',
  labelEstructura: 'a. Estructura',
  textoEstructuraFormato: 'Estructura',
  
  // Valores calculados (para vista)
  porcentajeOcupadasPresentes: '{porcentaje}', // Placeholder para sustitución dinámica
};

export const SECCION25_TABLE_CONFIGS = {
  tiposVivienda: {
    tablaKey: 'tiposViviendaAISI',
    totalKey: '',                        // ✅ Sin fila de total separada
    campoTotal: '',                      // ✅ Backend ya envía Total
    campoPorcentaje: '',                 // ✅ No calcular porcentaje
    noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
    calcularPorcentajes: false,          // ✅ Backend ya calcula
    camposParaCalcular: [],
    permiteAgregarFilas: false,          // ✅ Solo lectura
    permiteEliminarFilas: false          // ✅ Solo lectura
  },
  condicionOcupacion: {
    tablaKey: 'condicionOcupacionAISI',
    totalKey: '',                        // ✅ Sin fila de total separada
    campoTotal: '',                      // ✅ Backend ya envía Total
    campoPorcentaje: '',                 // ✅ No calcular porcentaje
    noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
    calcularPorcentajes: false,          // ✅ Backend ya calcula
    camposParaCalcular: [],
    permiteAgregarFilas: false,          // ✅ Solo lectura
    permiteEliminarFilas: false          // ✅ Solo lectura
  },
  materialesVivienda: {
    tablaKey: 'materialesViviendaAISI',
    totalKey: '',                        // ✅ Sin fila de total separada
    campoTotal: '',                      // ✅ Backend ya envía Total
    campoPorcentaje: '',                 // ✅ No calcular porcentaje
    noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
    calcularPorcentajes: false,          // ✅ Backend ya calcula
    camposParaCalcular: [],
    permiteAgregarFilas: false,          // ✅ Solo lectura
    permiteEliminarFilas: false          // ✅ Solo lectura
  }
};
