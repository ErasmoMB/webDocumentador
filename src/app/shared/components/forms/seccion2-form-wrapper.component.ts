import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { Seccion2Component } from '../seccion2/seccion2.component';
import { ComunidadCampesina, Distrito } from 'src/app/core/models/formulario.model';
import { Subscription } from 'rxjs';

@Component({
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
    private formularioService: FormularioService,
    private stateService: StateService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.actualizarDatos();
    this.subscription = this.stateService.datos$.subscribe(datos => {
      if (datos) {
        this.actualizarDatos();
      }
    });
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
    const datos = this.formularioService.obtenerDatos();
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

  obtenerCentrosPobladosDeComunidad(comunidadId: string): any[] {
    const datos = this.formularioService.obtenerDatos();
    const jsonCompleto = datos['jsonCompleto'];
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === comunidadId);
    
    if (!comunidad) {
      return [];
    }
    
    if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
      const nombreGrupo = comunidad.nombre;
      
      const keys = Object.keys(jsonCompleto);
      for (const key of keys) {
        let keySinPrefijo = key;
        if (key.toUpperCase().startsWith('CCPP ')) {
          keySinPrefijo = key.substring(5).trim();
        }
        
        if (keySinPrefijo === nombreGrupo || key === nombreGrupo) {
          if (Array.isArray(jsonCompleto[key])) {
            return jsonCompleto[key];
          }
        }
      }
      
      for (const key of keys) {
        let keySinPrefijo = key;
        if (key.toUpperCase().startsWith('CCPP ')) {
          keySinPrefijo = key.substring(5).trim();
        }
        
        if (keySinPrefijo.toLowerCase().includes(nombreGrupo.toLowerCase()) || 
            nombreGrupo.toLowerCase().includes(keySinPrefijo.toLowerCase())) {
          if (Array.isArray(jsonCompleto[key])) {
            return jsonCompleto[key];
          }
        }
      }
    }
    
    return this.obtenerTodosLosCentrosPoblados();
  }

  private obtenerTodosLosCentrosPoblados(): any[] {
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

    return resultado;
  }

  private aplanarJsonCentros(): any[] {
    const datos = this.formularioService.obtenerDatos();
    const jsonCompleto = datos['jsonCompleto'];
    const centros: any[] = [];

    if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
      Object.values(jsonCompleto).forEach(value => {
        if (Array.isArray(value)) {
          centros.push(...value);
        }
      });
    }

    return centros;
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    this.formularioService.actualizarDato(fieldId as any, valorLimpio);
    this.actualizarDatos();
  }

  eliminarComunidadCampesina(id: string) {
    if (this.seccion2Component && this.seccion2Component['eliminarComunidadCampesina']) {
      this.seccion2Component.eliminarComunidadCampesina(id);
      this.actualizarDatos();
      this.stateService.setDatos(this.formularioService.obtenerDatos());
    }
  }

  agregarComunidadCampesina() {
    if (this.seccion2Component && this.seccion2Component['agregarComunidadCampesina']) {
      const todosLosCentros = this.obtenerTodosLosCentrosPoblados();
      this.seccion2Component.agregarComunidadCampesina();
      this.actualizarDatos();
    }
  }

  actualizarNombreComunidad(id: string, nombre: string) {
    // Crear un nuevo array con la comunidad actualizada (para detectar cambios en Angular)
    this.comunidadesCampesinas = this.comunidadesCampesinas.map(cc => 
      cc.id === id ? { ...cc, nombre: nombre } : cc
    );
    
    // Actualizar en el componente hijo si existe
    if (this.seccion2Component && this.seccion2Component['actualizarNombreComunidad']) {
      this.seccion2Component.actualizarNombreComunidad(id, nombre);
    }
    
    // Guardar los cambios en formularioService y stateService
    this.formularioService.actualizarDato('comunidadesCampesinas', this.comunidadesCampesinas);
    this.stateService.setDatos(this.formularioService.obtenerDatos());
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
        this.stateService.setDatos(this.formularioService.obtenerDatos());
      }, 0);
    }
  }

  seleccionarTodosCentrosPobladosComunidad(id: string) {
    if (this.seccion2Component && this.seccion2Component['seleccionarTodosCentrosPobladosComunidad']) {
      this.seccion2Component.seleccionarTodosCentrosPobladosComunidad(id);
      setTimeout(() => {
        this.actualizarDatos();
        this.stateService.setDatos(this.formularioService.obtenerDatos());
      }, 0);
    }
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string) {
    if (this.seccion2Component && this.seccion2Component['deseleccionarTodosCentrosPobladosComunidad']) {
      this.seccion2Component.deseleccionarTodosCentrosPobladosComunidad(id);
      setTimeout(() => {
        this.actualizarDatos();
        this.stateService.setDatos(this.formularioService.obtenerDatos());
      }, 0);
    }
  }

  onAutocompleteInput(field: string, value: string) {
    this.formData[field] = value;
    this.formularioService.actualizarDato(field as any, value);
    
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

  obtenerCentrosPobladosDeDistrito(distritoId: string): any[] {
    const distrito = this.distritosAISI.find(d => d.id === distritoId);
    if (!distrito) {
      return [];
    }

    // Si es un distrito nuevo, mostrar todos los centros poblados
    if (distrito.esNuevo || !distrito.nombre || distrito.nombre.startsWith('Distrito ')) {
      return this.obtenerTodosLosCentrosPoblados();
    }

    const datos = this.formularioService.obtenerDatos();
    const jsonCompleto = datos['jsonCompleto'];
    
    // Buscar centros poblados que pertenecen a este distrito (por DIST)
    if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
      const centrosDelDistrito: any[] = [];
      const nombreDistritoUpper = distrito.nombre.trim().toUpperCase();
      
      // Recorrer todas las comunidades en el JSON
      Object.keys(jsonCompleto).forEach(key => {
        const centrosPoblados = jsonCompleto[key];
        if (Array.isArray(centrosPoblados)) {
          // Filtrar centros que pertenecen a este distrito
          centrosPoblados.forEach((cp: any) => {
            const distDelCentro = (cp.DIST || cp.dist || '').trim().toUpperCase();
            if (distDelCentro === nombreDistritoUpper) {
              centrosDelDistrito.push(cp);
            }
          });
        }
      });
      
      if (centrosDelDistrito.length > 0) {
        return centrosDelDistrito;
      }
    }
    
    return this.obtenerTodosLosCentrosPoblados();
  }

  obtenerCentrosPobladosVisiblesDistrito(distrito: Distrito): any[] {
    return this.obtenerCentrosPobladosDeDistrito(distrito.id);
  }

  estaCentroPobladoSeleccionadoDistrito(id: string, codigo: string): boolean {
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (!distrito || !distrito.centrosPobladosSeleccionados) {
      return false;
    }
    const codigoNormalizado = codigo?.toString().trim() || '';
    return distrito.centrosPobladosSeleccionados.some(
      (c: string) => c?.toString().trim() === codigoNormalizado
    );
  }

  toggleCentroPobladoDistrito(id: string, codigo: string) {
    if (this.seccion2Component && this.seccion2Component['toggleCentroPobladoDistrito']) {
      this.seccion2Component.toggleCentroPobladoDistrito(id, codigo);
      // Esperar a que se actualicen los datos en el hijo y luego sincronizar
      setTimeout(() => {
        this.actualizarDatos();
        this.stateService.setDatos(this.formularioService.obtenerDatos());
      }, 0);
    }
  }

  seleccionarTodosCentrosPobladosDistrito(id: string) {
    if (this.seccion2Component && this.seccion2Component['seleccionarTodosCentrosPobladosDistrito']) {
      this.seccion2Component.seleccionarTodosCentrosPobladosDistrito(id);
    }
  }

  deseleccionarTodosCentrosPobladosDistrito(id: string) {
    if (this.seccion2Component && this.seccion2Component['deseleccionarTodosCentrosPobladosDistrito']) {
      this.seccion2Component.deseleccionarTodosCentrosPobladosDistrito(id);
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
    this.formularioService.actualizarDato('distritosAISI', this.distritosAISI);
    this.stateService.setDatos(this.formularioService.obtenerDatos());
    
    // Actualizar en el componente hijo si existe
    if (this.seccion2Component && this.seccion2Component['agregarDistritoAISI']) {
      this.seccion2Component.agregarDistritoAISI();
    }
  }

  eliminarDistritoAISI(id: string) {
    if (this.seccion2Component && this.seccion2Component['eliminarDistritoAISI']) {
      this.seccion2Component.eliminarDistritoAISI(id);
      this.actualizarDatos();
      this.stateService.setDatos(this.formularioService.obtenerDatos());
    }
  }

  actualizarNombreDistrito(id: string, nombre: string) {
    // Crear un nuevo array con el distrito actualizado (para detectar cambios en Angular)
    this.distritosAISI = this.distritosAISI.map(d => 
      d.id === id ? { ...d, nombre: nombre } : d
    );
    
    // Actualizar en el componente hijo si existe
    if (this.seccion2Component && this.seccion2Component['actualizarNombreDistrito']) {
      this.seccion2Component.actualizarNombreDistrito(id, nombre);
    }
    
    // Guardar los cambios en formularioService y stateService
    this.formularioService.actualizarDato('distritosAISI', this.distritosAISI);
    this.stateService.setDatos(this.formularioService.obtenerDatos());
  }

  trackByDistritoId(index: number, distrito: Distrito): string {
    return distrito.id;
  }
}
