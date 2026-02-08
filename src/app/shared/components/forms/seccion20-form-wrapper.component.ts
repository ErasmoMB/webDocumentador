import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion20FormComponent } from '../seccion20/seccion20-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule, Seccion20FormComponent],
  selector: 'app-seccion20-form-wrapper',
  template: `<app-seccion20-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion20-form>`,
  styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion20FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.16';

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
