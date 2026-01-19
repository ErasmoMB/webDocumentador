import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';

@Component({
  selector: 'app-seccion27',
  templateUrl: './seccion27.component.html',
  styleUrls: ['./seccion27.component.css']
})
export class Seccion27Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.6';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'telecomunicacionesCpTabla', 'costoTransporteMinimo', 'costoTransporteMaximo', 'textoTransporteCP1', 'textoTransporteCP2', 'textoTelecomunicacionesCP1', 'textoTelecomunicacionesCP2', 'textoTelecomunicacionesCP3'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB16';
  
  readonly PHOTO_PREFIX_TRANSPORTE = 'fotografiaTransporteAISI';
  readonly PHOTO_PREFIX_TELECOMUNICACIONES = 'fotografiaTelecomunicacionesAISI';
  
  fotografiasInstitucionalidadCache: any[] = [];
  fotografiasTransporteFormMulti: FotoItem[] = [];
  fotografiasTelecomunicacionesFormMulti: FotoItem[] = [];

  telecomunicacionesConfig: TableConfig = {
    tablaKey: 'telecomunicacionesCpTabla',
    totalKey: 'medio',
    campoTotal: 'medio',
    campoPorcentaje: 'descripcion',
    estructuraInicial: [{ medio: '', descripcion: '' }]
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService,
    private stateService: StateService,
    private sanitizer: DomSanitizer,
    autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef, autoLoader);
  }  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
    if (this.modoFormulario) {
      if (this.seccionId) {
        setTimeout(() => {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }, 0);
      }
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        if (this.seccionId) {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }
      });
    } else {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected getSectionKey(): string {
    return 'seccion27_aisi';
  }

  protected getLoadParameters(): string[] | null {
    return this.groupConfig.getAISICCPPActivos();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const centroPobladoAISIActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'centroPobladoAISI', this.seccionId);
    const centroPobladoAISIAnterior = this.datosAnteriores.centroPobladoAISI || null;
    const centroPobladoAISIEnDatos = this.datos.centroPobladoAISI || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (centroPobladoAISIActual !== centroPobladoAISIAnterior || centroPobladoAISIActual !== centroPobladoAISIEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
    this.actualizarFotografiasCache();
  }

  protected override actualizarValoresConPrefijo(): void {
    const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centroPobladoAISI || null;
    this.datosAnteriores.centroPobladoAISI = centroPobladoAISI || null;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getTablaKeyTelecomunicaciones(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `telecomunicacionesCpTabla${prefijo}` : 'telecomunicacionesCpTabla';
  }

  protected override tieneFotografias(): boolean {
    return true;
  }

  getFotoTransporte(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaTransporteAISITitulo'] || 'Infraestructura de transporte en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaTransporteAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaTransporteAISIImagen'] || '';
    
    return {
      numero: '3. 31',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoTransporteParaImageUpload(): FotoItem[] {
    const foto = this.getFotoTransporte();
    if (!foto.ruta) {
      return [];
    }
    return [{
      titulo: foto.titulo,
      fuente: foto.fuente,
      imagen: foto.ruta
    }];
  }

  getFotoTelecomunicaciones(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaTelecomunicacionesAISITitulo'] || 'Infraestructura de telecomunicaciones en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaTelecomunicacionesAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaTelecomunicacionesAISIImagen'] || '';
    
    return {
      numero: '3. 32',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoTelecomunicacionesParaImageUpload(): FotoItem[] {
    const foto = this.getFotoTelecomunicaciones();
    if (!foto.ruta) {
      return [];
    }
    return [{
      titulo: foto.titulo,
      fuente: foto.fuente,
      imagen: foto.ruta
    }];
  }

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasTransporteFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
  }

  override getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  getFotografiasTransporteVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
  }

  getFotografiasTelecomunicacionesVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasTransporteFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
  }

  onFotografiasTransporteChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_TRANSPORTE, fotografias);
    this.fotografiasTransporteFormMulti = [...fotografias];
  }

  onFotografiasTelecomunicacionesChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_TELECOMUNICACIONES, fotografias);
    this.fotografiasTelecomunicacionesFormMulti = [...fotografias];
  }

  obtenerTextoTransporteCP1(): string {
    if (this.datos.textoTransporteCP1 && this.datos.textoTransporteCP1 !== '____') {
      return this.datos.textoTransporteCP1;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `En el CP ${centroPoblado}, la infraestructura de transporte es limitada. Dentro de la localidad solo se encuentran trochas carrozables que permiten llegar al centro poblado. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro del distrito también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al centro poblado.`;
  }

  obtenerTextoTransporteCP2(): string {
    if (this.datos.textoTransporteCP2 && this.datos.textoTransporteCP2 !== '____') {
      return this.datos.textoTransporteCP2;
    }
    
    const ciudadOrigen = this.datos.ciudadOrigenComercio || 'Caravelí';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const costoMin = this.datos.costoTransporteMinimo || '25';
    const costoMax = this.datos.costoTransporteMaximo || '30';
    
    return `Por otro lado, no existen empresas de transporte formalmente establecidas dentro de la localidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${ciudadOrigen}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los pobladores para desplazarse a ciudades más grandes.`;
  }

  obtenerTextoTelecomunicacionesCP1(): string {
    if (this.datos.textoTelecomunicacionesCP1 && this.datos.textoTelecomunicacionesCP1 !== '____') {
      return this.datos.textoTelecomunicacionesCP1;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `En el CP ${centroPoblado}, la infraestructura en telecomunicaciones proporciona acceso a diversos servicios de comunicación que conectan a la población con el resto del país. Aunque existen algunas limitaciones, los servicios disponibles permiten que los habitantes se mantengan informados y comunicados.`;
  }

  obtenerTextoTelecomunicacionesCP2(): string {
    if (this.datos.textoTelecomunicacionesCP2 && this.datos.textoTelecomunicacionesCP2 !== '____') {
      return this.datos.textoTelecomunicacionesCP2;
    }
    
    return `En cuanto a radiodifusión, se puede captar señal de emisoras nacionales como RPP, Nacional y Unión, las cuales sirven como importantes fuentes de información y entretenimiento para la población local. Estas emisoras proporcionan noticias, música y programas de interés general que son valorados por los habitantes del centro poblado.`;
  }

  obtenerTextoTelecomunicacionesCP3(): string {
    if (this.datos.textoTelecomunicacionesCP3 && this.datos.textoTelecomunicacionesCP3 !== '____') {
      return this.datos.textoTelecomunicacionesCP3;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `Respecto a la señal de televisión, el centro poblado cuenta con acceso a América TV a través de señal abierta. Adicionalmente, algunas familias en ${centroPoblado} optan por servicios de televisión satelital como DIRECTV, lo que les permite acceder a una mayor variedad de canales y contenido.\n\nEn lo que respecta a la telefonía móvil e internet, la cobertura es proporcionada por las operadoras Movistar, Claro y Entel, lo que facilita la comunicación dentro del área y con el exterior. Para el acceso a internet, la población principalmente se conecta a través de los datos móviles proporcionados por Movistar y Entel, lo que les permite mantenerse conectados para actividades cotidianas y laborales.`;
  }
}

