import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../infrastructure/logger.service';
import { IMockDataLoader } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class MockDataLoader implements IMockDataLoader {

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}

  async cargarMockCapitulo3(): Promise<{ datos: any; json?: any[] } | null> {
    const timestamp = new Date().getTime();
    const url = `/assets/mockData/capitulo3.json?v=${timestamp}`;

    try {
      const data = await firstValueFrom(this.http.get<any>(url));

      if (!data) {
        this.logger.error('Mock vacío o no encontrado', null, url);
        return null;
      }

      if (!data.datos) {
        this.logger.error('No se encontró la propiedad "datos" en el JSON');
        return null;
      }

      // Los datos ya vienen transformados desde el JSON
      return {
        datos: data.datos,
        json: data?.json
      };
    } catch (error: any) {
      this.logger.error('Error HTTP al cargar mock capitulo3', error);

      if (error.status === 404) {
        this.logger.error('Archivo no encontrado en', null, url);
      } else if (error.status === 0) {
        this.logger.error('Error de red o CORS. Verifique que el servidor esté ejecutándose y que el archivo exista en', null, url);
      } else if (error.error) {
        this.logger.error('Error del servidor', error.error);
      }

      return null;
    }
  }
}
