import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion9FormComponent } from '../seccion9/seccion9-form.component';
import { BaseSectionComponent } from '../base-section.component';
import { SECCION9_CONFIG } from '../seccion9/seccion9-constants';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion9FormComponent],
    selector: 'app-seccion9-form-wrapper',
    template: `<app-seccion9-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion9-form>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion9FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = SECCION9_CONFIG.sectionId;

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
