import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion19FormComponent } from '../seccion19/seccion19-form.component';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion19FormComponent],
    selector: 'app-seccion19-form-wrapper',
    template: `<app-seccion19-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion19-form>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion19FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.15';
  @ViewChild(Seccion19FormComponent) seccion19FormComponent?: Seccion19FormComponent;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);
  }

  override ngOnInit() {
    // Registrar el componente interno en ViewChildHelper después del primer ciclo de detección
    setTimeout(() => {
      if (this.seccion19FormComponent) {
        ViewChildHelper.registerComponent('seccion19', this.seccion19FormComponent);
      }
    }, 0);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
