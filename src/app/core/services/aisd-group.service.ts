import { Injectable, inject } from '@angular/core';
import { ProjectStateFacade } from '../state/project-state.facade';
import { GroupDefinition, CCPPEntry } from '../state/project-state.model';
import { PrefijoHelper } from '../../shared/utils/prefijo-helper';

/**
 * AISDGroupService
 * 
 * Servicio dedicado para manejar la lógica de grupos AISD y sus centros poblados.
 * Proporciona métodos claros para:
 * - Identificar a qué grupo AISD pertenece una sección
 * - Obtener los centros poblados del grupo actual
 * - Obtener nombres de centros poblados para autocompletar
 * 
 * USO:
 * const aisdService = inject(AISDGroupService);
 * const centrosPoblados = aisdService.getCentrosPobladosDelGrupoActual('3.1.4.A.1');
 * const nombresCP = aisdService.getNombresCentrosPoblados('3.1.4.A.1');
 */
@Injectable({ providedIn: 'root' })
export class AISDGroupService {
  private readonly projectFacade = inject(ProjectStateFacade);

  /**
   * Obtiene todos los grupos AISD disponibles
   */
  private getAisdGroups(): readonly GroupDefinition[] {
    return this.projectFacade.groupsByType('AISD')();
  }

  /**
   * Obtiene todos los centros poblados registrados
   */
  private getAllPopulatedCenters(): readonly CCPPEntry[] {
    return this.projectFacade.allPopulatedCenters()();
  }

  /**
   * Obtiene el prefijo del grupo AISD desde el seccionId
   * Ej: '3.1.4.A.1' → '_A1'
   */
  obtenerPrefijoAISD(seccionId: string): string {
    return PrefijoHelper.obtenerPrefijoGrupo(seccionId);
  }

  /**
   * Verifica si una sección pertenece a un grupo AISD
   */
  esSeccionAISD(seccionId: string): boolean {
    const prefijo = this.obtenerPrefijoAISD(seccionId);
    return prefijo.startsWith('_A');
  }

  /**
   * Obtiene el índice del grupo AISD desde el seccionId
   * Ej: '_A1' → 0, '_A3' → 2
   */
  obtenerIndiceGrupoAISD(seccionId: string): number | null {
    const prefijo = this.obtenerPrefijoAISD(seccionId);
    if (!prefijo.startsWith('_A')) return null;
    
    const match = prefijo.match(/_A(\d+)/);
    if (!match) return null;
    
    return parseInt(match[1], 10) - 1; // _A1 → índice 0
  }

  /**
   * Obtiene la definición del grupo AISD actual para una sección
   * Devuelve null si no es una sección AISD
   */
  obtenerGrupoActual(seccionId: string): GroupDefinition | null {
    const indice = this.obtenerIndiceGrupoAISD(seccionId);
    if (indice === null) return null;
    
    const grupos = this.getAisdGroups();
    if (indice < 0 || indice >= grupos.length) return null;
    
    return grupos[indice];
  }

  /**
   * Obtiene el nombre del grupo AISD actual
   * Ej: '3.1.4.A.1' → 'CAHUACHO' (nombre del grupo A.1)
   */
  obtenerNombreGrupoActual(seccionId: string): string {
    const grupo = this.obtenerGrupoActual(seccionId);
    return grupo?.nombre || '____';
  }

  /**
   * Obtiene los códigos de centros poblados del grupo AISD actual
   * Ej: '3.1.4.A.1' → ['0214090010', '0214090059', ...]
   */
  obtenerCodigosCentrosPoblados(seccionId: string): readonly string[] {
    const grupo = this.obtenerGrupoActual(seccionId);
    return grupo?.ccppIds || [];
  }

  /**
   * Obtiene los centros poblados completos del grupo AISD actual
   * Incluye toda la información de cada centro poblado
   */
  obtenerCentrosPobladosDelGrupo(seccionId: string): readonly CCPPEntry[] {
    const codigos = this.obtenerCodigosCentrosPoblados(seccionId);
    if (codigos.length === 0) return [];
    
    const todosCentros = this.getAllPopulatedCenters();
    return codigos
      .map(codigo => todosCentros.find(cp => cp.codigo === codigo))
      .filter((cp): cp is CCPPEntry => cp !== undefined);
  }

  /**
   * Obtiene solo los nombres de los centros poblados del grupo AISD actual
   * Útil para autocompletar y dropdowns
   * Ej: ['CAHUACHO', 'SONDOR', 'PAUCARAY', ...]
   */
  obtenerNombresCentrosPoblados(seccionId: string): readonly string[] {
    const centros = this.obtenerCentrosPobladosDelGrupo(seccionId);
    return centros.map(cp => cp.nombre);
  }

  /**
   * Obtiene un mapa de código → nombre para los centros poblados del grupo actual
   * Útil para llenar campos con el nombre dado un código
   */
  obtenerMapaCodigoNombre(seccionId: string): Map<string, string> {
    const centros = this.obtenerCentrosPobladosDelGrupo(seccionId);
    const mapa = new Map<string, string>();
    centros.forEach(cp => mapa.set(String(cp.codigo), cp.nombre));
    return mapa;
  }

  /**
   * Obtiene un mapa de nombre → código para los centros poblados del grupo actual
   * Útil para autocompletar cuando se selecciona por nombre
   */
  obtenerMapaNombreCodigo(seccionId: string): Map<string, string> {
    const centros = this.obtenerCentrosPobladosDelGrupo(seccionId);
    const mapa = new Map<string, string>();
    centros.forEach(cp => mapa.set(cp.nombre, String(cp.codigo)));
    return mapa;
  }

  /**
   * Obtiene el nombre de un centro poblado dado su código
   */
  obtenerNombrePorCodigo(seccionId: string, codigo: string): string | null {
    const mapa = this.obtenerMapaCodigoNombre(seccionId);
    return mapa.get(codigo) || null;
  }

  /**
   * Obtiene el código de un centro poblado dado su nombre
   */
  obtenerCodigoPorNombre(seccionId: string, nombre: string): string | null {
    const mapa = this.obtenerMapaNombreCodigo(seccionId);
    return mapa.get(nombre) || null;
  }

  /**
   * Obtiene la información completa de un centro poblado dado su código
   */
  obtenerCentroPobladoPorCodigo(seccionId: string, codigo: string): CCPPEntry | null {
    const centros = this.obtenerCentrosPobladosDelGrupo(seccionId);
    return centros.find(cp => cp.codigo === codigo) || null;
  }

  /**
   * Verifica si un código de centro poblado pertenece al grupo AISD actual
   */
  perteneceAlGrupoActual(seccionId: string, codigo: string): boolean {
    const codigos = this.obtenerCodigosCentrosPoblados(seccionId);
    return codigos.includes(codigo);
  }

  /**
   * Obtiene el grupo AISD por su ID
   * Ej: obtenerGrupoPorId('A.1') → GroupDefinition
   */
  obtenerGrupoPorId(groupId: string): GroupDefinition | null {
    const grupos = this.getAisdGroups();
    return grupos.find(g => g.id === groupId) || null;
  }

  /**
   * Obtiene los centros poblados de un grupo AISD específico por ID
   */
  obtenerCentrosPobladosPorGroupId(groupId: string): readonly CCPPEntry[] {
    const grupo = this.obtenerGrupoPorId(groupId);
    if (!grupo) return [];
    
    const todosCentros = this.getAllPopulatedCenters();
    return grupo.ccppIds
      .map(codigo => todosCentros.find(cp => cp.codigo === codigo))
      .filter((cp): cp is CCPPEntry => cp !== undefined);
  }

  /**
   * DEBUG: Obtiene información detallada del grupo AISD actual
   * Útil para depuración
   */
  obtenerInfoDebug(seccionId: string): object {
    const prefijo = this.obtenerPrefijoAISD(seccionId);
    const grupo = this.obtenerGrupoActual(seccionId);
    const centros = this.obtenerCentrosPobladosDelGrupo(seccionId);
    
    return {
      seccionId,
      prefijo,
      esSeccionAISD: this.esSeccionAISD(seccionId),
      grupo: grupo ? {
        id: grupo.id,
        nombre: grupo.nombre,
        ccppCount: grupo.ccppIds.length
      } : null,
      centrosPoblados: {
        count: centros.length,
        codigos: centros.map(cp => cp.codigo),
        nombres: centros.map(cp => cp.nombre)
      }
    };
  }
}
