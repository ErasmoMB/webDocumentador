import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ChangeDetectionStrategy, Signal, computed, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableManagementFacade } from '../../../core/services/tables/table-management.facade';
import { TableConfig } from '../../../core/services/table-management.service';
import { FotoItem } from '../image-upload/image-upload.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { CoreSharedModule } from '../../../shared/modules/core-shared.module';
import { DataSourceDirective } from '../../directives/data-source.directive';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { FormChangeService } from '../../../core/services/state/form-change.service';
import { Seccion3TextGeneratorService } from '../../../core/services/seccion3-text-generator.service';
import { Seccion3FuentesManagementService } from '../../../core/services/seccion3-fuentes-management.service';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  selector: 'app-seccion3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    GenericTableComponent,
    ParagraphEditorComponent,
    DataSourceDirective
  ],
  templateUrl: './seccion3.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion3Component extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override modoFormulario: boolean = false;
  @Input() override seccionId: string = '3.1.3';

  override readonly PHOTO_PREFIX = 'fotografiaSeccion3';
  override useReactiveSync: boolean = true;

  fotografiasSeccion3: FotoItem[] = [];

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly entrevistadosSignal: Signal<any[]>;
  readonly fuentesSecundariasListaSignal: Signal<string[]>;
  readonly photoFieldsHash: Signal<string>;
  readonly viewModel: Signal<any>;

  entrevistadosConfig: TableConfig = {
    tablaKey: 'entrevistados',
    totalKey: 'nombre',
    estructuraInicial: [{ nombre: '', cargo: '', organizacion: '' }]
  };

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private textGenerator: Seccion3TextGeneratorService,
    private fuentesManagement: Seccion3FuentesManagementService
  ) {
    super(cdRef, injector);

    this.formDataSignal = computed(() => {
      return this.projectFacade.selectSectionFields(this.seccionId, null)();
    });

    this.entrevistadosSignal = computed(() => {
      // ✅ Usar selectTableData() para obtener datos de tabla (no selectField())
      const value = this.projectFacade.selectTableData(this.seccionId, null, 'entrevistados')();
      return Array.isArray(value) ? value : [];
    });

    this.fuentesSecundariasListaSignal = computed(() => {
      const value = this.projectFacade.selectField(this.seccionId, null, 'fuentesSecundariasLista')();
      return Array.isArray(value) ? value : [];
    });

    this.photoFieldsHash = computed(() => {
      let hash = '';
      for (let i = 1; i <= 10; i++) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente`;
        const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen`;
        
        const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
        const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
        const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();
        
        hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
      }
      return hash;
    });

    this.viewModel = computed(() => {
      const formData = this.formDataSignal();
      return {
        data: {
          parrafoSeccion3_metodologia: formData['parrafoSeccion3_metodologia'] || '',
          parrafoSeccion3_fuentes_primarias: formData['parrafoSeccion3_fuentes_primarias'] || '',
          parrafoSeccion3_fuentes_secundarias: formData['parrafoSeccion3_fuentes_secundarias'] || '',
          cantidadEntrevistas: formData['cantidadEntrevistas'] || 0,
          fechaTrabajoCampo: formData['fechaTrabajoCampo'] || '',
          consultora: formData['consultora'] || '',
          entrevistados: this.entrevistadosSignal(),
          fuentesSecundariasLista: this.fuentesSecundariasListaSignal()
        }
      };
    });

    effect(() => {
      const formData = this.formDataSignal();
      this.datos = { ...formData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return 'manual';
  }

  formatearParrafo(texto: string): string {
    return texto || '';
  }

  obtenerFuentesSecundarias(): string[] {
    return this.fuentesSecundariasListaSignal();
  }

  obtenerIntroFuentes(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoFuentesSecundarias(formData);
  }

  protected override cargarFotografias(): void {
    super.cargarFotografias();
    this.fotografiasSeccion3 = this.modoFormulario ? this.fotografiasFormMulti : this.fotografiasCache;
  }

  obtenerTextoSeccion3Metodologia(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoMetodologia(formData);
  }

  obtenerTextoSeccion3FuentesPrimarias(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoFuentesPrimarias(formData);
  }

  obtenerTextoSeccion3FuentesSecundarias(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoFuentesSecundarias(formData);
  }

  obtenerListaFuentesSecundarias(): string[] {
    return this.fuentesSecundariasListaSignal();
  }

  obtenerTablaEntrevistados(): any[] {
    return this.entrevistadosSignal();
  }

  onTablaUpdated(): void {
    this.cdRef.markForCheck();
  }

  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    this.projectFacade.setField(this.seccionId, null, fieldId, value);
    super.onFieldChange(fieldId, value, options);
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    this.fotografiasSeccion3 = fotografias;
    this.cdRef.markForCheck();
  }

  get columnasEntrevistados(): any[] {
    return [
      { field: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre completo' },
      { field: 'cargo', label: 'Cargo', type: 'text', placeholder: 'Cargo o función' },
      { field: 'organizacion', label: 'Organización', type: 'text', placeholder: 'Organización' }
    ];
  }

  // ✅ MÉTODOS PARA GESTIÓN DE FUENTES SECUNDARIAS

  /**
   * Agrega una nueva fuente secundaria a la lista
   */
  agregarFuenteSecundaria(): void {
    const fuentesActuales = this.fuentesSecundariasListaSignal() || [];
    const nuevaFuente = 'Nueva fuente secundaria';
    const fuentesActualizadas = [...fuentesActuales, nuevaFuente];
    
    console.log('[Seccion3] agregarFuenteSecundaria - guardando:', fuentesActualizadas);
    this.onFieldChange('fuentesSecundariasLista', fuentesActualizadas);
    this.cdRef.markForCheck();
  }

  /**
   * Actualiza una fuente secundaria existente
   */
  actualizarFuenteSecundaria(index: number, valor: string): void {
    const fuentesActuales = this.fuentesSecundariasListaSignal() || [];
    if (index >= 0 && index < fuentesActuales.length) {
      const fuentesActualizadas = [...fuentesActuales];
      fuentesActualizadas[index] = valor;
      
      console.log('[Seccion3] actualizarFuenteSecundaria[' + index + '] - guardando:', fuentesActualizadas);
      this.onFieldChange('fuentesSecundariasLista', fuentesActualizadas);
      this.cdRef.markForCheck();
    }
  }

  /**
   * Elimina una fuente secundaria de la lista
   */
  eliminarFuenteSecundaria(index: number): void {
    const fuentesActuales = this.fuentesSecundariasListaSignal() || [];
    if (index >= 0 && index < fuentesActuales.length) {
      const fuentesActualizadas = fuentesActuales.filter((_, i) => i !== index);
      
      console.log('[Seccion3] eliminarFuenteSecundaria[' + index + '] - guardando:', fuentesActualizadas);
      this.onFieldChange('fuentesSecundariasLista', fuentesActualizadas);
      this.cdRef.markForCheck();
    }
  }

  /**
   * Obtiene la lista actual de fuentes secundarias
   */
  obtenerFuentesSecundariasParaEditar(): string[] {
    return this.fuentesSecundariasListaSignal() || [];
  }

  /**
   * Maneja el evento change/blur de un input de fuente
   * Extrae el valor correctamente y actualiza la fuente
   */
  onFuenteInputChange(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value !== undefined) {
      this.actualizarFuenteSecundaria(index, inputElement.value);
    }
  }

}

