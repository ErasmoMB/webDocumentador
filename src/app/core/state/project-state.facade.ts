import { Injectable, Signal, inject, computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

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

@Injectable({ providedIn: 'root' })
export class ProjectStateFacade {
  private readonly store = inject(UIStoreService);
  private readonly injector = inject(Injector);
  
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
  
  private readonly _sectionsContent = signal<SectionsContentState>(INITIAL_SECTIONS_CONTENT_STATE);
  readonly sectionsContent: Signal<SectionsContentState> = this._sectionsContent.asReadonly();
  readonly sectionOrder: Signal<readonly string[]> = computed(() => 
    this._sectionsContent().sectionOrder
  );
  readonly allSections: Signal<readonly Section[]> = computed(() => {
    const state = this._sectionsContent();
    return state.sectionOrder
      .map(id => state.byId[id])
      .filter((s): s is Section => s !== undefined);
  });
  readonly activeSectionContent: Signal<Section | null> = computed(() => {
    const state = this._sectionsContent();
    if (!state.activeSectionId) return null;
    return state.byId[state.activeSectionId] ?? null;
  });
  readonly activeSectionContentId: Signal<string | null> = computed(() => 
    this._sectionsContent().activeSectionId
  );
  readonly totalImageCount: Signal<number> = computed(() => 
    selectTotalImageCount(this._sectionsContent())
  );
  readonly totalTableCount: Signal<number> = computed(() => 
    selectTotalTableCount(this._sectionsContent())
  );

  readonly projectInfo: Signal<ProjectInfo> = this.store.select(Selectors.getProjectInfo);
  readonly projectName: Signal<string> = this.store.select(Selectors.getProjectName);
  readonly consultora: Signal<string> = this.store.select(Selectors.getConsultora);
  readonly isDirty: Signal<boolean> = this.store.select(Selectors.isDirty);

  readonly projectName$: Observable<string> = toObservable(this.projectName);
  readonly consultora$: Observable<string> = toObservable(this.consultora);
  readonly isDirty$: Observable<boolean> = toObservable(this.isDirty);

  readonly aisdGroups: Signal<GroupOption[]> = this.store.select(Selectors.getAISDGroups);
  readonly aisiGroups: Signal<GroupOption[]> = this.store.select(Selectors.getAISIGroups);

  readonly aisdRootGroups: Signal<GroupOption[]> = computed(() => 
    this.aisdGroups().filter(g => g.parentId === null)
  );
  readonly aisiRootGroups: Signal<GroupOption[]> = computed(() => 
    this.aisiGroups().filter(g => g.parentId === null)
  );

  groupsByType(tipo: 'AISD' | 'AISI'): Signal<readonly GroupDefinition[]> {
    return this.store.selectWith(Selectors.getGroupsByType, tipo);
  }
  groupById(tipo: 'AISD' | 'AISI', groupId: string): Signal<GroupDefinition | null> {
    return this.store.selectWith(Selectors.getGroupById, tipo, groupId);
  }
  populatedCenterById(centerId: string): Signal<CCPPEntry | null> {
    return this.store.selectWith(Selectors.getPopulatedCenterById, centerId);
  }
  allPopulatedCenters(): Signal<readonly CCPPEntry[]> {
    return this.store.select(Selectors.getAllPopulatedCenters);
  }

  readonly aisdGroups$: Observable<GroupOption[]> = toObservable(this.aisdGroups);
  readonly aisiGroups$: Observable<GroupOption[]> = toObservable(this.aisiGroups);

  readonly activeSection: Signal<SectionNavItem | null> = this.store.select(Selectors.getActiveSection);
  readonly activeSectionId: Signal<string | null> = this.store.select(Selectors.getActiveSectionId);

  readonly ubicacion: Signal<UbicacionInfo> = this.store.select(Selectors.getUbicacion);
  readonly ubicacion$: Observable<UbicacionInfo> = toObservable(this.ubicacion);

  readonly entrevistados: Signal<readonly Entrevistado[]> = this.store.select(Selectors.getEntrevistados);
  readonly entrevistados$: Observable<readonly Entrevistado[]> = toObservable(this.entrevistados);

  getGroup(tipo: 'AISD' | 'AISI', groupId: string): GroupOption | null {
    return Selectors.getGroup(this.store.getSnapshot(), tipo, groupId);
  }
  getGroupChildren(tipo: 'AISD' | 'AISI', parentId: string): GroupOption[] {
    return Selectors.getGroupChildren(this.store.getSnapshot(), tipo, parentId);
  }
  getFieldValue(sectionId: string, groupId: string | null, fieldName: string): any {
    return Selectors.getFieldValue(this.store.getSnapshot(), sectionId, groupId, fieldName);
  }
  getSectionFields(sectionId: string, groupId: string | null = null): Record<string, any> {
    return Selectors.getSectionFieldsAsObject(this.store.getSnapshot(), sectionId, groupId);
  }
  selectField(sectionId: string, groupId: string | null, fieldName: string): Signal<any> {
    return this.store.selectWith(Selectors.getFieldValue, sectionId, groupId, fieldName);
  }
  selectSectionFields(sectionId: string, groupId: string | null = null): Signal<Record<string, any>> {
    return this.store.selectWith(Selectors.getSectionFieldsAsObject, sectionId, groupId);
  }
  getTableData(sectionId: string, groupId: string | null, tableKey: string): any[] {
    return Selectors.getTableData(this.store.getSnapshot(), sectionId, groupId, tableKey);
  }
  selectTableData(sectionId: string, groupId: string | null, tableKey: string): Signal<any[]> {
    return this.store.selectWith(Selectors.getTableData, sectionId, groupId, tableKey);
  }
  getSectionImages(sectionId: string, groupId: string | null = null): GalleryImage[] {
    return Selectors.getSectionImages(this.store.getSnapshot(), sectionId, groupId);
  }
  selectSectionImages(sectionId: string, groupId: string | null = null): Signal<GalleryImage[]> {
    return this.store.selectWith(Selectors.getSectionImages, sectionId, groupId);
  }
  isSectionComplete(sectionId: string): boolean {
    return Selectors.isSectionComplete(this.store.getSnapshot(), sectionId);
  }
  getSectionNav(sectionId: string): SectionNavItem | null {
    return Selectors.getSectionNav(this.store.getSnapshot(), sectionId);
  }

  dispatch(command: ProjectStateCommand): void {
    this.store.dispatch(command);
  }
  dispatchBatch(commands: ProjectStateCommand[]): void {
    this.store.dispatchBatch(commands);
  }
  setProjectName(name: string): void {
    this.dispatch(Commands.setProjectName(name));
  }
  setConsultora(consultora: string): void {
    this.dispatch(Commands.setConsultora(consultora));
  }
  setDetalleProyecto(detalle: string): void {
    this.dispatch(Commands.setDetalleProyecto(detalle));
  }
  addGroup(tipo: 'AISD' | 'AISI', nombre: string, parentId: string | null = null): void {
    this.dispatch(Commands.addGroup(tipo, nombre, parentId));
  }
  removeGroup(tipo: 'AISD' | 'AISI', groupId: string, cascade: boolean = false): void {
    this.dispatch(Commands.removeGroup(tipo, groupId, cascade));
  }
  renameGroup(tipo: 'AISD' | 'AISI', groupId: string, newName: string): void {
    this.dispatch(Commands.renameGroup(tipo, groupId, newName));
  }
  initializeSection(sectionId: string, groupType: 'NONE' | 'AISD' | 'AISI' = 'NONE', groupId: string | null = null): void {
    this.dispatch(Commands.initializeSection(sectionId, groupType, groupId));
  }
  setActiveSection(sectionId: string): void {
    this.dispatch(Commands.setActiveSection(sectionId));
  }
  markSectionComplete(sectionId: string): void {
    this.dispatch(Commands.markSectionComplete(sectionId));
  }
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
  addImage(sectionId: string, groupId: string | null, titulo: string, fuente: string, preview?: string): void {
    this.dispatch(Commands.addImage(sectionId, groupId, titulo, fuente, preview));
  }
  updateImage(imageId: string, changes: { titulo?: string; fuente?: string }): void {
    this.dispatch(Commands.updateImage(imageId, changes));
  }
  removeImage(imageId: string): void {
    this.dispatch(Commands.removeImage(imageId));
  }
  async loadProjectFromFile(file: File, projectName: string): Promise<{
    success: boolean;
    errors: string[];
    stats: { totalCCPP: number; totalGroups: number; type: string };
  }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const content = e.target?.result as string;
          const jsonContent = JSON.parse(content);
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
  reset(): void {
    this.store.reset();
    this._sectionsContent.set(INITIAL_SECTIONS_CONTENT_STATE);
  }
  getSnapshot(): ProjectState {
    return this.store.getSnapshot();
  }
  obtenerDatos(): Record<string, any> {
    const state = this.store.getSnapshot();
    const result: Record<string, any> = {};
    const formService = this.formularioService;
    if (formService) {
      const persistedData = formService.obtenerDatos();
      if (persistedData && typeof persistedData === 'object') {
        Object.assign(result, persistedData);
      }
    }
    if (state.metadata) {
      if (state.metadata.projectName) result['projectName'] = state.metadata.projectName;
      if (state.metadata.consultora) result['consultora'] = state.metadata.consultora;
      if (state.metadata.detalleProyecto) result['detalleProyecto'] = state.metadata.detalleProyecto;
    }
    if (state.groupConfig?.aisd && state.groupConfig.aisd.length > 0) {
      result['grupoAISD'] = state.groupConfig.aisd[0]?.nombre || '';
      result['gruposAISD'] = state.groupConfig.aisd.map((g: any) => g.nombre);
      result['comunidadesCampesinas'] = state.groupConfig.aisd.map((g: any) => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
      }));
    }
    if (state.groupConfig?.aisi && state.groupConfig.aisi.length > 0) {
      result['distritosAISI'] = state.groupConfig.aisi.map((g: any) => ({
        id: g.id,
        nombre: g.nombre,
        nombreOriginal: g.nombre,
        centrosPobladosSeleccionados: (g.ccppIds || []).map((c: string) => String(c).trim())
      }));
      result['distritoSeleccionado'] = state.groupConfig.aisi[0]?.nombre || '';
    }
    if (state.globalRegistry?.ubicacion) {
      if (state.globalRegistry.ubicacion.departamento) result['departamento'] = state.globalRegistry.ubicacion.departamento;
      if (state.globalRegistry.ubicacion.provincia) result['provincia'] = state.globalRegistry.ubicacion.provincia;
      if (state.globalRegistry.ubicacion.distrito) result['distrito'] = state.globalRegistry.ubicacion.distrito;
    }
    if (state.globalRegistry?.entrevistados && state.globalRegistry.entrevistados.length > 0) {
      result['entrevistados'] = state.globalRegistry.entrevistados;
    }
    if (state.fields?.byKey) {
      for (const [key, entry] of Object.entries(state.fields.byKey)) {
        if (entry?.state?.value !== undefined && entry.state.value !== '') {
          result[entry.fieldName] = entry.state.value;
        }
      }
    }
    if (state.tables?.byKey) {
      for (const [key, entry] of Object.entries(state.tables.byKey)) {
        if (entry?.state?.rows && entry.state.rows.length > 0) {
          result[entry.tableKey] = entry.state.rows.map((r: any) => r.data);
        }
      }
    }
    if (state.ccppRegistry?.byId) {
      const ccppList = Object.values(state.ccppRegistry.byId);
      if (ccppList.length > 0) {
        result['centrosPobladosJSON'] = ccppList;
      }
    }
    return result;
  }
  getSectionContent(sectionId: string): Section | undefined {
    return this._sectionsContent().byId[sectionId];
  }
  getImageGlobalIndex(imageId: string): number | null {
    return getImageGlobalIndex(this._sectionsContent(), imageId);
  }
  getTableGlobalIndex(tableId: string): number | null {
    return getTableGlobalIndex(this._sectionsContent(), tableId);
  }
  getAllImagesWithIndex(): readonly ImageWithGlobalIndex[] {
    return selectAllImagesWithGlobalIndex(this._sectionsContent());
  }
  getSectionImagesWithIndex(sectionId: string): readonly ImageWithGlobalIndex[] {
    return selectSectionImagesWithGlobalIndex(this._sectionsContent(), sectionId);
  }
  selectImageGlobalIndex(imageId: string): Signal<number | null> {
    return computed(() => getImageGlobalIndex(this._sectionsContent(), imageId));
  }
  initializeSectionsTree(): void {
    const projectState = this.store.getSnapshot();
    const newSectionsState = generateInitialSections(projectState);
    this._sectionsContent.set(newSectionsState);
  }
  setActiveSectionContent(sectionId: string): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/setActive',
      payload: { sectionId }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }
  addSectionImage(sectionId: string, titulo: string, fuente: string = '', preview: string | null = null): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/addImage',
      payload: { sectionId, titulo, fuente, preview, localPath: null }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }
  addSectionTable(sectionId: string, titulo: string, fuente: string = '', columns: string[] = []): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/addTable',
      payload: { sectionId, titulo, fuente, columns }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }
  addSectionParagraph(sectionId: string, text: string = '', format: 'plain' | 'html' | 'markdown' = 'plain'): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/addParagraph',
      payload: { sectionId, text, format }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }
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
  removeSectionContent(sectionId: string, contentId: string): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/removeContent',
      payload: { sectionId, contentId }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }
  reorderSectionContent(sectionId: string, orderedContentIds: string[]): void {
    const command: SectionContentCommand = {
      type: 'sectionContent/reorderContent',
      payload: { sectionId, orderedContentIds }
    };
    this._sectionsContent.update(state => 
      sectionContentReducer(state, command)
    );
  }
  resetSection(sectionId: string): void {
    this.store.dispatch(Commands.resetSection(sectionId, false));
  }
}
