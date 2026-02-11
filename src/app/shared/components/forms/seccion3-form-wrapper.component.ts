import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion3FormComponent } from '../seccion3/seccion3-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  selector: 'app-seccion3-form-wrapper',
  template: `<app-seccion3-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion3-form>`,
  styles: [`:host { display: block; width: 100%; }`],
  imports: [CommonModule, FormsModule, CoreSharedModule, Seccion3FormComponent],
  standalone: true
})
export class Seccion3FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.3';

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void {}

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {}
}
