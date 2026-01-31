import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion2Component } from './seccion2.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { GruposService } from 'src/app/core/services/domain/grupos.service';
import { Subscription } from 'rxjs';
import { CentrosPobladosSearchService } from 'src/app/core/services/centros-poblados-search.service';
import { Commands } from 'src/app/core/state/ui-store.contract';
import { GroupDefinition, CCPPEntry } from 'src/app/core/state/project-state.model';

/**
 * SECCION 2 FORM - FORMULARIO DE EDICIÓN
 * 
 * Componente de formulario refactorizado para usar exclusivamente signals del ProjectStateFacade.
 * 
 * PRINCIPIOS:
 * - ✅ No mantiene arrays locales (comunidadesCampesinas, distritosAISI)
 * - ✅ Lee grupos y centros poblados desde signals reactivos
 * - ✅ Delega TODOS los comandos a Seccion2Component (que usa ProjectStateFacade)
 * - ✅ UI 100% reactiva a cambios en el store
 */
@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion2-form',
    templateUrl: './seccion2-form.component.html'
})
export class Seccion2FormComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  @ViewChild(Seccion2Component) seccion2Component!: Seccion2Component;
  
  private subscription?: Subscription;

  // ============================================================================
  // SIGNALS - Lectura reactiva desde ProjectStateFacade
  // ============================================================================

  /** Signal: Grupos AISD (Comunidades Campesinas) */
  readonly aisdGroups: Signal<readonly GroupDefinition[]> = this.projectFacade.groupsByType('AISD');

  /** Signal: Grupos AISI (Distritos) */
  readonly aisiGroups: Signal<readonly GroupDefinition[]> = this.projectFacade.groupsByType('AISI');

  /** Signal: Todos los centros poblados disponibles */
  readonly allPopulatedCenters: Signal<readonly CCPPEntry[]> = this.projectFacade.allPopulatedCenters();

  constructor(
    private projectFacade: ProjectStateFacade,
    private stateAdapter: ReactiveStateAdapter,
    private cdRef: ChangeDetectorRef,
    private formChange: FormChangeService,
    private gruposService: GruposService,
    private centrosPobladosSearch: CentrosPobladosSearchService
  ) {}

  ngOnInit() {
    // ✅ Formulario reactivo: los signals se actualizan automáticamente
    // No es necesario cargar datos manualmente
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ============================================================================
  // DELEGACIÓN A SECCION2COMPONENT - Comandos
  // ============================================================================

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    // ✅ Persistir vía FormChangeService
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
  }

  getInputValue(event: any): string {
    return event?.target?.value || '';
  }

  // ============================================================================
  // COMANDOS AISD (Comunidades Campesinas) - Delegados a Seccion2Component
  // ============================================================================

  eliminarComunidadCampesina(id: string) {
    if (this.seccion2Component) {
      this.seccion2Component.eliminarComunidadCampesina(id);
      this.cdRef.markForCheck();
    }
  }

  agregarComunidadCampesina() {
    if (this.seccion2Component) {
      this.seccion2Component.agregarComunidadCampesina();
      this.cdRef.markForCheck();
    }
  }

  actualizarNombreComunidad(id: string, nombre: string) {
    const nombreLimpio = (nombre || '').trim();
    
    if (this.seccion2Component) {
      this.seccion2Component.actualizarNombreComunidad(id, nombreLimpio);
    }
    
    this.cdRef.markForCheck();
  }

  // ============================================================================
  // COMANDOS AISI (Distritos) - Delegados a Seccion2Component
  // ============================================================================

  agregarDistritoAISI() {
    if (this.seccion2Component) {
      this.seccion2Component.agregarDistritoAISI();
      this.cdRef.markForCheck();
    }
  }

  eliminarDistritoAISI(id: string) {
    if (this.seccion2Component) {
      this.seccion2Component.eliminarDistritoAISI(id);
      this.cdRef.markForCheck();
    }
  }

  actualizarNombreDistrito(id: string, nombre: string) {
    if (this.seccion2Component) {
      this.seccion2Component.actualizarNombreDistrito(id, nombre);
    }
    
    this.cdRef.markForCheck();
  }

  // ============================================================================
  // COMANDOS CENTROS POBLADOS - Delegados a Seccion2Component
  // ============================================================================

  toggleCentroPobladoComunidad(id: string, codigo: string) {
    if (this.seccion2Component) {
      this.seccion2Component.toggleCentroPobladoComunidad(id, codigo);
      this.cdRef.markForCheck();
    }
  }

  seleccionarTodosCentrosPobladosComunidad(id: string) {
    if (this.seccion2Component) {
      this.seccion2Component.seleccionarTodosCentrosPobladosComunidad(id);
      this.cdRef.markForCheck();
    }
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string) {
    if (this.seccion2Component) {
      this.seccion2Component.deseleccionarTodosCentrosPobladosComunidad(id);
      this.cdRef.markForCheck();
    }
  }

  toggleCentroPobladoDistrito(id: string, codigo: string) {
    if (this.seccion2Component) {
      this.seccion2Component.toggleCentroPobladoDistrito(id, codigo);
      this.cdRef.markForCheck();
    }
  }

  seleccionarTodosCentrosPobladosDistrito(id: string) {
    if (this.seccion2Component) {
      this.seccion2Component.seleccionarTodosCentrosPobladosDistrito(id);
      this.cdRef.markForCheck();
    }
  }

  deseleccionarTodosCentrosPobladosDistrito(id: string) {
    if (this.seccion2Component) {
      this.seccion2Component.deseleccionarTodosCentrosPobladosDistrito(id);
      this.cdRef.markForCheck();
    }
  }

  // ============================================================================
  // CONSULTAS - Derivadas de signals
  // ============================================================================

  /**
   * Obtiene comunidades para el template (derivado de signal)
   */
  obtenerComunidades(): readonly GroupDefinition[] {
    return this.aisdGroups();
  }

  /**
   * Obtiene distritos para el template (derivado de signal)
   */
  obtenerDistritos(): readonly GroupDefinition[] {
    return this.aisiGroups();
  }

  /**
   * Obtiene los centros poblados seleccionados de una comunidad
   */
  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    const grupo = this.aisdGroups().find(g => g.id === id);
    return grupo?.ccppIds as string[] || [];
  }

  /**
   * Obtiene todos los centros poblados disponibles
   */
  obtenerTodosLosCentrosPoblados(): CCPPEntry[] {
    return this.allPopulatedCenters() as CCPPEntry[];
  }

  /**
   * Obtiene centros poblados visibles para una comunidad
   */
  obtenerCentrosPobladosDeComunidad(comunidadId: string): CCPPEntry[] {
    const grupo = this.aisdGroups().find(g => g.id === comunidadId);
    
    if (!grupo) {
      return [];
    }
    
    // Si el nombre es genérico, mostrar todos
    if (!grupo.nombre || grupo.nombre.startsWith('Comunidad Campesina')) {
      return this.obtenerTodosLosCentrosPoblados();
    }
    
    // Intentar filtrar por nombre (lógica simplificada)
    const todosLosCentros = this.allPopulatedCenters();
    const centrosFiltrados = todosLosCentros.filter(c => 
      c.nombre?.toLowerCase().includes(grupo.nombre.toLowerCase())
    );
    
    return centrosFiltrados.length > 0 ? centrosFiltrados as CCPPEntry[] : this.obtenerTodosLosCentrosPoblados();
  }

  /**
   * Obtiene centros poblados visibles para un distrito
   */
  obtenerCentrosPobladosDeDistrito(distritoId: string): CCPPEntry[] {
    const grupo = this.aisiGroups().find(g => g.id === distritoId);
    
    if (!grupo) {
      return [];
    }
    
    // Si el nombre es genérico, mostrar todos
    if (!grupo.nombre || grupo.nombre.startsWith('Distrito ')) {
      return this.obtenerTodosLosCentrosPoblados();
    }
    
    // Intentar filtrar por distrito
    const todosLosCentros = this.allPopulatedCenters();
    const centrosFiltrados = todosLosCentros.filter(c => 
      c.dist?.toLowerCase() === grupo.nombre.toLowerCase()
    );
    
    return centrosFiltrados.length > 0 ? centrosFiltrados as CCPPEntry[] : this.obtenerTodosLosCentrosPoblados();
  }

  /**
   * Determina si debe mostrar sección de centros poblados para una comunidad
   */
  debeMostrarCentrosPobladosComunidad(comunidad: GroupDefinition): boolean {
    if (!comunidad) {
      return false;
    }
    
    // Si tiene centros seleccionados, mostrar
    if (comunidad.ccppIds && comunidad.ccppIds.length > 0) {
      return true;
    }
    
    // Si hay centros disponibles, mostrar
    const centrosDisponibles = this.obtenerCentrosPobladosDeComunidad(comunidad.id);
    return centrosDisponibles.length > 0;
  }

  /**
   * Obtiene centros poblados visibles para una comunidad
   */
  obtenerCentrosPobladosVisibles(comunidad: GroupDefinition): CCPPEntry[] {
    return this.obtenerCentrosPobladosDeComunidad(comunidad.id);
  }

  /**
   * Obtiene centros poblados visibles para un distrito
   */
  obtenerCentrosPobladosVisiblesDistrito(distrito: GroupDefinition): CCPPEntry[] {
    return this.obtenerCentrosPobladosDeDistrito(distrito.id);
  }

  /**
   * Verifica si un centro poblado está seleccionado para una comunidad
   */
  estaCentroPobladoSeleccionadoComunidad(id: string, codigo: string): boolean {
    const grupo = this.aisdGroups().find(g => g.id === id);
    if (!grupo) {
      return false;
    }
    const codigoNormalizado = codigo?.toString().trim() || '';
    return grupo.ccppIds.includes(codigoNormalizado);
  }

  /**
   * Verifica si un centro poblado está seleccionado para un distrito
   */
  estaCentroPobladoSeleccionadoDistrito(id: string, codigo: string): boolean {
    const grupo = this.aisiGroups().find(g => g.id === id);
    if (!grupo) {
      return false;
    }
    const codigoNormalizado = codigo?.toString().trim() || '';
    return grupo.ccppIds.includes(codigoNormalizado);
  }

  // ============================================================================
  // FOTOGRAFÍAS - Delegadas a Seccion2Component
  // ============================================================================

  onFotografiasChange(fotos: any[]) {
    if (this.seccion2Component) {
      this.seccion2Component.onFotografiasChange(fotos);
    }
  }

  get photoPrefix(): string {
    return this.seccion2Component?.PHOTO_PREFIX || 'fotografiaSeccion2';
  }

  get key(): number {
    return this.seccion2Component?.imageUploadKey ?? 0;
  }

  get fotografias(): any[] {
    return this.seccion2Component?.fotografiasSeccion2 || [];
  }

  // ============================================================================
  // HELPERS DE TRACKING PARA *ngFor
  // ============================================================================

  trackByComunidadId(index: number, comunidad: GroupDefinition): string {
    return comunidad.id;
  }

  trackByDistritoId(index: number, distrito: GroupDefinition): string {
    return distrito.id;
  }
}
