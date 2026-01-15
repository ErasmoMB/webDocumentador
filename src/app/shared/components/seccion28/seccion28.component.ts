import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion28',
  templateUrl: './seccion28.component.html',
  styleUrls: ['./seccion28.component.css']
})
export class Seccion28Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'puestoSaludCpTabla', 'educacionCpTabla', 'nombreIEMayorEstudiantes', 'cantidadEstudiantesIEMayor'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB17';
  
  fotografiasInstitucionalidadCache: any[] = [];

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    cdRef: ChangeDetectorRef
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, null as any, cdRef);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
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

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
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
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  inicializarPuestoSaludCP() {
    if (!this.datos['puestoSaludCpTabla'] || this.datos['puestoSaludCpTabla'].length === 0) {
      this.datos['puestoSaludCpTabla'] = [
        { categoria: '', descripcion: '' }
      ];
      this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos['puestoSaludCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarPuestoSaludCP() {
    if (!this.datos['puestoSaludCpTabla']) {
      this.inicializarPuestoSaludCP();
    }
    this.datos['puestoSaludCpTabla'].push({ categoria: '', descripcion: '' });
    this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos['puestoSaludCpTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarPuestoSaludCP(index: number) {
    if (this.datos['puestoSaludCpTabla'] && this.datos['puestoSaludCpTabla'].length > 1) {
      this.datos['puestoSaludCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos['puestoSaludCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarPuestoSaludCP(index: number, field: string, value: any) {
    if (!this.datos['puestoSaludCpTabla']) {
      this.inicializarPuestoSaludCP();
    }
    if (this.datos['puestoSaludCpTabla'][index]) {
      this.datos['puestoSaludCpTabla'][index][field] = value;
      this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos['puestoSaludCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  inicializarEducacionCP() {
    if (!this.datos['educacionCpTabla'] || this.datos['educacionCpTabla'].length === 0) {
      this.datos['educacionCpTabla'] = [
        { nombreIE: '', nivel: '', tipoGestion: '', cantidadEstudiantes: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('educacionCpTabla', this.datos['educacionCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarEducacionCP() {
    if (!this.datos['educacionCpTabla']) {
      this.inicializarEducacionCP();
    }
    this.datos['educacionCpTabla'].push({ nombreIE: '', nivel: '', tipoGestion: '', cantidadEstudiantes: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('educacionCpTabla', this.datos['educacionCpTabla']);
    this.calcularPorcentajesEducacionCP();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarEducacionCP(index: number) {
    if (this.datos['educacionCpTabla'] && this.datos['educacionCpTabla'].length > 1) {
      const item = this.datos['educacionCpTabla'][index];
      if (!item.nombreIE || !item.nombreIE.toLowerCase().includes('total')) {
        this.datos['educacionCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('educacionCpTabla', this.datos['educacionCpTabla']);
        this.calcularPorcentajesEducacionCP();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarEducacionCP(index: number, field: string, value: any) {
    if (!this.datos['educacionCpTabla']) {
      this.inicializarEducacionCP();
    }
    if (this.datos['educacionCpTabla'][index]) {
      this.datos['educacionCpTabla'][index][field] = value;
      if (field === 'cantidadEstudiantes') {
        this.calcularPorcentajesEducacionCP();
      }
      this.formularioService.actualizarDato('educacionCpTabla', this.datos['educacionCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesEducacionCP() {
    if (!this.datos['educacionCpTabla'] || this.datos['educacionCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['educacionCpTabla'].find((item: any) => 
      item.nombreIE && item.nombreIE.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.cantidadEstudiantes) || 0 : 0;
    
    if (total > 0) {
      this.datos['educacionCpTabla'].forEach((item: any) => {
        if (!item.nombreIE || !item.nombreIE.toLowerCase().includes('total')) {
          const cantidad = parseFloat(item.cantidadEstudiantes) || 0;
          const porcentaje = ((cantidad / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }
}

