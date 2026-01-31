import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroupConfigService } from './group-config.service';
import { GroupConfigState } from '../models/group-config.model';

@Injectable({
  providedIn: 'root'
})
export class GroupValidationService {
  
  constructor(private groupConfig: GroupConfigService) {}

  getValidationState(): Observable<GroupConfigState> {
    return this.groupConfig.config$.pipe(
      map(config => this.validateConfig(config))
    );
  }

  private validateConfig(config: any): GroupConfigState {
    const hasAISD = !!config?.aisd;
    const hasAISI = !!config?.aisi;
    const isValid = hasAISD || hasAISI;

    return {
      config: config || {},
      isValid,
      hasAISD,
      hasAISI
    };
  }

  isConfigValid(): boolean {
    const config = this.groupConfig.getConfig();
    return !!config && (!!config.aisd || !!config.aisi);
  }

  hasAISD(): boolean {
    return !!this.groupConfig.getAISD();
  }

  hasAISI(): boolean {
    return !!this.groupConfig.getAISI();
  }

  canAccessAISDSection(): boolean {
    const aisdGroups = this.groupConfig.getAllAISD();
    if (!aisdGroups || aisdGroups.length === 0) return false;
    return aisdGroups.some(grupo => grupo.ccppActivos && grupo.ccppActivos.length > 0);
  }

  canAccessAISISection(): boolean {
    const aisiGroups = this.groupConfig.getAllAISI();
    if (!aisiGroups || aisiGroups.length === 0) return false;
    return aisiGroups.some(grupo => grupo.ccppActivos && grupo.ccppActivos.length > 0);
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    const config = this.groupConfig.getConfig();

    if (!config || (!config.aisd && !config.aisi)) {
      errors.push('Debe configurar al menos una Comunidad Campesina o un Distrito');
    }

    if (config?.aisd) {
      const aisdGroups = Array.isArray(config.aisd) ? config.aisd : [config.aisd];
      const hasActiveCCPP = aisdGroups.some(grupo => grupo.ccppActivos && grupo.ccppActivos.length > 0);
      if (!hasActiveCCPP) {
        errors.push('Comunidad Campesina configurada pero sin CCPP activos');
      }
    }

    if (config?.aisi) {
      const aisiGroups = Array.isArray(config.aisi) ? config.aisi : [config.aisi];
      const hasActiveCCPP = aisiGroups.some(grupo => grupo.ccppActivos && grupo.ccppActivos.length > 0);
      if (!hasActiveCCPP) {
        errors.push('Distrito configurado pero sin CCPP activos');
      }
    }

    return errors;
  }
}
