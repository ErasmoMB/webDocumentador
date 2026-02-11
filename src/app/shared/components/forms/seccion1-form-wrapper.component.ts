import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion1FormComponent } from '../seccion1/seccion1-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion1FormComponent],
    selector: 'app-seccion1-form-wrapper',
    template: `<app-seccion1-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion1-form>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion1FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.1';

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
