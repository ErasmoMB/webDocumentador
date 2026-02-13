export interface Entrevistado {
  nombre: string;
  cargo: string;
  organizacion: string;
}

export interface Fotografia {
  numero: number | string;
  titulo: string;
  fuente: string;
  imagen: string | null;
  preview: string | null;
  id?: string;
}

export interface CentroPobladoData {
  ITEM?: number;
  UBIGEO?: number;
  CODIGO?: number;
  CCPP?: string;
  CATEGORIA?: string;
  POBLACION?: number;
  VIVIENDAS_EMPADRONADAS?: number;
  VIVIENDAS_OCUPADAS?: number;
  DPTO?: string;
  PROV?: string;
  DIST?: string;
  ESTE?: number;
  NORTE?: number;
  ALTITUD?: number;
}

export interface TablaItem {
  categoria?: string;
  casos?: number | string;
  porcentaje?: string;
  sexo?: string;
  edad?: string;
  [key: string]: any;
}

export interface ComunidadCampesina {
  id: string;
  nombre: string;
  centrosPobladosSeleccionados: string[];
  esNueva?: boolean;
}

export interface Distrito {
  id: string;
  nombre: string;
  nombreOriginal?: string;
  centrosPobladosSeleccionados: string[];
  esNuevo?: boolean;
}

export interface FormularioDatosIdentidad {
  projectName: string;
  grupoAISD: string;
  grupoAISI: string;
  consultora: string;
  detalleProyecto: string;
}

export interface FormularioDatosUbicacion {
  departamentoSeleccionado: string;
  provinciaSeleccionada: string;
  distritoSeleccionado: string;
  centroPobladoAISI: string;
  coordenadasAISD: string;
  altitudAISD: string;
  centroPobladoSeleccionadoData: CentroPobladoData | null;
}

export interface FormularioDatosComponentes {
  aisdComponente1: string;
  aisdComponente2: string;
  aisiComponente1: string;
  aisiComponente2: string;
  componenteFuentesPrimarias1: string;
  componenteFuentesPrimarias2: string;
  justificacionAISI: string;
  pagina4DistDpto: string;
}

export interface FormularioDatosEncuestas {
  cantidadEntrevistas: string;
  cantidadEncuestas: string;
  fechaTrabajoCampo: string;
  entrevistados: Entrevistado[];
  muestra: string;
  universo: string;
  margen: string;
  nameuniverso: string;
  variable: string;
  fuente: string;
  nivel: string;
  detalleEncuesta: string;
  precisionEncuesta: string;
  encuestadoPorcentaje: string;
  noEncuestados: string;
  noResultadoPorcentaje: string;
  influenciaSocialDirecta: string;
}

export interface FormularioDatosComunidad {
  comunidadesCampesinas?: ComunidadCampesina[];
  distritosAISI?: Distrito[];
  seleccionados: string[];
  seleccionadosAISI: string[];
  codigos: string[];
}

export interface FormularioDatosPoblacion {
  poblacionSexo: string;
  poblacionEtarios: string;
  puntosPoblacion?: any[];
  lenguasMaternasTabla?: TablaItem[];
}

export interface FormularioDatosPEA {
  detallePET: string;
  detallePetDistrital: string;
  detallePeaDistrital: string;
  detallePeaEmpleo1: string;
  encuestasIndependiente: string;
  encuestasDependientePublica: string;
  encuestasDependientePrivada: string;
  encuestasNoAplica: string;
  detallePeaSituacionEmpleo: string;
  detalleIngresos: string;
  ingresosMensualesPromedio: string;
  ingresosMaximo: string;
  detalleIndiceDesempleo: string;
}

export interface FormularioDatosEconomia {
  component1Data: string;
  myComponent: string;
  myComponent2: string;
  myComponent3: string;
  myComponent4: string;
  detalleCaracteristicasEconomicas: string;
  detalleCaracteristicasEconomicas2: string;
  encuestasNoAplicaPagina9: string;
  datosobtenidosAPI: any[];
  datosobtenidosAPI2: any[];
  datosobtenidosAPI3: any[];
  datosobtenidosAPI4: any;
}

export interface FormularioDatosVivienda {
  viviendasComponent1: string;
  viviendasComponent2: string;
  totalViviendas: string;
  totalViviendasOcupadas: string;
  porcentajeViviendasOcupadas: string;
}

export interface FormularioDatosTablas {
  tablepagina6: any[];
  tablepagina9: any[];
  componente1Pagina5: string;
  descripcionTabla: string;
  componente2Pagina5: string;
  cantidadEstudiantesEducacionTabla: any[];
  ieAyrocaTabla: any[];
  ie40270Tabla: any[];
  alumnosIEAyrocaTabla: any[];
  alumnosIE40270Tabla: any[];
  natalidadMortalidadTabla: any[];
  morbiliadTabla: any[];
  morbilidadTabla: any[];
  afiliacionSaludTabla: any[];
  indiceDesarrolloHumanoTabla?: any[];
  nbiCCAyrocaTabla?: TablaItem[];
  nbiDistritoCahuachoTabla?: TablaItem[];
}

export interface FormularioDatosFotos {
  imagenes: any[];
  imagenes2: any[];
  fotografias: Fotografia[];
}

export interface FormularioDatosTextos {
  textoInstitucionalidad: string;
  textoDemografiaAISD: string;
  textoPEA_AISD: string;
  textoActividadesEconomicasAISD: string;
  textoUsoSuelos: string;
  textoRecursosNaturales: string;
  textoIDH: string;
  textoNBI: string;
  textoOrganizacionSocial: string;
  textoFestividades: string;
  textoCostumbres: string;
  textoTurismo: string;
  textoDemografiaAISI: string;
  textoPEA_AISI: string;
  textoActividadesEconomicasAISI: string;
  textoViviendaAISI: string;
  textoServiciosBasicosAISI: string;
  textoTransporteAISI: string;
  textoTelecomunicacionesAISI: string;
  textoInfraestructuraAISI: string;
  textoSaludAISI: string;
  textoEducacionAISI: string;
  textoInfraestructuraEducacionPost: string;
  textoAlumnosPorSexoGrado: string;
  textoNatalidadMortalidad: string;
  textoMorbilidad: string;
  textoAfiliacionSalud: string;
  totalH: string;
  totalM: string;
}

export interface FormularioDatosParrafos {
  parrafoSeccion1_principal?: string;
  parrafoSeccion1_4?: string;
  objetivoSeccion1_1?: string;
  objetivoSeccion1_2?: string;
  parrafoSeccion2_introduccion?: string;
  parrafoSeccion2_aisd_completo?: string;
  parrafoSeccion2_aisi_completo?: string;
  parrafoSeccion3_metodologia?: string;
  parrafoSeccion3_fuentes_primarias?: string;
  parrafoSeccion3_fuentes_primarias_cuadro?: string;
  parrafoSeccion3_fuentes_secundarias?: string;
  fuentesSecundariasLista?: string[];
  parrafoSeccion5_institucionalidad?: string;
  parrafoSeccion5_institucionalidad_A1?: string;
  parrafoSeccion5_institucionalidad_A2?: string;
  parrafoSeccion4_introduccion_aisd?: string;
  parrafoSeccion4_comunidad_completo?: string;
  parrafoSeccion4_caracterizacion_indicadores?: string;
  parrafoSeccion7_situacion_empleo_completo?: string;
  parrafoSeccion7_ingresos_completo?: string;
  parrafoSeccion8_ganaderia_completo?: string;
  parrafoSeccion8_agricultura_completo?: string;
  parrafoSeccion10_servicios_basicos_intro?: string;
  parrafoSeccion11_transporte_completo?: string;
  parrafoSeccion11_telecomunicaciones_completo?: string;
  parrafoSeccion12_salud_completo?: string;
  parrafoSeccion12_educacion_completo?: string;
  parrafoSeccion13_natalidad_mortalidad_completo?: string;
  parrafoSeccion13_morbilidad_completo?: string;
  parrafoSeccion14_indicadores_educacion_intro?: string;
  parrafoSeccion21_aisi_intro_completo?: string;
  parrafoSeccion21_centro_poblado_completo?: string;
  parrafoSeccion15_religion_completo?: string;
  parrafoSeccion16_agua_completo?: string;
  parrafoSeccion16_recursos_naturales_completo?: string;
  parrafoSeccion30_indicadores_educacion_intro?: string;
}

export interface FormularioDatosAdicionales {
  mapaActores?: any[];
  autoridades?: any[];
}

export interface FormularioDatos extends
  FormularioDatosIdentidad,
  FormularioDatosUbicacion,
  FormularioDatosComponentes,
  FormularioDatosEncuestas,
  FormularioDatosComunidad,
  FormularioDatosPoblacion,
  FormularioDatosPEA,
  FormularioDatosEconomia,
  FormularioDatosVivienda,
  FormularioDatosTablas,
  FormularioDatosFotos,
  FormularioDatosTextos,
  FormularioDatosParrafos,
  FormularioDatosAdicionales {
  [key: string]: any;
}


