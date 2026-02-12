import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextNormalizationService {
  
  capitalizarTexto(texto: string): string {
    if (!texto || texto.trim() === '') return texto;
    const textoLimpio = texto.trim();
    return textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1).toLowerCase();
  }

  normalizarNombreProyecto(texto: string | undefined | null, conArticulo: boolean = true): string {
    if (!texto || texto === '____' || texto === '...') return '____';
    let resultado = this.capitalizarTexto(texto.trim());
    
    if (conArticulo) {
      if (/^el proyecto /i.test(resultado)) {
        return resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      else if (/^proyecto /i.test(resultado)) {
        return 'El ' + resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      else {
        return 'El Proyecto ' + resultado;
      }
    } else {
      return resultado;
    }
  }

  agregarPuntoFinal(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    const textoTrim = texto.trim();
    if (/[.!?]$/.test(textoTrim)) {
      return textoTrim;
    }
    return textoTrim + '.';
  }

  normalizarDespuesDeQue(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    if (/^(el|la|los|las)\s+resto.+\s+por\s+/i.test(resultado)) {
      resultado = 'se considera ' + resultado;
    }
    
    if (resultado.length > 0 && /^[A-Z]/.test(resultado)) {
      const palabrasConMayuscula = ['El Proyecto', 'La Comunidad', 'Se consideran', 'Debido'];
      const empiezaConPalabra = palabrasConMayuscula.some(p => resultado.startsWith(p));
      
      if (!empiezaConPalabra) {
        resultado = resultado.charAt(0).toLowerCase() + resultado.slice(1);
      } else if (resultado.startsWith('Se consideran')) {
        resultado = 'se consideran' + resultado.slice(13);
      } else if (resultado.startsWith('El Proyecto')) {
        resultado = 'el Proyecto' + resultado.slice(11);
      }
    }
    
    return this.agregarPuntoFinal(resultado);
  }

  normalizarComponente1(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    if (/^el proyecto se ubica en el distrito de/i.test(resultado)) {
      resultado = resultado.replace(/^el proyecto se ubica en (el distrito de .+)/i, '$1');
    }
    
    if (resultado.length > 0 && /^[A-Z]/.test(resultado.charAt(0))) {
      const excepciones = ['El Proyecto', 'La Comunidad', 'Los centros'];
      const esExcepcion = excepciones.some(e => resultado.startsWith(e));
      
      if (!esExcepcion) {
        resultado = resultado.charAt(0).toLowerCase() + resultado.slice(1);
      } else if (resultado.startsWith('Los centros')) {
        resultado = 'los centros' + resultado.slice(11);
      } else if (resultado.startsWith('El Proyecto')) {
        resultado = 'el Proyecto' + resultado.slice(11);
      }
    }
    
    return this.agregarPuntoFinal(resultado);
  }

  normalizarDetalleProyecto(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    resultado = resultado.replace(/\bel\s+zona\b/gi, 'la zona');
    resultado = resultado.replace(/\bel\s+región\b/gi, 'la región');
    
    if (/^[A-Z]/.test(resultado)) {
      if (/^(zona|región|provincia|costa|sierra|selva)/i.test(resultado)) {
        resultado = 'la ' + resultado.charAt(0).toLowerCase() + resultado.slice(1);
      }
      else if (/^(distrito|departamento|valle|territorio)/i.test(resultado)) {
        resultado = 'el ' + resultado.charAt(0).toLowerCase() + resultado.slice(1);
      }
    }
    
    return resultado;
  }
}

