import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../config.service';
import { IMaterialesDataProvider } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class MaterialesService implements IMaterialesDataProvider {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    const baseUrl = this.configService.getApiUrl();
    this.apiUrl = `${baseUrl}/materiales`;
  }

  /**
   * Obtiene materiales de construcción agregados para múltiples UBIGEOs
   * Usado para llenar la tabla de Sección 25 (Cuadro 3.47)
   */
  obtenerMateriales(codigos_ubigeo: string[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/por-codigos`,
      { codigos_ubigeo }
    );
  }
}
