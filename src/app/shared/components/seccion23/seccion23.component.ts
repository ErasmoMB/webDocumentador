import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion23',
  templateUrl: './seccion23.component.html',
  styleUrls: ['./seccion23.component.css']
})
export class Seccion23Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['centroPobladoAISI', 'distritoSeleccionado', 'petGruposEdadAISI', 'peaDistritoSexoTabla', 'peaOcupadaDesocupadaTabla'];
  fotografiasInstitucionalidadCache: any[] = [];

  constructor(
    private formularioService: FormularioService,
    private fieldMapping: FieldMappingService,
    private sectionDataLoader: SectionDataLoaderService,
    private imageService: ImageManagementService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    this.loadSectionData();
    this.actualizarFotografiasCache();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seccionId']) {
      this.actualizarDatos();
      this.loadSectionData();
    }
  }

  ngDoCheck() {
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
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    this.actualizarValoresConPrefijo();
    this.actualizarFotografiasCache();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = JSON.parse(JSON.stringify((this.datos as any)[campo] || null));
    });
    this.cdRef.detectChanges();
  }

  actualizarValoresConPrefijo() {
    const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centroPobladoAISI || null;
    this.datosAnteriores.centroPobladoAISI = centroPobladoAISI || null;
  }

  actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  private loadSectionData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (fieldsToLoad.length > 0) {
      this.sectionDataLoader.loadSectionData(this.seccionId, fieldsToLoad).subscribe();
    }
  }

  getDataSourceType(fieldName: string): 'manual' | 'automatic' | 'section' {
    return this.fieldMapping.getDataSourceType(fieldName);
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

  getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.2');
    return this.imageService.loadImages(
      '3.1.4.B.1.2',
      'fotografiaCahuachoB12',
      groupPrefix
    );
  }

  // Copia local de la validación de imagen para evitar acceso a método privado
  isValidImage(imagen: any): boolean {
    if (!imagen) return false;
    if (typeof imagen === 'string') {
      return imagen.startsWith('data:image');
    }
    if (imagen instanceof File) {
      return imagen.type.startsWith('image/');
    }
    return false;
  }
}

