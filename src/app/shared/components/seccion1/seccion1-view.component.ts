import {
  Component,
  ChangeDetectorRef,
  Input,
  ChangeDetectionStrategy,
  Injector,
  Signal,
  computed,
  effect,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TextNormalizationService } from 'src/app/core/services/utilities/text-normalization.service';
import { GruposService } from 'src/app/core/infrastructure/services';
import { FotoItem } from '../image-upload/image-upload.component';
import {
  SECCION1_WATCHED_FIELDS,
  SECCION1_SECTION_ID,
  SECCION1_TEMPLATES,
  OBJETIVO_DEFAULT_1,
  OBJETIVO_DEFAULT_2
} from './seccion1-constants';

@Component({
  standalone: true,
  imports: [CommonModule, CoreSharedModule],
  selector: 'app-seccion1-view',
  templateUrl: './seccion1-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host ::ng-deep .data-manual.has-data {
        border-left: 4px solid #007bff;
        padding-left: 12px;
      }
      .text-justify {
        text-align: justify;
      }
      .list-item {
        margin: 8px 0;
      }
    `
  ]
})
export class Seccion1ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION1_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaSeccion1';
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION1_WATCHED_FIELDS;

  // ✅ PROPIEDADES PARA FOTOGRAFÍAS EN VISTA
  fotografiasSeccion1: FotoItem[] = [];

  // ✅ SIGNAL PRINCIPAL: Lee todos los datos de la sección actual
  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ SIGNALS DERIVADOS POR CAMPO - Data básica
  readonly projectNameSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'projectName')() || '____';
  });

  readonly geoInfoSignal: Signal<any> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'geoInfo')() || {};
  });

  readonly departamentoSeleccionadoSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['departamentoSeleccionado'] ?? formData['geoInfo']?.DPTO ?? '';
  });

  readonly provinciaSeleccionadaSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['provinciaSeleccionada'] ?? formData['geoInfo']?.PROV ?? '';
  });

  readonly distritoSeleccionadoSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['distritoSeleccionado'] ?? formData['geoInfo']?.DIST ?? '';
  });

  // ✅ OBJETIVOS: Valores por defecto + valores del store
  readonly objetivosSignal: Signal<string[]> = computed(() => {
    const fromStore = this.projectFacade.selectField(this.seccionId, null, 'objetivosSeccion1')();
    if (Array.isArray(fromStore) && fromStore.length > 0) {
      return fromStore;
    }
    // Fallback a valores por defecto
    return [
      this.getObjetivoDefault(0),
      this.getObjetivoDefault(1)
    ];
  });

  // ✅ PÁRRAFOS: Valores guardados o por defecto
  readonly parrafoPrincipalSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    const guardado = formData['parrafoSeccion1_principal'];
    if (guardado) return guardado;
    return this.obtenerTextoParrafoPrincipal();
  });

  readonly parrafoIntroduccionSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    const guardado = formData['parrafoSeccion1_4'];
    if (guardado) return guardado;
    return this.obtenerTextoIntroduccionObjetivos();
  });

  // ✅ SIGNAL DERIVADO: Indicador de completitud
  readonly datosCompletadosSignal: Signal<boolean> = computed(() => {
    return (
      this.projectNameSignal().length > 0 &&
      this.objetivosSignal().length > 0
    );
  });

  // ✅ EFFECT para reactividad automática
  private readonly syncEffect = effect(
    () => {
      const _ = [
        this.projectNameSignal(),
        this.geoInfoSignal(),
        this.departamentoSeleccionadoSignal(),
        this.provinciaSeleccionadaSignal(),
        this.distritoSeleccionadoSignal(),
        this.objetivosSignal(),
        this.parrafoPrincipalSignal(),
        this.parrafoIntroduccionSignal(),
        this.datosCompletadosSignal()
      ];
      this.cdRef.markForCheck();
    },
    { allowSignalWrites: true }
  );

  constructor(
    private textNormalization: TextNormalizationService,
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private gruposService: GruposService
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  private getObjetivoDefault(index: number): string {
    const proyecto = this.projectNameSignal();
    const proyectoNormalizado = this.textNormalization.normalizarNombreProyecto(proyecto === '____' ? undefined : proyecto, false);
    
    if (index === 0) {
      return OBJETIVO_DEFAULT_1.replace('{projectName}', proyectoNormalizado);
    }
    return OBJETIVO_DEFAULT_2;
  }

  // ✅ Para vista: retorna los objetivos con reemplazo de placeholders
  obtenerObjetivosParaVista(): string[] {
    const proyecto = this.projectNameSignal();
    return this.objetivosSignal().map(o => (o || '').replace(/____/g, proyecto));
  }

  // ✅ TrackBy para listas
  trackByIndex(index: number): number {
    return index;
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
      }
    }

    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
  }

  override getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return this.fieldMapping.getDataSourceType(fieldName);
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  normalizarNombreProyecto(texto: string | undefined | null, conArticulo: boolean = true): string {
    return this.textNormalization.normalizarNombreProyecto(texto, conArticulo);
  }

  capitalizarTexto(texto: string): string {
    return this.textNormalization.capitalizarTexto(texto);
  }

  obtenerTextoParrafoPrincipal(): string {
    if (this.datos?.parrafoSeccion1_principal) {
      return this.datos.parrafoSeccion1_principal;
    }
    
    const proyecto = this.datos?.projectName || '____';
    const distrito = this.datos?.distritoSeleccionado || '____';
    const provincia = this.datos?.provinciaSeleccionada || '____';
    const departamento = this.datos?.departamentoSeleccionado || '____';
    
    return `Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ${proyecto}, como un patrón de referencia inicial en base a la cual se pueda medir los impactos sobre la población del entorno directo del Proyecto.\n\nEl proyecto ${proyecto} se encuentra ubicado en el distrito de ${distrito}, en la provincia de ${provincia}, en el departamento de ${departamento}, bajo la administración del Gobierno Regional de ${departamento}, en el sur del Perú.\n\nEste estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental, los Términos de Referencia comunes para actividades de exploración minera y la Guía de Relaciones Comunitarias del Ministerio de Energía y Minas (MINEM).`;
  }

  obtenerTextoIntroduccionObjetivos(): string {
    if (this.datos?.parrafoSeccion1_4) {
      return this.datos.parrafoSeccion1_4;
    }
    
    return 'Los objetivos de la presente línea de base social (LBS) son los siguientes:';
  }

  obtenerTitulo(): string {
    return SECCION1_TEMPLATES.TITULO_VIEW;
  }

  obtenerSubtitulo(): string {
    return SECCION1_TEMPLATES.SUBTITULO;
  }

  obtenerEstadoCompletitud(): string {
    return this.datosCompletadosSignal() ? '✓ Completado' : '○ Incompleto';
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
