import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion26',
  templateUrl: './seccion26.component.html',
  styleUrls: ['./seccion26.component.css']
})
export class Seccion26Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.5';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'condicionOcupacionAISI', 'materialesViviendaAISI', 'abastecimientoAguaCpTabla', 'saneamientoCpTabla', 'coberturaElectricaCpTabla', 'combustiblesCocinarCpTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB15';
  
  fotografiasInstitucionalidadCache: any[] = [];

  abastecimientoAguaConfig: TableConfig = {
    tablaKey: 'abastecimientoAguaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  saneamientoConfig: TableConfig = {
    tablaKey: 'saneamientoCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  coberturaElectricaConfig: TableConfig = {
    tablaKey: 'coberturaElectricaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  combustiblesCocinarConfig: TableConfig = {
    tablaKey: 'combustiblesCocinarCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
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
    this.fotografiasCache = [...fotografias];
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

  getFotoDesechosSolidosParaImageUpload(): FotoItem[] {
    const foto = this.getFotoDesechosSolidos();
    if (!foto.ruta) {
      return [];
    }
    return [{
      titulo: foto.titulo,
      fuente: foto.fuente,
      imagen: foto.ruta
    }];
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

  getFotoElectricidadParaImageUpload(): FotoItem[] {
    const foto = this.getFotoElectricidad();
    if (!foto.ruta) {
      return [];
    }
    return [{
      titulo: foto.titulo,
      fuente: foto.fuente,
      imagen: foto.ruta
    }];
  }

  obtenerTextoServiciosAguaAISI(): string {
    return this.datos.textoServiciosAguaAISI || '';
  }

  obtenerTextoDesechosSolidosCP(): string {
    return this.datos.textoDesechosSolidosCP || '';
  }

  obtenerTextoEnergiaCocinarCP(): string {
    return this.datos.textoEnergiaCocinarCP || '';
  }
}

