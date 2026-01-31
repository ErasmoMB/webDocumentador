import { Injectable } from '@angular/core';
import { TextGeneratorStrategy, TextGenerationContext } from './text-generator-strategy.interface';
import { Seccion3TextGeneratorService } from '../seccion3-text-generator.service';

/**
 * Estrategia de generación de texto para Sección 3
 * Implementa TextGeneratorStrategy usando Seccion3TextGeneratorService como adaptador
 */
@Injectable({
  providedIn: 'root'
})
export class Seccion3TextGeneratorStrategy implements TextGeneratorStrategy {
  readonly sectionId = 'seccion3';

  constructor(private textGenerator: Seccion3TextGeneratorService) {}

  puedeGenerar(contexto: TextGenerationContext): boolean {
    return contexto.sectionId === '3.1.3' || contexto.sectionId.startsWith('3.1.3');
  }

  generarTexto(datos: any, contexto: TextGenerationContext): string {
    const textType = contexto.textType;

    switch (textType) {
      case 'metodologia':
        return this.textGenerator.obtenerTextoMetodologia(datos);

      case 'fuentes_primarias':
        return this.textGenerator.obtenerTextoFuentesPrimarias(datos);

      case 'fuentes_secundarias':
        return this.textGenerator.obtenerTextoFuentesSecundarias(datos);

      case 'formatear_parrafo':
        const texto = contexto.params?.['texto'] || '';
        return this.textGenerator.formatearParrafo(texto);

      default:
        console.warn(`Tipo de texto desconocido para Sección 3: ${textType}`);
        return '';
    }
  }
}
