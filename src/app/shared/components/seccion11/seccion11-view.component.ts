import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableWrapperComponent } from '../table-wrapper/table-wrapper.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  selector: 'app-seccion11-view',
  templateUrl: './seccion11-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    ImageUploadComponent,
    TableWrapperComponent
  ],
  standalone: true
})
export class Seccion11ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.7';

  readonly PHOTO_PREFIX_TRANSPORTE = 'fotografiaTransporte';
  readonly PHOTO_PREFIX_TELECOMUNICACIONES = 'fotografiaTelecomunicaciones';
  override useReactiveSync: boolean = true;

  fotografiasTransporteCache: FotoItem[] = [];
  fotografiasTelecomunicacionesCache: FotoItem[] = [];

  private readonly regexCache = new Map<string, RegExp>();

  // ✅ SIGNALS PUROS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloTransporte = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TRANSPORTE}${i}Titulo`)();
      const fuenteTransporte = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TRANSPORTE}${i}Fuente`)();
      const imagenTransporte = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TRANSPORTE}${i}Imagen`)();
      
      const tituloTele = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TELECOMUNICACIONES}${i}Titulo`)();
      const fuenteTele = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TELECOMUNICACIONES}${i}Fuente`)();
      const imagenTele = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TELECOMUNICACIONES}${i}Imagen`)();
      
      hash += `${tituloTransporte || ''}|${fuenteTransporte || ''}|${imagenTransporte ? '1' : '0'}|`;
      hash += `${tituloTele || ''}|${fuenteTele || ''}|${imagenTele ? '1' : '0'}|`;
    }
    return hash;
  });

  readonly grupoAISDSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')() || '';
  });

  readonly provinciaSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'provinciaSeleccionada')() || '____';
  });

  readonly distritoSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || '____';
  });

  readonly costoMinSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'costoTransporteMinimo')() || '____';
  });

  readonly costoMaxSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'costoTransporteMaximo')() || '____';
  });

  readonly telecomunicacionesTablaSignal: Signal<any[]> = computed(() => {
    const tablaKey = this.getTablaKeyTelecomunicaciones();
    const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
    return Array.isArray(tabla) ? tabla : [];
  });

  readonly textoTransporteSignal: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoSeccion11TransporteCompleto();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoTelecomunicacionesSignal: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoSeccion11TelecomunicacionesCompleto();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Sincronizar cambios reactivos (sin subscriptions manuales)
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };  // ✅ CRÍTICO: Sincronizar this.datos con formDataSignal
      this.grupoAISDSignal();
      this.provinciaSignal();
      this.distritoSignal();
      this.costoMinSignal();
      this.costoMaxSignal();
      this.telecomunicacionesTablaSignal();
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitoreo de cambios en fotografías para recarga automática
    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.fotografiasTransporteCache = [...this.fotografiasTransporteCache];
      this.fotografiasTelecomunicacionesCache = [...this.fotografiasTelecomunicacionesCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.logGrupoActual();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  obtenerTextoSeccion11TransporteCompleto(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion11_transporte_completo')();
    if (manual && manual.trim().length > 0) {
      return manual;
    }

    const grupoAISD = this.grupoAISDSignal();
    const provincia = this.provinciaSignal();
    const distrito = this.distritoSignal();
    const costoMin = this.costoMinSignal();
    const costoMax = this.costoMaxSignal();

    return `En la CC ${grupoAISD}, la infraestructura de transporte es limitada. Dentro de la comunidad solo se encuentran trochas carrozables que permiten llegar al anexo ${grupoAISD}. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro de la comunidad también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al anexo o centro administrativo comunal.\n\nPor otro lado, no existen empresas de transporte formalmente establecidas dentro de la comunidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${provincia}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los comuneros para desplazarse a ciudades más grandes.`;
  }

  obtenerTextoSeccion11TelecomunicacionesCompleto(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion11_telecomunicaciones_completo')();
    if (manual && manual.trim().length > 0) {
      return manual;
    }

    const grupoAISD = this.grupoAISDSignal();

    return `En la CC ${grupoAISD}, la infraestructura en telecomunicaciones presenta algunas limitaciones, aunque existen servicios disponibles para la población. En cuanto a radiodifusión, no es posible captar señal de emisoras provinciales o nacionales. Respecto a la señal de televisión, la comunidad cuenta con acceso a América TV (canal 4) a través de señal abierta, gracias a una antena de la municipalidad que retransmite este canal, lo que garantiza una opción de entretenimiento y noticias. Adicionalmente, algunas familias tienen contratado el servicio de DIRECTV, el cual brinda acceso a televisión satelital.\n\nEn lo que respecta a la telefonía móvil, la cobertura es restringida y solo las operadoras de Movistar y Entel logran captar señal en la comunidad, lo cual limita las opciones de comunicación para los habitantes. Por otro lado, el acceso a internet depende únicamente de Movistar, ya que los comuneros solo pueden conectarse a través de los datos móviles proporcionados por esta empresa. Además, cabe mencionar que, si bien existe acceso a internet, la calidad y estabilidad de la conexión pueden ser deficientes, especialmente en las zonas más alejadas dentro de la comunidad.`;
  }

  getFotografiasTransporteVista(): FotoItem[] {
    if (this.fotografiasTransporteCache && this.fotografiasTransporteCache.length > 0) {
      return [...this.fotografiasTransporteCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTransporteCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasTransporteCache;
  }

  getFotografiasTelecomunicacionesVista(): FotoItem[] {
    if (this.fotografiasTelecomunicacionesCache && this.fotografiasTelecomunicacionesCache.length > 0) {
      return [...this.fotografiasTelecomunicacionesCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasTelecomunicacionesCache;
  }

  getTelecomunicacionesTabla(): any[] {
    return this.telecomunicacionesTablaSignal();
  }

  getTablaKeyTelecomunicaciones(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `telecomunicacionesTabla${prefijo}` : 'telecomunicacionesTabla';
  }

  override obtenerPrefijoGrupo(): string {
    const PrefijoHelper = require('src/app/shared/utils/prefijo-helper').PrefijoHelper;
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);

    const fotosTransporte = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTransporteCache = fotosTransporte && fotosTransporte.length > 0 ? [...fotosTransporte] : [];

    const fotosTelecomunicaciones = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesCache = fotosTelecomunicaciones && fotosTelecomunicaciones.length > 0 ? [...fotosTelecomunicaciones] : [];

    this.cdRef.markForCheck();
  }

  protected override logGrupoActual(): void {
    const grupoAISD = this.grupoAISDSignal();
    console.log(`[Seccion11-View] Grupo AISD actual: ${grupoAISD}`);
  }

  // ✅ MÉTODOS PARA TÍTULO Y FUENTE DE LA TABLA
  obtenerTituloTelecomunicaciones(): string {
    const tituloKey = 'tituloTelecomunicaciones';
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Servicios de telecomunicaciones – CC ${comunidad}`;
  }

  obtenerFuenteTelecomunicaciones(): string {
    const fuenteKey = 'fuenteTelecomunicaciones';
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return 'GEADES (2024)';
  }

  override obtenerNombreComunidadActual(): string {
    return this.grupoAISDSignal() || '____';
  }

}