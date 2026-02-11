import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector, Signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { Seccion5TableConfigService } from 'src/app/core/services/domain/seccion5-table-config.service';
import { Seccion5DataService } from 'src/app/core/services/domain/seccion5-data.service';
import { Seccion5TextGeneratorService } from 'src/app/core/services/domain/seccion5-text-generator.service';
import { SECCION5_WATCHED_FIELDS, SECCION5_PHOTO_PREFIX } from './seccion5-constants';

@Component({
    standalone: true,
    imports: [CommonModule, CoreSharedModule, ImageUploadComponent],
    selector: 'app-seccion5-view',
    templateUrl: './seccion5-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion5ViewComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = SECCION5_PHOTO_PREFIX.INSTITUCIONALIDAD;
  override useReactiveSync: boolean = false;
  override watchedFields: string[] = SECCION5_WATCHED_FIELDS;

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly institucionesSignal: Signal<any[]>;
  readonly photoFieldsHash: Signal<string>;
  readonly viewModel: Signal<any>;
  readonly columnasInstituciones: any[] = [];
  readonly institucionesConfig: any = {};
  
  fotografiasVista: FotoItem[] = [];
  fotografiasVistaCache: FotoItem[] = [];

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public tableCfg: Seccion5TableConfigService,
    private dataSrv: Seccion5DataService,
    private textGen: Seccion5TextGeneratorService
  ) {
    super(cdRef, injector);

    // Obtener configuración de tabla
    this.columnasInstituciones = this.tableCfg.getColumnasInstituciones();
    this.institucionesConfig = {};
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX, label: 'Institucionalidad' }
    ];

    this.formDataSignal = computed(() => {
      return this.projectFacade.selectSectionFields(this.seccionId, null)();
    });

    this.institucionesSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const tablaKey = `institucionesSeccion5${prefijo}`;
      const data = this.formDataSignal();
      const instituciones = data[tablaKey] || data['institucionesSeccion5'];
      return Array.isArray(instituciones) ? instituciones : [];
    });

    this.photoFieldsHash = computed(() => {
      let hash = '';
      const prefijo = this.obtenerPrefijoGrupo();
      const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
      for (let i = 1; i <= 10; i++) {
        const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
        const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
        const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
        hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
      }
      return hash;
    });

    this.viewModel = computed(() => {
      const data = this.formDataSignal();
      const prefijo = this.obtenerPrefijoGrupo();
      const nombreComunidad = this.obtenerNombreComunidadActual();
      
      // Obtener párrafo - con prefijo primero, sin prefijo después
      const fieldKey = `parrafoSeccion5_institucionalidad${prefijo}`;
      const fieldKeyNoPrefix = 'parrafoSeccion5_institucionalidad';
      let parrafo = data[fieldKey] || data[fieldKeyNoPrefix];
      if (!parrafo || parrafo.trim().length === 0) {
        parrafo = this.textGen.obtenerTextoInstitucionalidad(data, nombreComunidad, this.seccionId);
      }

      return {
        data,
        parrafo,
        instituciones: this.institucionesSignal(),
        titulo: data[`tituloInstituciones${prefijo}`] || data['tituloInstituciones'] || '',
        fuente: data[`fuenteInstituciones${prefijo}`] || data['fuenteInstituciones'] || ''
      };
    });

    effect(() => {
      const data = this.formDataSignal();
      const legacyData = this.projectFacade.obtenerDatos();
      this.datos = { ...legacyData, ...data };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  obtenerSubseccionId(): string {
    const subseccionId = this.seccionId.split('.').slice(0, 4).join('.');
    return subseccionId;
  }

  obtenerParrafoInstitucionalidad(): string {
    return this.viewModel().parrafo || '';
  }

  vistFuenteInstitucionesSignal(): string {
    return this.viewModel().fuente || '';
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarFotografias();
  }

  protected override cargarFotografias(): void {
    if (this.photoGroupsConfig.length > 0) {
      this.cargarTodosLosGrupos();
      // Actualizar fotografiasVista basado en el primer grupo (Institucionalidad)
      this.fotografiasVista = this.fotografiasVistaCache;
      this.cdRef.markForCheck();
    } else {
      super.cargarFotografias();
    }
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {}

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
