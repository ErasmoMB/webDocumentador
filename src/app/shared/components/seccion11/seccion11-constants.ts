/**
 * Constantes compartidas para Sección 11 - Transporte y Telecomunicaciones
 * Usadas en form y view para evitar duplicación
 */

export const SECCION11_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'provinciaSeleccionada',
  'distritoSeleccionado',
  'parrafoSeccion11_transporte_completo',
  'parrafoSeccion11_telecomunicaciones_completo',
  'costoTransporteMinimo',
  'costoTransporteMaximo',
  'telecomunicacionesTabla',
  'tituloTelecomunicaciones',
  'fuenteTelecomunicaciones'
];

export const SECCION11_PHOTO_PREFIX_TRANSPORTE = 'fotografiaTransporte';
export const SECCION11_PHOTO_PREFIX_TELECOMUNICACIONES = 'fotografiaTelecomunicaciones';

export const SECCION11_SECTION_ID = '3.1.4.A.1.7';
export const SECCION11_DEFAULT_SUBSECTION = '3.1.4.A.1.7';

// Configuración de tablas
export const SECCION11_TABLE_CONFIGS = {
  TELECOMUNICACIONES: {
    tablaKeyBase: 'telecomunicacionesTabla',
    campoTotal: 'medio',
    campoCasos: 'descripcion',
    campoPorcentaje: undefined
  }
};

// Campos de costo de transporte
export const SECCION11_COSTO_TRANSPORTE = {
  MINIMO_KEY_BASE: 'costoTransporteMinimo',
  MAXIMO_KEY_BASE: 'costoTransporteMaximo'
};
