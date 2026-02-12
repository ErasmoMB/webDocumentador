/**
 * Constantes para Sección 22 - Características Demográficas (AISI)
 * 
 * CAMPOS OBSERVADOS (con aislamiento por prefijo):
 * - Párrafos: textoDemografiaAISI, textoGrupoEtarioAISI
 * - Tablas: poblacionSexoAISI, poblacionEtarioAISI
 * - Títulos/Fuentes: cuadroTituloPoblacionSexo, cuadroFuentePoblacionSexo, etc.
 * - Foto: fotografiaCahuacho
 */

export const SECCION22_WATCHED_FIELDS = [
  // Párrafos (pueden tener prefijo)
  'textoDemografiaAISI',
  'textoGrupoEtarioAISI',
  
  // Tablas (pueden tener prefijo)
  'poblacionSexoAISI',
  'poblacionEtarioAISI',
  
  // Títulos y fuentes (pueden tener prefijo)
  'cuadroTituloPoblacionSexo',
  'cuadroFuentePoblacionSexo',
  'cuadroTituloPoblacionEtario',
  'cuadroFuentePoblacionEtario',
  
  // Datos base (sin prefijo, compartidos)
  'centroPobladoAISI'
];

export const SECCION22_PHOTO_PREFIX = 'fotografiaCahuacho';
