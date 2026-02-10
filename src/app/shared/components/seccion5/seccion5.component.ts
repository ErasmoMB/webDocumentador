import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { Seccion5FormComponent } from './seccion5-form.component';
import { Seccion5ViewComponent } from './seccion5-view.component';

@Component({
    imports: [
        CommonModule,
        Seccion5FormComponent,
        Seccion5ViewComponent
    ],
    selector: 'app-seccion5',
    template: `
    <app-seccion5-form 
      *ngIf="modoFormulario"
      [seccionId]="seccionId">
    </app-seccion5-form>
    
    <app-seccion5-view 
      *ngIf="!modoFormulario"
      [seccionId]="seccionId">
    </app-seccion5-view>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion5Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
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
  }

  protected getSectionKey(): string {
    return 'seccion5_aisd';
  }

  protected getLoadParameters(): string[] | null {
    return null;
  }

  protected override detectarCambios(): boolean {
    const groupId = this.obtenerPrefijoGrupo() || null;
    const datosActuales = this.projectFacade.getSectionFields(this.seccionId, groupId);
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo];
      const valorAnterior = this.datosAnteriores[campo];
      
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual || null));
      }
    }
    
    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    this.datos.grupoAISD = this.obtenerValorConPrefijo('grupoAISD');
    this.datos.tablepagina6 = this.obtenerValorConPrefijo('tablepagina6');
    this.datos.parrafoSeccion5_institucionalidad = this.obtenerValorConPrefijo('parrafoSeccion5_institucionalidad');
    this.datos.tituloInstituciones = this.obtenerValorConPrefijo('tituloInstituciones');
    this.datos.fuenteInstituciones = this.obtenerValorConPrefijo('fuenteInstituciones');
  }

  override watchedFields: string[] = [
    'parrafoSeccion5_institucionalidad',
    'grupoAISD',
    'tituloInstituciones',
    'fuenteInstituciones',
    'tablepagina6',
    // Prefijos comunes
    'parrafoSeccion5_institucionalidad_A1',
    'parrafoSeccion5_institucionalidad_A2',
    'tablepagina6_A1',
    'tablepagina6_A2',
    'grupoAISD_A1',
    'grupoAISD_A2'
  ];

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}

