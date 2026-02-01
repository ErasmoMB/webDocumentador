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
/** Valores mayores a este tamaño no se persisten en localStorage para evitar QuotaExceededError */
const BLOB_SIZE_THRESHOLD = 50 * 1024; // 50 KB

interface PersistedState {
  savedAt: number;
  ttl: number;
  data: SectionFormState;
}

function isBlobValue(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value.startsWith('data:image')) return true;
  return value.length > BLOB_SIZE_THRESHOLD;
}

/**
 * Clona el estado y reemplaza valores tipo blob (Base64/imágenes) por cadena vacía
 * para no exceder la cuota de localStorage y permitir muchas imágenes en memoria.
 */
function stripBlobsFromState(state: SectionFormState): SectionFormState {
  const out: SectionFormState = {};
  for (const groupId of Object.keys(state)) {
    const group = state[groupId];
    out[groupId] = {};
    for (const fieldName of Object.keys(group)) {
      const field = group[fieldName];
      const value = field?.value;
      out[groupId][fieldName] = {
        ...field,
        value: isBlobValue(value) ? '' : value,
      };
    }
  }
  return out;
}

@Injectable({ providedIn: 'root' })
export class FormPersistenceService {
  constructor(private storage: StorageFacade) {}

  saveSectionState(sectionId: string, state: SectionFormState, ttl = DEFAULT_TTL_MS): void {
    const dataToPersist = stripBlobsFromState(state);
    const payload: PersistedState = {
      savedAt: Date.now(),
      ttl,
      data: dataToPersist,
    };
    const key = this.getKey(sectionId);
    try {
      this.storage.setItem(key, JSON.stringify(payload));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        this.clearSectionState(sectionId);
        this.storage.setItem(key, JSON.stringify({ savedAt: Date.now(), ttl, data: {} }));
      } else {
        throw err;
      }
    }
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
