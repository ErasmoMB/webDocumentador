import { Injectable, Injector } from '@angular/core';
import { TextGeneratorStrategy, TextGenerationContext } from './text-generator-strategy.interface';
import { Seccion2TextGeneratorStrategy } from './seccion2-text-generator.strategy';
import { Seccion3TextGeneratorStrategy } from './seccion3-text-generator.strategy';
import { Seccion4TextGeneratorStrategy } from './seccion4-text-generator.strategy';
import { Seccion5TextGeneratorStrategy } from './seccion5-text-generator.strategy';
import { Seccion6TextGeneratorStrategy } from './seccion6-text-generator.strategy';
import { Seccion7TextGeneratorStrategy } from './seccion7-text-generator.strategy';
import { Seccion8TextGeneratorStrategy } from './seccion8-text-generator.strategy';

/**
 * Servicio centralizado para generación de texto usando Strategy Pattern
 * Permite agregar nuevos generadores sin modificar código existente (OCP)
 * 
 * Uso:
 * ```typescript
 * constructor(private textGenerator: TextGeneratorService) {}
 * 
 * generarTexto() {
 *   const contexto: TextGenerationContext = {
 *     sectionId: '3.1.2',
 *     textType: 'aisd_completo',
 *     params: { comunidades: this.comunidades }
 *   };
 *   return this.textGenerator.generarTexto(this.datos, contexto);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TextGeneratorService {
  private strategies: Map<string, TextGeneratorStrategy> = new Map();
  private initialized = false;

  constructor(private injector: Injector) {
    this.inicializarEstrategias();
  }

  private inicializarEstrategias(): void {
    if (this.initialized) return;

    const estrategias = [
      this.injector.get(Seccion2TextGeneratorStrategy),
      this.injector.get(Seccion3TextGeneratorStrategy),
      this.injector.get(Seccion4TextGeneratorStrategy),
      this.injector.get(Seccion5TextGeneratorStrategy),
      this.injector.get(Seccion6TextGeneratorStrategy),
      this.injector.get(Seccion7TextGeneratorStrategy),
      this.injector.get(Seccion8TextGeneratorStrategy)
    ];

    estrategias.forEach(strategy => {
      this.registrarEstrategia(strategy);
    });

    this.initialized = true;
  }

  /**
   * Registra una estrategia de generación de texto
   */
  registrarEstrategia(strategy: TextGeneratorStrategy): void {
    this.strategies.set(strategy.sectionId, strategy);
  }

  /**
   * Genera texto usando la estrategia apropiada para el contexto
   */
  generarTexto(datos: any, contexto: TextGenerationContext): string {
    const strategy = this.encontrarEstrategia(contexto);
    if (!strategy) {
      console.warn(`No se encontró estrategia para sección ${contexto.sectionId}, tipo ${contexto.textType}`);
      return '';
    }
    return strategy.generarTexto(datos, contexto);
  }

  /**
   * Encuentra la estrategia apropiada para el contexto
   */
  private encontrarEstrategia(contexto: TextGenerationContext): TextGeneratorStrategy | null {
    const sectionKey = this.extraerSectionKey(contexto.sectionId);
    
    const strategy = this.strategies.get(sectionKey);
    if (strategy && strategy.puedeGenerar(contexto)) {
      return strategy;
    }

    return null;
  }

  /**
   * Extrae la clave de sección desde el sectionId
   * Ej: '3.1.2' -> 'seccion2', '3.1.3' -> 'seccion3'
   */
  private extraerSectionKey(sectionId: string): string {
    const match = sectionId.match(/3\.1\.(\d+)/);
    if (match) {
      const numero = parseInt(match[1]);
      return `seccion${numero}`;
    }
    return sectionId;
  }

  /**
   * Obtiene una estrategia específica por su ID
   */
  obtenerEstrategia(sectionId: string): TextGeneratorStrategy | null {
    const sectionKey = this.extraerSectionKey(sectionId);
    return this.strategies.get(sectionKey) || null;
  }

  /**
   * Verifica si existe una estrategia para una sección
   */
  tieneEstrategia(sectionId: string): boolean {
    return this.obtenerEstrategia(sectionId) !== null;
  }
}
