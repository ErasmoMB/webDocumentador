import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';

@Component({
  selector: 'app-seccion14-view',
  templateUrl: './seccion14-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion14ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.10';
  @Input() override modoFormulario: boolean = false;  
  // NOTE: Use AISD-style section id for table-numbering fixedSections

  override readonly PHOTO_PREFIX = 'fotografiaEducacionIndicadores';
  override useReactiveSync: boolean = true;

  fotografiasSeccion14: FotoItem[] = [];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ Signals dedicados para textos (usan prefijo para aislamiento AISD)
  readonly textoIndicadoresEducacionIntroSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campo = 'parrafoSeccion14_indicadores_educacion_intro' + prefijo;
    const data = this.formDataSignal();
    const valor = data[campo];
    console.log('[Seccion14][view] textoIndicadoresEducacionIntroSignal:', { prefijo, campo, valor });
    return (valor && String(valor).trim().length > 0) ? String(valor) :
      'La educación es un indicador fundamental para medir el desarrollo humano y social de una comunidad. A continuación, se presentan los principales indicadores educativos de la población de la comunidad campesina, basados en los datos censales disponibles.';
  });

  readonly textoNivelEducativoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campo = 'textoNivelEducativo' + prefijo;
    const data = this.formDataSignal();
    const valor = data[campo];
    console.log('[Seccion14][view] textoNivelEducativoSignal:', { prefijo, campo, valor });
    return (valor && String(valor).trim().length > 0) ? String(valor) :
      'El nivel educativo alcanzado por la población de 15 años a más refleja el acceso y la calidad de la educación en la comunidad. Los datos muestran que ____% de la población ha alcanzado educación primaria, ____% secundaria y ____% educación superior no universitaria.';
  });

  readonly textoTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campo = 'textoTasaAnalfabetismo' + prefijo;
    const data = this.formDataSignal();
    const valor = data[campo];
    console.log('[Seccion14][view] textoTasaAnalfabetismoSignal:', { prefijo, campo, valor });
    return (valor && String(valor).trim().length > 0) ? String(valor) :
      'La tasa de analfabetismo en la población de 15 años a más es de ____%, lo que representa ____ personas que no saben leer ni escribir. Este indicador es crucial para identificar necesidades educativas y planificar intervenciones.';
  });

  readonly nivelEducativoTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `nivelEducativoTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly tasaAnalfabetismoTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `tasaAnalfabetismoTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

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

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private tableNumbering: TableNumberingService
  ) {
    super(cdRef, injector);

    effect(() => {
      const sectionData = this.formDataSignal();
      const prefijo = this.obtenerPrefijo();
      console.log('[Seccion14][view] sectionData changed', {
        prefijo,
        sectionKeys: Object.keys(sectionData || {}).slice(0,10),
        tienePrefijoNivel: 'nivelEducativoTabla' + prefijo in (sectionData || {}),
        nivelTablaLength: (sectionData && sectionData['nivelEducativoTabla'] && (sectionData['nivelEducativoTabla'] as any).length) || 'n/a'
      });
      this.datos = { ...this.projectFacade.obtenerDatos(), ...sectionData };
      this.cdRef.markForCheck();
    });

    // ✅ Effects para observar signals de texto
    effect(() => {
      this.textoIndicadoresEducacionIntroSignal();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    effect(() => {
      this.textoNivelEducativoSignal();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    effect(() => {
      this.textoTasaAnalfabetismoSignal();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    // Efectos de escucha específicos para tablas (logs de debugging)
    effect(() => {
      const tabla = this.nivelEducativoTablaSignal();
      console.log('[Seccion14][view] nivelEducativoTablaSignal changed:', tabla ? tabla.length : 0, tabla);
      this.cdRef.markForCheck();
    });

    effect(() => {
      const tabla = this.tasaAnalfabetismoTablaSignal();
      console.log('[Seccion14][view] tasaAnalfabetismoTablaSignal changed:', tabla ? tabla.length : 0, tabla);
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

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  public obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  public override obtenerPrefijoGrupo(): string {
    return this.obtenerPrefijo();
  }

  getFieldIdIndicadoresEducacionIntro(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion14_indicadores_educacion_intro${prefijo}` : 'parrafoSeccion14_indicadores_educacion_intro';
  }

  getFieldIdNivelEducativo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoNivelEducativo${prefijo}` : 'textoNivelEducativo';
  }

  getFieldIdTasaAnalfabetismo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoTasaAnalfabetismo${prefijo}` : 'textoTasaAnalfabetismo';
  }

  getNivelEducativoConPorcentajes(): any[] {
    const tabla = this.nivelEducativoTablaSignal();
    if (!tabla || tabla.length === 0) return [];
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, 'casos');
  }

  getTasaAnalfabetismoConPorcentajes(): any[] {
    const tabla = this.tasaAnalfabetismoTablaSignal();
    if (!tabla || tabla.length === 0) return [];
    // Usar calculadora específica para analfabetismo que agrega fila 'Total' en la columna 'indicador'
    const cuadroNumero = this.tableNumbering.getGlobalTableNumber(this.seccionId, 1);
    return TablePercentageHelper.calcularPorcentajesAnalfabetismo(tabla, cuadroNumero);
  }

  public override obtenerNombreComunidadActual(): string {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    return grupoAISD || '____';
  }

  getPorcentajePrimaria(): string {
    const tabla = this.getNivelEducativoConPorcentajes();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('primaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeSecundaria(): string {
    const tabla = this.getNivelEducativoConPorcentajes();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('secundaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeSuperiorNoUniversitaria(): string {
    const tabla = this.getNivelEducativoConPorcentajes();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('superior no universitaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getTasaAnalfabetismo(): string {
    const tabla = this.getTasaAnalfabetismoConPorcentajes();
    const item = tabla.find((i: any) => i.indicador?.toLowerCase().includes('no sabe'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getCasosAnalfabetismo(): string {
    const tabla = this.getTasaAnalfabetismoConPorcentajes();
    const item = tabla.find((i: any) => i.indicador?.toLowerCase().includes('no sabe'));
    return item?.casos ? String(item.casos) : '____';
  }

  obtenerTextoSeccion14IndicadoresEducacionIntroConResaltado(): string {
    const texto = this.textoIndicadoresEducacionIntroSignal();
    return texto.replace(/____/g, this.obtenerNombreComunidadActual());
  }

  obtenerTextoNivelEducativoConResaltado(): string {
    let texto = this.textoNivelEducativoSignal();
    texto = texto.replace(/____% de la población ha alcanzado educación primaria/g, `${this.getPorcentajePrimaria()}% de la población ha alcanzado educación primaria`);
    texto = texto.replace(/____% secundaria/g, `${this.getPorcentajeSecundaria()}% secundaria`);
    texto = texto.replace(/____% educación superior no universitaria/g, `${this.getPorcentajeSuperiorNoUniversitaria()}% educación superior no universitaria`);
    return texto;
  }

  obtenerTextoTasaAnalfabetismoConResaltado(): string {
    let texto = this.textoTasaAnalfabetismoSignal();
    texto = texto.replace(/____%/g, this.getTasaAnalfabetismo());
    texto = texto.replace(/____ personas/g, `${this.getCasosAnalfabetismo()} personas`);
    return texto;
  }

  obtenerTituloCuadroNivelEducativo(): string {
    const titulo = this.datos['cuadroTituloNivelEducativo' + this.obtenerPrefijo()];
    return titulo || 'Población de 15 años a más según nivel educativo alcanzado';
  }

  obtenerFuenteCuadroNivelEducativo(): string {
    const fuente = this.datos['cuadroFuenteNivelEducativo' + this.obtenerPrefijo()];
    return fuente;
  }

  obtenerTituloCuadroTasaAnalfabetismo(): string {
    const titulo = this.datos['cuadroTituloTasaAnalfabetismo' + this.obtenerPrefijo()];
    return titulo || 'Tasa de analfabetismo en población de 15 años a más';
  }

  obtenerFuenteCuadroTasaAnalfabetismo(): string {
    const fuente = this.datos['cuadroFuenteTasaAnalfabetismo' + this.obtenerPrefijo()];
    return fuente;
  }

  getFotografiasEducacionIndicadoresVista(): FotoItem[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return [...this.fotografiasCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      `${this.PHOTO_PREFIX}${this.obtenerPrefijo()}`,
      groupPrefix
    );
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasCache;
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    super.onFotografiasChange(fotografias);
    this.fotografiasSeccion14 = fotografias;
    this.cdRef.markForCheck();
  }
}