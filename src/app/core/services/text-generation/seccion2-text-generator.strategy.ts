import { Injectable } from '@angular/core';
import { TextGeneratorStrategy, TextGenerationContext } from './text-generator-strategy.interface';
import { Seccion2TextGeneratorService } from '../seccion2-text-generator.service';
import { ComunidadCampesina, Distrito } from 'src/app/core/models/formulario.model';

/**
 * Estrategia de generación de texto para Sección 2
 * Implementa TextGeneratorStrategy usando Seccion2TextGeneratorService como adaptador
 */
@Injectable({
  providedIn: 'root'
})
export class Seccion2TextGeneratorStrategy implements TextGeneratorStrategy {
  readonly sectionId = 'seccion2';

  constructor(private textGenerator: Seccion2TextGeneratorService) {}

  puedeGenerar(contexto: TextGenerationContext): boolean {
    return contexto.sectionId === '3.1.2' || contexto.sectionId.startsWith('3.1.2');
  }

  generarTexto(datos: any, contexto: TextGenerationContext): string {
    const textType = contexto.textType;
    const params = contexto.params || {};

    switch (textType) {
      case 'aisd_completo':
        return this.textGenerator.generarTextoAISDCompleto(
          params['comunidades'] || [],
          datos.distritoSeleccionado || '',
          datos.aisdComponente1 || '',
          datos.aisdComponente2 || '',
          datos.departamentoSeleccionado || ''
        );

      case 'aisi_completo':
        return this.textGenerator.generarTextoAISICompleto(
          params['distritos'] || []
        );

      case 'comunidades':
        return this.textGenerator.obtenerTextoComunidades(
          params['comunidades'] || []
        );

      case 'comunidades_plural':
        return this.textGenerator.obtenerTextoComunidadesPlural(
          params['comunidades'] || []
        );

      case 'comunidades_singular':
        return this.textGenerator.obtenerTextoComunidadesSingular(
          params['comunidades'] || []
        );

      case 'comunidades_posesion':
        return this.textGenerator.obtenerTextoComunidadesPosesion(
          params['comunidades'] || []
        );

      case 'comunidades_impactos':
        return this.textGenerator.obtenerTextoComunidadesImpactos(
          params['comunidades'] || []
        );

      case 'comunidades_final':
        return this.textGenerator.obtenerTextoComunidadesFinal(
          params['comunidades'] || []
        );

      case 'prefijo_cc_impactos':
        return this.textGenerator.obtenerPrefijoCCImpactos(
          params['comunidades'] || []
        );

      case 'prefijo_cc_final':
        return this.textGenerator.obtenerPrefijoCCFinal(
          params['comunidades'] || []
        );

      case 'aisi':
        return this.textGenerator.obtenerTextoAISI(
          params['distritos'] || []
        );

      case 'aisi_plural':
        return this.textGenerator.obtenerTextoAISIPlural(
          params['distritos'] || []
        );

      case 'aisi_centros_poblados':
        return this.textGenerator.obtenerTextoAISICentrosPoblados(
          params['distritos'] || []
        );

      case 'tiene_una_comunidad':
        return this.textGenerator.tieneUnaComunidad(
          params['comunidades'] || []
        ) ? 'true' : 'false';

      case 'tiene_multiples_comunidades':
        return this.textGenerator.tieneMultiplesComunidades(
          params['comunidades'] || []
        ) ? 'true' : 'false';

      default:
        console.warn(`Tipo de texto desconocido para Sección 2: ${textType}`);
        return '';
    }
  }
}
