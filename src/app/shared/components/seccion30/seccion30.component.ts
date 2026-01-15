import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion30',
  templateUrl: './seccion30.component.html',
  styleUrls: ['./seccion30.component.css']
})
export class Seccion30Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'parrafoSeccion30_indicadores_educacion_intro', 'nivelEducativoTabla', 'tasaAnalfabetismoTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB19';
  
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

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  getPorcentajeSecundaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const item = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('secundaria')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajePrimaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const item = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('primaria')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeSinNivel(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const item = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sin nivel') || item.categoria.toLowerCase().includes('inicial'))
    );
    return item?.porcentaje || '____';
  }

  getCasosAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const item = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && item.indicador.toLowerCase().includes('no sabe')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const item = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && item.indicador.toLowerCase().includes('no sabe')
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

  inicializarNivelEducativoTabla() {
    if (!this.datos['nivelEducativoTabla'] || this.datos['nivelEducativoTabla'].length === 0) {
      this.datos['nivelEducativoTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarNivelEducativoTabla() {
    if (!this.datos['nivelEducativoTabla']) {
      this.inicializarNivelEducativoTabla();
    }
    this.datos['nivelEducativoTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.calcularPorcentajesNivelEducativoTabla();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarNivelEducativoTabla(index: number) {
    if (this.datos['nivelEducativoTabla'] && this.datos['nivelEducativoTabla'].length > 1) {
      const item = this.datos['nivelEducativoTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['nivelEducativoTabla'].splice(index, 1);
        this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
        this.calcularPorcentajesNivelEducativoTabla();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNivelEducativoTabla(index: number, field: string, value: any) {
    if (!this.datos['nivelEducativoTabla']) {
      this.inicializarNivelEducativoTabla();
    }
    if (this.datos['nivelEducativoTabla'][index]) {
      this.datos['nivelEducativoTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesNivelEducativoTabla();
      }
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesNivelEducativoTabla() {
    if (!this.datos['nivelEducativoTabla'] || this.datos['nivelEducativoTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['nivelEducativoTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['nivelEducativoTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarTasaAnalfabetismoTabla() {
    if (!this.datos['tasaAnalfabetismoTabla'] || this.datos['tasaAnalfabetismoTabla'].length === 0) {
      this.datos['tasaAnalfabetismoTabla'] = [
        { indicador: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarTasaAnalfabetismoTabla() {
    if (!this.datos['tasaAnalfabetismoTabla']) {
      this.inicializarTasaAnalfabetismoTabla();
    }
    this.datos['tasaAnalfabetismoTabla'].push({ indicador: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.calcularPorcentajesTasaAnalfabetismoTabla();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarTasaAnalfabetismoTabla(index: number) {
    if (this.datos['tasaAnalfabetismoTabla'] && this.datos['tasaAnalfabetismoTabla'].length > 1) {
      const item = this.datos['tasaAnalfabetismoTabla'][index];
      if (!item.indicador || !item.indicador.toLowerCase().includes('total')) {
        this.datos['tasaAnalfabetismoTabla'].splice(index, 1);
        this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
        this.calcularPorcentajesTasaAnalfabetismoTabla();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarTasaAnalfabetismoTabla(index: number, field: string, value: any) {
    if (!this.datos['tasaAnalfabetismoTabla']) {
      this.inicializarTasaAnalfabetismoTabla();
    }
    if (this.datos['tasaAnalfabetismoTabla'][index]) {
      this.datos['tasaAnalfabetismoTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesTasaAnalfabetismoTabla();
      }
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesTasaAnalfabetismoTabla() {
    if (!this.datos['tasaAnalfabetismoTabla'] || this.datos['tasaAnalfabetismoTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['tasaAnalfabetismoTabla'].find((item: any) => 
      item.indicador && item.indicador.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['tasaAnalfabetismoTabla'].forEach((item: any) => {
        if (!item.indicador || !item.indicador.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }
}

