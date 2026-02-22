/**
 * ✅ SECCION9_CONSTANTS
 * Constantes centralizadas para Sección 9 - Aspectos de Vivienda
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos visibles centralizados
 */

import { TableConfig } from 'src/app/core/services/tables/table-management.service';

export const SECCION9_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'textoViviendas',
  'textoEstructura',
  'condicionOcupacionTabla',
  'tiposMaterialesTabla',
  'tituloCondicionOcupacion',
  'fuenteCondicionOcupacion',
  'tituloTiposMateriales',
  'fuenteTiposMateriales',
  // Fotos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaEstructura${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaEstructura${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaEstructura${i + 1}Imagen`),
];

export const SECCION9_SECTION_ID = '3.1.4.A.1.5';
export const SECCION9_DEFAULT_SUBSECTION = '3.1.4.A.1.5';

export const SECCION9_CONFIG = {
  sectionId: '3.1.4.A.1.5',
  title: 'Aspectos de Vivienda',
  photoPrefix: 'fotografiaEstructura',
  maxPhotos: 10,
};

export const SECCION9_PHOTO_PREFIX = {
  ESTRUCTURA: 'fotografiaEstructura'
} as const;

/**
 * ✅ PLANTILLAS DE TEXTOS - Dinámicas con reemplazos
 */
export const SECCION9_PLANTILLAS_DINAMICAS = {
  textoViviendasTemplate: `Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC __COMUNIDAD__ se hallaron un total de ____ viviendas empadronadas. De estas, solamente ____ se encuentran ocupadas, representando un ____%. Cabe mencionar que, para poder describir el aspecto de estructura de las viviendas de esta comunidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas.`,
  
  textoEstructuraTemplate: `Según la información recabada de los Censos Nacionales 2017, dentro de la CC __COMUNIDAD__, el material más empleado para la construcción de las paredes de las viviendas es el ____, pues representa el ____%. A ello le complementa el material de ____ (____%). Respecto a los techos, destacan principalmente las planchas de calamina, fibra de cemento o similares con un ____%. El porcentaje restante consiste en ____ (____%) y en tejas (____%). Finalmente, en cuanto a los pisos, la mayoría están hechos de tierra (____%). Por otra parte, el porcentaje restante (____%) consiste en cemento.`,
};

/**
 * ✅ TEMPLATES - Todos textos visibles UI
 */
export const SECCION9_TEMPLATES = {
  // Títulos de secciones
  seccionViviendas: 'A.1.5. Viviendas',
  seccionEstructura: 'a. Estructura',
  seccionFotografias: 'Fotografías',
  
  // Subtítulos
  subtituloCondicionOcupacion: 'Condición de ocupación de las viviendas - CC (2017)',
  subtituloEstructura: 'Estructura de las viviendas - CC (2017)',
  
  // Labels para input texto (párrafos)
  labelTextoViviendas: 'Viviendas - Texto Completo',
  labelTextoEstructura: 'Estructura - Texto Completo',
  
  // Hints para párrafos
  hintTextoViviendas: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Los campos con ____ son dinámicos.',
  hintTextoEstructura: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Los campos con ____ son dinámicos.',
  
  // Labels de Tablas y sus campos
  labelTituloCondicionOcupacion: 'Título',
  labelTituloTiposMateriales: 'Título',
  labelFuente: 'Fuente',
  labelTablaCondicionOcupacion: 'Tabla Condición de Ocupación',
  labelTablaTiposMateriales: 'Tabla Tipos de Materiales',
  
  // Placeholders de Tabla
  placeholderTituloCondicionOcupacion: 'Condición de ocupación de las viviendas – CC ____',
  placeholderTituloTiposMateriales: 'Tipos de materiales de las viviendas – CC ____',
  placeholderFuenteCondicionOcupacion: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',
  placeholderFuenteTiposMateriales: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',
  
  // Columnas de Tabla 1
  columnasCondicionOcupacion: {
    categoria: 'Condición de ocupación',
    casos: 'Casos',
    porcentaje: 'Porcentaje',
  },
  placeholderCategoria: 'Viviendas ocupadas',
  
  // Columnas de Tabla 2
  columnasTiposMateriales: {
    categoria: 'Categorías',
    tipoMaterial: 'Tipos de materiales',
    casos: 'Casos',
    porcentaje: 'Porcentaje',
  },
  placeholderCategorias: 'Paredes',
  placeholderTipoMaterial: 'Adobe',
  
  // Fotos
  labelFotografias: 'Fotografías',
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
  
  // Títulos por defecto con placeholder
  tituloDefaultCondicionOcupacion: 'Condición de ocupación de las viviendas – CC {comunidad} (2017)',
  tituloDefaultTiposMateriales: 'Tipos de materiales de las viviendas – CC {comunidad} (2017)',
  
  // Fuentes por defecto
  fuenteDefaultCondicionOcupacion: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',
  fuenteDefaultTiposMateriales: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',
};

// ============================================================================
// ✅ TABLE CONFIGS - PATRÓN SOLO LECTURA BACKEND
// ============================================================================

/**
 * Configuración para Tabla 1: Condición de Ocupación
 * ✅ SIN fila Total especial (totalKey vacío) - igual a sección 8
 * 📝 Datos ingresados manualmente; el endpoint está deshabilitado temporalmente
 */
export const SECCION9_TABLA_CONDICION_OCUPACION_CONFIG: TableConfig = {
  tablaKey: 'condicionOcupacionTabla',
  totalKey: '',                            // ✅ Vacío como en sección 8 - NO hay fila Total especial
  campoTotal: 'casos',                     // ✅ Campo para calcular total
  campoPorcentaje: 'porcentaje',           // ✅ Campo para porcentaje
  calcularPorcentajes: true,               // ✅ Habilitar cálculo automático
  camposParaCalcular: ['casos'],           // ✅ Campos a considerar para cálculo
  noInicializarDesdeEstructura: true,      // ✅ No inicializar vacía
  permiteAgregarFilas: true,               // ✅ Permitir agregar
  permiteEliminarFilas: true               // ✅ Permitir eliminar
};

/**
 * Configuración para Tabla 2: Tipos de Materiales
 * ✅ CORREGIDO: Habilitado cálculo de totales y porcentajes
 */
export const SECCION9_TABLA_TIPOS_MATERIALES_CONFIG: TableConfig = {
  tablaKey: 'tiposMaterialesTabla',
  totalKey: 'categoria',                    // ✅ Fila "Total" se identifica por categoria === 'Total'
  campoTotal: 'casos',                      // ✅ Campo para total
  campoPorcentaje: 'porcentaje',            // ✅ Campo para porcentaje
  calcularPorcentajes: true,                 // ✅ Habilitar cálculo automático
  camposParaCalcular: ['casos'],            // ✅ Campos a considerar para cálculo
  noInicializarDesdeEstructura: true,       // ✅ No inicializar vacía
  permiteAgregarFilas: true,                // ✅ Permitir agregar
  permiteEliminarFilas: true                // ✅ Permitir eliminar
};
