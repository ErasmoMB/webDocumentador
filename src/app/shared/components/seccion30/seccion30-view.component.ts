import { Component, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { normalizeTitleWithPlaceholders } from '../../utils/placeholder-text.helper';
import { SECCION30_TEMPLATES, SECCION30_CONFIG, SECCION30_WATCHED_FIELDS } from './seccion30-constants';

@Component({
  selector: 'app-seccion30-view',
  templateUrl: './seccion30-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule]
})
export class Seccion30ViewComponent extends BaseSectionComponent {
  @Input() override seccionId: string = SECCION30_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;

  // ✅ EXPORTAR CONSTANTS PARA USAR EN TEMPLATE
  readonly SECCION30_TEMPLATES = SECCION30_TEMPLATES;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION30_WATCHED_FIELDS;

  // ✅ TEXTOS POR DEFECTO - Ahora desde CONSTANTS
  readonly PARRAFO_INTRO_DEFAULT = SECCION30_TEMPLATES.parrafoIntroDefault;
  readonly TITULO_NIVEL_EDUCATIVO_DEFAULT = SECCION30_TEMPLATES.tituloNivelEducativoDefault;
  readonly FUENTE_NIVEL_EDUCATIVO_DEFAULT = SECCION30_TEMPLATES.fuenteNivelEducativoDefault;
  readonly TITULO_TASA_ANALFABETISMO_DEFAULT = SECCION30_TEMPLATES.tituloTasaAnalfabetismoDefault;
  readonly FUENTE_TASA_ANALFABETISMO_DEFAULT = SECCION30_TEMPLATES.fuenteTasaAnalfabetismoDefault;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly centroPobladoSignal: Signal<string> = computed(() => {
    return this.obtenerNombreCentroPobladoActual()
      || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')()
      || '____';
  });

  readonly parrafoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion30_indicadores_educacion_intro')();
    return manual && manual.trim().length > 0 ? manual : this.PARRAFO_INTRO_DEFAULT;
  });

  readonly textoNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoNivelEducativo')();
    const cp = this.centroPobladoSignal();
    if (manual && manual.trim().length > 0) return manual;
    return SECCION30_TEMPLATES.textoNivelEducativoDefault(cp);
  });

  readonly textoTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoTasaAnalfabetismo')();
    const cp = this.centroPobladoSignal();
    if (manual && manual.trim().length > 0) return manual;
    return SECCION30_TEMPLATES.textoTasaAnalfabetismoDefault(cp);
  });

  readonly tituloNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'tituloNivelEducativo')();
    const cp = this.centroPobladoSignal() || '____';
    const distrito = this.obtenerNombreDistritoActual();
    const fallback = `${this.TITULO_NIVEL_EDUCATIVO_DEFAULT} – CP ${cp} (2017)`;
    return normalizeTitleWithPlaceholders(manual, fallback, cp, distrito);
  });

  readonly fuenteNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'fuenteNivelEducativo')();
    return manual && manual.trim().length > 0 ? manual : this.FUENTE_NIVEL_EDUCATIVO_DEFAULT;
  });

  readonly tituloTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'tituloTasaAnalfabetismo')();
    const cp = this.centroPobladoSignal() || '____';
    const distrito = this.obtenerNombreDistritoActual();
    const fallback = `${this.TITULO_TASA_ANALFABETISMO_DEFAULT} – CP ${cp} (2017)`;
    return normalizeTitleWithPlaceholders(manual, fallback, cp, distrito);
  });

  readonly fuenteTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'fuenteTasaAnalfabetismo')();
    return manual && manual.trim().length > 0 ? manual : this.FUENTE_TASA_ANALFABETISMO_DEFAULT;
  });

  // ✅ CONFIGURACIONES DE TABLAS - Signals para evitar errores de template
  readonly tableConfigNivelEducativo: Signal<any> = computed(() => ({
    columns: [
      { key: 'nivel', header: SECCION30_TEMPLATES.lblCategoría, width: '50%' },
      { key: 'casos', header: SECCION30_TEMPLATES.lblCasos, width: '25%', align: 'center' },
      { key: 'porcentaje', header: SECCION30_TEMPLATES.lblPorcentaje, width: '25%', align: 'center' }
    ],
    showHeader: true,
    showFooter: false
  }));

  readonly tableConfigTasaAnalfabetismo: Signal<any> = computed(() => ({
    columns: [
      { key: 'indicador', header: SECCION30_TEMPLATES.lblIndicador, width: '50%' },
      { key: 'casos', header: SECCION30_TEMPLATES.lblCasos, width: '25%', align: 'center' },
      { key: 'porcentaje', header: SECCION30_TEMPLATES.lblPorcentaje, width: '25%', align: 'center' }
    ],
    showHeader: true,
    showFooter: false
  }));

  /**
   * ✅ Procesa los datos de Nivel Educativo para mostrar 100% en filas Total
   */
  readonly nivelEducativoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)()
      ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    const datos = Array.isArray(v) ? v : [];
    
    // ✅ Procesar para mostrar 100% en filas Total
    return datos.map(fila => {
      const nivel = (fila.nivel || '').toString().toLowerCase();
      if (nivel.includes('total')) {
        return { ...fila, porcentaje: '100.00 %' };
      }
      return fila;
    });
  });

  /**
   * ✅ Procesa los datos de Tasa Analfabetismo para mostrar 100% en filas Total
   */
  readonly tasaAnalfabetismoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)()
      ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    const datos = Array.isArray(v) ? v : [];
    
    // ✅ Procesar para mostrar 100% en filas Total
    return datos.map(fila => {
      const indicador = (fila.indicador || '').toString().toLowerCase();
      if (indicador.includes('total')) {
        return { ...fila, porcentaje: '100.00 %' };
      }
      return fila;
    });
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
    fotos: this.fotosCacheSignal(),
    data: this.formDataSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = 'fotografiaCahuacho';

    effect(() => {
      const data = this.formDataSignal();
      // Merge instead of replace: keep existing datos when selector is empty (fallback to BaseSectionComponent data)
      if (data && Object.keys(data).length > 0) {
        this.datos = { ...this.datos, ...data };
      }
      // Aplicar valores con prefijo después del merge (leer del signal, no de this.datos)
      this.datos.centroPobladoAISI = data?.['centroPobladoAISI'] || this.datos.centroPobladoAISI;
      this.cdRef.markForCheck();
    });

    // Monitor photo fields to force re-evaluation and mark for check
    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  trackByIndex(index: number): number { return index; }
}
