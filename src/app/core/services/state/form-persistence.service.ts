import { Injectable } from '@angular/core';
import { StorageFacade } from '../infrastructure/storage-facade.service';

type SectionFormState = {
  [groupId: string]: {
    [fieldName: string]: {
      value: any;
      touched: boolean;
      dirty: boolean;
      errors?: { [key: string]: string };
      metadata?: {
        autoloadedFrom?: string;
        manuallyEdited?: boolean;
      };
    };
  };
};

const STORAGE_PREFIX = 'lbs:form-state:';
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

interface PersistedState {
  savedAt: number;
  ttl: number;
  data: SectionFormState;
}

@Injectable({ providedIn: 'root' })
export class FormPersistenceService {
  constructor(private storage: StorageFacade) {}

  saveSectionState(sectionId: string, state: SectionFormState, ttl = DEFAULT_TTL_MS): void {
    const payload: PersistedState = {
      savedAt: Date.now(),
      ttl,
      data: state,
    };
    this.storage.setItem(this.getKey(sectionId), JSON.stringify(payload));
  }

  loadSectionState(sectionId: string): SectionFormState | null {
    const raw = this.storage.getItem(this.getKey(sectionId));
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as PersistedState;
      if (Date.now() - parsed.savedAt > parsed.ttl) {
        this.clearSectionState(sectionId);
        return null;
      }
      return parsed.data;
    } catch {
      this.clearSectionState(sectionId);
      return null;
    }
  }

  clearSectionState(sectionId: string): void {
    this.storage.removeItem(this.getKey(sectionId));
  }

  clearAll(): void {
    this.storage.keys()
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => this.storage.removeItem(key));
  }

  private getKey(sectionId: string): string {
    return `${STORAGE_PREFIX}${sectionId}`;
  }
}
