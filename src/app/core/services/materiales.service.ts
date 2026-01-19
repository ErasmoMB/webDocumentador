import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaterialesService {
  private apiUrl = `${environment.apiUrl}/materiales`;

  constructor(private http: HttpClient) { }

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
