import { CentroPoblado } from '../models/api-response.model';

export class DataTransformerUtil {
  static mapToCentroPoblado(item: any): CentroPoblado {
    return {
      cpp: item.id_ubigeo || item.codigo || '',
      centro_poblado: item.centro_poblado || item.nombre || '',
      departamento: item.departamento || '',
      provincia: item.provincia || item.nombre_provincia || '',
      distrito: item.distrito || item.nombre_distrito || '',
      total: item.poblacion_total || 0,
      hombres: item.hombres || 0,
      mujeres: item.mujeres || 0
    };
  }

  static filterByDistrito(items: any[], distrito: string): any[] {
    return items.filter((item: any) => {
      const distritoItem = item.distrito || item.nombre_distrito || '';
      return distritoItem.toUpperCase().includes(distrito.toUpperCase());
    });
  }

  static filterByProvincia(items: any[], provincia: string): any[] {
    return items.filter((item: any) => {
      const provinciaItem = item.provincia || item.nombre_provincia || '';
      return provinciaItem.toUpperCase().includes(provincia.toUpperCase());
    });
  }

  static transformDatosDemograficos(datos: any): any {
    return {
      total_poblacion: datos.poblacion_total || 0,
      edad_0_14: (datos.menores_1 || 0) + (datos.de_1_a_14 || 0),
      edad_15_29: datos.de_15_a_29 || 0,
      edad_30_44: datos.de_30_a_44 || 0,
      edad_45_64: datos.de_45_a_64 || 0,
      edad_65_mas: datos.mayores_65 || 0
    };
  }
}

