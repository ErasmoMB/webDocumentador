/**
 * ✅ SECCION 17: INDICADOR DE DESARROLLO HUMANO (IDH)
 * Constantes centralizadas para Seccion 17 - Índice de Desarrollo Humano
 * - Campos observados para persistencia
 * - Configuración de seccion
 * - Todos los textos centralizados
 */

export const SECCION17_WATCHED_FIELDS = [
  'textoIndiceDesarrolloHumano',
  'tituloIDH',
  'fuenteIDH',
  'indiceDesarrolloHumanoTabla',
  ...Array.from({ length: 10 }, (_, i) => `fotografiaIDH${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaIDH${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaIDH${i + 1}Imagen`),
  // Variantes con prefijo de grupo AISD (A.1, A.2, etc.)
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `textoIndiceDesarrolloHumanoA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `tituloIDHA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `fuenteIDHA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `indiceDesarrolloHumanoTablaA.${g + 1}`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `fotografiaIDHA.${g + 1}${i + 1}Titulo`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `fotografiaIDHA.${g + 1}${i + 1}Fuente`)).flat(),
  ...Array.from({ length: 5 }, (_, g) => Array.from({ length: 10 }, (_, i) => `fotografiaIDHA.${g + 1}${i + 1}Imagen`)).flat(),
];

export const SECCION17_PHOTO_PREFIX = 'fotografiaIDH';

export const SECCION17_CONFIG = {
  sections: '3.1.4.A.1.13',
  title: 'Índice de Desarrollo Humano (IDH)',
  photoPrefix: 'fotografiaIDH',
  maxPhotos: 10,
};

export const SECCION17_TEMPLATES = {
  // === TÍTULOS Y SUBTÍTULOS ===
  sectionTitle: 'A.1.13. Índice de Desarrollo Humano (IDH)',
  
  // === LABELS DE FORMULARIO ===
  labelTextoIDH: 'Índice de Desarrollo Humano - Texto Completo',
  labelTitulo: 'Título',
  labelFuente: 'Fuente',
  labelFotografias: 'Fotografías del IDH',

  // === HINTS Y AYUDAS ===
  hintTextoIDH: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // === PLACEHOLDERS ===
  placeholderTextoIDH: 'Texto del IDH...',
  placeholderTitulo: 'Componentes del IDH – Distrito ____',
  placeholderFuente: 'PNUD, 2019',
  placeholderFotoTitulo: 'Ej: IDH del distrito',
  placeholderFotoFuente: 'Ej: PNUD, 2019',

  // === LABELS DE TABLA ===
  tableHeaders: {
    poblacion: 'Población',
    rankIdh1: 'Rank',
    idh: 'IDH',
    rankEsperanza: 'Rank',
    esperanzaVida: 'Años',
    rankEducacion1: 'Rank',
    educacion: 'Porcentaje',
    rankEducacion2: 'Rank',
    anosEducacion: 'Años',
    rankAnios: 'Rank',
    ingreso: 'N.S. mes',
    rankIngreso: 'Rank',
  },

  tableGroupHeaders: [
    { label: 'Población', colspan: 2 },
    { label: 'Índice de Desarrollo Humano', colspan: 2 },
    { label: 'Esperanza de vida al nacer', colspan: 2 },
    { label: 'Con Educación secundaria completa (Población 18 años)', colspan: 2 },
    { label: 'Años de educación (Población 25 y más)', colspan: 2 },
    { label: 'Ingreso familiar per cápita', colspan: 2 },
  ],

  // === VALORES POR DEFECTO PARA FOTOS ===
  tituloFotoDefault: 'Índice de Desarrollo Humano',
  fuenteFotoDefault: 'PNUD, 2019',

  // === MENSAJES VACIOS ===
  mensajeSinDatos: '____',

  // === FUENTES Y REFERENCIAS ===
  fuenteIDHDefault: 'PNUD Informe 2019',
  fuenteIDHCompleto: 'PNUD - Informe de Desarrollo Humano 2019',
};

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

  // ✅ TÍTULO DINÁMICO GENERADO
  tituloIDHDefault: (distrito: string): string => `Componentes del Índice de Desarrollo Humano – ${distrito} (2019)`,
  
  // ✅ DESCRIPCIÓN GENERAL DEL IDH
  idhDescripcion: 'El Índice de Desarrollo Humano (IDH) mide el logro medio de un país (en nuestro país se mide también a niveles departamentales, provinciales y distritales) tratándose de un índice compuesto. El IDH contiene tres variables: la esperanza de vida al nacer, el logro educacional (alfabetización de adultos y la tasa bruta de matriculación primaria, secundaria y terciaria combinada) y el PIB real per cápita (PPA en dólares). El ingreso se considera en el IDH en representación de un nivel decente de vida y en reemplazo de todas las opciones humanas que no se reflejan en las otras dos dimensiones.',

  // ✅ RESULTADO DEL IDH (TEMPLATE)
  idhResultado: (distrito: string, idhValue: string, rankValue: string): string => {
    const idhValor = (idhValue !== '____' && idhValue !== '0.000' && idhValue !== '0,000') ? idhValue : '____';
    const rankValor = (rankValue !== '____' && rankValue !== '0') ? rankValue : '____';
    return `Según el informe del PNUD para el año 2019, el Índice de Desarrollo Humano del distrito de ${distrito} es de ${idhValor}. Es así que ocupa el puesto N°${rankValor} en el país, siendo una de las divisiones políticas de nivel subnacional con uno de los IDH más bajos.`;
  },
};
