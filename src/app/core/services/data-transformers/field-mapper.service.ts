import { Injectable } from '@angular/core';
import { IFieldMapper } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class FieldMapper implements IFieldMapper {

  private readonly aliasPairs: Array<[string, string]> = [
    ['textoPoblacionSexo', 'textoPoblacionSexoAISD'],
    ['poblacionSexoTabla', 'poblacionSexoAISD'],
    ['textoPoblacionEtario', 'textoPoblacionEtarioAISD'],
    ['poblacionEtarioTabla', 'poblacionEtarioAISD']
  ];

  applyFieldAliases(data: any): any {
    const transformed = { ...data };

    this.aliasPairs.forEach(([dest, src]) => {
      if (transformed[dest] === undefined && transformed[src] !== undefined) {
        transformed[dest] = transformed[src];
      }
    });

    // Mapeos adicionales de textos
    this.applyTextMappings(transformed);

    return transformed;
  }

  private applyTextMappings(data: any): void {
    if (!data.parrafoSeccion13_natalidad_mortalidad_completo && data.textoNatalidadMortalidad) {
      data.parrafoSeccion13_natalidad_mortalidad_completo = data.textoNatalidadMortalidad;
    }

    if (!data.parrafoSeccion13_morbilidad_completo && data.textoMorbilidad) {
      data.parrafoSeccion13_morbilidad_completo = data.textoMorbilidad;
    }

    if (data.textoViviendas && !data.textoViviendaAISI) {
      data.textoViviendaAISI = data.textoViviendas;
    }

    if (data.textoEstructura && !data.textoEstructuraAISI) {
      data.textoEstructuraAISI = data.textoEstructura;
    }

    if (!data.centroPobladoAISI && data.distritoSeleccionado) {
      data.centroPobladoAISI = data.distritoSeleccionado;
    }
  }
}
