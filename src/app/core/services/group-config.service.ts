import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupConfig, Grupo, CCPP } from '../models/group-config.model';

@Injectable({
  providedIn: 'root'
})
export class GroupConfigService {
  private readonly STORAGE_KEY = 'documentador_group_config';
  
  private configSubject = new BehaviorSubject<GroupConfig | null>(null);
  public config$: Observable<GroupConfig | null> = this.configSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  setAISD(grupo: Grupo): void {
    const current = this.configSubject.value || {};
    const updated: GroupConfig = { ...current, aisd: grupo, lastUpdated: Date.now() };
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  setAISI(grupo: Grupo): void {
    const current = this.configSubject.value || {};
    const updated: GroupConfig = { ...current, aisi: grupo, lastUpdated: Date.now() };
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  setAISDCCPPActivos(ccppCodigos: string[]): void {
    const current = this.configSubject.value;
    if (!current?.aisd) return;
    const updated: GroupConfig = {
      ...current,
      aisd: { ...current.aisd, ccppActivos: ccppCodigos },
      lastUpdated: Date.now()
    };
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  setAISICCPPActivos(ccppCodigos: string[]): void {
    const current = this.configSubject.value;
    if (!current?.aisi) return;
    const updated: GroupConfig = {
      ...current,
      aisi: { ...current.aisi, ccppActivos: ccppCodigos },
      lastUpdated: Date.now()
    };
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  getAISD(): Grupo | null {
    return this.configSubject.value?.aisd || null;
  }

  getAISI(): Grupo | null {
    return this.configSubject.value?.aisi || null;
  }

  getAISDCCPPActivos(): string[] {
    return this.configSubject.value?.aisd?.ccppActivos || [];
  }

  getAISICCPPActivos(): string[] {
    return this.configSubject.value?.aisi?.ccppActivos || [];
  }

  getConfig(): GroupConfig | null {
    return this.configSubject.value;
  }

  clearAISD(): void {
    const current = this.configSubject.value;
    if (!current) return;
    const updated: GroupConfig = { ...current, aisd: undefined, lastUpdated: Date.now() };
    delete updated.aisd;
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  clearAISI(): void {
    const current = this.configSubject.value;
    if (!current) return;
    const updated: GroupConfig = { ...current, aisi: undefined, lastUpdated: Date.now() };
    delete updated.aisi;
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  clearAll(): void {
    this.configSubject.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private saveToStorage(config: GroupConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('[GroupConfigService] Error guardando config:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored) as GroupConfig;
        this.configSubject.next(config);
      }
    } catch (error) {
      console.error('[GroupConfigService] Error cargando config:', error);
    }
  }
}
