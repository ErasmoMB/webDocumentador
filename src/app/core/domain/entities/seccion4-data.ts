export interface ComunidadCampesina {
  nombre: string;
  centrosPobladosSeleccionados: CentroPoblado[];
  capital?: string;
}

export interface CentroPoblado {
  CCPP?: string;
  ccpp?: string;
  CODIGO?: string | number;
  codigo?: string | number;
  POBLACION?: string | number;
  poblacion?: string | number;
  [key: string]: any;
}

export interface TablaAISD1Row {
  localidad: string;
  coordenadas: string;
  altitud: string;
  distrito: string;
  provincia: string;
  departamento: string;
}

export interface TablaAISD2Row {
  punto: string;
  nombre: string;
  codigo: string;
  poblacion: string;
  viviendasEmpadronadas: string;
  viviendasOcupadas: string;
}

export interface Seccion4Data {
  // Párrafos
  parrafoSeccion4_introduccion_aisd?: string;
  parrafoSeccion4_comunidad_completo?: string;
  parrafoSeccion4_caracterizacion_indicadores?: string;

  // Comunidad y ubicación
  grupoAISD?: string;
  distritoSeleccionado?: string;
  provinciaSeleccionada?: string;
  departamentoSeleccionado?: string;

  // Componentes AISD
  aisdComponente1?: string;
  aisdComponente2?: string;

  // Coordenadas y altitud
  coordenadasAISD?: string;
  altitudAISD?: string;

  // Tablas AISD
  tablaAISD1Datos?: TablaAISD1Row[];
  tablaAISD2Datos?: TablaAISD2Row[];

  // Tablas con prefijos (para múltiples comunidades)
  tablaAISD1Datos_A1?: TablaAISD1Row[];
  tablaAISD2Datos_A1?: TablaAISD2Row[];
  tablaAISD1Datos_A2?: TablaAISD1Row[];
  tablaAISD2Datos_A2?: TablaAISD2Row[];

  // Fuentes y títulos
  cuadroFuenteAISD1?: string;
  cuadroTituloAISD1?: string;

  // Datos JSON completos
  jsonCompleto?: any;

  // Comunidades campesinas
  comunidadesCampesinas?: ComunidadCampesina[];

  // Flags de procesamiento
  tablaAISD2DatosLlena?: boolean;
  tablaAISD2DatosLlena_A1?: boolean;
  tablaAISD2DatosLlena_A2?: boolean;

  // Campos adicionales dinámicos
  [key: string]: any;
}
