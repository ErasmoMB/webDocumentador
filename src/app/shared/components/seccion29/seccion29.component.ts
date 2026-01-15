import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion29',
  templateUrl: './seccion29.component.html',
  styleUrls: ['./seccion29.component.css']
})
export class Seccion29Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'natalidadMortalidadCpTabla', 'morbilidadCpTabla', 'afiliacionSaludTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB18';
  
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

  getNatalidad2023(): string {
    if (!this.datos?.natalidadMortalidadCpTabla || !Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      return '____';
    }
    const item = this.datos.natalidadMortalidadCpTabla.find((item: any) => 
      item.anio && item.anio.toString().includes('2023')
    );
    return item?.natalidad?.toString() || '____';
  }

  getNatalidad2024(): string {
    if (!this.datos?.natalidadMortalidadCpTabla || !Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      return '____';
    }
    const item = this.datos.natalidadMortalidadCpTabla.find((item: any) => 
      item.anio && item.anio.toString().includes('2024')
    );
    return item?.natalidad?.toString() || '____';
  }

  getMortalidad2023(): string {
    if (!this.datos?.natalidadMortalidadCpTabla || !Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      return '____';
    }
    const item = this.datos.natalidadMortalidadCpTabla.find((item: any) => 
      item.anio && item.anio.toString().includes('2023')
    );
    return item?.mortalidad?.toString() || '____';
  }

  getMortalidad2024(): string {
    if (!this.datos?.natalidadMortalidadCpTabla || !Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      return '____';
    }
    const item = this.datos.natalidadMortalidadCpTabla.find((item: any) => 
      item.anio && item.anio.toString().includes('2024')
    );
    return item?.mortalidad?.toString() || '____';
  }

  getCasosInfeccionesRespiratorias(): string {
    if (!this.datos?.morbilidadCpTabla || !Array.isArray(this.datos.morbilidadCpTabla)) {
      return '____';
    }
    const item = this.datos.morbilidadCpTabla.find((item: any) => 
      item.grupo && item.grupo.toLowerCase().includes('infecciones agudas') && item.grupo.toLowerCase().includes('respiratorias')
    );
    return item?.casos?.toString() || '____';
  }

  getCasosObesidad(): string {
    if (!this.datos?.morbilidadCpTabla || !Array.isArray(this.datos.morbilidadCpTabla)) {
      return '____';
    }
    const item = this.datos.morbilidadCpTabla.find((item: any) => 
      item.grupo && item.grupo.toLowerCase().includes('obesidad')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeSIS(): string {
    if (!this.datos?.afiliacionSaludTabla || !Array.isArray(this.datos.afiliacionSaludTabla)) {
      return '____';
    }
    const item = this.datos.afiliacionSaludTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sis') || item.categoria.toLowerCase().includes('integral'))
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeESSALUD(): string {
    if (!this.datos?.afiliacionSaludTabla || !Array.isArray(this.datos.afiliacionSaludTabla)) {
      return '____';
    }
    const item = this.datos.afiliacionSaludTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('essalud')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeSinSeguro(): string {
    if (!this.datos?.afiliacionSaludTabla || !Array.isArray(this.datos.afiliacionSaludTabla)) {
      return '____';
    }
    const item = this.datos.afiliacionSaludTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('ningún') || item.categoria.toLowerCase().includes('ninguno') || item.categoria.toLowerCase().includes('sin seguro'))
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

  inicializarNatalidadMortalidadCP() {
    if (!this.datos['natalidadMortalidadCpTabla'] || this.datos['natalidadMortalidadCpTabla'].length === 0) {
      this.datos['natalidadMortalidadCpTabla'] = [
        { anio: '', natalidad: 0, mortalidad: 0 }
      ];
      this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos['natalidadMortalidadCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarNatalidadMortalidadCP() {
    if (!this.datos['natalidadMortalidadCpTabla']) {
      this.inicializarNatalidadMortalidadCP();
    }
    this.datos['natalidadMortalidadCpTabla'].push({ anio: '', natalidad: 0, mortalidad: 0 });
    this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos['natalidadMortalidadCpTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarNatalidadMortalidadCP(index: number) {
    if (this.datos['natalidadMortalidadCpTabla'] && this.datos['natalidadMortalidadCpTabla'].length > 1) {
      this.datos['natalidadMortalidadCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos['natalidadMortalidadCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarNatalidadMortalidadCP(index: number, field: string, value: any) {
    if (!this.datos['natalidadMortalidadCpTabla']) {
      this.inicializarNatalidadMortalidadCP();
    }
    if (this.datos['natalidadMortalidadCpTabla'][index]) {
      this.datos['natalidadMortalidadCpTabla'][index][field] = value;
      this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos['natalidadMortalidadCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  inicializarMorbilidadCP() {
    if (!this.datos['morbilidadCpTabla'] || this.datos['morbilidadCpTabla'].length === 0) {
      this.datos['morbilidadCpTabla'] = [
        { grupo: '', edad0_11: 0, edad12_17: 0, edad18_29: 0, edad30_59: 0, edad60_mas: 0, casos: 0 }
      ];
      this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarMorbilidadCP() {
    if (!this.datos['morbilidadCpTabla']) {
      this.inicializarMorbilidadCP();
    }
    this.datos['morbilidadCpTabla'].push({ grupo: '', edad0_11: 0, edad12_17: 0, edad18_29: 0, edad30_59: 0, edad60_mas: 0, casos: 0 });
    this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
    this.calcularTotalesMorbilidadCP();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarMorbilidadCP(index: number) {
    if (this.datos['morbilidadCpTabla'] && this.datos['morbilidadCpTabla'].length > 1) {
      this.datos['morbilidadCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
      this.calcularTotalesMorbilidadCP();
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarMorbilidadCP(index: number, field: string, value: any) {
    if (!this.datos['morbilidadCpTabla']) {
      this.inicializarMorbilidadCP();
    }
    if (this.datos['morbilidadCpTabla'][index]) {
      this.datos['morbilidadCpTabla'][index][field] = value;
      if (field !== 'casos' && field !== 'grupo') {
        this.calcularTotalesMorbilidadCP();
      }
      this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularTotalesMorbilidadCP() {
    if (!this.datos['morbilidadCpTabla'] || this.datos['morbilidadCpTabla'].length === 0) {
      return;
    }
    this.datos['morbilidadCpTabla'].forEach((item: any) => {
      const edad0_11 = parseFloat(item.edad0_11) || 0;
      const edad12_17 = parseFloat(item.edad12_17) || 0;
      const edad18_29 = parseFloat(item.edad18_29) || 0;
      const edad30_59 = parseFloat(item.edad30_59) || 0;
      const edad60_mas = parseFloat(item.edad60_mas) || 0;
      const total = edad0_11 + edad12_17 + edad18_29 + edad30_59 + edad60_mas;
      item.casos = total;
    });
  }

  inicializarAfiliacionSaludTabla() {
    if (!this.datos['afiliacionSaludTabla'] || this.datos['afiliacionSaludTabla'].length === 0) {
      this.datos['afiliacionSaludTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos['afiliacionSaludTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarAfiliacionSaludTabla() {
    if (!this.datos['afiliacionSaludTabla']) {
      this.inicializarAfiliacionSaludTabla();
    }
    this.datos['afiliacionSaludTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos['afiliacionSaludTabla']);
    this.calcularPorcentajesAfiliacionSaludTabla();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarAfiliacionSaludTabla(index: number) {
    if (this.datos['afiliacionSaludTabla'] && this.datos['afiliacionSaludTabla'].length > 1) {
      const item = this.datos['afiliacionSaludTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['afiliacionSaludTabla'].splice(index, 1);
        this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos['afiliacionSaludTabla']);
        this.calcularPorcentajesAfiliacionSaludTabla();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarAfiliacionSaludTabla(index: number, field: string, value: any) {
    if (!this.datos['afiliacionSaludTabla']) {
      this.inicializarAfiliacionSaludTabla();
    }
    if (this.datos['afiliacionSaludTabla'][index]) {
      this.datos['afiliacionSaludTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesAfiliacionSaludTabla();
      }
      this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos['afiliacionSaludTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesAfiliacionSaludTabla() {
    if (!this.datos['afiliacionSaludTabla'] || this.datos['afiliacionSaludTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['afiliacionSaludTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['afiliacionSaludTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }
}

