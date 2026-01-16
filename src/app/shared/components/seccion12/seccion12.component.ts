import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion12',
  templateUrl: './seccion12.component.html',
  styleUrls: ['./seccion12.component.css']
})
export class Seccion12Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'provinciaSeleccionada', 'parrafoSeccion12_salud_completo', 'parrafoSeccion12_educacion_completo', 'caracteristicasSaludTabla', 'cantidadEstudiantesEducacionTabla', 'ieAyrocaTabla', 'ie40270Tabla', 'alumnosIEAyrocaTabla', 'alumnosIE40270Tabla', 'textoInfraestructuraEducacionPost', 'textoAlumnosPorSexoGrado', 'textoInfraestructuraRecreacion', 'textoInfraestructuraRecreacionDetalle', 'textoInfraestructuraDeporte', 'textoInfraestructuraDeportDetalle'];
  
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
  private stateSubscription?: Subscription;

  caracteristicasSaludConfig: TableConfig = {
    tablaKey: 'caracteristicasSaludTabla',
    totalKey: 'categoria',
    campoTotal: 'categoria',
    campoPorcentaje: 'descripcion',
    estructuraInicial: [{ categoria: '', descripcion: '' }]
  };

  cantidadEstudiantesEducacionConfig: TableConfig = {
    tablaKey: 'cantidadEstudiantesEducacionTabla',
    totalKey: 'institucion',
    campoTotal: 'total',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ institucion: '', nivel: '', gestion: '', total: 0, porcentaje: '0%' }]
  };

  ieAyrocaConfig: TableConfig = {
    tablaKey: 'ieAyrocaTabla',
    totalKey: 'categoria',
    campoTotal: 'categoria',
    campoPorcentaje: 'descripcion',
    estructuraInicial: [{ categoria: '', descripcion: '' }]
  };

  ie40270Config: TableConfig = {
    tablaKey: 'ie40270Tabla',
    totalKey: 'categoria',
    campoTotal: 'categoria',
    campoPorcentaje: 'descripcion',
    estructuraInicial: [{ categoria: '', descripcion: '' }]
  };

  alumnosIEAyrocaConfig: TableConfig = {
    tablaKey: 'alumnosIEAyrocaTabla',
    totalKey: 'nombre',
    campoTotal: 'totalH',
    campoPorcentaje: 'totalM',
    estructuraInicial: [{ nombre: '', nivel: '', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 }]
  };

  alumnosIE40270Config: TableConfig = {
    tablaKey: 'alumnosIE40270Tabla',
    totalKey: 'nombre',
    campoTotal: 'totalH',
    campoPorcentaje: 'totalM',
    estructuraInicial: [{ nombre: '', nivel: '', totalH: 0, totalM: 0, p1H: 0, p1M: 0, p2H: 0, p2M: 0, p3H: 0, p3M: 0, p4H: 0, p4M: 0, p5H: 0, p5M: 0, p6H: 0, p6M: 0 }]
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService,
    private stateService: StateService
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

  getCantidadEstudiantesSinTotal(): any[] {
    if (!this.datos?.cantidadEstudiantesEducacionTabla || !Array.isArray(this.datos.cantidadEstudiantesEducacionTabla)) {
      return [];
    }
    return this.datos.cantidadEstudiantesEducacionTabla.filter((item: any) => {
      const institucion = item.institucion?.toString().toLowerCase() || '';
      return !institucion.includes('total');
    });
  }

  getTotalCantidadEstudiantes(): string {
    if (!this.datos?.cantidadEstudiantesEducacionTabla || !Array.isArray(this.datos.cantidadEstudiantesEducacionTabla)) {
      return '0';
    }
    const datosSinTotal = this.datos.cantidadEstudiantesEducacionTabla.filter((item: any) => {
      const institucion = item.institucion?.toString().toLowerCase() || '';
      return !institucion.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const total = typeof item.total === 'number' ? item.total : parseInt(item.total) || 0;
      return sum + total;
    }, 0);
    return total.toString();
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
    this.eliminarFilasTotal();
    this.actualizarFotografiasFormMulti();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private eliminarFilasTotal(): void {
    const datos = this.formularioService.obtenerDatos();
    
    if (datos['cantidadEstudiantesEducacionTabla'] && Array.isArray(datos['cantidadEstudiantesEducacionTabla'])) {
      const longitudOriginal = datos['cantidadEstudiantesEducacionTabla'].length;
      const datosFiltrados = datos['cantidadEstudiantesEducacionTabla'].filter((item: any) => {
        const institucion = item.institucion?.toString().toLowerCase() || '';
        return !institucion.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        datos['cantidadEstudiantesEducacionTabla'] = datosFiltrados;
        this.formularioService.actualizarDato('cantidadEstudiantesEducacionTabla', datos['cantidadEstudiantesEducacionTabla']);
      }
    }
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
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

  onFotografiasChange(prefix: string, fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      prefix,
      fotografias,
      groupPrefix
    );
    this.actualizarFotografiasFormMulti();
    this.cdRef.detectChanges();
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

  obtenerTextoInfraestructuraEducacionPost(): string {
    if (this.datos.textoInfraestructuraEducacionPost && this.datos.textoInfraestructuraEducacionPost !== '____') {
      return this.datos.textoInfraestructuraEducacionPost;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    
    return `De las entrevistas aplicadas durante el trabajo de campo, se recopiló información de carácter cualitativo de las instituciones educativas de la CC ${grupoAISD}. En los cuadros que se presentan a continuación se detallan características de cada una de ellas para el año 2024.`;
  }

  obtenerTextoAlumnosPorSexoGrado(): string {
    if (this.datos.textoAlumnosPorSexoGrado && this.datos.textoAlumnosPorSexoGrado !== '____') {
      return this.datos.textoAlumnosPorSexoGrado;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    
    return `De manera adicional, se presenta la cantidad de alumnos de las dos instituciones educativas dentro de la CC ${grupoAISD} según sexo y grado de enseñanza para el año 2024 según las entrevistas aplicadas. Dicha información se encuentra en los cuadros que se muestran a continuación.`;
  }

  obtenerTextoInfraestructuraRecreacion(): string {
    if (this.datos.textoInfraestructuraRecreacion && this.datos.textoInfraestructuraRecreacion !== '____') {
      return this.datos.textoInfraestructuraRecreacion;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    
    return `Dentro de la CC ${grupoAISD} se cuenta con un espacio destinado a la recreación de la población. Este es el parque recreacional público, el cual se ubica entre el puesto de salud y el local comunal. Aquí la población puede reunirse y también cuenta con juegos recreativos destinados a los niños. La siguiente infraestructura es la plaza de toros, que se halla en la zona este del anexo, y es un punto de gran relevancia cultural; en especial, durante las festividades patronales.`;
  }

  obtenerTextoInfraestructuraRecreacionDetalle(): string {
    if (this.datos.textoInfraestructuraRecreacionDetalle && this.datos.textoInfraestructuraRecreacionDetalle !== '____') {
      return this.datos.textoInfraestructuraRecreacionDetalle;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
    
    return `En adición a ello, otro espacio de reunión es la plaza central del anexo ${grupoAISD}. Este lugar sirve ocasionalmente como punto de encuentro para los comuneros, quienes se reúnen allí de manera informal en momentos importantes o festivos.`;
  }

  obtenerTextoInfraestructuraDeporte(): string {
    if (this.datos.textoInfraestructuraDeporte && this.datos.textoInfraestructuraDeporte !== '____') {
      return this.datos.textoInfraestructuraDeporte;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    
    return `En la CC ${grupoAISD}, la infraestructura deportiva es limitada. Los únicos espacios dedicados al deporte son una losa deportiva y un "estadio". Estas infraestructuras son utilizadas principalmente para partidos de fútbol y otros encuentros deportivos informales que se organizan entre los comuneros, especialmente durante festividades locales.`;
  }

  obtenerTextoInfraestructuraDeportDetalle(): string {
    if (this.datos.textoInfraestructuraDeportDetalle && this.datos.textoInfraestructuraDeportDetalle !== '____') {
      return this.datos.textoInfraestructuraDeportDetalle;
    }
    
    return `Respecto a la losa deportiva, esta se encuentra hecha a base de cemento. Por otra parte, el "estadio" es un campo de juego de pasto natural de un tamaño más extenso que la losa. No obstante, no cuenta con infraestructura adicional como gradas o servicios higiénicos.`;
  }
}

