import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { SECCION27_TEMPLATES, SECCION27_WATCHED_FIELDS, SECCION27_SECTION_ID } from './seccion27-constants';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ParagraphEditorComponent, ImageUploadComponent, DynamicTableComponent],
  selector: 'app-seccion27-form',
  templateUrl: './seccion27-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion27FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION27_SECTION_ID;
  @Input() override modoFormulario: boolean = true;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION27_TEMPLATES = SECCION27_TEMPLATES;
  override readonly watchedFields: string[] = SECCION27_WATCHED_FIELDS;
  override useReactiveSync: boolean = true;

  // ✅ PATRÓN UNICA_VERDAD: fotosCacheSignal que combina todos los grupos de fotos - SEGUIR PATRON SECCION 21/23
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    return [...this.getFotosTransporteSignal(), ...this.getFotosTelecomunicacionesSignal()];
  });

  // ✅ Signals individuales para cada grupo de fotos
  readonly fotosTransporteSignal: Signal<FotoItem[]> = computed(() => {
    return this.getFotosTransporteSignal();
  });

  readonly fotosTelecomunicacionesSignal: Signal<FotoItem[]> = computed(() => {
    return this.getFotosTelecomunicacionesSignal();
  });

  // Helper para cargar fotos de Transporte
  private getFotosTransporteSignal(): FotoItem[] {
    const fotos: FotoItem[] = [];
    const groupPrefix = this.obtenerPrefijo();
    const basePrefixTransporte = 'fotografiaTransporteAISI';
    for (let i = 1; i <= 10; i++) {
      const imgKey = groupPrefix ? `${basePrefixTransporte}${i}Imagen${groupPrefix}` : `${basePrefixTransporte}${i}Imagen`;
      const titKey = groupPrefix ? `${basePrefixTransporte}${i}Titulo${groupPrefix}` : `${basePrefixTransporte}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${basePrefixTransporte}${i}Fuente${groupPrefix}` : `${basePrefixTransporte}${i}Fuente`;
      const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
      if (imagen) fotos.push({ titulo: titulo || `Foto ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
    }
    return fotos;
  }

  // Helper para cargar fotos de Telecomunicaciones
  private getFotosTelecomunicacionesSignal(): FotoItem[] {
    const fotos: FotoItem[] = [];
    const groupPrefix = this.obtenerPrefijo();
    const basePrefixTelecom = 'fotografiaTelecomunicacionesAISI';
    for (let i = 1; i <= 10; i++) {
      const imgKey = groupPrefix ? `${basePrefixTelecom}${i}Imagen${groupPrefix}` : `${basePrefixTelecom}${i}Imagen`;
      const titKey = groupPrefix ? `${basePrefixTelecom}${i}Titulo${groupPrefix}` : `${basePrefixTelecom}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${basePrefixTelecom}${i}Fuente${groupPrefix}` : `${basePrefixTelecom}${i}Fuente`;
      const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
      if (imagen) fotos.push({ titulo: titulo || `Foto ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
    }
    return fotos;
  }

  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  // ✅ Helpers públicos para obtener keys con prefijo (CRÍTICO para sync)
  private getKeyTransporteCP1(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTransporteCP1${prefijo}` : 'textoTransporteCP1';
  }

  private getKeyTransporteCP2(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTransporteCP2${prefijo}` : 'textoTransporteCP2';
  }

  private getKeyTelecomunicacionesCP1(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTelecomunicacionesCP1${prefijo}` : 'textoTelecomunicacionesCP1';
  }

  private getKeyTelecomunicacionesCP2(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTelecomunicacionesCP2${prefijo}` : 'textoTelecomunicacionesCP2';
  }

  private getKeyTelecomunicacionesCP3(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTelecomunicacionesCP3${prefijo}` : 'textoTelecomunicacionesCP3';
  }

  // ✅ PHOTO_PREFIX Signals dinámicos (solo base, sin grupo - el grupo se agrega en onFotografiasChange)
  readonly photoPrefixSignalTransporte: Signal<string> = computed(() => {
    return 'fotografiaTransporteAISI';
  });

  readonly photoPrefixSignalTelecomunicaciones: Signal<string> = computed(() => {
    return 'fotografiaTelecomunicacionesAISI';
  });

  fotografiasTransporteFormMulti: FotoItem[] = [];
  fotografiasTelecomunicacionesFormMulti: FotoItem[] = [];

  // ✅ FormDataSignal local
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ Campos Auto-Sync Signal (CON PREFIJO DE GRUPO)
  readonly textoTransporteCP1 = this.createAutoSyncField(this.getKeyTransporteCP1(), '');
  readonly textoTransporteCP2 = this.createAutoSyncField(this.getKeyTransporteCP2(), '');
  readonly textoTelecomunicacionesCP1 = this.createAutoSyncField(this.getKeyTelecomunicacionesCP1(), '');
  readonly textoTelecomunicacionesCP2 = this.createAutoSyncField(this.getKeyTelecomunicacionesCP2(), '');
  readonly textoTelecomunicacionesCP3 = this.createAutoSyncField(this.getKeyTelecomunicacionesCP3(), '');
  readonly costoTransporteMinimo = this.createAutoSyncField(`costoTransporteMinimo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly costoTransporteMaximo = this.createAutoSyncField(`costoTransporteMaximo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroTituloTelecomunicaciones = this.createAutoSyncField(`cuadroTituloTelecomunicaciones${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroFuenteTelecomunicaciones = this.createAutoSyncField(`cuadroFuenteTelecomunicaciones${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');

  // ✅ Telecomunicaciones sin estructura inicial
  telecomunicacionesConfig: TableConfig = {
    tablaKey: 'telecomunicacionesCpTabla',
    totalKey: 'medio',
    campoTotal: 'medio',
    calcularPorcentajes: false,
    noInicializarDesdeEstructura: true
  };

  // ✅ Signals para tabla de telecomunicaciones
  readonly telecomunicacionesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `telecomunicacionesCpTabla${prefijo}` : 'telecomunicacionesCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  // ✅ Text signals computed para mostrar en formulario (fallback a obtenerTexto*)
  readonly textoTransporteCP1Display: Signal<string> = computed(() => {
    const manual = this.textoTransporteCP1.value();
    if (manual && manual.trim() !== '') return manual;
    return this.obtenerTextoTransporteCP1();
  });

  readonly textoTransporteCP2Display: Signal<string> = computed(() => {
    const manual = this.textoTransporteCP2.value();
    if (manual && manual.trim() !== '') return manual;
    return this.obtenerTextoTransporteCP2();
  });

  readonly textoTelecomunicacionesCP1Display: Signal<string> = computed(() => {
    const manual = this.textoTelecomunicacionesCP1.value();
    if (manual && manual.trim() !== '') return manual;
    return this.obtenerTextoTelecomunicacionesCP1();
  });

  readonly textoTelecomunicacionesCP2Display: Signal<string> = computed(() => {
    const manual = this.textoTelecomunicacionesCP2.value();
    if (manual && manual.trim() !== '') return manual;
    return this.obtenerTextoTelecomunicacionesCP2();
  });

  readonly textoTelecomunicacionesCP3Display: Signal<string> = computed(() => {
    const manual = this.textoTelecomunicacionesCP3.value();
    if (manual && manual.trim() !== '') return manual;
    return this.obtenerTextoTelecomunicacionesCP3();
  });

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  // ✅ Inyección de FormChangeService
  private formChange: FormChangeService;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);
    this.formChange = injector.get(FormChangeService);

    effect(() => {
      this.actualizarFotografiasFormMulti();
      // ✅ PATRÓN UNICA_VERDAD: tocar fotosCacheSignal para recarga reactiva
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    
    this.cargarFotografias();

    // ✅ Inicializar campos con prefijos si están vacíos
    const keys = ['cuadroTituloTelecomunicaciones', 'cuadroFuenteTelecomunicaciones'];
    try {
      for (const k of keys) {
        const prefijoKey = this.obtenerPrefijo();
        const prefixedKey = prefijoKey ? `${k}${prefijoKey}` : k;
        const val = this.projectFacade.selectField(this.seccionId, null, prefixedKey)();
        if (val === undefined || val === null) {
          this.projectFacade.setField(this.seccionId, null, prefixedKey, '');
        }
      }
    } catch (e) {}

    // ✅ Sincronizar campos del formulario desde el store
    this.sincronizarCamposDesdeStore();
  }

  private sincronizarCamposDesdeStore(): void {
    try {
      const prefijo = this.obtenerPrefijo();

      const val1 = this.projectFacade.selectField(this.seccionId, null, this.getKeyTransporteCP1())() || '';
      this.textoTransporteCP1.update(val1);

      const val2 = this.projectFacade.selectField(this.seccionId, null, this.getKeyTransporteCP2())() || '';
      this.textoTransporteCP2.update(val2);

      const val3 = this.projectFacade.selectField(this.seccionId, null, this.getKeyTelecomunicacionesCP1())() || '';
      this.textoTelecomunicacionesCP1.update(val3);

      const val4 = this.projectFacade.selectField(this.seccionId, null, this.getKeyTelecomunicacionesCP2())() || '';
      this.textoTelecomunicacionesCP2.update(val4);

      const val5 = this.projectFacade.selectField(this.seccionId, null, this.getKeyTelecomunicacionesCP3())() || '';
      this.textoTelecomunicacionesCP3.update(val5);

      const costoMin = this.projectFacade.selectField(this.seccionId, null, `costoTransporteMinimo${prefijo}`)()
        || this.projectFacade.selectField(this.seccionId, null, 'costoTransporteMinimo')()
        || '';
      this.costoTransporteMinimo.update(costoMin);

      const costoMax = this.projectFacade.selectField(this.seccionId, null, `costoTransporteMaximo${prefijo}`)()
        || this.projectFacade.selectField(this.seccionId, null, 'costoTransporteMaximo')()
        || '';
      this.costoTransporteMaximo.update(costoMax);

      const titulo = this.projectFacade.selectField(this.seccionId, null, `cuadroTituloTelecomunicaciones${prefijo}`)()
        || this.projectFacade.selectField(this.seccionId, null, 'cuadroTituloTelecomunicaciones')()
        || '';
      this.cuadroTituloTelecomunicaciones.update(titulo);

      const fuente = this.projectFacade.selectField(this.seccionId, null, `cuadroFuenteTelecomunicaciones${prefijo}`)()
        || this.projectFacade.selectField(this.seccionId, null, 'cuadroFuenteTelecomunicaciones')()
        || '';
      this.cuadroFuenteTelecomunicaciones.update(fuente);
    } catch (e) {
    }
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // ✅ PATRÓN SECCIÓN 24: Override de onFotografiasChange para persistencia correcta
  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    const prefix = customPrefix || '';
    const groupPrefix = this.obtenerPrefijo();
    const updates: Record<string, any> = {};
    
    // Paso 1: Limpiar slots anteriores (hasta 10)
    for (let i = 1; i <= 10; i++) {
      const imgKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      const titKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
      updates[imgKey] = '';
      updates[titKey] = '';
      updates[fuenteKey] = '';
    }
    
    // Paso 2: Guardar nuevas fotos
    fotografias.forEach((foto, index) => {
      if (foto.imagen) {
        const idx = index + 1;
        const imgKey = groupPrefix ? `${prefix}${idx}Imagen${groupPrefix}` : `${prefix}${idx}Imagen`;
        const titKey = groupPrefix ? `${prefix}${idx}Titulo${groupPrefix}` : `${prefix}${idx}Titulo`;
        const fuenteKey = groupPrefix ? `${prefix}${idx}Fuente${groupPrefix}` : `${prefix}${idx}Fuente`;
        updates[imgKey] = foto.imagen;
        updates[titKey] = foto.titulo || '';
        updates[fuenteKey] = foto.fuente || '';
      }
    });
    
    // Paso 3: Persistir en ProjectFacade (capa 1)
    this.projectFacade.setFields(this.seccionId, null, updates);
    
    // Paso 4: Persistir en Backend (capa 2)
    try {
      this.formChange.persistFields(this.seccionId, 'images', updates);
    } catch (e) {
      console.error('[SECCION27] ⚠️ Error persistiendo imágenes:', e);
    }
    
    this.cdRef.markForCheck();
  }

  onFotografiasTransporteChange(fotografias: FotoItem[]) {
    this.onFotografiasChange(fotografias, this.photoPrefixSignalTransporte());
    this.fotografiasTransporteFormMulti = [...fotografias];
  }

  onFotografiasTelecomunicacionesChange(fotografias: FotoItem[]) {
    this.onFotografiasChange(fotografias, this.photoPrefixSignalTelecomunicaciones());
    this.fotografiasTelecomunicacionesFormMulti = [...fotografias];
  }

  private genericTablePersist(tablaKey: string, updated?: any[]) {
    const tabla = updated || this.datos[tablaKey] || [];
    this.datos[tablaKey] = [...tabla];
    try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) { /* noop */ }
    try {
      const FormChangeServiceToken = require('src/app/core/services/state/form-change.service').FormChangeService;
      const formChange = this.injector.get(FormChangeServiceToken, null);
      if (formChange) {
        const payload = { [tablaKey]: this.datos[tablaKey] };
        formChange.persistFields(this.seccionId, 'table', payload, { notifySync: true });

        try { this.projectFacade.setField(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) { /* noop */ }
        try { const ViewChildHelper = require('src/app/shared/utils/view-child-helper').ViewChildHelper; ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) { /* noop */ }
      }
    } catch (e) { /* noop */ }
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  obtenerTextoTransporteCP1(): string {
    const data = this.formDataSignal();
    const centroPoblado = data?.['centroPobladoAISI'] || '____';
    return SECCION27_TEMPLATES.textoTransporteCP1Template.replace(/____/, centroPoblado);
  }

  obtenerTextoTransporteCP2(): string {
    const data = this.formDataSignal();
    const ciudadOrigen = data?.['ciudadOrigenComercio'] || '____';
    // ✅ REFACTOR: Usar ubicacionGlobal en lugar de data.distritoSeleccionado
    const distrito = this.ubicacionGlobal().distrito || '____';
    const costoMin = this.costoTransporteMinimo.value() || '____';
    const costoMax = this.costoTransporteMaximo.value() || '____';
    
    let texto = SECCION27_TEMPLATES.textoTransporteCP2Template;
    texto = texto.replace(/{{ciudadOrigen}}/g, ciudadOrigen);
    texto = texto.replace(/{{distrito}}/g, distrito);
    texto = texto.replace(/{{costoMin}}/g, costoMin);
    texto = texto.replace(/{{costoMax}}/g, costoMax);
    return texto;
  }

  obtenerTextoTelecomunicacionesCP1(): string {
    const data = this.formDataSignal();
    const centroPoblado = data?.['centroPobladoAISI'] || '____';
    return SECCION27_TEMPLATES.textoTelecomunicacionesCP1Template.replace(/____/, centroPoblado);
  }

  obtenerTextoTelecomunicacionesCP2(): string {
    return SECCION27_TEMPLATES.textoTelecomunicacionesCP2Default;
  }

  obtenerTextoTelecomunicacionesCP3(): string {
    const data = this.formDataSignal();
    const centroPoblado = data?.['centroPobladoAISI'] || '____';
    return SECCION27_TEMPLATES.textoTelecomunicacionesCP3Template.replace(/____/, centroPoblado);
  }
}
