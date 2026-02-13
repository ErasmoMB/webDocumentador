/**
 * ✅ SECCION14_CONSTANTS
 * Constantes centralizadas para Sección 14 - Indicadores Educativos
 * Campos observados para persistencia + Configuración + Todos los textos
 */

// 1️⃣ CAMPOS OBSERVADOS
export const SECCION14_WATCHED_FIELDS = [
  'parrafoSeccion14_indicadores_educacion_intro',
  'textoNivelEducativo',
  'textoTasaAnalfabetismo',
  'cuadroTituloNivelEducativo',
  'cuadroFuenteNivelEducativo',
  'cuadroTituloTasaAnalfabetismo',
  'cuadroFuenteTasaAnalfabetismo',
];

// 2️⃣ CONFIGURACION
export const SECCION14_CONFIG = {
  sectionId: '3.1.4.A.1.10',
  title: 'A.1.10. Indicadores de educación',
  photoPrefix: 'fotografiaEducacionIndicadores',
  maxPhotos: 10,
};

// 3️⃣ TEMPLATES - TODOS LOS TEXTOS CENTRALIZADOS
export const SECCION14_TEMPLATES = {
  // ===== TITULO PRINCIPAL =====
  tituloSeccion: 'A.1.10. Indicadores de educación',

  // ===== SECCION: INTRODUCCION =====
  subtituloIntro: 'Editar Párrafos',
  labelIntro: 'Introducción - Indicadores de Educación',
  hintIntro: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  textoIntroDefault: 'La educación es un indicador fundamental para medir el desarrollo humano y social de una comunidad. A continuación, se presentan los principales indicadores educativos de la población de la comunidad campesina, basados en los datos censales disponibles.',

  // ===== SECCION A: NIVEL EDUCATIVO =====
  subtituloNivelEducativo: 'a. Nivel Educativo de la población',
  labelNivelEducativo: 'Nivel Educativo - Texto Completo',
  hintNivelEducativo: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  textoNivelEducativoDefault: 'El nivel educativo alcanzado por la población de 15 años a más refleja el acceso y la calidad de la educación en la comunidad. Los datos muestran que ____% de la población ha alcanzado educación primaria, ____% secundaria y ____% educación superior no universitaria.',
  
  labelTituloNivelEducativo: 'Título del cuadro',
  tituloNivelEducativoDefault: 'Población de 15 años a más según nivel educativo alcanzado',
  
  labelTablaNivelEducativo: 'Tabla Nivel Educativo',
  columnaCategoriaLabel: 'Categoría',
  columnaCasosLabel: 'Casos',
  columnaPorcentajeLabel: 'Porcentaje',
  placeholderCategoria: 'Primaria',
  placeholderCasos: '0',
  placeholderPorcentaje: '0%',
  
  labelFuenteNivelEducativo: 'Fuente',
  fuenteNivelEducativoDefault: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',
  
  labelFotoNivelEducativo: 'Fotografías de Indicadores de Educación',
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',
  placeholderFotoTitulo: 'Ej: Indicadores de educación',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  tituloFotoDefault: 'Indicadores de educación',
  fuenteFotoDefault: 'GEADES, 2024',

  // ===== SECCION B: TASA DE ANALFABETISMO =====
  subtituloTasaAnalfabetismo: 'b. Tasa de analfabetismo',
  labelTasaAnalfabetismo: 'Tasa de Analfabetismo - Texto Completo',
  hintTasaAnalfabetismo: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  textoTasaAnalfabetismoDefault: 'La tasa de analfabetismo en la población de 15 años a más es de ____%, lo que representa ____ personas que no saben leer ni escribir. Este indicador es crucial para identificar necesidades educativas y planificar intervenciones.',
  
  labelTituloTasaAnalfabetismo: 'Título del cuadro',
  tituloTasaAnalfabetismoDefault: 'Tasa de analfabetismo en población de 15 años a más',
  
  labelTablaTasaAnalfabetismo: 'Tabla Tasa de Analfabetismo',
  columnaIndicadorLabel: 'Indicador',
  placeholderIndicador: 'Ej: Sabe leer y escribir',
  
  labelFuenteTasaAnalfabetismo: 'Fuente',
  fuenteTasaAnalfabetismoDefault: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',
};

// ===== LEGACY (EXPORTS PARA COMPATIBILIDAD) =====
export const SECCION14_PHOTO_PREFIX = SECCION14_CONFIG.photoPrefix;
export const SECCION14_DEFAULT_TEXTS = {
  textoIndicadoresEducacionIntro: SECCION14_TEMPLATES.textoIntroDefault,
  textoNivelEducativo: SECCION14_TEMPLATES.textoNivelEducativoDefault,
  textoTasaAnalfabetismo: SECCION14_TEMPLATES.textoTasaAnalfabetismoDefault,
};
