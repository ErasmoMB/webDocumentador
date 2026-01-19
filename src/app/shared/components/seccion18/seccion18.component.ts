import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { Subscription } from 'rxjs';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion18',
  templateUrl: './seccion18.component.html',
  styleUrls: ['./seccion18.component.css']
})
export class Seccion18Component extends AutoLoadSectionComponent implements OnDestroy {
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
    protected override autoLoader: AutoBackendDataLoaderService,
    private tableService: TableManagementService,
    private stateService: StateService,
    private sanitizer: DomSanitizer,
    private groupConfig: GroupConfigService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef, autoLoader);
  }

  protected getSectionKey(): string {
    return 'seccion18_aisd';
  }

  protected getLoadParameters(): string[] | null {
    const ccppDesdeGrupo = this.groupConfig.getAISDCCPPActivos();
    
    if (ccppDesdeGrupo && ccppDesdeGrupo.length > 0) {
      // Limpiar '0' al inicio de cada CCPP
      const ccppLimpios = ccppDesdeGrupo.map((cpp: string) => {
        const cleaned = cpp.toString().replace(/^0+/, '') || '0';
        return cleaned;
      });
      return ccppLimpios;
    }
    return null;
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

  getTablaKeyNbiCCAyroca(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `nbiCCAyrocaTabla${prefijo}` : 'nbiCCAyrocaTabla';
  }

  getTableNbiCCAyroca(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'nbiCCAyrocaTabla', this.seccionId);
    return pref || this.datos.nbiCCAyrocaTabla || [];
  }

  getNbiCCAyrocaSinTotal(): any[] {
    const tabla = this.getTableNbiCCAyroca();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
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

  getTablaKeyNbiDistritoCahuacho(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `nbiDistritoCahuachoTabla${prefijo}` : 'nbiDistritoCahuachoTabla';
  }

  getTableNbiDistritoCahuacho(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'nbiDistritoCahuachoTabla', this.seccionId);
    return pref || this.datos.nbiDistritoCahuachoTabla || [];
  }

  getNbiDistritoCahuachoSinTotal(): any[] {
    const tabla = this.getTableNbiDistritoCahuacho();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
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

  override ngOnDestroy() {
    super.ngOnDestroy();
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
    const tabla = this.getTableNbiCCAyroca();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    // Sumar todos los casos de la tabla
    const total = tabla.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total > 0 ? total.toString() : '____';
  }

  getPorcentajeHacinamientoCC(): string {
    const tabla = this.getTableNbiCCAyroca();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('hacinamiento')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeSinServiciosCC(): string {
    const tabla = this.getTableNbiCCAyroca();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getTotalUnidadesDistrito(): string {
    const tabla = this.getTableNbiDistritoCahuacho();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    // Sumar todos los casos de la tabla
    const total = tabla.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total > 0 ? total.toString() : '____';
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
    
    return `En primer lugar, cabe mencionar que en la CC ${grupoAISD} se halla un total de [TOTAL_CC:${totalPersonas}] personas residentes en viviendas particulares. De este conjunto, se observa que la NBI más frecuente, según población, es la de [NBI_HACINAMIENTO_CC:viviendas con hacinamiento] (${porcentajeHacinamiento}%), seguido de la de [NBI_SERVICIOS_CC:viviendas sin servicios higiénicos] (${porcentajeSinServicios}%).\n\nPor otro lado, a nivel distrital de [DISTRITO:${distrito}], de un total de [TOTAL_DIST:${totalUnidades}] unidades de análisis, se sabe que el tipo de NBI más frecuente es la de [NBI_SERVICIOS_DIST:viviendas sin servicios higiénicos] (${porcentajeSinServiciosDistrito}%), seguida de la de [NBI_HACINAMIENTO_DIST:viviendas con hacinamiento] (${porcentajeHacinamientoDistrito}%). En ese sentido, se aprecia que el orden de las dos NBI mayoritarias es inverso al comparar a la CC ${grupoAISD} con el distrito de ${distrito}.`;
  }

  getPorcentajeSinServiciosDistrito(): string {
    const tabla = this.getTableNbiDistritoCahuacho();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHacinamientoDistrito(): string {
    const tabla = this.getTableNbiDistritoCahuacho();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
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
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const totalPersonas = this.getTotalPersonasCC();
    const totalUnidades = this.getTotalUnidadesDistrito();
    
    let html = texto;
    
    // Reemplazar ANTES de escapar HTML (usar placeholders)
    html = html.split('[TOTAL_CC:' + totalPersonas + ']').join(`[TOTAL_CC:${totalPersonas}]`);
    html = html.split('[TOTAL_DIST:' + totalUnidades + ']').join(`[TOTAL_DIST:${totalUnidades}]`);
    html = html.split('[NBI_HACINAMIENTO_CC:viviendas con hacinamiento]').join(`[NBI_HAC_CC:viviendas con hacinamiento]`);
    html = html.split('[NBI_SERVICIOS_CC:viviendas sin servicios higiénicos]').join(`[NBI_SRV_CC:viviendas sin servicios higiénicos]`);
    html = html.split('[DISTRITO:' + distrito + ']').join(`[DIST:${distrito}]`);
    html = html.split('[NBI_SERVICIOS_DIST:viviendas sin servicios higiénicos]').join(`[NBI_SRV_DIST:viviendas sin servicios higiénicos]`);
    html = html.split('[NBI_HACINAMIENTO_DIST:viviendas con hacinamiento]').join(`[NBI_HAC_DIST:viviendas con hacinamiento]`);
    
    // AHORA escapar el HTML
    html = this.escapeHtml(html);
    
    // Y AHORA hacer los reemplazos con spans (CELESTE para totales, LILA para categorías, VERDE para porcentajes)
    const porcentajeHacinamiento = this.getPorcentajeHacinamientoCC() || '0';
    const porcentajeSinServicios = this.getPorcentajeSinServiciosCC() || '0';
    const porcentajeSinServiciosDistrito = this.getPorcentajeSinServiciosDistrito() || '0';
    const porcentajeHacinamientoDistrito = this.getPorcentajeHacinamientoDistrito() || '0';
    
    // Reemplazar totales (CELESTE - data-section)
    html = html.split(`[TOTAL_CC:${totalPersonas}]`).join(`<span class="data-section">${this.escapeHtml(totalPersonas)}</span>`);
    html = html.split(`[TOTAL_DIST:${totalUnidades}]`).join(`<span class="data-section">${this.escapeHtml(totalUnidades)}</span>`);
    
    // Reemplazar categorías NBI (LILA - data-source)
    html = html.split(`[NBI_HAC_CC:viviendas con hacinamiento]`).join(`<span class="data-source">viviendas con hacinamiento</span>`);
    html = html.split(`[NBI_SRV_CC:viviendas sin servicios higiénicos]`).join(`<span class="data-source">viviendas sin servicios higiénicos</span>`);
    html = html.split(`[NBI_SRV_DIST:viviendas sin servicios higiénicos]`).join(`<span class="data-source">viviendas sin servicios higiénicos</span>`);
    html = html.split(`[NBI_HAC_DIST:viviendas con hacinamiento]`).join(`<span class="data-source">viviendas con hacinamiento</span>`);
    html = html.split(`[DIST:${distrito}]`).join(`<span class="data-source">${this.escapeHtml(distrito)}</span>`);
    
    // Reemplazar porcentajes (VERDE - data-calculated con %)
    html = html.split(`${porcentajeHacinamiento}%`).join(`<span class="data-calculated">${this.escapeHtml(porcentajeHacinamiento)}%</span>`);
    html = html.split(`${porcentajeSinServicios}%`).join(`<span class="data-calculated">${this.escapeHtml(porcentajeSinServicios)}%</span>`);
    html = html.split(`${porcentajeSinServiciosDistrito}%`).join(`<span class="data-calculated">${this.escapeHtml(porcentajeSinServiciosDistrito)}%</span>`);
    html = html.split(`${porcentajeHacinamientoDistrito}%`).join(`<span class="data-calculated">${this.escapeHtml(porcentajeHacinamientoDistrito)}%</span>`);
    
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

