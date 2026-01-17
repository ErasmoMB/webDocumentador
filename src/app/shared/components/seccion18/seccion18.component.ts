import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  selector: 'app-seccion18',
  templateUrl: './seccion18.component.html',
  styleUrls: ['./seccion18.component.css']
})
export class Seccion18Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'nbiCCAyrocaTabla', 'nbiDistritoCahuachoTabla', 'textoNecesidadesBasicasInsatisfechas'];
  
  override readonly PHOTO_PREFIX = 'fotografiaNBI';

  nbiCCAyrocaConfig: TableConfig = {
    tablaKey: 'nbiCCAyrocaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  nbiDistritoCahuachoConfig: TableConfig = {
    tablaKey: 'nbiDistritoCahuachoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
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
    private stateService: StateService,
    private sanitizer: DomSanitizer
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    this.eliminarFilasTotal();
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getTablaKeyNbiCC(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `nbiCCAyrocaTabla${prefijo}` : 'nbiCCAyrocaTabla';
  }

  getTablaKeyNbiDistrito(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `nbiDistritoCahuachoTabla${prefijo}` : 'nbiDistritoCahuachoTabla';
  }

  getFieldIdTextoNBI(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoNecesidadesBasicasInsatisfechas${prefijo}` : 'textoNecesidadesBasicasInsatisfechas';
  }

  private eliminarFilasTotal(): void {
    // Eliminar filas Total de nbiCCAyrocaTabla
    if (this.datos['nbiCCAyrocaTabla'] && Array.isArray(this.datos['nbiCCAyrocaTabla'])) {
      const longitudOriginal = this.datos['nbiCCAyrocaTabla'].length;
      this.datos['nbiCCAyrocaTabla'] = this.datos['nbiCCAyrocaTabla'].filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (this.datos['nbiCCAyrocaTabla'].length !== longitudOriginal) {
        this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos['nbiCCAyrocaTabla']);
        this.cdRef.detectChanges();
      }
    }

    // Eliminar filas Total de nbiDistritoCahuachoTabla
    if (this.datos['nbiDistritoCahuachoTabla'] && Array.isArray(this.datos['nbiDistritoCahuachoTabla'])) {
      const longitudOriginal = this.datos['nbiDistritoCahuachoTabla'].length;
      this.datos['nbiDistritoCahuachoTabla'] = this.datos['nbiDistritoCahuachoTabla'].filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (this.datos['nbiDistritoCahuachoTabla'].length !== longitudOriginal) {
        this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos['nbiDistritoCahuachoTabla']);
        this.cdRef.detectChanges();
      }
    }
  }

  getNbiCCAyrocaSinTotal(): any[] {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return [];
    }
    return this.datos.nbiCCAyrocaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalNbiCCAyroca(): string {
    const filtered = this.getNbiCCAyrocaSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getNbiDistritoCahuachoSinTotal(): any[] {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return [];
    }
    return this.datos.nbiDistritoCahuachoTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalNbiDistritoCahuacho(): string {
    const filtered = this.getNbiDistritoCahuachoSinTotal();
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

  getTotalPersonasCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const totalItem = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    return totalItem?.casos || '____';
  }

  getPorcentajeHacinamientoCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const item = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('hacinamiento')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeSinServiciosCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const item = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getTotalUnidadesDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const totalItem = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    return totalItem?.casos || '____';
  }

  obtenerTextoNecesidadesBasicasInsatisfechas(): string {
    if (this.datos.textoNecesidadesBasicasInsatisfechas && this.datos.textoNecesidadesBasicasInsatisfechas !== '____') {
      return this.datos.textoNecesidadesBasicasInsatisfechas;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
    const totalPersonas = this.getTotalPersonasCC();
    const porcentajeHacinamiento = this.getPorcentajeHacinamientoCC();
    const porcentajeSinServicios = this.getPorcentajeSinServiciosCC();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const totalUnidades = this.getTotalUnidadesDistrito();
    const porcentajeSinServiciosDistrito = this.getPorcentajeSinServiciosDistrito();
    const porcentajeHacinamientoDistrito = this.getPorcentajeHacinamientoDistrito();
    
    return `En primer lugar, cabe mencionar que en la CC ${grupoAISD} se halla un total de ${totalPersonas} personas residentes en viviendas particulares. De este conjunto, se observa que la NBI más frecuente, según población, es la de viviendas con hacinamiento (${porcentajeHacinamiento}), seguido de la de viviendas sin servicios higiénicos (${porcentajeSinServicios}).\n\nPor otro lado, a nivel distrital de ${distrito}, de un total de ${totalUnidades} unidades de análisis, se sabe que el tipo de NBI más frecuente es la de viviendas sin servicios higiénicos (${porcentajeSinServiciosDistrito}), seguida de la de viviendas con hacinamiento (${porcentajeHacinamientoDistrito}). En ese sentido, se aprecia que el orden de las dos NBI mayoritarias es inverso al comparar a la CC ${grupoAISD} con el distrito de ${distrito}.`;
  }

  getPorcentajeSinServiciosDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const item = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHacinamientoDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const item = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('hacinamiento')
    );
    return item?.porcentaje || '____';
  }

  getFotografiasNBIVista(): FotoItem[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return this.fotografiasCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  obtenerTextoNBIConResaltado(): SafeHtml {
    const texto = this.obtenerTextoNecesidadesBasicasInsatisfechas();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const totalPersonas = this.getTotalPersonasCC();
    const porcentajeHacinamiento = this.getPorcentajeHacinamientoCC();
    const porcentajeSinServicios = this.getPorcentajeSinServiciosCC();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const totalUnidades = this.getTotalUnidadesDistrito();
    const porcentajeSinServiciosDistrito = this.getPorcentajeSinServiciosDistrito();
    const porcentajeHacinamientoDistrito = this.getPorcentajeHacinamientoDistrito();
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (totalPersonas !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(totalPersonas), 'g'), `<span class="data-section">${this.escapeHtml(totalPersonas)}</span>`);
    }
    if (porcentajeHacinamiento !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeHacinamiento), 'g'), `<span class="data-section">${this.escapeHtml(porcentajeHacinamiento)}</span>`);
    }
    if (porcentajeSinServicios !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeSinServicios), 'g'), `<span class="data-section">${this.escapeHtml(porcentajeSinServicios)}</span>`);
    }
    if (distrito !== 'Cahuacho') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (totalUnidades !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(totalUnidades), 'g'), `<span class="data-section">${this.escapeHtml(totalUnidades)}</span>`);
    }
    if (porcentajeSinServiciosDistrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeSinServiciosDistrito), 'g'), `<span class="data-section">${this.escapeHtml(porcentajeSinServiciosDistrito)}</span>`);
    }
    if (porcentajeHacinamientoDistrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeHacinamientoDistrito), 'g'), `<span class="data-section">${this.escapeHtml(porcentajeHacinamientoDistrito)}</span>`);
    }
    
    html = html.replace(/\n\n/g, '</p><p class="text-justify">');
    html = `<p class="text-justify">${html}</p>`;
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      fotografias,
      groupPrefix
    );
    this.fotografiasCache = [...fotografias];
    this.fotografiasFormMulti = [...fotografias];
    this.cdRef.detectChanges();
  }

}

