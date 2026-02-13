/**
 * ✅ SECCION23_CONSTANTS
 * Constantes centralizadas para Sección 23 - Indicadores y distribución de la PEA
 * - Campos observados para persistencia
 * - Configuración de tablas
 * - TODOS los textos centralizados (ZERO HARDCODING)
 */

export const SECCION23_SECTION_ID = '3.1.4.B.1.2';

export const SECCION23_PHOTO_PREFIX = 'fotografiaPEA';

// ✅ PATRÓN IDEAL - Prefijos de fotos específicos por tema
export const SECCION23_PHOTO_PREFIXES = {
  base: 'fotografiaPEA'
};

export const SECCION23_WATCHED_FIELDS = [
  'grupoAISD', 'distritoSeleccionado',
  'poblacionDistritalAISI', 'petDistritalAISI',
  'petGruposEdadAISI', 'petGruposEdadTitulo', 'petGruposEdadFuente',
  'peaDistritoSexoTabla', 'peaDistritoSexoTitulo', 'peaDistritoSexoFuente',
  'peaOcupadaDesocupadaTabla', 'peaOcupadaDesocupadaTitulo', 'peaOcupadaDesocupadaFuente',
  'textoPET_AISI', 'textoPETIntro_AISI', 'textoIndicadoresDistritalesAISI',
  'textoPEA_AISI', 'textoEmpleoAISI', 'textoEmpleoDependiente_AISI',
  'textoIngresosAISI', 'textoIndiceDesempleoAISI', 'textoPEAAISI',
  'textoAnalisisPEA_AISI',
  // Fotos
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPEA${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPEA${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPEA${i + 1}Imagen`),
];

export const SECCION23_TABLE_CONFIGS = {
  petGruposEdad: {
    tablaKey: 'petGruposEdadAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  },
  peaDistritoSexo: {
    tablaKey: 'peaDistritoSexoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['hombres', 'mujeres']
  },
  peaOcupadaDesocupada: {
    tablaKey: 'peaOcupadaDesocupadaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['hombres', 'mujeres']
  }
};

/**
 * TEMPLATES - TODOS los textos centralizados
 * Categorías: Títulos, Labels, Placeholders, Hints, Parrafos por defecto, Mensajes
 */
export const SECCION23_TEMPLATES = {
  // ===== TÍTULOS PRINCIPALES =====
  sectionTitle: 'B.1.2. Indicadores y distribución de la Población Económicamente Activa',
  subsectionPET: 'a. Población en edad de trabajar (PET)',
  subsectionPEA: 'b. Población Económicamente Activa (PEA)',
  subsectionEmpleoSituacion: 'b.1. Situación del empleo (dependiente o independiente)',
  subsectionIngresos: 'b.2. Ingresos de la población',
  subsectionIndiceDesempleo: 'b.3. Índice de Desempleo',
  subsectionFotografias: 'Fotografías adicionales',
  subsectionEditarParrafos: 'Editar Párrafos',

  // ===== LABELS (Form) =====
  labelPETIntro: 'PET - Párrafo introductorio',
  labelPETCompleto: 'PET - Texto Completo',
  labelPETTitulo: 'Título de la tabla',
  labelPETTabla: 'Tabla PET según grupos de edad',
  labelPETFuente: 'Fuente',

  labelPeaDisiminaAnalisis: 'Análisis PEA - Texto Completo',
  labelPeaDistritoSexoTitulo: 'Título de la tabla',
  labelPeaDistritoSexoTabla: 'Tabla PEA y No PEA según sexo',
  labelPeaDistritoSexoFuente: 'Fuente',

  labelIndicadoresDistritalesAnalisis: 'Indicadores Distritales - Texto Completo',

  labelPeaTextCompleto: 'PEA - Texto Completo',
  labelEmpleoSituacionCompleto: 'Situación del empleo - Texto Completo',
  labelEmpleoDependienteTexto: 'Empleo dependiente - Texto',

  labelIngresosCompleto: 'Ingresos de la población - Texto Completo',

  labelIndiceDesempleoCompleto: 'Índice de Desempleo - Texto Completo',
  labelPeaOcupadaDesocupadaTitulo: 'Título de la tabla',
  labelPeaOcupadaDesocupadaTabla: 'Tabla PEA Ocupada y Desocupada según sexo',
  labelPeaOcupadaDesocupadaFuente: 'Fuente',

  labelPeaOcupadaDesocupadaAnalisis: 'Análisis PEA Ocupada y Desocupada - Texto Completo',

  // ===== PLACEHOLDERS (Form) =====
  placeholderPETTitulo: 'Ej: PET según grupos de edad – CP Cahuacho (2017)',
  placeholderPETFuente: 'Ej: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.',

  placeholderPeaDistritoSexoTitulo: 'Ej: Conformación de la PEA y No PEA, según sexo – Distrito Cahuacho (2017)',
  placeholderPeaDistritoSexoFuente: 'Ej: Resultados Definitivos de la Población Económicamente Activa 2017 – INEI 2018',

  placeholderPeaOcupadaDesocupadaTitulo: 'Ej: Conformación de la PEA Ocupada y Desocupada, según sexo – Distrito Cahuacho (2017)',
  placeholderPeaOcupadaDesocupadaFuente: 'Ej: Resultados Definitivos de la Población Económicamente Activa 2017 – INEI 2018',

  // ===== HINTS (Form) =====
  hintPETIntro: 'Párrafo introductorio. Deje vacío para usar el texto por defecto.',
  hintPETCompleto: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintIndicadoresDistritales: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintPeaAnalisis: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintEmpleoSituacion: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintEmpleoDependiente: 'Texto sobre empleo dependiente. Deje vacío para usar el texto por defecto.',
  hintIngresos: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintIndiceDesempleo: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintPeaOcupadaDesocupada: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // ===== TEXTOS POR DEFECTO (Fallback) =====
  petIntroDefault: 'La población cumplida de 14 años de edad, se encuentra en edad de trabajar, en concordancia con el Convenio 138 de la Organización Internacional del Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001.',

  petCompleteTemplateWithVariables: 'La población en edad de trabajar (PET) en el CP {{centroPoblado}} representa un {{porcentajePET}} de la población total y está soportada en su mayoría por el grupo etario de 45 a 64 años, puesto que son el {{porcentaje4564}} de la PET. El bloque de edad con menor cantidad de miembros es el de 65 años a más, puesto que representa solamente el {{porcentaje65}} de la PET.',

  indicadoresDistritalesTemplateWithVariables: 'No obstante, los indicadores de la Población Económicamente Activa (PEA), tanto de su cantidad total como por subgrupos (Ocupada y Desocupada), se describen a nivel distrital siguiendo la información oficial de la publicación "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI. Para ello es importante tomar en cuenta que la población distrital de {{distrito}}, jurisdicción donde se ubica el AISD en cuestión, es de {{poblacionDistrital}} personas, y que la PET (de 14 años a más) al mismo nivel está conformada por {{petDistrital}} personas.',

  peaCompleteTemplateWithVariables: 'La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social de cualquier jurisdicción al nivel que se requiera. En este apartado, se presenta una descripción de la PEA del distrito de {{distrito}}, jurisdicción que abarca a su capital distrital, el CP {{centroPoblado}}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población en capacidad de trabajar en el distrito en cuestión.',

  peaAnalisisTemplateWithVariables: 'Del cuadro precedente, se aprecia que la PEA del distrito de {{distrito}} representa un {{porcentajePEA}} del total de la PET de la jurisdicción, mientras que la No PEA abarca el {{porcentajeNoPEA}} restante. Asimismo, se visualiza que los hombres se hallan predominantemente dentro de la PEA, pues el {{porcentajeHombresPEA}} se halla en esta categoría. Por otro lado, la mayor parte de las mujeres se hallan en el indicador de No PEA con un {{porcentajeMujeresNoPEA}}.',

  empleoSituacionDefault: 'La mayor parte de la población de la capital distrital de {{distrito}} se dedica a actividades agropecuarias, siendo la agricultura y la ganadería las principales fuentes de empleo independiente. En el sector agrícola, los cultivos predominantes son la papa, cebada, habas, trigo y oca, productos que abastecen tanto el consumo local como el comercio en menor medida. Asimismo, la ganadería juega un papel importante, con la crianza de vacunos y ovinos como las principales actividades ganaderas de la zona. Aunque en menor proporción, algunos pobladores también se dedican al comercio, complementando así su ingreso económico.',

  empleoDependienteDefault: 'En cuanto al empleo dependiente, este sector es reducido y está conformado principalmente por trabajadores de la municipalidad distrital, quienes cumplen funciones administrativas y operativas; el personal de las instituciones educativas que ofrecen servicios de enseñanza en la localidad; y los empleados del puesto de salud que brindan atención básica a los habitantes. Este tipo de empleo proporciona estabilidad a un pequeño grupo de la población, pero no es la fuente principal de ingresos entre los habitantes. En general, el empleo independiente predomina como el principal medio de subsistencia para la mayoría de los pobladores.',

  ingresosTemplateWithVariables: 'Los ingresos de la población en la capital distrital de {{distrito}} están estrechamente relacionados con las actividades agropecuarias, las cuales constituyen la base económica de la localidad. ... S/. {{ingresoPerCapita}} mensuales, ocupando el puesto N°{{rankingIngreso}} en el ranking de dicha variable.',

  indiceDesempleoTemplateWithVariables: 'El índice de desempleo es un indicador clave para evaluar la salud económica de una jurisdicción de cualquier nivel, ya que refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en busca de empleo, pero no logra obtenerlo. En este ítem, se caracteriza el índice de desempleo del distrito de {{distrito}}, el cual abarca al CP {{centroPoblado}} (capital distrital). Para ello se usa la tabla siguiente:',

  peaOcupadaDesocupadaTemplateWithVariables: 'Del cuadro precedente, se halla que en el distrito de {{distrito}} la PEA Desocupada representa un {{porcentajeDesempleo}} del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada, con porcentajes de {{porcentajeHombres}} y {{porcentajeMujeres}}, respectivamente.',

  // ===== TÍTULOS DE TABLA POR DEFECTO =====
  defaultPETTableTitle: 'PET según grupos de edad – CP {{centroPoblado}} (2017)',
  defaultPeaDistritoSexoTableTitle: 'Conformación de la PEA y No PEA, según sexo – Distrito {{distrito}} (2017)',
  defaultPeaOcupadaDesocupadaTableTitle: 'Conformación de la PEA Ocupada y Desocupada, según sexo – Distrito {{distrito}} (2017)',

  // ===== FUENTES POR DEFECTO =====
  defaultPETFuente: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.',
  defaultPeaDistritoSexoFuente: 'Resultados Definitivos de la Población Económicamente Activa 2017 – INEI 2018',
  defaultPeaOcupadaDesocupadaFuente: 'Resultados Definitivos de la PEA 2017 – INEI 2018',

  // ===== COLUMNAS DE TABLA (Labels para columnas) =====
  tableColumnCategoria: 'Categoría',
  tableColumnCategorias: 'Categorías',
  tableColumnCasos: 'Casos',
  tableColumnPorcentaje: 'Porcentaje',
  tableColumnHombres: 'Hombres',
  tableColumnMujeres: 'Mujeres',

  // ===== LABELS SECUNDARIOS (Para editores de párrafos) =====
  labelIndicadoresDistritalesAnalisisSecundario: 'Indicadores Distritales - Texto Completo',
  labelPeaTextCompletoSecundario: 'PEA - Texto Completo',
  labelAnalisisPEASecundario: 'Análisis PEA - Texto Completo',
  labelEmpleoSituacionCompletoSecundario: 'Situación del empleo - Texto Completo',
  labelEmpleoDependienteTextoSecundario: 'Empleo dependiente - Texto',
  labelIngresosCompletoSecundario: 'Ingresos de la población - Texto Completo',
  labelIndiceDesempleoCompletoSecundario: 'Índice de Desempleo - Texto Completo',
  labelPeaOcupadaDesocupadaAnalisisSecundario: 'Análisis PEA Ocupada y Desocupada - Texto Completo',

  // ===== PLACEHOLDERS PARA TABLA =====
  tableInputPlaceholderCategoria: 'Ej: 14 a 29 años',
  tableInputPlaceholderCasos: '0',
  tableInputPlaceholderPorcentaje: '0,00 %',
  tableInputPlaceholderPEA: 'Ej: PEA',
  tableInputPlaceholderPEAOcupada: 'Ej: PEA Ocupada',

  // ===== FOTOGRAFÍAS =====
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  defaultFotoTitulo: 'Sección 23',
  defaultFotoFuente: 'GEADES, 2024',

  // ===== FUENTE GENÉRICA =====
  labelFuente: 'FUENTE:',
};
