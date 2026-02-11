import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ISeccion5TextGeneratorService } from '../../domain/interfaces/seccion5/iseccion5-text-generator.service';
import { Seccion5Data } from '../../domain/entities/seccion5-data';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Injectable({
  providedIn: 'root'
})
export class Seccion5TextGeneratorService implements ISeccion5TextGeneratorService {

  constructor(private sanitizer: DomSanitizer) {}

  private obtenerCampoConPrefijo(datos: any, campo: string, seccionId: string): string {
    return PrefijoHelper.obtenerValorConPrefijo(datos, campo, seccionId) || datos[campo] || '';
  }

  /**
   * Genera párrafo de institucionalidad con información sobre estructura organizativa
   * Soporta placeholders que se reemplazan con datos dinámicos
   */
  obtenerTextoInstitucionalidad(datos: Seccion5Data, nombreComunidad: string, seccionId: string): string {
    const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion5_institucionalidad', seccionId);
    
    const textoPorDefecto = `La CC ${nombreComunidad} posee una estructura organizativa que responde a sus necesidades locales y a los principios de autogobierno indígena. La asamblea general comunal es la máxima autoridad, integrada por todos los comuneros hábiles que participan activamente en la toma de decisiones. Este sistema de gobierno rotativo permite que diversos miembros de la comunidad asuman responsabilidades de liderazgo, fortaleciendo así la distribución equitativa del poder y la representación de los intereses colectivos.\n\nLa organización comunal incluye diversas instituciones que trabajan de manera coordinada para cumplir con las funciones administrativas, educativas y sanitarias que requiere la comunidad. Entre las principales instituciones se encuentran la Asamblea General, la Junta Directiva Comunal, las organizaciones de base como las rondas campesinas, las instituciones educativas, los centros de salud, y las organizaciones de mujeres. Cada una de estas instituciones tiene responsabilidades específicas que contribuyen al bienestar integral de la comunidad.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado.replace(/CC\s*___/g, `CC ${nombreComunidad}`);
    }
    
    return textoPorDefecto;
  }

  /**
   * Valida que el párrafo contenga contenido significativo
   */
  esParrafoValido(parrafo: string): boolean {
    return !!(parrafo && parrafo.trim() !== '' && parrafo !== '____');
  }

  /**
   * Formatea párrafo para presentación visual con estilos HTML
   */
  formatearParrafo(texto: string): string {
    if (!texto) return '';
    return texto.split(/\n\n+/).map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  /**
   * Escapa caracteres especiales HTML para seguridad
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escapa caracteres especiales para regex
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
