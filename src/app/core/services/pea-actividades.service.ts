import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeaActividadesService {
  private apiUrl = `${environment.apiUrl}/pea`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene PEA Ocupada agregada por actividades económicas para múltiples UBIGEOs
   * Usado para llenar la tabla de Sección 24
   */
  obtenerActividadesOcupadas(codigos_ubigeo: string[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/actividades-ocupadas`,
      { codigos_ubigeo }
    );
  }
}
