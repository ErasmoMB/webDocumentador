import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosBasicosService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene datos de servicios básicos (agua, desagüe, electricidad) para múltiples UBIGEOs
   * @param codigosUbigeo Lista de códigos UBIGEO
   * @returns Observable con datos agrupados por categoría
   */
  obtenerServiciosPorCodigos(codigosUbigeo: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/servicios/por-codigos`, {
      codigos_ubigeo: codigosUbigeo
    });
  }

  /**
   * Obtiene datos de energía/combustible para cocina para múltiples UBIGEOs
   * @param codigosUbigeo Lista de códigos UBIGEO
   * @returns Observable con datos de energía de cocina
   */
  obtenerEnergiaCocinavPorCodigos(codigosUbigeo: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/energia-cocina/por-codigos`, {
      codigos_ubigeo: codigosUbigeo
    });
  }
}
