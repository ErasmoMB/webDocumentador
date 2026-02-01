import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { Seccion6FormComponent } from './seccion6-form.component';
import { Seccion6ViewInternalComponent } from './seccion6-view-internal.component';

@Component({
    imports: [
        CommonModule,
        Seccion6FormComponent,
        Seccion6ViewInternalComponent
    ],
    selector: 'app-seccion6',
    template: `
    <app-seccion6-form 
      *ngIf="modoFormulario"
      [seccionId]="seccionId">
    </app-seccion6-form>
    
    <app-seccion6-view-internal 
      *ngIf="!modoFormulario"
      [seccionId]="seccionId">
    </app-seccion6-view-internal>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion6Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.2';
  @Input() override modoFormulario: boolean = false;

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
    this.logGrupoActual();
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

