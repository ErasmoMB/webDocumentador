/**
 * PROJECT STATE FACADE
 * 
 * Facade que actúa como PUENTE entre los componentes existentes y el nuevo Store.
 * 
 * PROPÓSITO:
 * - Permite migración GRADUAL de componentes
 * - Mantiene compatibilidad con API existente mientras se refactoriza
 * - Centraliza toda la lógica de acceso al estado
 * 
 * REGLAS DE MIGRACIÓN:
 * 1. Componentes NUEVOS → usan UIStoreService directamente
 * 2. Componentes EXISTENTES → migran gradualmente a este facade
 * 3. Una vez migrado → eliminar método del facade y usar UIStoreService
 * 
 * @deprecated Este facade es temporal. Migrar componentes a UIStoreService.
 */

import { Injectable, Signal, inject, computed, signal } from '@angular/core';
import { Observable, map, distinctUntilChanged } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { 
  UIStoreService, 
  Selectors, 
  Commands,
  ProjectInfo,
  GroupOption,
  SectionNavItem,
  FormField,
  GalleryImage,
  UbicacionInfo,
  Entrevistado
} from './ui-store.contract';
import { ProjectStateCommand, SectionContentCommand } from './commands.model';
import { ProjectState, GroupDefinition, CCPPEntry } from './project-state.model';

// Importar modelos y selectores de Fase 2
import { 
  SectionsContentState, 
  Section, 
  SectionContent,
  ImageContent,
  INITIAL_SECTIONS_CONTENT_STATE 
} from './section.model';
import {
  selectAllImagesOrdered,
  getImageGlobalIndex,
  selectAllImagesWithGlobalIndex,
  selectSectionImagesWithGlobalIndex,
  selectTotalImageCount,
  getTableGlobalIndex,
  selectTotalTableCount,
  ImageWithGlobalIndex
} from './section.selectors';
import { sectionContentReducer, addImageToSection } from './section-content.reducer';
import { generateInitialSections } from '../utils/section-generator.util';
import { FormularioService } from '../services/formulario.service';
import { Injector } from '@angular/core';

/**
 * ProjectStateFacade
 * 
 * Provee una API amigable para componentes que aún no han migrado completamente.
 * Internamente delega todo al UIStoreService.
 */
@Injectable({ providedIn: 'root' })
export class ProjectStateFacade {
  private readonly store = inject(UIStoreService);
  private readonly injector = inject(Injector);
  
  // Cache para FormularioService (evitar inyección circular)
  private _formularioService: FormularioService | null = null;
  private get formularioService(): FormularioService | null {
    if (!this._formularioService) {
      try {
        this._formularioService = this.injector.get(FormularioService, null);
      } catch {
        return null;
      }
    }
    return this._formularioService;
  }
  
  // ============================================================================
  // SECTIONS CONTENT STATE (FASE 2) - Estado interno para contenido de secciones
  // ============================================================================
  
  /** Estado interno de secciones de contenido */
  private readonly _sectionsContent = signal<SectionsContentState>(INITIAL_SECTIONS_CONTENT_STATE);
  
  /** Signal público: Estado de secciones de contenido */
  readonly sectionsContent: Signal<SectionsContentState> = this._sectionsContent.asReadonly();
  
  /** Signal: Lista de IDs de secciones en orden */
  readonly sectionOrder: Signal<readonly string[]> = computed(() => 
    this._sectionsContent().sectionOrder
  );
  
  /** Signal: Todas las secciones como array ordenado */
  readonly allSections: Signal<readonly Section[]> = computed(() => {
    const state = this._sectionsContent();
    return state.sectionOrder
      .map(id => state.byId[id])
      .filter((s): s is Section => s !== undefined);
  });
  
  /** Signal: Sección activa de contenido */
  readonly activeSectionContent: Signal<Section | null> = computed(() => {
    const state = this._sectionsContent();
    if (!state.activeSectionId) return null;
    return state.byId[state.activeSectionId] ?? null;
  });
  
  /** Signal: ID de sección activa de contenido */
  readonly activeSectionContentId: Signal<string | null> = computed(() => 
    this._sectionsContent().activeSectionId
  );
  
  /** Signal: Total de imágenes en el documento */
  readonly totalImageCount: Signal<number> = computed(() => 
    selectTotalImageCount(this._sectionsContent())
  );
  
  /** Signal: Total de tablas en el documento */
  readonly totalTableCount: Signal<number> = computed(() => 
    selectTotalTableCount(this._sectionsContent())
  );

  // ============================================================================
  // METADATA (Signals)
  // ============================================================================

  /** Signal: Información del proyecto */
  readonly projectInfo: Signal<ProjectInfo> = this.store.select(Selectors.getProjectInfo);
  
  /** Signal: Nombre del proyecto */
  readonly projectName: Signal<string> = this.store.select(Selectors.getProjectName);
  
  /** Signal: Consultora */
  readonly consultora: Signal<string> = this.store.select(Selectors.getConsultora);
  
  /** Signal: Proyecto tiene cambios sin guardar */
  readonly isDirty: Signal<boolean> = this.store.select(Selectors.isDirty);

  // ============================================================================
  // METADATA (Observables - para componentes legacy)
  // ============================================================================

  /** @deprecated Use projectName signal */
  readonly projectName$: Observable<string> = toObservable(this.projectName);
  
  /** @deprecated Use consultora signal */
  readonly consultora$: Observable<string> = toObservable(this.consultora);
  
  /** @deprecated Use isDirty signal */
  readonly isDirty$: Observable<boolean> = toObservable(this.isDirty);

  // ============================================================================
  // GRUPOS (Signals)
  // ============================================================================

  /** Signal: Grupos AISD */
  readonly aisdGroups: Signal<GroupOption[]> = this.store.select(Selectors.getAISDGroups);
  
  /** Signal: Grupos AISI */
  readonly aisiGroups: Signal<GroupOption[]> = this.store.select(Selectors.getAISIGroups);

  /** Signal: Grupos raíz AISD */
  readonly aisdRootGroups: Signal<GroupOption[]> = computed(() => 
    this.aisdGroups().filter(g => g.parentId === null)
  );

  /** Signal: Grupos raíz AISI */
  readonly aisiRootGroups: Signal<GroupOption[]> = computed(() => 
    this.aisiGroups().filter(g => g.parentId === null)
  );

  /**
   * Signal helper: grupos completos por tipo
   */
  groupsByType(tipo: 'AISD' | 'AISI'): Signal<readonly GroupDefinition[]> {
    return this.store.selectWith(Selectors.getGroupsByType, tipo);
  }

  /**
   * Signal helper: buscar grupo por ID
   */
  groupById(tipo: 'AISD' | 'AISI', groupId: string): Signal<GroupDefinition | null> {
    return this.store.selectWith(Selectors.getGroupById, tipo, groupId);
  }

  /**
   * Signal helper: consultar centro poblado por ID
   */
  populatedCenterById(centerId: string): Signal<CCPPEntry | null> {
    return this.store.selectWith(Selectors.getPopulatedCenterById, centerId);
  }

  /**
   * Signal helper: lista completa de centros poblados
   */
  allPopulatedCenters(): Signal<readonly CCPPEntry[]> {
    return this.store.select(Selectors.getAllPopulatedCenters);
  }

  // ============================================================================
  // GRUPOS (Observables - para componentes legacy)
  // ============================================================================

  /** @deprecated Use aisdGroups signal */
  readonly aisdGroups$: Observable<GroupOption[]> = toObservable(this.aisdGroups);
  
  /** @deprecated Use aisiGroups signal */
  readonly aisiGroups$: Observable<GroupOption[]> = toObservable(this.aisiGroups);

  // ============================================================================
  // SECCIONES (Signals)
  // ============================================================================

  /** Signal: Sección activa */
  readonly activeSection: Signal<SectionNavItem | null> = this.store.select(Selectors.getActiveSection);
  
  /** Signal: ID de sección activa */
  readonly activeSectionId: Signal<string | null> = this.store.select(Selectors.getActiveSectionId);

  // ============================================================================
  // UBICACIÓN (Signals)
  // ============================================================================

  /** Signal: Ubicación geográfica */
  readonly ubicacion: Signal<UbicacionInfo> = this.store.select(Selectors.getUbicacion);

  /** @deprecated Use ubicacion signal */
  readonly ubicacion$: Observable<UbicacionInfo> = toObservable(this.ubicacion);

  // ============================================================================
  // ENTREVISTADOS (Signals)
  // ============================================================================

  /** Signal: Lista de entrevistados */
  readonly entrevistados: Signal<readonly Entrevistado[]> = this.store.select(Selectors.getEntrevistados);

  /** @deprecated Use entrevistados signal */
  readonly entrevistados$: Observable<readonly Entrevistado[]> = toObservable(this.entrevistados);

  // ============================================================================
  // MÉTODOS DE LECTURA (Para componentes que necesitan valores puntuales)
  // ============================================================================

  /**
   * Obtiene un grupo específico
   */
  getGroup(tipo: 'AISD' | 'AISI', groupId: string): GroupOption | null {
    return Selectors.getGroup(this.store.getSnapshot(), tipo, groupId);
  }

  /**
   * Obtiene hijos de un grupo
   */
  getGroupChildren(tipo: 'AISD' | 'AISI', parentId: string): GroupOption[] {
    return Selectors.getGroupChildren(this.store.getSnapshot(), tipo, parentId);
  }

  /**
   * Obtiene el valor de un campo
   */
  getFieldValue(sectionId: string, groupId: string | null, fieldName: string): any {
    return Selectors.getFieldValue(this.store.getSnapshot(), sectionId, groupId, fieldName);
  }

  /**
   * Obtiene todos los campos de una sección como objeto
   */
  getSectionFields(sectionId: string, groupId: string | null = null): Record<string, any> {
    return Selectors.getSectionFieldsAsObject(this.store.getSnapshot(), sectionId, groupId);
  }

  /**
   * Crea un Signal para un campo específico
   */
  selectField(sectionId: string, groupId: string | null, fieldName: string): Signal<any> {
    return this.store.selectWith(Selectors.getFieldValue, sectionId, groupId, fieldName);
  }

  /**
   * Crea un Signal para los campos de una sección
   */
  selectSectionFields(sectionId: string, groupId: string | null = null): Signal<Record<string, any>> {
    return this.store.selectWith(Selectors.getSectionFieldsAsObject, sectionId, groupId);
  }

  /**
   * Obtiene datos de una tabla
   */
  getTableData(sectionId: string, groupId: string | null, tableKey: string): any[] {
    return Selectors.getTableData(this.store.getSnapshot(), sectionId, groupId, tableKey);
  }

  /**
   * Crea un Signal para datos de tabla
   */
  selectTableData(sectionId: string, groupId: string | null, tableKey: string): Signal<any[]> {
    return this.store.selectWith(Selectors.getTableData, sectionId, groupId, tableKey);
  }

  /**
   * Obtiene imágenes de una sección
   */
  getSectionImages(sectionId: string, groupId: string | null = null): GalleryImage[] {
    return Selectors.getSectionImages(this.store.getSnapshot(), sectionId, groupId);
  }

  /**
   * Crea un Signal para imágenes de sección
   */
  selectSectionImages(sectionId: string, groupId: string | null = null): Signal<GalleryImage[]> {
    return this.store.selectWith(Selectors.getSectionImages, sectionId, groupId);
  }

  /**
   * Verifica si una sección está completa
   */
  isSectionComplete(sectionId: string): boolean {
    return Selectors.isSectionComplete(this.store.getSnapshot(), sectionId);
  }

  /**
   * Obtiene el estado de navegación de una sección
   */
  getSectionNav(sectionId: string): SectionNavItem | null {
    return Selectors.getSectionNav(this.store.getSnapshot(), sectionId);
  }

  // ============================================================================
  // MÉTODOS DE ESCRITURA (Comandos)
  // ============================================================================

  /**
   * Despacha un comando al store
   */
  dispatch(command: ProjectStateCommand): void {
    this.store.dispatch(command);
  }

  /**
   * Despacha múltiples comandos como transacción
   */
  dispatchBatch(commands: ProjectStateCommand[]): void {
    this.store.dispatchBatch(commands);
  }

  // --- Metadata ---

  setProjectName(name: string): void {
    this.dispatch(Commands.setProjectName(name));
  }

  setConsultora(consultora: string): void {
    this.dispatch(Commands.setConsultora(consultora));
  }

  setDetalleProyecto(detalle: string): void {
    this.dispatch(Commands.setDetalleProyecto(detalle));
  }

  // --- Grupos ---

  addGroup(tipo: 'AISD' | 'AISI', nombre: string, parentId: string | null = null): void {
    this.dispatch(Commands.addGroup(tipo, nombre, parentId));
  }

  removeGroup(tipo: 'AISD' | 'AISI', groupId: string, cascade: boolean = false): void {
    this.dispatch(Commands.removeGroup(tipo, groupId, cascade));
  }

  renameGroup(tipo: 'AISD' | 'AISI', groupId: string, newName: string): void {
    this.dispatch(Commands.renameGroup(tipo, groupId, newName));
  }

  // --- Secciones ---

  initializeSection(sectionId: string, groupType: 'NONE' | 'AISD' | 'AISI' = 'NONE', groupId: string | null = null): void {
    this.dispatch(Commands.initializeSection(sectionId, groupType, groupId));
  }

  setActiveSection(sectionId: string): void {
    this.dispatch(Commands.setActiveSection(sectionId));
  }

  markSectionComplete(sectionId: string): void {
    this.dispatch(Commands.markSectionComplete(sectionId));
  }

  // --- Campos ---

  setField(sectionId: string, groupId: string | null, fieldName: string, value: any): void {
    this.dispatch(Commands.setField(sectionId, groupId, fieldName, value));
  }

  setFields(sectionId: string, groupId: string | null, fields: Record<string, any>): void {
    const fieldArray = Object.entries(fields).map(([fieldName, value]) => ({
      fieldName,
      value,
      source: 'user' as const
    }));
    this.dispatch(Commands.setFields(sectionId, groupId, fieldArray));
  }

  clearSectionFields(sectionId: string, groupId: string | null = null): void {
    this.dispatch(Commands.clearSectionFields(sectionId, groupId));
  }

  // --- Tablas ---

  setTableData(sectionId: string, groupId: string | null, tableKey: string, rows: any[]): void {
    const formattedRows = rows.map(data => ({ data }));
    this.dispatch(Commands.setTableData(sectionId, groupId, tableKey, formattedRows));
  }

  addTableRow(sectionId: string, groupId: string | null, tableKey: string, data: any): void {
    this.dispatch(Commands.addTableRow(sectionId, groupId, tableKey, data));
  }

  updateTableRow(sectionId: string, groupId: string | null, tableKey: string, rowId: string, data: any): void {
    this.dispatch(Commands.updateTableRow(sectionId, groupId, tableKey, rowId, data));
  }

  removeTableRow(sectionId: string, groupId: string | null, tableKey: string, rowId: string): void {
    this.dispatch(Commands.removeTableRow(sectionId, groupId, tableKey, rowId));
  }

  // --- Imágenes ---

  addImage(sectionId: string, groupId: string | null, titulo: string, fuente: string, preview?: string): void {
    this.dispatch(Commands.addImage(sectionId, groupId, titulo, fuente, preview));
  }

  updateImage(imageId: string, changes: { titulo?: string; fuente?: string }): void {
    this.dispatch(Commands.updateImage(imageId, changes));
  }

  removeImage(imageId: string): void {
    this.dispatch(Commands.removeImage(imageId));
  }

  // --- Proyecto ---

  /**
   * Carga datos desde un archivo JSON
   * 
   * @param file - Archivo JSON a cargar
   * @param projectName - Nombre del proyecto
   * @returns Promise que resuelve cuando la carga está completa
   */
  async loadProjectFromFile(file: File, projectName: string): Promise<{
    success: boolean;
    errors: string[];
    stats: { totalCCPP: number; totalGroups: number; type: string };
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const content = e.target?.result as string;
          const jsonContent = JSON.parse(content);
          
          // Usar el adapter para obtener preview de stats
          const { validateImportJson, getImportStats } = require('../../utils/json-import.adapter');
          const validation = validateImportJson(jsonContent);
          const stats = getImportStats(jsonContent);
          
          if (!validation.valid) {
            resolve({
              success: false,
              errors: validation.errors,
              stats: { totalCCPP: 0, totalGroups: 0, type: 'unknown' }
            });
            return;
          }
          
          // Despachar comando al store
          this.dispatch({
            type: 'project/loadJsonData',
            payload: {
              fileContent: jsonContent,
              projectName,
              fileName: file.name
            }
          });
          
          resolve({
            success: true,
            errors: validation.errors,
            stats: {
              totalCCPP: stats.estimatedCCPP,
              totalGroups: stats.estimatedGroups,
              type: stats.detectedType || 'unknown'
            }
          });
        } catch (error) {
          resolve({
            success: false,
            errors: [`Error parseando JSON: ${error}`],
            stats: { totalCCPP: 0, totalGroups: 0, type: 'unknown' }
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          errors: ['Error leyendo archivo'],
          stats: { totalCCPP: 0, totalGroups: 0, type: 'unknown' }
        });
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Carga datos JSON directamente (sin archivo)
   */
  loadJsonData(jsonContent: unknown, projectName: string): void {
    this.dispatch({
      type: 'project/loadJsonData',
      payload: {
        fileContent: jsonContent,
        projectName
      }
    });
  }

  loadProject(data: any, source: 'storage' | 'api'): void {
    this.dispatch(Commands.loadProject(data, source));
  }

  clearProject(): void {
    this.dispatch(Commands.clearProject());
  }

  markProjectSaved(): void {
    this.dispatch(Commands.markProjectSaved());
  }

  setUbicacion(departamento: string, provincia: string, distrito: string): void {
    this.dispatch(Commands.setUbicacion(departamento, provincia, distrito));
  }

  addEntrevistado(entrevistado: Entrevistado): void {
    this.dispatch(Commands.addEntrevistado(
      entrevistado.nombre,
      entrevistado.cargo,
      entrevistado.organizacion
    ));
  }

  removeEntrevistado(index: number): void {
    this.dispatch(Commands.removeEntrevistado(index));
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Resetea el store al estado inicial
   */
  reset(): void {
    this.store.reset();
    this._sectionsContent.set(INITIAL_SECTIONS_CONTENT_STATE);
  }

  /**
   * Obtiene snapshot del estado (solo para debug/serialización)
   */
  getSnapshot(): ProjectState {
    return this.store.getSnapshot();
  }

  /**
   * Obtiene todos los datos del proyecto como objeto plano (para compatibilidad legacy)
   * NOTA: Método de transición - los componentes nuevos deben usar signals específicos
   * @deprecated Usar selectSectionFields() o selectField() en su lugar
   */
  obtenerDatos(): Record<string, any> {
    const state = this.store.getSnapshot();
    const result: Record<string, any> = {};
    
    // ✅ PRIMERO: Cargar datos persistidos desde FormularioService (localStorage)
    // Esto garantiza que los datos sobrevivan a recargas de página
    const formService = this.formularioService;
    if (formService) {
      const persistedData = formService.obtenerDatos();
      if (persistedData && typeof persistedData === 'object') {
        Object.assign(result, persistedData);
      }
    }
    
    // Extraer metadatos (sobrescriben si están en store)
    if (state.metadata) {
      if (state.metadata.projectName) result['projectName'] = state.metadata.projectName;
      if (state.metadata.consultora) result['consultora'] = state.metadata.consultora;
      if (state.metadata.detalleProyecto) result['detalleProyecto'] = state.metadata.detalleProyecto;
    }
    
    // Extraer grupos AISD desde groupConfig
    // ✅ Solo sobrescribir si hay grupos en el store, de lo contrario mantener los de localStorage
    if (state.groupConfig?.aisd && state.groupConfig.aisd.length > 0) {
      result['grupoAISD'] = state.groupConfig.aisd[0]?.nombre || '';
      result['gruposAISD'] = state.groupConfig.aisd.map((g: any) => g.nombre);
      // ✅ CRÍTICO: Extraer comunidadesCampesinas en el mismo formato que distritosAISI
      result['comunidadesCampesinas'] = state.groupConfig.aisd.map((g: any) => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
      }));
    }
    // ✅ Si no hay grupos AISD en el store pero sí hay en localStorage, mantener los de localStorage
    // (ya fueron asignados en la línea 598)
    
    // Extraer grupos AISI (distritos) desde groupConfig
    // ✅ Solo sobrescribir si hay grupos en el store, de lo contrario mantener los de localStorage
    if (state.groupConfig?.aisi && state.groupConfig.aisi.length > 0) {
      result['distritosAISI'] = state.groupConfig.aisi.map((g: any) => ({
        id: g.id,
        nombre: g.nombre,
        nombreOriginal: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
      }));
      result['distritoSeleccionado'] = state.groupConfig.aisi[0]?.nombre || '';
    }
    // ✅ Si no hay grupos AISI en el store pero sí hay en localStorage, mantener los de localStorage
    // (ya fueron asignados en la línea 598)
    
    // Extraer ubicación desde globalRegistry
    if (state.globalRegistry?.ubicacion) {
      if (state.globalRegistry.ubicacion.departamento) result['departamento'] = state.globalRegistry.ubicacion.departamento;
      if (state.globalRegistry.ubicacion.provincia) result['provincia'] = state.globalRegistry.ubicacion.provincia;
      if (state.globalRegistry.ubicacion.distrito) result['distrito'] = state.globalRegistry.ubicacion.distrito;
    }
    
    // Extraer entrevistados desde globalRegistry
    if (state.globalRegistry?.entrevistados && state.globalRegistry.entrevistados.length > 0) {
      result['entrevistados'] = state.globalRegistry.entrevistados;
    }
    
    // Extraer todos los campos desde fields.byKey (sobrescriben lo de localStorage)
    if (state.fields?.byKey) {
      for (const [key, entry] of Object.entries(state.fields.byKey)) {
        if (entry?.state?.value !== undefined && entry.state.value !== '') {
          // Usar solo el fieldName como clave para campos globales
          result[entry.fieldName] = entry.state.value;
        }
      }
    }
    
    // Extraer datos de tablas desde tables.byKey
    if (state.tables?.byKey) {
      for (const [key, entry] of Object.entries(state.tables.byKey)) {
        if (entry?.state?.rows && entry.state.rows.length > 0) {
          result[entry.tableKey] = entry.state.rows.map((r: any) => r.data);
        }
      }
    }
    
    // Extraer CCPPs
    if (state.ccppRegistry?.byId) {
      const ccppList = Object.values(state.ccppRegistry.byId);
      if (ccppList.length > 0) {
        result['centrosPobladosJSON'] = ccppList;
      }
    }
    
    return result;
  }

  // ============================================================================
  // SECTIONS CONTENT - MÉTODOS DE LECTURA (FASE 2)
  // ============================================================================

  /**
   * Obtiene una sección por ID
   */
  getSectionContent(sectionId: string): Section | undefined {
    return this._sectionsContent().byId[sectionId];
  }

  /**
   * Obtiene el índice global de una imagen (1-based)
   * CRÍTICO: Este método permite mostrar "Figura X" donde X es automático
   */
  getImageGlobalIndex(imageId: string): number | null {
    return getImageGlobalIndex(this._sectionsContent(), imageId);
  }

  /**
   * Obtiene el índice global de una tabla (1-based)
   */
  getTableGlobalIndex(tableId: string): number | null {
    return getTableGlobalIndex(this._sectionsContent(), tableId);
  }

  /**
   * Obtiene todas las imágenes con sus índices globales
   */
  getAllImagesWithIndex(): readonly ImageWithGlobalIndex[] {
    return selectAllImagesWithGlobalIndex(this._sectionsContent());
  }

  /**
   * Obtiene imágenes de una sección con sus índices globales
   */
  getSectionImagesWithIndex(sectionId: string): readonly ImageWithGlobalIndex[] {
    return selectSectionImagesWithGlobalIndex(this._sectionsContent(), sectionId);
  }

  /**
   * Crea un Signal para el índice global de una imagen específica
   * Reactivo: se actualiza automáticamente cuando cambia la numeración
   */
  selectImageGlobalIndex(imageId: string): Signal<number | null> {
    return computed(() => getImageGlobalIndex(this._sectionsContent(), imageId));
  }

  // ============================================================================
  // SECTIONS CONTENT - MÉTODOS DE ESCRITURA (FASE 2)
  // ============================================================================

  /**
   * Inicializa el árbol de secciones basado en groupConfig
   * Debe llamarse después de cargar JSON exitosamente
   */
  initializeSectionsTree(): void {
    const projectState = this.store.getSnapshot();
    const newSectionsState = generateInitialSections(projectState);
    this._sectionsContent.set(newSectionsState);
  }

  /**
   * Establece la sección activa de contenido
   */
  setActiveSectionContent(sectionId: string): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/setActive',
      payload: { sectionId }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }

  /**
   * Agrega una imagen a una sección
   */
  addSectionImage(sectionId: string, titulo: string, fuente: string = '', preview: string | null = null): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/addImage',
      payload: { sectionId, titulo, fuente, preview, localPath: null }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }

  /**
   * Agrega una tabla a una sección
   */
  addSectionTable(sectionId: string, titulo: string, fuente: string = '', columns: string[] = []): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/addTable',
      payload: { sectionId, titulo, fuente, columns }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }

  /**
   * Agrega un párrafo a una sección
   */
  addSectionParagraph(sectionId: string, text: string = '', format: 'plain' | 'html' | 'markdown' = 'plain'): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/addParagraph',
      payload: { sectionId, text, format }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }

  /**
   * Actualiza contenido existente (texto, título, fuente, preview, columns, rows)
   */
  updateSectionContent(sectionId: string, contentId: string, changes: { 
    text?: string; 
    titulo?: string; 
    fuente?: string;
    preview?: string;
    columns?: readonly string[];
    rows?: readonly unknown[];
  }): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/updateContent',
      payload: { sectionId, contentId, changes }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }

  /**
   * Elimina contenido de una sección
   */
  removeSectionContent(sectionId: string, contentId: string): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/removeContent',
      payload: { sectionId, contentId }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }

  /**
   * Reordena contenido dentro de una sección
   */
  reorderSectionContent(sectionId: string, orderedContentIds: string[]): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/reorderContent',
      payload: { sectionId, orderedContentIds }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }

  /**
   * ✅ FASE 1: Resetea una sección específica
   * Limpia todos los campos de la sección sin afectar otras secciones
   */
  resetSection(sectionId: string): void {
    this.store.dispatch(Commands.resetSection(sectionId, false));
  }
}
