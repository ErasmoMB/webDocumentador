import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion15FormComponent } from '../seccion15/seccion15-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion15FormComponent],
    selector: 'app-seccion15-form-wrapper',
    template: `<app-seccion15-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion15-form>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion15FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.11';

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
