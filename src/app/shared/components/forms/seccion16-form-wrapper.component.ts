import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion16-form-wrapper',
  templateUrl: './seccion16-form-wrapper.component.html',
  styleUrls: ['./seccion16-form-wrapper.component.css']
})
export class Seccion16FormWrapperComponent implements OnInit, OnDestroy {
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

  obtenerTextoSeccion16AguaCompleto(): string {
    const component = ViewChildHelper.getComponent('seccion16');
    if (component && component['obtenerTextoSeccion16AguaCompleto']) {
      return component['obtenerTextoSeccion16AguaCompleto']();
    }
    return '';
  }

  obtenerTextoSeccion16RecursosNaturalesCompleto(): string {
    const component = ViewChildHelper.getComponent('seccion16');
    if (component && component['obtenerTextoSeccion16RecursosNaturalesCompleto']) {
      return component['obtenerTextoSeccion16RecursosNaturalesCompleto']();
    }
    return '';
  }
}
