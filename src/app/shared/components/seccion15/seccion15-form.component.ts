import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TableConfig } from '../../../core/services/tables/table-management.service';
import { FormChangeService } from '../../../core/services/state/form-change.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { SECCION15_SECTION_ID, SECCION15_PHOTO_PREFIX, SECCION15_DEFAULT_TEXTS, SECCION15_TEMPLATES, SECCION15_WATCHED_FIELDS } from './seccion15-constants';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion15-form',
    templateUrl: './seccion15-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion15FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION15_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES e importar constantes
  readonly SECCION15_TEMPLATES = SECCION15_TEMPLATES;
  readonly SECCION15_DEFAULT_TEXTS = SECCION15_DEFAULT_TEXTS;

  override readonly PHOTO_PREFIX = SECCION15_PHOTO_PREFIX;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION15_WATCHED_FIELDS;

  fotografiasIglesia: FotoItem[] = [];

  // ✅ HELPER PARA OBTENER PREFIJO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  // ✅ OVERRIDE: onFieldChange CON PREFIJO AUTOMÁTICO
  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
    super.onFieldChange(campoConPrefijo, value, options);
  }

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ MÉTODOS INLINE PARA TEXTOS (CAPA 3: Default + Personalización del usuario)
  obtenerTextoAspectosCulturales(): string {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `textoAspectosCulturales${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campoKey] && String(this.datos[campoKey]).trim().length > 0) {
      return String(this.datos[campoKey]);
    }
    
    // CAPA 3: Default con contexto
    const comunidad = this.obtenerNombreComunidadActual();
    return SECCION15_DEFAULT_TEXTS.textoAspectosCulturalesDefault(comunidad);
  }

  obtenerTextoIdioma(): string {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `textoIdioma${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campoKey] && String(this.datos[campoKey]).trim().length > 0) {
      return String(this.datos[campoKey]);
    }
    
    // CAPA 3: Default
    return SECCION15_DEFAULT_TEXTS.textoIdiomaDefault;
  }

  obtenerTextoReligion(): string {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `parrafoSeccion15_religion_completo${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campoKey] && String(this.datos[campoKey]).trim().length > 0) {
      return String(this.datos[campoKey]);
    }
    
    // CAPA 3: Default con contexto
    const comunidad = this.obtenerNombreComunidadActual();
    return SECCION15_DEFAULT_TEXTS.textoReligionDefault(comunidad);
  }

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  readonly lenguasMaternasSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `lenguasMaternasTabla${prefijo}` : 'lenguasMaternasTabla';
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly religionesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `religionesTabla${prefijo}` : 'religionesTabla';
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly lenguasMaternasConfigSignal: Signal<TableConfig> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `lenguasMaternasTabla${prefijo}` : 'lenguasMaternasTabla';
    return {
      tablaKey: tablaKey,
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos'],
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
  });

  readonly religionesConfigSignal: Signal<TableConfig> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `religionesTabla${prefijo}` : 'religionesTabla';
    return {
      tablaKey: tablaKey,
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos'],
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private formChangeService: FormChangeService
  ) {
    super(cdRef, injector);

    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.lenguasMaternasSignal();
      this.religionesSignal();
      this.photoFieldsHash();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  onLenguasMaternasTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `lenguasMaternasTabla${prefijo}` : 'lenguasMaternasTabla';
    const dataToPersist = updatedData || this.lenguasMaternasSignal();
    this.formChangeService.persistFields(this.seccionId, 'table', {
      [tablaKey]: dataToPersist
    }, { updateState: true, notifySync: true, persist: false });

    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || dataToPersist || [];
    this.datos[tablaKey] = tablaPersistida;
    this.onFieldChange(tablaKey, tablaPersistida, { refresh: false });
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  onReligionesTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `religionesTabla${prefijo}` : 'religionesTabla';
    const dataToPersist = updatedData || this.religionesSignal();
    this.formChangeService.persistFields(this.seccionId, 'table', {
      [tablaKey]: dataToPersist
    }, { updateState: true, notifySync: true, persist: false });

    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || dataToPersist || [];
    this.datos[tablaKey] = tablaPersistida;
    this.onFieldChange(tablaKey, tablaPersistida, { refresh: false });
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
  }

  override getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return 'manual';
  }

  onInputChange(fieldName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.onFieldChange(fieldName, target.value);
    }
  }
}
