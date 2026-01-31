import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../config.service';
import { IViviendaDataProvider } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ViviendaService implements IViviendaDataProvider {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    const baseUrl = this.configService.getApiUrl();
    this.apiUrl = `${baseUrl}/vivienda`;
  }

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
