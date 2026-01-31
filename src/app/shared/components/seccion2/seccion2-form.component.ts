import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion2Component } from './seccion2.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { GruposService } from 'src/app/core/services/domain/grupos.service';
import { ComunidadCampesina, Distrito } from 'src/app/core/models/formulario.model';
import { Subscription } from 'rxjs';
import { CentrosPobladosSearchService } from 'src/app/core/services/centros-poblados-search.service';
import { Commands } from 'src/app/core/state/ui-store.contract';

/**
 * Componente de FORMULARIO para Sección 2
 * Solo formulario completo (comunidades, distritos, párrafos, imágenes)
 * Responsabilidad única: Formulario de edición
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
  
  formData: any = {};
  comunidadesCampesinas: ComunidadCampesina[] = [];
  distritosAISI: Distrito[] = [];
  centrosPobladosJSON: any[] = [];
  autocompleteData: any = {};
  private subscription?: Subscription;

  constructor(
    private projectFacade: ProjectStateFacade,
    private stateAdapter: ReactiveStateAdapter,
    private cdRef: ChangeDetectorRef,
    private formChange: FormChangeService,
    private gruposService: GruposService,
    private centrosPobladosSearch: CentrosPobladosSearchService
  ) {}

  ngOnInit() {
    // ✅ Solo cargar datos iniciales, NO suscribirse a cambios
    // El formulario ES la fuente de los cambios, no debe reaccionar a ellos
    this.actualizarDatos();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  actualizarDatos() {
    const datos = this.projectFacade.obtenerDatos();
    this.formData = { ...datos };
    const comunidadesRaw = datos['comunidadesCampesinas'] || [];
    
    if (comunidadesRaw.length > 0) {
      this.comunidadesCampesinas = comunidadesRaw.map((cc: any) => ({
        ...cc,
        centrosPobladosSeleccionados: (cc.centrosPobladosSeleccionados || []).map((c: any) => {
          if (c === null || c === undefined) return '';
          return c.toString().trim();
        }).filter((codigo: string) => codigo !== '')
      }));
    }

    const distritosRaw = datos['distritosAISI'] || [];
    if (distritosRaw.length > 0) {
      this.distritosAISI = distritosRaw.map((d: any) => ({
        ...d,
        centrosPobladosSeleccionados: (d.centrosPobladosSeleccionados || []).map((c: any) => {
          if (c === null || c === undefined) return '';
          return c.toString().trim();
        }).filter((codigo: string) => codigo !== '')
      }));
    }
    
    this.centrosPobladosJSON = datos['centrosPobladosJSON'] || [];
  }

  // ✅ DELEGAR A SERVICIO: Búsqueda de centros poblados
  obtenerCentrosPobladosDeComunidad(comunidadId: string): any[] {
    const datos = this.projectFacade.obtenerDatos();
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === comunidadId);
    
    if (!comunidad) {
      return [];
    }
    
    return this.centrosPobladosSearch.obtenerCentrosPobladosDeComunidadPorNombre(
      comunidad.nombre || '',
      datos
    );
  }

  obtenerTodosLosCentrosPoblados(): any[] {
    const datos = this.projectFacade.obtenerDatos();
    const centrosDesdeJSON = this.aplanarJsonCentros();
    const centrosExtra = this.centrosPobladosJSON || [];
    const claves = new Set<string>();
    const resultado: any[] = [];

    [...centrosDesdeJSON, ...centrosExtra].forEach((cp: any) => {
      const clave = cp?.CODIGO?.toString?.() || `${cp?.CCPP || ''}-${cp?.ITEM || ''}`;
      if (!claves.has(clave)) {
        claves.add(clave);
        resultado.push(cp);
      }
    });

    return resultado.length > 0 
      ? resultado 
      : this.centrosPobladosSearch.obtenerTodosLosCentrosPoblados(datos);
  }

  private aplanarJsonCentros(): any[] {
    const datos = this.projectFacade.obtenerDatos();
    return this.centrosPobladosSearch.obtenerTodosLosCentrosPoblados(datos);
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
    // ✅ No llamar actualizarDatos() aquí - causa pérdida de caracteres
  }

  eliminarComunidadCampesina(id: string) {
    if (this.seccion2Component && this.seccion2Component['eliminarComunidadCampesina']) {
      this.seccion2Component.eliminarComunidadCampesina(id);
      this.actualizarDatos();
      this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
    }
  }

  agregarComunidadCampesina() {
    if (this.seccion2Component && this.seccion2Component['agregarComunidadCampesina']) {
      this.seccion2Component.agregarComunidadCampesina();
      this.actualizarDatos();
    }
  }

  actualizarNombreComunidad(id: string, nombre: string) {
    const nombreLimpio = (nombre || '').trim();
    
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (comunidad) {
      comunidad.nombre = nombreLimpio;
    }
    
    if (this.seccion2Component && this.seccion2Component['actualizarNombreComunidad']) {
      this.seccion2Component.actualizarNombreComunidad(id, nombreLimpio);
    }
    
    setTimeout(() => {
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }, 0);
  }

  // Delegar cambios de fotografías al componente Seccion2 para mantener la misma lógica
  onFotografiasChange(fotos: any[]) {
    if (this.seccion2Component && this.seccion2Component['onFotografiasChange']) {
      this.seccion2Component.onFotografiasChange(fotos);
    }
    // Refrescar datos locales
    setTimeout(() => this.actualizarDatos(), 0);
  }

  // Helpers con tipos definidos para evitar errores estrictos en templates
  get photoPrefix(): string {
    return (this.seccion2Component && this.seccion2Component.PHOTO_PREFIX) || 'fotografiaSeccion2';
  }

  get key(): number {
    return (this.seccion2Component && this.seccion2Component.imageUploadKey) ?? 0;
  }

  get fotografias(): any[] {
    return (this.seccion2Component && this.seccion2Component.fotografiasSeccion2) || [];
  }

  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    if (this.seccion2Component && this.seccion2Component['obtenerCentrosPobladosSeleccionadosComunidad']) {
      return this.seccion2Component.obtenerCentrosPobladosSeleccionadosComunidad(id);
    }
    return [];
  }

  /**
   * Determina si se debe mostrar la sección de centros poblados para una comunidad
   * Se muestra si:
   * - La comunidad es nueva (esNueva = true)
   * - Tiene centros poblados ya seleccionados
   * - Hay centros poblados disponibles por nombre
   */
  debeMostrarCentrosPobladosComunidad(comunidad: ComunidadCampesina): boolean {
    if (!comunidad) {
      return false;
    }
    
    // Si es nueva, siempre mostrar
    if (comunidad.esNueva) {
      return true;
    }
    
    // Si tiene centros poblados seleccionados, mostrar
    if (comunidad.centrosPobladosSeleccionados && comunidad.centrosPobladosSeleccionados.length > 0) {
      return true;
    }
    
    // Si hay centros poblados disponibles por nombre, mostrar
    const centrosDisponibles = this.obtenerCentrosPobladosDeComunidad(comunidad.id);
    if (centrosDisponibles.length > 0) {
      return true;
    }
    
    // Si no hay ninguno de los anteriores, mostrar todos los disponibles (para comunidades nuevas o editadas)
    return this.obtenerTodosLosCentrosPoblados().length > 0;
  }

  obtenerCentrosPobladosVisibles(comunidad: ComunidadCampesina): any[] {
    if (comunidad && comunidad.esNueva) {
      return this.obtenerTodosLosCentrosPoblados();
    }
    
    // Si tiene centros seleccionados pero no hay coincidencia por nombre, mostrar todos
    const centrosPorNombre = this.obtenerCentrosPobladosDeComunidad(comunidad.id);
    if (centrosPorNombre.length === 0 && comunidad.centrosPobladosSeleccionados && comunidad.centrosPobladosSeleccionados.length > 0) {
      return this.obtenerTodosLosCentrosPoblados();
    }
    
    return centrosPorNombre;
  }

  estaCentroPobladoSeleccionadoComunidad(id: string, codigo: string): boolean {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (!comunidad || !comunidad.centrosPobladosSeleccionados) {
      return false;
    }
    const codigoNormalizado = codigo?.toString().trim() || '';
    return comunidad.centrosPobladosSeleccionados.some(
      (c: string) => c?.toString().trim() === codigoNormalizado
    );
  }

  toggleCentroPobladoComunidad(id: string, codigo: string) {
    if (this.seccion2Component && this.seccion2Component['toggleCentroPobladoComunidad']) {
      this.seccion2Component.toggleCentroPobladoComunidad(id, codigo);
      setTimeout(() => {
        this.actualizarDatos();
        this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
      }, 0);
    }
  }

  seleccionarTodosCentrosPobladosComunidad(id: string) {
    if (this.seccion2Component && this.seccion2Component['seleccionarTodosCentrosPobladosComunidad']) {
      this.seccion2Component.seleccionarTodosCentrosPobladosComunidad(id);
      setTimeout(() => {
        this.actualizarDatos();
        this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string) {
    if (this.seccion2Component && this.seccion2Component['deseleccionarTodosCentrosPobladosComunidad']) {
      this.seccion2Component.deseleccionarTodosCentrosPobladosComunidad(id);
      setTimeout(() => {
        this.actualizarDatos();
        this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  obtenerComunidades(): ComunidadCampesina[] {
    if (this.seccion2Component && this.seccion2Component['comunidadesCampesinas']) {
      this.comunidadesCampesinas = this.seccion2Component['comunidadesCampesinas'];
      return this.comunidadesCampesinas;
    }
    return this.comunidadesCampesinas;
  }

  obtenerDistritos(): Distrito[] {
    return this.distritosAISI;
  }

  obtenerCentrosPobladosDeDistrito(distritoId: string): any[] {
    const distrito = this.distritosAISI.find(d => d.id === distritoId);
    if (!distrito) {
      return [];
    }

    if (distrito.esNuevo || !distrito.nombre || distrito.nombre.startsWith('Distrito ')) {
      return this.obtenerTodosLosCentrosPoblados();
    }

    const datos = this.projectFacade.obtenerDatos();
    return this.centrosPobladosSearch.obtenerCentrosPobladosDisponiblesParaDistrito(
      distrito.nombre,
      datos
    );
  }

  obtenerCentrosPobladosVisiblesDistrito(distrito: Distrito): any[] {
    return this.obtenerCentrosPobladosDeDistrito(distrito.id);
  }

  estaCentroPobladoSeleccionadoDistrito(id: string, codigo: string): boolean {
    const datos = this.projectFacade.obtenerDatos();
    const distritosRaw = datos['distritosAISI'] || [];
    const distrito = distritosRaw.find((d: any) => d.id === id);
    
    if (!distrito || !distrito.centrosPobladosSeleccionados) {
      return false;
    }
    
    const codigoNormalizado = codigo?.toString().trim() || '';
    const codigosSeleccionados = (distrito.centrosPobladosSeleccionados || []).map((c: any) => {
      if (c === null || c === undefined) return '';
      return c.toString().trim();
    });
    
    return codigosSeleccionados.some((c: string) => c === codigoNormalizado);
  }

  toggleCentroPobladoDistrito(id: string, codigo: string) {
    if (this.seccion2Component && this.seccion2Component['toggleCentroPobladoDistrito']) {
      this.seccion2Component.toggleCentroPobladoDistrito(id, codigo);
      this.actualizarDatos();
      this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
      setTimeout(() => {
        this.actualizarDatos();
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  seleccionarTodosCentrosPobladosDistrito(id: string) {
    if (this.seccion2Component && this.seccion2Component['seleccionarTodosCentrosPobladosDistrito']) {
      this.seccion2Component.seleccionarTodosCentrosPobladosDistrito(id);
      this.actualizarDatos();
      this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
      setTimeout(() => {
        this.actualizarDatos();
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  deseleccionarTodosCentrosPobladosDistrito(id: string) {
    if (this.seccion2Component && this.seccion2Component['deseleccionarTodosCentrosPobladosDistrito']) {
      this.seccion2Component.deseleccionarTodosCentrosPobladosDistrito(id);
      this.actualizarDatos();
      this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
      setTimeout(() => {
        this.actualizarDatos();
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  agregarDistritoAISI() {
    const nombreDistrito = `Distrito ${this.distritosAISI.length + 1}`;
    const nuevoDistrito: Distrito = {
      id: `dist_${Date.now()}_${Math.random()}`,
      nombre: nombreDistrito,
      nombreOriginal: nombreDistrito,
      centrosPobladosSeleccionados: [],
      esNuevo: true
    };
    
    this.distritosAISI.push(nuevoDistrito);
    
    // ✅ USAR ProjectStateFacade.addGroup para registrar en el estado central
    this.projectFacade.addGroup('AISI', nombreDistrito, null);
    
    // Persistir también en legacy para mantener compatibilidad
    this.formChange.persistFields(this.seccionId, 'form', { ['distritosAISI']: this.distritosAISI });
    this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
    
    if (this.seccion2Component && this.seccion2Component['agregarDistritoAISI']) {
      this.seccion2Component.agregarDistritoAISI();
    }
    
    this.cdRef.detectChanges();
  }

  eliminarDistritoAISI(id: string) {
    // Encontrar el distrito para obtener su nombre antes de eliminar
    const distrito = this.distritosAISI.find(d => d.id === id);
    
    // ✅ USAR ProjectStateFacade.removeGroup para eliminar del estado central
    if (distrito) {
      // Buscar el grupo correspondiente en el estado
      const groups = this.projectFacade.aisiGroups();
      const groupToRemove = groups.find(g => g.nombre === distrito.nombre);
      if (groupToRemove) {
        this.projectFacade.removeGroup('AISI', groupToRemove.id, true);
      }
    }
    
    // Eliminar del array local
    this.distritosAISI = this.distritosAISI.filter(d => d.id !== id);
    
    if (this.seccion2Component && this.seccion2Component['eliminarDistritoAISI']) {
      this.seccion2Component.eliminarDistritoAISI(id);
    }
    
    this.actualizarDatos();
    this.formChange.persistFields(this.seccionId, 'form', { ['distritosAISI']: this.distritosAISI });
    this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
    this.cdRef.detectChanges();
  }

  actualizarNombreDistrito(id: string, nombre: string) {
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (distrito) {
      distrito.nombre = nombre;
    }
    
    if (this.seccion2Component && this.seccion2Component['actualizarNombreDistrito']) {
      this.seccion2Component.actualizarNombreDistrito(id, nombre);
    }
    
    setTimeout(() => {
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }, 0);
  }

  trackByComunidadId(index: number, comunidad: ComunidadCampesina): string {
    return comunidad.id;
  }

  trackByDistritoId(index: number, distrito: Distrito): string {
    return distrito.id;
  }
}
