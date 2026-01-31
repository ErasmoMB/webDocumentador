/**
 * UI WRITE ADAPTER - PASO 6.3
 * 
 * Adaptador de escritura que convierte eventos UI en Commands.
 */

import { Injectable } from '@angular/core';
import { UIStoreService, Commands } from '../state/ui-store.contract';

@Injectable({
  providedIn: 'root'
})
export class UIWriteAdapter {
  
  constructor(private store: UIStoreService) {}

  // ============================================================================
  // METADATA
  // ============================================================================

  setProjectName(name: string): void {
    this.store.dispatch(Commands.setProjectName(name));
  }

  setConsultora(consultora: string): void {
    this.store.dispatch(Commands.setConsultora(consultora));
  }

  setDetalleProyecto(detalle: string): void {
    this.store.dispatch(Commands.setDetalleProyecto(detalle));
  }

  // ============================================================================
  // GROUPS
  // ============================================================================

  addGroup(tipo: 'AISD' | 'AISI', nombre: string, parentId: string | null = null): void {
    this.store.dispatch(Commands.addGroup(tipo, nombre, parentId));
  }

  removeGroup(tipo: 'AISD' | 'AISI', groupId: string, cascade: boolean = false): void {
    this.store.dispatch(Commands.removeGroup(tipo, groupId, cascade));
  }

  renameGroup(tipo: 'AISD' | 'AISI', groupId: string, nuevoNombre: string): void {
    this.store.dispatch(Commands.renameGroup(tipo, groupId, nuevoNombre));
  }

  // ============================================================================
  // SECTIONS
  // ============================================================================

  initializeSection(sectionId: string): void {
    this.store.dispatch(Commands.initializeSection(sectionId));
  }

  markSectionComplete(sectionId: string, isComplete: boolean = true): void {
    this.store.dispatch(Commands.markSectionComplete(sectionId, isComplete));
  }

  setActiveSection(sectionId: string): void {
    this.store.dispatch(Commands.setActiveSection(sectionId));
  }

  // ============================================================================
  // FIELDS
  // ============================================================================

  setField(sectionId: string, groupId: string | null, fieldName: string, value: any): void {
    this.store.dispatch(Commands.setField(sectionId, groupId, fieldName, value));
  }

  setFields(sectionId: string, groupId: string | null, fields: Array<{ fieldName: string; value: any }>): void {
    this.store.dispatch(Commands.setFields(sectionId, groupId, fields));
  }

  clearField(sectionId: string, groupId: string | null, fieldName: string): void {
    this.store.dispatch(Commands.clearField(sectionId, groupId, fieldName));
  }

  // ============================================================================
  // TABLES
  // ============================================================================

  addTableRow(sectionId: string, groupId: string | null, tableKey: string, data: Record<string, any>): void {
    this.store.dispatch(Commands.addTableRow(sectionId, groupId, tableKey, data));
  }

  updateTableRow(sectionId: string, groupId: string | null, tableKey: string, rowId: string, data: Partial<Record<string, any>>): void {
    this.store.dispatch(Commands.updateTableRow(sectionId, groupId, tableKey, rowId, data));
  }

  removeTableRow(sectionId: string, groupId: string | null, tableKey: string, rowId: string): void {
    this.store.dispatch(Commands.removeTableRow(sectionId, groupId, tableKey, rowId));
  }

  clearTable(sectionId: string, groupId: string | null, tableKey: string): void {
    this.store.dispatch(Commands.clearTable(sectionId, groupId, tableKey));
  }

  // ============================================================================
  // IMAGES
  // ============================================================================

  addImage(sectionId: string, groupId: string | null, titulo: string, fuente: string, preview?: string): void {
    this.store.dispatch(Commands.addImage(sectionId, groupId, titulo, fuente, preview));
  }

  updateImage(imageId: string, changes: { titulo?: string; fuente?: string }): void {
    this.store.dispatch(Commands.updateImage(imageId, changes));
  }

  removeImage(imageId: string): void {
    this.store.dispatch(Commands.removeImage(imageId));
  }

  // ============================================================================
  // PROJECT
  // ============================================================================

  setUbicacion(departamento?: string, provincia?: string, distrito?: string): void {
    this.store.dispatch(Commands.setUbicacion(departamento, provincia, distrito));
  }

  addEntrevistado(nombre: string, cargo: string, organizacion: string): void {
    this.store.dispatch(Commands.addEntrevistado(nombre, cargo, organizacion));
  }

  removeEntrevistado(index: number): void {
    this.store.dispatch(Commands.removeEntrevistado(index));
  }

  markProjectSaved(): void {
    this.store.dispatch(Commands.markProjectSaved());
  }

  // ============================================================================
  // STATE
  // ============================================================================

  resetState(): void {
    this.store.reset();
  }

  executeBatch(builderFn: (cmd: typeof Commands) => ReturnType<typeof Commands[keyof typeof Commands]>[]): void {
    const commands = builderFn(Commands);
    this.store.dispatch(Commands.batch(commands));
  }
}
