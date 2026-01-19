import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeaService {
  private apiUrl = `${environment.apiUrl}/pea`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene datos PEA agregados para múltiples UBIGEOs
   * Usado para llenar las 3 tablas de Sección 23
   */
  obtenerPorCodigos(codigos_ubigeo: string[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/por-codigos`,
      { codigos_ubigeo }
    );
  }

  /**
   * Obtiene datos PEA para un UBIGEO específico
   */
  obtenerDetallePorUbigeo(ubigeo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detalle/${ubigeo}`);
  }
}
