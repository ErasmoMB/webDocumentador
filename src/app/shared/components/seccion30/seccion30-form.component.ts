import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { TableMockMergeService } from 'src/app/core/services/tables/table-mock-merge.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { SECCION30_TEMPLATES, SECCION30_TABLE_CONFIG, SECCION30_CONFIG, SECCION30_WATCHED_FIELDS } from './seccion30-constants';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule],
  selector: 'app-seccion30-form',
  templateUrl: './seccion30-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion30FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION30_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;

  // ✅ EXPORTAR CONSTANTS PARA USAR EN TEMPLATE
  readonly SECCION30_TEMPLATES = SECCION30_TEMPLATES;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION30_WATCHED_FIELDS;

  // Textos por defecto - Ahora desde CONSTANTS ✅
  readonly PARRAFO_INTRO_DEFAULT = SECCION30_TEMPLATES.parrafoIntroDefault;
  readonly TITULO_NIVEL_EDUCATIVO_DEFAULT = SECCION30_TEMPLATES.tituloNivelEducativoDefault;
  readonly FUENTE_NIVEL_EDUCATIVO_DEFAULT = SECCION30_TEMPLATES.fuenteNivelEducativoDefault;
  readonly TITULO_TASA_ANALFABETISMO_DEFAULT = SECCION30_TEMPLATES.tituloTasaAnalfabetismoDefault;
  readonly FUENTE_TASA_ANALFABETISMO_DEFAULT = SECCION30_TEMPLATES.fuenteTasaAnalfabetismoDefault;

  // Estructuras iniciales ELIMINADAS por request del usuario
  
  nivelEducativoDynamicConfig = SECCION30_TABLE_CONFIG.nivelEducativo;
  tasaAnalfabetismoDynamicConfig = SECCION30_TABLE_CONFIG.tasaAnalfabetismo;

  // ✅ COLUMNAS COMO SIGNALS - Evita problemas con caracteres acentuados en templates
  readonly nivelEducativoColumnasSignal: Signal<any[]> = computed(() => [
    { field: 'nivel', label: SECCION30_TEMPLATES.lblCategoría, type: 'text', readonly: true },
    { field: 'casos', label: SECCION30_TEMPLATES.lblCasos, type: 'number' },
    { field: 'porcentaje', label: SECCION30_TEMPLATES.lblPorcentaje, type: 'text', readonly: true }
  ]);

  readonly tasaAnalfabetismoColumnasSignal: Signal<any[]> = computed(() => [
    { field: 'indicador', label: SECCION30_TEMPLATES.lblIndicador, type: 'text', readonly: true },
    { field: 'casos', label: SECCION30_TEMPLATES.lblCasos, type: 'number' },
    { field: 'porcentaje', label: SECCION30_TEMPLATES.lblPorcentaje, type: 'text', readonly: true }
  ]);

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ PÁRRAFO INTRO con fallback y prefijo de grupo
  readonly parrafoSignal: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const campo = `parrafoSeccion30_indicadores_educacion_intro${prefijo}`;
    const manual = this.projectFacade.selectField(this.seccionId, null, campo)();
    return manual && manual.trim().length > 0 ? manual : this.PARRAFO_INTRO_DEFAULT;
  });

  // ✅ TEXTO NIVEL EDUCATIVO con fallback y prefijo de grupo
  readonly textoNivelEducativoSignal: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const campo = `textoNivelEducativo${prefijo}`;
    const manual = this.projectFacade.selectField(this.seccionId, null, campo)();
    const cp = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || '____';
    if (manual && manual.trim().length > 0) return manual;
    return SECCION30_TEMPLATES.textoNivelEducativoDefault(cp);
  });

  // ✅ TEXTO TASA ANALFABETISMO con fallback y prefijo de grupo
  readonly textoTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const campo = `textoTasaAnalfabetismo${prefijo}`;
    const manual = this.projectFacade.selectField(this.seccionId, null, campo)();
    const cp = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || '____';
    if (manual && manual.trim().length > 0) return manual;
    return SECCION30_TEMPLATES.textoTasaAnalfabetismoDefault(cp);
  });

  // ✅ TÍTULOS Y FUENTES DE TABLAS
  readonly tituloNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'tituloNivelEducativo')();
    const cp = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    return manual && manual.trim().length > 0 ? manual : `${this.TITULO_NIVEL_EDUCATIVO_DEFAULT} – CP ${cp} (2017)`;
  });

  readonly fuenteNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'fuenteNivelEducativo')();
    return manual && manual.trim().length > 0 ? manual : this.FUENTE_NIVEL_EDUCATIVO_DEFAULT;
  });

  readonly tituloTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'tituloTasaAnalfabetismo')();
    const cp = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    return manual && manual.trim().length > 0 ? manual : `${this.TITULO_TASA_ANALFABETISMO_DEFAULT} – CP ${cp} (2017)`;
  });

  readonly fuenteTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'fuenteTasaAnalfabetismo')();
    return manual && manual.trim().length > 0 ? manual : this.FUENTE_TASA_ANALFABETISMO_DEFAULT;
  });

  // ✅ CENTRO POBLADO
  readonly centroPobladoSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || '____';
  });

  readonly nivelEducativoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)()
      ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return Array.isArray(v) ? v : [];
  });

  readonly tasaAnalfabetismoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)()
      ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return Array.isArray(v) ? v : [];
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      if (imagen) {
        fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
    }
    return fotos;
  });
  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });
  // ✅ VIEWMODEL COMPLETO
  readonly viewModel: Signal<any> = computed(() => ({
    parrafo: this.parrafoSignal(),
    textoNivelEducativo: this.textoNivelEducativoSignal(),
    textoTasaAnalfabetismo: this.textoTasaAnalfabetismoSignal(),
    tituloNivelEducativo: this.tituloNivelEducativoSignal(),
    fuenteNivelEducativo: this.fuenteNivelEducativoSignal(),
    tituloTasaAnalfabetismo: this.tituloTasaAnalfabetismoSignal(),
    fuenteTasaAnalfabetismo: this.fuenteTasaAnalfabetismoSignal(),
    centroPoblado: this.centroPobladoSignal(),
    nivelEducativo: this.nivelEducativoSignal(),
    tasaAnalfabetismo: this.tasaAnalfabetismoSignal(),
    fotos: this.fotosCacheSignal()
  }));

  private mockMergeService: TableMockMergeService;
  private tableFacade: TableManagementFacade;
  private tablasYaInicializadas = new Set<string>(); // Evitar bucles de inicialización

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private formChange: FormChangeService) {
    super(cdRef, injector);
    this.mockMergeService = injector.get(TableMockMergeService);
    this.tableFacade = injector.get(TableManagementFacade);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // Monitor photo fields to force re-evaluation and mark for check
    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });

    // ✅ CRÍTICO: Escuchar cambios en signals de tabla y forzar detección de cambios
    effect(() => {
      this.nivelEducativoSignal();
      this.tasaAnalfabetismoSignal();
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
    
    this.cargarFotografias();
    
    // Estructura inicial eliminada - solo inicializar vacío si no hay datos
    this.inicializarTablaVacia('nivelEducativoTabla');
    this.inicializarTablaVacia('tasaAnalfabetismoTabla');
  }

  /**
   * Inicializa una tabla vacía si no hay datos
   */
  private inicializarTablaVacia(tablaKey: string): void {
    if (this.tablasYaInicializadas.has(tablaKey)) {
      return;
    }
    const datosActuales = this.projectFacade.selectField(this.seccionId, null, tablaKey)()
      ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    if (!Array.isArray(datosActuales) || datosActuales.length === 0) {
      this.tablasYaInicializadas.add(tablaKey);
      this.projectFacade.setField(this.seccionId, null, tablaKey, []);
      this.onFieldChange(tablaKey, []);
    }
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  override ngOnDestroy(): void { super.ngOnDestroy(); }

  // ✅ ACTUALIZADORES DE TEXTO
  actualizarTexto(fieldId: string, valor: string): void {
    this.projectFacade.setField(this.seccionId, null, fieldId, valor);
    this.onFieldChange(fieldId, valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  actualizarParrafo(valor: string): void {
    this.actualizarTexto('parrafoSeccion30_indicadores_educacion_intro', valor);
  }

  actualizarTextoNivelEducativo(valor: string): void {
    this.actualizarTexto('textoNivelEducativo', valor);
  }

  actualizarTextoTasaAnalfabetismo(valor: string): void {
    this.actualizarTexto('textoTasaAnalfabetismo', valor);
  }

  // ✅ ACTUALIZADORES DE TÍTULOS Y FUENTES
  actualizarTituloNivelEducativo(valor: string): void {
    this.actualizarTexto('tituloNivelEducativo', valor);
  }

  actualizarFuenteNivelEducativo(valor: string): void {
    this.actualizarTexto('fuenteNivelEducativo', valor);
  }

  actualizarTituloTasaAnalfabetismo(valor: string): void {
    this.actualizarTexto('tituloTasaAnalfabetismo', valor);
  }

  actualizarFuenteTasaAnalfabetismo(valor: string): void {
    this.actualizarTexto('fuenteTasaAnalfabetismo', valor);
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.cdRef.markForCheck();
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  onNivelEducativoTableUpdated(tabla: any[]): void {
    // ✅ PATRÓN SECCION 28: Crear nuevas referencias para forzar cambio de referencia en binding
    const tablaKey = this.getNivelEducativoTablaKey();
    const tablaKeyBase = 'nivelEducativoTabla';
    
    this.datos[tablaKey] = [...tabla]; // Nueva referencia con spread
    this.datos[tablaKeyBase] = [...tabla]; // Nueva referencia en clave base también
    
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    if (tablaKeyBase !== tablaKey) {
      this.onFieldChange(tablaKeyBase, tabla, { refresh: false });
    }
    
    this.cdRef.detectChanges(); // ✅ Forzar detección de cambios inmediatamente
  }

  onTasaAnalfabetismoTableUpdated(tabla: any[]): void {
    // ✅ PATRÓN SECCION 28: Crear nuevas referencias para forzar cambio de referencia en binding
    const tablaKey = this.getTasaAnalfabetismoTablaKey();
    const tablaKeyBase = 'tasaAnalfabetismoTabla';
    
    this.datos[tablaKey] = [...tabla]; // Nueva referencia con spread
    this.datos[tablaKeyBase] = [...tabla]; // Nueva referencia en clave base también
    
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    if (tablaKeyBase !== tablaKey) {
      this.onFieldChange(tablaKeyBase, tabla, { refresh: false });
    }
    
    this.cdRef.detectChanges(); // ✅ Forzar detección de cambios inmediatamente
  }

  trackByIndex(index: number): number { return index; }

  // ✅ Métodos para retornar datos de tabla formateados para binding
  getNivelEducativoTablaKey(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
  }

  getTasaAnalfabetismoTablaKey(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
  }

  getNivelEducativoTablaData(): Record<string, any[]> {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
    return { [tablaKey]: this.nivelEducativoSignal() };
  }

  getTasaAnalfabetismoTablaData(): Record<string, any[]> {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
    return { [tablaKey]: this.tasaAnalfabetismoSignal() };
  }
}
