import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ParagraphEditorComponent, ImageUploadComponent, DynamicTableComponent],
  selector: 'app-seccion27-form',
  templateUrl: './seccion27-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion27FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.6';
  @Input() override modoFormulario: boolean = false;

  // ✅ Helper para obtener prefijo de grupo
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  // ✅ Helpers públicos para obtener keys con prefijo (CRÍTICO para sync)
  getKeyTextoTransporteCP1(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTransporteCP1${prefijo}` : 'textoTransporteCP1';
  }

  getKeyTextoTransporteCP2(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTransporteCP2${prefijo}` : 'textoTransporteCP2';
  }

  getKeyTextoTelecomunicacionesCP1(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTelecomunicacionesCP1${prefijo}` : 'textoTelecomunicacionesCP1';
  }

  getKeyTextoTelecomunicacionesCP2(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTelecomunicacionesCP2${prefijo}` : 'textoTelecomunicacionesCP2';
  }

  getKeyTextoTelecomunicacionesCP3(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoTelecomunicacionesCP3${prefijo}` : 'textoTelecomunicacionesCP3';
  }

  // ✅ PHOTO_PREFIX Signals dinámicos
  readonly photoPrefixSignalTransporte: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `fotografiaTransporteAISI${prefijo}` : 'fotografiaTransporteAISI';
  });

  readonly photoPrefixSignalTelecomunicaciones: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `fotografiaTelecomunicacionesAISI${prefijo}` : 'fotografiaTelecomunicacionesAISI';
  });

  fotografiasTransporteFormMulti: FotoItem[] = [];
  fotografiasTelecomunicacionesFormMulti: FotoItem[] = [];

  // ✅ FormDataSignal local
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ Telecomunicaciones sin estructura inicial
  telecomunicacionesConfig: TableConfig = {
    tablaKey: 'telecomunicacionesCpTabla',
    totalKey: 'medio',
    campoTotal: 'medio',
    calcularPorcentajes: false,
    noInicializarDesdeEstructura: true
  };

  // ✅ Campos con prefijos dinámicos
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

  readonly telecomunicacionesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `telecomunicacionesCpTabla${prefijo}` : 'telecomunicacionesCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  // ✅ Text signals (MODO IDEAL - computed reactivos)
  readonly textoTransporteCP1Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTransporteCP1${prefijo}` : 'textoTransporteCP1';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoTransporteCP1();
  });

  readonly textoTransporteCP2Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTransporteCP2${prefijo}` : 'textoTransporteCP2';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoTransporteCP2();
  });

  readonly textoTelecomunicacionesCP1Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTelecomunicacionesCP1${prefijo}` : 'textoTelecomunicacionesCP1';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoTelecomunicacionesCP1();
  });

  readonly textoTelecomunicacionesCP2Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTelecomunicacionesCP2${prefijo}` : 'textoTelecomunicacionesCP2';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoTelecomunicacionesCP2();
  });

  readonly textoTelecomunicacionesCP3Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTelecomunicacionesCP3${prefijo}` : 'textoTelecomunicacionesCP3';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoTelecomunicacionesCP3();
  });

  readonly viewModel = computed(() => ({
    textoTransporteCP1: this.textoTransporteCP1Signal(),
    textoTransporteCP2: this.textoTransporteCP2Signal(),
    textoTelecomunicacionesCP1: this.textoTelecomunicacionesCP1Signal(),
    textoTelecomunicacionesCP2: this.textoTelecomunicacionesCP2Signal(),
    textoTelecomunicacionesCP3: this.textoTelecomunicacionesCP3Signal(),
    cuadroTituloTelecomunicaciones: this.cuadroTituloTelecomunicacionesSignal(),
    cuadroFuenteTelecomunicaciones: this.cuadroFuenteTelecomunicacionesSignal(),
    telecomunicaciones: this.telecomunicacionesSignal(),
    fotosTransporte: this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalTransporte(), this.imageFacade.getGroupPrefix(this.seccionId)),
    fotosTelecomunicaciones: this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalTelecomunicaciones(), this.imageFacade.getGroupPrefix(this.seccionId))
  }));

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);

    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.viewModel();
      this.actualizarFotografiasFormMulti();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    
    this.cargarFotografias();

    // ✅ Inicializar campos con prefijos
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
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  onFotografiasTransporteChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.photoPrefixSignalTransporte(), fotografias);
    this.fotografiasTransporteFormMulti = [...fotografias];
  }

  onFotografiasTelecomunicacionesChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.photoPrefixSignalTelecomunicaciones(), fotografias);
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
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTransporteCP1${prefijo}` : 'textoTransporteCP1';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const centroPoblado = data?.['centroPobladoAISI'] || 'Cahuacho';
    return `En el CP ${centroPoblado}, la infraestructura de transporte es limitada. Dentro de la localidad solo se encuentran trochas carrozables que permiten llegar al centro poblado. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro del distrito también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al centro poblado.`;
  }

  obtenerTextoTransporteCP2(): string {
    const data = this.formDataSignal();
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTransporteCP2${prefijo}` : 'textoTransporteCP2';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const ciudadOrigen = data?.['ciudadOrigenComercio'] || 'Caravelí';
    const distrito = data?.['distritoSeleccionado'] || 'Cahuacho';
    const costoMin = data?.['costoTransporteMinimo'] || '25';
    const costoMax = data?.['costoTransporteMaximo'] || '30';
    return `Por otro lado, no existen empresas de transporte formalmente establecidas dentro de la localidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${ciudadOrigen}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los poblado  res para desplazarse a ciudades más grandes.`;
  }

  obtenerTextoTelecomunicacionesCP1(): string {
    const data = this.formDataSignal();
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTelecomunicacionesCP1${prefijo}` : 'textoTelecomunicacionesCP1';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const centroPoblado = data?.['centroPobladoAISI'] || 'Cahuacho';
    return `En el CP ${centroPoblado}, la infraestructura en telecomunicaciones proporciona acceso a diversos servicios de comunicación que conectan a la población con el resto del país. Aunque existen algunas limitaciones, los servicios disponibles permiten que los habitantes se mantengan informados y comunicados.`;
  }

  obtenerTextoTelecomunicacionesCP2(): string {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTelecomunicacionesCP2${prefijo}` : 'textoTelecomunicacionesCP2';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return `En cuanto a radiodifusión, se puede captar señal de emisoras nacionales como RPP, Nacional y Unión, las cuales sirven como importantes fuentes de información y entretenimiento para la población local. Estas emisoras proporcionan noticias, música y programas de interés general que son valorados por los habitantes del centro poblado.`;
  }

  obtenerTextoTelecomunicacionesCP3(): string {
    const data = this.formDataSignal();
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoTelecomunicacionesCP3${prefijo}` : 'textoTelecomunicacionesCP3';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const centroPoblado = data?.['centroPobladoAISI'] || 'Cahuacho';
    return `Respecto a la señal de televisión, el centro poblado cuenta con acceso a América TV a través de señal abierta. Adicionalmente, algunas familias en ${centroPoblado} optan por servicios de televisión satelital como DIRECTV, lo que les permite acceder a una mayor variedad de canales y contenido.\n\nEn lo que respecta a la telefonía móvil e internet, la cobertura es proporcionada por las operadoras Movistar, Claro y Entel, lo que facilita la comunicación dentro del área y con el exterior. Para el acceso a internet, la población principalmente se conecta a través de los datos móviles proporcionados por Movistar y Entel, lo que les permite mantenerse conectados para actividades cotidianas y laborales.`;
  }
}
