import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion25',
  templateUrl: './seccion25.component.html',
  styleUrls: ['./seccion25.component.css']
})
export class Seccion25Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'tiposViviendaAISI', 'condicionOcupacionAISI', 'materialesViviendaAISI'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB14';
  
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

  getTotalViviendasEmpadronadas(): string {
    if (!this.datos?.tiposViviendaAISI || !Array.isArray(this.datos.tiposViviendaAISI)) {
      return '____';
    }
    const total = this.datos.tiposViviendaAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    return total?.casos?.toString() || '____';
  }

  getViviendasOcupadasPresentes(): string {
    if (!this.datos?.condicionOcupacionAISI || !Array.isArray(this.datos.condicionOcupacionAISI)) {
      return '____';
    }
    const item = this.datos.condicionOcupacionAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && item.categoria.toLowerCase().includes('presentes')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeOcupadasPresentes(): string {
    if (!this.datos?.condicionOcupacionAISI || !Array.isArray(this.datos.condicionOcupacionAISI)) {
      return '____';
    }
    const item = this.datos.condicionOcupacionAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && item.categoria.toLowerCase().includes('presentes')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajePisosTierra(): string {
    if (!this.datos?.materialesViviendaAISI || !Array.isArray(this.datos.materialesViviendaAISI)) {
      return '____';
    }
    const item = this.datos.materialesViviendaAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pisos') && 
      item.tipoMaterial && item.tipoMaterial.toLowerCase().includes('tierra')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajePisosCemento(): string {
    if (!this.datos?.materialesViviendaAISI || !Array.isArray(this.datos.materialesViviendaAISI)) {
      return '____';
    }
    const item = this.datos.materialesViviendaAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pisos') && 
      item.tipoMaterial && item.tipoMaterial.toLowerCase().includes('cemento')
    );
    return item?.porcentaje || '____';
  }

  getFotoEstructura(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaEstructuraAISITitulo'] || 'Estructura de las viviendas en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaEstructuraAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaEstructuraAISIImagen'] || '';
    
    return {
      numero: '3. 28',
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

  inicializarTiposViviendaAISI() {
    if (!this.datos['tiposViviendaAISI'] || this.datos['tiposViviendaAISI'].length === 0) {
      this.datos['tiposViviendaAISI'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('tiposViviendaAISI', this.datos['tiposViviendaAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarTiposViviendaAISI() {
    if (!this.datos['tiposViviendaAISI']) {
      this.inicializarTiposViviendaAISI();
    }
    this.datos['tiposViviendaAISI'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('tiposViviendaAISI', this.datos['tiposViviendaAISI']);
    this.calcularPorcentajesTiposViviendaAISI();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarTiposViviendaAISI(index: number) {
    if (this.datos['tiposViviendaAISI'] && this.datos['tiposViviendaAISI'].length > 1) {
      const item = this.datos['tiposViviendaAISI'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['tiposViviendaAISI'].splice(index, 1);
        this.formularioService.actualizarDato('tiposViviendaAISI', this.datos['tiposViviendaAISI']);
        this.calcularPorcentajesTiposViviendaAISI();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarTiposViviendaAISI(index: number, field: string, value: any) {
    if (!this.datos['tiposViviendaAISI']) {
      this.inicializarTiposViviendaAISI();
    }
    if (this.datos['tiposViviendaAISI'][index]) {
      this.datos['tiposViviendaAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesTiposViviendaAISI();
      }
      this.formularioService.actualizarDato('tiposViviendaAISI', this.datos['tiposViviendaAISI']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesTiposViviendaAISI() {
    if (!this.datos['tiposViviendaAISI'] || this.datos['tiposViviendaAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['tiposViviendaAISI'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['tiposViviendaAISI'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarCondicionOcupacionAISI() {
    if (!this.datos['condicionOcupacionAISI'] || this.datos['condicionOcupacionAISI'].length === 0) {
      this.datos['condicionOcupacionAISI'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos['condicionOcupacionAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarCondicionOcupacionAISI() {
    if (!this.datos['condicionOcupacionAISI']) {
      this.inicializarCondicionOcupacionAISI();
    }
    this.datos['condicionOcupacionAISI'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos['condicionOcupacionAISI']);
    this.calcularPorcentajesCondicionOcupacionAISI();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarCondicionOcupacionAISI(index: number) {
    if (this.datos['condicionOcupacionAISI'] && this.datos['condicionOcupacionAISI'].length > 1) {
      const item = this.datos['condicionOcupacionAISI'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['condicionOcupacionAISI'].splice(index, 1);
        this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos['condicionOcupacionAISI']);
        this.calcularPorcentajesCondicionOcupacionAISI();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCondicionOcupacionAISI(index: number, field: string, value: any) {
    if (!this.datos['condicionOcupacionAISI']) {
      this.inicializarCondicionOcupacionAISI();
    }
    if (this.datos['condicionOcupacionAISI'][index]) {
      this.datos['condicionOcupacionAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesCondicionOcupacionAISI();
      }
      this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos['condicionOcupacionAISI']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesCondicionOcupacionAISI() {
    if (!this.datos['condicionOcupacionAISI'] || this.datos['condicionOcupacionAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['condicionOcupacionAISI'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['condicionOcupacionAISI'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarMaterialesViviendaAISI() {
    if (!this.datos['materialesViviendaAISI'] || this.datos['materialesViviendaAISI'].length === 0) {
      this.datos['materialesViviendaAISI'] = [
        { categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarMaterialesViviendaAISI() {
    if (!this.datos['materialesViviendaAISI']) {
      this.inicializarMaterialesViviendaAISI();
    }
    this.datos['materialesViviendaAISI'].push({ categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
    this.calcularPorcentajesMaterialesViviendaAISI();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarMaterialesViviendaAISI(index: number) {
    if (this.datos['materialesViviendaAISI'] && this.datos['materialesViviendaAISI'].length > 1) {
      this.datos['materialesViviendaAISI'].splice(index, 1);
      this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
      this.calcularPorcentajesMaterialesViviendaAISI();
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarMaterialesViviendaAISI(index: number, field: string, value: any) {
    if (!this.datos['materialesViviendaAISI']) {
      this.inicializarMaterialesViviendaAISI();
    }
    if (this.datos['materialesViviendaAISI'][index]) {
      this.datos['materialesViviendaAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesMaterialesViviendaAISI();
      }
      this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesMaterialesViviendaAISI() {
    if (!this.datos['materialesViviendaAISI'] || this.datos['materialesViviendaAISI'].length === 0) {
      return;
    }
    const categorias = ['paredes', 'techos', 'pisos'];
    categorias.forEach(categoria => {
      const itemsCategoria = this.datos['materialesViviendaAISI'].filter((item: any) => 
        item.categoria && item.categoria.toLowerCase().includes(categoria)
      );
      if (itemsCategoria.length > 0) {
        const totalItem = itemsCategoria.find((item: any) => 
          item.categoria && item.categoria.toLowerCase().includes('total')
        );
        const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
        
        if (total > 0) {
          itemsCategoria.forEach((item: any) => {
            if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
              const casos = parseFloat(item.casos) || 0;
              const porcentaje = ((casos / total) * 100).toFixed(2);
              item.porcentaje = porcentaje + ' %';
            }
          });
        }
      }
    });
  }
}

