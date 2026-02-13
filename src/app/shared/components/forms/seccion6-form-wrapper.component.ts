import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion6FormComponent } from '../seccion6/seccion6-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion6FormComponent],
    selector: 'app-seccion6-form-wrapper',
    template: `<app-seccion6-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion6-form>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion6FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '';

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void { }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    // Seccion6 no requiere actualización de valores con prefijo
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
