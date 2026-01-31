import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Servicio de Generación de Texto para Sección 6
 * Responsable de generar textos dinámicos sobre población y demográfica
 */
@Injectable({ providedIn: 'root' })
export class Seccion6TextGeneratorService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Obtiene el texto de población por sexo con HTML resaltado
   */
  obtenerTextoPoblacionSexoConResaltado(datos: any, nombreComunidad: string): SafeHtml {
    const texto = this.obtenerTextoPoblacionSexo(datos, nombreComunidad);
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  /**
   * Obtiene el texto de población por sexo sin HTML
   */
  obtenerTextoPoblacionSexo(datos: any, nombreComunidad: string): string {
    if (!datos || !nombreComunidad || nombreComunidad === '____') {
      return this.getTextoPoblacionSexoDefault();
    }

    const textoPoblacionSexo = datos.textoPoblacionSexoAISD || this.getTextoPoblacionSexoDefault();
    return textoPoblacionSexo.replace(/___/g, nombreComunidad);
  }

  /**
   * Obtiene el texto de población por grupo etario con HTML resaltado
   */
  obtenerTextoPoblacionEtarioConResaltado(datos: any, nombreComunidad: string): SafeHtml {
    const texto = this.obtenerTextoPoblacionEtario(datos, nombreComunidad);
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  /**
   * Obtiene el texto de población por grupo etario sin HTML
   */
  obtenerTextoPoblacionEtario(datos: any, nombreComunidad: string): string {
    if (!datos || !nombreComunidad || nombreComunidad === '____') {
      return this.getTextoPoblacionEtarioDefault();
    }

    const textoPoblacionEtario = datos.textoPoblacionEtarioAISD || this.getTextoPoblacionEtarioDefault();
    return textoPoblacionEtario.replace(/___/g, nombreComunidad);
  }

  /**
   * Texto por defecto para población por sexo
   */
  private getTextoPoblacionSexoDefault(): string {
    return 'La CC ___ tiene una distribución equilibrada de población por sexo que refleja la composición demográfica de la comunidad.';
  }

  /**
   * Texto por defecto para población por grupo etario
   */
  private getTextoPoblacionEtarioDefault(): string {
    return 'La CC ___ presenta una distribución de población según grandes grupos de edad que muestra los patrones demográficos de la comunidad.';
  }
}
