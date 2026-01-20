import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PeaActividadesService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    const baseUrl = this.configService.getApiUrl();
    this.apiUrl = `${baseUrl}/pea`;
  }

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
