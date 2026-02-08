import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion3Component } from '../seccion3/seccion3.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion3Component],
    selector: 'app-seccion3-form-wrapper',
    template: `<app-seccion3 [seccionId]="seccionId" [modoFormulario]="true"></app-seccion3>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion3FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.3';

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
