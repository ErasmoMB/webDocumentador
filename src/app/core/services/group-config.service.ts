import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupConfig, Grupo, CCPP } from '../models/group-config.model';
import { StorageFacade } from './infrastructure/storage-facade.service';

@Injectable({
  providedIn: 'root'
})
export class GroupConfigService {
  private readonly STORAGE_KEY = 'documentador_group_config';
  
  private configSubject = new BehaviorSubject<GroupConfig | null>(null);
  public config$: Observable<GroupConfig | null> = this.configSubject.asObservable();

  constructor(private storage: StorageFacade) {
    this.loadFromStorage();
  }

  setAISD(grupo: Grupo): void {
    const current = this.configSubject.value || {};
    // setAISD reemplaza el primer grupo (índice 0) o crea un nuevo array con el grupo
    const gruposAISD = Array.isArray(current.aisd) ? [...current.aisd] : (current.aisd ? [current.aisd] : []);
    if (gruposAISD.length > 0) {
      gruposAISD[0] = grupo; // Reemplazar el primer elemento
    } else {
      gruposAISD.push(grupo); // Agregar si el array está vacío
    }
    const updated: GroupConfig = { ...current, aisd: gruposAISD, lastUpdated: Date.now() };
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  addAISD(grupo: Grupo): void {
    const current = this.configSubject.value || {};
    const gruposAISD = Array.isArray(current.aisd) ? [...current.aisd] : (current.aisd ? [current.aisd] : []);
    gruposAISD.push(grupo);
    const updated: GroupConfig = { ...current, aisd: gruposAISD, lastUpdated: Date.now() };
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  setAISI(grupo: Grupo): void {
    const current = this.configSubject.value || {};
    // setAISI reemplaza el primer grupo (índice 0) o crea un nuevo array con el grupo
    const gruposAISI = Array.isArray(current.aisi) ? [...current.aisi] : (current.aisi ? [current.aisi] : []);
    if (gruposAISI.length > 0) {
      gruposAISI[0] = grupo; // Reemplazar el primer elemento
    } else {
      gruposAISI.push(grupo); // Agregar si el array está vacío
    }
    const updated: GroupConfig = { ...current, aisi: gruposAISI, lastUpdated: Date.now() };
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  addAISI(grupo: Grupo): void {
    const current = this.configSubject.value || {};
    const gruposAISI = Array.isArray(current.aisi) ? [...current.aisi] : (current.aisi ? [current.aisi] : []);
    gruposAISI.push(grupo);
    const updated: GroupConfig = { ...current, aisi: gruposAISI, lastUpdated: Date.now() };
    this.configSubject.next(updated);
    this.saveToStorage(updated);
  }

  setAISDCCPPActivos(ccppCodigos: string[], indiceGrupo: number = 0): void {
    const current = this.configSubject.value;
    if (!current?.aisd) return;
    const gruposAISD = Array.isArray(current.aisd) ? [...current.aisd] : [current.aisd];
    if (indiceGrupo >= 0 && indiceGrupo < gruposAISD.length) {
      gruposAISD[indiceGrupo] = { ...gruposAISD[indiceGrupo], ccppActivos: ccppCodigos };
      const updated: GroupConfig = {
        ...current,
        aisd: gruposAISD,
        lastUpdated: Date.now()
      };
      this.configSubject.next(updated);
      this.saveToStorage(updated);
    }
  }

  setAISICCPPActivos(ccppCodigos: string[], indiceGrupo: number = 0): void {
    const current = this.configSubject.value;
    if (!current?.aisi) return;
    const gruposAISI = Array.isArray(current.aisi) ? [...current.aisi] : [current.aisi];
    if (indiceGrupo >= 0 && indiceGrupo < gruposAISI.length) {
      gruposAISI[indiceGrupo] = { ...gruposAISI[indiceGrupo], ccppActivos: ccppCodigos };
      const updated: GroupConfig = {
        ...current,
        aisi: gruposAISI,
        lastUpdated: Date.now()
      };
      this.configSubject.next(updated);
      this.saveToStorage(updated);
    }
  }

  getAISD(indice: number = 0): Grupo | null {
    const grupos = this.configSubject.value?.aisd;
    if (!grupos) return null;
    const gruposArray = Array.isArray(grupos) ? grupos : [grupos];
    return gruposArray[indice] || null;
  }

  getAISI(indice: number = 0): Grupo | null {
    const grupos = this.configSubject.value?.aisi;
    if (!grupos) return null;
    const gruposArray = Array.isArray(grupos) ? grupos : [grupos];
    return gruposArray[indice] || null;
  }

  getAllAISD(): Grupo[] {
    const grupos = this.configSubject.value?.aisd;
    if (!grupos) return [];
    return Array.isArray(grupos) ? grupos : [grupos];
  }

  getAllAISI(): Grupo[] {
    const grupos = this.configSubject.value?.aisi;
    if (!grupos) return [];
    return Array.isArray(grupos) ? grupos : [grupos];
  }

  getAISDCCPPActivos(indiceGrupo: number = 0): string[] {
    const grupo = this.getAISD(indiceGrupo);
    return grupo?.ccppActivos || [];
  }

  getAISICCPPActivos(indiceGrupo: number = 0): string[] {
    const grupo = this.getAISI(indiceGrupo);
    return grupo?.ccppActivos || [];
  }

  getAISDCCPPActivosPorPrefijo(prefijo: string): string[] {
    const match = prefijo.match(/_A(\d+)/);
    if (match) {
      const indice = parseInt(match[1]) - 1;
      return this.getAISDCCPPActivos(indice);
    }
    return [];
  }

  getAISICCPPActivosPorPrefijo(prefijo: string): string[] {
    const match = prefijo.match(/_B(\d+)/);
    if (match) {
      const indice = parseInt(match[1]) - 1;
      return this.getAISICCPPActivos(indice);
    }
    return [];
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
    this.storage.removeItem(this.STORAGE_KEY);
  }

  private saveToStorage(config: GroupConfig): void {
    try {
      this.storage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = this.storage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored) as GroupConfig;
        this.configSubject.next(config);
      }
    } catch (error) {
    }
  }
}
