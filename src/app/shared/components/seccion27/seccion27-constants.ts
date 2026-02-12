// ✅ SECCION 27 - Infraestructura para transportes y comunicaciones (B.1.6)
// Constantes y configuración centralizada

export const SECCION27_PHOTO_PREFIXES = {
  TRANSPORTE: 'fotografiaTransporteAISI',
  TELECOMUNICACIONES: 'fotografiaTelecomunicacionesAISI'
};

export const SECCION27_WATCHED_FIELDS = [
  // Párrafos de transporte
  'textoTransporteCP1',
  'textoTransporteCP2',
  
  // Costos de transporte
  'costoTransporteMinimo',
  'costoTransporteMaximo',
  
  // Párrafos de telecomunicaciones
  'textoTelecomunicacionesCP1',
  'textoTelecomunicacionesCP2',
  'textoTelecomunicacionesCP3',
  
  // Tabla y metadatos de telecomunicaciones
  'telecomunicacionesCpTabla',
  'cuadroTituloTelecomunicaciones',
  'cuadroFuenteTelecomunicaciones',
  
  // Centro poblado
  'centroPobladoAISI',
  'distritoSeleccionado',
  'ciudadOrigenComercio'
];

export const SECCION27_TEXT_FIELDS = [
  'textoTransporteCP1',
  'textoTransporteCP2',
  'textoTelecomunicacionesCP1',
  'textoTelecomunicacionesCP2',
  'textoTelecomunicacionesCP3'
];

export const SECCION27_METADATA = {
  SECTION_ID: '3.1.4.B.1.6',
  TITLE: 'B.1.6. Infraestructura para transportes y comunicaciones',
  SUBSECTION_A: 'a. Transporte',
  SUBSECTION_B: 'b. Telecomunicaciones'
};
