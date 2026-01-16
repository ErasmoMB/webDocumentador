import { Injectable } from '@angular/core';
import { FormularioService } from './formulario.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class CentrosPobladosActivosService {
  private readonly STORAGE_KEY = 'centros_poblados_activos';

  constructor(
    private formularioService: FormularioService,
    private logger: LoggerService
  ) {}

  obtenerCodigosActivos(comunidadId: string): string[] {
    try {
      const prefijo = this.obtenerPrefijoDeComunidadId(comunidadId);
      if (!prefijo) {
        return [];
      }

      const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2(prefijo);
      
      if (filasActivas.length > 0) {
        return filasActivas;
      }

      const datos = this.formularioService.obtenerDatos();
      const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
      const indiceComunidad = this.obtenerIndiceComunidad(comunidadId);
      
      if (indiceComunidad >= 0 && indiceComunidad < comunidadesCampesinas.length) {
        const comunidad = comunidadesCampesinas[indiceComunidad];
        return (comunidad.centrosPobladosSeleccionados || []).filter(
          (codigo: string) => codigo && codigo.trim() !== ''
        );
      }

      return [];
    } catch (error) {
      this.logger.error('Error al obtener códigos activos', error);
      return [];
    }
  }

  actualizarCodigosActivos(comunidadId: string, codigos: string[]): void {
    try {
      const prefijo = this.obtenerPrefijoDeComunidadId(comunidadId);
      if (!prefijo) {
        return;
      }

      const codigosLimpios = codigos
        .map(c => c?.toString().trim())
        .filter(c => c && c !== '');

      this.formularioService.guardarFilasActivasTablaAISD2(codigosLimpios, prefijo);
      
      this.sincronizarConSeccion2(comunidadId, codigosLimpios);
      
      this.logger.info(`Códigos activos actualizados para ${comunidadId}:`, codigosLimpios);
    } catch (error) {
      this.logger.error('Error al actualizar códigos activos', error);
    }
  }

  sincronizarConSeccion2(comunidadId: string, codigos: string[]): void {
    try {
      const datos = this.formularioService.obtenerDatos();
      const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
      const indiceComunidad = this.obtenerIndiceComunidad(comunidadId);
      
      if (indiceComunidad >= 0 && indiceComunidad < comunidadesCampesinas.length) {
        const nuevasComunidades = comunidadesCampesinas.map((cc: any, index: number) => {
          if (index === indiceComunidad) {
            return {
              ...cc,
              centrosPobladosSeleccionados: [...codigos]
            };
          }
          return cc;
        });
        
        this.formularioService.actualizarDato('comunidadesCampesinas', nuevasComunidades);
        this.logger.info(`Sincronizado con Sección 2: ${codigos.length} centros poblados`);
      }
    } catch (error) {
      this.logger.error('Error al sincronizar con Sección 2', error);
    }
  }

  obtenerIndiceComunidad(comunidadId: string): number {
    if (comunidadId.startsWith('cc_') || comunidadId.startsWith('cc_default_')) {
      const datos = this.formularioService.obtenerDatos();
      const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
      
      if (comunidadId === 'cc_legacy') {
        return 0;
      }
      
      const indice = comunidadesCampesinas.findIndex(
        (cc: any) => cc.id === comunidadId
      );
      
      return indice >= 0 ? indice : 0;
    }
    
    const match = comunidadId.match(/^A(\d+)$/);
    if (match) {
      return parseInt(match[1]) - 1;
    }
    
    return 0;
  }

  obtenerPrefijoDeComunidadId(comunidadId: string): string {
    const indice = this.obtenerIndiceComunidad(comunidadId);
    return `_A${indice + 1}`;
  }

  obtenerComunidadIdDePrefijo(prefijo: string): string {
    const match = prefijo.match(/_A(\d+)/);
    if (match) {
      const indice = parseInt(match[1]) - 1;
      const datos = this.formularioService.obtenerDatos();
      const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
      
      if (indice >= 0 && indice < comunidadesCampesinas.length) {
        return comunidadesCampesinas[indice].id || `A${indice + 1}`;
      }
      
      return `A${indice + 1}`;
    }
    return '';
  }

  obtenerCodigosActivosPorPrefijo(prefijo: string): string[] {
    const comunidadId = this.obtenerComunidadIdDePrefijo(prefijo);
    return this.obtenerCodigosActivos(comunidadId);
  }

  filtrarDatosPorCodigosActivos<T extends { codigo?: string | number; CODIGO?: string | number }>(
    datos: T[],
    prefijo: string
  ): T[] {
    const codigosActivos = this.obtenerCodigosActivosPorPrefijo(prefijo);
    
    if (codigosActivos.length === 0) {
      return datos;
    }
    
    const codigosSet = new Set(codigosActivos.map(c => c.toString().trim()));
    
    return datos.filter(item => {
      const codigo = (item.codigo || item.CODIGO)?.toString().trim() || '';
      return codigo && codigosSet.has(codigo);
    });
  }

  obtenerTotalCentrosPobladosActivos(prefijo: string): number {
    const codigosActivos = this.obtenerCodigosActivosPorPrefijo(prefijo);
    return codigosActivos.length;
  }

  estaCentroPobladoActivo(codigo: string, prefijo: string): boolean {
    const codigosActivos = this.obtenerCodigosActivosPorPrefijo(prefijo);
    const codigoLimpio = codigo?.toString().trim() || '';
    return codigosActivos.includes(codigoLimpio);
  }
}
