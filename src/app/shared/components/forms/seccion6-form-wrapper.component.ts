import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion6FormComponent } from '../seccion6/seccion6-form.component';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion6FormComponent],
    selector: 'app-seccion6-form-wrapper',
    template: `<app-seccion6-form [seccionId]="seccionId" [modoFormulario]="true"></app-seccion6-form>`,
    styles: [`:host { display: block; width: 100%; }`]
})
export class Seccion6FormWrapperComponent extends AutoLoadSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.2';

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override autoLoader: AutoBackendDataLoaderService,
    protected override tableFacade: TableManagementFacade
  ) {
    super(cdRef, autoLoader, injector, undefined, tableFacade);
  }

  protected override onInitCustom(): void {
    this.actualizarDatos();
  }

  protected getSectionKey(): string {
    return 'seccion6_aisd';
  }

  protected getLoadParameters(): string[] | null {
    return null;
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    // Seccion6 no requiere actualización de valores con prefijo
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
