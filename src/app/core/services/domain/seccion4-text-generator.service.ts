import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class Seccion4TextGeneratorService {

  constructor(private sanitizer: DomSanitizer) {}

  obtenerTextoIntroduccionAISD(datos: any, nombreComunidad: string): string {
    let textoPersonalizado = datos['parrafoSeccion4_introduccion_aisd'];
    
    const textoPorDefecto = `Se ha determinado como Área de Influencia Social Directa (AISD) a la CC ${nombreComunidad}. Esta delimitación se justifica en los criterios de propiedad de terreno superficial, además de la posible ocurrencia de impactos directos como la contratación de mano de obra local, adquisición de bienes y servicios, así como logística. En los siguientes apartados se desarrolla la caracterización socioeconómica y cultural de la comunidad delimitada como parte del AISD.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado.replace(/CC\s*___/g, `CC ${nombreComunidad}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoComunidadCompleto(datos: any, nombreComunidad: string): string {
    let textoPersonalizado = datos['parrafoSeccion4_comunidad_completo'];
    
    const distrito = datos.distritoSeleccionado || '____';
    const provincia = datos.provinciaSeleccionada || '____';
    const aisd1 = datos.aisdComponente1 || '____';
    const aisd2 = datos.aisdComponente2 || '____';
    const departamento = datos.departamentoSeleccionado || '____';
    const grupoAISI = datos.grupoAISI || datos.distritoSeleccionado || '____';
    
    const textoPorDefecto = `La CC ${nombreComunidad} se encuentra ubicada predominantemente dentro del distrito de ${distrito}, provincia de ${provincia}; no obstante, sus límites comunales abarcan pequeñas áreas de los distritos de ${aisd1} y de ${aisd2}, del departamento de ${departamento}. Esta comunidad se caracteriza por su historia y tradiciones que se mantienen vivas a lo largo de los años. Se encuentra compuesta por el anexo ${nombreComunidad}, el cual es el centro administrativo comunal, además de los sectores agropecuarios de Yuracranra, Tastanic y Faldahuasi. Ello se pudo validar durante el trabajo de campo, así como mediante la Base de Datos de Pueblos Indígenas u Originarios (BDPI). Sin embargo, en la actualidad, estos sectores agropecuarios no cuentan con población permanente y la mayor parte de los comuneros se concentran en el anexo ${nombreComunidad}.\n\nEn cuanto al nombre "${nombreComunidad}", según los entrevistados, este proviene de una hierba que se empleaba para elaborar moldes artesanales para queso; no obstante, ya no se viene utilizando en el presente y es una práctica que ha ido reduciéndose paulatinamente. Por otro lado, cabe mencionar que la comunidad se halla al este de la CC Sondor, al norte del CP ${grupoAISI} y al oeste del anexo Nauquipa.\n\nAsimismo, la CC ${nombreComunidad} es reconocida por el Ministerio de Cultura como parte de los pueblos indígenas u originarios, específicamente como parte del pueblo quechua. Esta identidad es un pilar fundamental de la comunidad, influyendo en sus prácticas agrícolas, celebraciones y organización social. La oficialización de la comunidad por parte del Estado peruano se remonta al 24 de agosto de 1987, cuando fue reconocida mediante RD N°495 – 87 – MAG – DR – VIII – A. Este reconocimiento formalizó la existencia y los derechos de la comunidad, fortaleciendo su posición y legitimidad dentro del marco legal peruano. Posteriormente, las tierras de la comunidad fueron tituladas el 28 de marzo de 1996, conforme consta en la Ficha 90000300, según la BDPI. Esta titulación ha sido crucial para la protección y manejo de sus recursos naturales, permitiendo a la comunidad planificar y desarrollar proyectos que beneficien a todos sus comuneros. La administración de estas tierras ha sido un factor clave en la preservación de su cultura y en el desarrollo sostenible de la comunidad.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${nombreComunidad}`)
        .replace(/distrito de\s*___/g, `distrito de ${distrito}`)
        .replace(/provincia de\s*___/g, `provincia de ${provincia}`)
        .replace(/distritos de\s*___\s*y de/g, `distritos de ${aisd1} y de`)
        .replace(/y de\s*___\s*del departamento/g, `y de ${aisd2} del departamento`)
        .replace(/departamento de\s*___/g, `departamento de ${departamento}`)
        .replace(/CP\s*___/g, `CP ${grupoAISI}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoCaracterizacionIndicadores(datos: any, nombreComunidad: string): string {
    let textoPersonalizado = datos['parrafoSeccion4_caracterizacion_indicadores'];
    
    const textoPorDefecto = `Para la caracterización de los indicadores demográficos y aquellos relacionados a viviendas, se emplea la sumatoria de casos obtenida al considerar aquellos puntos de población que conforman la CC ${nombreComunidad}. En el siguiente cuadro, se presenta aquellos puntos de población identificados por el INEI que se encuentran dentro de la comunidad en cuestión.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado.replace(/CC\s*___/g, `CC ${nombreComunidad}`);
    }
    
    return textoPorDefecto;
  }

  formatearConResaltado(texto: string, valoresAResaltar: string[]): SafeHtml {
    let html = this.escapeHtml(texto);
    
    const uniqueValores = Array.from(new Set(valoresAResaltar)).filter(v => v && v !== '____');
    
    uniqueValores.forEach(valor => {
      const regex = new RegExp(this.escapeRegex(valor), 'g');
      html = html.replace(regex, `<span class="data-section">${this.escapeHtml(valor)}</span>`);
    });
    
    // Dividir en párrafos para mejor formato en Word export
    const parrafos = html.split(/\n\n+/).map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
    
    return this.sanitizer.bypassSecurityTrustHtml(parrafos);
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    return texto.split(/\n\n+/).map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
