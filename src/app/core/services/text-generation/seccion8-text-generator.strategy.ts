import { Injectable } from '@angular/core';
import { TextGeneratorStrategy, TextGenerationContext } from './text-generator-strategy.interface';
import { Seccion8TextGeneratorService } from '../domain/seccion8-text-generator.service';

/**
 * Estrategia de generación de texto para Sección 8
 */
@Injectable({
  providedIn: 'root'
})
export class Seccion8TextGeneratorStrategy implements TextGeneratorStrategy {
  readonly sectionId = 'seccion8';

  constructor(private textGenerator: Seccion8TextGeneratorService) {}

  puedeGenerar(contexto: TextGenerationContext): boolean {
    return contexto.sectionId === '3.1.4.A.5' || contexto.sectionId.startsWith('3.1.4.A.5');
  }

  generarTexto(datos: any, contexto: TextGenerationContext): string {
    const textType = contexto.textType;
    const seccionId = contexto.sectionId;

    switch (textType) {
      case 'actividades_economicas':
        return this.textGenerator.generarTextoActividadesEconomicas(datos, seccionId);

      case 'actividades_economicas_con_resaltado':
        return this.textGenerator.generarTextoActividadesEconomicasConResaltado(datos, seccionId);

      case 'analisis_cuadro_310':
        return this.textGenerator.generarTextoAnalisisCuadro310(datos, seccionId);

      case 'analisis_cuadro_310_con_resaltado':
        return this.textGenerator.generarTextoAnalisisCuadro310ConResaltado(datos, seccionId);

      default:
        console.warn(`Tipo de texto desconocido para Sección 8: ${textType}`);
        return '';
    }
  }
}
