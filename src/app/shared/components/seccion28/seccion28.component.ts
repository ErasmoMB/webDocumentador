import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { EducacionService } from 'src/app/core/services/domain/educacion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { debugLog } from 'src/app/shared/utils/debug';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
// Clean Architecture imports
import { LoadSeccion28UseCase, UpdateSeccion28DataUseCase, Seccion28ViewModel } from 'src/app/core/application/use-cases';
import { Seccion28Data } from 'src/app/core/domain/entities';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        GenericTableComponent,
        ParagraphEditorComponent,
        CoreSharedModule
    ],
    selector: 'app-seccion28',
    templateUrl: './seccion28.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion28Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.7';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private timeouts: number[] = [];
  private readonly regexCache = new Map<string, RegExp>();
  
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

  // Clean Architecture ViewModel
  seccion28ViewModel$ = this.loadSeccion28UseCase.execute();
  seccion28ViewModel?: Seccion28ViewModel;

  puestoSaludConfig: TableConfig = {
    tablaKey: 'puestoSaludCpTabla',
    totalKey: 'categoria',
    campoTotal: 'descripcion',
    campoPorcentaje: '',
    estructuraInicial: [{ categoria: '', descripcion: '' }]
  };

  educacionConfig: TableConfig = {
    tablaKey: 'educacionCpTabla',
    totalKey: 'nombreIE',
    campoTotal: 'cantidadEstudiantes',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['cantidadEstudiantes']
  };

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override tableFacade: TableManagementFacade,
    private stateAdapter: ReactiveStateAdapter,
    private sanitizer: DomSanitizer,
    autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService,
    private educacionService: EducacionService,
    // Clean Architecture dependencies
    private loadSeccion28UseCase: LoadSeccion28UseCase,
    private updateSeccion28DataUseCase: UpdateSeccion28DataUseCase
  ) {
    super(cdRef, autoLoader, injector, undefined, tableFacade);
    
    // Subscribe to ViewModel for Clean Architecture
    this.seccion28ViewModel$.subscribe(viewModel => {
      this.seccion28ViewModel = viewModel;
      this.cdRef.markForCheck();
    });
  }

  // Clean Architecture methods
  updateSeccion28Data(updates: Partial<Seccion28Data>): void {
    if (this.seccion28ViewModel) {
      const currentData = this.seccion28ViewModel.data;
      const updatedData = { ...currentData, ...updates };
      this.updateSeccion28DataUseCase.execute(updatedData).subscribe(updatedViewModel => {
        this.seccion28ViewModel = updatedViewModel;
        this.cdRef.markForCheck();
      });
    }
  }

  // Backward compatibility methods - delegate to Clean Architecture
  obtenerTextoSalud(): string {
    return this.seccion28ViewModel?.texts.saludText || this.datos.textoSaludCP || '';
  }

  obtenerTextoEducacion(): string {
    return this.seccion28ViewModel?.texts.educacionText || this.datos.textoEducacionCP || '';
  }

  obtenerTextoRecreacion(): string {
    return this.seccion28ViewModel?.texts.recreacionText || 
           [this.datos.textoRecreacionCP1, this.datos.textoRecreacionCP2, this.datos.textoRecreacionCP3]
           .filter(text => text).join('\n\n') || '';
  }

  obtenerTextoDeporte(): string {
    return this.seccion28ViewModel?.texts.deporteText || 
           [this.datos.textoDeporteCP1, this.datos.textoDeporteCP2]
           .filter(text => text).join('\n\n') || '';
  }

  protected override onInitCustom(): void {
    // Primero actualizar datos para tener los datos guardados
    this.actualizarDatos();
    // Luego cargar educación solo si no hay datos guardados
    this.cargarEducacion();
    this.eliminarFilasTotal();
    this.actualizarFotografiasCache();
    if (this.modoFormulario) {
      if (this.seccionId) {
        this.timeouts.push(window.setTimeout(() => {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }, 0));
      }
      this.stateSubscription = this['stateAdapter'].datos$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (this.seccionId) {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }
      });
    } else {
      this.stateSubscription = this['stateAdapter'].datos$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
    this.logGrupoActual();
  }

  override ngOnDestroy() {
    this.timeouts.forEach(id => clearTimeout(id));
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected getSectionKey(): string {
    return 'seccion28_aisi';
  }

  protected getLoadParameters(): string[] | null {
    return this.groupConfig.getAISICCPPActivos();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    const centroPobladoAISIActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'centroPobladoAISI', this.seccionId);
    const centroPobladoAISIAnterior = this.datosAnteriores.centroPobladoAISI || null;
    const centroPobladoAISIEnDatos = this.datos.centroPobladoAISI || null;
    
    let hayCambios = false;
    const prefijo = this.obtenerPrefijoGrupo();
    
    const tablasConPrefijo = ['puestoSaludCpTabla', 'educacionCpTabla'];
    
    for (const campo of this.watchedFields) {
      let valorActual: any = null;
      let valorAnterior: any = null;
      
      if (tablasConPrefijo.includes(campo)) {
        const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
        valorActual = (datosActuales as any)[campoConPrefijo] || (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campoConPrefijo] || this.datosAnteriores[campo] || null;
      } else {
        valorActual = (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campo] || null;
      }
      
      if (!this.compararValores(valorActual, valorAnterior)) {
        hayCambios = true;
        if (tablasConPrefijo.includes(campo)) {
          const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
          this.datosAnteriores[campoConPrefijo] = this.clonarValor(valorActual);
        } else {
          this.datosAnteriores[campo] = this.clonarValor(valorActual);
        }
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

  getTablaKeyPuestoSalud(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `puestoSaludCpTabla${prefijo}` : 'puestoSaludCpTabla';
  }

  getTablaKeyEducacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `educacionCpTabla${prefijo}` : 'educacionCpTabla';
  }

  getPuestoSaludTabla(): any[] {
    const tablaKey = this.getTablaKeyPuestoSalud();
    return this.datos[tablaKey] || this.datos.puestoSaludCpTabla || [];
  }

  get puestoSaludCpTablaVista(): any[] {
    return this.getPuestoSaludTabla();
  }

  get educacionCpTablaVista(): any[] {
    const tablaKey = this.getTablaKeyEducacion();
    return this.datos[tablaKey] || this.datos.educacionCpTabla || [];
  }

  get columnasPuestoSalud(): any[] {
    return [
      { key: 'categoria', header: 'Categoría', align: 'left' },
      { key: 'descripcion', header: 'Descripción', align: 'left' }
    ];
  }

  get columnasEducacion(): any[] {
    return [
      { key: 'nombreIE', header: 'Nombre de la IE', align: 'left' },
      { key: 'cantidadEstudiantes', header: 'Cantidad de estudiantes', align: 'right' },
      { key: 'porcentaje', header: 'Porcentaje', align: 'right' }
    ];
  }

  onTablaUpdated(): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
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

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(fotografias: FotoItem[]) {
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

  // Cargar datos de educación desde el backend
  private cargarEducacion(): void {
    const tablaKey = this.getTablaKeyEducacion();
    const datosExistentes = this.datos[tablaKey] || this.datos.educacionCpTabla;
    
    // Solo cargar del backend si no hay datos guardados localmente
    // Verificar si hay datos con contenido válido (no solo arrays vacíos o con valores por defecto)
    if (datosExistentes && Array.isArray(datosExistentes) && datosExistentes.length > 0) {
      const tieneDatosValidos = datosExistentes.some((item: any) => 
        (item.nombreIE && item.nombreIE !== '____' && item.nombreIE.trim() !== '') || 
        (item.cantidadEstudiantes && item.cantidadEstudiantes !== 0 && item.cantidadEstudiantes !== '0') ||
        (item.tipoGestion && item.tipoGestion !== '____' && item.tipoGestion.trim() !== '')
      );
      
      if (tieneDatosValidos) {
        // Ya hay datos guardados con contenido válido editado por el usuario, no sobrescribir
        return;
      }
    }
    
    const codigos = this.groupConfig.getAISICCPPActivos();
    if (!codigos || codigos.length === 0) {
      return;
    }

    this.educacionService.obtenerEducacionPorCodigos(codigos).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        if (response.success && response.data && Array.isArray(response.data)) {
          const educacionData = response.data.map((item: any) => ({
            nombreIE: '____',
            nivel: item.nivel_educativo || '',
            tipoGestion: '____',
            cantidadEstudiantes: Number(item.casos) || 0,
            porcentaje: '0,00 %'
          }));

          this.datos[tablaKey] = educacionData;
          this.onFieldChange(tablaKey as any, educacionData, { refresh: false });
          this.tableFacade.calcularPorcentajes(this.datos, { ...this.educacionConfig, tablaKey });
          this.cdRef.detectChanges();
        }
      },
      (error: any) => {
      }
    );
  }

  // Métodos para filtrar filas Total de educación
  getEducacionSinTotal(): any[] {
    const tablaKey = this.getTablaKeyEducacion();
    const tabla = this.datos[tablaKey] || this.datos?.educacionCpTabla || [];
    
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => 
      !item.nombreIE || !item.nombreIE.toLowerCase().includes('total')
    );
  }

  getTotalEducacion(): number {
    const filtered = this.getEducacionSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.cantidadEstudiantes) || 0), 0);
  }

  /**
   * Obtiene la tabla Educación CP con porcentajes calculados dinámicamente
   * Cuadro 3.53
   * Nota: Esta tabla usa 'cantidadEstudiantes' en lugar de 'casos' como campo numérico
   */
  getEducacionCpConPorcentajes(): any[] {
    const tabla = this.educacionCpTablaVista;
    return TablePercentageHelper.calcularPorcentajesEducacion(tabla, '3.53');
  }

  calcularPorcentajeEducacion(item: any): string {
    const total = this.getTotalEducacion();
    if (total === 0 || !item.cantidadEstudiantes) {
      return '____';
    }
    const porcentaje = (Number(item.cantidadEstudiantes) / total) * 100;
    return `${porcentaje.toFixed(2).replace('.', ',')} %`;
  }

  // Eliminar filas Total al cargar datos
  eliminarFilasTotal(): void {
    // Educación
    const educacionKey = this.getTablaKeyEducacion();
    const educacion = this.datos[educacionKey] || this.datos?.educacionCpTabla;
    if (educacion && Array.isArray(educacion)) {
      const filtered = educacion.filter((item: any) => 
        !item.nombreIE || !item.nombreIE.toLowerCase().includes('total')
      );
      if (filtered.length !== educacion.length) {
        this.datos[educacionKey] = filtered;
        this.onFieldChange(educacionKey as any, filtered, { refresh: false });
      }
    }
  }

  onPuestoSaludTableUpdated(): void {
    const tablaKey = this.getTablaKeyPuestoSalud();
    const tabla = this.datos[tablaKey] || this.datos.puestoSaludCpTabla || [];
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onEducacionFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyEducacion();
    const tabla = this.datos[tablaKey] || this.datos.educacionCpTabla || [];
    
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'cantidadEstudiantes') {
        const total = tabla.reduce((sum: number, item: any) => {
          const nombreIE = item.nombreIE?.toString().toLowerCase() || '';
          if (nombreIE.includes('total')) return sum;
          const cantidad = typeof item.cantidadEstudiantes === 'number' ? item.cantidadEstudiantes : parseInt(item.cantidadEstudiantes) || 0;
          return sum + cantidad;
        }, 0);
        
        if (total > 0) {
          tabla.forEach((item: any) => {
            const nombreIE = item.nombreIE?.toString().toLowerCase() || '';
            if (!nombreIE.includes('total')) {
              const cantidad = typeof item.cantidadEstudiantes === 'number' ? item.cantidadEstudiantes : parseInt(item.cantidadEstudiantes) || 0;
              const porcentaje = ((cantidad / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
      }
      
      // Actualizar tanto en this.datos como en el formularioService
      this.datos[tablaKey] = [...tabla];
      this.onFieldChange(tablaKey as any, tabla, { refresh: false });
      
      // Sincronizar this.datos con los datos del formularioService
      const datosNuevos = this.projectFacade.obtenerDatos();
      this.datos = { ...datosNuevos };
      
      this.cdRef.detectChanges();
    }
  }

  onEducacionTableUpdated(): void {
    const tablaKey = this.getTablaKeyEducacion();
    const tabla = this.datos[tablaKey] || this.datos.educacionCpTabla || [];
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
    
    // Sincronizar this.datos con los datos del formularioService
    const datosNuevos = this.projectFacade.obtenerDatos();
    this.datos = { ...datosNuevos };
    
    this.cdRef.detectChanges();
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private compararValores(actual: any, anterior: any): boolean {
    if (actual === anterior) return true;
    if (actual == null || anterior == null) return actual === anterior;
    if (typeof actual !== typeof anterior) return false;
    if (typeof actual !== 'object') return actual === anterior;
    if (Array.isArray(actual) !== Array.isArray(anterior)) return false;
    if (Array.isArray(actual)) {
      if (actual.length !== anterior.length) return false;
      for (let i = 0; i < actual.length; i++) {
        if (!this.compararValores(actual[i], anterior[i])) return false;
      }
      return true;
    }
    const keysActual = Object.keys(actual);
    const keysAnterior = Object.keys(anterior);
    if (keysActual.length !== keysAnterior.length) return false;
    for (const key of keysActual) {
      if (!keysAnterior.includes(key)) return false;
      if (!this.compararValores(actual[key], anterior[key])) return false;
    }
    return true;
  }

  private clonarValor(valor: any): any {
    if (valor == null || typeof valor !== 'object') return valor;
    if (Array.isArray(valor)) {
      return valor.map(item => this.clonarValor(item));
    }
    const clon: any = {};
    for (const key in valor) {
      if (valor.hasOwnProperty(key)) {
        clon[key] = this.clonarValor(valor[key]);
      }
    }
    return clon;
  }
}

