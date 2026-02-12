import { Injectable } from '@angular/core';
import { FormularioDatos } from '../../models/formulario.model';
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

  /**
   * 3.1.3, 3.1.3.A y 3.1.3.B comparten la misma vista (sección 3); en el flujo Anterior/Siguiente se tratan como una sola.
   */
  normalizarSeccionId(seccionId: string): string {
    if (seccionId === '3.1.3.A' || seccionId === '3.1.3.B') {
      return '3.1.3';
    }
    return seccionId;
  }

  /**
   * Secciones intro AISD (3.1.4.A.1, 3.1.4.A.2, ...) se saltan en Anterior/Siguiente:
   * desde 3.1.4.A se va directo a 3.1.4.A.1.1 hasta 3.1.4.A.1.16.
   */
  private esSeccionIntroAISD(seccionId: string): boolean {
    return /^3\.1\.4\.A\.\d+$/.test(seccionId);
  }

  /**
   * Sección intro AISI (3.1.4.B) se salta en Anterior/Siguiente:
   * después de 3.1.4.A.1.16 va directo a 3.1.4.B.1, luego 3.1.4.B.1.1 hasta 3.1.4.B.1.9.
   */
  private esSeccionIntroAISI(seccionId: string): boolean {
    return seccionId === '3.1.4.B';
  }

  obtenerTodasLasSecciones(datos: FormularioDatos): string[] {
    const secciones: string[] = [
      '3.1.1',
      '3.1.2.A',
      '3.1.3',
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
    const idParaIndice = this.normalizarSeccionId(seccionId);
    let index = secciones.indexOf(idParaIndice);

    if (index === -1) {
      return null;
    }

    if (!this.validationService.isValid()) {
      return null;
    }

    for (let i = index - 1; i >= 0; i--) {
      const candidate = secciones[i];
      if (this.accessControl.canAccessSection(candidate) && !this.esSeccionIntroAISD(candidate) && !this.esSeccionIntroAISI(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  obtenerSeccionSiguiente(seccionId: string, datos: FormularioDatos): string | null {
    const secciones = this.obtenerTodasLasSecciones(datos);
    const idParaIndice = this.normalizarSeccionId(seccionId);
    let index = secciones.indexOf(idParaIndice);

    if (index === -1) {
      return null;
    }

    if (!this.validationService.isValid()) {
      return null;
    }

    for (let i = index + 1; i < secciones.length; i++) {
      const candidate = secciones[i];
      if (this.accessControl.canAccessSection(candidate) && !this.esSeccionIntroAISD(candidate) && !this.esSeccionIntroAISI(candidate)) {
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
    const idParaIndice = this.normalizarSeccionId(seccionId);
    const secciones = this.obtenerTodasLasSecciones(datos);
    const index = secciones.indexOf(idParaIndice);
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
