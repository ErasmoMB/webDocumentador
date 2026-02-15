import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed, effect } from '@angular/core';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION20_TEMPLATES } from './seccion20.constants';

@Component({
  selector: 'app-seccion20-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  templateUrl: './seccion20-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion20FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.16';
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION20_TEMPLATES = SECCION20_TEMPLATES;
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
    estructuraInicial: SECCION20_TEMPLATES.tablaEstructuraInicial
    // ✅ NO incluir campoTotal porque festividad es texto, no número
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
    return this.PHOTO_PREFIX;
  });

  // photoFieldsHash con prefijo para reactividad de fotos
  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const prefijo = this.obtenerPrefijo();
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ Obtener texto con template y reemplazos dinámicos
  obtenerTextoFestividades(): string {
    const fieldId = this.getFieldIdTextoFestividades();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.textoFestividades;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const sitioArqueologico = this.datos.sitioArqueologico || SECCION20_TEMPLATES.sitioArqueologicoDefault;
    
    // ✅ Usar template centralizado de constantes
    const textoPorDefecto = SECCION20_TEMPLATES.textoFestividadesDefault
      .replace(/{{nombreComunidad}}/g, grupoAISD)
      .replace(/{{sitioArqueologico}}/g, sitioArqueologico);
    
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
      // ✅ Usar template centralizado
      const valorTitulo = SECCION20_TEMPLATES.tituloDefault.replace('{{nombreComunidad}}', this.obtenerNombreComunidadActual());
      this.datos[tituloField] = valorTitulo;
      this.onFieldChange(tituloField, valorTitulo, { refresh: false });
    }

    const fuenteField = this.getFuenteFestividadesField();
    if (!this.datos[fuenteField]) {
      // ✅ Usar template centralizado
      const valorFuente = SECCION20_TEMPLATES.fuenteDefault;
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
    this.onFieldChange('tituloFestividades', valor, { refresh: false });
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  onFuenteFestividadesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getFuenteFestividadesField();
    const valor = input.value;
    this.datos[fieldId] = valor;
    this.onFieldChange('fuenteFestividades', valor, { refresh: false });
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
