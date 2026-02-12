/**
 * Constantes compartidas para Sección 10 - Servicios Básicos
 * Usadas en form y view para evitar duplicación
 */

export const SECCION10_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'provinciaSeleccionada',
  'parrafoSeccion10_servicios_basicos_intro',
  'textoServiciosAgua',
  'textoServiciosAguaDetalle',
  'textoServiciosDesague',
  'textoServiciosDesagueDetalle',
  'textoDesechosSolidos1',
  'textoDesechosSolidos2',
  'textoDesechosSolidos3',
  'textoElectricidad1',
  'textoElectricidad2',
  'textoEnergiaParaCocinar',
  'abastecimientoAguaTabla',
  'tiposSaneamientoTabla',
  'alumbradoElectricoTabla',
  'energiaCocinarTabla',
  'tecnologiaComunicacionesTabla'
];

export const SECCION10_PHOTO_PREFIX = 'fotografiaSeccion10';

export const SECCION10_SECTION_ID = '3.1.4.A.1.6';
export const SECCION10_DEFAULT_SUBSECTION = '3.1.4.A.1.6';

// Configuración de tablas
export const SECCION10_TABLE_CONFIGS = {
  ABASTECIMIENTO_AGUA: {
    tablaKeyBase: 'abastecimientoAguaTabla',
    campoTotal: 'categoria',
    campoCasos: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  TIPOS_SANEAMIENTO: {
    tablaKeyBase: 'tiposSaneamientoTabla',
    campoTotal: 'categoria',
    campoCasos: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  ALUMBRADO_ELECTRICO: {
    tablaKeyBase: 'alumbradoElectricoTabla',
    campoTotal: 'categoria',
    campoCasos: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  ENERGIA_COCINAR: {
    tablaKeyBase: 'energiaCocinarTabla',
    campoTotal: 'categoria',
    campoCasos: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  TELECOMUNICACIONES: {
    tablaKeyBase: 'tecnologiaComunicacionesTabla',
    campoTotal: 'medio',
    campoCasos: 'descripcion',
    campoPorcentaje: undefined
  }
};
