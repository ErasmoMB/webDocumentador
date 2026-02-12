import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../infrastructure/logger.service';
import { CentroPobladoData, FormularioDatos } from '../../models/formulario.model';
import { FormularioDataTransformer, MockDataLoader } from '../data-transformers';

@Injectable({
  providedIn: 'root'
})
export class FormularioMockService {

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private dataTransformer: FormularioDataTransformer,
    private mockDataLoader: MockDataLoader
  ) {}

  aplicarTransformacionesMock(datos: any): Partial<FormularioDatos> {
    try {
      this.logger.info('Aplicando transformaciones mock a datos del formulario');
      return this.dataTransformer.transform(datos);
    } catch (error) {
      this.logger.error('Error aplicando transformaciones mock:', error);
      return datos; // Retornar datos originales en caso de error
    }
  }

  async cargarMockCapitulo3(): Promise<{ datos: Partial<FormularioDatos>; json?: CentroPobladoData[] } | null> {
    const result = await this.mockDataLoader.cargarMockCapitulo3();

    if (!result) {
      return null;
    }

    // Aplicar transformaciones a los datos cargados
    const datosTransformados = this.aplicarTransformacionesMock(result.datos);

    return {
      datos: datosTransformados,
      json: result.json
    };
  }
}
