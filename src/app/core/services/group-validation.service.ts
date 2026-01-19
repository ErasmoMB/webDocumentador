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
    const aisd = this.groupConfig.getAISD();
    return !!aisd && aisd.ccppActivos && aisd.ccppActivos.length > 0;
  }

  canAccessAISISection(): boolean {
    const aisi = this.groupConfig.getAISI();
    return !!aisi && aisi.ccppActivos && aisi.ccppActivos.length > 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    const config = this.groupConfig.getConfig();

    if (!config || (!config.aisd && !config.aisi)) {
      errors.push('Debe configurar al menos una Comunidad Campesina o un Distrito');
    }

    if (config?.aisd && (!config.aisd.ccppActivos || config.aisd.ccppActivos.length === 0)) {
      errors.push('Comunidad Campesina configurada pero sin CCPP activos');
    }

    if (config?.aisi && (!config.aisi.ccppActivos || config.aisi.ccppActivos.length === 0)) {
      errors.push('Distrito configurado pero sin CCPP activos');
    }

    return errors;
  }
}
