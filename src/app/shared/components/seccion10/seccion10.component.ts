import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion10',
  templateUrl: './seccion10.component.html',
  styleUrls: ['./seccion10.component.css']
})
export class Seccion10Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'parrafoSeccion10_servicios_basicos_intro', 'abastecimientoAguaTabla', 'cuotaMensualAgua', 'tiposSaneamientoTabla', 'saneamientoTabla', 'coberturaElectricaTabla', 'empresaElectrica', 'costoElectricidadMinimo', 'costoElectricidadMaximo'];

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

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  getViviendasOcupadas(): string {
    if (!this.datos?.condicionOcupacionTabla || !Array.isArray(this.datos.condicionOcupacionTabla)) {
      return '____';
    }
    const ocupadas = this.datos.condicionOcupacionTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('ocupada') || item.categoria.toLowerCase().includes('ocupadas'))
    );
    return ocupadas?.casos || '____';
  }

  getPorcentajeAguaRedPublica(): string {
    if (!this.datos?.abastecimientoAguaTabla || !Array.isArray(this.datos.abastecimientoAguaTabla)) {
      return '____';
    }
    const redPublica = this.datos.abastecimientoAguaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('red pública')
    );
    return redPublica?.porcentaje || '____';
  }

  getPorcentajeAguaSinAbastecimiento(): string {
    if (!this.datos?.abastecimientoAguaTabla || !Array.isArray(this.datos.abastecimientoAguaTabla)) {
      return '____';
    }
    const sinAbastecimiento = this.datos.abastecimientoAguaTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sin abastecimiento') || item.categoria.toLowerCase().includes('no se abastece'))
    );
    return sinAbastecimiento?.porcentaje || '____';
  }

  getPorcentajeSaneamientoRedPublica(): string {
    const tabla = this.datos?.tiposSaneamientoTabla || this.datos?.saneamientoTabla;
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const redPublica = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('red pública')
    );
    return redPublica?.porcentaje || '____';
  }

  getPorcentajeSaneamientoSinSaneamiento(): string {
    const tabla = this.datos?.tiposSaneamientoTabla || this.datos?.saneamientoTabla;
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const sinSaneamiento = tabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sin saneamiento') || item.categoria.toLowerCase().includes('no posee'))
    );
    return sinSaneamiento?.porcentaje || '____';
  }

  getPorcentajeElectricidad(): string {
    if (!this.datos?.coberturaElectricaTabla || !Array.isArray(this.datos.coberturaElectricaTabla)) {
      return '____';
    }
    const conElectricidad = this.datos.coberturaElectricaTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('con acceso') || item.categoria.toLowerCase().includes('con electricidad'))
    );
    return conElectricidad?.porcentaje || '____';
  }

  getPorcentajeSinElectricidad(): string {
    if (!this.datos?.coberturaElectricaTabla || !Array.isArray(this.datos.coberturaElectricaTabla)) {
      return '____';
    }
    const sinElectricidad = this.datos.coberturaElectricaTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sin acceso') || item.categoria.toLowerCase().includes('sin electricidad'))
    );
    return sinElectricidad?.porcentaje || '____';
  }

  obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasDesechosSolidosVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      'fotografiaDesechosSolidos',
      groupPrefix
    );
  }

  getFotografiasElectricidadVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      'fotografiaElectricidad',
      groupPrefix
    );
  }
}

