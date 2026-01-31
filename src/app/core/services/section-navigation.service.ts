import { Injectable } from '@angular/core';
import { FormularioDatos } from '../models/formulario.model';
import { SectionAccessControlService } from './section-access-control.service';
import { SectionReferenceValidationService, SectionReferenceError } from './section-reference-validation.service';

@Injectable({
  providedIn: 'root'
})
export class SectionNavigationService {

  constructor(
    private accessControl: SectionAccessControlService,
    private validationService: SectionReferenceValidationService
  ) {}

  normalizarSeccionId(seccionId: string): string {
    // No normalizar, permitir que cada seccion tenga su propio flujo
    return seccionId;
  }

  esSeccionIntro(seccionId: string): boolean {
    // Verifica si es una sección intro (A.1, A.2, B.1, B.2, etc.)
    // Formato: 3.1.4.A.{n} o 3.1.4.B.{n} sin puntos adicionales
    const match = seccionId.match(/^3\.1\.4\.[AB]\.(\d+)$/);
    return !!match;
  }

  obtenerTodasLasSecciones(datos: FormularioDatos): string[] {
    const secciones: string[] = [
      '3.1.1',
      '3.1.2.A',
      '3.1.3.A',
      '3.1.4.A'
    ];

    // Agregar secciones para Comunidades Campesinas (AISD)
    const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
    const numComunidades = comunidadesCampesinas.length > 0 ? comunidadesCampesinas.length : 1;

    for (let i = 1; i <= numComunidades; i++) {
      // Agregar intro de cada comunidad (A.1, A.2, etc.)
      secciones.push(`3.1.4.A.${i}`);
      
      // Agregar subsecciones de cada comunidad (A.1.1 a A.1.16, etc.)
      for (let j = 1; j <= 16; j++) {
        secciones.push(`3.1.4.A.${i}.${j}`);
      }
    }

    // Agregar sección intro para AISI
    secciones.push('3.1.4.B');

    // Agregar secciones para Distritos (AISI)
    const distritosAISI = datos['distritosAISI'] || [];
    const numDistritos = distritosAISI.length > 0 ? distritosAISI.length : 1;

    for (let i = 1; i <= numDistritos; i++) {
      // Agregar intro de cada distrito (B.1, B.2, etc.)
      secciones.push(`3.1.4.B.${i}`);
      
      // Agregar subsecciones de cada distrito (B.1.1 a B.1.9, etc.)
      for (let j = 1; j <= 9; j++) {
        secciones.push(`3.1.4.B.${i}.${j}`);
      }
    }

    return secciones;
  }

  obtenerSeccionAnterior(seccionId: string, datos: FormularioDatos): string | null {
    const secciones = this.obtenerTodasLasSecciones(datos);
    let index = secciones.indexOf(seccionId);

    if (index === -1) {
      return null;
    }

    if (!this.validationService.isValid()) {
      return null;
    }

    for (let i = index - 1; i >= 0; i--) {
      const candidate = secciones[i];
      // Saltar secciones intro cuando se navega con anterior/siguiente
      if (this.accessControl.canAccessSection(candidate) && !this.esSeccionIntro(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  obtenerSeccionSiguiente(seccionId: string, datos: FormularioDatos): string | null {
    const secciones = this.obtenerTodasLasSecciones(datos);
    let index = secciones.indexOf(seccionId);

    if (index === -1) {
      return null;
    }

    if (!this.validationService.isValid()) {
      return null;
    }

    for (let i = index + 1; i < secciones.length; i++) {
      const candidate = secciones[i];
      // Saltar secciones intro cuando se navega con anterior/siguiente
      if (this.accessControl.canAccessSection(candidate) && !this.esSeccionIntro(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  actualizarEstadoNavegacion(seccionId: string, datos: FormularioDatos): { 
    puedeIrAnterior: boolean; 
    puedeIrSiguiente: boolean; 
    esUltimaSeccion: boolean 
  } {
    const seccionNormalizada = this.normalizarSeccionId(seccionId);
    const secciones = this.obtenerTodasLasSecciones(datos);
    const index = secciones.indexOf(seccionNormalizada);
    const anterior = this.obtenerSeccionAnterior(seccionId, datos);
    const siguiente = this.obtenerSeccionSiguiente(seccionId, datos);

    const canNavigate = this.validationService.isValid();

    return {
      puedeIrAnterior: !!anterior && canNavigate,
      puedeIrSiguiente: !!siguiente && canNavigate,
      esUltimaSeccion: !siguiente && index === secciones.length - 1
    };
  }

  /**
   * Expone los errores de validación referencial
   */
  getValidationErrors(): readonly SectionReferenceError[] {
    return this.validationService.errors();
  }
}
