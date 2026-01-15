import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion15-form-wrapper',
  templateUrl: './seccion15-form-wrapper.component.html',
  styleUrls: ['./seccion15-form-wrapper.component.css']
})
export class Seccion15FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  @Input() fotografiasIglesiaFormMulti: FotoItem[] = [];
  
  formData: any = {};
  datos: any = {};
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

  actualizarDatos() {
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };
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

  actualizarLenguasMaternas(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['actualizarLenguasMaternas']) {
      component['actualizarLenguasMaternas'](index, field, value);
      this.actualizarDatos();
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

  onFotografiasIglesiaChange(fotografias: FotoItem[]) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['onFotografiasIglesiaChange']) {
      component['onFotografiasIglesiaChange'](fotografias);
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
