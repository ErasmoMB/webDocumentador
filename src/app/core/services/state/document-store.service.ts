import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FormState, SectionFormState } from '../../models/form-state.model';
import { FormStateService } from './form-state.service';

@Injectable({ providedIn: 'root' })
export class DocumentStoreService {
  constructor(private formState: FormStateService) {}

  getDocumentState$(): Observable<FormState> {
    return this.formState.form$;
  }

  getSectionState$(sectionId: string): Observable<SectionFormState | undefined> {
    return this.formState.getSectionState$(sectionId);
  }

  updateDocument(sectionId: string, groupId: string, fieldName: string, value: any): void {
    this.formState.updateField(sectionId, groupId, fieldName, value);
  }

  exportToJSON(): FormState {
    return this.formState.getFormSnapshot();
  }

  importFromJSON(data: FormState): void {
    this.formState.setFormState(data);
  }
}
