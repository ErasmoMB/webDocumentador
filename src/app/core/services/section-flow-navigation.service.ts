import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectStateFacade } from '../state/project-state.facade';
import { ReactiveStateAdapter } from './state-adapters/reactive-state-adapter.service';

interface SectionFlow {
  sectionId: string;
  groupType: 'AISD' | 'AISI'; // A = AISD, B = AISI
  groupNumber: number;
  subSectionNumber: number;
}

/**
 * Servicio para navegar secuencialmente entre secciones.
 * 
 * Flujo esperado:
 * - A.1.1 → ... → A.1.16 → A.2.1 (si existe) → ... → A.2.16 → B.1.1 (si existe) → ... → B.1.9 → B.2.1 (si existe) → ...
 * - Si no hay más subsecciones, avanza al siguiente grupo
 * - Si no hay más grupos AISD, avanza al primer grupo AISI
 * - Si no hay más grupos AISI, termina
 */
@Injectable({
  providedIn: 'root'
})
export class SectionFlowNavigationService {
  
  // Números de subsecciones para cada grupo tipo
  private readonly AISD_SUBSECTIONS = 16; // A.1.1 a A.1.16
  private readonly AISI_SUBSECTIONS = 9;  // B.1.1 a B.1.9

  constructor(
    private router: Router,
    private projectFacade: ProjectStateFacade,
    private stateAdapter: ReactiveStateAdapter
  ) {}

  /**
   * Parsea el ID de sección actual y retorna su estructura
   * Ej: 3.1.4.A.1.16 → { sectionId: '3.1.4.A.1.16', groupType: 'AISD', groupNumber: 1, subSectionNumber: 16 }
   */
  private parseSectionId(sectionId: string): SectionFlow | null {
    const parts = sectionId.split('.');
    
    // Debe tener al menos 6 partes: 3.1.4.A.1.1
    if (parts.length < 6) {
      return null;
    }

    const groupTypeChar = parts[3]; // 'A' o 'B'
    const groupNumber = parseInt(parts[4], 10);
    const subSectionNumber = parseInt(parts[5], 10);

    if (isNaN(groupNumber) || isNaN(subSectionNumber)) {
      return null;
    }

    const groupType = groupTypeChar === 'A' ? 'AISD' : (groupTypeChar === 'B' ? 'AISI' : null);
    
    if (!groupType) {
      return null;
    }

    return {
      sectionId,
      groupType,
      groupNumber,
      subSectionNumber
    };
  }

  /**
   * Obtiene el número total de grupos AISD disponibles
   */
  private getAISDGroupCount(): number {
    try {
      const grupos = this.projectFacade.aisdGroups();
      return grupos ? grupos.length : 1; // Mínimo 1 grupo
    } catch (error) {
      // Fallback a datos legacy
      const datos = this.projectFacade.obtenerDatos();
      const comunidades = datos['comunidadesCampesinas'] || [];
      return comunidades.length > 0 ? comunidades.length : 1;
    }
  }

  /**
   * Obtiene el número total de grupos AISI disponibles
   */
  private getAISIGroupCount(): number {
    try {
      const grupos = this.projectFacade.aisiGroups();
      return grupos ? grupos.length : 1; // Mínimo 1 grupo
    } catch (error) {
      // Fallback a datos legacy
      const datos = this.projectFacade.obtenerDatos();
      const distritos = datos['distritosAISI'] || [];
      return distritos.length > 0 ? distritos.length : 1;
    }
  }

  /**
   * Calcula la siguiente sección en el flujo
   * Retorna null si se alcanzó el final del flujo
   */
  getNextSection(currentSectionId: string): string | null {
    const parsed = this.parseSectionId(currentSectionId);
    
    if (!parsed) {
      return null;
    }

    const { groupType, groupNumber, subSectionNumber } = parsed;
    const isLastSubSection = 
      (groupType === 'AISD' && subSectionNumber === this.AISD_SUBSECTIONS) ||
      (groupType === 'AISI' && subSectionNumber === this.AISI_SUBSECTIONS);

    if (!isLastSubSection) {
      // Hay más subsecciones en el grupo actual
      const nextSubSection = subSectionNumber + 1;
      return `3.1.4.${groupType === 'AISD' ? 'A' : 'B'}.${groupNumber}.${nextSubSection}`;
    }

    // Se alcanzó la última subsección del grupo actual
    // Intentar pasar al siguiente grupo del mismo tipo
    if (groupType === 'AISD') {
      const aisdGroupCount = this.getAISDGroupCount();
      if (groupNumber < aisdGroupCount) {
        // Hay más grupos AISD - retornar la vista del siguiente grupo (sin subsección)
        return `3.1.4.A.${groupNumber + 1}`;
      }

      // No hay más grupos AISD, pasar a AISI
      const aisiGroupCount = this.getAISIGroupCount();
      if (aisiGroupCount > 0) {
        return `3.1.4.B.1`;
      }

      // No hay grupos AISI, terminar
      return null;
    }

    // groupType === 'AISI'
    const aisiGroupCount = this.getAISIGroupCount();
    if (groupNumber < aisiGroupCount) {
      // Hay más grupos AISI - retornar la vista del siguiente grupo (sin subsección)
      return `3.1.4.B.${groupNumber + 1}`;
    }

    // Se alcanzó el final del flujo
    return null;
  }

  /**
   * Calcula la sección anterior en el flujo
   * Retorna null si se está en la primera sección
   */
  getPreviousSection(currentSectionId: string): string | null {
    const parsed = this.parseSectionId(currentSectionId);
    
    if (!parsed) {
      return null;
    }

    const { groupType, groupNumber, subSectionNumber } = parsed;

    if (subSectionNumber > 1) {
      // Hay subsecciones anteriores en el grupo actual
      const prevSubSection = subSectionNumber - 1;
      return `3.1.4.${groupType === 'AISD' ? 'A' : 'B'}.${groupNumber}.${prevSubSection}`;
    }

    // Se está en la primera subsección del grupo actual (subSectionNumber === 1)
    // Retornar la vista del grupo sin subsección específica
    // Ej: 3.1.4.A.1.1 → 3.1.4.A.1
    return `3.1.4.${groupType === 'AISD' ? 'A' : 'B'}.${groupNumber}`;
  }

  /**
   * Calcula la sección anterior cuando se está en una vista de grupo sin subsección
   * Ej: De 3.1.4.A.2 → 3.1.4.A.1.16 (última subsección del grupo anterior)
   */
  getPreviousSectionFromGroupView(currentSectionId: string): string | null {
    // Extraer grupo y tipo
    const match = currentSectionId.match(/^3\.1\.4\.([AB])\.(\d+)$/);
    if (!match) {
      return null;
    }

    const groupType = match[1] === 'A' ? 'AISD' : 'AISI';
    const groupNumber = parseInt(match[2], 10);
    const maxSubSections = groupType === 'AISD' ? this.AISD_SUBSECTIONS : this.AISI_SUBSECTIONS;

    if (groupNumber > 1) {
      // Hay grupos anteriores del mismo tipo
      return `3.1.4.${match[1]}.${groupNumber - 1}.${maxSubSections}`;
    }

    // Es el primer grupo
    if (groupType === 'AISD') {
      // No hay grupo anterior
      return null;
    }

    // Es el primer grupo AISI, retroceder al último grupo AISD
    const aisdGroupCount = this.getAISDGroupCount();
    if (aisdGroupCount > 0) {
      return `3.1.4.A.${aisdGroupCount}.${this.AISD_SUBSECTIONS}`;
    }

    return null;
  }

  /**
   * Calcula la sección siguiente cuando se está en una vista de grupo sin subsección
   * Ej: De 3.1.4.A.1 → 3.1.4.A.1.1 (primera subsección del grupo actual)
   */
  getNextSectionFromGroupView(currentSectionId: string): string | null {
    // Extraer grupo y tipo
    const match = currentSectionId.match(/^3\.1\.4\.([AB])\.(\d+)$/);
    if (!match) {
      return null;
    }

    // Simplemente retornar la primera subsección
    return currentSectionId + '.1';
  }

  /**
   * Navega a la siguiente sección
   */
  navigateNext(currentSectionId: string): void {
    const nextSection = this.getNextSection(currentSectionId);
    
    if (nextSection) {
      this.router.navigate(['/seccion', nextSection]);
    }
  }

  /**
   * Navega a la sección anterior
   */
  navigatePrevious(currentSectionId: string): void {
    const prevSection = this.getPreviousSection(currentSectionId);
    
    if (prevSection) {
      this.router.navigate(['/seccion', prevSection]);
    }
  }

  /**
   * Verifica si hay una siguiente sección disponible
   */
  hasNextSection(currentSectionId: string): boolean {
    return this.getNextSection(currentSectionId) !== null;
  }

  /**
   * Verifica si hay una sección anterior disponible
   */
  hasPreviousSection(currentSectionId: string): boolean {
    return this.getPreviousSection(currentSectionId) !== null;
  }

  /**
   * Obtiene información sobre el flujo para la sección actual
   */
  getFlowInfo(currentSectionId: string): {
    currentPosition: string;
    nextPosition: string | null;
    previousPosition: string | null;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null {
    const parsed = this.parseSectionId(currentSectionId);
    
    if (!parsed) {
      return null;
    }

    const next = this.getNextSection(currentSectionId);
    const prev = this.getPreviousSection(currentSectionId);

    return {
      currentPosition: `${parsed.groupType === 'AISD' ? 'A' : 'B'}.${parsed.groupNumber}.${parsed.subSectionNumber}`,
      nextPosition: next ? this.extractPosition(next) : null,
      previousPosition: prev ? this.extractPosition(prev) : null,
      hasNext: next !== null,
      hasPrevious: prev !== null
    };
  }

  /**
   * Extrae la posición legible de un ID de sección
   * Ej: 3.1.4.A.1.16 → A.1.16
   */
  private extractPosition(sectionId: string): string {
    const parts = sectionId.split('.');
    if (parts.length >= 6) {
      return `${parts[3]}.${parts[4]}.${parts[5]}`;
    }
    return sectionId;
  }
}
