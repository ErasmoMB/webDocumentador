import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion15Component } from '../seccion15/seccion15.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { FotoItem } from '../image-upload/image-upload.component';
import { Injector } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion15Component],
    selector: 'app-seccion15-form-wrapper',
    templateUrl: './seccion15-form-wrapper.component.html',
    styleUrls: ['./seccion15-form-wrapper.component.css']
})
export class Seccion15FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  
  formData: any = {};
  datos: any = {};
  private subscription?: Subscription;

  private projectFacade: ProjectStateFacade;
  private stateAdapter: ReactiveStateAdapter;

  constructor(
    private formChange: FormChangeService,
    private injector: Injector
  ) {
    this.projectFacade = this.injector.get(ProjectStateFacade);
    this.stateAdapter = this.injector.get(ReactiveStateAdapter);
  }

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
    // ✅ No llamar actualizarDatos() aquí - causa pérdida de caracteres
  }

  actualizarLenguasMaternas(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['actualizarLenguasMaternas']) {
      component['actualizarLenguasMaternas'](index, field, value);
      // ✅ No llamar actualizarDatos() aquí - causa pérdida de caracteres
    }
  }

  eliminarLenguasMaternas(index: number) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['eliminarLenguasMaternas']) {
      component['eliminarLenguasMaternas'](index);
      this.actualizarDatos();
    }
  }

  inicializarLenguasMaternas() {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['inicializarLenguasMaternas']) {
      component['inicializarLenguasMaternas']();
      this.actualizarDatos();
    }
  }

  agregarLenguasMaternas() {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['agregarLenguasMaternas']) {
      component['agregarLenguasMaternas']();
      this.actualizarDatos();
    }
  }

  actualizarReligiones(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['actualizarReligiones']) {
      component['actualizarReligiones'](index, field, value);
      this.actualizarDatos();
    }
  }

  eliminarReligiones(index: number) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['eliminarReligiones']) {
      component['eliminarReligiones'](index);
      this.actualizarDatos();
    }
  }

  inicializarReligiones() {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['inicializarReligiones']) {
      component['inicializarReligiones']();
      this.actualizarDatos();
    }
  }

  agregarReligiones() {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['agregarReligiones']) {
      component['agregarReligiones']();
      this.actualizarDatos();
    }
  }

  obtenerTextoSeccion15ReligionCompleto(): string {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['obtenerTextoSeccion15ReligionCompleto']) {
      return component['obtenerTextoSeccion15ReligionCompleto']();
    }
    return '';
  }
}
