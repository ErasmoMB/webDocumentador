import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { Seccion5TableConfigService } from 'src/app/core/services/domain/seccion5-table-config.service';
import { Seccion5DataService } from 'src/app/core/services/domain/seccion5-data.service';
import { Seccion5TextGeneratorService } from 'src/app/core/services/domain/seccion5-text-generator.service';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion5-form',
    templateUrl: './seccion5-form.component.html'
})
export class Seccion5FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  
  override readonly PHOTO_PREFIX = 'fotografiaInstitucionalidad';

  override watchedFields: string[] = [
    'parrafoSeccion5_institucionalidad',
    'tablepagina6',
    'tituloInstituciones',
    'fuenteInstituciones',
    'grupoAISD',
    'parrafoSeccion5_institucionalidad_A1',
    'parrafoSeccion5_institucionalidad_A2',
    'tablepagina6_A1',
    'tablepagina6_A2',
    'grupoAISD_A1',
    'grupoAISD_A2'
  ];

  private stateSubscription?: Subscription;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public tableCfg: Seccion5TableConfigService,
    private dataSrv: Seccion5DataService,
    private textGenSrv: Seccion5TextGeneratorService,
    private stateAdapter: ReactiveStateAdapter
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX, label: 'Institucionalidad' }
    ];
  }

  private isProcessingPipeline = false;

  protected override onInitCustom(): void {
    this.initDataPipeline();
    this.subscribeToStateChanges();
  }

  private initDataPipeline(): void {
    if (this.isProcessingPipeline) return;
    this.isProcessingPipeline = true;
    try {
      this.cargarTodosLosGrupos();
    } finally {
      this.isProcessingPipeline = false;
    }
  }

  private subscribeToStateChanges(): void {
    // ✅ Formularios NO deben suscribirse a cambios del store
    // Son la fuente de los cambios, no consumidores
    // La sincronización reactiva ya está manejada por BaseSectionComponent
  }

  override ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    this.guardarTodosLosGrupos();
    super.ngOnDestroy();
  }

  // ✅ Obtiene párrafo con fallback a texto por defecto
  obtenerParrafoInstitucionalidad(): string {
    return this.textGenSrv.obtenerTextoInstitucionalidad(
      this.datos,
      this.obtenerNombreComunidadActual()
    );
  }

  // ✅ Configuración dinámica de tabla
  get institucionesConfig() {
    return this.tableCfg.getTablaInstitucionesConfig();
  }

  get columnasInstituciones() {
    return this.tableCfg.getColumnasInstituciones();
  }

  // ✅ Sincronizar tabla cuando se actualiza (agregar/eliminar filas)
  onTablaActualizada(): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  // ✅ Obtiene nombre de comunidad actual (con fallback)
  override obtenerNombreComunidadActual(): string {
    return this.dataSrv.obtenerNombreComunidadActual(this.datos, this.seccionId);
  }

  obtenerSubseccionId(): string {
    const index = this.seccionId.includes('.A.1') ? '1' : (this.seccionId.includes('.A.2') ? '2' : '1');
    return `A.${index}.1`;
  }

  // ✅ Métodos obligatorios de BaseSectionComponent
  protected override detectarCambios(): boolean {
    const actual = JSON.stringify(this.projectFacade.obtenerDatos());
    const anterior = JSON.stringify(this.datosAnteriores);
    if (actual !== anterior) {
      this.datosAnteriores = JSON.parse(actual);
      return true;
    }
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo) {
      this.datos.grupoAISD = this.obtenerValorConPrefijo('grupoAISD');
      this.datos.tablepagina6 = this.obtenerValorConPrefijo('tablepagina6');
      this.datos.parrafoSeccion5_institucionalidad = this.obtenerValorConPrefijo('parrafoSeccion5_institucionalidad');
    }
  }
}
