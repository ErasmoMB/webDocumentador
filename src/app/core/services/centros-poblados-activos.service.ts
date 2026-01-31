import { Injectable } from '@angular/core';
import { ProjectStateFacade } from '../state/project-state.facade';
import { LoggerService } from './infrastructure/logger.service';
import { FormChangeService } from './state/form-change.service';

/**
 * CentrosPobladosActivosService - Servicio para manejo de centros poblados activos
 * 
 * ✅ FASE 4: Migrado a usar solo ProjectStateFacade (eliminada dependencia de LegacyDocumentSnapshotService)
 */
@Injectable({
  providedIn: 'root'
})
export class CentrosPobladosActivosService {
  private readonly STORAGE_KEY = 'centros_poblados_activos';
  private readonly SECTION_ID_SECCION2 = '3.1.2';

  constructor(
    private projectFacade: ProjectStateFacade,
    private logger: LoggerService,
    private formChange: FormChangeService
  ) {}

  private getDatos(): any {
    return this.projectFacade.obtenerDatos();
  }

  obtenerCodigosActivos(comunidadId: string): string[] {
    try {
      const prefijo = this.obtenerPrefijoDeComunidadId(comunidadId);
      if (!prefijo) {
        return [];
      }

      if (prefijo.startsWith('_A')) {
        // Obtener filas activas desde ProjectStateFacade
        const datos = this.getDatos();
        const fieldName = `filasActivasTablaAISD2${prefijo}`;
        const filasActivas = datos[fieldName] || [];
        
        if (filasActivas.length > 0) {
          return filasActivas;
        }

        const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
        const indiceComunidad = this.obtenerIndiceComunidad(comunidadId);
        
        if (indiceComunidad >= 0 && indiceComunidad < comunidadesCampesinas.length) {
          const comunidad = comunidadesCampesinas[indiceComunidad];
          return (comunidad.centrosPobladosSeleccionados || []).filter(
            (codigo: string) => codigo && codigo.trim() !== ''
          );
        }
      } else if (prefijo.startsWith('_B')) {
        const datos = this.getDatos();
        const distritos = datos['distritos'] || [];
        const match = comunidadId.match(/^B(\d+)$/);
        const indice = match ? parseInt(match[1]) - 1 : 0;
        
        if (indice >= 0 && indice < distritos.length) {
          const distrito = distritos[indice];
          return (distrito.centrosPobladosSeleccionados || []).filter(
            (codigo: string) => codigo && codigo.trim() !== ''
          );
        }
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

      // Guardar usando ProjectStateFacade
      const fieldName = `filasActivasTablaAISD2${prefijo}`;
      this.projectFacade.setField(this.SECTION_ID_SECCION2, null, fieldName, codigosLimpios);
      
      this.sincronizarConSeccion2(comunidadId, codigosLimpios);
      
      this.logger.info(`Códigos activos actualizados para ${comunidadId}:`, codigosLimpios);
    } catch (error) {
      this.logger.error('Error al actualizar códigos activos', error);
    }
  }

  sincronizarConSeccion2(comunidadId: string, codigos: string[]): void {
    try {
      const datos = this.getDatos();
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
        
        this.formChange.persistFields(this.SECTION_ID_SECCION2, 'form', { ['comunidadesCampesinas']: nuevasComunidades });
        this.logger.info(`Sincronizado con Sección 2: ${codigos.length} centros poblados`);
      }
    } catch (error) {
      this.logger.error('Error al sincronizar con Sección 2', error);
    }
  }


  obtenerIndiceComunidad(comunidadId: string): number {
    if (comunidadId.startsWith('cc_') || comunidadId.startsWith('cc_default_')) {
      const datos = this.getDatos();
      const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
      
      if (comunidadId === 'cc_legacy') {
        return 0;
      }
      
      const indice = comunidadesCampesinas.findIndex(
        (cc: any) => cc.id === comunidadId
      );
      
      return indice >= 0 ? indice : 0;
    }
    
    const matchA = comunidadId.match(/^A(\d+)$/);
    if (matchA) {
      return parseInt(matchA[1]) - 1;
    }
    
    const matchB = comunidadId.match(/^B(\d+)$/);
    if (matchB) {
      return parseInt(matchB[1]) - 1;
    }
    
    return 0;
  }

  obtenerPrefijoDeComunidadId(comunidadId: string): string {
    const indice = this.obtenerIndiceComunidad(comunidadId);
    
    if (comunidadId.startsWith('B') || comunidadId.match(/^B\d+$/)) {
      return `_B${indice + 1}`;
    }
    
    return `_A${indice + 1}`;
  }

  obtenerComunidadIdDePrefijo(prefijo: string): string {
    const matchA = prefijo.match(/_A(\d+)/);
    if (matchA) {
      const indice = parseInt(matchA[1]) - 1;
      const datos = this.getDatos();
      const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
      
      if (indice >= 0 && indice < comunidadesCampesinas.length) {
        return comunidadesCampesinas[indice].id || `A${indice + 1}`;
      }
      
      return `A${indice + 1}`;
    }
    
    const matchB = prefijo.match(/_B(\d+)/);
    if (matchB) {
      const indice = parseInt(matchB[1]) - 1;
      const datos = this.getDatos();
      const distritos = datos['distritos'] || [];
      
      if (indice >= 0 && indice < distritos.length) {
        return distritos[indice].id || `B${indice + 1}`;
      }
      
      return `B${indice + 1}`;
    }
    
    return '';
  }

  obtenerCodigosActivosPorPrefijo(prefijo: string): string[] {
    if (prefijo.startsWith('_B')) {
      const match = prefijo.match(/_B(\d+)/);
      if (match) {
        const indice = parseInt(match[1]) - 1;
        const datos = this.getDatos();
        const distritos = datos['distritos'] || [];
        
        if (indice >= 0 && indice < distritos.length) {
          const distrito = distritos[indice];
          return (distrito.centrosPobladosSeleccionados || []).filter(
            (codigo: string) => codigo && codigo.trim() !== ''
          );
        }
      }
    }
    
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
