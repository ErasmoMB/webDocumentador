import { Injectable } from '@angular/core';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

/**
 * Servicio de Datos para Sección 6
 * Responsable de lógica específica de dominio para datos demográficos
 */
@Injectable({ providedIn: 'root' })
export class Seccion6DataService {

  /**
   * Obtiene el nombre de la comunidad actual con múltiples fallbacks
   */
  obtenerNombreComunidadActual(datos: any, seccionId: string): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(datos, 'grupoAISD', seccionId);
    
    if (grupoAISD && grupoAISD.trim() !== '') {
      return grupoAISD;
    }
    
    const grupoConSufijo = prefijo ? datos[`grupoAISD${prefijo}`] : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    if (datos.comunidadesCampesinas && Array.isArray(datos.comunidadesCampesinas) && datos.comunidadesCampesinas.length > 0) {
      const primerCC = datos.comunidadesCampesinas[0];
      if (primerCC && primerCC.nombre && primerCC.nombre.trim() !== '') {
        return primerCC.nombre;
      }
    }
    
    return '____';
  }

  /**
   * Obtiene la población por sexo sin el total
   */
  getPoblacionSexoSinTotal(datos: any): any[] {
    const poblacion = datos.poblacionSexoAISD || [];
    return Array.isArray(poblacion) 
      ? poblacion.filter((item: any) => item.sexo && item.sexo !== 'Total')
      : [];
  }

  /**
   * Obtiene la población por grupos etarios sin el total
   */
  getPoblacionEtarioSinTotal(datos: any): any[] {
    const poblacion = datos.poblacionEtarioAISD || [];
    return Array.isArray(poblacion)
      ? poblacion.filter((item: any) => item.categoria && item.categoria !== 'Total')
      : [];
  }

  /**
   * Calcula el total de población por sexo
   */
  getTotalPoblacionSexo(datos: any): number {
    const poblacion = this.getPoblacionSexoSinTotal(datos);
    return poblacion.reduce((sum: number, item: any) => {
      const casos = parseInt(item.casos, 10);
      return sum + (isNaN(casos) ? 0 : casos);
    }, 0);
  }

  /**
   * Calcula el total de población por grupo etario
   */
  getTotalPoblacionEtario(datos: any): number {
    const poblacion = this.getPoblacionEtarioSinTotal(datos);
    return poblacion.reduce((sum: number, item: any) => {
      const casos = parseInt(item.casos, 10);
      return sum + (isNaN(casos) ? 0 : casos);
    }, 0);
  }

  /**
   * Obtiene el valor con prefijo
   */
  obtenerValorConPrefijo(datos: any, campo: string, seccionId: string): any {
    return PrefijoHelper.obtenerValorConPrefijo(datos, campo, seccionId);
  }

  /**
   * Obtiene el prefijo del grupo
   */
  obtenerPrefijoGrupo(seccionId: string): string {
    return PrefijoHelper.obtenerPrefijoGrupo(seccionId);
  }
}
