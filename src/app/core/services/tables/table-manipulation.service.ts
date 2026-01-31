import { Injectable } from '@angular/core';
import { TableConfig } from '../table-management.service';
import { TableInitializationService } from './table-initialization.service';
import { TableValidationService } from './table-validation.service';

@Injectable({
  providedIn: 'root'
})
export class TableManipulationService {

  constructor(
    private initialization: TableInitializationService,
    private validation: TableValidationService
  ) {}

  agregarFila(
    datos: any,
    config: TableConfig,
    nuevaFila?: any
  ): void {
    const { tablaKey, totalKey } = config;
    
    if (!datos[tablaKey]) {
      this.initialization.inicializarTabla(datos, config);
    }
    
    const tabla = datos[tablaKey] || [];
    const filaPorDefecto = this.initialization.crearFilaPorDefecto(config, nuevaFila);
    
    const totalIndex = tabla.findIndex((item: any) => {
      return this.validation.esFilaTotal(item, totalKey);
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
    
    if (this.validation.esFilaTotal(item, totalKey)) {
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
    value: any
  ): void {
    const { tablaKey } = config;
    
    if (!datos[tablaKey]) {
      this.initialization.inicializarTabla(datos, config);
    }
    
    const tabla = datos[tablaKey] || [];
    if (tabla[index]) {
      tabla[index][field] = value;
    }
  }
}
