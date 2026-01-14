import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion29',
  templateUrl: './seccion29.component.html',
  styleUrls: ['./seccion29.component.css']
})
export class Seccion29Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['centroPobladoAISI', 'natalidadMortalidadCpTabla', 'morbilidadCpTabla'];
  fotografiasInstitucionalidadCache: any[] = [];

  constructor(
    private formularioService: FormularioService,
    private fieldMapping: FieldMappingService,
    private sectionDataLoader: SectionDataLoaderService,
    private cdRef: ChangeDetectorRef,
    private imageService: ImageManagementService
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    this.actualizarFotografiasCache();
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

  private loadSectionData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (fieldsToLoad.length > 0) {
      this.sectionDataLoader.loadSectionData(this.seccionId, fieldsToLoad).subscribe();
    }
  }

  getDataSourceType(fieldName: string): 'manual' | 'automatic' | 'section' {
    return this.fieldMapping.getDataSourceType(fieldName);
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

  actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.8');
    return this.imageService.loadImages('3.1.4.B.1.8', 'fotografiaCahuachoB18', groupPrefix);
  }
}

