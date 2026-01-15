import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
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

  nivelEducativoConfig: TableConfig = {
    tablaKey: 'nivelEducativoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: '', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  tasaAnalfabetismoConfig: TableConfig = {
    tablaKey: 'tasaAnalfabetismoTabla',
    totalKey: 'indicador',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { indicador: '', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService
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
    return this.tableService.obtenerValorDeTablaPorCategoria(
      this.datos,
      'nivelEducativoTabla',
      'secundaria',
      'porcentaje'
    );
  }

  getPorcentajePrimaria(): string {
    return this.tableService.obtenerValorDeTablaPorCategoria(
      this.datos,
      'nivelEducativoTabla',
      'primaria',
      'porcentaje'
    );
  }

  getPorcentajeSinNivel(): string {
    const sinNivel = this.tableService.obtenerValorDeTablaPorCategoria(
      this.datos,
      'nivelEducativoTabla',
      'sin nivel',
      'porcentaje'
    );
    if (sinNivel === '____') {
      return this.tableService.obtenerValorDeTablaPorCategoria(
        this.datos,
        'nivelEducativoTabla',
        'inicial',
        'porcentaje'
      );
    }
    return sinNivel;
  }

  getCasosAnalfabetismo(): string {
    return this.tableService.obtenerValorDeTablaPorIndicador(
      this.datos,
      'tasaAnalfabetismoTabla',
      'no sabe',
      'casos'
    );
  }

  getPorcentajeAnalfabetismo(): string {
    return this.tableService.obtenerValorDeTablaPorIndicador(
      this.datos,
      'tasaAnalfabetismoTabla',
      'no sabe',
      'porcentaje'
    );
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
    this.tableService.inicializarTabla(this.datos, this.nivelEducativoConfig);
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.cdRef.detectChanges();
  }

  agregarNivelEducativoTabla() {
    this.tableService.agregarFila(this.datos, this.nivelEducativoConfig);
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarNivelEducativoTabla(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.nivelEducativoConfig, index);
    if (deleted) {
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarNivelEducativoTabla(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.nivelEducativoConfig, index, field, value);
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesNivelEducativoTabla() {
    this.tableService.calcularPorcentajes(this.datos, this.nivelEducativoConfig);
  }

  inicializarTasaAnalfabetismoTabla() {
    this.tableService.inicializarTabla(this.datos, this.tasaAnalfabetismoConfig);
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.cdRef.detectChanges();
  }

  agregarTasaAnalfabetismoTabla() {
    this.tableService.agregarFila(this.datos, this.tasaAnalfabetismoConfig);
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarTasaAnalfabetismoTabla(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.tasaAnalfabetismoConfig, index);
    if (deleted) {
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarTasaAnalfabetismoTabla(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.tasaAnalfabetismoConfig, index, field, value);
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesTasaAnalfabetismoTabla() {
    this.tableService.calcularPorcentajes(this.datos, this.tasaAnalfabetismoConfig);
  }

  obtenerTextoNivelEducativo(): string {
    return this.datos.textoNivelEducativo || '';
  }

  obtenerTextoTasaAnalfabetismo(): string {
    return this.datos.textoTasaAnalfabetismo || '';
  }
}

