import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion30Component } from '../seccion30/seccion30.component';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion30Component],
    selector: 'app-seccion30-form-wrapper',
    templateUrl: './seccion30-form-wrapper.component.html',
    styleUrls: ['./seccion30-form-wrapper.component.css']
})
export class Seccion30FormWrapperComponent {
  @Input() seccionId: string = '';

  constructor(
    private formChange: FormChangeService
  ) {}

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
  }

  obtenerTextoSeccion30IndicadoresEducacionIntro(): string {
    const component = ViewChildHelper.getComponent('seccion30');
    if (component && component['obtenerTextoSeccion30IndicadoresEducacionIntro']) {
      return component['obtenerTextoSeccion30IndicadoresEducacionIntro']();
    }
    return '';
  }
}
