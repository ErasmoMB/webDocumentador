import { Component, Input, ChangeDetectorRef, OnDestroy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';
import { Seccion5TableConfigService } from 'src/app/core/services/domain/seccion5-table-config.service';
import { Seccion5DataService } from 'src/app/core/services/domain/seccion5-data.service';
import { Seccion5TextGeneratorService } from 'src/app/core/services/domain/seccion5-text-generator.service';
import { Subscription } from 'rxjs';

@Component({
    imports: [
        CommonModule,
        CoreSharedModule
    ],
    selector: 'app-seccion5-view-internal',
    templateUrl: './seccion5-view.component.html'
})
export class Seccion5ViewInternalComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  
  override readonly PHOTO_PREFIX = 'fotografiaInstitucionalidad';
  
  fotografiasVista: FotoItem[] = [];
  private stateSubscription?: Subscription;

  override watchedFields: string[] = [
    'parrafoSeccion5_institucionalidad',
    'grupoAISD',
    'tituloInstituciones',
    'fuenteInstituciones',
    'tablepagina6',
    'parrafoSeccion5_institucionalidad_A1',
    'parrafoSeccion5_institucionalidad_A2',
    'tablepagina6_A1',
    'tablepagina6_A2',
    'grupoAISD_A1',
    'grupoAISD_A2'
  ];

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public tableCfg: Seccion5TableConfigService,
    private dataSrv: Seccion5DataService,
    private textGenSrv: Seccion5TextGeneratorService,
    private stateAdapter: ReactiveStateAdapter
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    
    this.stateSubscription = this['stateAdapter'].datos$.subscribe(() => {
      this.cargarFotografias();
      this.cdRef.detectChanges();
    });
  }

  override ngOnDestroy() {
    this.stateSubscription?.unsubscribe();
    super.ngOnDestroy();
  }

  obtenerParrafoInstitucionalidad(): string {
    return this.textGenSrv.obtenerTextoInstitucionalidad(
      this.datos,
      this.obtenerNombreComunidadActual()
    );
  }

  get institucionesConfig() {
    return this.tableCfg.getTablaInstitucionesConfig();
  }

  get columnasInstituciones() {
    return this.tableCfg.getColumnasInstituciones();
  }

  // ✅ Obtiene nombre de comunidad actual (con fallback)
  override obtenerNombreComunidadActual(): string {
    return this.dataSrv.obtenerNombreComunidadActual(this.datos, this.seccionId);
  }

  obtenerSubseccionId(): string {
    const index = this.seccionId.includes('.A.1') ? '1' : (this.seccionId.includes('.A.2') ? '2' : '1');
    return `A.${index}.1`;
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasVista = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.cdRef.markForCheck();
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

    // Siempre intentar obtener valores con prefijo (si existe)
    this.datos.grupoAISD = this.obtenerValorConPrefijo('grupoAISD');
    this.datos.tablepagina6 = this.obtenerValorConPrefijo('tablepagina6') || this.datos.tablepagina6;
    this.datos.parrafoSeccion5_institucionalidad = this.obtenerValorConPrefijo('parrafoSeccion5_institucionalidad') || this.datos.parrafoSeccion5_institucionalidad;

    // Si aún no hay datos en tablepagina6, intentar mapear el arreglo legacy `instituciones` al formato esperado
    if ((!this.datos.tablepagina6 || !Array.isArray(this.datos.tablepagina6) || this.datos.tablepagina6.length === 0) && Array.isArray(this.datos.instituciones) && this.datos.instituciones.length > 0) {
      this.datos.tablepagina6 = this.datos.instituciones.map((inst: any) => ({
        categoria: inst.institucion || inst.categoria || '',
        respuesta: inst.disponibilidad || inst.respuesta || '',
        comentario: inst.ubicacion || inst.comentario || inst.nombre || ''
      }));
    }
  }
}
