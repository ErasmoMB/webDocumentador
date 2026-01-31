import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion14Component } from '../seccion14/seccion14.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion14Component],
    selector: 'app-seccion14-form-wrapper',
    templateUrl: './seccion14-form-wrapper.component.html',
    styleUrls: ['./seccion14-form-wrapper.component.css']
})
export class Seccion14FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  
  formData: any = {};
  datos: any = {};
  private subscription?: Subscription;

  constructor(
    private projectFacade: ProjectStateFacade,
    private stateAdapter: ReactiveStateAdapter,
    private formChange: FormChangeService
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
    this.datos = this.projectFacade.obtenerDatos();
    this.formData = { ...this.datos };
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
    // ✅ No llamar actualizarDatos() aquí - el formData ya está actualizado
    // y llamar actualizarDatos() sobrescribiría el valor que el usuario está escribiendo
  }

  actualizarNivelEducativo(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['actualizarNivelEducativo']) {
      component['actualizarNivelEducativo'](index, field, value);
      // ✅ No llamar actualizarDatos() aquí - causa pérdida de caracteres
    }
  }

  eliminarNivelEducativo(index: number) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['eliminarNivelEducativo']) {
      component['eliminarNivelEducativo'](index);
      this.actualizarDatos();
    }
  }

  inicializarNivelEducativo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['inicializarNivelEducativo']) {
      component['inicializarNivelEducativo']();
      this.actualizarDatos();
    }
  }

  agregarNivelEducativo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['agregarNivelEducativo']) {
      component['agregarNivelEducativo']();
      this.actualizarDatos();
    }
  }

  actualizarTasaAnalfabetismo(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['actualizarTasaAnalfabetismo']) {
      component['actualizarTasaAnalfabetismo'](index, field, value);
      this.actualizarDatos();
    }
  }

  eliminarTasaAnalfabetismo(index: number) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['eliminarTasaAnalfabetismo']) {
      component['eliminarTasaAnalfabetismo'](index);
      this.actualizarDatos();
    }
  }

  inicializarTasaAnalfabetismo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['inicializarTasaAnalfabetismo']) {
      component['inicializarTasaAnalfabetismo']();
      this.actualizarDatos();
    }
  }

  agregarTasaAnalfabetismo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['agregarTasaAnalfabetismo']) {
      component['agregarTasaAnalfabetismo']();
      this.actualizarDatos();
    }
  }

  obtenerTextoSeccion14IndicadoresEducacionIntro(): string {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['obtenerTextoSeccion14IndicadoresEducacionIntro']) {
      return component['obtenerTextoSeccion14IndicadoresEducacionIntro']();
    }
    return '';
  }
}
