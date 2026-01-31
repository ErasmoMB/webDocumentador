import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormChangeService } from './state/form-change.service';

/**
 * Servicio especializado para gestión de fuentes secundarias de la Sección 3
 * Centraliza toda la lógica de negocio relacionada con fuentes secundarias
 * 
 * Responsabilidad única: Gestión de fuentes secundarias
 */
@Injectable({ providedIn: 'root' })
export class Seccion3FuentesManagementService {
  private fuentesSubject = new BehaviorSubject<string[]>([]);
  fuentes$: Observable<string[]> = this.fuentesSubject.asObservable();
  private readonly SECTION_ID = '3.1.3';

  constructor(
    private formChange: FormChangeService
  ) {}

  /**
   * Inicializa las fuentes secundarias desde los datos
   */
  inicializarFuentes(datos: any): string[] {
    const fuentes = datos.fuentesSecundariasLista || [];
    this.fuentesSubject.next([...fuentes]);
    return fuentes;
  }

  /**
   * Obtiene las fuentes secundarias actuales
   */
  obtenerFuentes(datos: any): string[] {
    return datos.fuentesSecundariasLista || [];
  }

  /**
   * Actualiza una fuente secundaria en un índice específico
   */
  actualizarFuente(index: number, valor: string, datos: any): void {
    const lista = [...(datos.fuentesSecundariasLista || [])];
    lista[index] = valor;
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { fuentesSecundariasLista: lista }
    );
    this.fuentesSubject.next([...lista]);
  }

  /**
   * Elimina una fuente secundaria en un índice específico
   */
  eliminarFuente(index: number, datos: any): void {
    const lista = [...(datos.fuentesSecundariasLista || [])];
    lista.splice(index, 1);
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { fuentesSecundariasLista: lista }
    );
    this.fuentesSubject.next([...lista]);
  }

  /**
   * Agrega una nueva fuente secundaria
   */
  agregarFuente(datos: any): void {
    const lista = [...(datos.fuentesSecundariasLista || [])];
    lista.push('');
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { fuentesSecundariasLista: lista }
    );
    this.fuentesSubject.next([...lista]);
  }
}
