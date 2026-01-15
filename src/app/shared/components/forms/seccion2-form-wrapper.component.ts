import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { ComunidadCampesina } from 'src/app/core/models/formulario.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion2-form-wrapper',
  templateUrl: './seccion2-form-wrapper.component.html',
  styleUrls: ['./seccion2-form-wrapper.component.css']
})
export class Seccion2FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  
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
    setTimeout(() => {
      const seccion2 = ViewChildHelper.getComponent('seccion2');
      if (seccion2 && seccion2['autocompleteData']) {
        this.autocompleteData = seccion2['autocompleteData'];
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  actualizarDatos() {
    const datos = this.formularioService.obtenerDatos();
    this.formData = { ...datos };
    this.comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
    this.centrosPobladosJSON = datos['centrosPobladosJSON'] || [];
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
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['eliminarComunidadCampesina']) {
      component['eliminarComunidadCampesina'](id);
      this.actualizarDatos();
    }
  }

  agregarComunidadCampesina() {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['agregarComunidadCampesina']) {
      component['agregarComunidadCampesina']();
      this.actualizarDatos();
    }
  }

  actualizarNombreComunidad(id: string, nombre: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['actualizarNombreComunidad']) {
      component['actualizarNombreComunidad'](id, nombre);
    }
  }

  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['obtenerCentrosPobladosSeleccionadosComunidad']) {
      return component['obtenerCentrosPobladosSeleccionadosComunidad'](id);
    }
    return [];
  }

  estaCentroPobladoSeleccionadoComunidad(id: string, codigo: string): boolean {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['estaCentroPobladoSeleccionadoComunidad']) {
      return component['estaCentroPobladoSeleccionadoComunidad'](id, codigo);
    }
    return false;
  }

  toggleCentroPobladoComunidad(id: string, codigo: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['toggleCentroPobladoComunidad']) {
      component['toggleCentroPobladoComunidad'](id, codigo);
      this.actualizarDatos();
    }
  }

  seleccionarTodosCentrosPobladosComunidad(id: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['seleccionarTodosCentrosPobladosComunidad']) {
      component['seleccionarTodosCentrosPobladosComunidad'](id);
      this.actualizarDatos();
    }
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['deseleccionarTodosCentrosPobladosComunidad']) {
      component['deseleccionarTodosCentrosPobladosComunidad'](id);
      this.actualizarDatos();
    }
  }

  onAutocompleteInput(field: string, value: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['onAutocompleteInput']) {
      component['onAutocompleteInput'](field, value);
      if (component['autocompleteData']) {
        this.autocompleteData = component['autocompleteData'];
      }
    }
  }

  onFocusDistritoAdicional(field: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['onFocusDistritoAdicional']) {
      component['onFocusDistritoAdicional'](field);
      if (component['autocompleteData']) {
        this.autocompleteData = component['autocompleteData'];
      }
    }
  }

  cerrarSugerenciasAutocomplete(field: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['cerrarSugerenciasAutocomplete']) {
      component['cerrarSugerenciasAutocomplete'](field);
      if (component['autocompleteData']) {
        this.autocompleteData = component['autocompleteData'];
      }
    }
  }

  seleccionarSugerencia(field: string, sugerencia: any) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['seleccionarSugerencia']) {
      component['seleccionarSugerencia'](field, sugerencia);
      if (component['autocompleteData']) {
        this.autocompleteData = component['autocompleteData'];
      }
      this.actualizarDatos();
    }
  }
}
