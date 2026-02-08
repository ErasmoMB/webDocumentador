import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion18FormComponent } from '../seccion18/seccion18-form.component';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion18FormComponent],
    selector: 'app-seccion18-form-wrapper',
    templateUrl: './seccion18-form-wrapper.component.html'
})
export class Seccion18FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.14';
  @ViewChild(Seccion18FormComponent) seccion18FormComponent?: Seccion18FormComponent;

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  override ngOnInit() {
    setTimeout(() => {
      if (this.seccion18FormComponent) {
        ViewChildHelper.registerComponent('seccion18', this.seccion18FormComponent);
      }
    }, 0);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void { }

  protected override actualizarDatosCustom(): void { }
}
