import { Injectable, computed, Signal } from '@angular/core';
import { UIStoreService, Selectors } from '../../state/ui-store.contract';
import { ProjectStateFacade } from '../../state/project-state.facade';
import {
  SectionsContentState,
  TableContent,
  isTableContent,
  TableRowReferenceData
} from '../../state/section.model';
import { ProjectState } from '../../state/project-state.model';

export interface SectionReferenceError {
  readonly sectionId: string;
  readonly tableId: string;
  readonly rowId: string;
  readonly message: string;
  readonly field: 'groupReference' | 'populatedCenter' | 'ubigeo';
}

export interface SectionReferenceValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly SectionReferenceError[];
}

@Injectable({
  providedIn: 'root'
})
export class SectionReferenceValidationService {
  readonly validationState: Signal<SectionReferenceValidationResult> = computed(() => this.evaluate());
  readonly isValid: Signal<boolean> = computed(() => this.validationState().isValid);
  readonly errors: Signal<readonly SectionReferenceError[]> = computed(() => this.validationState().errors);

  constructor(
    private projectStateFacade: ProjectStateFacade,
    private store: UIStoreService
  ) {}

  private evaluate(): SectionReferenceValidationResult {
    const sectionsState = this.projectStateFacade.sectionsContent();
    if (!sectionsState || sectionsState.sectionOrder.length === 0) {
      return { isValid: true, errors: [] };
    }

    const snapshot: ProjectState = this.store.getSnapshot();
    const errors: SectionReferenceError[] = [];

    for (const sectionId of sectionsState.sectionOrder) {
      const section = sectionsState.byId[sectionId];
      if (!section) continue;

      const tables = section.contents.filter(isTableContent) as ReadonlyArray<TableContent>;
      tables.forEach(table => this.validateTable(sectionId, table, snapshot, errors));
    }

    return { isValid: errors.length === 0, errors };
  }

  private validateTable(
    sectionId: string,
    table: TableContent,
    snapshot: ProjectState,
    errors: SectionReferenceError[]
  ) {
    table.rows.forEach(row => {
      const rowData = this.normalizeRowData(row.data);

      if (!rowData) return;

      if (rowData.groupReferenceId) {
        if (!this.groupExists(snapshot, rowData.groupReferenceId, rowData.groupReferenceType)) {
          errors.push({
            sectionId,
            tableId: table.id,
            rowId: row.id,
            message: `El grupo "${rowData.groupReferenceId}" no existe`,
            field: 'groupReference'
          });
        }
      }

      if (rowData.populatedCenterId) {
        if (!Selectors.getPopulatedCenterById(snapshot, rowData.populatedCenterId)) {
          errors.push({
            sectionId,
            tableId: table.id,
            rowId: row.id,
            message: `El centro poblado "${rowData.populatedCenterId}" no está registrado`,
            field: 'populatedCenter'
          });
        }
      }

      if (rowData.ubigeoCode) {
        if (!this.ubigeoExists(snapshot, rowData.ubigeoCode)) {
          errors.push({
            sectionId,
            tableId: table.id,
            rowId: row.id,
            message: `El UBIGEO "${rowData.ubigeoCode}" no existe`,
            field: 'ubigeo'
          });
        }
      }
    });
  }

  private normalizeRowData(data: unknown): TableRowReferenceData | null {
    if (!data || typeof data !== 'object') {
      return null;
    }
    return data as TableRowReferenceData;
  }

  private groupExists(snapshot: ProjectState, groupId: string, groupType?: 'AISD' | 'AISI'): boolean {
    const primaryType = groupType || 'AISD';
    if (Selectors.getGroupById(snapshot, primaryType, groupId)) {
      return true;
    }
    const secondaryType = primaryType === 'AISD' ? 'AISI' : 'AISD';
    return !!Selectors.getGroupById(snapshot, secondaryType, groupId);
  }

  private ubigeoExists(snapshot: ProjectState, ubigeo: string | number): boolean {
    const matchValue = String(ubigeo || '').trim();
    if (!matchValue) return false;

    return Object.values(snapshot.ccppRegistry.byId).some(entry => {
      if (String(entry.codigo) === matchValue) return true;
      if (String(entry.ubigeo) === matchValue) return true;
      return false;
    });
  }
}
