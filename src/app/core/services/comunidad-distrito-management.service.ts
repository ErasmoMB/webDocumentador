import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ComunidadCampesina, Distrito } from 'src/app/core/models/formulario.model';
import { ProjectStateFacade } from '../state/project-state.facade';
import { ReactiveStateAdapter } from './state-adapters/reactive-state-adapter.service';
import { GroupConfigService } from './group-config.service';
import { CentrosPobladosActivosService } from './centros-poblados-activos.service';
import { Grupo } from '../models/group-config.model';
import { FormChangeService } from './state/form-change.service';

/**
 * Servicio especializado para gestión de comunidades campesinas y distritos AISI
 * Centraliza toda la lógica de negocio relacionada con estas entidades
 * 
 * ✅ FASE 4: Migrado a usar solo ProjectStateFacade
 */
@Injectable({ providedIn: 'root' })
export class ComunidadDistritoManagementService {
  private comunidadesSubject = new BehaviorSubject<ComunidadCampesina[]>([]);
  private distritosSubject = new BehaviorSubject<Distrito[]>([]);

  private readonly SECTION_ID = '3.1.2';

  comunidades$ = this.comunidadesSubject.asObservable();
  distritos$ = this.distritosSubject.asObservable();

  constructor(
    private projectFacade: ProjectStateFacade,
    private formChange: FormChangeService,
    private stateAdapter: ReactiveStateAdapter,
    private groupConfig: GroupConfigService,
    private centrosPobladosActivos: CentrosPobladosActivosService
  ) {}

  private getDatos(): any {
    return this.projectFacade.obtenerDatos();
  }

  /**
   * Inicializa las comunidades desde los datos
   */
  inicializarComunidades(datos: any): ComunidadCampesina[] {
    const comunidadesGuardadas = datos['comunidadesCampesinas'] || [];
    const comunidades = comunidadesGuardadas.map((cc: ComunidadCampesina) => ({
      ...cc,
      centrosPobladosSeleccionados: (cc.centrosPobladosSeleccionados || [])
        .map((c: any) => {
          if (c === null || c === undefined) return '';
          return c.toString().trim();
        })
        .filter((codigo: string) => codigo !== '')
    }));
    
    this.comunidadesSubject.next(comunidades);
    return comunidades;
  }

  /**
   * Inicializa los distritos desde los datos
   */
  inicializarDistritos(datos: any): Distrito[] {
    const distritosGuardados = datos['distritosAISI'] || [];
    const distritos = distritosGuardados.map((d: Distrito) => ({
      ...d,
      nombreOriginal: d.nombreOriginal || d.nombre,
      centrosPobladosSeleccionados: (d.centrosPobladosSeleccionados || [])
        .map((c: any) => {
          if (c === null || c === undefined) return '';
          return c.toString().trim();
        })
        .filter((codigo: string) => codigo !== '')
    }));
    
    this.distritosSubject.next(distritos);
    return distritos;
  }

  /**
   * Obtiene las comunidades actuales
   */
  obtenerComunidades(): ComunidadCampesina[] {
    return this.comunidadesSubject.value;
  }

  /**
   * Obtiene los distritos actuales
   */
  obtenerDistritos(): Distrito[] {
    return this.distritosSubject.value;
  }

  /**
   * Actualiza el nombre de una comunidad
   */
  actualizarNombreComunidad(
    id: string,
    nombre: string,
    comunidades: ComunidadCampesina[]
  ): ComunidadCampesina[] {
    const nombreLimpio = (nombre || '').trim();
    const indice = comunidades.findIndex(cc => cc.id === id);
    const nombreAnterior = indice >= 0 ? comunidades[indice]?.nombre : '';
    
    // Si el nombre no cambió, retornar sin cambios
    if (nombreLimpio === nombreAnterior) {
      return comunidades;
    }
    
    const comunidadesActualizadas = comunidades.map(cc => {
      if (cc.id === id) {
        return {
          ...cc,
          nombre: nombreLimpio,
          esNueva: !nombreLimpio ? cc.esNueva : false
        };
      }
      return cc;
    });
    
    // Actualizar estado
    this.comunidadesSubject.next([...comunidadesActualizadas]);
    
    // Persistir
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { comunidadesCampesinas: comunidadesActualizadas }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISD(comunidadesActualizadas);
    
    return comunidadesActualizadas;
  }

  /**
   * Actualiza el nombre de un distrito
   */
  actualizarNombreDistrito(
    id: string,
    nombre: string,
    distritos: Distrito[]
  ): Distrito[] {
    const indice = distritos.findIndex(d => d.id === id);
    const distritosActualizados = distritos.map(d => {
      if (d.id === id) {
        const nombreOriginal = !d.nombreOriginal || d.nombreOriginal.trim() === '' 
          ? (d.nombre && d.nombre.trim() !== '' ? d.nombre : nombre)
          : d.nombreOriginal;
        
        return {
          ...d,
          nombreOriginal: nombreOriginal,
          nombre: nombre,
          esNuevo: !nombre || nombre.trim() === '' ? d.esNuevo : false
        };
      }
      return d;
    });
    
    // Actualizar estado
    this.distritosSubject.next([...distritosActualizados]);
    
    // Persistir
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { distritosAISI: distritosActualizados }
    );
    
    // Si es el primer distrito, actualizar centroPobladoAISI
    const indiceDistrito = distritosActualizados.findIndex(d => d.id === id);
    if (indiceDistrito === 0 || distritosActualizados.length === 1) {
      this.formChange.persistFields(
        this.SECTION_ID,
        'default',
        { centroPobladoAISI: nombre }
      );
    }
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISI(distritosActualizados);
    
    this.stateAdapter.setDatos(this.getDatos());
    
    return distritosActualizados;
  }

  /**
   * Agrega una nueva comunidad
   */
  agregarComunidad(comunidades: ComunidadCampesina[]): ComunidadCampesina[] {
    const nuevaComunidad: ComunidadCampesina = {
      id: `cc_${Date.now()}`,
      nombre: '',
      centrosPobladosSeleccionados: [],
      esNueva: true
    };
    
    const nuevasComunidades = [...comunidades, nuevaComunidad];
    this.comunidadesSubject.next(nuevasComunidades);
    
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { comunidadesCampesinas: nuevasComunidades }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    return nuevasComunidades;
  }

  /**
   * Elimina una comunidad
   */
  eliminarComunidad(id: string, comunidades: ComunidadCampesina[]): ComunidadCampesina[] {
    if (comunidades.length <= 1) {
      return comunidades; // No permitir eliminar la última
    }
    
    const nuevasComunidades = comunidades.filter(cc => cc.id !== id);
    this.comunidadesSubject.next(nuevasComunidades);
    
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { comunidadesCampesinas: nuevasComunidades }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISD(nuevasComunidades);
    
    return nuevasComunidades;
  }

  /**
   * Agrega un nuevo distrito
   */
  agregarDistrito(distritos: Distrito[], todosLosCodigos: string[]): Distrito[] {
    const nuevoDistrito: Distrito = {
      id: `dist_${Date.now()}_${Math.random()}`,
      nombre: '',
      nombreOriginal: '',
      centrosPobladosSeleccionados: todosLosCodigos
    };
    
    const nuevosDistritos = [...distritos, nuevoDistrito];
    this.distritosSubject.next(nuevosDistritos);
    
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { distritosAISI: nuevosDistritos }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISI(nuevosDistritos);
    
    return nuevosDistritos;
  }

  /**
   * Elimina un distrito
   */
  eliminarDistrito(id: string, distritos: Distrito[]): Distrito[] {
    const nuevosDistritos = distritos.filter(d => d.id !== id);
    this.distritosSubject.next(nuevosDistritos);
    
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { distritosAISI: nuevosDistritos }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISI(nuevosDistritos);
    
    return nuevosDistritos;
  }

  /**
   * Toggle de centro poblado para una comunidad
   */
  toggleCentroPobladoComunidad(
    id: string,
    codigo: string,
    comunidades: ComunidadCampesina[]
  ): { comunidades: ComunidadCampesina[], codigos: string[] } {
    const comunidad = comunidades.find(cc => cc.id === id);
    if (!comunidad) {
      return { comunidades, codigos: [] };
    }

    const codigoNormalizado = (codigo || '').toString().trim();
    if (!codigoNormalizado) {
      return { comunidades, codigos: comunidad.centrosPobladosSeleccionados || [] };
    }

    const centrosActuales = comunidad.centrosPobladosSeleccionados || [];
    const yaSeleccionado = centrosActuales.some(c => c.toString().trim() === codigoNormalizado);
    
    const nuevosCodigos = yaSeleccionado
      ? centrosActuales.filter((c: string) => c.toString().trim() !== codigoNormalizado)
      : [...centrosActuales, codigoNormalizado];

    const comunidadesActualizadas = comunidades.map(cc => 
      cc.id === id 
        ? { ...cc, centrosPobladosSeleccionados: nuevosCodigos }
        : cc
    );
    
    this.comunidadesSubject.next([...comunidadesActualizadas]);
    
    // Actualizar prefijo si corresponde
    const indice = comunidadesActualizadas.findIndex(cc => cc.id === id);
    if (indice >= 0) {
      const prefijo = `_A${indice + 1}`;
      this.centrosPobladosActivos.actualizarCodigosActivos(id, nuevosCodigos);
    }
    
    // Persistir
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { comunidadesCampesinas: comunidadesActualizadas }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISD(comunidadesActualizadas);
    
    return { comunidades: comunidadesActualizadas, codigos: nuevosCodigos };
  }

  /**
   * Toggle de centro poblado para un distrito
   */
  toggleCentroPobladoDistrito(
    id: string,
    codigo: string,
    distritos: Distrito[]
  ): { distritos: Distrito[], codigos: string[] } {
    const distrito = distritos.find(d => d.id === id);
    if (!distrito) {
      return { distritos, codigos: [] };
    }

    const codigoNormalizado = (codigo || '').toString().trim();
    if (!codigoNormalizado) {
      return { distritos, codigos: distrito.centrosPobladosSeleccionados || [] };
    }

    const centrosActuales = distrito.centrosPobladosSeleccionados || [];
    const yaSeleccionado = centrosActuales.some(c => c.toString().trim() === codigoNormalizado);
    
    const nuevosCodigos = yaSeleccionado
      ? centrosActuales.filter((c: string) => c.toString().trim() !== codigoNormalizado)
      : [...centrosActuales, codigoNormalizado];

    const distritosActualizados = distritos.map(d => 
      d.id === id 
        ? { ...d, centrosPobladosSeleccionados: nuevosCodigos }
        : d
    );
    
    this.distritosSubject.next([...distritosActualizados]);
    
    // Persistir
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { distritosAISI: distritosActualizados }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISI(distritosActualizados);
    
    return { distritos: distritosActualizados, codigos: nuevosCodigos };
  }

  /**
   * Selecciona todos los centros poblados para una comunidad
   */
  seleccionarTodosCentrosPobladosComunidad(
    id: string,
    codigos: string[],
    comunidades: ComunidadCampesina[]
  ): ComunidadCampesina[] {
    if (codigos.length === 0) {
      return comunidades;
    }

    const comunidadesActualizadas = comunidades.map(cc => 
      cc.id === id 
        ? { ...cc, centrosPobladosSeleccionados: [...codigos] }
        : cc
    );
    
    this.comunidadesSubject.next([...comunidadesActualizadas]);
    
    // Actualizar prefijo si corresponde
    const indice = comunidadesActualizadas.findIndex(cc => cc.id === id);
    if (indice >= 0) {
      const prefijo = `_A${indice + 1}`;
      this.centrosPobladosActivos.actualizarCodigosActivos(id, codigos);
    }
    
    // Persistir
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { comunidadesCampesinas: comunidadesActualizadas }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISD(comunidadesActualizadas);
    
    return comunidadesActualizadas;
  }

  /**
   * Deselecciona todos los centros poblados para una comunidad
   */
  deseleccionarTodosCentrosPobladosComunidad(
    id: string,
    comunidades: ComunidadCampesina[]
  ): ComunidadCampesina[] {
    const comunidadesActualizadas = comunidades.map(cc => 
      cc.id === id 
        ? { ...cc, centrosPobladosSeleccionados: [] }
        : cc
    );
    
    this.comunidadesSubject.next([...comunidadesActualizadas]);
    
    // Actualizar prefijo si corresponde
    const indice = comunidadesActualizadas.findIndex(cc => cc.id === id);
    if (indice >= 0) {
      const prefijo = `_A${indice + 1}`;
      this.centrosPobladosActivos.actualizarCodigosActivos(id, []);
    }
    
    // Persistir
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { comunidadesCampesinas: comunidadesActualizadas }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISD(comunidadesActualizadas);
    
    return comunidadesActualizadas;
  }

  /**
   * Selecciona todos los centros poblados para un distrito
   */
  seleccionarTodosCentrosPobladosDistrito(
    id: string,
    codigos: string[],
    distritos: Distrito[]
  ): Distrito[] {
    if (codigos.length === 0) {
      return distritos;
    }

    const distritosActualizados = distritos.map(d => 
      d.id === id 
        ? { ...d, centrosPobladosSeleccionados: [...codigos] }
        : d
    );
    
    this.distritosSubject.next([...distritosActualizados]);
    
    // Persistir
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { distritosAISI: distritosActualizados }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISI(distritosActualizados);
    
    return distritosActualizados;
  }

  /**
   * Deselecciona todos los centros poblados para un distrito
   */
  deseleccionarTodosCentrosPobladosDistrito(
    id: string,
    distritos: Distrito[]
  ): Distrito[] {
    const distritosActualizados = distritos.map(d => 
      d.id === id 
        ? { ...d, centrosPobladosSeleccionados: [] }
        : d
    );
    
    this.distritosSubject.next([...distritosActualizados]);
    
    // Persistir
    this.formChange.persistFields(
      this.SECTION_ID,
      'default',
      { distritosAISI: distritosActualizados }
    );
    this.stateAdapter.setDatos(this.getDatos());
    
    // Sincronizar con GroupConfigService
    this.sincronizarGrupoAISI(distritosActualizados);
    
    return distritosActualizados;
  }

  /**
   * Verifica si un centro poblado está seleccionado para una comunidad
   */
  estaCentroPobladoSeleccionadoComunidad(
    id: string,
    codigo: string,
    comunidades: ComunidadCampesina[]
  ): boolean {
    const comunidad = comunidades.find(cc => cc.id === id);
    if (!comunidad || !comunidad.centrosPobladosSeleccionados) {
      return false;
    }
    const codigoNormalizado = codigo?.toString().trim() || '';
    return comunidad.centrosPobladosSeleccionados.some(
      (c: string) => c?.toString().trim() === codigoNormalizado
    );
  }

  /**
   * Verifica si un centro poblado está seleccionado para un distrito
   */
  estaCentroPobladoSeleccionadoDistrito(
    id: string,
    codigo: string,
    distritos: Distrito[]
  ): boolean {
    const distrito = distritos.find(d => d.id === id);
    if (!distrito || !distrito.centrosPobladosSeleccionados) {
      return false;
    }
    const codigoNormalizado = codigo?.toString().trim() || '';
    return distrito.centrosPobladosSeleccionados.some(
      (c: string) => c?.toString().trim() === codigoNormalizado
    );
  }

  /**
   * Obtiene los códigos seleccionados de una comunidad
   */
  obtenerCentrosPobladosSeleccionadosComunidad(
    id: string,
    comunidades: ComunidadCampesina[]
  ): string[] {
    const comunidad = comunidades.find(cc => cc.id === id);
    return comunidad?.centrosPobladosSeleccionados || [];
  }

  /**
   * Sincroniza el grupo AISD con GroupConfigService
   */
  private sincronizarGrupoAISD(comunidades: ComunidadCampesina[]): void {
    const grupoAISD = this.construirGrupoAISD(comunidades);
    if (grupoAISD) {
      this.groupConfig.setAISD(grupoAISD);
    }
  }

  /**
   * Sincroniza el grupo AISI con GroupConfigService
   */
  private sincronizarGrupoAISI(distritos: Distrito[]): void {
    const grupoAISI = this.construirGrupoAISI(distritos);
    if (grupoAISI) {
      this.groupConfig.setAISI(grupoAISI);
    }
  }

  /**
   * Construye el objeto Grupo para AISD
   */
  private construirGrupoAISD(comunidades: ComunidadCampesina[]): Grupo | null {
    const comunidadesValidas = comunidades.filter(cc => cc.nombre && cc.nombre.trim() !== '');
    if (comunidadesValidas.length === 0) {
      return null;
    }

    const nombres = comunidadesValidas
      .map((comunidad, index) => {
        const nombreLimpio = comunidad.nombre?.trim();
        const numero = index + 1;
        return nombreLimpio ? `A.${numero} ${nombreLimpio}` : `A.${numero}`;
      })
      .filter(Boolean);

    if (nombres.length === 0) {
      return null;
    }

    const codigosActivos = this.unirCodigosSeleccionados(comunidadesValidas);

    return {
      nombre: nombres.join(' / '),
      tipo: 'AISD',
      ccppList: [],
      ccppActivos: codigosActivos
    };
  }

  /**
   * Construye el objeto Grupo para AISI
   */
  private construirGrupoAISI(distritos: Distrito[]): Grupo | null {
    if (distritos.length === 0) {
      return null;
    }

    const nombres = distritos
      .map((distrito, index) => {
        const nombreLimpio = distrito.nombre?.trim();
        const numero = index + 1;
        const sufijo = nombreLimpio ? ` ${nombreLimpio}` : '';
        return `B.${numero}${sufijo}`;
      })
      .filter(Boolean);

    if (nombres.length === 0) {
      return null;
    }

    const codigosActivos = this.unirCodigosSeleccionados(distritos);

    return {
      nombre: nombres.join(' / '),
      tipo: 'AISI',
      ccppList: [],
      ccppActivos: codigosActivos
    };
  }

  /**
   * Une los códigos seleccionados de múltiples entidades
   */
  private unirCodigosSeleccionados(entities: Array<ComunidadCampesina | Distrito>): string[] {
    const codigoSet = new Set<string>();
    entities.forEach(entity => {
      (entity.centrosPobladosSeleccionados || []).forEach(codigo => {
        const valor = codigo?.toString().trim();
        if (valor) {
          codigoSet.add(valor);
        }
      });
    });
    return Array.from(codigoSet);
  }
}
