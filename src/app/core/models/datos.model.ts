import { Poblacion } from './poblacion.model';

export interface Datos {
  distritoSeleccionado: string;
  seleccionados: string[];
  grupoAISD?: string;
  consultora?: string;
  datosobtenidosAPI?: { poblacion: Poblacion };
  PoblacionSexo?: string;
  PoblacionEtarios?: string;
}
