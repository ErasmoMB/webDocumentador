export interface PETData {
  categoria: string;
  casos: number;
  porcentaje?: string;
}

export interface PEAData {
  categoria: string;
  hombres: number;
  mujeres: number;
  casos: number;
  porcentajeHombres?: string;
  porcentajeMujeres?: string;
  porcentaje?: string;
}

export interface PEAOcupadaData {
  categoria: string;
  hombres: number;
  mujeres: number;
  casos: number;
  porcentajeHombres?: string;
  porcentajeMujeres?: string;
  porcentaje?: string;
}

export interface ComunidadCampesina {
  id: string;
  nombre: string;
  centrosPobladosSeleccionados: string[];
  esNueva?: boolean;
  distrito?: string;
  provincia?: string;
  departamento?: string;
}

export interface DistritoAISI {
  id: string;
  nombre: string;
  nombreOriginal?: string;
  centrosPobladosSeleccionados: string[];
  esNuevo?: boolean;
  provincia?: string;
  departamento?: string;
}

export interface GrupoConfig {
  aisd?: any;
  aisi?: any;
  selectedComunidades?: ComunidadCampesina[];
  selectedDistritos?: DistritoAISI[];
  groupName?: string;
  description?: string;
  [key: string]: any;
}

export interface Seccion2Data {
  comunidadesCampesinas: ComunidadCampesina[];
  distritosAISI: DistritoAISI[];
  grupoAISD?: string;
  grupoAISI?: string;
  distritoSeleccionado?: string;
  provinciaSeleccionada?: string;
  departamentoSeleccionada?: string;
  parrafoSeccion2_introduccion?: string;
  parrafoSeccion2_aisd_completo?: string;
  parrafoSeccion2_aisi_completo?: string;
  groupConfiguration?: GrupoConfig;
  [key: string]: any;
}

export interface SectionData {
  petTabla: PETData[];
  peaTabla: PEAData[];
  peaOcupadaTabla: PEAOcupadaData[];
  grupoAISD?: string;
  distritoSeleccionado?: string;
  poblacionDistritalCahuacho?: string;
  petDistritalCahuacho?: string;
  ingresoFamiliarPerCapita?: string;
  rankingIngresoPerCapita?: string;
  [key: string]: any;
}

export interface CalculatedSectionData {
  petTablaConPorcentajes: PETData[];
  peaTablaConPorcentajes: PEAData[];
  peaOcupadaTablaConPorcentajes: PEAOcupadaData[];
  totalPET: string;
  totalPEA: string;
  totalPEAHombres: string;
  totalPEAMujeres: string;
  totalPEAOcupada: string;
  totalPEAOcupadaHombres: string;
  totalPEAOcupadaMujeres: string;
}

export interface Seccion23Data {
  petGruposEdadAISI: PETGrupoEdad[];
  peaDistritoSexoTabla: PEADistritoSexo[];
  peaOcupadaDesocupadaTabla: PEAOcupadaDesocupada[];
  poblacionDistritalAISI: number;
  petDistritalAISI: number;
  ingresoPerCapitaAISI: number;
  rankingIngresoAISI: number;
  textoPEAAISI: string;
  textoPET_AISI: string;
  textoIndicadoresDistritalesAISI: string;
  textoPEA_AISI: string;
  textoAnalisisPEA_AISI: string;
  textoEmpleoAISI: string;
  textoIngresosAISI: string;
  textoIndiceDesempleoAISI: string;
  [key: string]: any;
}

export interface PETGrupoEdad {
  categoria: string;
  orden: number;
  casos: number;
  porcentaje: string;
}

export interface PEADistritoSexo {
  categoria: string;
  hombres: number;
  mujeres: number;
  casos: number;
  porcentajeHombres: string;
  porcentajeMujeres: string;
  porcentaje: string;
}

export interface PEAOcupadaDesocupada {
  categoria: string;
  hombres: number;
  mujeres: number;
  casos: number;
  porcentajeHombres: string;
  porcentajeMujeres: string;
  porcentaje: string;
}

export interface Seccion3Data {
  parrafoSeccion3_metodologia: string;
  parrafoSeccion3_fuentes_primarias: string;
  parrafoSeccion3_fuentes_primarias_cuadro: string;
  parrafoSeccion3_fuentes_secundarias: string;
  cantidadEntrevistas: number;
  fechaTrabajoCampo: string;
  consultora: string;
  entrevistados: Entrevistado[];
  fuentesSecundariasLista: string[];
  [key: string]: any;
}

export interface Entrevistado {
  nombre: string;
  cargo: string;
  organizacion: string;
}

export interface Seccion10Data {
  grupoAISD?: string;
  distritoSeleccionado?: string;
  parrafoSeccion10_servicios_basicos_intro: string;
  abastecimientoAguaTabla: any[];
  cuotaMensualAgua: string;
  tiposSaneamientoTabla: any[];
  saneamientoTabla: any[];
  alumbradoElectricoTabla: any[];
  empresaElectrica: string;
  costoElectricidadMinimo: string;
  costoElectricidadMaximo: string;
  textoServiciosAgua: string;
  textoServiciosAguaDetalle: string;
  textoServiciosDesague: string;
  textoServiciosDesagueDetalle: string;
  textoDesechosSolidos1: string;
  textoDesechosSolidos2: string;
  textoDesechosSolidos3: string;
  textoElectricidad1: string;
  textoElectricidad2: string;
  textoEnergiaParaCocinar: string;
  [key: string]: any;
}

export interface Seccion6Data {
  grupoAISD: string;
  distritoSeleccionado: string;
  poblacionSexoAISD: any[];
  poblacionEtarioAISD: any[];
  textoPoblacionSexoAISD: string;
  textoPoblacionEtarioAISD: string;
  [key: string]: any;
}

export interface Seccion8Data {
  grupoAISD: string;
  provinciaSeleccionada: string;
  parrafoSeccion8_ganaderia_completo: string;
  parrafoSeccion8_agricultura_completo: string;
  peaOcupacionesTabla: any[];
  poblacionPecuariaTabla: any[];
  caracteristicasAgriculturaTabla: any[];
  textoActividadesEconomicas: string;
  textoFuentesActividadesEconomicas: string;
  textoAnalisisCuadro310: string;
  textoMercadoComercializacion1: string;
  textoMercadoComercializacion2: string;
  textoHabitosConsumo1: string;
  textoHabitosConsumo2: string;
  [key: string]: any;
}

export interface Seccion9Data {
  grupoAISD: string;
  condicionOcupacionTabla: any[];
  tiposMaterialesTabla: any[];
  textoViviendas: string;
  textoEstructura: string;
  [key: string]: any;
}

export interface Seccion26Data {
  centroPobladoAISI: string;
  abastecimientoAguaCpTabla: any[];
  saneamientoCpTabla: any[];
  coberturaElectricaCpTabla: any[];
  combustiblesCocinarCpTabla: any[];
  textoIntroServiciosBasicosAISI: string;
  textoServiciosAguaAISI: string;
  textoDesagueCP: string;
  textoDesechosSolidosCP: string;
  textoElectricidadCP: string;
  textoEnergiaCocinarCP: string;
  [key: string]: any;
}

export interface Seccion12Data {
  grupoAISD: string;
  provinciaSeleccionada: string;
  caracteristicasSaludTabla: any[];
  cantidadEstudiantesEducacionTabla: any[];
  ieAyrocaTabla: any[];
  ie40270Tabla: any[];
  alumnosIEAyrocaTabla: any[];
  alumnosIE40270Tabla: any[];
  parrafoSeccion12_salud_completo: string;
  parrafoSeccion12_educacion_completo: string;
  textoInfraestructuraEducacionPost: string;
  textoAlumnosPorSexoGrado: string;
  textoInfraestructuraRecreacion: string;
  textoInfraestructuraRecreacionDetalle: string;
  textoInfraestructuraDeporte: string;
  textoInfraestructuraDeportDetalle: string;
  [key: string]: any;
}

export interface Seccion25Data {
  centroPobladoAISI: string;
  tiposViviendaAISI: any[];
  condicionOcupacionAISI: any[];
  materialesViviendaAISI: any[];
  textoViviendaAISI: string;
  textoOcupacionViviendaAISI: string;
  textoEstructuraAISI: string;
  [key: string]: any;
}

export interface Seccion28Data {
  centroPobladoAISI: string;
  puestoSaludCpTabla: any[];
  educacionCpTabla: any[];
  nombreIEMayorEstudiantes: string;
  cantidadEstudiantesIEMayor: number;
  textoSaludCP: string;
  textoEducacionCP: string;
  textoRecreacionCP1: string;
  textoRecreacionCP2: string;
  textoRecreacionCP3: string;
  textoDeporteCP1: string;
  textoDeporteCP2: string;
  [key: string]: any;
}

export interface Seccion29Data {
  centroPobladoAISI: string;
  natalidadMortalidadCpTabla: any[];
  morbilidadCpTabla: any[];
  afiliacionSaludTabla: any[];
  textoNatalidadCP1: string;
  textoNatalidadCP2: string;
  textoMorbilidadCP: string;
  textoAfiliacionSalud: string;
  [key: string]: any;
}

export interface Seccion24Data {
  centroPobladoAISI: string;
  actividadesEconomicasAISI: any[];
  ciudadOrigenComercio: string;
  textoIntroActividadesEconomicasAISI: string;
  textoActividadesEconomicasAISI: string;
  textoMercadoProductos: string;
  textoHabitosConsumo: string;
  [key: string]: any;
}

// Seccion22: Demografía
export interface PoblacionSexoData {
  sexo: string;
  casos: number;
  porcentaje: string;
}

export interface PoblacionEtarioData {
  categoria: string;
  casos: number;
  porcentaje: string;
}

export interface Seccion22Data {
  centroPobladoAISI: string;
  poblacionSexoAISI: PoblacionSexoData[];
  poblacionEtarioAISI: PoblacionEtarioData[];
  textoDemografiaAISI: string;
  textoGrupoEtarioAISI: string;
  fotografiasCahuachoB11?: any[];
}

// Seccion30: Educación
export interface NivelEducativoData {
  nivel: string;
  hombres: number;
  mujeres: number;
  total: number;
  porcentajeHombres?: string;
  porcentajeMujeres?: string;
  porcentajeTotal?: string;
}

export interface TasaAnalfabetismoData {
  grupo: string;
  total: number;
  alfabetos: number;
  analfabetos: number;
  tasaAnalfabetismo?: string;
}

export interface Seccion30Data {
  centroPobladoAISI: string;
  parrafoSeccion30_indicadores_educacion_intro: string;
  nivelEducativoTabla: NivelEducativoData[];
  tasaAnalfabetismoTabla: TasaAnalfabetismoData[];
  textoNivelEducativo: string;
  textoTasaAnalfabetismo: string;
  fotografiasCahuachoB19?: any[];
  [key: string]: any;
}

export interface Seccion7Data {
  grupoAISD?: string;
  distritoSeleccionado?: string;
  poblacionDistritalCahuacho?: string;
  petDistritalCahuacho?: string;
  ingresoFamiliarPerCapita?: string;
  rankingIngresoPerCapita?: string;
  petTabla: PETData[];
  peaTabla: PEAData[];
  peaOcupadaTabla: PEAOcupadaData[];
  cuadroTituloPET?: string;
  cuadroFuentePET?: string;
  cuadroTituloPEA?: string;
  cuadroFuentePEA?: string;
  cuadroTituloPEAOcupada?: string;
  cuadroFuentePEAOcupada?: string;
  parrafoSeccion7_situacion_empleo_completo?: string;
  parrafoSeccion7_ingresos_completo?: string;
  textoPET?: string;
  textoDetalePEA?: string;
  textoDefinicionPEA?: string;
  textoAnalisisPEA?: string;
  textoIndiceDesempleo?: string;
  textoPEAOcupada?: string;
  textoAnalisisPEAOcupada?: string;
  fotografiasPEA?: any[];
  [key: string]: any;
}

// Export Seccion4Data from separate file
export { Seccion4Data, CentroPoblado, TablaAISD1Row, TablaAISD2Row } from './entities/seccion4-data';

// Export Seccion5Data from separate file
export { Seccion5Data, Institucion } from './entities/seccion5-data';
