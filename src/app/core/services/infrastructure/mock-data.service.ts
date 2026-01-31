import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private cache: any | null = null;
  private loading: Promise<any> | null = null;

  constructor(private http: HttpClient) {}

  async getCapitulo3Datos(): Promise<any> {
    // Si ya hay datos en caché, devolverlos
    if (this.cache) {
      return this.cache;
    }

    // Si ya está cargando, esperar la carga
    if (this.loading) {
      return this.loading;
    }

    // Cargar datos del archivo JSON
    this.loading = firstValueFrom(
      this.http.get<any>('assets/mockData/capitulo3.json')
    ).then(data => {
      this.cache = data;
      this.loading = null;
      return data;
    }).catch(error => {
      console.error('Error cargando datos mock:', error);
      this.loading = null;
      // Devolver estructura vacía en caso de error
      return {
        timestamp: new Date().toISOString(),
        datos: {}
      };
    });

    return this.loading;
  }

  // Método para limpiar caché (útil para pruebas)
  clearCache(): void {
    this.cache = null;
    this.loading = null;
  }
}
