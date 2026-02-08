import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion24FormComponent } from '../seccion24/seccion24-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule, Seccion24FormComponent],
  selector: 'app-seccion24-form-wrapper',
  template: `<app-seccion24-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion24-form>`,
  styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion24FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.3';

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
