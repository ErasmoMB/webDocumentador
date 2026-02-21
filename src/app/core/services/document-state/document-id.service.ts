import { Injectable } from '@angular/core';
import { StorageFacade } from '../infrastructure/storage-facade.service';
import { FormularioService } from '../formulario/formulario.service';

@Injectable({ providedIn: 'root' })
export class DocumentIdService {
  private readonly storageKey = 'lbs:document-id';

  constructor(
    private storage: StorageFacade,
    private formularioService: FormularioService,
  ) {}

  /**
   * Intenta usar un ID estable del documento.
   * - Si el usuario ya definió `projectName`, lo usamos como ID (es lo más consistente para BD).
   * - Si no, usamos un ID generado y persistido en localStorage.
   */
  getDocumentId(): string {
    const projectName = (this.formularioService?.datos?.projectName || '').trim();
    if (projectName) return projectName;

    const existing = (this.storage.getItem(this.storageKey) || '').trim();
    if (existing) return existing;

    const created = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    this.storage.setItem(this.storageKey, created);
    return created;
  }
}
