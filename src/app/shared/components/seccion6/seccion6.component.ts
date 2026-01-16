import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
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
  selector: 'app-seccion6',
  templateUrl: './seccion6.component.html',
  styleUrls: ['./seccion6.component.css']
})
export class Seccion6Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
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
    private tableService: TableManagementService,
    private stateService: StateService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    this.verificarCargaDatos();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private verificarCargaDatos(): void {
    setTimeout(() => {
      this.eliminarFilasTotal('poblacionSexoAISD', 'sexo');
      this.eliminarFilasTotal('poblacionEtarioAISD', 'categoria');
      
      const datos = this.formularioService.obtenerDatos();
      console.log('🔍 [Seccion6] Verificando carga de datos del backend...');
      console.log('📊 Población por sexo:', datos['poblacionSexoAISD']);
      console.log('📊 Población etario:', datos['poblacionEtarioAISD']);
      
      if (datos['poblacionSexoAISD'] && Array.isArray(datos['poblacionSexoAISD']) && datos['poblacionSexoAISD'].length > 0) {
        console.log('✅ Datos de población por sexo cargados correctamente');
      } else {
        console.warn('⚠️ No hay datos de población por sexo. Verifica que el backend esté respondiendo.');
      }
      
      if (datos['poblacionEtarioAISD'] && Array.isArray(datos['poblacionEtarioAISD']) && datos['poblacionEtarioAISD'].length > 0) {
        console.log('✅ Datos de población etario cargados correctamente');
      } else {
        console.warn('⚠️ No hay datos de población etario. Verifica que el backend esté respondiendo.');
      }
    }, 1000);
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
    
    const poblacionSexoActual = datosActuales['poblacionSexoAISD'] || [];
    const poblacionSexoAnterior = this.datosAnteriores.poblacionSexoAISD || [];
    const hayCambioPoblacionSexo = JSON.stringify(poblacionSexoActual) !== JSON.stringify(poblacionSexoAnterior);
    
    const poblacionEtarioActual = datosActuales['poblacionEtarioAISD'] || [];
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
    this.eliminarFilasTotal('poblacionSexoAISD', 'sexo');
    this.eliminarFilasTotal('poblacionEtarioAISD', 'categoria');
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
    
    if (this.datos.poblacionSexoAISD && Array.isArray(this.datos.poblacionSexoAISD)) {
      this.datosAnteriores.poblacionSexoAISD = JSON.parse(JSON.stringify(this.datos.poblacionSexoAISD));
    } else {
      this.datosAnteriores.poblacionSexoAISD = [];
    }
    
    if (this.datos.poblacionEtarioAISD && Array.isArray(this.datos.poblacionEtarioAISD)) {
      this.datosAnteriores.poblacionEtarioAISD = JSON.parse(JSON.stringify(this.datos.poblacionEtarioAISD));
    } else {
      this.datosAnteriores.poblacionEtarioAISD = [];
    }
    
    this.datosAnteriores.textoPoblacionSexoAISD = this.datos.textoPoblacionSexoAISD || null;
    this.datosAnteriores.textoPoblacionEtarioAISD = this.datos.textoPoblacionEtarioAISD || null;
  }

  getPorcentajeHombres(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '____';
    }
    const hombres = this.datos.poblacionSexoAISD.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('hombre') || item.sexo.toLowerCase().includes('varon'))
    );
    return hombres?.porcentaje || '____';
  }

  getPorcentajeMujeres(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '____';
    }
    const mujeres = this.datos.poblacionSexoAISD.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('mujer') || item.sexo.toLowerCase().includes('femenin'))
    );
    return mujeres?.porcentaje || '____';
  }

  getPorcentajeGrupoEtario(categoria: string): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '____';
    }
    
    const grupo = this.datos.poblacionEtarioAISD.find((item: any) => {
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
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '15 a 29 años';
    }
    
    let mayorPorcentaje = 0;
    let grupoMayoritario = '15 a 29 años';
    
    this.datos.poblacionEtarioAISD.forEach((item: any) => {
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
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '0 a 14 años';
    }
    
    const gruposOrdenados = [...this.datos.poblacionEtarioAISD]
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
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '65 años a más';
    }
    
    let menorPorcentaje = Infinity;
    let grupoMenoritario = '65 años a más';
    
    this.datos.poblacionEtarioAISD.forEach((item: any) => {
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
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return [];
    }
    return this.datos.poblacionSexoAISD.filter((item: any) => {
      const sexo = item.sexo?.toString().toLowerCase() || '';
      return !sexo.includes('total');
    });
  }

  getPoblacionEtarioSinTotal(): any[] {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return [];
    }
    return this.datos.poblacionEtarioAISD.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPoblacionSexo(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
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
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
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
    if (this.seccionId === '3.1.4.A.1.2' || this.seccionId.startsWith('3.1.4.A.1.')) return '_A1';
    if (this.seccionId === '3.1.4.A.2.2' || this.seccionId.startsWith('3.1.4.A.2.')) return '_A2';
    if (this.seccionId === '3.1.4.B.1.2' || this.seccionId.startsWith('3.1.4.B.1.')) return '_B1';
    if (this.seccionId === '3.1.4.B.2.2' || this.seccionId.startsWith('3.1.4.B.2.')) return '_B2';
    return '';
  }

  getFotografiasDemografiaVista(): any[] {
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
  }

  onPoblacionSexoFieldChange(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.poblacionSexoConfig, index, field, value, false);
    if (field === 'casos' && this.datos['tablaAISD2TotalPoblacion']) {
      const total = parseInt(this.datos['tablaAISD2TotalPoblacion']) || 0;
      if (total > 0) {
        const casos = parseInt(value) || 0;
        const porcentaje = ((casos / total) * 100).toFixed(2) + '%';
        this.datos['poblacionSexoAISD'][index].porcentaje = porcentaje;
      }
    }
    this.eliminarFilasTotal('poblacionSexoAISD', 'sexo');
    this.formularioService.actualizarDato('poblacionSexoAISD', this.datos['poblacionSexoAISD']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onPoblacionEtarioFieldChange(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.poblacionEtarioConfig, index, field, value, false);
    if (field === 'casos' && this.datos['tablaAISD2TotalPoblacion']) {
      const total = parseInt(this.datos['tablaAISD2TotalPoblacion']) || 0;
      if (total > 0) {
        const casos = parseInt(value) || 0;
        const porcentaje = ((casos / total) * 100).toFixed(2) + '%';
        this.datos['poblacionEtarioAISD'][index].porcentaje = porcentaje;
      }
    }
    this.eliminarFilasTotal('poblacionEtarioAISD', 'categoria');
    this.formularioService.actualizarDato('poblacionEtarioAISD', this.datos['poblacionEtarioAISD']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onPoblacionSexoTableUpdated() {
    this.eliminarFilasTotal('poblacionSexoAISD', 'sexo');
    this.formularioService.actualizarDato('poblacionSexoAISD', this.datos['poblacionSexoAISD']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onPoblacionEtarioTableUpdated() {
    this.eliminarFilasTotal('poblacionEtarioAISD', 'categoria');
    this.formularioService.actualizarDato('poblacionEtarioAISD', this.datos['poblacionEtarioAISD']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  private eliminarFilasTotal(tablaKey: string, campoKey: string): void {
    if (this.datos[tablaKey] && Array.isArray(this.datos[tablaKey])) {
      const longitudOriginal = this.datos[tablaKey].length;
      const datosFiltrados = this.datos[tablaKey].filter((item: any) => {
        const valor = item[campoKey]?.toString().toLowerCase() || '';
        return !valor.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.datos[tablaKey] = datosFiltrados;
      }
    }
  }

  obtenerTextoPoblacionSexoAISD(): string {
    if (this.datos.textoPoblacionSexoAISD && this.datos.textoPoblacionSexoAISD !== '____') {
      return this.datos.textoPoblacionSexoAISD;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const totalPoblacion = this.datos.tablaAISD2TotalPoblacion || '____';
    const porcentajeHombres = this.getPorcentajeHombres();
    const porcentajeMujeres = this.getPorcentajeMujeres();
    
    return `Respecto a la población de la CC ${grupoAISD}, tomando en cuenta data obtenida de los Censos Nacionales 2017 y los puntos de población que la conforman, existen un total de ${totalPoblacion} habitantes que residen permanentemente en la comunidad. De este conjunto, el ${porcentajeHombres} son varones, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares femeninos (${porcentajeMujeres}).`;
  }

  obtenerTextoPoblacionEtarioAISD(): string {
    if (this.datos.textoPoblacionEtarioAISD && this.datos.textoPoblacionEtarioAISD !== '____') {
      return this.datos.textoPoblacionEtarioAISD;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const grupoMayoritario = this.getGrupoEtarioMayoritario();
    const porcentajeMayoritario = this.getPorcentajeGrupoEtario(grupoMayoritario);
    const grupoSegundo = this.getGrupoEtarioSegundo();
    const porcentajeSegundo = this.getPorcentajeGrupoEtario(grupoSegundo);
    const grupoMenoritario = this.getGrupoEtarioMenoritario();
    const porcentajeMenoritario = this.getPorcentajeGrupoEtario(grupoMenoritario);
    
    return `En una clasificación en grandes grupos de edad, se puede observar que el grupo etario mayoritario en la CC ${grupoAISD} es el de ${grupoMayoritario}, puesto que representa el ${porcentajeMayoritario} de la población total. En segundo lugar, bastante cerca del primero, se halla el bloque etario de ${grupoSegundo} (${porcentajeSegundo}). Por otro lado, el conjunto minoritario está conformado por la población de ${grupoMenoritario}, pues solo representa un ${porcentajeMenoritario}.`;
  }
}

