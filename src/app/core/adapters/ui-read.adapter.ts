/**
 * UI READ ADAPTER - PASO 6.2
 * 
 * Adaptador de lectura que proporciona acceso a datos del Store
 * usando Signals en lugar de BehaviorSubjects.
 */

import { Injectable, computed, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { 
  UIStoreService, 
  Selectors, 
  ProjectInfo,
  GroupOption,
  SectionNavItem,
  FormField,
  UITableRow,
  GalleryImage,
  UbicacionInfo
} from '../state/ui-store.contract';
import { ProjectState } from '../state/project-state.model';
import { Entrevistado } from '../models/formulario.model';

@Injectable({
  providedIn: 'root'
})
export class UIReadAdapter {
  
  constructor(private store: UIStoreService) {}

  // ============================================================================
  // PROJECT INFO
  // ============================================================================

  readonly projectInfo: Signal<ProjectInfo> = this.store.select(Selectors.getProjectInfo);
  
  /** @deprecated Usar projectInfo Signal */
  readonly projectInfo$: Observable<ProjectInfo> = toObservable(this.projectInfo);

  readonly projectName: Signal<string> = this.store.select(Selectors.getProjectName);
  readonly consultora: Signal<string> = this.store.select(Selectors.getConsultora);

  readonly isDirty: Signal<boolean> = computed(() => 
    this.store.getSnapshot()._internal?.isDirty ?? false
  );

  // ============================================================================
  // GROUPS
  // ============================================================================

  readonly aisdGroups: Signal<readonly GroupOption[]> = this.store.select(Selectors.getAISDGroups);
  readonly aisiGroups: Signal<readonly GroupOption[]> = this.store.select(Selectors.getAISIGroups);

  /** @deprecated Usar aisdGroups Signal */
  readonly aisdGroups$: Observable<readonly GroupOption[]> = toObservable(this.aisdGroups);
  
  /** @deprecated Usar aisiGroups Signal */
  readonly aisiGroups$: Observable<readonly GroupOption[]> = toObservable(this.aisiGroups);

  readonly aisdCount: Signal<number> = computed(() => this.aisdGroups().length);
  readonly aisiCount: Signal<number> = computed(() => this.aisiGroups().length);

  getAISDGroup(index: number): GroupOption | null {
    return this.aisdGroups()[index] ?? null;
  }

  getAISIGroup(index: number): GroupOption | null {
    return this.aisiGroups()[index] ?? null;
  }

  // ============================================================================
  // SECTIONS
  // ============================================================================

  getSectionNavSignal(sectionId: string): Signal<SectionNavItem | null> {
    return computed(() => Selectors.getSectionNav(this.store.getSnapshot(), sectionId));
  }

  isSectionComplete(sectionId: string): Signal<boolean> {
    return computed(() => 
      Selectors.getSectionNav(this.store.getSnapshot(), sectionId)?.isComplete ?? false
    );
  }

  // ============================================================================
  // FIELDS
  // ============================================================================

  getFieldSignal(sectionId: string, groupId: string | null, fieldId: string): Signal<FormField | null> {
    return computed(() => Selectors.getField(this.store.getSnapshot(), sectionId, groupId, fieldId));
  }

  getFieldValue(sectionId: string, groupId: string | null, fieldId: string): Signal<any> {
    return computed(() => Selectors.getFieldValue(this.store.getSnapshot(), sectionId, groupId, fieldId));
  }

  getSectionFields(sectionId: string, groupId: string | null): Signal<readonly FormField[]> {
    return computed(() => Selectors.getSectionFields(this.store.getSnapshot(), sectionId, groupId));
  }

  // ============================================================================
  // TABLES
  // ============================================================================

  getTableSignal(sectionId: string, groupId: string | null, tableId: string): Signal<readonly UITableRow[]> {
    return computed(() => Selectors.getTable(this.store.getSnapshot(), sectionId, groupId, tableId));
  }

  getTableRowCount(sectionId: string, groupId: string | null, tableId: string): Signal<number> {
    return computed(() => Selectors.getTableRowCount(this.store.getSnapshot(), sectionId, groupId, tableId));
  }

  // ============================================================================
  // IMAGES
  // ============================================================================

  getImagesSignal(sectionId: string, groupId: string | null): Signal<readonly GalleryImage[]> {
    return computed(() => Selectors.getSectionImages(this.store.getSnapshot(), sectionId, groupId));
  }

  getImageCount(sectionId: string, groupId: string | null): Signal<number> {
    return computed(() => Selectors.getSectionImageCount(this.store.getSnapshot(), sectionId, groupId));
  }

  // ============================================================================
  // UBICACIÓN & ENTREVISTADOS
  // ============================================================================

  readonly ubicacion: Signal<UbicacionInfo> = computed(() => 
    Selectors.getUbicacion(this.store.getSnapshot())
  );

  readonly entrevistados: Signal<readonly Entrevistado[]> = computed(() =>
    Selectors.getEntrevistados(this.store.getSnapshot())
  );

  // ============================================================================
  // SNAPSHOT
  // ============================================================================

  getSnapshot(): ProjectState {
    return this.store.getSnapshot();
  }

  selectCustom<T>(selector: (state: ProjectState) => T): Signal<T> {
    return this.store.select(selector);
  }
}
