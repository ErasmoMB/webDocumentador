import { Injectable } from '@angular/core';
import { TextGeneratorStrategy, TextGenerationContext } from './text-generator-strategy.interface';
import { Seccion4TextGeneratorService } from '../domain/seccion4-text-generator.service';

/**
 * Estrategia de generación de texto para Sección 4
 */
@Injectable({
  providedIn: 'root'
})
export class Seccion4TextGeneratorStrategy implements TextGeneratorStrategy {
  readonly sectionId = 'seccion4';

  constructor(private textGenerator: Seccion4TextGeneratorService) {}

  puedeGenerar(contexto: TextGenerationContext): boolean {
    return contexto.sectionId === '3.1.4.A.1' || contexto.sectionId.startsWith('3.1.4.A.1');
  }

  generarTexto(datos: any, contexto: TextGenerationContext): string {
    const textType = contexto.textType;
    const params = contexto.params || {};
    const nombreComunidad = params['nombreComunidad'] || '____';

    switch (textType) {
      case 'introduccion_aisd':
        return this.textGenerator.obtenerTextoIntroduccionAISD(datos, nombreComunidad);

      case 'comunidad_completo':
        return this.textGenerator.obtenerTextoComunidadCompleto(datos, nombreComunidad);

      case 'caracterizacion_indicadores':
        return this.textGenerator.obtenerTextoCaracterizacionIndicadores(datos, nombreComunidad);

      case 'formatear_parrafo':
        const texto = params['texto'] || '';
        return this.textGenerator.formatearParrafo(texto);

      case 'formatear_con_resaltado':
        const textoResaltar = params['texto'] || '';
        const valoresResaltar = params['valoresAResaltar'] || [];
        return this.textGenerator.formatearConResaltado(textoResaltar, valoresResaltar).toString();

      default:
        console.warn(`Tipo de texto desconocido para Sección 4: ${textType}`);
        return '';
    }
  }
}
