import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ViviendaService {
  private apiUrl = `${environment.apiUrl}/vivienda`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene tipos de vivienda agregados para múltiples UBIGEOs
   * Usado para llenar la tabla de Sección 25 (Cuadro 3.45)
   */
  obtenerTiposVivienda(codigos_ubigeo: string[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/por-codigos`,
      { codigos_ubigeo }
    );
  }
}
