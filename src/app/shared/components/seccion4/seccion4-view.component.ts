import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { Seccion4TextGeneratorService } from 'src/app/core/services/domain/seccion4-text-generator.service';
import { Seccion4DataService } from 'src/app/core/services/domain/seccion4-data.service';
import { Seccion4TableConfigService } from 'src/app/core/services/domain/seccion4-table-config.service';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION4_WATCHED_FIELDS, SECCION4_PHOTO_PREFIXES } from './seccion4-constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ImageUploadComponent],
  selector: 'app-seccion4-view',
  templateUrl: './seccion4-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion4ViewComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  @Input() override modoFormulario: boolean = false;

  readonly PHOTO_PREFIX_UBICACION = SECCION4_PHOTO_PREFIXES.UBICACION;
  readonly PHOTO_PREFIX_POBLACION = SECCION4_PHOTO_PREFIXES.POBLACION;
  override readonly PHOTO_PREFIX = '';

  override useReactiveSync: boolean = false;
  override watchedFields: string[] = SECCION4_WATCHED_FIELDS;

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly tablaAISD1Signal: Signal<any[]>;
  readonly tablaAISD2Signal: Signal<any[]>;
  readonly photoFieldsHash: Signal<string>;
  readonly viewModel: Signal<any>;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private textGen: Seccion4TextGeneratorService,
    private dataSrv: Seccion4DataService,
    public tableCfg: Seccion4TableConfigService,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX_UBICACION, label: 'Ubicación' },
      { prefix: this.PHOTO_PREFIX_POBLACION, label: 'Población' }
    ];

    this.formDataSignal = computed(() => {
      const sectionData = this.projectFacade.selectSectionFields(this.seccionId, null)();
      const seccion2Data = this.projectFacade.selectSectionFields('3.1.2', null)();
      return { ...sectionData, comunidadesCampesinas: seccion2Data['comunidadesCampesinas'] || sectionData['comunidadesCampesinas'] };
    });

    this.tablaAISD1Signal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA1 = `tablaAISD1Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA1)();
      return Array.isArray(conPrefijo) && conPrefijo.length > 0 ? conPrefijo : [];
    });

    this.tablaAISD2Signal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA2 = `tablaAISD2Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA2)();
      return Array.isArray(conPrefijo) && conPrefijo.length > 0 ? conPrefijo : [];
    });

    this.photoFieldsHash = computed(() => {
      let hash = '';
      const prefijo = this.obtenerPrefijoGrupo();
      for (const basePrefix of [this.PHOTO_PREFIX_UBICACION, this.PHOTO_PREFIX_POBLACION]) {
        const prefix = basePrefix + prefijo;
        for (let i = 1; i <= 10; i++) {
          const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
          const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
          const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
          hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
        }
      }
      return hash;
    });

    this.viewModel = computed(() => {
      const sectionData = this.formDataSignal();
      const data = sectionData;
      const nombreComunidad = this.obtenerNombreComunidadActual();
      const tablaAISD1 = this.tablaAISD1Signal();
      const tablaAISD2 = this.tablaAISD2Signal();
      const totales = this.dataSrv.calcularTotalesAISD2(Array.isArray(tablaAISD2) ? tablaAISD2 : []);
      
      return {
        nombreComunidad,
        data: {
          ...data,
          comunidadesCampesinas: sectionData['comunidadesCampesinas'] ?? [],
          cuadroTituloAISD1: data['cuadroTituloAISD1' + this.obtenerPrefijoGrupo()] ?? '',
          tablaAISD1Datos: tablaAISD1,
          tablaAISD2Datos: tablaAISD2
        },
        texts: {
          introduccionText: this.textGen.obtenerTextoIntroduccionAISD(data, nombreComunidad, this.seccionId),
          comunidadText: this.textGen.obtenerTextoComunidadCompleto(data, nombreComunidad, this.seccionId),
          caracterizacionText: this.textGen.obtenerTextoCaracterizacionIndicadores(data, nombreComunidad, this.seccionId)
        },
        tables: {
          tablaAISD1: Array.isArray(tablaAISD1) ? tablaAISD1 : [],
          tablaAISD2: Array.isArray(tablaAISD2) ? tablaAISD2 : []
        },
        calculations: {
          totalesAISD2: {
            poblacion: totales.poblacion,
            empadronadas: totales.empadronadas,
            ocupadas: totales.ocupadas
          }
        },
        sources: {
          tablaAISD1Source: data['cuadroFuenteAISD1' + this.obtenerPrefijoGrupo()] ?? '',
          tablaAISD2Source: data['cuadroFuenteAISD2' + this.obtenerPrefijoGrupo()] ?? ''
        }
      };
    });

    effect(() => {
      const sectionData = this.formDataSignal();
      const legacyData = this.projectFacade.obtenerDatos();
      this.datos = { ...legacyData, ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarFotografias();
  }

  protected override cargarFotografias(): void {
    if (this.photoGroupsConfig.length > 0) {
      this.cargarTodosLosGrupos();
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

