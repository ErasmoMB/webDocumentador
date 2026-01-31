import { Injectable } from '@angular/core';
import { TextGeneratorStrategy, TextGenerationContext } from './text-generator-strategy.interface';
import { Seccion5TextGeneratorService } from '../domain/seccion5-text-generator.service';

/**
 * Estrategia de generación de texto para Sección 5
 */
@Injectable({
  providedIn: 'root'
})
export class Seccion5TextGeneratorStrategy implements TextGeneratorStrategy {
  readonly sectionId = 'seccion5';

  constructor(private textGenerator: Seccion5TextGeneratorService) {}

  puedeGenerar(contexto: TextGenerationContext): boolean {
    return contexto.sectionId === '3.1.4.A.2' || contexto.sectionId.startsWith('3.1.4.A.2');
  }

  generarTexto(datos: any, contexto: TextGenerationContext): string {
    const textType = contexto.textType;
    const params = contexto.params || {};
    const nombreComunidad = params['nombreComunidad'] || '____';

    switch (textType) {
      case 'institucionalidad':
        return this.textGenerator.obtenerTextoInstitucionalidad(datos, nombreComunidad);

      case 'formatear_parrafo':
        const texto = params['texto'] || '';
        return this.textGenerator.formatearParrafo(texto);

      case 'es_parrafo_valido':
        const parrafo = params['parrafo'] || '';
        return this.textGenerator.esParrafoValido(parrafo) ? 'true' : 'false';

      default:
        console.warn(`Tipo de texto desconocido para Sección 5: ${textType}`);
        return '';
    }
  }
}
