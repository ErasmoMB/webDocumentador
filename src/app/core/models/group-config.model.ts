export interface CCPP {
  item: number;
  ubigeo: number;
  codigo: string | number;
  nombre: string;
  categoria: string;
  poblacion: number;
  dpto: string;
  prov: string;
  dist: string;
  este: number;
  norte: number;
  altitud: number;
}

export interface Grupo {
  nombre: string;
  tipo: 'AISD' | 'AISI';
  ccppList: CCPP[];
  ccppActivos: string[];
}

export interface GroupConfig {
  aisd?: Grupo[];
  aisi?: Grupo[];
  lastUpdated?: number;
}

export interface GroupConfigState {
  config: GroupConfig;
  isValid: boolean;
  hasAISD: boolean;
  hasAISI: boolean;
}
