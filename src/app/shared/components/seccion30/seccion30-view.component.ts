import { Component, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from '../../utils/prefijo-helper';

@Component({
  selector: 'app-seccion30-view',
  templateUrl: './seccion30-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule]
})
export class Seccion30ViewComponent extends BaseSectionComponent {
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

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly centroPobladoSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || '____';
  });

  readonly parrafoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion30_indicadores_educacion_intro')();
    return manual && manual.trim().length > 0 ? manual : this.PARRAFO_INTRO_DEFAULT;
  });

  readonly textoNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoNivelEducativo')();
    const cp = this.centroPobladoSignal();
    if (manual && manual.trim().length > 0) return manual;
    return `En el CP ${cp}, el nivel educativo alcanzado por la mayor parte de la población de 15 años a más es la secundaria. A continuación se presentan los datos de nivel educativo según el censo nacional.`;
  });

  readonly textoTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoTasaAnalfabetismo')();
    const cp = this.centroPobladoSignal();
    if (manual && manual.trim().length > 0) return manual;
    return `En el CP ${cp}, tomando en cuenta a la población de 15 años a más, se presentan los datos de tasa de analfabetismo según el censo nacional.`;
  });

  readonly tituloNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'tituloNivelEducativo')();
    const cp = this.centroPobladoSignal() || 'Cahuacho';
    return manual && manual.trim().length > 0 ? manual : `${this.TITULO_NIVEL_EDUCATIVO_DEFAULT} – CP ${cp} (2017)`;
  });

  readonly fuenteNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'fuenteNivelEducativo')();
    return manual && manual.trim().length > 0 ? manual : this.FUENTE_NIVEL_EDUCATIVO_DEFAULT;
  });

  readonly tituloTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'tituloTasaAnalfabetismo')();
    const cp = this.centroPobladoSignal() || 'Cahuacho';
    return manual && manual.trim().length > 0 ? manual : `${this.TITULO_TASA_ANALFABETISMO_DEFAULT} – CP ${cp} (2017)`;
  });

  readonly fuenteTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'fuenteTasaAnalfabetismo')();
    return manual && manual.trim().length > 0 ? manual : this.FUENTE_TASA_ANALFABETISMO_DEFAULT;
  });

  readonly nivelEducativoSignal: Signal<any[]> = computed(() => {
    const v = this.projectFacade.selectField(this.seccionId, null, 'nivelEducativoTabla')()
      ?? this.projectFacade.selectTableData(this.seccionId, null, 'nivelEducativoTabla')();
    const datos = Array.isArray(v) ? v : [];
    return this.agregarFilaTotalNivelEducativo(datos);
  });

  readonly tasaAnalfabetismoSignal: Signal<any[]> = computed(() => {
    const v = this.projectFacade.selectField(this.seccionId, null, 'tasaAnalfabetismoTabla')()
      ?? this.projectFacade.selectTableData(this.seccionId, null, 'tasaAnalfabetismoTabla')();
    const datos = Array.isArray(v) ? v : [];
    return this.agregarFilaTotalTasaAnalfabetismo(datos);
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
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

    effect(() => {
      const data = this.formDataSignal();
      // Merge instead of replace: keep existing datos when selector is empty (fallback to BaseSectionComponent data)
      if (data && Object.keys(data).length > 0) {
        this.datos = { ...this.datos, ...data };
      }
      // Aplicar valores con prefijo después del merge (leer del signal, no de this.datos)
      const centroPrefijado = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId);
      if (centroPrefijado) {
        this.datos.centroPobladoAISI = centroPrefijado;
      }
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

  // Agregar fila de total para Nivel Educativo
  private agregarFilaTotalNivelEducativo(datos: any[]): any[] {
    if (!datos || datos.length === 0) return datos;
    // Filtrar si ya existe una fila de total
    const sinTotal = datos.filter(item => !item?.nivel?.toString?.().toLowerCase?.().includes('total'));
    const totalCasos = sinTotal.reduce((sum, item) => {
      const casos = typeof item.casos === 'number' ? item.casos : (parseInt(String(item.casos).replace(/[^0-9]/g, '')) || 0);
      return sum + casos;
    }, 0);
    return [...sinTotal, { nivel: 'Total', casos: totalCasos, porcentaje: '100,00 %' }];
  }

  // Agregar fila de total para Tasa de Analfabetismo
  private agregarFilaTotalTasaAnalfabetismo(datos: any[]): any[] {
    if (!datos || datos.length === 0) return datos;
    // Filtrar si ya existe una fila de total
    const sinTotal = datos.filter(item => !item?.indicador?.toString?.().toLowerCase?.().includes('total'));
    const totalCasos = sinTotal.reduce((sum, item) => {
      const casos = typeof item.casos === 'number' ? item.casos : (parseInt(String(item.casos).replace(/[^0-9]/g, '')) || 0);
      return sum + casos;
    }, 0);
    return [...sinTotal, { indicador: 'Total', casos: totalCasos, porcentaje: '100,00 %' }];
  }

  trackByIndex(index: number): number { return index; }
}
