/**
 * ✅ SECCION 16 - CONSTANTES COMPLETAS
 * Uso de los suelos y de los recursos naturales
 *
 * Centraliza:
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados (100% cero hardcoding)
 */

// ============================================================================
// 1️⃣ CAMPOS OBSERVADOS (PERSISTENCIA)
// ============================================================================

export const SECCION16_WATCHED_FIELDS = [
  // Párrafos editables
  'parrafoSeccion16_agua_completo',
  'parrafoSeccion16_recursos_naturales_completo',
  // Campos de fotos - Reservorio (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaReservorio${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaReservorio${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaReservorio${i + 1}Imagen`),
  // Campos de fotos - Uso de Suelos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUsoSuelos${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUsoSuelos${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUsoSuelos${i + 1}Imagen`),
];

// ============================================================================
// 2️⃣ CONFIGURACIÓN DE SECCIÓN
// ============================================================================

export const SECCION16_SECTION_ID = '3.1.4.A.1.12';

export const SECCION16_CONFIG = {
  sectionId: SECCION16_SECTION_ID,
  title: 'A.1.12. Uso de los suelos y de los recursos naturales',
  photoPrefix_Reservorio: 'fotografiaReservorio',
  photoPrefix_UsoSuelos: 'fotografiaUsoSuelos',
  maxPhotos: 10,
};

// ============================================================================
// 3️⃣ PREFIJOS DE FOTOS
// ============================================================================

export const SECCION16_PHOTO_PREFIX_RESERVORIO = 'fotografiaReservorio';
export const SECCION16_PHOTO_PREFIX_USO_SUELOS = 'fotografiaUsoSuelos';

// ✅ PATRÓN IDEAL - Prefijos de fotos específicos por tema
export const SECCION16_PHOTO_PREFIXES = {
  reservorio: 'fotografiaReservorio',
  usoSuelos: 'fotografiaUsoSuelos'
};

// ============================================================================
// 4️⃣ TEMPLATES - TODOS LOS TEXTOS CENTRALIZADOS
// ============================================================================

export const SECCION16_TEMPLATES = {
  // Títulos principales
  tituloSeccion: 'A.1.12. Uso de los suelos y de los recursos naturales',
  subtituloAgua: 'a. Fuentes y usos del agua',
  subtituloTenencia: 'b. Tenencia de la tierra, usos del suelo y de los recursos naturales',

  // Labels de párrafos
  labelAguaCompleto: 'Agua - Texto Completo',
  hintAguaCompleto: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  labelRecursosNaturalesCompleto: 'Recursos Naturales - Texto Completo',
  hintRecursosNaturalesCompleto: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // Labels de secciones de fotos
  labelFotografiasReservorio: 'Fotografías de Reservorio',
  labelFotografiasUsoSuelos: 'Fotografías de Uso de Suelos',

  // Labels de fotos (usados en image-upload)
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',

  // Placeholders de fotos
  placeholderFotoTituloReservorio: 'Ej: Reservorio del anexo Ayroca',
  placeholderFotoTituloUsoSuelos: 'Ej: Uso de los suelos en el anexo Ayroca',
  placeholderFotoFuente: 'Ej: GEADES, 2024',

  // Valores por defecto de fotos
  tituloFotoDefaultReservorio: 'Reservorio del anexo Ayroca',
  tituloFotoDefaultUsoSuelos: 'Uso de los suelos en el anexo Ayroca',
  fuenteFotoDefault: 'GEADES, 2024',

  // Textos por defecto de párrafos (substituciones dinámicas):
  // {{grupoAISD}}, {{ojosAgua1}}, {{ojosAgua2}}, {{rioAgricola}}, {{quebradaAgricola}}
  textoPorDefectoAguaCompleto: `Las fuentes de agua en la CC {{grupoAISD}} son diversas, dependiendo del uso que se les dé. Para el consumo humano, el agua se obtiene principalmente de los ojos de agua de {{ojosAgua1}} y {{ojosAgua2}}. En el caso del anexo {{grupoAISD}}, esta agua es almacenada en un reservorio, desde donde se distribuye a las viviendas locales a través de una red básica de distribución. Aunque el abastecimiento cubre las necesidades esenciales de la población, existen desafíos relacionados con la calidad del agua y el mantenimiento de la infraestructura.

En cuanto al uso agrícola, el agua proviene del río {{rioAgricola}} y la quebrada {{quebradaAgricola}}, que sirven como una fuente importante de riego. Finalmente, para el uso ganadero, la comunidad se abastece de las diferentes quebradas que se hallan dentro del área de la CC {{grupoAISD}}, las cuales proporcionan agua para el sustento del ganado local, principalmente vacunos y ovinos.`,

  textoPorDefectoRecursosNaturalesCompleto: `En la CC {{grupoAISD}}, la tenencia de la tierra es comunal, lo que significa que la comunidad en su conjunto es la propietaria de los terrenos superficiales. Los comuneros no son propietarios individuales de la tierra, sino que la comunidad les cede los terrenos en calidad de posesión para que puedan vivir y trabajar en ellos. Este sistema de tenencia comunal busca asegurar el acceso equitativo a los recursos entre los miembros de la comunidad, aunque limita la posibilidad de transacciones privadas de terrenos.

En cuanto a los usos del suelo, la mayor parte del territorio está destinado a las actividades agrícolas y ganaderas, las cuales son el principal sustento económico de la población. La tierra es aprovechada para el cultivo de papa, haba y cebada, y para el pastoreo de vacunos y ovinos. Entre los recursos naturales que se aprovechan destacan la queñua, eucalipto, lloque y tola, que son utilizados como leña para la cocción de alimentos o en la construcción.

Además, según algunos comuneros, dentro del territorio de la comunidad existen diversas hierbas medicinales con efectos positivos para la salud. Entre ellas destacan la huamanripa, llantén, muña y salvia. Estas son utilizadas en un primer nivel de atención antes de acudir al establecimiento de salud local.`,

  // Valores por defecto de campos dinámicos (fallback)
  ojosAgua1Default: 'Quinsa Rumi',
  ojosAgua2Default: 'Pallalli',
  rioAgricolaDefault: 'Yuracyacu',
  quebradaAgricolaDefault: 'Pucaccocha',
};
