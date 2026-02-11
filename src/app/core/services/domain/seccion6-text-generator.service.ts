import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

/**
 * Servicio de Generación de Texto para Sección 6
 * Responsable de generar textos dinámicos sobre población y demográfica
 */
@Injectable({ providedIn: 'root' })
export class Seccion6TextGeneratorService {

  constructor(private sanitizer: DomSanitizer) {}

  private obtenerCampoConPrefijo(datos: any, campo: string, seccionId: string): string {
    return PrefijoHelper.obtenerValorConPrefijo(datos, campo, seccionId) || datos[campo] || '';
  }

  /**
   * Obtiene el texto de población por sexo con HTML resaltado
   */
  obtenerTextoPoblacionSexoConResaltado(datos: any, nombreComunidad: string, seccionId: string): SafeHtml {
    const texto = this.obtenerTextoPoblacionSexo(datos, nombreComunidad, seccionId);
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  /**
   * Obtiene el texto de población por sexo sin HTML
   */
  obtenerTextoPoblacionSexo(datos: any, nombreComunidad: string, seccionId: string): string {
    if (!datos || !nombreComunidad || nombreComunidad === '____') {
      return this.getTextoPoblacionSexoDefault();
    }

    const textoPoblacionSexo = this.obtenerCampoConPrefijo(datos, 'textoPoblacionSexoAISD', seccionId);
    if (textoPoblacionSexo && textoPoblacionSexo.trim() !== '' && textoPoblacionSexo !== '____') {
      return textoPoblacionSexo.replace(/___/, nombreComunidad);
    }
    return this.getTextoPoblacionSexoDefault().replace(/___/, nombreComunidad);
  }

  /**
   * Obtiene el texto de población por grupo etario con HTML resaltado
   */
  obtenerTextoPoblacionEtarioConResaltado(datos: any, nombreComunidad: string, seccionId: string): SafeHtml {
    const texto = this.obtenerTextoPoblacionEtario(datos, nombreComunidad, seccionId);
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  /**
   * Obtiene el texto de población por grupo etario sin HTML
   */
  obtenerTextoPoblacionEtario(datos: any, nombreComunidad: string, seccionId: string): string {
    if (!datos || !nombreComunidad || nombreComunidad === '____') {
      return this.getTextoPoblacionEtarioDefault();
    }

    const textoPoblacionEtario = this.obtenerCampoConPrefijo(datos, 'textoPoblacionEtarioAISD', seccionId);
    if (textoPoblacionEtario && textoPoblacionEtario.trim() !== '' && textoPoblacionEtario !== '____') {
      return textoPoblacionEtario.replace(/___/, nombreComunidad);
    }
    return this.getTextoPoblacionEtarioDefault().replace(/___/, nombreComunidad);
  }

  /**
   * Texto por defecto para población por sexo
   */
  private getTextoPoblacionSexoDefault(): string {
    return 'Respecto a la población de la CC ___, tomando en cuenta data obtenida de los Censos Nacionales 2017 y los puntos de población que la conforman, existen un total de ___ habitantes que residen permanentemente en la comunidad. De este conjunto, el ___ son varones, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares femeninos (___).';
  }

  /**
   * Texto por defecto para población por grupo etario
   */
  private getTextoPoblacionEtarioDefault(): string {
    return 'En una clasificación en grandes grupos de edad, se puede observar que el grupo etario mayoritario en la CC ___ es el de ___ años, puesto que representa el ___ de la población total. En segundo lugar, bastante cerca del primero, se halla el bloque etario de ___ años (___). Por otro lado, el conjunto minoritario está conformado por la población de ___ años a más, pues solo representa el ___.';
  }
}
