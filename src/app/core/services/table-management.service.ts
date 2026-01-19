import { Injectable } from '@angular/core';

export interface TableColumn {
  field: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date';
  placeholder?: string;
}

export interface TableConfig {
  tablaKey: string;
  totalKey: string;
  campoTotal: string;
  campoPorcentaje?: string;
  estructuraInicial?: any[];
  calcularPorcentajes?: boolean;
  camposParaCalcular?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TableManagementService {

  inicializarTabla(
    datos: any,
    config: TableConfig
  ): void {
    const { tablaKey, estructuraInicial } = config;
    
    if (!datos[tablaKey] || datos[tablaKey].length === 0) {
      if (estructuraInicial && estructuraInicial.length > 0) {
        datos[tablaKey] = JSON.parse(JSON.stringify(estructuraInicial));
      } else {
        const fila: any = { [config.totalKey]: '', [config.campoTotal]: 0 };
        if (config.campoPorcentaje) {
          fila[config.campoPorcentaje] = '0,00 %';
        }
        datos[tablaKey] = [fila];
      }
    }
  }

  agregarFila(
    datos: any,
    config: TableConfig,
    nuevaFila?: any
  ): void {
    const { tablaKey, totalKey, campoTotal, campoPorcentaje } = config;
    
    if (!datos[tablaKey]) {
      this.inicializarTabla(datos, config);
    }
    
    const tabla = datos[tablaKey] || [];
    const filaPorDefecto = nuevaFila || { 
      [totalKey]: '', 
      [campoTotal]: 0, 
      ...(campoPorcentaje && { [campoPorcentaje]: '0,00 %' })
    };
    
    const totalIndex = tabla.findIndex((item: any) => {
      const valor = item[totalKey];
      return valor && valor.toString().toLowerCase().includes('total');
    });
    
    if (totalIndex >= 0) {
      tabla.splice(totalIndex, 0, filaPorDefecto);
    } else {
      tabla.push(filaPorDefecto);
    }
  }

  eliminarFila(
    datos: any,
    config: TableConfig,
    index: number
  ): boolean {
    const { tablaKey, totalKey } = config;
    const tabla = datos[tablaKey] || [];

    if (!tabla.length) return false;

    const item = tabla[index];
    const valor = item?.[totalKey];

    // No eliminar filas de totales si existen
    if (valor && valor.toString().toLowerCase().includes('total')) {
      return false;
    }

    tabla.splice(index, 1);
    return true;
  }

  actualizarFila(
    datos: any,
    config: TableConfig,
    index: number,
    field: string,
    value: any,
    autoCalcular: boolean = true
  ): void {
    const { tablaKey, calcularPorcentajes, camposParaCalcular } = config;
    
    if (!datos[tablaKey]) {
      this.inicializarTabla(datos, config);
    }
    
    const tabla = datos[tablaKey] || [];
    if (tabla[index]) {
      tabla[index][field] = value;
      
      if (autoCalcular && config.calcularPorcentajes && config.camposParaCalcular?.includes(field)) {
        this.calcularPorcentajes(datos, config);
      }
    }
  }

  calcularPorcentajes(
    datos: any,
    config: TableConfig
  ): void {
    const { tablaKey, totalKey, campoTotal, campoPorcentaje } = config;
    const tabla = datos[tablaKey] || [];
    
    if (tabla.length === 0) return;

    const totalItem = tabla.find((item: any) => {
      const valor = item[totalKey];
      return valor && valor.toString().toLowerCase().includes('total');
    });
    
    const total = totalItem ? parseFloat(totalItem[campoTotal]) || 0 : 0;

    if (total > 0 && campoPorcentaje) {
      tabla.forEach((item: any) => {
        const valor = item[totalKey];
        if (!valor || !valor.toString().toLowerCase().includes('total')) {
          const casos = parseFloat(item[campoTotal]) || 0;
          const porcentaje = ((casos / total) * 100)
            .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            .replace('.', ',') + ' %';
          item[campoPorcentaje] = porcentaje;
        }
      });
    } else if (campoPorcentaje) {
      tabla.forEach((item: any) => {
        const valor = item[totalKey];
        if (!valor || !valor.toString().toLowerCase().includes('total')) {
          item[campoPorcentaje] = '0,00 %';
        }
      });
    }
  }

  obtenerValorDeTabla(
    datos: any,
    tablaKey: string,
    campoBusqueda: string,
    valorBusqueda: string,
    campoRetorno: string
  ): string {
    const tabla = datos[tablaKey] || [];
    if (!Array.isArray(tabla)) return '____';
    
    const item = tabla.find((item: any) => {
      const valor = item[campoBusqueda];
      return valor && valor.toString().toLowerCase().includes(valorBusqueda.toLowerCase());
    });
    
    return item?.[campoRetorno]?.toString() || '____';
  }

  obtenerValorDeTablaPorIndicador(
    datos: any,
    tablaKey: string,
    indicador: string,
    campoRetorno: string
  ): string {
    return this.obtenerValorDeTabla(datos, tablaKey, 'indicador', indicador, campoRetorno);
  }

  obtenerValorDeTablaPorCategoria(
    datos: any,
    tablaKey: string,
    categoria: string,
    campoRetorno: string
  ): string {
    return this.obtenerValorDeTabla(datos, tablaKey, 'categoria', categoria, campoRetorno);
  }
}
