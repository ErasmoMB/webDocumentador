import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface SeccionState {
  currentSeccionId: string | null;
  navigation: {
    prev: string | null;
    next: string | null;
  };
  formData: any;
  validationErrors: { [key: string]: string };
}

/**
 * SeccionStateService
 * Gestión de estado específica del feature Secciones
 * Scope: SeccionesModule (NO 'root')
 */
@Injectable()  // ← Sin providedIn: 'root' - scope al feature
export class SeccionStateService {
  private readonly stateSubject = new BehaviorSubject<SeccionState>({
    currentSeccionId: null,
    navigation: { prev: null, next: null },
    formData: {},
    validationErrors: {}
  });

  readonly state$: Observable<SeccionState> = this.stateSubject.asObservable();

  setCurrentSeccion(seccionId: string, prev: string | null, next: string | null): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      currentSeccionId: seccionId,
      navigation: { prev, next }
    });
  }

  updateFormData(data: any): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      formData: { ...this.stateSubject.value.formData, ...data }
    });
  }

  setValidationErrors(errors: { [key: string]: string }): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      validationErrors: errors
    });
  }

  getState(): SeccionState {
    return this.stateSubject.value;
  }

  clearErrors(): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      validationErrors: {}
    });
  }
}
