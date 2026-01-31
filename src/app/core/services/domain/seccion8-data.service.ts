import { Injectable } from '@angular/core';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

/**
 * Servicio de Datos para Sección 8
 * Responsable de lógica específica de dominio para actividades económicas
 */
@Injectable({ providedIn: 'root' })
export class Seccion8DataService {

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
   * Obtiene la tabla PEA Ocupaciones según ocupaciones principales
   */
  getTablaPEAOcupaciones(datos: any, seccionId: string): any[] {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    const tablaKey = prefijo ? `peaOcupacionesTabla${prefijo}` : 'peaOcupacionesTabla';
    const tabla = datos[tablaKey] || datos['peaOcupacionesTabla'] || [];
    return Array.isArray(tabla) ? tabla : [];
  }

  /**
   * Obtiene PEA Ocupaciones sin la fila Total
   */
  getPEAOcupacionesSinTotal(datos: any, seccionId: string): any[] {
    const tabla = this.getTablaPEAOcupaciones(datos, seccionId);
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  /**
   * Calcula el total de casos de PEA Ocupaciones
   */
  getTotalPEAOcupaciones(datos: any, seccionId: string): number {
    const sinTotal = this.getPEAOcupacionesSinTotal(datos, seccionId);
    return sinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
  }

  /**
   * Obtiene las top N ocupaciones ordenadas por casos
   */
  getTopOcupaciones(datos: any, seccionId: string, limit: number = 3): Array<{categoria: string, porcentaje: string, casos: number}> {
    const sinTotal = this.getPEAOcupacionesSinTotal(datos, seccionId);
    
    return sinTotal
      .map((item: any) => ({
        categoria: item.categoria || '____',
        porcentaje: item.porcentaje || '____',
        casos: typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0
      }))
      .sort((a: any, b: any) => b.casos - a.casos)
      .slice(0, limit);
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
