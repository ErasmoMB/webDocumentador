import { Component, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';

@Component({
  selector: 'app-seccion30-form-wrapper',
  templateUrl: './seccion30-form-wrapper.component.html',
  styleUrls: ['./seccion30-form-wrapper.component.css']
})
export class Seccion30FormWrapperComponent {
  @Input() seccionId: string = '';

  constructor(private formularioService: FormularioService) {}

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formularioService.actualizarDato(fieldId as any, valorLimpio);
  }

  obtenerTextoSeccion30IndicadoresEducacionIntro(): string {
    const component = ViewChildHelper.getComponent('seccion30');
    if (component && component['obtenerTextoSeccion30IndicadoresEducacionIntro']) {
      return component['obtenerTextoSeccion30IndicadoresEducacionIntro']();
    }
    return '';
  }
}
