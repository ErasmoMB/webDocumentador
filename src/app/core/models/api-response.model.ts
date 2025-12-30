export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status_code: number;
}

export interface PoblacionData {
  poblacion: {
    total_varones: number;
    total_mujeres: number;
    total_poblacion: number;
    porcentaje_varones: string;
    porcentaje_mujeres: string;
    edad_0_14: number;
    edad_15_29: number;
    edad_30_44: number;
    edad_45_64: number;
    edad_65_mas: number;
  };
}

export interface CentroPoblado {
  cpp: string;
  centro_poblado: string;
  departamento: string;
  provincia: string;
  distrito: string;
  total: number;
  hombres: number;
  mujeres: number;
}

export interface PEAData {
  pea: number;
  no_pea: number;
  porcentaje_pea: string;
  porcentaje_no_pea: string;
  ocupada: number;
  desocupada: number;
  porcentaje_ocupada: string;
  porcentaje_desocupada: string;
}

