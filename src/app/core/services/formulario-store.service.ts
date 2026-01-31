import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CentroPobladoData, FormularioDatos } from '../models/formulario.model';
import { createFormularioDefaults } from '../models/formulario-defaults';

@Injectable({
  providedIn: 'root'
})
export class FormularioStoreService {
  private datos: FormularioDatos = createFormularioDefaults();
  private jsonData: CentroPobladoData[] = [];
  
  // ✅ BehaviorSubject para notificaciones reactivas inmediatas
  private datosSubject = new BehaviorSubject<FormularioDatos>(this.datos);
  public datos$: Observable<FormularioDatos> = this.datosSubject.asObservable();

  getDatos(): FormularioDatos {
    return this.datos;
  }

  getJson(): CentroPobladoData[] {
    return this.jsonData;
  }

  setJson(data: CentroPobladoData[]): void {
    this.jsonData = data;
  }

  setDato(campo: keyof FormularioDatos, valor: any): void {
    (this.datos as any)[campo] = valor;
    this.notificarCambio();
  }

  aplicarDatos(nuevosDatos: Partial<FormularioDatos>): boolean {
    Object.keys(nuevosDatos).forEach(key => {
      const nuevoValor = (nuevosDatos as any)[key];
      if (nuevoValor !== null && nuevoValor !== undefined) {
        if (Array.isArray(nuevoValor)) {
          (this.datos as any)[key] = nuevoValor;
        } else if (typeof nuevoValor === 'object') {
          (this.datos as any)[key] = nuevoValor;
        } else {
          (this.datos as any)[key] = nuevoValor;
        }
      }
    });

    // ✅ Notificar cambio inmediatamente
    this.notificarCambio();
    
    return Object.keys(nuevosDatos).some(key => Array.isArray((nuevosDatos as any)[key]));
  }

  reemplazarDatos(nuevosDatos: FormularioDatos): void {
    this.datos = JSON.parse(JSON.stringify(nuevosDatos));
    this.notificarCambio();
  }

  mergeDatos(cargados: Partial<FormularioDatos>): void {
    Object.keys(cargados).forEach(key => {
      (this.datos as any)[key] = (cargados as any)[key];
    });
    this.notificarCambio();
  }

  resetDatos(): void {
    this.datos = createFormularioDefaults();
    this.jsonData = [];
    this.notificarCambio();
  }
  
  // ✅ Notificación inmediata de cambios
  private notificarCambio(): void {
    this.datosSubject.next(this.datos);
  }
}
