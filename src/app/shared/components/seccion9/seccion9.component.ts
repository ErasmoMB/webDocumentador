import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion9',
  templateUrl: './seccion9.component.html',
  styleUrls: ['./seccion9.component.css']
})
export class Seccion9Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['grupoAISD', 'condicionOcupacionTabla', 'tiposMaterialesTabla'];

  constructor(
    private formularioService: FormularioService,
    private fieldMapping: FieldMappingService,
    private sectionDataLoader: SectionDataLoaderService,
    private imageService: ImageManagementService,
    private photoNumberingService: PhotoNumberingService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    this.loadSectionData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seccionId']) {
      this.actualizarDatos();
      this.loadSectionData();
    }
  }

  ngDoCheck() {
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
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    this.actualizarValoresConPrefijo();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = JSON.parse(JSON.stringify((this.datos as any)[campo] || null));
    });
    this.cdRef.detectChanges();
  }

  actualizarValoresConPrefijo() {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
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

  obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasEstructuraVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      'fotografiaEstructura',
      groupPrefix
    );
  }
}

