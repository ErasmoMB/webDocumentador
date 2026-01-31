import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface PlantillaState {
  currentSection: string | null;
  formData: any;
  isDirty: boolean;
  lastSaved: Date | null;
}

/**
 * PlantillaStateService
 * Gestión de estado específica del feature Plantilla
 * Scope: PlantillaModule (NO 'root')
 */
@Injectable()  // ← Sin providedIn: 'root' - scope al feature
export class PlantillaStateService {
  private readonly stateSubject = new BehaviorSubject<PlantillaState>({
    currentSection: null,
    formData: {},
    isDirty: false,
    lastSaved: null
  });

  readonly state$: Observable<PlantillaState> = this.stateSubject.asObservable();

  updateCurrentSection(section: string): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      currentSection: section
    });
  }

  updateFormData(data: any): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      formData: data,
      isDirty: true
    });
  }

  markAsSaved(): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      isDirty: false,
      lastSaved: new Date()
    });
  }

  getState(): PlantillaState {
    return this.stateSubject.value;
  }

  reset(): void {
    this.stateSubject.next({
      currentSection: null,
      formData: {},
      isDirty: false,
      lastSaved: null
    });
  }
}
