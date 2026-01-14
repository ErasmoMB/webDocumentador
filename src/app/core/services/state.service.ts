import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormularioDatos } from '../models/formulario.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private datosSubject = new BehaviorSubject<FormularioDatos | null>(null);
  public datos$: Observable<FormularioDatos | null> = this.datosSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  setDatos(datos: FormularioDatos): void {
    this.datosSubject.next(datos);
  }

  getDatos(): FormularioDatos | null {
    return this.datosSubject.value;
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  updateDato<K extends keyof FormularioDatos>(campo: K, valor: FormularioDatos[K]): void {
    const current = this.getDatos();
    if (current) {
      this.setDatos({ ...current, [campo]: valor });
    }
  }

  clearError(): void {
    this.errorSubject.next(null);
  }
}

