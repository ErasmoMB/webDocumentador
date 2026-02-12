// ============================================================================
// SECCION 17: INDICADOR DE DESARROLLO HUMANO (IDH)
// ============================================================================

export const SECCION17_PHOTO_PREFIX = 'fotografiaIDH';

export const SECCION17_DEFAULT_TEXTS = {
  /**
   * Genera el texto default para el IDH con contexto dinámico
   * @param distrito - Nombre del distrito (ej: "Cahuacho")
   * @param idhValue - Valor del IDH (ej: "0.542")
   * @param rankValue - Rango del IDH (ej: "2400")
   */
  textoIDHDefault: (distrito: string, idhValue: string, rankValue: string): string => {
    const idhValor = (idhValue !== '____' && idhValue !== '0.000' && idhValue !== '0,000') ? idhValue : '____';
    const rankValor = (rankValue !== '____' && rankValue !== '0') ? rankValue : '____';

    return `El Índice de Desarrollo Humano (IDH) mide el logro medio de un país (en nuestro país se mide también a niveles departamentales, provinciales y distritales) tratándose de un índice compuesto. El IDH contiene tres variables: la esperanza de vida al nacer, el logro educacional (alfabetización de adultos y la tasa bruta de matriculación primaria, secundaria y terciaria combinada) y el PIB real per cápita (PPA en dólares). El ingreso se considera en el IDH en representación de un nivel decente de vida y en reemplazo de todas las opciones humanas que no se reflejan en las otras dos dimensiones.\n\nSegún el informe del PNUD para el año 2019, el Índice de Desarrollo Humano del distrito de ${distrito} es de ${idhValor}. Es así que ocupa el puesto N°${rankValor} en el país, siendo una de las divisiones políticas de nivel subnacional con uno de los IDH más bajos.`;
  },

  // Default titles y sources
  tituloIDHDefault: 'Índice de Desarrollo Humano',
  fuenteIDHDefault: 'PNUD - Informe de Desarrollo Humano 2019'
};
