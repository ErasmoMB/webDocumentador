/**
 * Constantes para Sección 21 - AISI (Área de Influencia Social Indirecta)
 * 
 * CAMPOS OBSERVADOS (con aislamiento por prefijo):
 * - Párrafos: parrafoSeccion21_aisi_intro_completo, parrafoSeccion21_centro_poblado_completo
 * - Históricos: leyCreacionDistrito, fechaCreacionDistrito, distritoAnterior, etc.
 * - Tabla: ubicacionCpTabla
 * - Foto: fotografia
 */

export const SECCION21_WATCHED_FIELDS = [
  // Párrafos (pueden tener prefijo)
  'parrafoSeccion21_aisi_intro_completo',
  'parrafoSeccion21_centro_poblado_completo',
  
  // Datos históricos del centro poblado (pueden tener prefijo)
  'leyCreacionDistrito',
  'fechaCreacionDistrito',
  'distritoAnterior',
  'origenPobladores1',
  'origenPobladores2',
  'departamentoOrigen',
  'anexosEjemplo',
  
  // Tabla de ubicación (puede tener prefijo)
  'ubicacionCpTabla',
  
  // Título y fuente de tabla (pueden tener prefijo)
  'cuadroTituloUbicacionCp',
  'cuadroFuenteUbicacionCp',
  
  // Datos base (sin prefijo, compartidos entre grupos)
  'centroPobladoAISI',
  'provinciaSeleccionada',
  'departamentoSeleccionado'
];

export const SECCION21_PHOTO_PREFIX = 'fotografia';
