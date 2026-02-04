import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion17FormComponent } from '../seccion17/seccion17-form.component';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { BaseSectionComponent } from '../base-section.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion17FormComponent],
    selector: 'app-seccion17-form-wrapper',
    templateUrl: './seccion17-form-wrapper.component.html'
})
export class Seccion17FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.13';
  @ViewChild(Seccion17FormComponent) seccion17FormComponent?: Seccion17FormComponent;

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  override ngOnInit() {
    // ✅ Registrar el componente interno en ViewChildHelper después del primer ciclo de detección
    setTimeout(() => {
      if (this.seccion17FormComponent) {
        ViewChildHelper.registerComponent('seccion17', this.seccion17FormComponent);
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

  // Métodos delegador para compatibilidad
  obtenerTextoIDHCompleto(): string {
    return this.seccion17FormComponent?.obtenerTextoIDHCompleto() ?? '';
  }
}
