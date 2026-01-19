/**
 * Modelo para manejar provincias de forma dinámica
 */
export interface ProvinciaInfo {
  nombre: string;
  comunidades: string[];
  distritos: string[];
  departamentos: string[];
  distritosAdicionales: {
    adicional1: string;
    adicional2: string;
  };
}

export interface ProvinciasDinamicas {
  [provincia: string]: ProvinciaInfo;
}

export interface JSONComunidad {
  [key: string]: any[];
}
