import { Injectable } from '@angular/core';
import { FormularioService } from './formulario.service';

export interface TableFieldMapping {
  baseField: string;
  fields: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TableAdapterService {

  constructor(private formularioService: FormularioService) {}

  convertirCamposIndividualesAArray(
    datos: any,
    mapping: TableFieldMapping,
    prefijo: string = '',
    maxFilas: number = 20,
    usarIndiceFila: boolean = true
  ): any[] {
    console.log('[TableAdapter] convertirCamposIndividualesAArray - INICIO', {
      baseField: mapping.baseField,
      prefijo,
      maxFilas,
      usarIndiceFila,
      fields: mapping.fields
    });
    
    const filas: any[] = [];
    
    for (let i = 1; i <= maxFilas; i++) {
      const fila: any = {};
      let tieneDatos = false;

      mapping.fields.forEach(field => {
        let campoCompleto: string;
        
        if (usarIndiceFila) {
          campoCompleto = prefijo 
            ? `${mapping.baseField}Fila${i}${field}${prefijo}` 
            : `${mapping.baseField}Fila${i}${field}`;
        } else {
          campoCompleto = prefijo 
            ? `${mapping.baseField}${field}${prefijo}` 
            : `${mapping.baseField}${field}`;
        }
        
        let valor = datos[campoCompleto];
        if (valor === undefined || valor === null || valor === '') {
          const campoSinPrefijo = usarIndiceFila 
            ? `${mapping.baseField}Fila${i}${field}`
            : `${mapping.baseField}${field}`;
          valor = datos[campoSinPrefijo];
        }
        valor = valor || '';
        
        if (i <= 3) {
          console.log(`[TableAdapter] Fila ${i}, Campo ${field}:`, {
            campoCompleto,
            campoSinPrefijo: usarIndiceFila 
              ? `${mapping.baseField}Fila${i}${field}`
              : `${mapping.baseField}${field}`,
            valor,
            tieneValor: !!(valor && valor !== '____' && valor.toString().trim() !== '')
          });
        }
        
        if (valor && valor !== '____' && valor.toString().trim() !== '') {
          tieneDatos = true;
        }
        
        const fieldKey = field.charAt(0).toLowerCase() + field.slice(1);
        fila[fieldKey] = valor || '';
      });

      if (tieneDatos || i === 1) {
        filas.push(fila);
      }
    }

    console.log('[TableAdapter] convertirCamposIndividualesAArray - RESULTADO', {
      totalFilas: filas.length,
      primeraFila: filas[0],
      segundaFila: filas[1]
    });

    return filas.length > 0 ? filas : [this.crearFilaVacia(mapping.fields.map(f => f.charAt(0).toLowerCase() + f.slice(1)))];
  }

  convertirArrayACamposIndividuales(
    datos: any,
    arrayData: any[],
    mapping: TableFieldMapping,
    prefijo: string = '',
    maxFilas: number = 20,
    usarIndiceFila: boolean = true,
    actualizarServicio: boolean = true
  ): void {
    const camposActualizados: any = {};
    
    for (let i = 1; i <= maxFilas; i++) {
      const filaIndex = i - 1;
      const fila = arrayData[filaIndex];

      if (fila) {
        mapping.fields.forEach(field => {
          const fieldKey = field.charAt(0).toLowerCase() + field.slice(1);
          const valor = fila[fieldKey] || fila[field] || '';
          
          let campoCompleto: string;
          if (usarIndiceFila) {
            campoCompleto = prefijo 
              ? `${mapping.baseField}Fila${i}${field}${prefijo}` 
              : `${mapping.baseField}Fila${i}${field}`;
          } else {
            campoCompleto = prefijo 
              ? `${mapping.baseField}${field}${prefijo}` 
              : `${mapping.baseField}${field}`;
          }
          
          datos[campoCompleto] = valor;
          if (actualizarServicio) {
            camposActualizados[campoCompleto] = valor;
          }
        });
      } else {
        mapping.fields.forEach(field => {
          let campoCompleto: string;
          if (usarIndiceFila) {
            campoCompleto = prefijo 
              ? `${mapping.baseField}Fila${i}${field}${prefijo}` 
              : `${mapping.baseField}Fila${i}${field}`;
          } else {
            campoCompleto = prefijo 
              ? `${mapping.baseField}${field}${prefijo}` 
              : `${mapping.baseField}${field}`;
          }
          
          datos[campoCompleto] = '';
          if (actualizarServicio) {
            camposActualizados[campoCompleto] = '';
          }
        });
      }
    }

    if (actualizarServicio && Object.keys(camposActualizados).length > 0) {
      this.formularioService.actualizarDatos(camposActualizados);
    }

    if (prefijo && mapping.baseField === 'tablaAISD2') {
      const codigosActivos = arrayData
        .map(fila => (fila.codigo || fila.Codigo)?.toString().trim())
        .filter(codigo => codigo && codigo !== '');
      
      this.formularioService.guardarFilasActivasTablaAISD2(codigosActivos, prefijo);
    }
  }

  sincronizarArrayDesdeCamposIndividuales(
    datos: any,
    arrayKey: string,
    mapping: TableFieldMapping,
    prefijo: string = '',
    maxFilas: number = 20,
    usarIndiceFila: boolean = true,
    actualizarServicio: boolean = true
  ): void {
    console.log('[TableAdapter] sincronizarArrayDesdeCamposIndividuales - INICIO', {
      arrayKey,
      baseField: mapping.baseField,
      prefijo,
      actualizarServicio
    });
    
    const arrayData = this.convertirCamposIndividualesAArray(datos, mapping, prefijo, maxFilas, usarIndiceFila);
    datos[arrayKey] = arrayData;
    
    console.log('[TableAdapter] sincronizarArrayDesdeCamposIndividuales - Array creado', {
      arrayKey,
      arrayLength: arrayData.length,
      actualizarServicio
    });
    
    if (actualizarServicio) {
      console.log('[TableAdapter] sincronizarArrayDesdeCamposIndividuales - Actualizando servicio');
      this.formularioService.actualizarDato(arrayKey, arrayData);
    }
  }

  sincronizarCamposIndividualesDesdeArray(
    datos: any,
    arrayKey: string,
    mapping: TableFieldMapping,
    prefijo: string = '',
    maxFilas: number = 20,
    usarIndiceFila: boolean = true,
    actualizarServicio: boolean = true
  ): void {
    const arrayData = datos[arrayKey] || [];
    this.convertirArrayACamposIndividuales(datos, arrayData, mapping, prefijo, maxFilas, usarIndiceFila, actualizarServicio);
  }

  private crearFilaVacia(fields: string[]): any {
    const fila: any = {};
    fields.forEach(field => {
      fila[field] = '';
    });
    return fila;
  }
}
