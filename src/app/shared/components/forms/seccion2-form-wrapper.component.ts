import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion2Component } from '../seccion2/seccion2.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { GruposService } from 'src/app/core/services/domain/grupos.service';
import { ComunidadCampesina, Distrito } from 'src/app/core/models/formulario.model';
import { CentroPoblado } from 'src/app/core/models/grupos.model';
import { Subscription } from 'rxjs';
// ✅ NUEVOS SERVICIOS REFACTORIZADOS
import { CentrosPobladosSearchService } from 'src/app/core/services/centros-poblados-search.service';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion2Component],
    selector: 'app-seccion2-form-wrapper',
    templateUrl: './seccion2-form-wrapper.component.html',
    styleUrls: ['./seccion2-form-wrapper.component.css']
})
export class Seccion2FormWrapperComponent implements OnInit, OnDestroy, AfterViewInit {
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
    // ✅ NUEVO SERVICIO
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

  ngAfterViewInit() {
    // Componente hijo cargado y accesible
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
    
    // Usar servicio para buscar por nombre
    return this.centrosPobladosSearch.obtenerCentrosPobladosDeComunidadPorNombre(
      comunidad.nombre || '',
      datos
    );
  }

  private obtenerTodosLosCentrosPoblados(): any[] {
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
      // ✅ No llamar actualizarDatos() aquí - causa pérdida de caracteres
    }
  }

  // ✅ SIMPLIFICADO: Solo delegar al componente hijo
  actualizarNombreComunidad(id: string, nombre: string) {
    const nombreLimpio = (nombre || '').trim();
    
    // Actualizar array local para el ngModel
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (comunidad) {
      comunidad.nombre = nombreLimpio;
    }
    
    // ✅ DELEGAR AL COMPONENTE HIJO - Single Source of Truth
    if (this.seccion2Component && this.seccion2Component['actualizarNombreComunidad']) {
      this.seccion2Component.actualizarNombreComunidad(id, nombreLimpio);
    }
    
    // Sincronizar datos locales
    setTimeout(() => {
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }, 0);
  }

  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    if (this.seccion2Component && this.seccion2Component['obtenerCentrosPobladosSeleccionadosComunidad']) {
      return this.seccion2Component.obtenerCentrosPobladosSeleccionadosComunidad(id);
    }
    return [];
  }

  obtenerCentrosPobladosVisibles(comunidad: ComunidadCampesina): any[] {
    if (comunidad && comunidad.esNueva) {
      return this.obtenerTodosLosCentrosPoblados();
    }
    return this.obtenerCentrosPobladosDeComunidad(comunidad.id);
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
      // Esperar a que se actualicen los datos en el hijo y luego sincronizar
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

  onAutocompleteInput(field: string, value: string) {
    this.formData[field] = value;
    this.formChange.persistFields(this.seccionId, 'form', { [field]: value });
    
    if (this.seccion2Component && this.seccion2Component['onAutocompleteInput']) {
      this.seccion2Component.onAutocompleteInput(field, value);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = { ...this.seccion2Component['autocompleteData'] };
        this.cdRef.detectChanges();
      }
    }
    this.actualizarDatos();
  }

  onFocusDistritoAdicional(field: string) {
    if (this.seccion2Component && this.seccion2Component['onFocusDistritoAdicional']) {
      this.seccion2Component.onFocusDistritoAdicional(field);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = { ...this.seccion2Component['autocompleteData'] };
        this.cdRef.detectChanges();
      }
    }
  }

  cerrarSugerenciasAutocomplete(field: string) {
    if (this.seccion2Component && this.seccion2Component['cerrarSugerenciasAutocomplete']) {
      this.seccion2Component.cerrarSugerenciasAutocomplete(field);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = { ...this.seccion2Component['autocompleteData'] };
        this.cdRef.detectChanges();
      }
    }
  }

  seleccionarSugerencia(field: string, sugerencia: any) {
    if (this.seccion2Component && this.seccion2Component['seleccionarSugerencia']) {
      this.seccion2Component.seleccionarSugerencia(field, sugerencia);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = { ...this.seccion2Component['autocompleteData'] };
        this.cdRef.detectChanges();
      }
      this.actualizarDatos();
    }
  }

  trackByComunidadId(index: number, comunidad: ComunidadCampesina): string {
    return comunidad.id;
  }

  obtenerComunidades(): ComunidadCampesina[] {
    if (this.seccion2Component && this.seccion2Component['comunidadesCampesinas']) {
      this.comunidadesCampesinas = this.seccion2Component['comunidadesCampesinas'];
      return this.comunidadesCampesinas;
    }
    return this.comunidadesCampesinas;
  }

  // ===== MÉTODOS PARA DISTRITOS AISI =====

  obtenerDistritos(): Distrito[] {
    return this.distritosAISI;
  }

  // ✅ DELEGAR A SERVICIO
  obtenerCentrosPobladosDeDistrito(distritoId: string): any[] {
    const distrito = this.distritosAISI.find(d => d.id === distritoId);
    if (!distrito) {
      return [];
    }

    // Si es un distrito nuevo, mostrar todos los centros poblados
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
    // Consultar directamente desde formularioService (fuente de verdad)
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
      // Actualizar datos inmediatamente y forzar detección de cambios
      this.actualizarDatos();
      this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
      // Forzar detección de cambios de forma más agresiva
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
      // Actualizar datos inmediatamente y forzar detección de cambios
      this.actualizarDatos();
      this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
      // Forzar detección de cambios de forma más agresiva
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
      // Actualizar datos inmediatamente y forzar detección de cambios
      this.actualizarDatos();
      this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
      // Forzar detección de cambios de forma más agresiva
      setTimeout(() => {
        this.actualizarDatos();
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  agregarDistritoAISI() {
    // Crear nuevo distrito
    const nuevoDistrito: Distrito = {
      id: `dist_${Date.now()}_${Math.random()}`,
      nombre: `Distrito ${this.distritosAISI.length + 1}`,
      nombreOriginal: `Distrito ${this.distritosAISI.length + 1}`,
      centrosPobladosSeleccionados: [],
      esNuevo: true
    };
    
    // Agregar al array local
    this.distritosAISI.push(nuevoDistrito);
    
    // Guardar en formularioService
    this.formChange.persistFields(this.seccionId, 'form', { ['distritosAISI']: this.distritosAISI });
    this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
    
    // Actualizar en el componente hijo si existe
    if (this.seccion2Component && this.seccion2Component['agregarDistritoAISI']) {
      this.seccion2Component.agregarDistritoAISI();
    }
  }

  eliminarDistritoAISI(id: string) {
    if (this.seccion2Component && this.seccion2Component['eliminarDistritoAISI']) {
      this.seccion2Component.eliminarDistritoAISI(id);
      this.actualizarDatos();
      this.stateAdapter.setDatos(this.projectFacade.obtenerDatos() as any);
    }
  }

  // ✅ SIMPLIFICADO: Solo delegar al componente hijo
  actualizarNombreDistrito(id: string, nombre: string) {
    // Actualizar array local para el ngModel
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (distrito) {
      distrito.nombre = nombre;
    }
    
    // ✅ DELEGAR AL COMPONENTE HIJO - Single Source of Truth
    if (this.seccion2Component && this.seccion2Component['actualizarNombreDistrito']) {
      this.seccion2Component.actualizarNombreDistrito(id, nombre);
    }
    
    // Sincronizar datos locales
    setTimeout(() => {
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }, 0);
  }


  trackByDistritoId(index: number, distrito: Distrito): string {
    return distrito.id;
  }
}
