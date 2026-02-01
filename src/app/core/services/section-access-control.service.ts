import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroupConfigService } from './group-config.service';
import { GroupValidationService } from './group-validation.service';
import { SectionAccessState, getSectionGroupType, GroupType } from '../models/section-config.model';

@Injectable({
  providedIn: 'root'
})
export class SectionAccessControlService {

  constructor(
    private groupConfig: GroupConfigService,
    private groupValidation: GroupValidationService
  ) {}

  /**
   * Determina si una sección está disponible basado en la configuración de grupos
   */
  isSectionAvailable$(sectionId: string): Observable<boolean> {
    return this.getSectionAccessState$(sectionId).pipe(
      map(state => state.isAvailable)
    );
  }

  /**
   * Obtiene el estado completo de acceso a una sección
   */
  getSectionAccessState$(sectionId: string): Observable<SectionAccessState> {
    return combineLatest([
      this.groupConfig.config$,
      this.groupValidation.getValidationState()
    ]).pipe(
      map(([config, validation]) => {
        const groupType = getSectionGroupType(sectionId);
        let isAvailable = false;
        let reason = '';

        switch (groupType) {
          case 'AISD':
            isAvailable = !!config?.aisd && validation.hasAISD;
            reason = isAvailable 
              ? 'AISD configurado y válido'
              : 'AISD no configurado o sin CCPP activos';
            break;

          case 'AISI':
            isAvailable = !!config?.aisi && validation.hasAISI;
            reason = isAvailable 
              ? 'AISI configurado y válido'
              : 'AISI no configurado o sin CCPP activos';
            break;

          case 'BOTH':
            isAvailable = validation.isValid;
            reason = isAvailable 
              ? 'Al menos un grupo configurado'
              : 'Ningún grupo configurado';
            break;

          case 'NONE':
          default:
            isAvailable = true;
            reason = 'Sección sin restricciones de grupo';
            break;
        }

        return {
          sectionId,
          isAvailable,
          reason,
          requiredGroups: groupType === 'NONE' ? [] : [groupType]
        };
      })
    );
  }

  /**
   * Obtiene todas las secciones disponibles
   */
  getAvailableSections$(): Observable<string[]> {
    return combineLatest([
      this.groupConfig.config$,
      this.groupValidation.getValidationState()
    ]).pipe(
      map(([config, validation]) => {
        const available: string[] = [];

        // Secciones sin restricción siempre disponibles
        available.push('3.1.1', '3.1.2.A', '3.1.3', '3.1.3.A');

        // Secciones AISD
        if (config?.aisd && validation.hasAISD) {
          available.push('3.1.4.A');
        }

        // Secciones AISI
        if (config?.aisi && validation.hasAISI) {
          available.push('3.1.4.B.1');
        }

        return available;
      })
    );
  }

  /**
   * Verifica sincronizadamente (sin Observable) si una sección está disponible
   */
  canAccessSection(sectionId: string): boolean {
    // Siempre permitir navegar a las pantallas de configuración y subsecciones del primer bloque AISD/AISI
    if (sectionId === '3.1.4.A' || sectionId === '3.1.4.B' || sectionId === '3.1.4.B.1') {
      return true;
    }
    // Desde 3.1.4.A debe continuar con 3.1.4.A.1.1 hasta 3.1.4.A.1.16 (siempre accesibles)
    if (/^3\.1\.4\.A\.1\.(1[0-6]|[1-9])$/.test(sectionId)) {
      return true;
    }
    // Desde 3.1.4.B.1 debe seguir hasta 3.1.4.B.1.9 (siempre accesibles)
    if (/^3\.1\.4\.B\.1\.([1-9])$/.test(sectionId)) {
      return true;
    }
    const groupType = getSectionGroupType(sectionId);
    const config = this.groupConfig.getConfig();

    switch (groupType) {
      case 'AISD':
        if (!config?.aisd) return false;
        const aisdGroups = Array.isArray(config.aisd) ? config.aisd : [config.aisd];
        return aisdGroups.some(grupo => grupo.ccppActivos && grupo.ccppActivos.length > 0);

      case 'AISI':
        if (!config?.aisi) return false;
        const aisiGroups = Array.isArray(config.aisi) ? config.aisi : [config.aisi];
        return aisiGroups.some(grupo => grupo.ccppActivos && grupo.ccppActivos.length > 0);

      case 'BOTH':
        return this.groupValidation.isConfigValid();

      case 'NONE':
      default:
        return true;
    }
  }

  /**
   * Obtiene el siguiente sección disponible después de la sección actual
   */
  getNextAvailableSection$(currentSectionId: string, allSections: string[]): Observable<string | null> {
    return this.getAvailableSections$().pipe(
      map(availableSections => {
        const currentIndex = allSections.indexOf(currentSectionId);
        if (currentIndex === -1) return null;

        for (let i = currentIndex + 1; i < allSections.length; i++) {
          if (availableSections.includes(allSections[i])) {
            return allSections[i];
          }
        }

        return null;
      })
    );
  }

  /**
   * Obtiene la sección anterior disponible
   */
  getPreviousAvailableSection$(currentSectionId: string, allSections: string[]): Observable<string | null> {
    return this.getAvailableSections$().pipe(
      map(availableSections => {
        const currentIndex = allSections.indexOf(currentSectionId);
        if (currentIndex === -1) return null;

        for (let i = currentIndex - 1; i >= 0; i--) {
          if (availableSections.includes(allSections[i])) {
            return allSections[i];
          }
        }

        return null;
      })
    );
  }

  /**
   * Retorna resumen de acceso para debugging
   */
  getAccessSummary(): string {
    const config = this.groupConfig.getConfig();
    const hasAISD = !!config?.aisd;
    const hasAISI = !!config?.aisi;
    
    let aiesdCCPP = 0;
    if (config?.aisd) {
      const aisdGroups = Array.isArray(config.aisd) ? config.aisd : [config.aisd];
      aiesdCCPP = aisdGroups.reduce((total, grupo) => total + (grupo.ccppActivos?.length || 0), 0);
    }
    
    let aisiCCPP = 0;
    if (config?.aisi) {
      const aisiGroups = Array.isArray(config.aisi) ? config.aisi : [config.aisi];
      aisiCCPP = aisiGroups.reduce((total, grupo) => total + (grupo.ccppActivos?.length || 0), 0);
    }

    return `ACCESO: AISD=${hasAISD} (${aiesdCCPP} CCPP), AISI=${hasAISI} (${aisiCCPP} CCPP)`;
  }
}
