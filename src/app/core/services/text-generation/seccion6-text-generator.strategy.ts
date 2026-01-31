import { Injectable } from '@angular/core';
import { TextGeneratorStrategy, TextGenerationContext } from './text-generator-strategy.interface';
import { Seccion6TextGeneratorService } from '../domain/seccion6-text-generator.service';

/**
 * Estrategia de generación de texto para Sección 6
 */
@Injectable({
  providedIn: 'root'
})
export class Seccion6TextGeneratorStrategy implements TextGeneratorStrategy {
  readonly sectionId = 'seccion6';

  constructor(private textGenerator: Seccion6TextGeneratorService) {}

  puedeGenerar(contexto: TextGenerationContext): boolean {
    return contexto.sectionId === '3.1.4.A.3' || contexto.sectionId.startsWith('3.1.4.A.3');
  }

  generarTexto(datos: any, contexto: TextGenerationContext): string {
    const textType = contexto.textType;
    const params = contexto.params || {};
    const nombreComunidad = params['nombreComunidad'] || '____';

    switch (textType) {
      case 'poblacion_sexo':
        return this.textGenerator.obtenerTextoPoblacionSexo(datos, nombreComunidad);

      case 'poblacion_sexo_con_resaltado':
        return this.textGenerator.obtenerTextoPoblacionSexoConResaltado(datos, nombreComunidad).toString();

      case 'poblacion_etario':
        return this.textGenerator.obtenerTextoPoblacionEtario(datos, nombreComunidad);

      case 'poblacion_etario_con_resaltado':
        return this.textGenerator.obtenerTextoPoblacionEtarioConResaltado(datos, nombreComunidad).toString();

      default:
        console.warn(`Tipo de texto desconocido para Sección 6: ${textType}`);
        return '';
    }
  }
}
