import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion26',
  templateUrl: './seccion26.component.html',
  styleUrls: ['./seccion26.component.css']
})
export class Seccion26Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'condicionOcupacionAISI', 'materialesViviendaAISI', 'abastecimientoAguaCpTabla', 'saneamientoCpTabla', 'coberturaElectricaCpTabla', 'combustiblesCocinarCpTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB15';
  
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

  getViviendasOcupadasPresentes(): string {
    if (!this.datos?.condicionOcupacionAISI || !Array.isArray(this.datos.condicionOcupacionAISI)) {
      return '____';
    }
    const item = this.datos.condicionOcupacionAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && item.categoria.toLowerCase().includes('presentes')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeAguaRedPublicaDentro(): string {
    if (!this.datos?.abastecimientoAguaCpTabla || !Array.isArray(this.datos.abastecimientoAguaCpTabla)) {
      return '____';
    }
    const item = this.datos.abastecimientoAguaCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('dentro')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeAguaRedPublicaFuera(): string {
    if (!this.datos?.abastecimientoAguaCpTabla || !Array.isArray(this.datos.abastecimientoAguaCpTabla)) {
      return '____';
    }
    const item = this.datos.abastecimientoAguaCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('fuera')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeElectricidadSi(): string {
    if (!this.datos?.coberturaElectricaCpTabla || !Array.isArray(this.datos.coberturaElectricaCpTabla)) {
      return '____';
    }
    const item = this.datos.coberturaElectricaCpTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('si tiene') || item.categoria.toLowerCase().includes('tiene'))
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeElectricidadNo(): string {
    if (!this.datos?.coberturaElectricaCpTabla || !Array.isArray(this.datos.coberturaElectricaCpTabla)) {
      return '____';
    }
    const item = this.datos.coberturaElectricaCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('no tiene')
    );
    return item?.porcentaje || '____';
  }

  getTotalHogares(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const total = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    return total?.casos?.toString() || '____';
  }

  getPorcentajeLena(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const item = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('leña')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeGas(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const item = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('gas')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeBosta(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const item = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('bosta') || item.categoria.toLowerCase().includes('estiércol'))
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeElectricidadCocinar(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const item = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('electricidad')
    );
    return item?.porcentaje || '____';
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

  inicializarAbastecimientoAguaCP() {
    if (!this.datos['abastecimientoAguaCpTabla'] || this.datos['abastecimientoAguaCpTabla'].length === 0) {
      this.datos['abastecimientoAguaCpTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos['abastecimientoAguaCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarAbastecimientoAguaCP() {
    if (!this.datos['abastecimientoAguaCpTabla']) {
      this.inicializarAbastecimientoAguaCP();
    }
    this.datos['abastecimientoAguaCpTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos['abastecimientoAguaCpTabla']);
    this.calcularPorcentajesAbastecimientoAguaCP();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarAbastecimientoAguaCP(index: number) {
    if (this.datos['abastecimientoAguaCpTabla'] && this.datos['abastecimientoAguaCpTabla'].length > 1) {
      const item = this.datos['abastecimientoAguaCpTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['abastecimientoAguaCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos['abastecimientoAguaCpTabla']);
        this.calcularPorcentajesAbastecimientoAguaCP();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarAbastecimientoAguaCP(index: number, field: string, value: any) {
    if (!this.datos['abastecimientoAguaCpTabla']) {
      this.inicializarAbastecimientoAguaCP();
    }
    if (this.datos['abastecimientoAguaCpTabla'][index]) {
      this.datos['abastecimientoAguaCpTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesAbastecimientoAguaCP();
      }
      this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos['abastecimientoAguaCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesAbastecimientoAguaCP() {
    if (!this.datos['abastecimientoAguaCpTabla'] || this.datos['abastecimientoAguaCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['abastecimientoAguaCpTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['abastecimientoAguaCpTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarSaneamientoCP() {
    if (!this.datos['saneamientoCpTabla'] || this.datos['saneamientoCpTabla'].length === 0) {
      this.datos['saneamientoCpTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('saneamientoCpTabla', this.datos['saneamientoCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarSaneamientoCP() {
    if (!this.datos['saneamientoCpTabla']) {
      this.inicializarSaneamientoCP();
    }
    this.datos['saneamientoCpTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('saneamientoCpTabla', this.datos['saneamientoCpTabla']);
    this.calcularPorcentajesSaneamientoCP();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarSaneamientoCP(index: number) {
    if (this.datos['saneamientoCpTabla'] && this.datos['saneamientoCpTabla'].length > 1) {
      const item = this.datos['saneamientoCpTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['saneamientoCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('saneamientoCpTabla', this.datos['saneamientoCpTabla']);
        this.calcularPorcentajesSaneamientoCP();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarSaneamientoCP(index: number, field: string, value: any) {
    if (!this.datos['saneamientoCpTabla']) {
      this.inicializarSaneamientoCP();
    }
    if (this.datos['saneamientoCpTabla'][index]) {
      this.datos['saneamientoCpTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesSaneamientoCP();
      }
      this.formularioService.actualizarDato('saneamientoCpTabla', this.datos['saneamientoCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesSaneamientoCP() {
    if (!this.datos['saneamientoCpTabla'] || this.datos['saneamientoCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['saneamientoCpTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['saneamientoCpTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarCoberturaElectricaCP() {
    if (!this.datos['coberturaElectricaCpTabla'] || this.datos['coberturaElectricaCpTabla'].length === 0) {
      this.datos['coberturaElectricaCpTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos['coberturaElectricaCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarCoberturaElectricaCP() {
    if (!this.datos['coberturaElectricaCpTabla']) {
      this.inicializarCoberturaElectricaCP();
    }
    this.datos['coberturaElectricaCpTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos['coberturaElectricaCpTabla']);
    this.calcularPorcentajesCoberturaElectricaCP();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarCoberturaElectricaCP(index: number) {
    if (this.datos['coberturaElectricaCpTabla'] && this.datos['coberturaElectricaCpTabla'].length > 1) {
      const item = this.datos['coberturaElectricaCpTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['coberturaElectricaCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos['coberturaElectricaCpTabla']);
        this.calcularPorcentajesCoberturaElectricaCP();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCoberturaElectricaCP(index: number, field: string, value: any) {
    if (!this.datos['coberturaElectricaCpTabla']) {
      this.inicializarCoberturaElectricaCP();
    }
    if (this.datos['coberturaElectricaCpTabla'][index]) {
      this.datos['coberturaElectricaCpTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesCoberturaElectricaCP();
      }
      this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos['coberturaElectricaCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesCoberturaElectricaCP() {
    if (!this.datos['coberturaElectricaCpTabla'] || this.datos['coberturaElectricaCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['coberturaElectricaCpTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['coberturaElectricaCpTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarCombustiblesCocinarCP() {
    if (!this.datos['combustiblesCocinarCpTabla'] || this.datos['combustiblesCocinarCpTabla'].length === 0) {
      this.datos['combustiblesCocinarCpTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos['combustiblesCocinarCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarCombustiblesCocinarCP() {
    if (!this.datos['combustiblesCocinarCpTabla']) {
      this.inicializarCombustiblesCocinarCP();
    }
    this.datos['combustiblesCocinarCpTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos['combustiblesCocinarCpTabla']);
    this.calcularPorcentajesCombustiblesCocinarCP();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarCombustiblesCocinarCP(index: number) {
    if (this.datos['combustiblesCocinarCpTabla'] && this.datos['combustiblesCocinarCpTabla'].length > 1) {
      const item = this.datos['combustiblesCocinarCpTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['combustiblesCocinarCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos['combustiblesCocinarCpTabla']);
        this.calcularPorcentajesCombustiblesCocinarCP();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCombustiblesCocinarCP(index: number, field: string, value: any) {
    if (!this.datos['combustiblesCocinarCpTabla']) {
      this.inicializarCombustiblesCocinarCP();
    }
    if (this.datos['combustiblesCocinarCpTabla'][index]) {
      this.datos['combustiblesCocinarCpTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesCombustiblesCocinarCP();
      }
      this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos['combustiblesCocinarCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesCombustiblesCocinarCP() {
    if (!this.datos['combustiblesCocinarCpTabla'] || this.datos['combustiblesCocinarCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['combustiblesCocinarCpTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['combustiblesCocinarCpTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  getFotoDesechosSolidos(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaDesechosSolidosAISITitulo'] || 'Contenedores de residuos sólidos en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaDesechosSolidosAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaDesechosSolidosAISIImagen'] || '';
    
    return {
      numero: '3. 28',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoElectricidad(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaElectricidadAISITitulo'] || 'Infraestructura eléctrica en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaElectricidadAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaElectricidadAISIImagen'] || '';
    
    return {
      numero: '3. 30',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

