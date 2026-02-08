import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion16FormComponent } from '../seccion16/seccion16-form.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion16FormComponent],
    selector: 'app-seccion16-form-wrapper',
    templateUrl: './seccion16-form-wrapper.component.html',
    styleUrls: ['./seccion16-form-wrapper.component.css']
})
export class Seccion16FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  @ViewChild(Seccion16FormComponent) seccion16FormComponent?: Seccion16FormComponent;
  
  formData: any = {};
  datos: any = {};
  private subscription?: Subscription;

  constructor(
    private projectFacade: ProjectStateFacade,
    private stateAdapter: ReactiveStateAdapter,
    private formChange: FormChangeService
  ) {}

  ngOnInit() {
    // ✅ Registrar el componente interno en ViewChildHelper después del primer ciclo de detección
    setTimeout(() => {
      if (this.seccion16FormComponent) {
        ViewChildHelper.registerComponent('seccion16', this.seccion16FormComponent);
      }
    }, 0);
    
    // Solo cargar datos iniciales, NO suscribirse a cambios
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

  obtenerTextoSeccion16AguaCompleto(): string {
    return this.seccion16FormComponent?.obtenerTextoAguaCompleto() ?? '';
  }

  obtenerTextoSeccion16RecursosNaturalesCompleto(): string {
    return this.seccion16FormComponent?.obtenerTextoRecursosNaturalesCompleto() ?? '';
  }
}
