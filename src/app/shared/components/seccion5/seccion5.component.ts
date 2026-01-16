import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion5',
  templateUrl: './seccion5.component.html',
  styleUrls: ['./seccion5.component.css']
})
export class Seccion5Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override readonly PHOTO_PREFIX = 'fotografiaInstitucionalidad';
  
  fotografiasVista: FotoItem[] = [];
  
  override watchedFields: string[] = [
    'parrafoSeccion5_institucionalidad',
    'grupoAISD',
    'tituloInstituciones',
    'fuenteInstituciones',
    'tablepagina6'
  ];

  institucionesConfig: TableConfig = {
    tablaKey: 'tablepagina6',
    totalKey: 'categoria',
    campoTotal: 'categoria',
    campoPorcentaje: 'respuesta',
    estructuraInicial: [{ categoria: '', respuesta: '', nombre: '', comentario: '' }]
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
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografiasVista();
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
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `grupoAISD${prefijo}` : 'grupoAISD';
    const grupoAISDActual = datosActuales[campoConPrefijo] || datosActuales['grupoAISD'] || null;
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    const campoParrafo = prefijo ? `parrafoSeccion5_institucionalidad${prefijo}` : 'parrafoSeccion5_institucionalidad';
    const parrafoActual = (datosActuales as any)[campoParrafo] || null;
    const parrafoAnterior = this.datosAnteriores.parrafoInstitucionalidad || null;
    
    const fotoImagenAISDBaseCon = prefijo ? datosActuales[`fotografiaAISDImagen${prefijo}`] : null;
    const fotoImagenAISDBase = datosActuales['fotografiaAISDImagen'];
    const fotoImagenActual = fotoImagenAISDBaseCon || fotoImagenAISDBase || null;
    const fotoImagenAnterior = this.datosAnteriores.fotoImagen || null;
    
    const imagenActualStr = fotoImagenActual ? String(fotoImagenActual).trim() : '';
    const imagenAnteriorStr = fotoImagenAnterior ? String(fotoImagenAnterior).trim() : '';
    const hayCambioImagen = imagenActualStr !== imagenAnteriorStr && (imagenActualStr || imagenAnteriorStr);
    
    const tablaActual = datosActuales['tablepagina6'] || [];
    const tablaAnterior = this.datosAnteriores.tablepagina6 || [];
    const hayCambioTabla = JSON.stringify(tablaActual) !== JSON.stringify(tablaAnterior);
    
    if (grupoAISDActual !== grupoAISDAnterior || 
        grupoAISDActual !== grupoAISDEnDatos || 
        parrafoActual !== parrafoAnterior ||
        hayCambioImagen ||
        hayCambioTabla) {
      if (hayCambioTabla) {
        this.datosAnteriores.tablepagina6 = JSON.parse(JSON.stringify(tablaActual));
      }
      return true;
    }
    
    return false;
  }

  protected override actualizarDatosCustom(): void {
    const fotoImagenAISDBaseCon = this.obtenerPrefijoGrupo() ? this.datos[`fotografiaAISDImagen${this.obtenerPrefijoGrupo()}`] : null;
    const fotoImagenAISDBase = this.datos['fotografiaAISDImagen'];
    const fotoImagen = fotoImagenAISDBaseCon || fotoImagenAISDBase || null;
    
    this.datosAnteriores.fotoImagen = fotoImagen;
    
    if (this.datos.tablepagina6 && Array.isArray(this.datos.tablepagina6)) {
      this.datosAnteriores.tablepagina6 = JSON.parse(JSON.stringify(this.datos.tablepagina6));
    } else {
      this.datosAnteriores.tablepagina6 = [];
    }
    
    this.fotografiasVista = this.cargarFotografiasVista();
  }

  protected override actualizarValoresConPrefijo(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo) {
      const grupoAISD = this.obtenerValorConPrefijo('grupoAISD');
      this.datos.grupoAISD = grupoAISD || null;
      this.datosAnteriores.grupoAISD = grupoAISD || null;
      
      const campoParrafo = `parrafoSeccion5_institucionalidad${prefijo}`;
      const parrafo = this.datos[campoParrafo] || this.datos['parrafoSeccion5_institucionalidad'] || null;
      this.datosAnteriores.parrafoInstitucionalidad = parrafo;
    } else {
      const grupoAISD = this.datos.grupoAISD || null;
      this.datosAnteriores.grupoAISD = grupoAISD;
      const parrafo = this.datos['parrafoSeccion5_institucionalidad'] || null;
      this.datosAnteriores.parrafoInstitucionalidad = parrafo;
    }
  }

  obtenerParrafoInstitucionalidad(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion5_institucionalidad${prefijo}` : 'parrafoSeccion5_institucionalidad';
    const parrafoGuardado = this.datos[campoParrafo] || this.datos['parrafoSeccion5_institucionalidad'];
    
    if (parrafoGuardado && parrafoGuardado !== '____') {
      return parrafoGuardado;
    }
    
    const nombreComunidad = this.obtenerNombreComunidadActual();
    
    return `Dentro de los límites de la CC ${nombreComunidad} se hallan instituciones que, además de la comunidad campesina en sí, también ejercen funciones dentro del territorio y coadyuvan en el desarrollo socioeconómico de la capital administrativa comunal y de sus diferentes sectores. Cabe destacar la presencia de diversos programas sociales (como Pensión 65, Juntos o Qali Warma), así como la existencia de una Junta Administradora de Servicios de Saneamiento (JASS).`;
  }

  obtenerNombreComunidadActual(): string {
    return this.datos.grupoAISD || '____';
  }

  getFotoInstitucionalidad(): any {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Leer SIEMPRE con prefijo (sin fallback)
    const imagen1Con = prefijo ? this.datos?.[`fotografiaInstitucionalidad1Imagen${prefijo}`] : null;
    const imagen1Sin = this.datos?.['fotografiaInstitucionalidad1Imagen'];
    const imagenSinNumero = this.datos?.['fotografiaInstitucionalidadImagen'];
    const imagenAISDBaseCon = prefijo ? this.datos?.[`fotografiaAISDImagen${prefijo}`] : null;
    const imagenAISD1Con = prefijo ? this.datos?.[`fotografiaAISD1Imagen${prefijo}`] : null;
    const imagenAISD3Con = prefijo ? this.datos?.[`fotografiaAISD3Imagen${prefijo}`] : null;
    
    const imagen = imagen1Con || imagen1Sin || imagenSinNumero || imagenAISDBaseCon || imagenAISD1Con || imagenAISD3Con || '';
    
    if (!imagen || imagen === 'null' || imagen === null || (typeof imagen === 'string' && imagen.trim() === '')) {
      return null;
    }
    
    const grupoAISD = this.datos.grupoAISD || '____';
    
    // Leer SIEMPRE con prefijo para title y source
    const titulo1Con = prefijo ? this.datos?.[`fotografiaInstitucionalidad1Titulo${prefijo}`] : null;
    const titulo1Sin = this.datos?.['fotografiaInstitucionalidad1Titulo'];
    const tituloSinNumero = this.datos?.['fotografiaInstitucionalidadTitulo'];
    const tituloAISDBaseCon = prefijo ? this.datos?.[`fotografiaAISDTitulo${prefijo}`] : null;
    const tituloAISD1Con = prefijo ? this.datos?.[`fotografiaAISD1Titulo${prefijo}`] : null;
    const tituloAISD3Con = prefijo ? this.datos?.[`fotografiaAISD3Titulo${prefijo}`] : null;
    const titulo = titulo1Con || titulo1Sin || tituloSinNumero || tituloAISDBaseCon || tituloAISD1Con || tituloAISD3Con || 'Local Comunal de la CC ' + grupoAISD;
    
    const fuente1Con = prefijo ? this.datos?.[`fotografiaInstitucionalidad1Fuente${prefijo}`] : null;
    const fuente1Sin = this.datos?.['fotografiaInstitucionalidad1Fuente'];
    const fuenteSinNumero = this.datos?.['fotografiaInstitucionalidadFuente'];
    const fuenteAISDBaseCon = prefijo ? this.datos?.[`fotografiaAISDFuente${prefijo}`] : null;
    const fuenteAISD1Con = prefijo ? this.datos?.[`fotografiaAISD1Fuente${prefijo}`] : null;
    const fuenteAISD3Con = prefijo ? this.datos?.[`fotografiaAISD3Fuente${prefijo}`] : null;
    const fuente = fuente1Con || fuente1Sin || fuenteSinNumero || fuenteAISDBaseCon || fuenteAISD1Con || fuenteAISD3Con || 'GEADES, 2024';
    
    // Usar numeración global y consecutiva
    const numeroGlobal = this.photoNumberingService?.getGlobalPhotoNumber(
      this.seccionId,
      1,
      'fotografiaInstitucionalidad',
      prefijo
    );
    
    return {
      numero: numeroGlobal,
      titulo: titulo,
      fuente: fuente,
      ruta: imagen,
      fecha: this.datos?.['fotografiaAISD3Fecha'] || '',
      coordenadas: this.datos?.['coordenadasAISD'] || '',
      direccion: this.datos?.['fotografiaAISD3Direccion'] || '',
      ubicacion: this.getUbicacionTexto(),
      altitud: this.datos?.['altitudAISD'] ? this.datos.altitudAISD + 'm' : '',
      velocidad: this.datos?.['fotografiaAISD3Velocidad'] || '0.0km/h'
    };
  }

  private cargarFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    
    const result = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    return result;
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
  }

  onInstitucionFieldChange(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.institucionesConfig, index, field, value, false);
    this.formularioService.actualizarDato('tablepagina6', this.datos['tablepagina6']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onInstitucionesTableUpdated() {
    this.formularioService.actualizarDato('tablepagina6', this.datos['tablepagina6']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  actualizarInstitucion(index: number, field: string, value: any) {
    this.onInstitucionFieldChange(index, field, value);
  }

  eliminarInstitucion(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.institucionesConfig, index);
    if (deleted) {
      this.formularioService.actualizarDato('tablepagina6', this.datos['tablepagina6']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  inicializarInstituciones() {
    this.tableService.inicializarTabla(this.datos, this.institucionesConfig);
    this.formularioService.actualizarDato('tablepagina6', this.datos['tablepagina6']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  agregarInstitucion() {
    this.tableService.agregarFila(this.datos, this.institucionesConfig);
    this.formularioService.actualizarDato('tablepagina6', this.datos['tablepagina6']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  getUbicacionTexto(): string {
    const partes = [];
    if (this.datos?.grupoAISD) partes.push('C.p ' + this.datos.grupoAISD);
    if (this.datos?.distritoSeleccionado) partes.push(this.datos.distritoSeleccionado);
    if (this.datos?.provinciaSeleccionada) partes.push(this.datos.provinciaSeleccionada);
    if (this.datos?.departamentoSeleccionado) partes.push(this.datos.departamentoSeleccionado);
    return partes.join(', ') || '';
  }



}
