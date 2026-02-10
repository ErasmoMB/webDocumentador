import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, Input, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PrefijoHelper } from '../../utils/prefijo-helper';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent, ImageUploadComponent],
  selector: 'app-seccion27-view',
  templateUrl: './seccion27-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion27ViewComponent extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.6';

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  readonly PHOTO_PREFIX_TRANSPORTE = 'fotografiaTransporteAISI';
  readonly PHOTO_PREFIX_TELECOMUNICACIONES = 'fotografiaTelecomunicacionesAISI';

  // cache for main photos displayed in the view
  fotografiasInstitucionalidadCache: FotoItem[] = [];

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, autoLoader, injector);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

    // Effect para aplicar prefijo a centroPobladoAISI (leer del store, no de this.datos)
    effect(() => {
      const data = this.projectFacade.selectSectionFields(this.seccionId, null)();
      const centroPrefijado = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId);
      if (centroPrefijado) {
        this.datos.centroPobladoAISI = centroPrefijado;
      }
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
    this.cargarFotografias();
  }

  getFotoTransporte(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaTransporteAISITitulo'] || 'Infraestructura de transporte en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaTransporteAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaTransporteAISIImagen'] || '';
    return { numero: '3. 31', titulo, fuente, ruta: imagen };
  }

  getFotoTelecomunicaciones(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaTelecomunicacionesAISITitulo'] || 'Infraestructura de telecomunicaciones en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaTelecomunicacionesAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaTelecomunicacionesAISIImagen'] || '';
    return { numero: '3. 32', titulo, fuente, ruta: imagen };
  }

  protected override actualizarFotografiasCache(): void {
    // Use base helper with main photo prefix
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista(this.PHOTO_PREFIX);
  }

  getFotografiasTransporteVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_TRANSPORTE, groupPrefix);
  }

  getFotografiasTelecomunicacionesVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_TELECOMUNICACIONES, groupPrefix);
  }

  getTablaKeyTelecomunicaciones(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `telecomunicacionesCpTabla${prefijo}` : 'telecomunicacionesCpTabla';
  }

  get telecomunicacionesCpTablaVista(): any[] {
    const tablaKey = this.getTablaKeyTelecomunicaciones();
    return this.datos[tablaKey] || this.datos.telecomunicacionesCpTabla || [];
  }

  obtenerTextoTransporteCP1(): string {
    if (this.datos.textoTransporteCP1 && this.datos.textoTransporteCP1 !== '____') return this.datos.textoTransporteCP1;
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    return `En el CP ${centroPoblado}, la infraestructura de transporte es limitada. Dentro de la localidad solo se encuentran trochas carrozables que permiten llegar al centro poblado. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro del distrito también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al centro poblado.`;
  }

  obtenerTextoTransporteCP2(): string {
    if (this.datos.textoTransporteCP2 && this.datos.textoTransporteCP2 !== '____') return this.datos.textoTransporteCP2;
    const ciudadOrigen = this.datos.ciudadOrigenComercio || 'Caravelí';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const costoMin = this.datos.costoTransporteMinimo || '25';
    const costoMax = this.datos.costoTransporteMaximo || '30';
    return `Por otro lado, no existen empresas de transporte formalmente establecidas dentro de la localidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${ciudadOrigen}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los pobladores para desplazarse a ciudades más grandes.`;
  }

  obtenerTextoTelecomunicacionesCP1(): string {
    if (this.datos.textoTelecomunicacionesCP1 && this.datos.textoTelecomunicacionesCP1 !== '____') return this.datos.textoTelecomunicacionesCP1;
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    return `En el CP ${centroPoblado}, la infraestructura en telecomunicaciones proporciona acceso a diversos servicios de comunicación que conectan a la población con el resto del país. Aunque existen algunas limitaciones, los servicios disponibles permiten que los habitantes se mantengan informados y comunicados.`;
  }

  obtenerTextoTelecomunicacionesCP2(): string {
    if (this.datos.textoTelecomunicacionesCP2 && this.datos.textoTelecomunicacionesCP2 !== '____') return this.datos.textoTelecomunicacionesCP2;
    return `En cuanto a radiodifusión, se puede captar señal de emisoras nacionales como RPP, Nacional y Unión, las cuales sirven como importantes fuentes de información y entretenimiento para la población local. Estas emisoras proporcionan noticias, música y programas de interés general que son valorados por los habitantes del centro poblado.`;
  }

  obtenerTextoTelecomunicacionesCP3(): string {
    if (this.datos.textoTelecomunicacionesCP3 && this.datos.textoTelecomunicacionesCP3 !== '____') return this.datos.textoTelecomunicacionesCP3;
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    return `Respecto a la señal de televisión, el centro poblado cuenta con acceso a América TV a través de señal abierta. Adicionalmente, algunas familias en ${centroPoblado} optan por servicios de televisión satelital como DIRECTV, lo que les permite acceder a una mayor variedad de canales y contenido.\n\nEn lo que respecta a la telefonía móvil e internet, la cobertura es proporcionada por las operadoras Movistar, Claro y Entel, lo que facilita la comunicación dentro del área y con el exterior. Para el acceso a internet, la población principalmente se conecta a través de los datos móviles proporcionados por Movistar y Entel, lo que les permite mantenerse conectados para actividades cotidianas y laborales.`;
  }

  // Implement abstract methods required by AutoLoadSectionComponent
  protected getSectionKey(): string { return 'seccion27_aisi'; }
  protected getLoadParameters(): string[] | null { return this.groupConfig.getAISICCPPActivos(); }
  protected detectarCambios(): boolean { return false; }
  protected actualizarValoresConPrefijo(): void { }
}