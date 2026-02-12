/**
 * Constantes para Sección 23: Indicadores y distribución de la PEA
 * Reutilizables entre form y view components
 */

export const SECCION23_PHOTO_PREFIX = 'fotografiaPEA';

export const SECCION23_WATCHED_FIELDS = [
  'grupoAISD', 'distritoSeleccionado',
  'poblacionDistritalAISI', 'petDistritalAISI',
  'petGruposEdadAISI', 'petGruposEdadTitulo', 'petGruposEdadFuente',
  'peaDistritoSexoTabla', 'peaDistritoSexoTitulo', 'peaDistritoSexoFuente',
  'peaOcupadaDesocupadaTabla', 'peaOcupadaDesocupadaTitulo', 'peaOcupadaDesocupadaFuente',
  'textoPET_AISI', 'textoPETIntro_AISI', 'textoIndicadoresDistritalesAISI',
  'textoPEA_AISI', 'textoEmpleoAISI', 'textoEmpleoDependiente_AISI',
  'textoIndiceDesempleoAISI', 'textoPEAAISI'
];

export const SECCION23_TABLE_CONFIGS = {
  petGruposEdad: {
    tablaKey: 'petGruposEdadAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  peaDistritoSexo: {
    tablaKey: 'peaDistritoSexoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje'
  },
  peaOcupadaDesocupada: {
    tablaKey: 'peaOcupadaDesocupadaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje'
  }
};
