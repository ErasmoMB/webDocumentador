import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed, effect } from '@angular/core';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  selector: 'app-seccion20-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  templateUrl: './seccion20-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion20FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaFestividades';

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

  festividadesConfig: TableConfig = {
    tablaKey: 'festividades',
    totalKey: 'festividad',
    campoTotal: 'festividad',
    estructuraInicial: [{ festividad: '', fecha: '' }]
  };

  private readonly regexCache = new Map<string, RegExp>();

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly textoSignal: Signal<string> = computed(() => {
    const fieldId = this.getFieldIdTextoFestividades();
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldId)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoFestividades();
  });

  readonly tablasSignal: Signal<any[]> = computed(() => {
    const tablaKey = this.getTablaKeyFestividades();
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    const v = fromField ?? fromTable ?? this.festividadesConfig.estructuraInicial;
    return Array.isArray(v) ? v : [];
  });

  readonly fotosSignal: Signal<FotoItem[]> = computed(() => {
    this.projectFacade.selectSectionFields(this.seccionId, null)();
    const gp = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, gp);
  });

  // Signal de prefijo de foto para aislamiento AISD
  readonly photoPrefixSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `${this.PHOTO_PREFIX}${prefijo}` : this.PHOTO_PREFIX;
  });

  // photoFieldsHash con prefijo para reactividad de fotos
  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const prefijo = this.obtenerPrefijo();
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // Helpers (copiados de la implementación previa para mantener el mismo texto por defecto)
  obtenerTextoFestividades(): string {
    const fieldId = this.getFieldIdTextoFestividades();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.textoFestividades;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const sitioArqueologico = this.datos.sitioArqueologico || 'Incahuasi';
    
    const textoPorDefecto = `En la CC ${grupoAISD}, las festividades son momentos de gran importancia cultural y social que refuerzan los lazos comunitarios y mantienen vivas las tradiciones locales. Entre las celebraciones más destacadas se encuentran los carnavales, que tienen lugar en el mes de febrero. Esta festividad está marcada por el entusiasmo de la población, quienes participan en juegos con agua y desfiles.

Otra celebración significativa es la dedicada a la Virgen de Chapi, que se lleva a cabo cada 1° de mayo. En esta fecha, los devotos organizan misas solemnes, procesiones en honor a la Virgen y actividades sociales que congregan a familias locales y visitantes. Del 3 al 5 de mayo, se celebra la Fiesta de las Cruces, en la que se realizan ceremonias religiosas, procesiones y actividades tradicionales, como la tauromaquia, acompañadas por grupos musicales que animan el ambiente.

En junio, el calendario festivo incluye dos importantes celebraciones: la festividad de San Vicente Ferrer (que es la fiesta patronal principal de la comunidad), que se realiza del 21 al 23 de junio, y el aniversario de la comunidad, celebrado el 24 de junio con actos protocolares, actividades culturales y sociales. Ambas fechas están caracterizadas por su componente religioso, con misas y procesiones, además de eventos que integran a toda la comunidad.

Una festividad de gran relevancia ambiental y cultural es el Chaku, o esquila de vicuñas, una actividad tradicional vinculada al aprovechamiento sostenible de esta especie emblemática de los Andes. Aunque las fechas de esta celebración suelen variar, se tiene la propuesta de realizarla cada 15 de noviembre, coincidiendo con el Día de la Vicuña. Durante el Chaku, además de la esquila, se realizan actividades culturales, ceremonias andinas y eventos de integración comunitaria.

En cuanto al potencial turístico, la CC ${grupoAISD} destaca no solo por sus festividades tradicionales, sino también por las ruinas arqueológicas de ${sitioArqueologico}, un sitio de valor histórico y cultural. Este lugar, que guarda vestigios del pasado incaico, representa una oportunidad para atraer visitantes interesados en la historia, la arqueología y el turismo vivencial. La promoción de este recurso puede complementar las festividades y posicionar a la comunidad como un destino atractivo para el turismo sostenible, generando beneficios económicos y culturales para sus habitantes.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`)
        .replace(/CC\s*____/g, `CC ${grupoAISD}`);
    }
    
    return textoPorDefecto;
  }

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private formChange: FormChangeService) {
    super(cdRef, injector);

    effect(() => {
      // Merge conservador: mantener valores locales
      const data = this.formDataSignal();
      this.datos = { ...data, ...this.datos };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.tablasSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // Asegurar initialización de tabla y parrafo (evitar inputs inactivos)
    const tablaKey = this.getTablaKeyFestividades();
    if (!this.datos[tablaKey] || !Array.isArray(this.datos[tablaKey]) || this.datos[tablaKey].length === 0) {
      this.datos[tablaKey] = structuredClone(this.festividadesConfig.estructuraInicial);
      this.onFieldChange(tablaKey, this.datos[tablaKey], { refresh: false });
      try { this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: this.datos[tablaKey] }); } catch {}
    }

    const fieldId = this.getFieldIdTextoFestividades();
    if (!this.datos[fieldId]) {
      const valor = this.obtenerTextoFestividades();
      this.datos[fieldId] = valor;
      this.onFieldChange(fieldId, valor, { refresh: false });
    }

    // Inicializar Título y Fuente de tabla si no existen
    const tituloField = this.getTituloFestividadesField();
    if (!this.datos[tituloField]) {
      const valorTitulo = `Festividades principales – CC ${this.obtenerNombreComunidadActual()}`;
      this.datos[tituloField] = valorTitulo;
      this.onFieldChange(tituloField, valorTitulo, { refresh: false });
    }

    const fuenteField = this.getFuenteFestividadesField();
    if (!this.datos[fuenteField]) {
      const valorFuente = 'GEADES (2024)';
      this.datos[fuenteField] = valorFuente;
      this.onFieldChange(fuenteField, valorFuente, { refresh: false });
    }
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // Helpers
  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getTablaKeyFestividades(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `festividades${prefijo}` : 'festividades';
  }

  getFieldIdTextoFestividades(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoFestividades${prefijo}` : 'textoFestividades';
  }

  getTituloFestividadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tituloFestividades${prefijo}` : 'tituloFestividades';
  }

  getFuenteFestividadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fuenteFestividades${prefijo}` : 'fuenteFestividades';
  }

  onTituloFestividadesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getTituloFestividadesField();
    const valor = input.value;
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  onFuenteFestividadesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getFuenteFestividadesField();
    const valor = input.value;
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  onFestividadesTableUpdated(): void {
    const tablaKey = this.getTablaKeyFestividades();
    const tabla = this.tablasSignal();
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
    // persist both prefixed and base
    const tablaKeyBase = this.festividadesConfig.tablaKey;
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, [tablaKeyBase]: tabla });
    } catch {}
    // Force preview update
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.cdRef.detectChanges();
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
