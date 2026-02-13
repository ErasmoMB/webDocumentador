/**
 * ✅ SECCION12_CONSTANTS
 * Constantes centralizadas para Sección 12 - Infraestructura en Salud, Educación, Recreativa y Deportiva
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados
 */

export const SECCION12_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'provinciaSeleccionada',
  'geoInfo',
  'parrafoSeccion12_salud_completo',
  'parrafoSeccion12_educacion_completo',
  'textoInfraestructuraEducacionPost',
  'parrafoSeccion12_recreacion_completo',
  'parrafoSeccion12_deporte_completo',
  'caracteristicasSaludTabla',
  'cantidadEstudiantesEducacionTabla',
  'ieAyrocaTabla',
  'ie40270Tabla',
  'alumnosIEAyrocaTabla',
  'alumnosIE40270Tabla',
  'caracteristicasSaludTitulo',
  'caracteristicasSaludFuente',
  'cantidadEstudiantesEducacionTitulo',
  'cantidadEstudiantesEducacionFuente',
  'ieAyrocaTitulo',
  'ieAyrocaFuente',
  'ie40270Titulo',
  'ie40270Fuente',
  'alumnosIEAyrocaTitulo',
  'alumnosIEAyrocaFuente',
  'alumnosIE40270Titulo',
  'alumnosIE40270Fuente'
];

// Photo prefixes
export const SECCION12_PHOTO_PREFIX_SALUD = 'fotografiaSalud';
export const SECCION12_PHOTO_PREFIX_IE_AYROCA = 'fotografiaIEAyroca';
export const SECCION12_PHOTO_PREFIX_IE_40270 = 'fotografiaIE40270';
export const SECCION12_PHOTO_PREFIX_RECREACION = 'fotografiaRecreacion';
export const SECCION12_PHOTO_PREFIX_DEPORTE = 'fotografiaDeporte';

// ✅ PATRÓN IDEAL - Prefijos de fotos específicos por tema
export const SECCION12_PHOTO_PREFIXES = {
  salud: 'fotografiaSalud',
  ieAyroca: 'fotografiaIEAyroca',
  ie40270: 'fotografiaIE40270',
  recreacion: 'fotografiaRecreacion',
  deporte: 'fotografiaDeporte'
};

export const SECCION12_SECTION_ID = '3.1.12';
export const SECCION12_DEFAULT_SUBSECTION = '3.1.12';

/**
 * ✅ TEMPLATES - Todos los textos centralizados
 * Categorías:
 * 1. Títulos y etiquetas
 * 2. Placeholders de entrada
 * 3. Textos por defecto (fallbacks)
 * 4. Fotos valores por defecto
 */
export const SECCION12_TEMPLATES = {
  // ===== TITULOS Y ETIQUETAS =====
  seccionTitulo: 'A.1.8. Infraestructura en salud, educación, recreativa y deportiva',
  
  // Salud
  subtituloSalud: 'a. Infraestructura en salud',
  labelParrafoSalud: 'Texto de infraestructura en salud',
  labelTituloCaracteristicasSalud: 'Título del cuadro',
  labelFuenteCaracteristicasSalud: 'Fuente',
  
  // Educación
  subtituloEducacion: 'b. infraestructura en educación',
  labelParrafoEducacion: 'Texto de infraestructura en educación',
  labelTituloEstudiantes: 'Título del cuadro',
  labelFuenteEstudiantes: 'Fuente',
  labelParrafoInfraestructuraPost: 'Texto de infraestructura post educación',
  labelTituloIEAyroca: 'Título del cuadro',
  labelFuenteIEAyroca: 'Fuente',
  labelTituloIE40270: 'Título del cuadro',
  labelFuenteIE40270: 'Fuente',
  labelTituloAlumnosAyroca: 'Título del cuadro',
  labelFuenteAlumnosAyroca: 'Fuente',
  labelTituloAlumnos40270: 'Título del cuadro',
  labelFuenteAlumnos40270: 'Fuente',
  
  // Recreación
  subtituloRecreacion: 'c. Infraestructura recreativa',
  labelParrafoRecreacion: 'Texto de infraestructura recreativa',
  
  // Deporte
  subtituloDeporte: 'd. Infraestructura deportiva',
  labelParrafoDeporte: 'Texto de infraestructura deportiva',
  
  // ===== PLACEHOLDERS =====
  placeholderParrafoSalud: 'Texto de infraestructura en salud',
  placeholderTituloCaracteristicasSalud: 'Ej: Principales características del Puesto de Salud',
  placeholderFuenteSalud: 'Ej: GEADES (2024)',
  
  placeholderParrafoEducacion: 'Texto de infraestructura en educación',
  placeholderTituloEstudiantes: 'Ej: infraestructura educativa – CC (2023)',
  placeholderFuenteEstudiantes: 'Ej: GEADES (2024)',
  placeholderParrafoInfraestructuraPost: 'Texto de infraestructura post educación',
  placeholderTituloIEAyroca: 'Ej: Características IE Ayroca',
  placeholderFuenteIEAyroca: 'Ej: GEADES (2024)',
  placeholderTituloIE40270: 'Ej: Características IE N°40270',
  placeholderFuenteIE40270: 'Ej: GEADES (2024)',
  placeholderTituloAlumnosAyroca: 'Ej: Alumnos IE Ayroca por sexo y grado',
  placeholderFuenteAlumnosAyroca: 'Ej: GEADES (2024)',
  placeholderTituloAlumnos40270: 'Ej: Alumnos IE N°40270 por sexo y grado',
  placeholderFuenteAlumnos40270: 'Ej: GEADES (2024)',
  
  placeholderParrafoRecreacion: 'Texto de infraestructura recreativa',
  placeholderParrafoDeporte: 'Texto de infraestructura deportiva',
  
  // ===== TEXTOS POR DEFECTO (FALLBACKS) =====
  // Salud - Fallback generado dinámicamente
  textosDefaultSalud: {
    titulo: (grupoAISD: string) => `Principales características del Puesto de Salud ${grupoAISD}`,
    fuente: 'GEADES (2024)',
    parrafo: (grupoAISD: string, provincia: string) => 
      `Dentro de la CC ${grupoAISD} se encuentra un puesto de salud, que está bajo la gestión directa del MINSA. Este establecimiento es de categoría I – 2 y brinda atención primaria a los habitantes de la comunidad. En la actualidad, se viene ofreciendo tres servicios con carácter permanente: medicina, obstetricia y enfermería; aunque también se coordina en conjunto con la MICRORED la realización de campañas de salud como psicología y salud bucal. No obstante, ante casos de mayor complejidad, la población es derivada a establecimientos de mayor categoría, principalmente ubicados en la ciudad de ${provincia}.`
  },
  
  // Educación - Fallback generado dinámicamente
  textosDefaultEducacion: {
    tituloEstudiantes: (grupoAISD: string) => `Infraestructura educativa – CC ${grupoAISD} (2023)`,
    fuenteEstudiantes: 'GEADES (2024)',
    parrafoEducacion: (grupoAISD: string) =>
      `Dentro de la CC ${grupoAISD} se hallan instituciones educativas de los dos primeros niveles de educación básica regular (inicial y primaria). Todas ellas se encuentran concentradas en el anexo ${grupoAISD}, el centro administrativo comunal. En base al Censo Educativo 2023, la institución con mayor cantidad de estudiantes dentro de la comunidad es la IE N°40270, la cual es de nivel primaria, con un total de 21 estudiantes. A continuación, se presenta el cuadro con la cantidad de estudiantes por institución educativa y nivel dentro de la localidad en cuestión.`,
    tituloIEAyroca: 'Características IE Ayroca',
    fuenteIEAyroca: 'GEADES (2024)',
    tituloIE40270: 'Características IE N°40270',
    fuenteIE40270: 'GEADES (2024)',
    parrafoInfraestructuraPost: (grupoAISD: string) =>
      `De las entrevistas aplicadas durante el trabajo de campo, se recopiló información de carácter cualitativo de las instituciones educativas de la CC ${grupoAISD}. En los cuadros que se presentan a continuación se detallan características de cada una de ellas para el año 2024.`
  },
  
  // Educación - Tabla de alumnos
  textosDefaultAlumnos: {
    tituloAlumnosAyroca: 'Alumnos IE Ayroca por sexo y grado',
    fuenteAlumnosAyroca: 'GEADES (2024)',
    tituloAlumnos40270: 'Alumnos IE N°40270 por sexo y grado',
    fuenteAlumnos40270: 'GEADES (2024)'
  },
  
  // Recreación - Fallback generado dinámicamente
  textosDefaultRecreacion: {
    parrafo: (grupoAISD: string) =>
      `Dentro de la CC ${grupoAISD} se cuenta con un espacio destinado a la recreación de la población. Este es el parque recreacional público, el cual se ubica entre el puesto de salud y el local comunal. Aquí la población puede reunirse y también cuenta con juegos recreativos destinados a los niños. La siguiente infraestructura es la plaza de toros, que se halla en la zona este del anexo, y es un punto de gran relevancia cultural; en especial, durante las festividades patronales.\n\nEn adición a ello, otro espacio de reunión es la plaza central del anexo ${grupoAISD}. Este lugar sirve ocasionalmente como punto de encuentro para los comuneros, quienes se reúnen allí de manera informal en momentos importantes o festivos.`
  },
  
  // Deporte - Fallback generado dinámicamente
  textosDefaultDeporte: {
    parrafo: (grupoAISD: string) =>
      `En la CC ${grupoAISD}, la infraestructura deportiva es limitada. Los únicos espacios dedicados al deporte son una losa deportiva y un "estadio". Estas infraestructuras son utilizadas principalmente para partidos de fútbol y otros encuentros deportivos informales que se organizan entre los comuneros, especialmente durante festividades locales.\n\nRespecto a la losa deportiva, esta se encuentra hecha a base de cemento. Por otra parte, el "estadio" es un campo de juego de pasto natural de un tamaño más extenso que la losa. No obstante, no cuenta con infraestructura adicional como gradas o servicios higiénicos.`
  },
  
  // ===== FOTOS VALORES POR DEFECTO =====
  fotoTituloDefault: (numero: number) => `Fotografía ${numero}`,
  fotoFuenteDefault: 'GEADES, 2024',
  
  // ===== ENCABEZADOS DE TABLAS (ALUMNNOS) =====
  tablaAlumnosAyrocaHeaders: {
    nombreIE: 'Nombre de IE',
    nivel: 'Nivel',
    total: 'Total',
    totalH: 'H',
    totalM: 'M',
    anos3: '3 años',
    anos4: '4 años',
    anos5: '5 años'
  },
  
  tablaAlumnos40270Headers: {
    nombreIE: 'Nombre de IE',
    nivel: 'Nivel',
    total: 'Total',
    totalH: 'H',
    totalM: 'M',
    grado1: '1º',
    grado2: '2º',
    grado3: '3º',
    grado4: '4º',
    grado5: '5º',
    grado6: '6º'
  }
};

// Configuración de tablas
export const SECCION12_TABLE_CONFIGS = {
  CARACTERISTICAS_SALUD: {
    tablaKeyBase: 'caracteristicasSaludTabla',
    campos: ['categoria', 'descripcion']
  },
  CANTIDAD_ESTUDIANTES: {
    tablaKeyBase: 'cantidadEstudiantesEducacionTabla',
    campoTotal: 'institucion',
    campoCasos: 'total',
    campoPorcentaje: 'porcentaje'
  },
  IE_AYROCA: {
    tablaKeyBase: 'ieAyrocaTabla',
    campos: ['categoria', 'descripcion']
  },
  IE_40270: {
    tablaKeyBase: 'ie40270Tabla',
    campos: ['categoria', 'descripcion']
  },
  ALUMNOS_IE_AYROCA: {
    tablaKeyBase: 'alumnosIEAyrocaTabla',
    campoTotal: 'nombre'
  },
  ALUMNOS_IE_40270: {
    tablaKeyBase: 'alumnosIE40270Tabla',
    campoTotal: 'nombre'
  }
};
