import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableQueryService {

  obtenerValorDeTabla(
    datos: any,
    tablaKey: string,
    campoBusqueda: string,
    valorBusqueda: string,
    campoRetorno: string
  ): string {
    const tabla = datos[tablaKey] || [];
    if (!Array.isArray(tabla)) return '';
    
    const item = tabla.find((item: any) => {
      const valor = item[campoBusqueda];
      return valor && valor.toString().toLowerCase().includes(valorBusqueda.toLowerCase());
    });
    
    return item?.[campoRetorno]?.toString() || '';
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
