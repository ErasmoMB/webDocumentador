import { Injectable } from '@angular/core';
import { TableConfig } from './table-management.service';

@Injectable({
  providedIn: 'root'
})
export class TableInitializationService {

  inicializarTabla(
    datos: any,
    config: TableConfig
  ): void {
    const { tablaKey, estructuraInicial, noInicializarDesdeEstructura } = config;
    
    // ✅ Si noInicializarDesdeEstructura es true, no inicializar nada
    if (noInicializarDesdeEstructura) {
      return;
    }
    
    const necesitaReinicializar = this.verificarSiNecesitaReinicializarConEstructura(
      datos[tablaKey], 
      estructuraInicial
    );
    
    if (!datos[tablaKey] || datos[tablaKey].length === 0 || necesitaReinicializar) {
      if (estructuraInicial && estructuraInicial.length > 0) {
        datos[tablaKey] = structuredClone(estructuraInicial);
      } else {
        const fila: any = { [config.totalKey]: '' };
        if (config.campoTotal) {
          fila[config.campoTotal] = 0;
        }
        datos[tablaKey] = [fila];
      }
    }
  }

  verificarSiNecesitaReinicializarConEstructura(
    tablaActual: any[] | undefined,
    estructuraInicial: any[] | undefined
  ): boolean {
    if (!estructuraInicial || estructuraInicial.length === 0) {
      return false;
    }
    
    if (!tablaActual || !Array.isArray(tablaActual)) {
      return true;
    }
    
    if (tablaActual.length < estructuraInicial.length) {
      return true;
    }
    
    if (tablaActual.length === 1) {
      const fila = tablaActual[0];
      const estaVacia = Object.values(fila).every(val => 
        val === '' || val === 0 || val === '0' || val === '0%' || 
        val === '0,00 %' || val === null || val === undefined
      );
      return estaVacia;
    }
    
    return false;
  }

  crearFilaPorDefecto(config: TableConfig, nuevaFila?: any): any {
    const { totalKey, campoTotal, campoPorcentaje } = config;
    
    // Si totalKey está vacío, devolver una fila con campos vacíos basados en columnas
    if (!totalKey || totalKey.trim() === '') {
      if (nuevaFila) return nuevaFila;
      // Crear fila vacía basada en estructuraInicial si existe
      if (config.estructuraInicial && config.estructuraInicial.length > 0) {
        return { ...config.estructuraInicial[0] };
      }
      // Si no hay estructuraInicial, crear objeto vacío pero el componente debe manejarlo
      return { };
    }
    
    return nuevaFila || { 
      [totalKey]: '',
      ...(campoTotal && { [campoTotal]: 0 })
      // ✅ FASE 1: NO crear porcentaje por defecto - se calculará dinámicamente
      // ...(campoPorcentaje && { [campoPorcentaje]: '0,00 %' })
    };
  }
}
