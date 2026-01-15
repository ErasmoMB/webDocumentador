import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion7-form-wrapper',
  templateUrl: './seccion7-form-wrapper.component.html',
  styleUrls: ['./seccion7-form-wrapper.component.css']
})
export class Seccion7FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  
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

  actualizarPEAOcupada(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion23');
    if (component && component['actualizarPEAOcupadaDesocupada']) {
      component['actualizarPEAOcupadaDesocupada'](index, field, value);
      this.actualizarDatos();
    }
  }

  eliminarPEAOcupada(index: number) {
    const component = ViewChildHelper.getComponent('seccion23');
    if (component && component['eliminarPEAOcupadaDesocupada']) {
      component['eliminarPEAOcupadaDesocupada'](index);
      this.actualizarDatos();
    }
  }

  inicializarPEAOcupada() {
    const component = ViewChildHelper.getComponent('seccion23');
    if (component && component['inicializarPEAOcupadaDesocupada']) {
      component['inicializarPEAOcupadaDesocupada']();
      this.actualizarDatos();
    }
  }

  agregarPEAOcupada() {
    const component = ViewChildHelper.getComponent('seccion23');
    if (component && component['agregarPEAOcupadaDesocupada']) {
      component['agregarPEAOcupadaDesocupada']();
      this.actualizarDatos();
    }
  }
}
