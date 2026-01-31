import { Observable } from 'rxjs';

export interface ViviendaData {
  tipo_vivienda: string;
  casos: number;
}

export interface MaterialesData {
  categoria: string;
  tipo_material: string;
  casos: number;
}

export interface IViviendaDataProvider {
  obtenerTiposVivienda(codigos_ubigeo: string[]): Observable<{
    success: boolean;
    tipos_vivienda: ViviendaData[];
  }>;
}

export interface IMaterialesDataProvider {
  obtenerMateriales(codigos_ubigeo: string[]): Observable<{
    success: boolean;
    materiales_construccion: MaterialesData[];
  }>;
}
