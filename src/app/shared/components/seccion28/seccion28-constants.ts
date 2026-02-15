/**
 * ✅ SECCION_28_CONSTANTS
 * Constantes centralizadas para Sección 28 - Infraestructura en salud, educación, recreativa y deportiva
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados (100% constantes)
 */

export const SECCION28_SECTION_ID = '3.1.4.B.1.7';

export const SECCION28_WATCHED_FIELDS = [
  // Párrafos de texto
  'textoSaludCP',
  'textoEducacionCP',
  'textoRecreacionCP1',
  'textoRecreacionCP2',
  'textoRecreacionCP3',
  'textoDeporteCP1',
  'textoDeporteCP2',
  
  // Títulos y fuentes
  'puestoSaludTitulo',
  'puestoSaludFuente',
  'educacionTitulo',
  'educacionFuente',
  
  // Tablas
  'puestoSaludCpTabla',
  'educacionCpTabla',
  
  // Centro poblado
  'centroPobladoAISI',
  
  // Educación
  'nombreIEMayorEstudiantes',
  'cantidadEstudiantesIEMayor',
  
  // Fotografías
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSaludAISI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSaludAISI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSaludAISI${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaEducacionAISI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaEducacionAISI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaEducacionAISI${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaRecreacionAISI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaRecreacionAISI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaRecreacionAISI${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaDeporteAISI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaDeporteAISI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaDeporteAISI${i + 1}Imagen`)
];

export const SECCION28_PHOTO_PREFIXES = [
  'fotografiaSaludAISI',
  'fotografiaEducacionAISI',
  'fotografiaRecreacionAISI',
  'fotografiaDeporteAISI'
];

// ✅ TEMPLATES - Todos los textos centralizados
export const SECCION28_TEMPLATES = {
  // Títulos principales
  tituloSeccion: 'B.1.7. Infraestructura en salud, educación, recreativa y deportiva',
  tituloSalud: 'a. Infraestructura en salud',
  tituloEducacion: 'b. Infraestructura en educación',
  tituloRecreacion: 'c. Infraestructura en recreación',
  tituloDeporte: 'd. Infraestructura en deporte',
  editarParrafos: 'Editar Párrafos',

  // Labels - Infraestructura en Salud
  labelTextoSaludCP: 'Infraestructura en Salud - Texto Completo',
  labelTituloPuestoSalud: 'Título — Principales características del Puesto de Salud',
  labelTablaPuestoSalud: 'Tabla Principales características del Puesto de Salud',
  labelFuentePuestoSalud: 'Fuente — Principales características del Puesto de Salud',
  labelFotografiasSalud: 'Fotografías de Infraestructura en salud',

  // Labels - Infraestructura en Educación
  labelTextoEducacionCP: 'Infraestructura en Educación - Texto Completo',
  labelNombreIEMayor: 'Nombre de la IE con mayor cantidad de estudiantes',
  labelCantidadEstudiantesIEMayor: 'Cantidad de estudiantes de la IE con mayor cantidad',
  labelTituloEducacion: 'Título — Infraestructura educativa',
  labelTablaEducacion: 'Tabla Infraestructura educativa',
  labelFuenteEducacion: 'Fuente — Infraestructura educativa',
  labelFotografiasEducacion: 'Fotografías de Infraestructura en educación',

  // Labels - Infraestructura en Recreación
  labelTextoRecreacionCP1: 'Infraestructura en Recreación - Párrafo 1',
  labelTextoRecreacionCP2: 'Infraestructura en Recreación - Párrafo 2',
  labelTextoRecreacionCP3: 'Infraestructura en Recreación - Párrafo 3',
  labelFotografiasRecreacion: 'Fotografías de Infraestructura en recreación',

  // Labels - Infraestructura en Deporte
  labelTextoDeporteCP1: 'Infraestructura en Deporte - Párrafo 1',
  labelTextoDeporteCP2: 'Infraestructura en Deporte - Párrafo 2',
  labelFotografiasDeporte: 'Fotografías de Infraestructura en deporte',

  // Hints
  hintParrafos: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // Placeholders
  placeholderTituloPuestoSalud: 'Ej: Principales características del Puesto de Salud',
  placeholderFuentePuestoSalud: 'Ej: Ministerio de Salud (MINSA)',
  placeholderNombreIE: 'Ej: IE Virgen de Copacabana',
  placeholderCantidadEstudiantes: 'Ej: 28',
  placeholderTituloEducacion: 'Ej: Infraestructura educativa – CP ____ (2023)',
  placeholderFuenteEducacion: 'Ej: Censo Educativo 2023 – ESCALE (MINEDU)',

  // Fotografías - Labels genéricos
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',
  placeholderFotoTitulo: 'Ej: Infraestructura',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  tituloFotoDefault: 'Infraestructura',
  fuenteFotoDefault: 'GEADES, 2024',

  // Fotografías - Salud
  tituloFotoSaludDefault: 'Puesto de Salud',
  placeholderFotoSalud: 'Ej: Puesto de Salud',

  // Fotografías - Educación
  tituloFotoEducacionDefault: 'Infraestructura educativa',
  placeholderFotoEducacion: 'Ej: Infraestructura educativa',

  // Fotografías - Recreación
  placeholderFotoRecreacion: 'Ej: Plaza de toros',

  // Textos por defecto (fallback)
  textoSaludDefault: `Dentro de la capital distrital de ____ se encuentra un único establecimiento de salud de categoría I-2, que brinda atención primaria a la población local. Este puesto de salud es el principal punto de referencia para los habitantes de ____, ofreciendo servicios esenciales como consultas médicas, controles de salud y atención básica de emergencias. Aunque cuenta con limitaciones en cuanto a especialidades médicas y equipamiento, su presencia es fundamental para atender las necesidades de salud de la población, especialmente considerando la ausencia de otros centros de mayor capacidad en la zona.`,

  textoEducacionDefault: `Dentro del CP ____ se hallan instituciones educativas que cubren todos los niveles de educación básica regular. La institución con mayor cantidad de estudiantes es ____ con ____ estudiantes.`,

  textoRecreacionCP1Default: `Dentro del CP ____ se cuenta con espacios destinados a la recreación de la población. Entre ellos destacan las plazas, las cuales funcionan como principales áreas de encuentro para la interacción y socialización, especialmente durante festividades y eventos culturales.`,

  textoRecreacionCP2Default: `Otra infraestructura recreativa relevante es la plaza de toros, que se halla en la zona este del centro poblado, y es un punto de gran relevancia cultural; en especial, durante las festividades patronales y celebraciones taurinas. Este espacio funciona como un centro de actividad importante para las festividades taurinas y celebraciones especiales, atrayendo tanto a residentes como a visitantes y promoviendo las tradiciones locales.`,

  textoRecreacionCP3Default: `Adicionalmente, cabe mencionar el mirador ubicado en el cerro Pilluni, el cual ofrece vistas panorámicas de la capital distrital y los paisajes circundantes. Este lugar es un punto de interés tanto para los residentes como para los visitantes, permitiendo disfrutar de la belleza natural y de actividades recreativas al aire libre, fortaleciendo la identidad comunitaria.`,

  textoDeporteCP1Default: `En el CP ____, la infraestructura deportiva consiste en instalaciones básicas para la práctica de actividades físicas y recreativas. Se destaca la losa deportiva ubicada detrás de la municipalidad, la cual es utilizada para diversos deportes colectivos como fútbol y vóley, y sirve como un espacio frecuente para eventos locales y recreación de niños y jóvenes.`,

  textoDeporteCP2Default: `Asimismo, cabe mencionar que en ____ se cuenta con un "estadio", caracterizado por un campo extenso con pasto y tierra, utilizado principalmente para fútbol y otros deportes al aire libre. Este campo no cuenta con infraestructura adicional como cerco perimetral o gradas, lo que limita su capacidad para eventos formales de gran envergadura. A pesar de ello, el campo es utilizado para actividades recreativas y eventos locales, funcionando como un punto de encuentro comunitario en fechas especiales.`,

  // Tablas
  columnaPuestoSaludCategoria: 'Categoría',
  columnaPuestoSaludDescripcion: 'Descripción',

  columnasEducacion: [
    { field: 'nombreIE', label: 'Nombre de IE', align: 'left' },
    { field: 'nivel', label: 'Nivel', align: 'left' },
    { field: 'tipoGestion', label: 'Tipo de Gestión', align: 'left' },
    { field: 'cantidadEstudiantes', label: 'Cantidad de estudiantes', align: 'right' },
    { field: 'porcentaje', label: 'Porcentaje', align: 'right' }
  ],

  // Valores por defecto
  tituloEducacionDefault: '',
  fuenteEducacionDefault: '',
  tituloEducacionViewDefault: 'Infraestructura educativa',
  fuenteEducacionViewDefault: 'Censo Educativo 2023 – ESCALE (MINEDU)',
  tituloViewDefault: 'Principales características del Puesto de Salud',
  fuenteViewDefault: 'GEADES (2024)'
};
