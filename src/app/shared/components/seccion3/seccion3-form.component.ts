import { Component, Input, OnDestroy, ChangeDetectorRef, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DataHighlightService } from '../../../core/services/data-highlight.service';
import { FormChangeService } from '../../../core/services/state/form-change.service';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { Seccion3TextGeneratorService } from '../../../core/services/seccion3-text-generator.service';
import { BaseSectionComponent } from '../base-section.component';
import { SECCION3_WATCHED_FIELDS, SECCION3_CONFIG, SECCION3_TEMPLATES } from './seccion3-constants';
import { TableConfig } from '../../../core/services/table-management.service';

@Component({
  selector: 'app-seccion3-form',
  templateUrl: './seccion3-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ImageUploadComponent,
    CoreSharedModule
  ],
  standalone: true
})
export class Seccion3FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.3';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaSeccion3';
  override useReactiveSync: boolean = true;

  fotografiasSeccion3: FotoItem[] = [];
  imageUploadKey: number = 0;

  entrevistadosConfig: TableConfig = {
    tablaKey: 'entrevistados',
    totalKey: 'nombre',
    estructuraInicial: [{ nombre: '', cargo: '', organizacion: '' }]
  };

  columnasEntrevistados: any[] = [
    { field: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre completo' },
    { field: 'cargo', label: 'Cargo', type: 'text', placeholder: 'Cargo o función' },
    { field: 'organizacion', label: 'Organización', type: 'text', placeholder: 'Organización' }
  ];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly fuentesSecundariasListaSignal: Signal<string[]> = computed(() => {
    const value = this.projectFacade.selectField(this.seccionId, null, 'fuentesSecundariasLista')();
    return Array.isArray(value) ? value : [];
  });

  readonly entrevistadosSignal: Signal<any[]> = computed(() => {
    const value = this.projectFacade.selectField(this.seccionId, null, 'entrevistados')();
    return Array.isArray(value) ? value : [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
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

  readonly textoMetodologiaFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoMetodologia();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoFuentesPrimariasFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoFuentesPrimarias();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoFuentesSecundariasFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoFuentesSecundarias();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  // ✅ Propiedades getter para compatibilidad con template
  get formData(): Record<string, any> {
    return this.formDataSignal();
  }

  get fotografias(): FotoItem[] {
    return this.fotografiasSeccion3;
  }

  get photoPrefix(): string {
    return this.PHOTO_PREFIX;
  }

  private readonly dataHighlightService = this.injector.get(DataHighlightService);
  private readonly formChangeService = this.injector.get(FormChangeService);
  private readonly textGenerator = this.injector.get(Seccion3TextGeneratorService);

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    effect(() => {
      const formData = this.formDataSignal();
      const fuentesSecundariasLista = this.fuentesSecundariasListaSignal();
      const entrevistados = this.entrevistadosSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // Restaurar datos desde localStorage cuando se inicializa
    this.formChangeService.restoreSectionState(this.seccionId, this.formDataSignal());
  }

  protected override detectarCambios(): boolean {
    return true;
  }

  protected override actualizarValoresConPrefijo(): void {
    // S3 no tiene prefijos dinámicos
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  override onFieldChange(fieldId: string, value: any): void {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.projectFacade.setField(this.seccionId, null, fieldId, valorLimpio);
    this.formChangeService.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
    this.cdRef.markForCheck();
  }

  obtenerTextoMetodologia(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoMetodologia(formData);
  }

  obtenerTextoFuentesPrimarias(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoFuentesPrimarias(formData);
  }

  obtenerTextoFuentesSecundarias(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoFuentesSecundarias(formData);
  }

  obtenerListaFuentesSecundarias(): string[] {
    return this.fuentesSecundariasListaSignal();
  }

  actualizarFuenteSecundaria(index: number, valor: string): void {
    const listaActual = [...(this.fuentesSecundariasListaSignal() || [])];
    if (listaActual[index] !== valor) {
      listaActual[index] = valor;
      this.projectFacade.setField(this.seccionId, null, 'fuentesSecundariasLista', listaActual);
      this.formChangeService.persistFields(this.seccionId, 'form', { fuentesSecundariasLista: listaActual });
      this.cdRef.markForCheck();
    }
  }

  eliminarFuenteSecundaria(index: number): void {
    const listaActual = [...(this.fuentesSecundariasListaSignal() || [])];
    listaActual.splice(index, 1);
    this.projectFacade.setField(this.seccionId, null, 'fuentesSecundariasLista', listaActual);
    this.formChangeService.persistFields(this.seccionId, 'form', { fuentesSecundariasLista: listaActual });
    this.cdRef.markForCheck();
  }

  agregarFuenteSecundaria(): void {
    const listaActual = [...(this.fuentesSecundariasListaSignal() || [])];
    listaActual.push('');
    this.projectFacade.setField(this.seccionId, null, 'fuentesSecundariasLista', listaActual);
    this.formChangeService.persistFields(this.seccionId, 'form', { fuentesSecundariasLista: listaActual });
    this.cdRef.markForCheck();
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByFuente(index: number, fuente: string): string {
    return fuente || `empty-${index}`;
  }

  obtenerTablaEntrevistados(): any[] {
    return this.entrevistadosSignal();
  }

  onTablaUpdated(): void {
    const entrevistados = this.entrevistadosSignal();
    if (Array.isArray(entrevistados)) {
      this.projectFacade.setTableData(this.seccionId, null, 'entrevistados', entrevistados);
      this.formChangeService.persistFields(this.seccionId, 'form', { entrevistados });
      this.cdRef.markForCheck();
    }
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    // fotografias es un array de FotoItem[]
    // Ya están guardadas en el state por ImageUploadComponent
    // Solo necesitamos actualizar las referencias locales
    this.fotografiasSeccion3 = fotografias || [];
    this.cdRef.markForCheck();
  }

  get key(): number {
    return Date.now();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
