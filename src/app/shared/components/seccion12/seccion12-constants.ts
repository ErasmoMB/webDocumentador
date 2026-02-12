/**
 * Constantes compartidas para Sección 12 - Salud, Educación y Recreación
 * Usadas en form y view para evitar duplicación
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
  'alumnosIE40270Tabla'
];

export const SECCION12_PHOTO_PREFIX_SALUD = 'fotografiaSalud';
export const SECCION12_PHOTO_PREFIX_IE_AYROCA = 'fotografiaIEAyroca';
export const SECCION12_PHOTO_PREFIX_IE_40270 = 'fotografiaIE40270';
export const SECCION12_PHOTO_PREFIX_RECREACION = 'fotografiaRecreacion';
export const SECCION12_PHOTO_PREFIX_DEPORTE = 'fotografiaDeporte';

export const SECCION12_SECTION_ID = '3.1.12';
export const SECCION12_DEFAULT_SUBSECTION = '3.1.12';

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
