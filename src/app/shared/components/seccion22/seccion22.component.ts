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
  selector: 'app-seccion22',
  templateUrl: './seccion22.component.html',
  styleUrls: ['./seccion22.component.css']
})
export class Seccion22Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  fotografiasInstitucionalidadCache: any[] = [];
  override watchedFields: string[] = ['centroPobladoAISI', 'poblacionSexoAISI', 'poblacionEtarioAISI', 'textoDemografiaAISI', 'textoGrupoEtarioAISI'];
  
  readonly PHOTO_PREFIX_CAHUACHO_B11 = 'fotografiaCahuachoB11';
  
  fotografiasCahuachoB11FormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';

  poblacionSexoAISIConfig: TableConfig = {
    tablaKey: 'poblacionSexoAISI',
    totalKey: 'sexo',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ sexo: '', casos: 0, porcentaje: '0,00 %' }]
  };

  poblacionEtarioAISIConfig: TableConfig = {
    tablaKey: 'poblacionEtarioAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }]
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
    this.actualizarFotografiasCache();
    this.actualizarFotografiasFormMulti();
    this.eliminarFilasTotal();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private eliminarFilasTotal(): void {
    // Eliminar filas Total de poblacionSexoAISI
    if (this.datos['poblacionSexoAISI'] && Array.isArray(this.datos['poblacionSexoAISI'])) {
      const longitudOriginal = this.datos['poblacionSexoAISI'].length;
      this.datos['poblacionSexoAISI'] = this.datos['poblacionSexoAISI'].filter((item: any) => {
        const sexo = item.sexo?.toString().toLowerCase() || '';
        return !sexo.includes('total');
      });
      if (this.datos['poblacionSexoAISI'].length !== longitudOriginal) {
        this.formularioService.actualizarDato('poblacionSexoAISI', this.datos['poblacionSexoAISI']);
        this.cdRef.detectChanges();
      }
    }

    // Eliminar filas Total de poblacionEtarioAISI
    if (this.datos['poblacionEtarioAISI'] && Array.isArray(this.datos['poblacionEtarioAISI'])) {
      const longitudOriginal = this.datos['poblacionEtarioAISI'].length;
      this.datos['poblacionEtarioAISI'] = this.datos['poblacionEtarioAISI'].filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (this.datos['poblacionEtarioAISI'].length !== longitudOriginal) {
        this.formularioService.actualizarDato('poblacionEtarioAISI', this.datos['poblacionEtarioAISI']);
        this.cdRef.detectChanges();
      }
    }
  }

  getPoblacionSexoSinTotal(): any[] {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return [];
    }
    return this.datos.poblacionSexoAISI.filter((item: any) => {
      const sexo = item.sexo?.toString().toLowerCase() || '';
      return !sexo.includes('total');
    });
  }

  getTotalPoblacionSexo(): string {
    const filtered = this.getPoblacionSexoSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getPoblacionEtarioSinTotal(): any[] {
    if (!this.datos?.poblacionEtarioAISI || !Array.isArray(this.datos.poblacionEtarioAISI)) {
      return [];
    }
    return this.datos.poblacionEtarioAISI.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPoblacionEtario(): string {
    const filtered = this.getPoblacionEtarioSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
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

  getTablaKeyPoblacionSexo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `poblacionSexoAISI${prefijo}` : 'poblacionSexoAISI';
  }

  getTablaKeyPoblacionEtario(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `poblacionEtarioAISI${prefijo}` : 'poblacionEtarioAISI';
  }

  getFieldIdTextoDemografia(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoDemografiaAISI${prefijo}` : 'textoDemografiaAISI';
  }

  getFieldIdTextoGrupoEtario(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoGrupoEtarioAISI${prefijo}` : 'textoGrupoEtarioAISI';
  }

  protected override tieneFotografias(): boolean {
    return false;
  }

  getTotalPoblacion(): string {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return '____';
    }
    const totalItem = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('total')
    );
    return totalItem?.casos?.toString() || '____';
  }

  getPorcentajeMujeres(): string {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return '____';
    }
    const item = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('mujer')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHombres(): string {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return '____';
    }
    const item = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('hombre')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeGrupoEtario(categoria: string): string {
    if (!this.datos?.poblacionEtarioAISI || !Array.isArray(this.datos.poblacionEtarioAISI)) {
      return '____';
    }
    const item = this.datos.poblacionEtarioAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  override getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.1');
    return this.imageService.loadImages(
      '3.1.4.B.1.1',
      this.PHOTO_PREFIX_CAHUACHO_B11,
      groupPrefix
    );
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.1');
    this.fotografiasCahuachoB11FormMulti = this.imageService.loadImages(
      '3.1.4.B.1.1',
      this.PHOTO_PREFIX_CAHUACHO_B11,
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
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_CAHUACHO_B11, fotografias);
    this.fotografiasFormMulti = [...fotografias];
  }

  obtenerTextoDemografiaAISI(): string {
    if (this.datos.textoDemografiaAISI && this.datos.textoDemografiaAISI !== '____') {
      return this.datos.textoDemografiaAISI;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const totalPoblacion = this.getTotalPoblacion();
    const porcentajeMujeres = this.getPorcentajeMujeres();
    const porcentajeHombres = this.getPorcentajeHombres();
    
    return `Respecto a la población del CP ${centroPoblado}, tomando en cuenta los Censos Nacionales 2017, existen ${totalPoblacion} habitantes que viven permanentemente en la localidad. De este conjunto, el ${porcentajeMujeres} son mujeres, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares masculinos (${porcentajeHombres}).`;
  }

  obtenerTextoGrupoEtarioAISI(): string {
    if (this.datos.textoGrupoEtarioAISI && this.datos.textoGrupoEtarioAISI !== '____') {
      return this.datos.textoGrupoEtarioAISI;
    }
    
    const porcentaje014 = this.getPorcentajeGrupoEtario('0 a 14');
    const porcentaje4564 = this.getPorcentajeGrupoEtario('45 a 64');
    const porcentaje1529 = this.getPorcentajeGrupoEtario('15 a 29');
    
    return `En una clasificación por grupos etarios se puede observar que esta población se encuentra mayoritariamente en la categoría de 0 a 14 años, representando el ${porcentaje014} del conjunto total. En segundo lugar, cerca del primer bloque se halla la categoría de 45 a 64 años (${porcentaje4564}). En cuanto al bloque etario minoritario, hay una igualdad entre aquellos que van de 15 a 29 años y los de 65 años a más, pues ambos grupos representan el ${porcentaje1529} cada uno.`;
  }
}

