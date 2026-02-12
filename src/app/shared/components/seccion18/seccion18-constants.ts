// ============================================================================
// SECCION 18: NECESIDADES BÁSICAS INSATISFECHAS (NBI)
// ============================================================================

export const SECCION18_PHOTO_PREFIX = 'fotografiaNBI';

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

  // Default titles y sources
  tituloNbiCCDefault: (grupo: string) => `Necesidades Básicas Insatisfechas (NBI) según población – CC ${grupo} (2017)`,
  fuenteNbiCCDefault: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',
  
  tituloNbiDistritoDefault: (distrito: string) => `Tipos de NBI existentes – Distrito ${distrito} (2017)`,
  fuenteNbiDistritoDefault: 'Perú: Mapa de Necesidades Básicas Insatisfechas (NBI), 1993, 2007 y 2017'
};
