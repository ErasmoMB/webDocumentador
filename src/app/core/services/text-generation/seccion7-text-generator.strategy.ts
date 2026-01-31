import { Injectable } from '@angular/core';
import { TextGeneratorStrategy, TextGenerationContext } from './text-generator-strategy.interface';
import { Seccion7TextGeneratorService } from '../domain/seccion7-text-generator.service';

/**
 * Estrategia de generación de texto para Sección 7
 * Nota: Algunos métodos requieren funciones callback que se pasan como params
 */
@Injectable({
  providedIn: 'root'
})
export class Seccion7TextGeneratorStrategy implements TextGeneratorStrategy {
  readonly sectionId = 'seccion7';

  constructor(private textGenerator: Seccion7TextGeneratorService) {}

  puedeGenerar(contexto: TextGenerationContext): boolean {
    return contexto.sectionId === '3.1.4.A.4' || contexto.sectionId.startsWith('3.1.4.A.4');
  }

  generarTexto(datos: any, contexto: TextGenerationContext): string {
    const textType = contexto.textType;
    const params = contexto.params || {};
    const seccionId = contexto.sectionId;

    switch (textType) {
      case 'pet_completo':
        const getPorcentajePET = params['getPorcentajePET'] || (() => '____');
        const getPorcentajePETGrupo = params['getPorcentajePETGrupo'] || (() => '____');
        const obtenerNombreComunidad = params['obtenerNombreComunidad'] || (() => '____');
        return this.textGenerator.obtenerTextoSeccion7PETCompleto(
          datos,
          seccionId,
          getPorcentajePET,
          getPorcentajePETGrupo,
          obtenerNombreComunidad
        );

      case 'pet_completo_con_resaltado':
        const getPorcentajePET2 = params['getPorcentajePET'] || (() => '____');
        const getPorcentajePETGrupo2 = params['getPorcentajePETGrupo'] || (() => '____');
        const obtenerNombreComunidad2 = params['obtenerNombreComunidad'] || (() => '____');
        return this.textGenerator.obtenerTextoSeccion7PETCompletoConResaltado(
          datos,
          seccionId,
          getPorcentajePET2,
          getPorcentajePETGrupo2,
          obtenerNombreComunidad2
        ).toString();

      case 'situacion_empleo_completo':
        const obtenerNombreComunidad3 = params['obtenerNombreComunidad'] || (() => '____');
        return this.textGenerator.obtenerTextoSeccion7SituacionEmpleoCompleto(
          datos,
          seccionId,
          obtenerNombreComunidad3
        );

      case 'situacion_empleo_completo_con_resaltado':
        const obtenerNombreComunidad4 = params['obtenerNombreComunidad'] || (() => '____');
        return this.textGenerator.obtenerTextoSeccion7SituacionEmpleoCompletoConResaltado(
          datos,
          seccionId,
          obtenerNombreComunidad4
        ).toString();

      default:
        console.warn(`Tipo de texto desconocido para Sección 7: ${textType}`);
        return '';
    }
  }
}
