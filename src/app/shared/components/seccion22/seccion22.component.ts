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
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { CentrosPobladosService } from 'src/app/core/services/centros-poblados.service';

@Component({
  selector: 'app-seccion22',
  templateUrl: './seccion22.component.html',
  styleUrls: ['./seccion22.component.css']
})
export class Seccion22Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();
  
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
    private sanitizer: DomSanitizer,
    autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService,
    private centrosPobladosService: CentrosPobladosService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, null as any, cdRef, autoLoader);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
    this.actualizarFotografiasFormMulti();
    this.eliminarFilasTotal();
    this.cargarDatosDesdeAPI();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private cargarDatosDesdeAPI(): void {
    const ubigeos = this.getLoadParameters();
    
    if (!ubigeos || ubigeos.length === 0) {
      console.log('[Seccion22] No hay UBIGEOs para cargar');
      return;
    }

    console.log('[Seccion22] 🔵 ENVIANDO al backend:', {
      endpoint: '/centros-poblados/por-codigos-ubigeo',
      method: 'POST',
      payload: { codigos_ubigeo: ubigeos },
      cantidad_codigos: ubigeos.length
    });

    this.centrosPobladosService.obtenerPorCodigos(ubigeos).subscribe(
      (centrosPoblados) => {
        console.log('[Seccion22] 🟢 RECIBIDO del backend:', {
          cantidad_centros: centrosPoblados?.length || 0,
          datos_crudos: JSON.parse(JSON.stringify(centrosPoblados)),
          primer_centro_ejemplo: centrosPoblados?.[0] ? {
            ubigeo: centrosPoblados[0].ubigeo,
            centro_poblado: centrosPoblados[0].centro_poblado,
            hombres: centrosPoblados[0].hombres,
            mujeres: centrosPoblados[0].mujeres,
            de_6_a_14_anios: centrosPoblados[0].de_6_a_14_anios,
            de_15_a_29: centrosPoblados[0].de_15_a_29,
            tipos_datos: {
              hombres: typeof centrosPoblados[0].hombres,
              mujeres: typeof centrosPoblados[0].mujeres,
              de_6_a_14_anios: typeof centrosPoblados[0].de_6_a_14_anios
            }
          } : null
        });

        if (centrosPoblados && centrosPoblados.length > 0) {
          const poblacionSexo = this.agregarPoblacionPorSexo(centrosPoblados);
          const poblacionEtario = this.agregarPoblacionPorGrupoEtario(centrosPoblados);
          
          console.log('[Seccion22] 📊 DATOS PROCESADOS:', {
            poblacionSexo: JSON.parse(JSON.stringify(poblacionSexo)),
            poblacionEtario: JSON.parse(JSON.stringify(poblacionEtario))
          });
          
          this.formularioService.actualizarDato('poblacionSexoAISI', poblacionSexo);
          this.formularioService.actualizarDato('poblacionEtarioAISI', poblacionEtario);
          
          this.datos.poblacionSexoAISI = poblacionSexo;
          this.datos.poblacionEtarioAISI = poblacionEtario;
          
          this.cdRef.detectChanges();
        }
      },
      (error) => {
        console.error('[Seccion22] ❌ ERROR en petición:', error);
      }
    );
  }

  private agregarPoblacionPorSexo(centrosPoblados: any[]): any[] {
    let totalHombres = 0;
    let totalMujeres = 0;

    console.log('[Seccion22] 🔍 Procesando población por sexo de', centrosPoblados.length, 'centros');

    centrosPoblados.forEach((cp, index) => {
      const hombresRaw = cp.hombres;
      const mujeresRaw = cp.mujeres;
      
      let hombres = 0;
      let mujeres = 0;
      
      try {
        if (typeof hombresRaw === 'string') {
          hombres = parseInt(hombresRaw, 10) || 0;
        } else if (typeof hombresRaw === 'number') {
          hombres = Math.floor(hombresRaw);
        }
      } catch (e) {
        console.warn(`[Seccion22] Error parseando hombres del CP ${index}:`, hombresRaw, e);
      }
      
      try {
        if (typeof mujeresRaw === 'string') {
          mujeres = parseInt(mujeresRaw, 10) || 0;
        } else if (typeof mujeresRaw === 'number') {
          mujeres = Math.floor(mujeresRaw);
        }
      } catch (e) {
        console.warn(`[Seccion22] Error parseando mujeres del CP ${index}:`, mujeresRaw, e);
      }
      
      if (index < 3) {
        console.log(`[Seccion22] CP ${index} (${cp.centro_poblado}):`, {
          hombres_raw: hombresRaw,
          hombres_parsed: hombres,
          mujeres_raw: mujeresRaw,
          mujeres_parsed: mujeres
        });
      }
      
      totalHombres += hombres;
      totalMujeres += mujeres;
    });

    console.log('[Seccion22] ✅ Totales calculados:', {
      totalHombres,
      totalMujeres,
      totalGeneral: totalHombres + totalMujeres
    });

    return [
      {
        sexo: 'Hombre',
        casos: totalHombres,
        porcentaje: this.calcularPorcentaje(totalHombres, totalHombres + totalMujeres)
      },
      {
        sexo: 'Mujer',
        casos: totalMujeres,
        porcentaje: this.calcularPorcentaje(totalMujeres, totalHombres + totalMujeres)
      }
    ];
  }

  private agregarPoblacionPorGrupoEtario(centrosPoblados: any[]): any[] {
    let de0a14 = 0;
    let de15a29 = 0;
    let de30a44 = 0;
    let de45a64 = 0;
    let de65amas = 0;

    console.log('[Seccion22] 🔍 Procesando población por grupo etario de', centrosPoblados.length, 'centros');

    centrosPoblados.forEach((cp, index) => {
      const parseValue = (value: any, fieldName: string): number => {
        try {
          if (value == null || value === undefined) return 0;
          if (typeof value === 'string') {
            const parsed = parseInt(value, 10);
            if (isNaN(parsed)) {
              console.warn(`[Seccion22] Valor inválido en ${fieldName} del CP ${index}:`, value);
              return 0;
            }
            return parsed;
          }
          if (typeof value === 'number') {
            return Math.floor(value);
          }
          return 0;
        } catch (e) {
          console.warn(`[Seccion22] Error parseando ${fieldName} del CP ${index}:`, value, e);
          return 0;
        }
      };

      const _0a14 = parseValue(cp.de_6_a_14_anios, 'de_6_a_14_anios');
      const _15a29 = parseValue(cp.de_15_a_29, 'de_15_a_29');
      const _30a44 = parseValue(cp.de_30_a_44, 'de_30_a_44');
      const _45a64 = parseValue(cp.de_45_a_64, 'de_45_a_64');
      const _65amas = parseValue(cp.de_65_a_mas, 'de_65_a_mas');

      if (index < 3) {
        console.log(`[Seccion22] CP ${index} (${cp.centro_poblado}) - Grupos etarios:`, {
          '0-14_raw': cp.de_6_a_14_anios,
          '0-14_parsed': _0a14,
          '15-29_raw': cp.de_15_a_29,
          '15-29_parsed': _15a29,
          '30-44_raw': cp.de_30_a_44,
          '30-44_parsed': _30a44,
          '45-64_raw': cp.de_45_a_64,
          '45-64_parsed': _45a64,
          '65+_raw': cp.de_65_a_mas,
          '65+_parsed': _65amas
        });
      }

      de0a14 += _0a14;
      de15a29 += _15a29;
      de30a44 += _30a44;
      de45a64 += _45a64;
      de65amas += _65amas;
    });

    const total = de0a14 + de15a29 + de30a44 + de45a64 + de65amas;

    console.log('[Seccion22] ✅ Totales por grupo etario:', {
      '0-14': de0a14,
      '15-29': de15a29,
      '30-44': de30a44,
      '45-64': de45a64,
      '65+': de65amas,
      total
    });

    return [
      {
        categoria: '0 a 14',
        casos: de0a14,
        porcentaje: this.calcularPorcentaje(de0a14, total)
      },
      {
        categoria: '15 a 29',
        casos: de15a29,
        porcentaje: this.calcularPorcentaje(de15a29, total)
      },
      {
        categoria: '30 a 44',
        casos: de30a44,
        porcentaje: this.calcularPorcentaje(de30a44, total)
      },
      {
        categoria: '45 a 64',
        casos: de45a64,
        porcentaje: this.calcularPorcentaje(de45a64, total)
      },
      {
        categoria: '65 a más',
        casos: de65amas,
        porcentaje: this.calcularPorcentaje(de65amas, total)
      }
    ];
  }

  /**
   * Calcula porcentaje formateado al estilo español
   */
  private calcularPorcentaje(valor: number, total: number): string {
    if (total === 0) return '0,00 %';
    return ((valor / total) * 100).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' %';
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

  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected getSectionKey(): string {
    return 'seccion22_aisi';
  }

  protected getLoadParameters(): string[] | null {
    return this.groupConfig.getAISICCPPActivos();
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
      if (!this.compararValores(valorActual, valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = this.clonarValor(valorActual);
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
    // Calcular total sumando todos los casos de sexo
    const total = this.datos.poblacionSexoAISI.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total > 0 ? total.toString() : '____';
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

  onPoblacionSexoFieldChange(index: number, field: string, value: any): void {
    const tabla = this.datos.poblacionSexoAISI || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const sexo = item.sexo?.toString().toLowerCase() || '';
          if (sexo.includes('total')) return sum;
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);
        
        if (total > 0) {
          tabla.forEach((item: any) => {
            const sexo = item.sexo?.toString().toLowerCase() || '';
            if (!sexo.includes('total')) {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              const porcentaje = ((casos / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
      }
      
      this.datos.poblacionSexoAISI = [...tabla];
      this.formularioService.actualizarDato('poblacionSexoAISI', tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onPoblacionSexoTableUpdated(): void {
    const tabla = this.datos.poblacionSexoAISI || [];
    this.datos.poblacionSexoAISI = [...tabla];
    this.formularioService.actualizarDato('poblacionSexoAISI', tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onPoblacionEtarioFieldChange(index: number, field: string, value: any): void {
    const tabla = this.datos.poblacionEtarioAISI || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const categoria = item.categoria?.toString().toLowerCase() || '';
          if (categoria.includes('total')) return sum;
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);
        
        if (total > 0) {
          tabla.forEach((item: any) => {
            const categoria = item.categoria?.toString().toLowerCase() || '';
            if (!categoria.includes('total')) {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              const porcentaje = ((casos / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
      }
      
      this.datos.poblacionEtarioAISI = [...tabla];
      this.formularioService.actualizarDato('poblacionEtarioAISI', tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onPoblacionEtarioTableUpdated(): void {
    const tabla = this.datos.poblacionEtarioAISI || [];
    this.datos.poblacionEtarioAISI = [...tabla];
    this.formularioService.actualizarDato('poblacionEtarioAISI', tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private compararValores(actual: any, anterior: any): boolean {
    if (actual === anterior) return true;
    if (actual == null || anterior == null) return actual === anterior;
    if (typeof actual !== typeof anterior) return false;
    if (typeof actual !== 'object') return actual === anterior;
    if (Array.isArray(actual) !== Array.isArray(anterior)) return false;
    if (Array.isArray(actual)) {
      if (actual.length !== anterior.length) return false;
      for (let i = 0; i < actual.length; i++) {
        if (!this.compararValores(actual[i], anterior[i])) return false;
      }
      return true;
    }
    const keysActual = Object.keys(actual);
    const keysAnterior = Object.keys(anterior);
    if (keysActual.length !== keysAnterior.length) return false;
    for (const key of keysActual) {
      if (!keysAnterior.includes(key)) return false;
      if (!this.compararValores(actual[key], anterior[key])) return false;
    }
    return true;
  }

  private clonarValor(valor: any): any {
    if (valor == null || typeof valor !== 'object') return valor;
    if (Array.isArray(valor)) {
      return valor.map(item => this.clonarValor(item));
    }
    const clon: any = {};
    for (const key in valor) {
      if (valor.hasOwnProperty(key)) {
        clon[key] = this.clonarValor(valor[key]);
      }
    }
    return clon;
  }
}

