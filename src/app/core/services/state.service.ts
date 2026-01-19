import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormularioDatos } from '../models/formulario.model';
import { Grupo } from '../models/group-config.model';

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

  private aisdGroupSubject = new BehaviorSubject<Grupo | null>(null);
  public aisdGroup$: Observable<Grupo | null> = this.aisdGroupSubject.asObservable();

  private aisiGroupSubject = new BehaviorSubject<Grupo | null>(null);
  public aisiGroup$: Observable<Grupo | null> = this.aisiGroupSubject.asObservable();

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

  setAISDGroup(grupo: Grupo | null): void {
    this.aisdGroupSubject.next(grupo);
  }

  getAISDGroup(): Grupo | null {
    return this.aisdGroupSubject.value;
  }

  setAISIGroup(grupo: Grupo | null): void {
    this.aisiGroupSubject.next(grupo);
  }

  getAISIGroup(): Grupo | null {
    return this.aisiGroupSubject.value;
  }

  clearGroups(): void {
    this.aisdGroupSubject.next(null);
    this.aisiGroupSubject.next(null);
  }
}

