import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion28',
  templateUrl: './seccion28.component.html',
  styleUrls: ['./seccion28.component.css']
})
export class Seccion28Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.7';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'puestoSaludCpTabla', 'educacionCpTabla', 'nombreIEMayorEstudiantes', 'cantidadEstudiantesIEMayor', 'textoSaludCP', 'textoEducacionCP', 'textoRecreacionCP1', 'textoRecreacionCP2', 'textoRecreacionCP3', 'textoDeporteCP1', 'textoDeporteCP2'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB17';
  
  readonly PHOTO_PREFIX_SALUD = 'fotografiaSaludAISI';
  readonly PHOTO_PREFIX_EDUCACION = 'fotografiaEducacionAISI';
  readonly PHOTO_PREFIX_RECREACION = 'fotografiaRecreacionAISI';
  readonly PHOTO_PREFIX_DEPORTE = 'fotografiaDeporteAISI';
  
  fotografiasInstitucionalidadCache: any[] = [];
  fotografiasSaludFormMulti: FotoItem[] = [];
  fotografiasEducacionFormMulti: FotoItem[] = [];
  fotografiasRecreacionFormMulti: FotoItem[] = [];
  fotografiasDeporteFormMulti: FotoItem[] = [];

  puestoSaludConfig: TableConfig = {
    tablaKey: 'puestoSaludCpTabla',
    totalKey: 'categoria',
    campoTotal: 'categoria',
    campoPorcentaje: 'descripcion',
    estructuraInicial: [{ categoria: '', descripcion: '' }]
  };

  educacionConfig: TableConfig = {
    tablaKey: 'educacionCpTabla',
    totalKey: 'nombreIE',
    campoTotal: 'cantidadEstudiantes',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ nombreIE: '', nivel: '', tipoGestion: '', cantidadEstudiantes: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['cantidadEstudiantes']
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

  protected override onInitCustom(): void {
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

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
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

  protected override tieneFotografias(): boolean {
    return true;
  }

  getFotoSalud(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaSaludAISITitulo'] || 'Infraestructura del Puesto de Salud ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaSaludAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaSaludAISIImagen'] || '';
    
    return {
      numero: '3. 34',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoSaludParaImageUpload(): FotoItem[] {
    const foto = this.getFotoSalud();
    if (!foto.ruta) {
      return [];
    }
    return [{
      titulo: foto.titulo,
      fuente: foto.fuente,
      imagen: foto.ruta
    }];
  }

  getFotografiasEducacion(): any[] {
    const fotos: any[] = [];
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    
    const foto1 = {
      numero: '3. 35',
      titulo: this.datos?.['fotografiaEducacion1AISITitulo'] || 'Infraestructura de la IE ' + centroPobladoAISI,
      fuente: this.datos?.['fotografiaEducacion1AISIFuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaEducacion1AISIImagen'] || ''
    };
    
    const foto2 = {
      numero: '3. 36',
      titulo: this.datos?.['fotografiaEducacion2AISITitulo'] || 'Infraestructura de la IE N°40271',
      fuente: this.datos?.['fotografiaEducacion2AISIFuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaEducacion2AISIImagen'] || ''
    };
    
    const foto3 = {
      numero: '3. 37',
      titulo: this.datos?.['fotografiaEducacion3AISITitulo'] || 'Infraestructura de la IE Virgen de Copacabana',
      fuente: this.datos?.['fotografiaEducacion3AISIFuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaEducacion3AISIImagen'] || ''
    };
    
    if (foto1.ruta || foto2.ruta || foto3.ruta) {
      if (foto1.ruta) fotos.push(foto1);
      if (foto2.ruta) fotos.push(foto2);
      if (foto3.ruta) fotos.push(foto3);
    }
    
    return fotos;
  }

  getFotografiasEducacionParaImageUpload(): FotoItem[] {
    return this.getFotografiasEducacion().map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.ruta
    }));
  }

  getFotoRecreacion(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaRecreacionAISITitulo'] || 'Plaza de toros del CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaRecreacionAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaRecreacionAISIImagen'] || '';
    
    return {
      numero: '3. 39',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoRecreacionParaImageUpload(): FotoItem[] {
    const foto = this.getFotoRecreacion();
    if (!foto.ruta) {
      return [];
    }
    return [{
      titulo: foto.titulo,
      fuente: foto.fuente,
      imagen: foto.ruta
    }];
  }

  getFotoDeporte(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaDeporteAISITitulo'] || 'Losa deportiva en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaDeporteAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaDeporteAISIImagen'] || '';
    
    return {
      numero: '3. 40',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoDeporteParaImageUpload(): FotoItem[] {
    const foto = this.getFotoDeporte();
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
    this.fotografiasSaludFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_SALUD,
      groupPrefix
    );
    this.fotografiasEducacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_EDUCACION,
      groupPrefix
    );
    this.fotografiasRecreacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RECREACION,
      groupPrefix
    );
    this.fotografiasDeporteFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DEPORTE,
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

  getFotografiasSaludVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_SALUD,
      groupPrefix
    );
  }

  getFotografiasEducacionVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_EDUCACION,
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

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasSaludFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_SALUD,
      groupPrefix
    );
    this.fotografiasEducacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_EDUCACION,
      groupPrefix
    );
    this.fotografiasRecreacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RECREACION,
      groupPrefix
    );
    this.fotografiasDeporteFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DEPORTE,
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

  onFotografiasSaludChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_SALUD, fotografias);
    this.fotografiasSaludFormMulti = [...fotografias];
  }

  onFotografiasEducacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_EDUCACION, fotografias);
    this.fotografiasEducacionFormMulti = [...fotografias];
  }

  onFotografiasRecreacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_RECREACION, fotografias);
    this.fotografiasRecreacionFormMulti = [...fotografias];
  }

  onFotografiasDeporteChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_DEPORTE, fotografias);
    this.fotografiasDeporteFormMulti = [...fotografias];
  }

  obtenerTextoSaludCP(): string {
    if (this.datos.textoSaludCP && this.datos.textoSaludCP !== '____') {
      return this.datos.textoSaludCP;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `Dentro de la capital distrital de ${distrito} se encuentra un único establecimiento de salud de categoría I-2, que brinda atención primaria a la población local. Este puesto de salud es el principal punto de referencia para los habitantes de ${centroPoblado}, ofreciendo servicios esenciales como consultas médicas, controles de salud y atención básica de emergencias. Aunque cuenta con limitaciones en cuanto a especialidades médicas y equipamiento, su presencia es fundamental para atender las necesidades de salud de la población, especialmente considerando la ausencia de otros centros de mayor capacidad en la zona.`;
  }

  obtenerTextoEducacionCP(): string {
    if (this.datos.textoEducacionCP && this.datos.textoEducacionCP !== '____') {
      return this.datos.textoEducacionCP;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const nombreIE = this.datos.nombreIEMayorEstudiantes || 'IE Virgen de Copacabana';
    const cantidadEstudiantes = this.datos.cantidadEstudiantesIEMayor || '28';
    
    return `Dentro del CP ${centroPoblado} se hallan instituciones educativas que cubren todos los niveles de educación básica regular: inicial, primaria y secundaria. En base al Censo Educativo 2023, la institución con mayor cantidad de estudiantes dentro de la localidad es la ${nombreIE}, la cual es de nivel secundaria, con un total de ${cantidadEstudiantes} estudiantes. A continuación, se presenta el cuadro con la cantidad de estudiantes por institución educativa y nivel dentro de la localidad en cuestión.`;
  }

  obtenerTextoRecreacionCP1(): string {
    if (this.datos.textoRecreacionCP1 && this.datos.textoRecreacionCP1 !== '____') {
      return this.datos.textoRecreacionCP1;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `Dentro del CP ${centroPoblado} se cuenta con espacios destinados a la recreación de la población. Entre ellos destacan las plazas, las cuales funcionan como principales áreas de encuentro para la interacción y socialización, especialmente durante festividades y eventos culturales.`;
  }

  obtenerTextoDeporteCP1(): string {
    if (this.datos.textoDeporteCP1 && this.datos.textoDeporteCP1 !== '____') {
      return this.datos.textoDeporteCP1;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `En el CP ${centroPoblado}, la infraestructura deportiva consiste en instalaciones básicas para la práctica de actividades físicas y recreativas. Se destaca la losa deportiva ubicada detrás de la municipalidad, la cual es utilizada para diversos deportes colectivos como fútbol y vóley, y sirve como un espacio frecuente para eventos locales y recreación de niños y jóvenes.`;
  }

  obtenerTextoRecreacionCP2(): string {
    if (this.datos.textoRecreacionCP2 && this.datos.textoRecreacionCP2 !== '____') {
      return this.datos.textoRecreacionCP2;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `Otra infraestructura recreativa relevante es la plaza de toros, que se halla en la zona este del centro poblado, y es un punto de gran relevancia cultural; en especial, durante las festividades patronales y celebraciones taurinas. Este espacio funciona como un centro de actividad importante para las festividades taurinas y celebraciones especiales, atrayendo tanto a residentes como a visitantes y promoviendo las tradiciones locales.`;
  }

  obtenerTextoRecreacionCP3(): string {
    if (this.datos.textoRecreacionCP3 && this.datos.textoRecreacionCP3 !== '____') {
      return this.datos.textoRecreacionCP3;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `Adicionalmente, cabe mencionar el mirador ubicado en el cerro Pilluni, el cual ofrece vistas panorámicas de la capital distrital y los paisajes circundantes. Este lugar es un punto de interés tanto para los residentes como para los visitantes, permitiendo disfrutar de la belleza natural y de actividades recreativas al aire libre, fortaleciendo la identidad comunitaria.`;
  }

  obtenerTextoDeporteCP2(): string {
    if (this.datos.textoDeporteCP2 && this.datos.textoDeporteCP2 !== '____') {
      return this.datos.textoDeporteCP2;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `Asimismo, cabe mencionar que en ${centroPoblado} se cuenta con un "estadio", caracterizado por un campo extenso con pasto y tierra, utilizado principalmente para fútbol y otros deportes al aire libre. Este campo no cuenta con infraestructura adicional como cerco perimetral o gradas, lo que limita su capacidad para eventos formales de gran envergadura. A pesar de ello, el campo es utilizado para actividades recreativas y eventos locales, funcionando como un punto de encuentro comunitario en fechas especiales.`;
  }
}

