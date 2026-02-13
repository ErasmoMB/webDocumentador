import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION24_TEMPLATES, SECCION24_DEFAULT_TEXTS } from './seccion24-constants';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule, DynamicTableComponent, ImageUploadComponent, ParagraphEditorComponent],
  selector: 'app-seccion24-form',
  templateUrl: './seccion24-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion24FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.3';
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION24_TEMPLATES = SECCION24_TEMPLATES;

  // ✅ PHOTO_PREFIX como Signal
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;
  
  // ✅ TableConfig con noInicializarDesdeEstructura
  readonly actividadesEconomicasConfig: TableConfig = {
    tablaKey: 'actividadesEconomicasAISI',
    totalKey: 'actividad',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  // ✅ Signal para clave de tabla
  readonly tablaKeyActividadesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `actividadesEconomicasAISI${prefijo}` : 'actividadesEconomicasAISI';
  });

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly actividadesEconomicasSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `actividadesEconomicasAISI${prefijo}` : 'actividadesEconomicasAISI';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const prefix = this.photoPrefixSignal();
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, prefix, groupPrefix);
  });

  readonly fotosActividadesSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const prefix = prefijo ? `fotografiaActividadesEconomicas${prefijo}` : 'fotografiaActividadesEconomicas';
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, prefix, groupPrefix);
  });

  readonly fotosMercadoSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const prefix = prefijo ? `fotografiaMercado${prefijo}` : 'fotografiaMercado';
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, prefix, groupPrefix);
  });

  readonly viewModel = computed(() => ({
    centroPoblado: (this.formDataSignal() as any)?.centroPobladoAISI || '',
    actividadesEconomicas: this.actividadesEconomicasSignal(),
    ciudadOrigenComercio: (this.formDataSignal() as any)?.ciudadOrigenComercio || '',
    textos: {
      intro: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoIntroActividadesEconomicasAISI${prefijo}` : 'textoIntroActividadesEconomicasAISI';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        if (manual && manual.trim().length > 0) return (manual.split('\n\n')[0] || manual);
        return this.generarTextoIntroDefault();
      })(),
      introLong: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoIntroActividadesEconomicasAISI${prefijo}` : 'textoIntroActividadesEconomicasAISI';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        if (manual && manual.trim().length > 0) return (manual.split('\n\n')[1] || '');
        return this.generarTextoIntroLongDefault();
      })(),
      analisis: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoActividadesEconomicasAISI${prefijo}` : 'textoActividadesEconomicasAISI';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        return manual || this.generarTextoAnalisisDefault();
      })(),
      mercado: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoMercadoProductos${prefijo}` : 'textoMercadoProductos';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        return manual || this.generarTextoMercadoDefault();
      })(),
      habitos: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoHabitosConsumo${prefijo}` : 'textoHabitosConsumo';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        return manual || this.generarTextoHabitosDefault();
      })(),
      fuente: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `fuenteActividadesEconomicasAISI${prefijo}` : 'fuenteActividadesEconomicasAISI';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        return manual || this.generarFuenteDefault();
      })()
    },
    fotos: this.fotosCacheSignal(),
    globalTableNumber: this.globalTableNumberSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private formChange: FormChangeService, private globalNumbering: GlobalNumberingService) {
    super(cdRef, injector);
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      return prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';
    });
    
    // Inicializar PHOTO_PREFIX para compatibilidad
    this.PHOTO_PREFIX = this.photoPrefixSignal();
    
    // ✅ Signal para número global de tabla
    this.globalTableNumberSignal = computed(() => {
      return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      return fotos.map((_, index) => this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index));
    });

    effect(() => {
      const data = this.formDataSignal();
      const actividades = this.actividadesEconomicasSignal();
      this.datos = { ...data, actividadesEconomicasAISI: actividades };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar tanto el objeto local como el store
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }); } catch (e) {}
  }

  protected override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
  
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  actualizarCentroPoblado(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'centroPobladoAISI', valor);
    this.onFieldChange('centroPobladoAISI', valor);
  }

  onActividadesEconomicasChange(tabla: any[]): void {
    // Persist primarily as TABLE and mirror to legacy field for compatibility
    try { this.projectFacade.setTableData(this.seccionId, null, 'actividadesEconomicasAISI', tabla); } catch (e) { }
    try {
      const payload: any = { actividadesEconomicasAISI: tabla };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`actividadesEconomicasAISI${prefijo}`] = tabla;
      this.formChange.persistFields(this.seccionId, 'table', payload);
    } catch (e) { }
    // Mirror to legacy field so components reading fields see the update immediately
    try { const prefijo = this.obtenerPrefijoGrupo(); if (prefijo) this.projectFacade.setField(this.seccionId, null, `actividadesEconomicasAISI${prefijo}`, tabla); } catch (e) { }
    try { this.projectFacade.setField(this.seccionId, null, 'actividadesEconomicasAISI', tabla); } catch (e) { }
    // Notify section about the change (updates this.datos and triggers persistence)
    this.onFieldChange('actividadesEconomicasAISI', tabla);
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  actualizarCiudadOrigenComercio(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'ciudadOrigenComercio', valor);
    try {
      const payload: any = { ciudadOrigenComercio: valor };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`ciudadOrigenComercio${prefijo}`] = valor;
      this.formChange.persistFields(this.seccionId, 'form', payload);
    } catch (e) {}
    this.onFieldChange('ciudadOrigenComercio', valor);
  }

  actualizarTexto(fieldId: string, valor: string): void {
    // Special behavior only for the intro field: preserve second paragraph when editing Párrafo 1
    if (fieldId === 'textoIntroActividadesEconomicasAISI') {
      const actual = this.projectFacade.selectField(this.seccionId, null, fieldId)() || '';
      const parts = actual.split('\n\n');
      // Prefer stored second paragraph; if none, use generated view default
      const storedSecond = parts[1] || '';
      const generatedSecond = this.viewModel().textos?.introLong || '';
      const second = (storedSecond && storedSecond.trim().length > 0) ? storedSecond : (generatedSecond || '');
      const nuevo = second && second.trim().length > 0 ? `${valor}\n\n${second}` : valor;
      this.projectFacade.setField(this.seccionId, null, fieldId, nuevo);
      try {
        const payload: any = { [fieldId]: nuevo };
        const prefijo = this.obtenerPrefijoGrupo();
        if (prefijo) payload[`${fieldId}${prefijo}`] = nuevo;
        this.formChange.persistFields(this.seccionId, 'text', payload);
      } catch (e) {}
      this.onFieldChange(fieldId, nuevo);
      return;
    }

    // Default behavior: save exactly what the user typed (no merging with other generated texts)
    this.projectFacade.setField(this.seccionId, null, fieldId, valor);
    try {
      const payload: any = { [fieldId]: valor };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`${fieldId}${prefijo}`] = valor;
      this.formChange.persistFields(this.seccionId, 'text', payload);
    } catch (e) {}
    this.onFieldChange(fieldId, valor);
  }

  actualizarIntroLong(valor: string): void {
    const fieldId = 'textoIntroActividadesEconomicasAISI';
    const actual = this.projectFacade.selectField(this.seccionId, null, fieldId)() || '';
    const parts = actual.split('\n\n');
    const first = parts[0] || this.generarTextoIntroDefault();
    const nuevo = `${first}\n\n${valor}`;
    this.projectFacade.setField(this.seccionId, null, fieldId, nuevo);
    try { const payload: any = { [fieldId]: nuevo }; const prefijo = this.obtenerPrefijoGrupo(); if (prefijo) payload[`${fieldId}${prefijo}`] = nuevo; this.formChange.persistFields(this.seccionId, 'text', payload); } catch (e) {}
    this.onFieldChange(fieldId, nuevo);
  }

  onFotografiasChangeHandler(fotografias: FotoItem[], prefix?: string): void {
    this.onFotografiasChange(fotografias, prefix);
    this.cdRef.markForCheck();
  }

  private generarTextoIntroDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    return SECCION24_DEFAULT_TEXTS.textoIntroActividadesEconomicasAISI.replace(/____/g, cp);
  }

  private generarTextoAnalisisDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    const actividades = this.actividadesEconomicasSignal() || [];
    const agricultura = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('agricultura'));
    const administracion = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('administración'));
    const porcentajeAgricultura = agricultura?.porcentaje && String(agricultura.porcentaje).trim().length > 0 ? agricultura.porcentaje : '____';
    const porcentajeAdministracion = administracion?.porcentaje && String(administracion.porcentaje).trim().length > 0 ? administracion.porcentaje : '____';

    return SECCION24_DEFAULT_TEXTS.textoActividadesEconomicasAISI
      .replace(/____/g, cp)
      .replace(/____/g, porcentajeAgricultura)
      .replace(/____/g, porcentajeAdministracion);
  }

  private generarTextoMercadoDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || this.projectFacade.selectField(this.seccionId, null, 'ciudadOrigenComercio')() || SECCION24_DEFAULT_TEXTS.ciudadOrigenDefault;

    return SECCION24_DEFAULT_TEXTS.textoMercadoProductos
      .replace(/____/g, cp)
      .replace(/____/g, ciudadOrigen)
      .replace(/____/g, cp)
      .replace(/____/g, ciudadOrigen)
      .replace(/____/g, cp);
  }

  private generarTextoHabitosDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || this.projectFacade.selectField(this.seccionId, null, 'ciudadOrigenComercio')() || SECCION24_DEFAULT_TEXTS.ciudadOrigenDefault;

    return SECCION24_DEFAULT_TEXTS.textoHabitosConsumo
      .replace(/____/g, cp)
      .replace(/____/g, ciudadOrigen);
  }

  private generarFuenteDefault(): string {
    return SECCION24_DEFAULT_TEXTS.fuenteActividadesEconomicasAISI;
  }

  private generarTextoIntroLongDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    return SECCION24_DEFAULT_TEXTS.textoIntroActividadesEconomicasAISILong.replace(/____/g, cp);
  }

  actualizarFuente(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'fuenteActividadesEconomicasAISI', valor);
    try {
      const payload: any = { fuenteActividadesEconomicasAISI: valor };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`fuenteActividadesEconomicasAISI${prefijo}`] = valor;
      this.formChange.persistFields(this.seccionId, 'form', payload);
    } catch (e) {}
    this.onFieldChange('fuenteActividadesEconomicasAISI', valor);
  }

  trackByIndex(index: number): number { return index; }
}
