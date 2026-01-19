import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { Subscription } from 'rxjs';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion6',
  templateUrl: './seccion6.component.html',
  styleUrls: ['./seccion6.component.css']
})
export class Seccion6Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private ultimoLogCCPP: string = '';
  
  override watchedFields: string[] = ['grupoAISD', 'poblacionSexoAISD', 'poblacionEtarioAISD', 'textoPoblacionSexoAISD', 'textoPoblacionEtarioAISD'];
  
  override readonly PHOTO_PREFIX = 'fotografiaDemografia';

  poblacionSexoConfig: TableConfig = {
    tablaKey: 'poblacionSexoAISD',
    totalKey: 'sexo',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ sexo: '', casos: 0, porcentaje: '0%' }]
  };

  poblacionEtarioConfig: TableConfig = {
    tablaKey: 'poblacionEtarioAISD',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }]
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    autoLoader: AutoBackendDataLoaderService,
    private tableService: TableManagementService,
    private stateService: StateService,
    private groupConfig: GroupConfigService,
    private centrosPobladosActivos: CentrosPobladosActivosService,
    private sanitizer: DomSanitizer
  ) {
    super(
      formularioService,
      fieldMapping,
      sectionDataLoader,
      imageService,
      photoNumberingService,
      cdRef,
      autoLoader
    );
  }

  protected getSectionKey(): string {
    return 'seccion6_aisd';
  }

  protected getLoadParameters(): string[] | null {
    const prefijo = this.obtenerPrefijoGrupo();
    const codigosActivos = prefijo?.startsWith('_A')
      ? this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo)
      : this.groupConfig.getAISDCCPPActivos();

    const firma = `${prefijo || ''}|${codigosActivos?.length || 0}`;
    if (firma !== this.ultimoLogCCPP) {
      this.ultimoLogCCPP = firma;
    }
    return codigosActivos && codigosActivos.length > 0 ? codigosActivos : null;
  }

  protected override onInitCustom(): void {
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  protected override applyLoadedData(loadedData: { [fieldName: string]: any }): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);

    for (const [fieldName, data] of Object.entries(loadedData)) {
      if (data === null || data === undefined) continue;

      const fieldKey = prefijo ? `${fieldName}${prefijo}` : fieldName;

      const actual = this.datos[fieldKey];
      const vieneTablaNoVacia = Array.isArray(data) && data.length > 0;
      const actualEsPlaceholder = this.esTablaPlaceholder(actual);

      const debeActualizar =
        this.datos[fieldKey] === undefined ||
        this.datos[fieldKey] === null ||
        (vieneTablaNoVacia && actualEsPlaceholder);

      if (debeActualizar) {
        this.formularioService.actualizarDato(fieldKey as any, data);
      }
    }

    this.actualizarDatos();
    this.calcularPorcentajes();
    this.sanitizarTablasDemograficas();
  }

  private esTablaPlaceholder(valor: any): boolean {
    if (!Array.isArray(valor) || valor.length === 0) {
      return true;
    }

    const tieneSoloCeros = valor.every((row: any) => {
      if (!row) return true;
      const casos = typeof row.casos === 'number' ? row.casos : parseInt(row.casos) || 0;
      const sexoVacio = row.sexo !== undefined ? (row.sexo?.toString().trim() || '') === '' : true;
      const categoriaVacia = row.categoria !== undefined ? (row.categoria?.toString().trim() || '') === '' : true;
      const claveVacia = sexoVacio && categoriaVacia;
      return claveVacia && casos === 0;
    });

    return tieneSoloCeros;
  }

  private calcularPorcentajes(): void {
    const prefijo = this.obtenerPrefijoGrupo();

    const tablaSexoKey = prefijo ? `poblacionSexoAISD${prefijo}` : 'poblacionSexoAISD';
    const tablaSexo = this.getTablaSexo();
    if (Array.isArray(tablaSexo) && tablaSexo.length > 0) {
      const total = tablaSexo.reduce((sum: number, item: any) => {
        const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
        return sum + casos;
      }, 0);

      const actualizada = total > 0
        ? tablaSexo.map((item: any) => {
            const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
            const porcentaje = (casos / total) * 100;
            return {
              ...item,
              casos,
              porcentaje: porcentaje
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %'
            };
          })
        : tablaSexo.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));

      this.datos[tablaSexoKey] = actualizada;
      this.formularioService.actualizarDato(tablaSexoKey as any, actualizada);
    }

    const tablaEtarioKey = prefijo ? `poblacionEtarioAISD${prefijo}` : 'poblacionEtarioAISD';
    const tablaEtario = this.getTablaEtario();
    if (Array.isArray(tablaEtario) && tablaEtario.length > 0) {
      const total = tablaEtario.reduce((sum: number, item: any) => {
        const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
        return sum + casos;
      }, 0);

      const actualizada = total > 0
        ? tablaEtario.map((item: any) => {
            const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
            const porcentaje = (casos / total) * 100;
            return {
              ...item,
              casos,
              porcentaje: porcentaje
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %'
            };
          })
        : tablaEtario.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));

      this.datos[tablaEtarioKey] = actualizada;
      this.formularioService.actualizarDato(tablaEtarioKey as any, actualizada);
    }
  }

  private sanitizarTablasDemograficas(): void {
    this.eliminarFilasTotal('poblacionSexoAISD', 'sexo');
    this.eliminarFilasTotal('poblacionEtarioAISD', 'categoria');
    this.limpiarTablasSiEstanVacias('poblacionSexoAISD');
    this.limpiarTablasSiEstanVacias('poblacionEtarioAISD');
  }

  private limpiarTablasSiEstanVacias(tablaKey: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `${tablaKey}${prefijo}` : tablaKey;
    const datosTabla = this.datos[campoConPrefijo] || this.datos[tablaKey];

    if (datosTabla && Array.isArray(datosTabla)) {
      const tieneDatosValidos = datosTabla.some((item: any) => {
        if (item.sexo !== undefined) {
          return item.sexo && item.sexo.trim() !== '' && (item.casos > 0 || item.casos !== 0);
        }
        if (item.categoria !== undefined) {
          return item.categoria && item.categoria.trim() !== '' && (item.casos > 0 || item.casos !== 0);
        }
        return false;
      });

      if (!tieneDatosValidos) {
        if (prefijo) {
          delete this.datos[campoConPrefijo];
          this.formularioService.actualizarDato(campoConPrefijo as any, null);
        } else {
          delete this.datos[tablaKey];
          this.formularioService.actualizarDato(tablaKey as any, null);
        }
      }
    }
  }

  private getTablaSexo(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'poblacionSexoAISD', this.seccionId);
    return pref || this.datos.poblacionSexoAISD || [];
  }

  private getTablaEtario(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'poblacionEtarioAISD', this.seccionId);
    return pref || this.datos.poblacionEtarioAISD || [];
  }

  override ngOnDestroy(): void {
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
    
    const poblacionSexoActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'poblacionSexoAISD', this.seccionId) || [];
    const poblacionSexoAnterior = this.datosAnteriores.poblacionSexoAISD || [];
    const hayCambioPoblacionSexo = JSON.stringify(poblacionSexoActual) !== JSON.stringify(poblacionSexoAnterior);
    
    const poblacionEtarioActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'poblacionEtarioAISD', this.seccionId) || [];
    const poblacionEtarioAnterior = this.datosAnteriores.poblacionEtarioAISD || [];
    const hayCambioPoblacionEtario = JSON.stringify(poblacionEtarioActual) !== JSON.stringify(poblacionEtarioAnterior);
    
    const textoPoblacionSexoActual = datosActuales['textoPoblacionSexoAISD'] || null;
    const textoPoblacionSexoAnterior = this.datosAnteriores.textoPoblacionSexoAISD || null;
    const hayCambioTextoPoblacionSexo = textoPoblacionSexoActual !== textoPoblacionSexoAnterior;
    
    const textoPoblacionEtarioActual = datosActuales['textoPoblacionEtarioAISD'] || null;
    const textoPoblacionEtarioAnterior = this.datosAnteriores.textoPoblacionEtarioAISD || null;
    const hayCambioTextoPoblacionEtario = textoPoblacionEtarioActual !== textoPoblacionEtarioAnterior;
    
    if (grupoAISDActual !== grupoAISDAnterior || 
        grupoAISDActual !== grupoAISDEnDatos ||
        hayCambioPoblacionSexo ||
        hayCambioPoblacionEtario ||
        hayCambioTextoPoblacionSexo ||
        hayCambioTextoPoblacionEtario) {
      if (hayCambioPoblacionSexo) {
        this.datosAnteriores.poblacionSexoAISD = JSON.parse(JSON.stringify(poblacionSexoActual));
      }
      if (hayCambioPoblacionEtario) {
        this.datosAnteriores.poblacionEtarioAISD = JSON.parse(JSON.stringify(poblacionEtarioActual));
      }
      if (hayCambioTextoPoblacionSexo) {
        this.datosAnteriores.textoPoblacionSexoAISD = textoPoblacionSexoActual;
      }
      if (hayCambioTextoPoblacionEtario) {
        this.datosAnteriores.textoPoblacionEtarioAISD = textoPoblacionEtarioActual;
      }
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
    
    const poblacionSexo = this.getTablaSexo();
    if (poblacionSexo && Array.isArray(poblacionSexo) && poblacionSexo.length > 0) {
      this.datosAnteriores.poblacionSexoAISD = JSON.parse(JSON.stringify(poblacionSexo));
    } else {
      this.datosAnteriores.poblacionSexoAISD = [];
    }
    
    const poblacionEtario = this.getTablaEtario();
    if (poblacionEtario && Array.isArray(poblacionEtario) && poblacionEtario.length > 0) {
      this.datosAnteriores.poblacionEtarioAISD = JSON.parse(JSON.stringify(poblacionEtario));
    } else {
      this.datosAnteriores.poblacionEtarioAISD = [];
    }
    
    this.datosAnteriores.textoPoblacionSexoAISD = this.datos.textoPoblacionSexoAISD || null;
    this.datosAnteriores.textoPoblacionEtarioAISD = this.datos.textoPoblacionEtarioAISD || null;
    
    this.eliminarFilasTotal('poblacionSexoAISD', 'sexo');
    this.eliminarFilasTotal('poblacionEtarioAISD', 'categoria');
  }

  getPorcentajeHombres(): string {
    const tablaSexo = this.getTablaSexo();
    if (!tablaSexo || !Array.isArray(tablaSexo) || tablaSexo.length === 0) {
      return '____';
    }
    const hombres = tablaSexo.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('hombre') || item.sexo.toLowerCase().includes('varon'))
    );
    return hombres?.porcentaje || '____';
  }

  getPorcentajeMujeres(): string {
    const tablaSexo = this.getTablaSexo();
    if (!tablaSexo || !Array.isArray(tablaSexo) || tablaSexo.length === 0) {
      return '____';
    }
    const mujeres = tablaSexo.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('mujer') || item.sexo.toLowerCase().includes('femenin'))
    );
    return mujeres?.porcentaje || '____';
  }

  getPorcentajeGrupoEtario(categoria: string): string {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return '____';
    }
    
    const grupo = tablaEtario.find((item: any) => {
      if (!item.categoria) return false;
      const itemCategoria = item.categoria.toLowerCase();
      const buscarCategoria = categoria.toLowerCase();
      
      if (buscarCategoria.includes('15 a 29')) {
        return itemCategoria.includes('15') && itemCategoria.includes('29');
      } else if (buscarCategoria.includes('0 a 14')) {
        return itemCategoria.includes('0') && (itemCategoria.includes('14') || itemCategoria.includes('menor'));
      } else if (buscarCategoria.includes('65')) {
        return itemCategoria.includes('65') || itemCategoria.includes('mayor');
      }
      
      return itemCategoria.includes(buscarCategoria);
    });
    
    return grupo?.porcentaje || '____';
  }

  getGrupoEtarioMayoritario(): string {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return '15 a 29 años';
    }
    
    let mayorPorcentaje = 0;
    let grupoMayoritario = '15 a 29 años';
    
    tablaEtario.forEach((item: any) => {
      if (item.porcentaje) {
        const porcentajeNum = parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim());
        if (!isNaN(porcentajeNum) && porcentajeNum > mayorPorcentaje) {
          mayorPorcentaje = porcentajeNum;
          grupoMayoritario = item.categoria || '15 a 29 años';
        }
      }
    });
    
    return grupoMayoritario;
  }

  getGrupoEtarioSegundo(): string {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return '0 a 14 años';
    }
    
    const gruposOrdenados = [...tablaEtario]
      .filter((item: any) => item.porcentaje && item.categoria)
      .map((item: any) => ({
        categoria: item.categoria,
        porcentaje: parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim())
      }))
      .filter((item: any) => !isNaN(item.porcentaje))
      .sort((a: any, b: any) => b.porcentaje - a.porcentaje);
    
    return gruposOrdenados.length > 1 ? gruposOrdenados[1].categoria : '0 a 14 años';
  }

  getGrupoEtarioMenoritario(): string {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return '65 años a más';
    }
    
    let menorPorcentaje = Infinity;
    let grupoMenoritario = '65 años a más';
    
    tablaEtario.forEach((item: any) => {
      if (item.porcentaje) {
        const porcentajeNum = parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim());
        if (!isNaN(porcentajeNum) && porcentajeNum < menorPorcentaje) {
          menorPorcentaje = porcentajeNum;
          grupoMenoritario = item.categoria || '65 años a más';
        }
      }
    });
    
    return grupoMenoritario;
  }

  getPoblacionSexoSinTotal(): any[] {
    const tablaSexo = this.getTablaSexo();
    if (!tablaSexo || !Array.isArray(tablaSexo) || tablaSexo.length === 0) {
      return [];
    }
    
    const resultado = tablaSexo.filter((item: any) => {
      const sexo = item.sexo?.toString().toLowerCase() || '';
      return !sexo.includes('total');
    });
    
    return resultado;
  }

  getPoblacionEtarioSinTotal(): any[] {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return [];
    }
    
    const resultado = tablaEtario.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
    
    return resultado;
  }

  override obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    
    if (grupoAISD && grupoAISD.trim() !== '') {
      return grupoAISD;
    }
    
    const grupoConSufijo = prefijo ? this.datos[`grupoAISD${prefijo}`] : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    if (this.datos.comunidadesCampesinas && Array.isArray(this.datos.comunidadesCampesinas) && this.datos.comunidadesCampesinas.length > 0) {
      const primerCC = this.datos.comunidadesCampesinas[0];
      if (primerCC && primerCC.nombre && primerCC.nombre.trim() !== '') {
        return primerCC.nombre;
      }
    }
    
    if (this.datos.tablaAISD1Localidad && this.datos.tablaAISD1Localidad.trim() !== '') {
      return this.datos.tablaAISD1Localidad;
    }
    
    const grupoAISDBase = this.datos.grupoAISD;
    if (grupoAISDBase && grupoAISDBase.trim() !== '') {
      return grupoAISDBase;
    }
    
    return '____';
  }

  getTotalPoblacionSexo(): string {
    const tablaSexo = this.getTablaSexo();
    if (!tablaSexo || !Array.isArray(tablaSexo)) {
      return '0';
    }
    
    const datosSinTotal = this.getPoblacionSexoSinTotal();
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    return total.toString();
  }

  getTotalPoblacionEtario(): string {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario)) {
      return '0';
    }
    
    const datosSinTotal = this.getPoblacionEtarioSinTotal();
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    return total.toString();
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasDemografiaVista(): any[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return this.fotografiasCache.map(foto => ({
        imagen: foto.imagen || '',
        titulo: foto.titulo || 'Demografía',
        fuente: foto.fuente || 'GEADES, 2024'
      }));
    }
    
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaDemografia${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaDemografia${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Demografía';
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaDemografia${i}Fuente`];
        const fuente = fuenteConPrefijo || fuenteSinPrefijo || 'GEADES, 2024';
        fotografias.push({ imagen, titulo, fuente });
      }
    }
    return fotografias;
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.obtenerPrefijoGrupo();
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
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onPoblacionSexoFieldChange(index: number, field: string, value: any) {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `poblacionSexoAISD${prefijo}` : 'poblacionSexoAISD';
    const tabla = this.getTablaSexo();
    
    if (!tabla || !Array.isArray(tabla)) {
      return;
    }
    
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        const totalPoblacionKey = prefijo ? `tablaAISD2TotalPoblacion${prefijo}` : 'tablaAISD2TotalPoblacion';
        const total = parseInt(this.datos[totalPoblacionKey] || this.datos['tablaAISD2TotalPoblacion'] || '0') || 0;
        if (total > 0) {
          const casos = parseInt(value) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2).replace('.', ',') + ' %';
          tabla[index].porcentaje = porcentaje;
        }
      }
      
      this.datos[tablaKey] = [...tabla];
      this.formularioService.actualizarDato(tablaKey as any, tabla);
    }
    
    this.eliminarFilasTotal('poblacionSexoAISD', 'sexo');
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onPoblacionEtarioFieldChange(index: number, field: string, value: any) {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `poblacionEtarioAISD${prefijo}` : 'poblacionEtarioAISD';
    const tabla = this.getTablaEtario();
    
    if (!tabla || !Array.isArray(tabla)) {
      return;
    }
    
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        const totalPoblacionKey = prefijo ? `tablaAISD2TotalPoblacion${prefijo}` : 'tablaAISD2TotalPoblacion';
        const total = parseInt(this.datos[totalPoblacionKey] || this.datos['tablaAISD2TotalPoblacion'] || '0') || 0;
        if (total > 0) {
          const casos = parseInt(value) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2).replace('.', ',') + ' %';
          tabla[index].porcentaje = porcentaje;
        }
      }
      
      this.datos[tablaKey] = [...tabla];
      this.formularioService.actualizarDato(tablaKey as any, tabla);
    }
    
    this.eliminarFilasTotal('poblacionEtarioAISD', 'categoria');
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onPoblacionSexoTableUpdated() {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `poblacionSexoAISD${prefijo}` : 'poblacionSexoAISD';
    const tabla = this.getTablaSexo();
    
    if (tabla && Array.isArray(tabla)) {
      this.datos[tablaKey] = [...tabla];
      this.formularioService.actualizarDato(tablaKey as any, tabla);
    }
    
    this.eliminarFilasTotal('poblacionSexoAISD', 'sexo');
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onPoblacionEtarioTableUpdated() {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `poblacionEtarioAISD${prefijo}` : 'poblacionEtarioAISD';
    const tabla = this.getTablaEtario();
    
    if (tabla && Array.isArray(tabla)) {
      this.datos[tablaKey] = [...tabla];
      this.formularioService.actualizarDato(tablaKey as any, tabla);
    }
    
    this.eliminarFilasTotal('poblacionEtarioAISD', 'categoria');
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  private eliminarFilasTotal(tablaKey: string, campoKey: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `${tablaKey}${prefijo}` : tablaKey;
    const datosTabla = this.datos[campoConPrefijo] || this.datos[tablaKey];
    
    if (datosTabla && Array.isArray(datosTabla)) {
      const longitudOriginal = datosTabla.length;
      const datosFiltrados = datosTabla.filter((item: any) => {
        const valor = item[campoKey]?.toString().toLowerCase() || '';
        return !valor.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        if (prefijo) {
          this.datos[campoConPrefijo] = datosFiltrados;
          this.formularioService.actualizarDato(campoConPrefijo as any, datosFiltrados);
        } else {
          this.datos[tablaKey] = datosFiltrados;
          this.formularioService.actualizarDato(tablaKey as any, datosFiltrados);
        }
      }
    }
  }

  getFieldIdTextoPoblacionSexo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoPoblacionSexoAISD${prefijo}` : 'textoPoblacionSexoAISD';
  }

  getFieldIdTextoPoblacionEtario(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoPoblacionEtarioAISD${prefijo}` : 'textoPoblacionEtarioAISD';
  }

  obtenerTextoPoblacionSexoAISD(): string {
    const fieldId = this.getFieldIdTextoPoblacionSexo();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.textoPoblacionSexoAISD;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const totalPoblacion = this.getTotalPoblacionSexo();
    const porcentajeHombres = this.getPorcentajeHombres();
    const porcentajeMujeres = this.getPorcentajeMujeres();
    
    const textoPorDefecto = `Respecto a la población de la CC ${grupoAISD}, tomando en cuenta data obtenida de los Censos Nacionales 2017 y los puntos de población que la conforman, existen un total de ${totalPoblacion} habitantes que residen permanentemente en la comunidad. De este conjunto, el ${porcentajeHombres} son varones, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares femeninos (${porcentajeMujeres}).`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`)
        .replace(/total de\s*___/g, `total de ${totalPoblacion}`)
        .replace(/existen un total de\s*___/g, `existen un total de ${totalPoblacion}`)
        .replace(/el\s*___\s*son varones/g, `el ${porcentajeHombres} son varones`)
        .replace(/\(\s*___\s*\)/g, `(${porcentajeMujeres})`)
        .replace(/femeninos\s*\(\s*___\s*\)/g, `femeninos (${porcentajeMujeres})`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoPoblacionEtarioAISD(): string {
    const fieldId = this.getFieldIdTextoPoblacionEtario();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.textoPoblacionEtarioAISD;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const grupoMayoritario = this.getGrupoEtarioMayoritario();
    const porcentajeMayoritario = this.getPorcentajeGrupoEtario(grupoMayoritario);
    const grupoSegundo = this.getGrupoEtarioSegundo();
    const porcentajeSegundo = this.getPorcentajeGrupoEtario(grupoSegundo);
    const grupoMenoritario = this.getGrupoEtarioMenoritario();
    const porcentajeMenoritario = this.getPorcentajeGrupoEtario(grupoMenoritario);
    
    const textoPorDefecto = `En una clasificación en grandes grupos de edad, se puede observar que el grupo etario mayoritario en la CC ${grupoAISD} es el de ${grupoMayoritario}, puesto que representa el ${porcentajeMayoritario} de la población total. En segundo lugar, bastante cerca del primero, se halla el bloque etario de ${grupoSegundo} (${porcentajeSegundo}). Por otro lado, el conjunto minoritario está conformado por la población de ${grupoMenoritario}, pues solo representa un ${porcentajeMenoritario}.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`)
        .replace(/es el de\s*___/g, `es el de ${grupoMayoritario}`)
        .replace(/representa el\s*___/g, `representa el ${porcentajeMayoritario}`)
        .replace(/bloque etario de\s*___/g, `bloque etario de ${grupoSegundo}`)
        .replace(/\(\s*___\s*\)/g, `(${porcentajeSegundo})`)
        .replace(/población de\s*___/g, `población de ${grupoMenoritario}`)
        .replace(/representa un\s*___/g, `representa un ${porcentajeMenoritario}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoPoblacionSexoAISDConResaltado(): SafeHtml {
    const texto = this.obtenerTextoPoblacionSexoAISD();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const totalPoblacion = this.getTotalPoblacionSexo();
    const porcentajeHombres = this.getPorcentajeHombres();
    const porcentajeMujeres = this.getPorcentajeMujeres();
    
    let html = this.escapeHtml(texto);
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (totalPoblacion && totalPoblacion !== '____' && totalPoblacion !== '0') {
      html = html.replace(new RegExp(this.escapeRegex(totalPoblacion), 'g'), `<span class="data-calculated">${this.escapeHtml(totalPoblacion)}</span>`);
    }
    if (porcentajeHombres && porcentajeHombres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeHombres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeHombres)}</span>`);
    }
    if (porcentajeMujeres && porcentajeMujeres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeMujeres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeMujeres)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoPoblacionEtarioAISDConResaltado(): SafeHtml {
    const texto = this.obtenerTextoPoblacionEtarioAISD();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const grupoMayoritario = this.getGrupoEtarioMayoritario();
    const porcentajeMayoritario = this.getPorcentajeGrupoEtario(grupoMayoritario);
    const grupoSegundo = this.getGrupoEtarioSegundo();
    const porcentajeSegundo = this.getPorcentajeGrupoEtario(grupoSegundo);
    const grupoMenoritario = this.getGrupoEtarioMenoritario();
    const porcentajeMenoritario = this.getPorcentajeGrupoEtario(grupoMenoritario);
    
    let html = this.escapeHtml(texto);
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (grupoMayoritario && grupoMayoritario !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoMayoritario), 'g'), `<span class="data-calculated">${this.escapeHtml(grupoMayoritario)}</span>`);
    }
    if (porcentajeMayoritario && porcentajeMayoritario !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeMayoritario), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeMayoritario)}</span>`);
    }
    if (grupoSegundo && grupoSegundo !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoSegundo), 'g'), `<span class="data-calculated">${this.escapeHtml(grupoSegundo)}</span>`);
    }
    if (porcentajeSegundo && porcentajeSegundo !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeSegundo), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeSegundo)}</span>`);
    }
    if (grupoMenoritario && grupoMenoritario !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoMenoritario), 'g'), `<span class="data-calculated">${this.escapeHtml(grupoMenoritario)}</span>`);
    }
    if (porcentajeMenoritario && porcentajeMenoritario !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeMenoritario), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeMenoritario)}</span>`);
    }
    
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

  getTablaKeyPoblacionSexo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `poblacionSexoAISD${prefijo}` : 'poblacionSexoAISD';
  }

  getTablaKeyPoblacionEtario(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `poblacionEtarioAISD${prefijo}` : 'poblacionEtarioAISD';
  }
}

