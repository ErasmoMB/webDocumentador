import { Injectable } from '@angular/core';

/**
 * Servicio centralizado para resaltar datos según su origen/tipo
 * 
 * Colores:
 * - VERDE: Cálculos dinámicos (frontend)
 * - CELESTE: Datos heredados (json o de otras secciones)
 * - LILA: Datos de base de datos
 * - AMARILLO: Datos manuales ingresados
 */
@Injectable({
  providedIn: 'root'
})
export class DataHighlightService {

  /**
   * Retorna la clase CSS para resaltar datos calculados (verde)
   * Usado para: porcentajes, totales, promedios calculados en frontend
   */
  getCalculatedClass(): string {
    return 'data-calculated';
  }

  /**
   * Retorna la clase CSS para resaltar datos heredados (celeste)
   * Usado para: nombre de comunidad, provincia, distrito, departamento, totales de otras secciones
   */
  getInheritedClass(): string {
    return 'data-section';
  }

  /**
   * Retorna la clase CSS para resaltar datos de BD (lila)
   * Usado para: cualquier dato que viene directamente de /demograficos/datos, /vivienda/datos, etc
   */
  getDatabaseClass(): string {
    return 'data-backend';
  }

  /**
   * Retorna la clase CSS para resaltar datos manuales (amarillo)
   * Usado para: campos que el usuario completa en formularios
   */
  getManualClass(): string {
    return 'data-manual';
  }

  /**
   * Envuelve un valor con su clase CSS de resaltado
   * 
   * @param valor El valor a resaltar
   * @param tipo Tipo de dato: 'calculated' | 'inherited' | 'database' | 'manual'
   * @returns HTML string con resaltado
   * 
   * @example
   * // En tabla de población
   * <td [innerHTML]="highlightService.highlight(305, 'database')"></td>
   * 
   * // En cálculo de porcentaje
   * <td [innerHTML]="highlightService.highlight((305/610*100).toFixed(2), 'calculated')"></td>
   */
  highlight(valor: any, tipo: 'calculated' | 'inherited' | 'database' | 'manual'): string {
    let cssClass = '';
    
    switch(tipo) {
      case 'calculated':
        cssClass = this.getCalculatedClass();
        break;
      case 'inherited':
        cssClass = this.getInheritedClass();
        break;
      case 'database':
        cssClass = this.getDatabaseClass();
        break;
      case 'manual':
        cssClass = this.getManualClass();
        break;
      default:
        return String(valor);
    }

    return `<span class="${cssClass}">${valor}</span>`;
  }

  /**
   * Convierte un array de objetos a HTML con valores resaltados
   * 
   * @param datos Array de objetos con datos
   * @param columnasConTipo Mapa de {columnName: 'tipo'}
   * @returns Array de objetos con HTML resaltado
   * 
   * @example
   * const datos = [
   *   {sexo: 'Hombre', casos: 305},
   *   {sexo: 'Mujer', casos: 305}
   * ];
   * 
   * const columnasConTipo = {
   *   sexo: 'inherited',
   *   casos: 'database'
   * };
   * 
   * const resultado = this.highlightService.highlightTableData(datos, columnasConTipo);
   * // [{sexo: '<span class="data-section">Hombre</span>', casos: '<span class="data-backend">305</span>'}]
   */
  highlightTableData(datos: any[], columnasConTipo: {[key: string]: 'calculated' | 'inherited' | 'database' | 'manual'}): any[] {
    return datos.map(fila => {
      const filaResaltada: any = {};
      
      for (const col in fila) {
        if (columnasConTipo[col]) {
          filaResaltada[col] = this.highlight(fila[col], columnasConTipo[col]);
        } else {
          filaResaltada[col] = fila[col];
        }
      }
      
      return filaResaltada;
    });
  }

  /**
   * Resalta campos individuales en un objeto
   * 
   * @example
   * const datosConResaltado = this.highlightService.highlightObject({
   *   provincia: 'Chancay',
   *   poblacion: 610,
   *   porcentaje: 45.5
   * }, {
   *   provincia: 'inherited',
   *   poblacion: 'database',
   *   porcentaje: 'calculated'
   * });
   */
  highlightObject(obj: any, columnasConTipo: {[key: string]: 'calculated' | 'inherited' | 'database' | 'manual'}): any {
    const resultado: any = {};
    
    for (const key in obj) {
      if (columnasConTipo[key]) {
        resultado[key] = this.highlight(obj[key], columnasConTipo[key]);
      } else {
        resultado[key] = obj[key];
      }
    }
    
    return resultado;
  }
}
