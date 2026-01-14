import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion7',
  templateUrl: './seccion7.component.html',
  styleUrls: ['./seccion7.component.css']
})
export class Seccion7Component implements OnInit, OnDestroy, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosSubscription?: Subscription;
  private actualizandoDatos: boolean = false;
  private datosAnteriores: any = {};
  watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'poblacionDistritalCahuacho', 'petDistritalCahuacho', 'ingresoFamiliarPerCapita', 'rankingIngresoPerCapita', 'petTabla', 'peaTabla', 'peaOcupadaTabla'];

  constructor(
    private formularioService: FormularioService,
    private fieldMapping: FieldMappingService,
    private sectionDataLoader: SectionDataLoaderService,
    private stateService: StateService,
    private imageService: ImageManagementService,
    private photoNumberingService: PhotoNumberingService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    this.loadSectionData();
    this.asegurarArraysValidos();
    
    this.datosSubscription = this.stateService.datos$.pipe(
      debounceTime(100),
      distinctUntilChanged((prev, curr) => {
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        const prevStr = JSON.stringify(prev);
        const currStr = JSON.stringify(curr);
        return prevStr === currStr;
      })
    ).subscribe((nuevosDatos) => {
      if (this.actualizandoDatos) return;
      if (!nuevosDatos) return;
      
      const datosAnteriores = JSON.stringify(this.datos);
      this.actualizandoDatos = true;
      this.actualizarDatos();
      this.asegurarArraysValidos();
      const datosNuevos = JSON.stringify(this.datos);
      
      if (datosAnteriores !== datosNuevos) {
        setTimeout(() => {
          this.cdRef.detectChanges();
          this.actualizandoDatos = false;
        }, 0);
      } else {
        this.actualizandoDatos = false;
      }
    });
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

  asegurarArraysValidos() {
    if (!Array.isArray(this.datos.petTabla)) {
      this.datos.petTabla = [];
    }
    if (!Array.isArray(this.datos.peaTabla)) {
      this.datos.peaTabla = [];
    }
    if (!Array.isArray(this.datos.peaOcupadaTabla)) {
      this.datos.peaOcupadaTabla = [];
    }
  }

  ngOnDestroy() {
    if (this.datosSubscription) {
      this.datosSubscription.unsubscribe();
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

  getPorcentajePET(): string {
    if (!this.datos?.petTabla || !Array.isArray(this.datos.petTabla)) {
      return '____';
    }
    const total = this.datos.petTabla.find((item: any) => item.categoria === 'Total');
    return total?.porcentaje || '____';
  }

  getPorcentajePETGrupo(categoria: string): string {
    if (!this.datos?.petTabla || !Array.isArray(this.datos.petTabla)) {
      return '____';
    }
    const grupo = this.datos.petTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return grupo?.porcentaje || '____';
  }

  getPorcentajePEA(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const pea = this.datos.peaTabla.find((item: any) => item.categoria === 'PEA');
    return pea?.porcentaje || '____';
  }

  getPorcentajeNoPEA(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const noPea = this.datos.peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentaje || '____';
  }

  getPorcentajePEAHombres(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const pea = this.datos.peaTabla.find((item: any) => item.categoria === 'PEA');
    return pea?.porcentajeHombres || '____';
  }

  getPorcentajeNoPEAMujeres(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const noPea = this.datos.peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentajeMujeres || '____';
  }

  getPorcentajePEADesocupada(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const desocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('desocupada')
    );
    return desocupada?.porcentaje || '____';
  }

  getPorcentajePEAOcupadaHombres(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeHombres || '____';
  }

  getPorcentajePEAOcupadaMujeres(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeMujeres || '____';
  }

  trackByIndex(index: number): number {
    return index;
  }

  obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasPEAVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      'fotografiaPEA',
      groupPrefix
    );
  }
}

