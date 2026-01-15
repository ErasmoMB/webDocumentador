import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion9',
  templateUrl: './seccion9.component.html',
  styleUrls: ['./seccion9.component.css']
})
export class Seccion9Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'condicionOcupacionTabla', 'tiposMaterialesTabla', 'textoViviendas', 'textoEstructura'];
  
  override readonly PHOTO_PREFIX = 'fotografiaEstructura';

  condicionOcupacionConfig: TableConfig = {
    tablaKey: 'condicionOcupacionTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  tiposMaterialesConfig: TableConfig = {
    tablaKey: 'tiposMaterialesTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0%' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
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
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  getTotalViviendasEmpadronadas(): string {
    const total = this.datos?.tablaAISD2TotalViviendasEmpadronadas || this.datos?.totalViviendasEmpadronadas || '____';
    return total !== '____' && total !== null && total !== undefined ? total.toString() : '____';
  }

  getViviendasOcupadas(): string {
    const ocupadas = this.datos?.tablaAISD2TotalViviendasOcupadas || this.datos?.totalViviendasOcupadas || '____';
    return ocupadas !== '____' && ocupadas !== null && ocupadas !== undefined ? ocupadas.toString() : '____';
  }

  getPorcentajeViviendasOcupadas(): string {
    const totalEmpadronadas = parseInt(this.datos?.tablaAISD2TotalViviendasEmpadronadas || this.datos?.totalViviendasEmpadronadas || '0') || 0;
    const totalOcupadas = parseInt(this.datos?.tablaAISD2TotalViviendasOcupadas || this.datos?.totalViviendasOcupadas || '0') || 0;
    
    if (totalEmpadronadas === 0) {
      return '____';
    }
    
    const porcentaje = ((totalOcupadas / totalEmpadronadas) * 100).toFixed(2).replace('.', ',') + ' %';
    return porcentaje;
  }

  getPorcentajeMaterial(categoria: string, tipoMaterial: string): string {
    if (!this.datos?.tiposMaterialesTabla || !Array.isArray(this.datos.tiposMaterialesTabla)) {
      return '____';
    }
    const item = this.datos.tiposMaterialesTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase()) &&
      item.tipoMaterial && item.tipoMaterial.toLowerCase().includes(tipoMaterial.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasEstructuraVista(): FotoItem[] {
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

  onCondicionOcupacionFieldChange(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.condicionOcupacionConfig, index, field, value, false);
    if (field === 'casos' && this.datos['condicionOcupacionTabla'][index] && this.datos['condicionOcupacionTabla'][index].categoria !== 'Total') {
      const totalCasos = this.datos['condicionOcupacionTabla']
        .filter((item: any) => item.categoria !== 'Total')
        .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
      const totalItem = this.datos['condicionOcupacionTabla'].find((item: any) => item.categoria === 'Total');
      if (totalItem) {
        totalItem.casos = totalCasos;
        totalItem.porcentaje = '100,00 %';
      }
    }
    this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCondicionOcupacionTableUpdated() {
    this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTiposMaterialesTableUpdated() {
    this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos['tiposMaterialesTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  obtenerTextoViviendas(): string {
    if (this.datos.textoViviendas && this.datos.textoViviendas !== '____') {
      return this.datos.textoViviendas;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const totalViviendas = this.getTotalViviendasEmpadronadas();
    const viviendasOcupadas = this.getViviendasOcupadas();
    const porcentajeOcupadas = this.getPorcentajeViviendasOcupadas();
    
    return `Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${grupoAISD} se hallan un total de ${totalViviendas} viviendas empadronadas. De estas, solamente ${viviendasOcupadas} se encuentran ocupadas, representando un ${porcentajeOcupadas}. Cabe mencionar que, para poder describir el acápite de estructura de las viviendas de esta comunidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas.`;
  }

  obtenerTextoEstructura(): string {
    if (this.datos.textoEstructura && this.datos.textoEstructura !== '____') {
      return this.datos.textoEstructura;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const porcentajeAdobe = this.getPorcentajeMaterial('paredes', 'adobe');
    const porcentajeTriplayParedes = this.getPorcentajeMaterial('paredes', 'triplay');
    const porcentajeCalamina = this.getPorcentajeMaterial('techos', 'calamina');
    const porcentajeTriplayTechos = this.getPorcentajeMaterial('techos', 'triplay');
    const porcentajeTejas = this.getPorcentajeMaterial('techos', 'tejas');
    const porcentajeTierra = this.getPorcentajeMaterial('pisos', 'tierra');
    const porcentajeCemento = this.getPorcentajeMaterial('pisos', 'cemento');
    
    return `Según la información recabada de los Censos Nacionales 2017, dentro de la CC ${grupoAISD}, el material más empleado para la construcción de las paredes de las viviendas es el adobe, pues representa el ${porcentajeAdobe}. A ello le complementa el material de triplay / calamina / estera (${porcentajeTriplayParedes}).\n\nRespecto a los techos, destacan principalmente las planchas de calamina, fibra de cemento o similares con un ${porcentajeCalamina}. El porcentaje restante consiste en triplay / estera / carrizo (${porcentajeTriplayTechos}) y en tejas (${porcentajeTejas}).\n\nFinalmente, en cuanto a los pisos, la mayoría están hechos de tierra (${porcentajeTierra}). Por otra parte, el porcentaje restante (${porcentajeCemento}) consiste en cemento.`;
  }
}

