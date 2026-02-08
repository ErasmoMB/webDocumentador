import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion28FormComponent } from '../seccion28/seccion28-form.component';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule, Seccion28FormComponent],
  selector: 'app-seccion28-form-wrapper',
  template: `<app-seccion28-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion28-form>`,
  styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion28FormWrapperComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.7';

  @ViewChild(Seccion28FormComponent) seccion28FormComponent?: Seccion28FormComponent;

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);
  }

  // Proxy to inner form component so external callers can request synchronization
  public sincronizarTablaDesdeStore(tablaKeyBase: string): void {
    try {
      if (this.seccion28FormComponent && typeof this.seccion28FormComponent['sincronizarTablaDesdeStore'] === 'function') {
        this.seccion28FormComponent.sincronizarTablaDesdeStore(tablaKeyBase);
      }
    } catch (e) {
    }
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }
}
