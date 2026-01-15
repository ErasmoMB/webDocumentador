import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion11',
  templateUrl: './seccion11.component.html',
  styleUrls: ['./seccion11.component.css']
})
export class Seccion11Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'provinciaSeleccionada', 'parrafoSeccion11_transporte_completo', 'parrafoSeccion11_telecomunicaciones_completo', 'costoTransporteMinimo', 'costoTransporteMaximo', 'telecomunicacionesTabla'];
  
  readonly PHOTO_PREFIX_TRANSPORTE = 'fotografiaTransporte';
  readonly PHOTO_PREFIX_TELECOMUNICACIONES = 'fotografiaTelecomunicaciones';
  
  fotografiasTransporteFormMulti: FotoItem[] = [];
  fotografiasTelecomunicacionesFormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';

  telecomunicacionesConfig: TableConfig = {
    tablaKey: 'telecomunicacionesTabla',
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
    private tableService: TableManagementService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  protected override tieneFotografias(): boolean {
    return false;
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
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

  override actualizarFotografiasFormMulti() {
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

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  onFotografiasTransporteChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_TRANSPORTE}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_TRANSPORTE}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_TRANSPORTE}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  onFotografiasTelecomunicacionesChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_TELECOMUNICACIONES}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_TELECOMUNICACIONES}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_TELECOMUNICACIONES}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  obtenerTextoSeccion11TransporteCompleto(): string {
    if (this.datos.parrafoSeccion11_transporte_completo) {
      return this.datos.parrafoSeccion11_transporte_completo;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const provincia = this.datos.provinciaSeleccionada || 'Caravelí';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const costoMin = this.datos.costoTransporteMinimo || '25';
    const costoMax = this.datos.costoTransporteMaximo || '30';
    
    return `En la CC ${grupoAISD}, la infraestructura de transporte es limitada. Dentro de la comunidad solo se encuentran trochas carrozables que permiten llegar al anexo ${grupoAISD}. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro de la comunidad también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al anexo o centro administrativo comunal.\n\nPor otro lado, no existen empresas de transporte formalmente establecidas dentro de la comunidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${provincia}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los comuneros para desplazarse a ciudades más grandes.`;
  }

  obtenerTextoSeccion11TelecomunicacionesCompleto(): string {
    if (this.datos.parrafoSeccion11_telecomunicaciones_completo) {
      return this.datos.parrafoSeccion11_telecomunicaciones_completo;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    
    return `En la CC ${grupoAISD}, la infraestructura en telecomunicaciones presenta algunas limitaciones, aunque existen servicios disponibles para la población. En cuanto a radiodifusión, no es posible captar señal de emisoras provinciales o nacionales. Respecto a la señal de televisión, la comunidad cuenta con acceso a América TV (canal 4) a través de señal abierta, gracias a una antena de la municipalidad que retransmite este canal, lo que garantiza una opción de entretenimiento y noticias. Adicionalmente, algunas familias tienen contratado el servicio de DIRECTV, el cual brinda acceso a televisión satelital.\n\nEn lo que respecta a la telefonía móvil, la cobertura es restringida y solo las operadoras de Movistar y Entel logran captar señal en la comunidad, lo cual limita las opciones de comunicación para los habitantes. Por otro lado, el acceso a internet depende únicamente de Movistar, ya que los comuneros solo pueden conectarse a través de los datos móviles proporcionados por esta empresa. Además, cabe mencionar que, si bien existe acceso a internet, la calidad y estabilidad de la conexión pueden ser deficientes, especialmente en las zonas más alejadas dentro de la comunidad.`;
  }

}

