import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion23',
  templateUrl: './seccion23.component.html',
  styleUrls: ['./seccion23.component.css']
})
export class Seccion23Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'distritoSeleccionado', 'petGruposEdadAISI', 'peaDistritoSexoTabla', 'peaOcupadaDesocupadaTabla', 'poblacionDistritalAISI', 'petDistritalAISI', 'ingresoPerCapitaAISI', 'rankingIngresoAISI', 'textoPEAAISI', 'textoPET_AISI', 'textoIndicadoresDistritalesAISI', 'textoPEA_AISI', 'textoAnalisisPEA_AISI', 'textoEmpleoAISI', 'textoIngresosAISI', 'textoIndiceDesempleoAISI'];
  
  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  
  fotografiasInstitucionalidadCache: any[] = [];

  petGruposEdadConfig: TableConfig = {
    tablaKey: 'petGruposEdadAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: '', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  peaDistritoSexoConfig: TableConfig = {
    tablaKey: 'peaDistritoSexoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: false,
    camposParaCalcular: []
  };

  peaOcupadaDesocupadaConfig: TableConfig = {
    tablaKey: 'peaOcupadaDesocupadaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: false,
    camposParaCalcular: []
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

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  override actualizarFotografiasFormMulti() {
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

  onFotografiasPEAChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
  }


  getPorcentajePET(): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) {
      return '____';
    }
    const totalItem = this.datos.petGruposEdadAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    if (!totalItem) {
      return '____';
    }
    const totalPET = totalItem.casos;
    const totalPoblacion = this.datos?.poblacionSexoAISI?.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('total')
    )?.casos || 160;
    if (!totalPoblacion || totalPoblacion === 0) {
      return '____';
    }
    const porcentaje = ((totalPET / totalPoblacion) * 100).toFixed(2);
    return porcentaje + ' %';
  }

  getPorcentajeGrupoPET(categoria: string): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) {
      return '____';
    }
    const item = this.datos.petGruposEdadAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  getPoblacionDistrital(): string {
    return this.datos?.poblacionDistritalAISI || '610';
  }

  obtenerTextoPET_AISI(): string {
    if (this.datos.textoPET_AISI && this.datos.textoPET_AISI !== '____') {
      return this.datos.textoPET_AISI;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const porcentajePET = this.getPorcentajePET();
    const porcentaje4564 = this.getPorcentajeGrupoPET('45 a 64');
    const porcentaje65 = this.getPorcentajeGrupoPET('65');
    
    return `La población en edad de trabajar (PET) en el CP ${centroPoblado} representa un ${porcentajePET} de la población total y está soportada en su mayoría por el grupo etario de 45 a 64 años, puesto que son el ${porcentaje4564} de la PET. El bloque de edad con menor cantidad de miembros es el de 65 años a más, puesto que representa solamente el ${porcentaje65} de la PET.`;
  }

  obtenerTextoIndicadoresDistritalesAISI(): string {
    if (this.datos.textoIndicadoresDistritalesAISI && this.datos.textoIndicadoresDistritalesAISI !== '____') {
      return this.datos.textoIndicadoresDistritalesAISI;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const poblacionDistrital = this.getPoblacionDistrital();
    const petDistrital = this.getPETDistrital();
    
    return `No obstante, los indicadores de la Población Económicamente Activa (PEA), tanto de su cantidad total como por subgrupos (Ocupada y Desocupada), se describen a nivel distrital siguiendo la información oficial de la publicación "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI. Para ello es importante tomar en cuenta que la población distrital de ${distrito}, jurisdicción donde se ubica el AISD en cuestión, es de ${poblacionDistrital} personas, y que la PET (de 14 años a más) al mismo nivel está conformada por ${petDistrital} personas.`;
  }

  obtenerTextoPEA_AISI(): string {
    if (this.datos.textoPEA_AISI && this.datos.textoPEA_AISI !== '____') {
      return this.datos.textoPEA_AISI;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social de cualquier jurisdicción al nivel que se requiera. En este apartado, se presenta una descripción de la PEA del distrito de ${distrito}, jurisdicción que abarca a su capital distrital, el CP ${centroPoblado}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población en capacidad de trabajar en el distrito en cuestión.`;
  }

  obtenerTextoAnalisisPEA_AISI(): string {
    if (this.datos.textoAnalisisPEA_AISI && this.datos.textoAnalisisPEA_AISI !== '____') {
      return this.datos.textoAnalisisPEA_AISI;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const porcentajePEA = this.getPorcentajePEA();
    const porcentajeNoPEA = this.getPorcentajeNoPEA();
    const porcentajeHombresPEA = this.getPorcentajeHombresPEA();
    const porcentajeMujeresNoPEA = this.getPorcentajeMujeresNoPEA();
    
    return `Del cuadro precedente, se aprecia que la PEA del distrito de ${distrito} representa un ${porcentajePEA} del total de la PET de la jurisdicción, mientras que la No PEA abarca el ${porcentajeNoPEA} restante. Asimismo, se visualiza que los hombres se hallan predominantemente dentro de la PEA, pues el ${porcentajeHombresPEA} se halla en esta categoría. Por otro lado, la mayor parte de las mujeres se hallan en el indicador de No PEA con un ${porcentajeMujeresNoPEA}.`;
  }

  obtenerTextoEmpleoAISI(): string {
    if (this.datos.textoEmpleoAISI && this.datos.textoEmpleoAISI !== '____') {
      return this.datos.textoEmpleoAISI;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    
    return `La mayor parte de la población de la capital distrital de ${distrito} se dedica a actividades agropecuarias, siendo la agricultura y la ganadería las principales fuentes de empleo independiente. En el sector agrícola, los cultivos predominantes son la papa, cebada, habas, trigo y oca, productos que abastecen tanto el consumo local como el comercio en menor medida. Asimismo, la ganadería juega un papel importante, con la crianza de vacunos y ovinos como las principales actividades ganaderas de la zona. Aunque en menor proporción, algunos pobladores también se dedican al comercio, complementando así su ingreso económico.\n\nEn cuanto al empleo dependiente, este sector es reducido y está conformado principalmente por trabajadores de la municipalidad distrital, quienes cumplen funciones administrativas y operativas; el personal de las instituciones educativas que ofrecen servicios de enseñanza en la localidad; y los empleados del puesto de salud que brindan atención básica a los habitantes. Este tipo de empleo proporciona estabilidad a un pequeño grupo de la población, pero no es la fuente principal de ingresos entre los habitantes. En general, el empleo independiente predomina como el principal medio de subsistencia para la mayoría de los pobladores.`;
  }

  obtenerTextoIngresosAISI(): string {
    if (this.datos.textoIngresosAISI && this.datos.textoIngresosAISI !== '____') {
      return this.datos.textoIngresosAISI;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const ingresoPerCapita = this.getIngresoPerCapita();
    const rankingIngreso = this.getRankingIngreso();
    
    return `Los ingresos de la población en la capital distrital de ${distrito} están estrechamente relacionados con las actividades agropecuarias, las cuales constituyen la base económica de la localidad. La agricultura, en particular, proporciona una fuente regular de alimentos y productos que, en su mayoría, se destinan al autoconsumo, mientras que un porcentaje menor es comercializado. Los ingresos provenientes de la ganadería dependen de la venta de animales en pie, especialmente vacunos y ovinos, así como de productos derivados como el queso, el cual se vende a intermediarios. Sin embargo, las fluctuaciones en los precios del mercado, así como las limitaciones en infraestructura y acceso a mercados directos, afectan los ingresos de los habitantes, generando una inestabilidad económica.\n\nAquellos que trabajan de manera dependiente, como los empleados municipales, profesores y personal del puesto de salud, tienen ingresos más regulares. Sin embargo, debido a que este sector representa una pequeña proporción de la población, sus ingresos no son significativos en la economía general de la localidad, mucho menos del distrito. Además, el acceso a empleos dependientes es limitado y no logra cubrir las necesidades de una mayor parte de la población.\n\nAdicionalmente, cabe mencionar que, según el informe del PNUD 2019, el distrito de ${distrito} (jurisdicción que abarca al CP ${centroPoblado}) cuenta con un ingreso familiar per cápita de S/. ${ingresoPerCapita} mensuales, ocupando el puesto N°${rankingIngreso} en el ranking de dicha variable, lo que convierte a dicha jurisdicción en una de las que cuentan con menor ingreso familiar per cápita en todo el país.`;
  }

  obtenerTextoIndiceDesempleoAISI(): string {
    if (this.datos.textoIndiceDesempleoAISI && this.datos.textoIndiceDesempleoAISI !== '____') {
      return this.datos.textoIndiceDesempleoAISI;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `El índice de desempleo es un indicador clave para evaluar la salud económica de una jurisdicción de cualquier nivel, ya que refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en busca de empleo, pero no logra obtenerlo. En este ítem, se caracteriza el índice de desempleo del distrito de ${distrito}, el cual abarca al CP ${centroPoblado} (capital distrital). Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población que forma parte de la PEA y distinguir entre sus subgrupos (Ocupada y Desocupada).`;
  }

  obtenerTextoPEAAISI(): string {
    if (this.datos.textoPEAAISI && this.datos.textoPEAAISI !== '____') {
      return this.datos.textoPEAAISI;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const porcentajeDesempleo = this.getPorcentajeDesempleo();
    const porcentajeHombresOcupados = this.getPorcentajeHombresOcupados();
    const porcentajeMujeresOcupadas = this.getPorcentajeMujeresOcupadas();
    
    return `Del cuadro precedente, se halla que en el distrito de ${distrito} la PEA Desocupada representa un ${porcentajeDesempleo} del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada, con porcentajes de ${porcentajeHombresOcupados} y ${porcentajeMujeresOcupadas}, respectivamente.`;
  }

  getPETDistrital(): string {
    return this.datos?.petDistritalAISI || '461';
  }

  getPorcentajePEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeNoPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('no pea')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHombresPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no')
    );
    return item?.porcentajeHombres || '____';
  }

  getPorcentajeMujeresNoPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('no pea')
    );
    return item?.porcentajeMujeres || '____';
  }

  getIngresoPerCapita(): string {
    return this.datos?.ingresoPerCapitaAISI || '391,06';
  }

  getRankingIngreso(): string {
    return this.datos?.rankingIngresoAISI || '1191';
  }

  getPorcentajeDesempleo(): string {
    if (!this.datos?.peaOcupadaDesocupadaTabla || !Array.isArray(this.datos.peaOcupadaDesocupadaTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('desocupada')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHombresOcupados(): string {
    if (!this.datos?.peaOcupadaDesocupadaTabla || !Array.isArray(this.datos.peaOcupadaDesocupadaTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada')
    );
    return item?.porcentajeHombres || '____';
  }

  getPorcentajeMujeresOcupadas(): string {
    if (!this.datos?.peaOcupadaDesocupadaTabla || !Array.isArray(this.datos.peaOcupadaDesocupadaTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada')
    );
    return item?.porcentajeMujeres || '____';
  }

  // Eliminar métodos de cache y eventos de cambio de fotos

  override getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }


  inicializarPETGruposEdadAISI() {
    if (!this.datos['petGruposEdadAISI'] || this.datos['petGruposEdadAISI'].length === 0) {
      this.datos['petGruposEdadAISI'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarPETGruposEdadAISI() {
    if (!this.datos['petGruposEdadAISI']) {
      this.inicializarPETGruposEdadAISI();
    }
    this.datos['petGruposEdadAISI'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
    this.calcularPorcentajesPETGruposEdadAISI();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarPETGruposEdadAISI(index: number) {
    if (this.datos['petGruposEdadAISI'] && this.datos['petGruposEdadAISI'].length > 1) {
      const item = this.datos['petGruposEdadAISI'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['petGruposEdadAISI'].splice(index, 1);
        this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
        this.calcularPorcentajesPETGruposEdadAISI();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPETGruposEdadAISI(index: number, field: string, value: any) {
    if (!this.datos['petGruposEdadAISI']) {
      this.inicializarPETGruposEdadAISI();
    }
    if (this.datos['petGruposEdadAISI'][index]) {
      this.datos['petGruposEdadAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesPETGruposEdadAISI();
      }
      this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPETGruposEdadAISI() {
    if (!this.datos['petGruposEdadAISI'] || this.datos['petGruposEdadAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['petGruposEdadAISI'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['petGruposEdadAISI'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarPEADistritoSexo() {
    this.tableService.inicializarTabla(this.datos, this.peaDistritoSexoConfig);
    this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
    this.cdRef.detectChanges();
  }

  agregarPEADistritoSexo() {
    this.tableService.agregarFila(this.datos, this.peaDistritoSexoConfig);
    this.calcularPorcentajesPEADistritoSexo();
    this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarPEADistritoSexo(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.peaDistritoSexoConfig, index);
    if (deleted) {
      this.calcularPorcentajesPEADistritoSexo();
      this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEADistritoSexo(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.peaDistritoSexoConfig, index, field, value, false);
    if (field === 'hombres' || field === 'mujeres' || field === 'casos') {
      this.calcularPorcentajesPEADistritoSexo();
    }
    this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesPEADistritoSexo() {
    if (!this.datos['peaDistritoSexoTabla'] || this.datos['peaDistritoSexoTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['peaDistritoSexoTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const totalHombres = totalItem ? parseFloat(totalItem.hombres) || 0 : 0;
    const totalMujeres = totalItem ? parseFloat(totalItem.mujeres) || 0 : 0;
    const totalCasos = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    this.datos['peaDistritoSexoTabla'].forEach((item: any) => {
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        const hombres = parseFloat(item.hombres) || 0;
        const mujeres = parseFloat(item.mujeres) || 0;
        const casos = parseFloat(item.casos) || 0;
        
        if (totalHombres > 0) {
          const porcentajeHombres = ((hombres / totalHombres) * 100).toFixed(2);
          item.porcentajeHombres = porcentajeHombres + ' %';
        }
        if (totalMujeres > 0) {
          const porcentajeMujeres = ((mujeres / totalMujeres) * 100).toFixed(2);
          item.porcentajeMujeres = porcentajeMujeres + ' %';
        }
        if (totalCasos > 0) {
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      }
    });
  }

  inicializarPEAOcupadaDesocupada() {
    this.tableService.inicializarTabla(this.datos, this.peaOcupadaDesocupadaConfig);
    this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
    this.cdRef.detectChanges();
  }

  agregarPEAOcupadaDesocupada() {
    this.tableService.agregarFila(this.datos, this.peaOcupadaDesocupadaConfig);
    this.calcularPorcentajesPEAOcupadaDesocupada();
    this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarPEAOcupadaDesocupada(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.peaOcupadaDesocupadaConfig, index);
    if (deleted) {
      this.calcularPorcentajesPEAOcupadaDesocupada();
      this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEAOcupadaDesocupada(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.peaOcupadaDesocupadaConfig, index, field, value, false);
    if (field === 'hombres' || field === 'mujeres' || field === 'casos') {
      this.calcularPorcentajesPEAOcupadaDesocupada();
    }
    this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesPEAOcupadaDesocupada() {
    if (!this.datos['peaOcupadaDesocupadaTabla'] || this.datos['peaOcupadaDesocupadaTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['peaOcupadaDesocupadaTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const totalHombres = totalItem ? parseFloat(totalItem.hombres) || 0 : 0;
    const totalMujeres = totalItem ? parseFloat(totalItem.mujeres) || 0 : 0;
    const totalCasos = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    this.datos['peaOcupadaDesocupadaTabla'].forEach((item: any) => {
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        const hombres = parseFloat(item.hombres) || 0;
        const mujeres = parseFloat(item.mujeres) || 0;
        const casos = parseFloat(item.casos) || 0;
        
        if (totalHombres > 0) {
          const porcentajeHombres = ((hombres / totalHombres) * 100).toFixed(2);
          item.porcentajeHombres = porcentajeHombres + ' %';
        }
        if (totalMujeres > 0) {
          const porcentajeMujeres = ((mujeres / totalMujeres) * 100).toFixed(2);
          item.porcentajeMujeres = porcentajeMujeres + ' %';
        }
        if (totalCasos > 0) {
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      }
    });
  }
}

