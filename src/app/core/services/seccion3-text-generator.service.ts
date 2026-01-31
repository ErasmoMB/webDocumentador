import { Injectable } from '@angular/core';

/**
 * Servicio especializado para generar textos dinámicos de la Sección 3
 * Extrae toda la lógica de generación de texto del componente
 * 
 * Responsabilidad única: Generación de textos para Sección 3
 */
@Injectable({ providedIn: 'root' })
export class Seccion3TextGeneratorService {

  /**
   * Obtiene el texto de metodología
   */
  obtenerTextoMetodologia(datos: any): string {
    if (datos.parrafoSeccion3_metodologia) {
      return datos.parrafoSeccion3_metodologia;
    }
    
    return 'Para la descripción del aspecto socioeconómico se ha utilizado una combinación de métodos y técnicas cualitativas de investigación social, entre ellas se ha seleccionado las técnicas de entrevistas semiestructuradas con autoridades locales y/o informantes calificados, así como de encuestas de carácter socioeconómico. Además de ello, se ha recurrido a la recopilación de documentos que luego son contrastados y completados con la consulta de diversas fuentes de información oficiales actualizadas respecto al área de influencia social tales como el Censo Nacional INEI (2017), Escale – MINEDU, la base de datos de la Oficina General de Estadística e Informática del Ministerio de Salud, entre otros.';
  }

  /**
   * Obtiene el texto de fuentes primarias
   */
  obtenerTextoFuentesPrimarias(datos: any): string {
    if (datos.parrafoSeccion3_fuentes_primarias) {
      return datos.parrafoSeccion3_fuentes_primarias;
    }
    
    const cantidadEntrevistas = datos.cantidadEntrevistas || '____';
    return `Dentro de las fuentes primarias se consideran a las autoridades comunales y locales, así como pobladores que fueron entrevistados y proporcionaron información cualitativa y cuantitativa. Esta información de primera mano muestra datos fidedignos que proporcionan un alcance más cercano de la realidad en la que se desarrollan las poblaciones del área de influencia social. Para la obtención de información cualitativa, se realizaron un total de ${cantidadEntrevistas} entrevistas en profundidad a informantes calificados y autoridades locales.`;
  }

  /**
   * Obtiene el texto de fuentes secundarias
   */
  obtenerTextoFuentesSecundarias(datos: any): string {
    if (datos.parrafoSeccion3_fuentes_secundarias) {
      return datos.parrafoSeccion3_fuentes_secundarias;
    }
    
    return 'En la elaboración de la LBS se utilizó información cuantitativa de fuentes secundarias provenientes de fuentes oficiales, entre las que se encuentran las siguientes:';
  }

  /**
   * Formatea un párrafo con saltos de línea
   */
  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  /**
   * Extrae un posible párrafo introductorio y una lista de ítems desde un texto que contenga viñetas
   * Retorna { intro, items }
   */
  parsearParrafoConLista(texto: string): { intro: string | null; items: string[] } {
    if (!texto) return { intro: null, items: [] };
    const lines = texto.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    const bulletPattern = /^(?:\u2022|\u25CF|●|•|\-|\u2013|\d+\.)\s*/;

    const items: string[] = [];
    let introLines: string[] = [];
    let foundBullet = false;

    for (const line of lines) {
      if (bulletPattern.test(line)) {
        foundBullet = true;
        const item = line.replace(bulletPattern, '').trim();
        if (item) items.push(item.replace(/^[\-\u2013\u2022\u25CF\s]+/, ''));
      } else if (!foundBullet) {
        introLines.push(line);
      } else {
        // If we've found bullets and later lines do not start with bullet, treat as continuation of previous item
        if (items.length > 0) {
          items[items.length - 1] += ' ' + line;
        } else {
          // fallback to intro
          introLines.push(line);
        }
      }
    }

    const intro = introLines.length > 0 ? introLines.join(' ') : null;
    return { intro, items };
  }
}
