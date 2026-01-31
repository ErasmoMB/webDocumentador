import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

type FormFieldState = {
  value: any;
  touched: boolean;
  dirty: boolean;
  errors?: { [key: string]: string };
  metadata?: {
    autoloadedFrom?: string;
    manuallyEdited?: boolean;
  };
};

type GroupState = {
  [fieldName: string]: FormFieldState;
};

type SectionFormState = {
  [groupId: string]: GroupState;
};

type FormState = {
  [sectionId: string]: SectionFormState;
};

@Injectable({ providedIn: 'root' })
export class FormStateService {
  private readonly formSubject = new BehaviorSubject<FormState>({});
  readonly form$ = this.formSubject.asObservable();

  getFormSnapshot(): FormState {
    return this.formSubject.value;
  }

  setFormState(state: FormState): void {
    this.formSubject.next(state ?? {});
  }

  updateField(sectionId: string, groupId: string, fieldName: string, value: any): void {
    const current = this.formSubject.value;
    
    // Hacer copia profunda de arrays para forzar detección de cambios
    let valorProcesado = value;
    if (Array.isArray(value)) {
      valorProcesado = value.map(item => 
        typeof item === 'object' && item !== null ? { ...item } : item
      );
    } else if (typeof value === 'object' && value !== null) {
      valorProcesado = { ...value };
    }
    
    const next: FormState = {
      ...current,
      [sectionId]: {
        ...current[sectionId],
        [groupId]: {
          ...current[sectionId]?.[groupId],
          [fieldName]: {
            value: valorProcesado,
            touched: true,
            dirty: true,
            errors: current[sectionId]?.[groupId]?.[fieldName]?.errors,
            metadata: current[sectionId]?.[groupId]?.[fieldName]?.metadata,
          },
        },
      },
    };

    this.formSubject.next(next);
  }

  getSectionState$(sectionId: string): Observable<SectionFormState | undefined> {
    return this.form$.pipe(
      map(form => form[sectionId]),
      distinctUntilChanged(),
    );
  }

  getField$(sectionId: string, groupId: string, fieldName: string): Observable<any> {
    return this.form$.pipe(
      map(form => form[sectionId]?.[groupId]?.[fieldName]?.value),
      distinctUntilChanged((prev, curr) => {
        // Comparación profunda para arrays y objetos
        if (Array.isArray(prev) && Array.isArray(curr)) {
          return JSON.stringify(prev) === JSON.stringify(curr);
        }
        if (typeof prev === 'object' && typeof curr === 'object' && prev !== null && curr !== null) {
          return JSON.stringify(prev) === JSON.stringify(curr);
        }
        return prev === curr;
      }),
    );
  }

  resetSection(sectionId: string): void {
    const current = this.formSubject.value;
    const next: FormState = { ...current };
    delete next[sectionId];
    this.formSubject.next(next);
  }

  resetForm(): void {
    this.formSubject.next({});
  }
}
