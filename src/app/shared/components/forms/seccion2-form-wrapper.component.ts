import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion2FormComponent } from '../seccion2/seccion2-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule, Seccion2FormComponent],
  selector: 'app-seccion2-form-wrapper',
  template: '<app-seccion2-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion2-form>',
  styles: [':host { display: block; width: 100%; }']
})
export class Seccion2FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.2';

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