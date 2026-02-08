import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion29FormComponent } from '../seccion29/seccion29-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule, Seccion29FormComponent],
  selector: 'app-seccion29-form-wrapper',
  template: `<app-seccion29-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion29-form>`,
  styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion29FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.8';

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
