import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaludService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene datos de seguro de salud por CPP
   * @param cpp Código CPP del centro poblado
   */
  obtenerSeguroSaludPorCpp(cpp: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/salud/seguro-salud-por-codigos?cpp=${cpp}`);
  }

  /**
   * Obtiene datos de seguro de salud para múltiples CPPs
   * @param cpps Array de códigos CPP
   */
  obtenerSeguroSaludMultiples(cpps: string[]): Observable<any> {
    const cppsStr = cpps.join(',');
    return this.http.get(`${this.baseUrl}/salud/seguro-salud-multiples?cpps=${cppsStr}`);
  }

  /**
   * Obtiene datos de seguro de salud por id_ubicacion
   * @param id_ubicacion ID de la ubicación
   */
  obtenerSeguroSaludPorUbicacion(id_ubicacion: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/salud/seguro-salud-por-codigos?id_ubicacion=${id_ubicacion}`);
  }

  /**
   * Obtiene datos de seguro de salud agregados (todo el país)
   */
  obtenerSeguroSaludTotal(): Observable<any> {
    return this.http.get(`${this.baseUrl}/salud/seguro-salud-por-codigos`);
  }
}
