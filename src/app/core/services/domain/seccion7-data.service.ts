import { Injectable } from '@angular/core';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Injectable({
  providedIn: 'root'
})
export class Seccion7DataService {

  /**
   * Obtiene el nombre de la comunidad actual según el seccionId
   */
  obtenerNombreComunidadActual(datos: any, seccionId: string): string {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(datos, 'grupoAISD', seccionId);
    return grupoAISD || datos.grupoAISD || '____';
  }

  /**
   * Obtiene tabla PET sin fila de Total
   */
  getPETTablaSinTotal(datos: any, seccionId: string): any[] {
    const petTabla = this.getTablaPET(datos, seccionId);
    if (!petTabla || !Array.isArray(petTabla)) {
      return [];
    }
    return petTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  /**
   * Obtiene tabla PET completa
   */
  getTablaPET(datos: any, seccionId: string): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(datos, 'petTabla', seccionId);
    const tablaActual = pref || datos.petTabla || [];
    
    if (tablaActual.length === 0) {
      return [
        { categoria: '15 a 29 años', casos: 0, porcentaje: '0,00 %' },
        { categoria: '30 a 44 años', casos: 0, porcentaje: '0,00 %' },
        { categoria: '45 a 64 años', casos: 0, porcentaje: '0,00 %' },
        { categoria: '65 años a más', casos: 0, porcentaje: '0,00 %' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00 %' }
      ];
    }
    
    return tablaActual;
  }

  /**
   * Calcula el total de PET
   */
  getTotalPET(datos: any, seccionId: string): string {
    const datosSinTotal = this.getPETTablaSinTotal(datos, seccionId);
    if (datosSinTotal.length === 0) {
      return '0';
    }
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  /**
   * Obtiene tabla PEA sin fila de Total
   */
  getPEATableSinTotal(datos: any, seccionId: string): any[] {
    const peaTabla = this.getTablaPEA(datos, seccionId);
    if (!peaTabla || !Array.isArray(peaTabla)) {
      return [];
    }
    return peaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  /**
   * Obtiene tabla PEA completa
   */
  getTablaPEA(datos: any, seccionId: string): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(datos, 'peaTabla', seccionId);
    const tablaActual = pref || datos.peaTabla || [];
    
    if (tablaActual.length === 0) {
      return [
        { categoria: 'PEA', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
        { categoria: 'No PEA', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
        { categoria: 'Total', hombres: 0, porcentajeHombres: '100,00 %', mujeres: 0, porcentajeMujeres: '100,00 %', casos: 0, porcentaje: '100,00 %' }
      ];
    }
    
    return tablaActual;
  }

  /**
   * Calcula total de hombres en PEA
   */
  getTotalHombres(datos: any, seccionId: string): string {
    const datosSinTotal = this.getPEATableSinTotal(datos, seccionId);
    if (datosSinTotal.length === 0) {
      return '0';
    }
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      return sum + hombres;
    }, 0);
    return total.toString();
  }

  /**
   * Calcula total de mujeres en PEA
   */
  getTotalMujeres(datos: any, seccionId: string): string {
    const datosSinTotal = this.getPEATableSinTotal(datos, seccionId);
    if (datosSinTotal.length === 0) {
      return '0';
    }
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      return sum + mujeres;
    }, 0);
    return total.toString();
  }

  /**
   * Calcula total general en PEA
   */
  getTotalPEA(datos: any, seccionId: string): string {
    const datosSinTotal = this.getPEATableSinTotal(datos, seccionId);
    if (datosSinTotal.length === 0) {
      return '0';
    }
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const totalItem = typeof item.total === 'number' ? item.total : parseInt(item.total) || 0;
      return sum + totalItem;
    }, 0);
    return total.toString();
  }

  /**
   * Obtiene tabla PEA Ocupada sin fila de Total
   */
  getPEAOcupadaTableSinTotal(datos: any, seccionId: string): any[] {
    const peaOcupadaTabla = this.getTablaPEAOcupada(datos, seccionId);
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla)) {
      return [];
    }
    return peaOcupadaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  /**
   * Obtiene tabla PEA Ocupada completa
   */
  getTablaPEAOcupada(datos: any, seccionId: string): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(datos, 'peaOcupadaTabla', seccionId);
    const tablaActual = pref || datos.peaOcupadaTabla || [];
    
    if (tablaActual.length === 0) {
      return [
        { categoria: 'PEA Ocupada', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
        { categoria: 'PEA Desocupada', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
        { categoria: 'Total', hombres: 0, porcentajeHombres: '100,00 %', mujeres: 0, porcentajeMujeres: '100,00 %', casos: 0, porcentaje: '100,00 %' }
      ];
    }
    
    return tablaActual;
  }

  /**
   * Calcula total de hombres en PEA Ocupada
   */
  getTotalHombresOcupada(datos: any, seccionId: string): string {
    const datosSinTotal = this.getPEAOcupadaTableSinTotal(datos, seccionId);
    if (datosSinTotal.length === 0) {
      return '0';
    }
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      return sum + hombres;
    }, 0);
    return total.toString();
  }

  /**
   * Calcula total de mujeres en PEA Ocupada
   */
  getTotalMujeresOcupada(datos: any, seccionId: string): string {
    const datosSinTotal = this.getPEAOcupadaTableSinTotal(datos, seccionId);
    if (datosSinTotal.length === 0) {
      return '0';
    }
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      return sum + mujeres;
    }, 0);
    return total.toString();
  }

  /**
   * Calcula total general en PEA Ocupada
   */
  getTotalPEAOcupada(datos: any, seccionId: string): string {
    const datosSinTotal = this.getPEAOcupadaTableSinTotal(datos, seccionId);
    if (datosSinTotal.length === 0) {
      return '0';
    }
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const totalItem = typeof item.total === 'number' ? item.total : parseInt(item.total) || 0;
      return sum + totalItem;
    }, 0);
    return total.toString();
  }

  /**
   * Calcula porcentajes para tabla PEA (múltiples columnas)
   */
  calcularPorcentajesPEA(datos: any, seccionId: string): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    const tablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const tabla = datos[tablaKey] || [];
    
    if (!Array.isArray(tabla) || tabla.length === 0) return;
    
    // Primero, calcular y actualizar casos para todas las filas (excepto Total)
    tabla.forEach((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return;
      
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      item.casos = hombres + mujeres;
    });
    
    // Calcular totales
    let totalHombres = 0;
    let totalMujeres = 0;
    let totalCasos = 0;
    
    tabla.forEach((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return;
      
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      
      totalHombres += hombres;
      totalMujeres += mujeres;
      totalCasos += casos;
    });
    
    // Actualizar o agregar fila de Total
    let totalRow = tabla.find((item: any) => 
      item.categoria?.toString().toLowerCase().includes('total')
    );
    
    if (totalRow) {
      totalRow.hombres = totalHombres;
      totalRow.mujeres = totalMujeres;
      totalRow.casos = totalCasos;
      totalRow.porcentajeHombres = '100,00 %';
      totalRow.porcentajeMujeres = '100,00 %';
      totalRow.porcentaje = '100,00 %';
    }
    
    // Recorrer filas y calcular porcentajes (excepto Total)
    tabla.forEach((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return;
      
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      
      // Calcular porcentaje de hombres
      if (totalHombres > 0) {
        const pctHombres = (hombres / totalHombres) * 100;
        item.porcentajeHombres = pctHombres.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %';
      } else {
        item.porcentajeHombres = '0,00 %';
      }
      
      // Calcular porcentaje de mujeres
      if (totalMujeres > 0) {
        const pctMujeres = (mujeres / totalMujeres) * 100;
        item.porcentajeMujeres = pctMujeres.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %';
      } else {
        item.porcentajeMujeres = '0,00 %';
      }
      
      // Calcular porcentaje total
      if (totalCasos > 0) {
        const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
        const pctTotal = (casos / totalCasos) * 100;
        item.porcentaje = pctTotal.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %';
      } else {
        item.porcentaje = '0,00 %';
      }
    });
  }

  /**
   * Calcula porcentajes para tabla PEA Ocupada (múltiples columnas)
   */
  calcularPorcentajesPEAOcupada(datos: any, seccionId: string): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    const tablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    const tabla = datos[tablaKey] || [];
    
    if (!Array.isArray(tabla) || tabla.length === 0) return;
    
    // Primero, calcular y actualizar casos para todas las filas (excepto Total)
    tabla.forEach((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return;
      
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      item.casos = hombres + mujeres;
    });
    
    // Calcular totales
    let totalHombres = 0;
    let totalMujeres = 0;
    let totalCasos = 0;
    
    tabla.forEach((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return;
      
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      
      totalHombres += hombres;
      totalMujeres += mujeres;
      totalCasos += casos;
    });
    
    // Actualizar o agregar fila de Total
    let totalRow = tabla.find((item: any) => 
      item.categoria?.toString().toLowerCase().includes('total')
    );
    
    if (totalRow) {
      totalRow.hombres = totalHombres;
      totalRow.mujeres = totalMujeres;
      totalRow.casos = totalCasos;
      totalRow.porcentajeHombres = '100,00 %';
      totalRow.porcentajeMujeres = '100,00 %';
      totalRow.porcentaje = '100,00 %';
    }
    
    // Recorrer filas y calcular porcentajes (excepto Total)
    tabla.forEach((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return;
      
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      
      // Calcular porcentaje de hombres
      if (totalHombres > 0) {
        const pctHombres = (hombres / totalHombres) * 100;
        item.porcentajeHombres = pctHombres.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %';
      } else {
        item.porcentajeHombres = '0,00 %';
      }
      
      // Calcular porcentaje de mujeres
      if (totalMujeres > 0) {
        const pctMujeres = (mujeres / totalMujeres) * 100;
        item.porcentajeMujeres = pctMujeres.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %';
      } else {
        item.porcentajeMujeres = '0,00 %';
      }
      
      // Calcular porcentaje total
      if (totalCasos > 0) {
        const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
        const pctTotal = (casos / totalCasos) * 100;
        item.porcentaje = pctTotal.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %';
      } else {
        item.porcentaje = '0,00 %';
      }
    });
  }
}
