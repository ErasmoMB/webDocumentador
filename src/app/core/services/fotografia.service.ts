import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Fotografia } from '../models/formulario.model';

@Injectable({
  providedIn: 'root'
})
export class FotografiaService {
  private fotografiasSubject = new BehaviorSubject<Map<string, Fotografia[]>>(new Map());
  public fotografias$: Observable<Map<string, Fotografia[]>> = this.fotografiasSubject.asObservable();

  getFotografias(seccion: string): Fotografia[] {
    return this.fotografiasSubject.value.get(seccion) || [];
  }

  setFotografias(seccion: string, fotografias: Fotografia[]): void {
    const map = new Map(this.fotografiasSubject.value);
    map.set(seccion, fotografias);
    this.fotografiasSubject.next(map);
  }

  agregarFotografia(seccion: string, fotografia: Fotografia): void {
    const fotografias = this.getFotografias(seccion);
    fotografias.push(fotografia);
    this.setFotografias(seccion, fotografias);
  }

  eliminarFotografia(seccion: string, index: number): void {
    const fotografias = this.getFotografias(seccion);
    fotografias.splice(index, 1);
    this.setFotografias(seccion, fotografias);
  }

  actualizarFotografia(seccion: string, index: number, fotografia: Fotografia): void {
    const fotografias = this.getFotografias(seccion);
    if (fotografias[index]) {
      fotografias[index] = fotografia;
      this.setFotografias(seccion, fotografias);
    }
  }

  limpiarFotografias(seccion: string): void {
    this.setFotografias(seccion, []);
  }
}

