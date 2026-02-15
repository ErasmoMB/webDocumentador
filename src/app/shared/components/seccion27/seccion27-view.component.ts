import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, Input, OnDestroy, Signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { normalizeTitleWithPlaceholders } from '../../utils/placeholder-text.helper';
import { SECCION27_TEMPLATES } from './seccion27-constants';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent, ImageUploadComponent],
  selector: 'app-seccion27-view',
  templateUrl: './seccion27-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion27ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.6';

  override useReactiveSync: boolean = true;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION27_TEMPLATES = SECCION27_TEMPLATES;

  // ✅ Helper para obtener prefijo de grupo
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  // ✅ FormDataSignal local
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly centroPobladoSignal: Signal<string> = computed(() => {
    this.formDataSignal();
    return this.obtenerNombreCentroPobladoActual() || '____';
  });

  readonly distritoActualSignal: Signal<string> = computed(() => {
    this.formDataSignal();
    return this.obtenerNombreDistritoActual() || '____';
  });

  // ✅ PHOTO_PREFIX Signals dinámicos
  readonly photoPrefixSignalTransporte: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `fotografiaTransporteAISI${prefijo}` : 'fotografiaTransporteAISI';
  });

  readonly photoPrefixSignalTelecomunicaciones: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `fotografiaTelecomunicacionesAISI${prefijo}` : 'fotografiaTelecomunicacionesAISI';
  });

  // ✅ Campos con prefijos
  readonly textoTransporteCP1Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTransporteCP1${prefijo}` : 'textoTransporteCP1';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const centroPoblado = this.centroPobladoSignal();
    return `En el CP ${centroPoblado}, la infraestructura de transporte es limitada. Dentro de la localidad solo se encuentran trochas carrozables que permiten llegar al centro poblado. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro del distrito también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al centro poblado.`;
  });

  readonly textoTransporteCP2Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTransporteCP2${prefijo}` : 'textoTransporteCP2';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const data = this.formDataSignal();
    const ciudadOrigen = data?.['ciudadOrigenComercio'] || 'Caravelí';
    const distrito = this.distritoActualSignal();
    const costoMin = data?.[`costoTransporteMinimo${prefijo}`] || data?.['costoTransporteMinimo'] || '25';
    const costoMax = data?.[`costoTransporteMaximo${prefijo}`] || data?.['costoTransporteMaximo'] || '30';
    return `Por otro lado, no existen empresas de transporte formalmente establecidas dentro de la localidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${ciudadOrigen}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los habitantes para desplazarse a ciudades más grandes.`;
  });

  readonly textoTelecomunicacionesCP1Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTelecomunicacionesCP1${prefijo}` : 'textoTelecomunicacionesCP1';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const centroPoblado = this.centroPobladoSignal();
    return `En el CP ${centroPoblado}, la infraestructura en telecomunicaciones proporciona acceso a diversos servicios de comunicación que conectan a la población con el resto del país. Aunque existen algunas limitaciones, los servicios disponibles permiten que los habitantes se mantengan informados y comunicados.`;
  });

  readonly textoTelecomunicacionesCP2Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTelecomunicacionesCP2${prefijo}` : 'textoTelecomunicacionesCP2';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return `En cuanto a radiodifusión, se puede captar señal de emisoras nacionales como RPP, Nacional y Unión, las cuales sirven como importantes fuentes de información y entretenimiento para la población local. Estas emisoras proporcionan noticias, música y programas de interés general que son valorados por los habitantes del centro poblado.`;
  });

  readonly textoTelecomunicacionesCP3Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTelecomunicacionesCP3${prefijo}` : 'textoTelecomunicacionesCP3';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const centroPoblado = this.centroPobladoSignal();
    return `Respecto a la señal de televisión, el centro poblado cuenta con acceso a América TV a través de señal abierta. Adicionalmente, algunas familias en ${centroPoblado} optan por servicios de televisión satelital como DIRECTV, lo que les permite acceder a una mayor variedad de canales y contenido.\n\nEn lo que respecta a la telefonía móvil e internet, la cobertura es proporcionada por las operadoras Movistar, Claro y Entel, lo que facilita la comunicación dentro del área y con el exterior. Para el acceso a internet, la población principalmente se conecta a través de los datos móviles proporcionados por Movistar y Entel, lo que les permite mantenerse conectados para actividades cotidianas y laborales.`;
  });

  readonly telecomunicacionesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `telecomunicacionesCpTabla${prefijo}` : 'telecomunicacionesCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly cuadroTituloTelecomunicacionesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroTituloTelecomunicaciones${prefijo}` : 'cuadroTituloTelecomunicaciones';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  readonly cuadroFuenteTelecomunicacionesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroFuenteTelecomunicaciones${prefijo}` : 'cuadroFuenteTelecomunicaciones';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);

    effect(() => {
      const data = this.formDataSignal();
      if (data && Object.keys(data).length > 0) {
        this.datos = { ...this.datos, ...data };
      }
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.telecomunicacionesSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  getFotosTransporteSignal(): FotoItem[] {
    return this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalTransporte(), this.imageFacade.getGroupPrefix(this.seccionId));
  }

  getFotosTelecomunicacionesSignal(): FotoItem[] {
    return this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalTelecomunicaciones(), this.imageFacade.getGroupPrefix(this.seccionId));
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  getTituloTelecomunicaciones(): string {
    const centroPoblado = this.centroPobladoSignal() || '____';
    const distrito = this.distritoActualSignal();
    const defaultTitle = `${SECCION27_TEMPLATES.labelTablaTelecomunicaciones} – CP ${centroPoblado}`;
    return normalizeTitleWithPlaceholders(this.cuadroTituloTelecomunicacionesSignal(), defaultTitle, centroPoblado, distrito);
  }
}
