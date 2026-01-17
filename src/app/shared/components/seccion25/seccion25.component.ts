import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion25',
  templateUrl: './seccion25.component.html',
  styleUrls: ['./seccion25.component.css']
})
export class Seccion25Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'tiposViviendaAISI', 'condicionOcupacionAISI', 'materialesViviendaAISI', 'textoViviendaAISI', 'textoOcupacionViviendaAISI', 'textoEstructuraAISI'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB14';
  
  fotografiasInstitucionalidadCache: any[] = [];

  tiposViviendaConfig: TableConfig = {
    tablaKey: 'tiposViviendaAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  condicionOcupacionConfig: TableConfig = {
    tablaKey: 'condicionOcupacionAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  materialesViviendaConfig: TableConfig = {
    tablaKey: 'materialesViviendaAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService,
    private stateService: StateService,
    private sanitizer: DomSanitizer
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, null as any, cdRef);
  }

  protected override onInitCustom(): void {
    this.eliminarFilasTotal();
    this.actualizarFotografiasCache();
    if (!this.modoFormulario) {
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

  getTablaKeyTiposVivienda(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tiposViviendaAISI${prefijo}` : 'tiposViviendaAISI';
  }

  getTablaKeyCondicionOcupacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `condicionOcupacionAISI${prefijo}` : 'condicionOcupacionAISI';
  }

  getTablaKeyMaterialesVivienda(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `materialesViviendaAISI${prefijo}` : 'materialesViviendaAISI';
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

  getFotoEstructuraParaImageUpload(): FotoItem[] {
    const foto = this.getFotoEstructura();
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
  }

  override getFotografiasVista(): FotoItem[] {
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
  }

  onMaterialesViviendaFieldChange(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.materialesViviendaConfig, index, field, value, false);
    if (field === 'casos') {
      this.calcularPorcentajesMaterialesViviendaAISI();
    }
    this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
  }

  onMaterialesViviendaTableUpdated() {
    this.calcularPorcentajesMaterialesViviendaAISI();
    this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
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

  obtenerTextoViviendaAISI(): string {
    if (this.datos.textoViviendaAISI && this.datos.textoViviendaAISI !== '____') {
      return this.datos.textoViviendaAISI;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const totalViviendas = this.getTotalViviendasEmpadronadas();
    
    return `Según los Censos Nacionales 2017, en el CP ${centroPoblado} se hallan un total de ${totalViviendas} viviendas empadronadas. El único tipo de vivienda existente es la casa independiente, pues representa el 100,0 % del conjunto.`;
  }

  obtenerTextoOcupacionViviendaAISI(): string {
    if (this.datos.textoOcupacionViviendaAISI && this.datos.textoOcupacionViviendaAISI !== '____') {
      return this.datos.textoOcupacionViviendaAISI;
    }
    
    const viviendasOcupadas = this.getViviendasOcupadasPresentes();
    const porcentajeOcupadas = this.getPorcentajeOcupadasPresentes();
    
    return `Para poder describir el acápite de estructura de las viviendas de esta localidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas con personas presentes que llegan a la cantidad de ${viviendasOcupadas}. A continuación, se muestra el cuadro con la información respecto a la condición de ocupación de viviendas, tal como realiza el Censo Nacional 2017. De aquí se halla que las viviendas ocupadas con personas presentes representan el ${porcentajeOcupadas} del conjunto analizado.`;
  }

  obtenerTextoEstructuraAISI(): string {
    if (this.datos.textoEstructuraAISI && this.datos.textoEstructuraAISI !== '____') {
      return this.datos.textoEstructuraAISI;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const porcentajePisosTierra = this.getPorcentajePisosTierra();
    const porcentajePisosCemento = this.getPorcentajePisosCemento();
    
    return `Según la información recabada de los Censos Nacionales 2017, dentro del CP ${centroPoblado}, el único material empleado para la construcción de las paredes de las viviendas es el adobe. Respecto a los techos, también se cuenta con un único material, que son las planchas de calamina, fibra de cemento o similares.\n\nFinalmente, en cuanto a los pisos, la mayoría están hechos de tierra (${porcentajePisosTierra}). El porcentaje restante, que consta del ${porcentajePisosCemento}, cuentan con pisos elaborados a base de cemento.`;
  }

  // Métodos para filtrar filas Total de tipos de vivienda
  getTiposViviendaSinTotal(): any[] {
    if (!this.datos?.tiposViviendaAISI || !Array.isArray(this.datos.tiposViviendaAISI)) {
      return [];
    }
    return this.datos.tiposViviendaAISI.filter((item: any) => 
      !item.categoria || !item.categoria.toLowerCase().includes('total')
    );
  }

  getTotalTiposVivienda(): number {
    const filtered = this.getTiposViviendaSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Métodos para filtrar filas Total de condición de ocupación
  getCondicionOcupacionSinTotal(): any[] {
    if (!this.datos?.condicionOcupacionAISI || !Array.isArray(this.datos.condicionOcupacionAISI)) {
      return [];
    }
    return this.datos.condicionOcupacionAISI.filter((item: any) => 
      !item.categoria || !item.categoria.toLowerCase().includes('total')
    );
  }

  getTotalCondicionOcupacion(): number {
    const filtered = this.getCondicionOcupacionSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Métodos para filtrar filas Total de materiales de vivienda
  getMaterialesViviendaSinTotal(): any[] {
    if (!this.datos?.materialesViviendaAISI || !Array.isArray(this.datos.materialesViviendaAISI)) {
      return [];
    }
    return this.datos.materialesViviendaAISI.filter((item: any) => 
      !item.categoria || !item.categoria.toLowerCase().includes('total')
    );
  }

  getTotalMaterialesVivienda(): number {
    const filtered = this.getMaterialesViviendaSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Eliminar filas Total al cargar datos
  eliminarFilasTotal(): void {
    // Tipos de Vivienda
    if (this.datos?.tiposViviendaAISI && Array.isArray(this.datos.tiposViviendaAISI)) {
      const filtered = this.datos.tiposViviendaAISI.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== this.datos.tiposViviendaAISI.length) {
        this.datos.tiposViviendaAISI = filtered;
        this.formularioService.actualizarDato('tiposViviendaAISI', filtered);
      }
    }

    // Condición de Ocupación
    if (this.datos?.condicionOcupacionAISI && Array.isArray(this.datos.condicionOcupacionAISI)) {
      const filtered = this.datos.condicionOcupacionAISI.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== this.datos.condicionOcupacionAISI.length) {
        this.datos.condicionOcupacionAISI = filtered;
        this.formularioService.actualizarDato('condicionOcupacionAISI', filtered);
      }
    }

    // Materiales de Vivienda
    if (this.datos?.materialesViviendaAISI && Array.isArray(this.datos.materialesViviendaAISI)) {
      const filtered = this.datos.materialesViviendaAISI.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== this.datos.materialesViviendaAISI.length) {
        this.datos.materialesViviendaAISI = filtered;
        this.formularioService.actualizarDato('materialesViviendaAISI', filtered);
      }
    }
  }
}

