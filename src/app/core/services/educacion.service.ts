import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class EducacionService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.getApiUrl();
  }

  /**
   * Obtiene datos de educación por códigos de ubicación
   * @param codigosUbigeo Array de códigos CPP
   */
  obtenerEducacionPorCodigos(codigosUbigeo: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/educacion/por-codigos`, {
      codigos_ubigeo: codigosUbigeo
    });
  }

  /**
   * Obtiene niveles educativos para un CPP específico (Sección 28)
   */
  obtenerNivelesPorCpp(cpp: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/educacion/niveles?id_ubigeo=${cpp}`);
  }

  /**
   * Obtiene datos de nivel educativo alcanzado (Sección 30 - Cuadro 3.58)
   * @param cpp Código CPP del centro poblado
   */
  obtenerNivelEducativoPorCpp(cpp: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/educacion/nivel-educativo-por-cpp?cpp=${cpp}`);
  }

  /**
   * Obtiene tasa de analfabetismo (Sección 30 - Cuadro 3.59)
   * @param cpp Código CPP del centro poblado
   */
  obtenerAnalfabetismoPorCpp(cpp: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/educacion/analfabetismo-por-cpp?cpp=${cpp}`);
  }

  /**
   * Obtiene nivel educativo para múltiples CPPs en una sola consulta (batch)
   * @param cpps Array de códigos CPP
   */
  obtenerNivelEducativoMultiples(cpps: string[]): Observable<any> {
    const cppsStr = cpps.join(',');
    return this.http.get(`${this.baseUrl}/educacion/nivel-educativo-multiples?cpps=${cppsStr}`);
  }

  /**
   * Obtiene tasa de analfabetismo para múltiples CPPs en una sola consulta (batch)
   * @param cpps Array de códigos CPP
   */
  obtenerAnalfabetismoMultiples(cpps: string[]): Observable<any> {
    const cppsStr = cpps.join(',');
    return this.http.get(`${this.baseUrl}/educacion/analfabetismo-multiples?cpps=${cppsStr}`);
  }

  /**
   * Obtiene datos agregados de analfabetismo por códigos de ubicación
   * @param codigosUbigeo Array de códigos CPP
   */
  obtenerAnalfabetismoPorCodigos(codigosUbigeo: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/educacion/analfabetismo/por-codigos`, {
      codigos_ubigeo: codigosUbigeo
    });
  }
}
