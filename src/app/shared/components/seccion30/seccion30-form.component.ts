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

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule],
  selector: 'app-seccion30-form',
  templateUrl: './seccion30-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion30FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.9';
  @Input() override modoFormulario: boolean = false;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  // Textos por defecto
  readonly PARRAFO_INTRO_DEFAULT = 'La educación es un pilar fundamental para el desarrollo social y económico de una comunidad. En ese sentido, los indicadores de educación juegan un papel crucial al proporcionar una visión clara del estado actual del sistema educativo y su impacto en la población. Este apartado se centra en dos indicadores clave: el nivel educativo de la población y la tasa de analfabetismo. El análisis de estos indicadores permite comprender mejor las fortalezas y desafíos del sistema educativo local, así como diseñar estrategias efectivas para mejorar la calidad educativa y reducir las desigualdades en el acceso a la educación.';
  
  readonly TITULO_NIVEL_EDUCATIVO_DEFAULT = 'Población de 15 años a más según nivel educativo alcanzado';
  readonly FUENTE_NIVEL_EDUCATIVO_DEFAULT = 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
  
  readonly TITULO_TASA_ANALFABETISMO_DEFAULT = 'Tasa de analfabetismo en población de 15 años a más';
  readonly FUENTE_TASA_ANALFABETISMO_DEFAULT = 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';

  // Estructuras iniciales ELIMINADAS por request del usuario
  
  nivelEducativoDynamicConfig = {
    tablaKey: 'nivelEducativoTabla',
    totalKey: 'nivel',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true
  };

  tasaAnalfabetismoDynamicConfig = {
    tablaKey: 'tasaAnalfabetismoTabla',
    totalKey: 'indicador',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true
  };

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ PÁRRAFO INTRO con fallback
  readonly parrafoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion30_indicadores_educacion_intro')();
    return manual && manual.trim().length > 0 ? manual : this.PARRAFO_INTRO_DEFAULT;
  });

  // ✅ TEXTO NIVEL EDUCATIVO con fallback
  readonly textoNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoNivelEducativo')();
    const cp = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || '____';
    if (manual && manual.trim().length > 0) return manual;
    return `En el CP ${cp}, el nivel educativo alcanzado por la mayor parte de la población de 15 años a más es la secundaria. A continuación se presentan los datos de nivel educativo según el censo nacional.`;
  });

  // ✅ TEXTO TASA ANALFABETISMO con fallback  
  readonly textoTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoTasaAnalfabetismo')();
    const cp = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || '____';
    if (manual && manual.trim().length > 0) return manual;
    return `En el CP ${cp}, tomando en cuenta a la población de 15 años a más, se presentan los datos de tasa de analfabetismo según el censo nacional.`;
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
      const legacy = this.projectFacade.obtenerDatos();
      this.datos = { ...legacy, ...data };
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
    this.projectFacade.setField(this.seccionId, null, 'nivelEducativoTabla', tabla);
    this.formChange.persistFields(this.seccionId, 'table', { nivelEducativoTabla: tabla });
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  onTasaAnalfabetismoTableUpdated(tabla: any[]): void {
    this.projectFacade.setField(this.seccionId, null, 'tasaAnalfabetismoTabla', tabla);
    this.formChange.persistFields(this.seccionId, 'table', { tasaAnalfabetismoTabla: tabla });
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  trackByIndex(index: number): number { return index; }
}
