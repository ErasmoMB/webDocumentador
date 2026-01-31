import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageFacade } from '../infrastructure/storage-facade.service';
import { 
  GrupoAISD, 
  GrupoAISI, 
  Grupo, 
  CentroPoblado, 
  ContextoGrupo,
  SECCIONES_AISD,
  SECCIONES_AISI 
} from '../../models/grupos.model';

/**
 * Servicio de gestión de grupos AISD/AISI
 * Maneja la configuración dinámica de comunidades campesinas y distritos
 * con sus centros poblados asociados
 */
@Injectable({
  providedIn: 'root'
})
export class GruposService {
  private readonly STORAGE_KEY_AISD = 'lbs_grupos_aisd';
  private readonly STORAGE_KEY_AISI = 'lbs_grupos_aisi';
  private readonly STORAGE_KEY_CCPP = 'lbs_centros_poblados';

  // Estado reactivo
  private gruposAISDSubject = new BehaviorSubject<GrupoAISD[]>([]);
  private gruposAISISubject = new BehaviorSubject<GrupoAISI[]>([]);
  private centrosPobladosSubject = new BehaviorSubject<CentroPoblado[]>([]);

  public gruposAISD$: Observable<GrupoAISD[]> = this.gruposAISDSubject.asObservable();
  public gruposAISI$: Observable<GrupoAISI[]> = this.gruposAISISubject.asObservable();
  public centrosPoblados$: Observable<CentroPoblado[]> = this.centrosPobladosSubject.asObservable();

  constructor(private storage: StorageFacade) {
    this.cargarDesdeStorage();
  }

  // ==================== GESTIÓN DE CENTROS POBLADOS ====================

  /**
   * Carga centros poblados desde JSON
   * Formato esperado: { "NOMBRE_GRUPO": [array de CCPP], ... }
   */
  cargarCentrosPobladosDesdeJSON(jsonData: any): void {
    try {
      const centrosPoblados: CentroPoblado[] = [];

      // Procesar cada grupo del JSON
      Object.keys(jsonData).forEach(key => {
        const datos = jsonData[key];
        if (Array.isArray(datos)) {
          datos.forEach((item: any) => {
            // Validar estructura mínima
            if (item.CCPP && item.UBIGEO) {
              centrosPoblados.push({
                ITEM: item.ITEM || 0,
                UBIGEO: item.UBIGEO,
                CODIGO: item.CODIGO || '',
                CCPP: item.CCPP,
                CATEGORIA: item.CATEGORIA || '',
                POBLACION: item.POBLACION || 0,
                DPTO: item.DPTO || '',
                PROV: item.PROV || '',
                DIST: item.DIST || '',
                ESTE: item.ESTE || 0,
                NORTE: item.NORTE || 0,
                ALTITUD: item.ALTITUD || 0
              });
            }
          });
        }
      });

      this.centrosPobladosSubject.next(centrosPoblados);
      this.guardarEnStorage(this.STORAGE_KEY_CCPP, centrosPoblados);
      
      // Logged: Centros poblados cargados: {centrosPoblados.length}
    } catch (error) {
      console.error('❌ Error al cargar centros poblados:', error);
      throw new Error('Formato de JSON inválido');
    }
  }

  /**
   * Obtiene todos los centros poblados disponibles
   */
  getCentrosPoblados(): CentroPoblado[] {
    return this.centrosPobladosSubject.value;
  }

  /**
   * Filtra centros poblados por criterio
   */
  filtrarCentrosPoblados(filtro: Partial<CentroPoblado>): CentroPoblado[] {
    const todos = this.getCentrosPoblados();
    return todos.filter(ccpp => {
      return Object.keys(filtro).every(key => {
        const filterValue = (filtro as any)[key];
        const ccppValue = (ccpp as any)[key];
        return filterValue === undefined || ccppValue === filterValue;
      });
    });
  }

  // ==================== GESTIÓN DE GRUPOS AISD ====================

  /**
   * Crea un nuevo grupo AISD (Comunidad Campesina)
   */
  crearGrupoAISD(nombre: string, centrosPoblados: CentroPoblado[] = []): GrupoAISD {
    const grupos = this.gruposAISDSubject.value;
    const nuevoOrden = grupos.length + 1;

    const nuevoGrupo: GrupoAISD = {
      id: this.generarId(),
      nombre,
      tipo: 'AISD',
      orden: nuevoOrden,
      centrosPoblados,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const nuevosGrupos = [...grupos, nuevoGrupo];
    this.gruposAISDSubject.next(nuevosGrupos);
    this.guardarEnStorage(this.STORAGE_KEY_AISD, nuevosGrupos);

    // Logged: Grupo AISD creado: A.{nuevoOrden} - {nombre}
    return nuevoGrupo;
  }

  /**
   * Actualiza un grupo AISD existente
   */
  actualizarGrupoAISD(id: string, cambios: Partial<GrupoAISD>): void {
    const grupos = this.gruposAISDSubject.value;
    const index = grupos.findIndex(g => g.id === id);

    if (index !== -1) {
      grupos[index] = {
        ...grupos[index],
        ...cambios,
        updatedAt: new Date()
      };
      this.gruposAISDSubject.next([...grupos]);
      this.guardarEnStorage(this.STORAGE_KEY_AISD, grupos);
      // Logged: Grupo AISD actualizado: {grupos[index].nombre}
    }
  }

  /**
   * Elimina un grupo AISD y reordena los restantes
   */
  eliminarGrupoAISD(id: string): void {
    let grupos = this.gruposAISDSubject.value.filter(g => g.id !== id);
    
    // Reordenar
    grupos = grupos.map((g, index) => ({ ...g, orden: index + 1 }));
    
    this.gruposAISDSubject.next(grupos);
    this.guardarEnStorage(this.STORAGE_KEY_AISD, grupos);
    // Logged: Grupo AISD eliminado. Total grupos: {grupos.length}
  }

  /**
   * Obtiene todos los grupos AISD
   */
  getGruposAISD(): GrupoAISD[] {
    return this.gruposAISDSubject.value;
  }

  /**
   * Obtiene un grupo AISD por ID
   */
  getGrupoAISDPorId(id: string): GrupoAISD | undefined {
    return this.gruposAISDSubject.value.find(g => g.id === id);
  }

  // ==================== GESTIÓN DE GRUPOS AISI ====================

  /**
   * Crea un nuevo grupo AISI (Distrito)
   */
  crearGrupoAISI(nombre: string, centrosPoblados: CentroPoblado[] = []): GrupoAISI {
    const grupos = this.gruposAISISubject.value;
    const nuevoOrden = grupos.length + 1;

    const nuevoGrupo: GrupoAISI = {
      id: this.generarId(),
      nombre,
      tipo: 'AISI',
      orden: nuevoOrden,
      centrosPoblados,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const nuevosGrupos = [...grupos, nuevoGrupo];
    this.gruposAISISubject.next(nuevosGrupos);
    this.guardarEnStorage(this.STORAGE_KEY_AISI, nuevosGrupos);

    // Logged: Grupo AISI creado: B.{nuevoOrden} - {nombre}
    return nuevoGrupo;
  }

  /**
   * Actualiza un grupo AISI existente
   */
  actualizarGrupoAISI(id: string, cambios: Partial<GrupoAISI>): void {
    const grupos = this.gruposAISISubject.value;
    const index = grupos.findIndex(g => g.id === id);

    if (index !== -1) {
      grupos[index] = {
        ...grupos[index],
        ...cambios,
        updatedAt: new Date()
      };
      this.gruposAISISubject.next([...grupos]);
      this.guardarEnStorage(this.STORAGE_KEY_AISI, grupos);
      // Logged: Grupo AISI actualizado: {grupos[index].nombre}
    }
  }

  /**
   * Elimina un grupo AISI y reordena los restantes
   */
  eliminarGrupoAISI(id: string): void {
    let grupos = this.gruposAISISubject.value.filter(g => g.id !== id);
    
    // Reordenar
    grupos = grupos.map((g, index) => ({ ...g, orden: index + 1 }));
    
    this.gruposAISISubject.next(grupos);
    this.guardarEnStorage(this.STORAGE_KEY_AISI, grupos);
    // Logged: Grupo AISI eliminado. Total grupos: {grupos.length}
  }

  /**
   * Obtiene todos los grupos AISI
   */
  getGruposAISI(): GrupoAISI[] {
    return this.gruposAISISubject.value;
  }

  /**
   * Obtiene un grupo AISI por ID
   */
  getGrupoAISIPorId(id: string): GrupoAISI | undefined {
    return this.gruposAISISubject.value.find(g => g.id === id);
  }

  // ==================== GENERACIÓN DE CONTEXTO ====================

  /**
   * Genera contexto para una subsección AISD
   * @param grupoId ID del grupo AISD
   * @param numeroSeccion Número de sección (4-20)
   */
  generarContextoAISD(grupoId: string, numeroSeccion: number): ContextoGrupo | null {
    const grupo = this.getGrupoAISDPorId(grupoId);
    if (!grupo) return null;

    const configSeccion = SECCIONES_AISD.find(s => s.numero === numeroSeccion);
    if (!configSeccion) return null;

    const seccionNumero = `A.${grupo.orden}.${configSeccion.subseccion}`;

    return {
      grupoTipo: 'AISD',
      grupoId: grupo.id,
      grupoNombre: grupo.nombre,
      grupoOrden: grupo.orden,
      seccionNumero,
      seccionTitulo: configSeccion.titulo,
      centrosPoblados: grupo.centrosPoblados
    };
  }

  /**
   * Genera contexto para una subsección AISI
   * @param grupoId ID del grupo AISI
   * @param numeroSeccion Número de sección (21-30)
   */
  generarContextoAISI(grupoId: string, numeroSeccion: number): ContextoGrupo | null {
    const grupo = this.getGrupoAISIPorId(grupoId);
    if (!grupo) return null;

    const configSeccion = SECCIONES_AISI.find(s => s.numero === numeroSeccion);
    if (!configSeccion) return null;

    const seccionNumero = `B.${grupo.orden}.${configSeccion.subseccion}`;

    return {
      grupoTipo: 'AISI',
      grupoId: grupo.id,
      grupoNombre: grupo.nombre,
      grupoOrden: grupo.orden,
      seccionNumero,
      seccionTitulo: configSeccion.titulo,
      centrosPoblados: grupo.centrosPoblados
    };
  }

  /**
   * Genera todos los contextos para todas las subsecciones de un grupo AISD
   */
  generarTodosContextosAISD(grupoId: string): ContextoGrupo[] {
    return SECCIONES_AISD
      .map(s => this.generarContextoAISD(grupoId, s.numero))
      .filter(c => c !== null) as ContextoGrupo[];
  }

  /**
   * Genera todos los contextos para todas las subsecciones de un grupo AISI
   */
  generarTodosContextosAISI(grupoId: string): ContextoGrupo[] {
    return SECCIONES_AISI
      .map(s => this.generarContextoAISI(grupoId, s.numero))
      .filter(c => c !== null) as ContextoGrupo[];
  }

  // ==================== UTILIDADES ====================

  /**
   * Limpia todos los datos
   */
  limpiarTodo(): void {
    this.gruposAISDSubject.next([]);
    this.gruposAISISubject.next([]);
    this.centrosPobladosSubject.next([]);
    
    this.storage.removeItem(this.STORAGE_KEY_AISD);
    this.storage.removeItem(this.STORAGE_KEY_AISI);
    this.storage.removeItem(this.STORAGE_KEY_CCPP);
    
    // Logged: Todos los datos de grupos han sido eliminados
  }

  /**
   * Exporta configuración completa a JSON
   */
  exportarConfiguracion(): string {
    return JSON.stringify({
      centrosPoblados: this.centrosPobladosSubject.value,
      gruposAISD: this.gruposAISDSubject.value,
      gruposAISI: this.gruposAISISubject.value,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Importa configuración completa desde JSON
   */
  importarConfiguracion(jsonString: string): void {
    try {
      const config = JSON.parse(jsonString);
      
      if (config.centrosPoblados) {
        this.centrosPobladosSubject.next(config.centrosPoblados);
        this.guardarEnStorage(this.STORAGE_KEY_CCPP, config.centrosPoblados);
      }
      
      if (config.gruposAISD) {
        this.gruposAISDSubject.next(config.gruposAISD);
        this.guardarEnStorage(this.STORAGE_KEY_AISD, config.gruposAISD);
      }
      
      if (config.gruposAISI) {
        this.gruposAISISubject.next(config.gruposAISI);
        this.guardarEnStorage(this.STORAGE_KEY_AISI, config.gruposAISI);
      }
      
      // Logged: Configuración importada correctamente
    } catch (error) {
      console.error('❌ Error al importar configuración:', error);
      throw new Error('JSON de configuración inválido');
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private cargarDesdeStorage(): void {
    const aisd = this.leerDesdeStorage<GrupoAISD[]>(this.STORAGE_KEY_AISD, []);
    const aisi = this.leerDesdeStorage<GrupoAISI[]>(this.STORAGE_KEY_AISI, []);
    const ccpp = this.leerDesdeStorage<CentroPoblado[]>(this.STORAGE_KEY_CCPP, []);

    if (aisd.length > 0) this.gruposAISDSubject.next(aisd);
    if (aisi.length > 0) this.gruposAISISubject.next(aisi);
    if (ccpp.length > 0) this.centrosPobladosSubject.next(ccpp);
  }

  private guardarEnStorage(key: string, data: any): void {
    try {
      this.storage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  private leerDesdeStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = this.storage.getItem(key);
      return data ? (JSON.parse(data) as T) : defaultValue;
    } catch (error) {
      console.error('Error al leer desde localStorage:', error);
      return defaultValue;
    }
  }

  private generarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
