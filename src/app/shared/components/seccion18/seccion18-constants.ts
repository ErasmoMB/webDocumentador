/**
 * ✅ SECCION 18: NECESIDADES BÁSICAS INSATISFECHAS (NBI)
 * Constantes centralizadas para Seccion 18 - Índice de NBI Distrital
 * - Campos observados para persistencia
 * - Configuración de seccion
 * - Todos los textos centralizados
 */

export const SECCION18_WATCHED_FIELDS = [
  'textoNecesidadesBasicasInsatisfechas',
  'tituloNbiCC',
  'fuenteNbiCC',
  'tituloNbiDistrito',
  'fuenteNbiDistrito',
  'nbiCCAyrocaTabla',
  'nbiDistritoCahuachoTabla',
  ...Array.from({ length: 10 }, (_, i) => `fotografiaNBI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaNBI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaNBI${i + 1}Imagen`),
  // Variantes con prefijo de grupo AISD (A.1, A.2, etc.)
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `textoNecesidadesBasicasInsatisfechesA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `tituloNbiCCA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `fuenteNbiCCA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `tituloNbiDistritoA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `fuenteNbiDistritoA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `nbiCCAyrocaTablaA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `nbiDistritoCahuachoTablaA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `fotografiaNBIA.${g + 1}${i + 1}Titulo`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `fotografiaNBIA.${g + 1}${i + 1}Fuente`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `fotografiaNBIA.${g + 1}${i + 1}Imagen`)).flat(),
];

export const SECCION18_PHOTO_PREFIX = 'fotografiaNBI';

export const SECCION18_CONFIG = {
  sectionId: '3.1.4.A.1.14',
  title: 'Índice de necesidades básicas insatisfechas distrital',
  photoPrefix: 'fotografiaNBI',
  maxPhotos: 10,
};

export const SECCION18_TEMPLATES = {
  // === TÍTULOS Y SUBTÍTULOS ===
  sectionTitle: 'A.1.14. Índice de necesidades básicas insatisfechas distrital',
  editParrafosTitle: 'Editar Párrafos',
  
  // === LABELS DE FORMULARIO ===
  labelTextoNBI: 'Necesidades Básicas Insatisfechas - Texto Completo',
  labelTextoCompleto: 'Necesidades Básicas Insatisfechas - Texto Completo',
  labelTituloNbiCC: 'Título - Tabla NBI CC',
  labelTituloNbiDistrito: 'Título - Tabla NBI Distrito',
  labelFuenteNbiCC: 'Fuente - Tabla NBI CC',
  labelFuenteNbiDistrito: 'Fuente - Tabla NBI Distrito',
  labelTableNbiCC: 'Tabla NBI CC {COMUNIDAD}',
  labelTableNbiDistrito: 'Tabla NBI Distrito {DISTRITO}',
  labelFotografias: 'Fotografías de NBI',
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía',

  // === HINTS Y AYUDAS ===
  hintTextoNBI: 'Edite el texto completo. Use Enter para crear nuevos párrafos.',
  hintTextoCompleto: 'Edite el texto completo. Use Enter para crear nuevos párrafos.',

  // === PLACEHOLDERS CON ____ PARA REEMPLAZO DINÁMICO (patrón como sección 13) ===
  placeholderTextoNBI: 'Texto de NBI...',
  placeholderTituloNbiCC: 'Necesidades Básicas Insatisfechas (NBI) según población – CC ____ (2017)',
  placeholderTituloNbiDistrito: 'Tipos de NBI existentes – Distrito ____ (2017)',
  placeholderFuenteNbiCC: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',
  placeholderFuenteNbiDistrito: 'Perú: Mapa de Necesidades Básicas Insatisfechas (NBI), 1993, 2007 y 2017',
  placeholderFotoTitulo: 'Ej: NBI del distrito',
  placeholderFotoFuente: 'Ej: Censo 2017',

  // === LABELS DE TABLA ===
  tableHeader: {
    categoria: 'Categoría',
    casos: 'Casos',
    porcentaje: 'Porcentaje',
  },
  tableRow: {
    categoriaCC: 'Viviendas con hacinamiento',
    categoriaDistrito: 'Viviendas sin servicios higiénicos',
  },
  tableColumnCategoria: 'Categoría',
  tableColumnCasos: 'Casos',
  tableColumnPorcentaje: 'Porcentaje',
  tableReadonlyCategoria: 'Viviendas con hacinamiento',
  tableReadonlyCategoria2: 'Viviendas sin servicios higiénicos',

  // === ETIQUETA DE FUENTE (para vista) ===
  sourceLabel: 'FUENTE:',

  // === VALORES POR DEFECTO PARA FOTOS ===
  tituloFotoDefault: 'Necesidades Básicas Insatisfechas',
  fuenteFotoDefault: 'Censo 2017',

  // === MENSAJES VACIOS ===
  mensajeSinDatos: '____',

  // === FUENTES Y REFERENCIAS ===
  fuenteNbiCCDefault: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',
  fuenteNbiDistritoDefault: 'Perú: Mapa de Necesidades Básicas Insatisfechas (NBI), 1993, 2007 y 2017',
};

export const SECCION18_DEFAULT_TEXTS = {
  /**
   * Genera el texto default para NBI completo
   * @param grupoAISD - Nombre del grupo (ej: "Ayroca")
   * @param distrito - Nombre del distrito (ej: "Cahuacho")
   * @param totalCC - Total de población en CC
   * @param totalDist - Total de población en distrito
   * @param porcentajeHacinamientoCC - Porcentaje de hacinamiento CC
   * @param porcentajeSinServiciosCC - Porcentaje sin servicios CC
   * @param porcentajeSinServiciosDist - Porcentaje sin servicios distrito
   * @param porcentajeHacinamientoDist - Porcentaje de hacinamiento distrito
   */
  textoNBIDefault: (
    grupoAISD: string,
    distrito: string,
    totalCC: string,
    totalDist: string,
    porcentajeHacinamientoCC: string,
    porcentajeSinServiciosCC: string,
    porcentajeSinServiciosDist: string,
    porcentajeHacinamientoDist: string
  ): string => {
    const formatoPorcentaje = (valor: string): string => {
      if (!valor || valor === '____' || valor.trim() === '') return '';
      return ` (${valor}%)`;
    };

    const texto1 = `En primer lugar, cabe mencionar que en la CC ${grupoAISD} se halla un total de ${totalCC} personas residentes en viviendas particulares. De este conjunto, se observa que la NBI más frecuente, según población, es la de viviendas con hacinamiento${formatoPorcentaje(porcentajeHacinamientoCC)}, seguido de la de viviendas sin servicios higiénicos${formatoPorcentaje(porcentajeSinServiciosCC)}.`;

    const texto2 = `Por otro lado, a nivel distrital de ${distrito}, de un total de ${totalDist} unidades de análisis, se sabe que el tipo de NBI más frecuente es la de viviendas sin servicios higiénicos${formatoPorcentaje(porcentajeSinServiciosDist)}, seguida de la de viviendas con hacinamiento${formatoPorcentaje(porcentajeHacinamientoDist)}. En ese sentido, se aprecia que el orden de las dos NBI mayoritarias es inverso al comparar a la CC ${grupoAISD} con el distrito de ${distrito}.`;

    return `${texto1}\n\n${texto2}`;
  },

  // ✅ TÍTULOS DINÁMICOS GENERADOS
  tituloNbiCCDefault: (grupo: string) => `Necesidades Básicas Insatisfechas (NBI) según población – CC ${grupo} (2017)`,
  tituloNbiDistritoDefault: (distrito: string) => `Tipos de NBI existentes – Distrito ${distrito} (2017)`,
};
