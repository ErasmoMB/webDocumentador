import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion12',
  templateUrl: './seccion12.component.html',
  styleUrls: ['./seccion12.component.css']
})
export class Seccion12Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'provinciaSeleccionada', 'parrafoSeccion12_salud_completo', 'parrafoSeccion12_educacion_completo', 'caracteristicasSaludTabla', 'cantidadEstudiantesEducacionTabla', 'ieAyrocaTabla', 'ie40270Tabla', 'alumnosIEAyrocaTabla', 'alumnosIE40270Tabla'];
  
  readonly PHOTO_PREFIX_SALUD = 'fotografiaSalud';
  readonly PHOTO_PREFIX_IE_AYROCA = 'fotografiaIEAyroca';
  readonly PHOTO_PREFIX_IE_40270 = 'fotografiaIE40270';
  readonly PHOTO_PREFIX_RECREACION = 'fotografiaRecreacion';
  readonly PHOTO_PREFIX_DEPORTE = 'fotografiaDeporte';
  
  fotografiasSaludFormMulti: FotoItem[] = [];
  fotografiasIEAyrocaFormMulti: FotoItem[] = [];
  fotografiasIE40270FormMulti: FotoItem[] = [];
  fotografiasRecreacionFormMulti: FotoItem[] = [];
  fotografiasDeporteFormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef
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

  getFotografiasSaludVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_SALUD,
      groupPrefix
    );
  }

  getFotografiasIEAyrocaVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_IE_AYROCA,
      groupPrefix
    );
  }

  getFotografiasIE40270Vista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_IE_40270,
      groupPrefix
    );
  }

  getFotografiasRecreacionVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RECREACION,
      groupPrefix
    );
  }

  getFotografiasDeporteVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DEPORTE,
      groupPrefix
    );
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasSaludFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_SALUD, groupPrefix);
    this.fotografiasIEAyrocaFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_IE_AYROCA, groupPrefix);
    this.fotografiasIE40270FormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_IE_40270, groupPrefix);
    this.fotografiasRecreacionFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_RECREACION, groupPrefix);
    this.fotografiasDeporteFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_DEPORTE, groupPrefix);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  onFotografiasChange(prefix: string, fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${prefix}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${prefix}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${prefix}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  obtenerTextoSeccion12SaludCompleto(): string {
    if (this.datos.parrafoSeccion12_salud_completo) {
      return this.datos.parrafoSeccion12_salud_completo;
    }
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const provincia = this.datos.provinciaSeleccionada || 'Caravelí';
    return `Dentro de la CC ${grupoAISD} se encuentra un puesto de salud, que está bajo la gestión directa del MINSA. Este establecimiento es de categoría I – 2 y brinda atención primaria a los habitantes de la comunidad. En la actualidad, se viene ofreciendo tres servicios con carácter permanente: medicina, obstetricia y enfermería; aunque también se coordina en conjunto con la MICRORED la realización de campañas de salud como psicología y salud bucal. No obstante, ante casos de mayor complejidad, la población es derivada a establecimientos de mayor categoría, principalmente ubicados en la ciudad de ${provincia}.`;
  }

  obtenerTextoSeccion12EducacionCompleto(): string {
    if (this.datos.parrafoSeccion12_educacion_completo) {
      return this.datos.parrafoSeccion12_educacion_completo;
    }
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    return `Dentro de la CC ${grupoAISD} se hallan instituciones educativas de los dos primeros niveles de educación básica regular (inicial y primaria). Todas ellas se encuentran concentradas en el anexo ${grupoAISD}, el centro administrativo comunal. En base al Censo Educativo 2023, la institución con mayor cantidad de estudiantes dentro de la comunidad es la IE N°40270, la cual es de nivel primaria, con un total de 21 estudiantes. A continuación, se presenta el cuadro con la cantidad de estudiantes por institución educativa y nivel dentro de la localidad en cuestión.`;
  }
}

