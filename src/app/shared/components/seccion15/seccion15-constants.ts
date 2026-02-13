/**
 * ✅ SECCION 15 - CONSTANTES CENTRALIZADAS
 * Aspectos Culturales (lenguas, dialectos, lugares)
 * 
 * OBLIGATORIO: 100% de textos, labels, placeholders y hints aquí centralizados
 * Estado: ✅ MODO IDEAL (Refactorización Completa 12/02/2026)
 */

// ============================================================================
// CONFIGURACION
// ============================================================================

export const SECCION15_SECTION_ID = '3.1.4.A.1.11';
export const SECCION15_PHOTO_PREFIX = 'fotografiaIglesia';

export const SECCION15_WATCHED_FIELDS = [
  // Párrafos principales
  'textoAspectosCulturales',
  'textoIdioma',
  'parrafoSeccion15_religion_completo',
  // Títulos de tablas
  'lenguasMaternasTitulo',
  'religionesTitulo',
  // Fuentes de tablas
  'lenguasMaternasFuente',
  'religionesFuente',
  // Tablas
  'lenguasMaternasTabla',
  'religionesTabla',
  // Fotografías (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaIglesia${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaIglesia${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaIglesia${i + 1}Imagen`),
];

// ============================================================================
// TEXTOS POR DEFECTO (CON PLACEHOLDERS DINAMICOS)
// ============================================================================

export const SECCION15_DEFAULT_TEXTS = {
  textoAspectosCulturalesDefault: (comunidad: string) =>
    `Los aspectos culturales juegan un papel significativo en la vida social y cultural de una comunidad, influyendo en sus valores, costumbres y prácticas cotidianas. En esta sección, se caracterizan y describen la diversidad religiosa en la CC ${comunidad}, explorando las principales creencias.`,

  textoIdiomaDefault: 'La lengua materna es la primera lengua o idioma que aprende una persona. De la data obtenida de los Censos Nacionales 2017, se aprecia que el castellano es la categoría mayoritaria, pues representa la mayor parte de la población de 3 años a más. En segundo lugar se halla el quechua como primer idioma.',

  textoReligionDefault: (comunidad: string) =>
    `En la actualidad, la confesión predominante dentro de la CC ${comunidad} es la católica. Según las entrevistas aplicadas, la permanencia del catolicismo como la religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz ${comunidad}, y a la inexistencia de templos evangélicos o de otras confesiones.\n\nEsta iglesia es el principal punto de reunión religiosa de la comunidad y juega un rol importante en la vida espiritual de sus habitantes. Otro espacio con gran valor espiritual es el cementerio, en donde los comuneros entierran y visitan a sus difuntos. Este lugar se halla al sur del anexo ${comunidad}.`,
};

// ============================================================================
// TEMPLATES - LABELS, PLACEHOLDERS, HINTS Y MENSAJES
// ============================================================================

export const SECCION15_TEMPLATES = {
  // ---- TITULOS Y ENCABEZADOS ----
  sectionTitle: 'A.1.11. Aspectos culturales (lenguas, dialectos, lugares)',
  subsectionIdioma: 'a. Idioma',
  subsectionReligion: 'b. Religión',

  // ---- LABELS PARA FORMULARIO ----
  labelTextoAspectosCulturales: 'Aspectos culturales - Texto Completo',
  labelTextoIdioma: 'Idioma - Texto Completo',
  labelTextoReligion: 'Religión - Texto Completo',
  labelLenguasMaternasTitulo: 'Título de la Tabla Lenguas Maternas',
  labelLenguasMaternasFuente: 'Fuente de la Tabla Lenguas Maternas',
  labelReligionesTitulo: 'Título de la Tabla Religiones',
  labelReligionesFuente: 'Fuente de la Tabla Religiones',
  labelFotografias: 'Fotografías de Iglesia',

  // ---- HINTS/AYUDA ----
  hintTextoAspectosCulturales: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintTextoIdioma: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintTextoReligion: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // ---- PLACEHOLDERS ----
  placeholderLenguasMaternasTitulo: 'Lenguas maternas en población de 3 años a más',
  placeholderLenguasMaternasFuente: 'Plataforma Nacional de Datos Georreferenciados – Geo Perú',
  placeholderReligionesTitulo: 'Religión',
  placeholderReligionesFuente: 'Plataforma Nacional de Datos Georreferenciados – Geo Perú',

  // ---- COLUMNAS DE TABLA ----
  tableColumnCategoria: 'Categoría',
  tableColumnCasos: 'Casos',
  tableColumnPorcentaje: 'Porcentaje',

  // ---- PLACEHOLDERS PARA COLUMNAS ----
  tableColPlaceholderCategoria1: 'Castellano',
  tableColPlaceholderCategoria2: 'Católica',
  tableColPlaceholderCasos: '0',
  tableColPlaceholderPorcentaje: '0%',

  // ---- DEFAULTS DE TITULOS DE TABLA ----
  lenguasMaternasTituloDefault: 'Lenguas maternas en población de 3 años a más – CC ____',
  religionesTituloDefault: 'Religión – CC ____',

  // ---- DEFAULTS DE FUENTES ----
  fuenteDefault: 'Plataforma Nacional de Datos Georreferenciados – Geo Perú',

  // ---- FOTOGRAFIAS ----
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',
  placeholderFotoTitulo: 'Ej: Iglesia Matriz del anexo Ayroca',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  tituloFotoDefault: 'Iglesia Matriz del anexo Ayroca',
  fuenteFotoDefault: 'GEADES, 2024',

  // ---- ETIQUETAS PARA VISTA ----
  labelTitulo: 'Título',
  labelFuente: 'Fuente',
  labelImagen: 'Imagen',

  // ---- EDITAR PARRAFOS ----
  titleEditarParrafos: 'Editar Párrafos',
};
