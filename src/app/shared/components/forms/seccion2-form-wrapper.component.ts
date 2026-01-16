import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { Seccion2Component } from '../seccion2/seccion2.component';
import { ComunidadCampesina } from 'src/app/core/models/formulario.model';
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
  centrosPobladosJSON: any[] = [];
  autocompleteData: any = {};
  private subscription?: Subscription;

  constructor(
    private formularioService: FormularioService,
    private stateService: StateService
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
    this.comunidadesCampesinas = comunidadesRaw.map((cc: any) => ({
      ...cc,
      centrosPobladosSeleccionados: (cc.centrosPobladosSeleccionados || []).map((c: any) => {
        if (c === null || c === undefined) return '';
        return c.toString().trim();
      }).filter((codigo: string) => codigo !== '')
    }));
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
    
    const codigosSeleccionados = comunidad.centrosPobladosSeleccionados || [];
    if (codigosSeleccionados.length > 0) {
      const codigosSet = new Set(codigosSeleccionados.map((c: string) => c?.toString().trim() || ''));
      return this.centrosPobladosJSON.filter((cp: any) => {
        const codigo = cp.CODIGO;
        if (codigo === null || codigo === undefined) return false;
        const codigoStr = codigo.toString().trim();
        return codigoStr && codigosSet.has(codigoStr);
      });
    }
    
    return this.centrosPobladosJSON;
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
      this.seccion2Component.agregarComunidadCampesina();
      this.actualizarDatos();
    }
  }

  actualizarNombreComunidad(id: string, nombre: string) {
    if (this.seccion2Component && this.seccion2Component['actualizarNombreComunidad']) {
      this.seccion2Component.actualizarNombreComunidad(id, nombre);
    }
  }

  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    if (this.seccion2Component && this.seccion2Component['obtenerCentrosPobladosSeleccionadosComunidad']) {
      return this.seccion2Component.obtenerCentrosPobladosSeleccionadosComunidad(id);
    }
    return [];
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
      this.actualizarDatos();
      this.stateService.setDatos(this.formularioService.obtenerDatos());
    }
  }

  seleccionarTodosCentrosPobladosComunidad(id: string) {
    if (this.seccion2Component && this.seccion2Component['seleccionarTodosCentrosPobladosComunidad']) {
      this.seccion2Component.seleccionarTodosCentrosPobladosComunidad(id);
      this.actualizarDatos();
      this.stateService.setDatos(this.formularioService.obtenerDatos());
    }
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string) {
    if (this.seccion2Component && this.seccion2Component['deseleccionarTodosCentrosPobladosComunidad']) {
      this.seccion2Component.deseleccionarTodosCentrosPobladosComunidad(id);
      this.actualizarDatos();
      this.stateService.setDatos(this.formularioService.obtenerDatos());
    }
  }

  onAutocompleteInput(field: string, value: string) {
    this.formData[field] = value;
    this.formularioService.actualizarDato(field as any, value);
    
    if (this.seccion2Component && this.seccion2Component['onAutocompleteInput']) {
      this.seccion2Component.onAutocompleteInput(field, value);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = this.seccion2Component['autocompleteData'];
      }
    }
    this.actualizarDatos();
  }

  onFocusDistritoAdicional(field: string) {
    if (this.seccion2Component && this.seccion2Component['onFocusDistritoAdicional']) {
      this.seccion2Component.onFocusDistritoAdicional(field);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = this.seccion2Component['autocompleteData'];
      }
    }
  }

  cerrarSugerenciasAutocomplete(field: string) {
    if (this.seccion2Component && this.seccion2Component['cerrarSugerenciasAutocomplete']) {
      this.seccion2Component.cerrarSugerenciasAutocomplete(field);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = this.seccion2Component['autocompleteData'];
      }
    }
  }

  seleccionarSugerencia(field: string, sugerencia: any) {
    if (this.seccion2Component && this.seccion2Component['seleccionarSugerencia']) {
      this.seccion2Component.seleccionarSugerencia(field, sugerencia);
      if (this.seccion2Component['autocompleteData']) {
        this.autocompleteData = this.seccion2Component['autocompleteData'];
      }
      this.actualizarDatos();
    }
  }

  trackByComunidadId(index: number, comunidad: ComunidadCampesina): string {
    return comunidad.id;
  }
}
