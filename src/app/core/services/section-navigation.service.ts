import { Injectable } from '@angular/core';
import { FormularioDatos } from '../models/formulario.model';

@Injectable({
  providedIn: 'root'
})
export class SectionNavigationService {

  normalizarSeccionId(seccionId: string): string {
    if (seccionId === '3.1.4.A.1' || seccionId === '3.1.4.A') {
      return '3.1.4.A';
    }
    return seccionId;
  }

  obtenerTodasLasSecciones(datos: FormularioDatos): string[] {
    const secciones: string[] = [
      '3.1.1',
      '3.1.2.A',
      '3.1.3.A',
      '3.1.4.A'
    ];

    const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
    const numComunidades = comunidadesCampesinas.length > 0 ? comunidadesCampesinas.length : 1;

    for (let i = 1; i <= numComunidades; i++) {
      for (let j = 1; j <= 16; j++) {
        secciones.push(`3.1.4.A.${i}.${j}`);
      }
    }

    const distritosSeleccionadosAISI = datos['distritosSeleccionadosAISI'] || [];
    const numDistritos = distritosSeleccionadosAISI.length > 0 ? distritosSeleccionadosAISI.length : 1;

    for (let i = 1; i <= numDistritos; i++) {
      for (let j = 1; j <= 9; j++) {
        secciones.push(`3.1.4.B.${i}.${j}`);
      }
    }

    return secciones;
  }

  obtenerSeccionAnterior(seccionId: string, datos: FormularioDatos): string | null {
    if (seccionId === '3.1.3.B') {
      return '3.1.3.A';
    }
    if (seccionId === '3.1.4.A' || seccionId === '3.1.4.A.1') {
      return '3.1.3.A';
    }
    
    const seccionNormalizada = this.normalizarSeccionId(seccionId);
    const secciones = this.obtenerTodasLasSecciones(datos);
    let index = secciones.indexOf(seccionNormalizada);
    
    if (index === -1) {
      index = secciones.indexOf(seccionId);
    }
    
    if (index > 0) {
      const seccionAnterior = secciones[index - 1];
      if (seccionAnterior === '3.1.4.A') {
        return '3.1.4.A';
      }
      return seccionAnterior;
    }
    
    return null;
  }

  obtenerSeccionSiguiente(seccionId: string, datos: FormularioDatos): string | null {
    if (seccionId === '3.1.3.A') {
      return '3.1.4.A';
    }
    if (seccionId === '3.1.3.B') {
      return '3.1.4.A';
    }
    if (seccionId === '3.1.4.A' || seccionId === '3.1.4.A.1') {
      const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
      const numComunidades = comunidadesCampesinas.length > 0 ? comunidadesCampesinas.length : 1;
      if (numComunidades >= 1) {
        return '3.1.4.A.1.1';
      }
    }
    
    const seccionNormalizada = this.normalizarSeccionId(seccionId);
    const secciones = this.obtenerTodasLasSecciones(datos);
    let index = secciones.indexOf(seccionNormalizada);
    
    if (index === -1) {
      index = secciones.indexOf(seccionId);
    }
    
    if (index < secciones.length - 1) {
      return secciones[index + 1];
    }
    
    return null;
  }

  actualizarEstadoNavegacion(seccionId: string, datos: FormularioDatos): { 
    puedeIrAnterior: boolean; 
    puedeIrSiguiente: boolean; 
    esUltimaSeccion: boolean 
  } {
    if (seccionId === '3.1.3.B') {
      return {
        puedeIrAnterior: true,
        puedeIrSiguiente: true,
        esUltimaSeccion: false
      };
    }
    
    const seccionNormalizada = this.normalizarSeccionId(seccionId);
    const secciones = this.obtenerTodasLasSecciones(datos);
    const index = secciones.indexOf(seccionNormalizada);
    
    return {
      puedeIrAnterior: index > 0,
      puedeIrSiguiente: index < secciones.length - 1,
      esUltimaSeccion: index === secciones.length - 1
    };
  }
}
