import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { Seccion7TableConfigService } from 'src/app/core/services/domain/seccion7-table-config.service';
import { Seccion7DataService } from 'src/app/core/services/domain/seccion7-data.service';
import { Seccion7TextGeneratorService } from 'src/app/core/services/domain/seccion7-text-generator.service';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion7-form',
    templateUrl: './seccion7-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion7FormComponent extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  
  get seccion7InternalComponent(): Seccion7FormComponent {
    return this;
  }
  
  private datosSubscription?: Subscription;
  private stateSubscription?: Subscription;
  private actualizandoDatos: boolean = false;
  
  override watchedFields: string[] = [
    'grupoAISD', 'distritoSeleccionado', 'poblacionDistritalCahuacho', 'petDistritalCahuacho',
    'ingresoFamiliarPerCapita', 'rankingIngresoPerCapita', 'petTabla', 'peaTabla', 'peaOcupadaTabla',
    'cuadroTituloPET', 'cuadroFuentePET', 'cuadroTituloPEA', 'cuadroFuentePEA',
    'cuadroTituloPEAOcupada', 'cuadroFuentePEAOcupada', 'parrafoSeccion7_situacion_empleo_completo',
    'parrafoSeccion7_ingresos_completo', 'parrafoSeccion7_pet_completo', 'textoDetalePEA', 'textoDefinicionPEA',
    'textoAnalisisPEA', 'textoIndiceDesempleo', 'textoAnalisisOcupacion'
  ];
  
  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  override fotografiasCache: FotoItem[] = [];

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override autoLoader: AutoBackendDataLoaderService,
    private stateAdapter: ReactiveStateAdapter,
    private groupConfig: GroupConfigService,
    private backendApi: BackendApiService,
    private centrosPobladosActivos: CentrosPobladosActivosService,
    private sanitizer: DomSanitizer,
    public tableCfg: Seccion7TableConfigService,
    public dataService: Seccion7DataService,
    public textGenerator: Seccion7TextGeneratorService
  ) {
    super(cdRef, autoLoader, injector, undefined, undefined);
  }

  // Configuraciones de tabla para app-dynamic-table
  get petConfig() {
    return {
      tablaKey: 'petTabla',
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  get peaConfig() {
    return {
      tablaKey: 'peaTabla',
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: false, // Usamos cálculo personalizado
      camposParaCalcular: ['hombres', 'mujeres', 'casos']
    };
  }

  get peaOcupadaConfig() {
    return {
      tablaKey: 'peaOcupadaTabla',
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: false, // Usamos cálculo personalizado
      camposParaCalcular: ['hombres', 'mujeres', 'casos']
    };
  }

  protected override onInitCustom(): void {
    this.asegurarArraysValidos();
    
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTablaInicial = this.datos[petTablaKey] || null;
    this.datosAnteriores[petTablaKey] = petTablaInicial;
    
    this.cargarFotografias();
    this.cargarTablasPEADistrital();
    
    // Suscripción para actualización en tiempo real
    this.stateSubscription = this['stateAdapter'].datos$.subscribe(() => {
      this.cargarFotografias();
      this.cdRef.detectChanges();
    });
    
    this.datosSubscription = this['stateAdapter'].datos$.pipe(
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
      
      this.actualizandoDatos = true;
      this.actualizarDatos();
      this.asegurarArraysValidos();
      this.cargarFotografias();
      
      setTimeout(() => {
        this.cdRef.detectChanges();
        this.actualizandoDatos = false;
      }, 0);
    });
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.datosSubscription?.unsubscribe();
    this.stateSubscription?.unsubscribe();
  }

  protected getSectionKey(): string {
    return 'seccion7_aisd';
  }

  protected override applyLoadedData(loadedData: { [fieldName: string]: any }): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);

    for (const [fieldName, data] of Object.entries(loadedData)) {
      if (data === null || data === undefined) continue;
      const fieldKey = prefijo ? `${fieldName}${prefijo}` : fieldName;

      const actual = this.datos[fieldKey];
      const vieneNoVacio = Array.isArray(data) && data.length > 0;
      const actualEsVacio = !Array.isArray(actual) || actual.length === 0;

      if (this.datos[fieldKey] === undefined || this.datos[fieldKey] === null || (vieneNoVacio && actualEsVacio)) {
        this.onFieldChange(fieldKey as any, data);
      }
    }

    this.actualizarDatos();
    this.calcularPorcentajesPET();
  }

  protected getLoadParameters(): string[] | null {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const codigosActivos = prefijo?.startsWith('_A')
      ? this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo)
      : this.groupConfig.getAISDCCPPActivos();

    return codigosActivos && codigosActivos.length > 0 ? codigosActivos : null;
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTablaActual = datosActuales[petTablaKey] || null;
    const petTablaAnterior = this.datosAnteriores[petTablaKey] || null;

    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const peaTablaActual = datosActuales[peaTablaKey] || null;
    const peaTablaAnterior = this.datosAnteriores[peaTablaKey] || null;

    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    const peaOcupadaTablaActual = datosActuales[peaOcupadaTablaKey] || null;
    const peaOcupadaTablaAnterior = this.datosAnteriores[peaOcupadaTablaKey] || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
      }
    }
    
    if (petTablaActual !== petTablaAnterior) {
      hayCambios = true;
      this.datosAnteriores[petTablaKey] = petTablaActual;
    }

    if (peaTablaActual !== peaTablaAnterior) {
      hayCambios = true;
      this.datosAnteriores[peaTablaKey] = peaTablaActual;
    }

    if (peaOcupadaTablaActual !== peaOcupadaTablaAnterior) {
      hayCambios = true;
      this.datosAnteriores[peaOcupadaTablaKey] = peaOcupadaTablaActual;
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarDatosCustom(): void {
    this.asegurarArraysValidos();
  }

  protected override actualizarValoresConPrefijo(): void {
    this.eliminarFilasTotal();
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  asegurarArraysValidos() {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTabla = this.datos[petTablaKey] || [];
    if (!Array.isArray(petTabla)) {
      this.datos[petTablaKey] = [];
    }
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    if (!Array.isArray(this.datos[peaTablaKey])) {
      this.datos[peaTablaKey] = [];
    }
    if (!Array.isArray(this.datos[peaOcupadaTablaKey])) {
      this.datos[peaOcupadaTablaKey] = [];
    }
    this.eliminarFilasTotal();
  }

  private eliminarFilasTotal(): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTabla = this.datos[petTablaKey];
    if (petTabla && Array.isArray(petTabla)) {
      const longitudOriginal = petTabla.length;
      const datosFiltrados = petTabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.datos[petTablaKey] = datosFiltrados;
        this.onFieldChange(petTablaKey as any, datosFiltrados);
      }
    }
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const peaTabla = this.datos[peaTablaKey];
    if (peaTabla && Array.isArray(peaTabla)) {
      const longitudOriginal = peaTabla.length;
      const datosFiltrados = peaTabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.datos[peaTablaKey] = datosFiltrados;
        this.onFieldChange(peaTablaKey as any, datosFiltrados);
      }
    }
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    const peaOcupadaTabla = this.datos[peaOcupadaTablaKey];
    if (peaOcupadaTabla && Array.isArray(peaOcupadaTabla)) {
      const longitudOriginal = peaOcupadaTabla.length;
      const datosFiltrados = peaOcupadaTabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.datos[peaOcupadaTablaKey] = datosFiltrados;
        this.onFieldChange(peaOcupadaTablaKey as any, datosFiltrados);
      }
    }
  }

  // ============ MÉTODOS DE DATOS (delegados a DataService) ============

  getTablaPET(): any[] {
    return this.dataService.getTablaPET(this.datos, this.seccionId);
  }

  getPETTablaSinTotal(): any[] {
    return this.dataService.getPETTablaSinTotal(this.datos, this.seccionId);
  }

  getTotalPET(): string {
    return this.dataService.getTotalPET(this.datos, this.seccionId);
  }

  getTablaPEA(): any[] {
    return this.dataService.getTablaPEA(this.datos, this.seccionId);
  }

  getPEATableSinTotal(): any[] {
    return this.dataService.getPEATableSinTotal(this.datos, this.seccionId);
  }

  getTotalPEAHombres(): string {
    return this.dataService.getTotalHombres(this.datos, this.seccionId);
  }

  getTotalPEAMujeres(): string {
    return this.dataService.getTotalMujeres(this.datos, this.seccionId);
  }

  getTotalPEA(): string {
    return this.dataService.getTotalPEA(this.datos, this.seccionId);
  }

  getTablaPEAOcupada(): any[] {
    return this.dataService.getTablaPEAOcupada(this.datos, this.seccionId);
  }

  getPEAOcupadaTableSinTotal(): any[] {
    return this.dataService.getPEAOcupadaTableSinTotal(this.datos, this.seccionId);
  }

  getTotalPEAOcupadaHombres(): string {
    return this.dataService.getTotalHombresOcupada(this.datos, this.seccionId);
  }

  getTotalPEAOcupadaMujeres(): string {
    return this.dataService.getTotalMujeresOcupada(this.datos, this.seccionId);
  }

  getTotalPEAOcupada(): string {
    return this.dataService.getTotalPEAOcupada(this.datos, this.seccionId);
  }

  // ============ CÁLCULO DE PORCENTAJES PET ============

  calcularPorcentajesPET(): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTabla = this.datos[petTablaKey];
    
    if (!petTabla || !Array.isArray(petTabla) || petTabla.length === 0) {
      return;
    }
    
    const totalPET = petTabla.reduce((sum: number, item: any) => {
      const casos = parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    if (totalPET === 0) {
      return;
    }
    
    const tablaActualizada = petTabla.map((item: any) => {
      const casos = parseInt(item.casos) || 0;
      const porcentaje = ((casos / totalPET) * 100);
      const porcentajeFormateado = porcentaje.toLocaleString('es-PE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).replace('.', ',') + ' %';
      
      return {
        ...item,
        porcentaje: porcentajeFormateado
      };
    });
    
    this.onFieldChange(petTablaKey as any, tablaActualizada);
    this.datos[petTablaKey] = tablaActualizada;
  }

  calcularPorcentajesPEA(): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const peaTabla = this.datos[peaTablaKey];
    
    if (!peaTabla || !Array.isArray(peaTabla) || peaTabla.length === 0) {
      return;
    }
    
    // Primero calcular casos (hombres + mujeres) y totales (excluyendo fila Total)
    let totalHombres = 0;
    let totalMujeres = 0;
    let totalCasos = 0;
    
    peaTabla.forEach((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        const hombres = parseInt(item.hombres) || 0;
        const mujeres = parseInt(item.mujeres) || 0;
        totalHombres += hombres;
        totalMujeres += mujeres;
        totalCasos += (hombres + mujeres);
      }
    });
    
    if (totalCasos === 0) {
      return;
    }
    
    // Mapear la tabla con todos los cálculos
    const tablaActualizada = peaTabla.map((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      
      // Si es la fila Total, actualizar con los totales calculados
      if (categoria.includes('total')) {
        return {
          ...item,
          hombres: totalHombres,
          mujeres: totalMujeres,
          casos: totalCasos,
          porcentajeHombres: '100,00 %',
          porcentajeMujeres: '100,00 %',
          porcentaje: '100,00 %'
        };
      }
      
      // Para filas normales, calcular todo
      const hombres = parseInt(item.hombres) || 0;
      const mujeres = parseInt(item.mujeres) || 0;
      const casos = hombres + mujeres;
      
      const pctHombres = totalHombres > 0 ? ((hombres / totalHombres) * 100) : 0;
      const pctMujeres = totalMujeres > 0 ? ((mujeres / totalMujeres) * 100) : 0;
      const pctTotal = totalCasos > 0 ? ((casos / totalCasos) * 100) : 0;
      
      return {
        ...item,
        casos: casos,
        porcentajeHombres: pctHombres.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %',
        porcentajeMujeres: pctMujeres.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %',
        porcentaje: pctTotal.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %'
      };
    });
    
    this.onFieldChange(peaTablaKey as any, tablaActualizada);
    this.datos[peaTablaKey] = tablaActualizada;
  }

  calcularPorcentajesPEAOcupada(): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    const peaOcupadaTabla = this.datos[peaOcupadaTablaKey];
    
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla) || peaOcupadaTabla.length === 0) {
      return;
    }
    
    // Primero calcular casos (hombres + mujeres) y totales (excluyendo fila Total)
    let totalHombres = 0;
    let totalMujeres = 0;
    let totalCasos = 0;
    
    peaOcupadaTabla.forEach((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        const hombres = parseInt(item.hombres) || 0;
        const mujeres = parseInt(item.mujeres) || 0;
        totalHombres += hombres;
        totalMujeres += mujeres;
        totalCasos += (hombres + mujeres);
      }
    });
    
    if (totalCasos === 0) {
      return;
    }
    
    // Mapear la tabla con todos los cálculos
    const tablaActualizada = peaOcupadaTabla.map((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      
      // Si es la fila Total, actualizar con los totales calculados
      if (categoria.includes('total')) {
        return {
          ...item,
          hombres: totalHombres,
          mujeres: totalMujeres,
          casos: totalCasos,
          porcentajeHombres: '100,00 %',
          porcentajeMujeres: '100,00 %',
          porcentaje: '100,00 %'
        };
      }
      
      // Para filas normales, calcular todo
      const hombres = parseInt(item.hombres) || 0;
      const mujeres = parseInt(item.mujeres) || 0;
      const casos = hombres + mujeres;
      
      const pctHombres = totalHombres > 0 ? ((hombres / totalHombres) * 100) : 0;
      const pctMujeres = totalMujeres > 0 ? ((mujeres / totalMujeres) * 100) : 0;
      const pctTotal = totalCasos > 0 ? ((casos / totalCasos) * 100) : 0;
      
      return {
        ...item,
        casos: casos,
        porcentajeHombres: pctHombres.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %',
        porcentajeMujeres: pctMujeres.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %',
        porcentaje: pctTotal.toLocaleString('es-PE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).replace('.', ',') + ' %'
      };
    });
    
    this.onFieldChange(peaOcupadaTablaKey as any, tablaActualizada);
    this.datos[peaOcupadaTablaKey] = tablaActualizada;
  }

  // ============ CARGA DE DATOS DE BACKEND ============

  private cargarTablasPEADistrital(): void {
    const ccppActivos = this.getLoadParameters() || [];
    if (!Array.isArray(ccppActivos) || ccppActivos.length === 0) {
      return;
    }

    const ubigeo = this.obtenerUbigeoDistritoDesdeCCPP(ccppActivos);
    if (!ubigeo) {
      return;
    }

    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';

    this.backendApi.getPEADistrital(ubigeo).pipe(
      map((r: any) => r?.data || null),
      catchError(() => of(null)),
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      if (!data) {
        return;
      }

      const peaTabla = this.construirTablaPEADesdeEstados(data.pea_estados || []);
      const peaOcupadaTabla = this.construirTablaPEAOcupada(data.pea_estados || []);

      this.onFieldChange(peaTablaKey as any, peaTabla);
      this.onFieldChange(peaOcupadaTablaKey as any, peaOcupadaTabla);
    });
  }

  private construirTablaPEADesdeEstados(peaEstados: any[]): any[] {
    if (!peaEstados || peaEstados.length === 0) {
      return [];
    }

    const totalGeneral = peaEstados.reduce((sum, e) => sum + (parseInt(e.total) || 0), 0);
    const totalHombres = peaEstados.reduce((sum, e) => sum + (parseInt(e.hombres) || 0), 0);
    const totalMujeres = peaEstados.reduce((sum, e) => sum + (parseInt(e.mujeres) || 0), 0);

    return peaEstados.map((estado: any) => {
      const total = parseInt(estado.total) || 0;
      const hombres = parseInt(estado.hombres) || 0;
      const mujeres = parseInt(estado.mujeres) || 0;
      
      const porcentajeTotal = totalGeneral > 0 ? (total / totalGeneral) * 100 : 0;
      const porcentajeHombres = totalHombres > 0 ? (hombres / totalHombres) * 100 : 0;
      const porcentajeMujeres = totalMujeres > 0 ? (mujeres / totalMujeres) * 100 : 0;
      
      return {
        categoria: estado.categoria,
        hombres: hombres,
        porcentajeHombres: porcentajeHombres.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %',
        mujeres: mujeres,
        porcentajeMujeres: porcentajeMujeres.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %',
        casos: total,
        porcentaje: porcentajeTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %'
      };
    });
  }

  private construirTablaPEAOcupada(peaEstados: any[]): any[] {
    if (!Array.isArray(peaEstados) || peaEstados.length === 0) {
      return [];
    }

    const matchEstado = (needle: string) =>
      peaEstados.find((e: any) => (e?.categoria || '').toString().toLowerCase() === needle);

    const ocupada = matchEstado('pea ocupada') || matchEstado('pea_ocupada');
    const desocupada = matchEstado('pea desocupada') || matchEstado('pea_desocupada');

    const ocupadaTotal = parseInt(ocupada?.total) || 0;
    const ocupadaHombres = parseInt(ocupada?.hombres) || 0;
    const ocupadaMujeres = parseInt(ocupada?.mujeres) || 0;

    const desocupadaTotal = parseInt(desocupada?.total) || 0;
    const desocupadaHombres = parseInt(desocupada?.hombres) || 0;
    const desocupadaMujeres = parseInt(desocupada?.mujeres) || 0;

    const total = ocupadaTotal + desocupadaTotal;
    const totalHombres = ocupadaHombres + desocupadaHombres;
    const totalMujeres = ocupadaMujeres + desocupadaMujeres;

    if (total === 0) {
      return [];
    }

    const fmt = (v: number, d: number) =>
      (d > 0 ? (v / d) * 100 : 0)
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

    return [
      {
        categoria: 'PEA Ocupada',
        hombres: ocupadaHombres,
        porcentajeHombres: fmt(ocupadaHombres, totalHombres),
        mujeres: ocupadaMujeres,
        porcentajeMujeres: fmt(ocupadaMujeres, totalMujeres),
        casos: ocupadaTotal,
        porcentaje: fmt(ocupadaTotal, total)
      },
      {
        categoria: 'PEA Desocupada',
        hombres: desocupadaHombres,
        porcentajeHombres: fmt(desocupadaHombres, totalHombres),
        mujeres: desocupadaMujeres,
        porcentajeMujeres: fmt(desocupadaMujeres, totalMujeres),
        casos: desocupadaTotal,
        porcentaje: fmt(desocupadaTotal, total)
      }
    ];
  }

  private obtenerUbigeoDistritoDesdeCCPP(ccppActivos: string[]): string | null {
    const primero = ccppActivos.find(c => !!c)?.toString() || '';
    if (!primero) {
      return null;
    }
    const sinCerosIzq = primero.replace(/^0+/, '') || '0';
    const seis = sinCerosIzq.substring(0, 6);
    return seis.length === 6 ? seis : null;
  }

  // ============ GESTIÓN DE FOTOGRAFÍAS ============

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  override onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  // ============ MÉTODOS DE TEXTO (delegados a TextGeneratorService) ============

  obtenerTextoSeccion7PETCompleto(): string {
    return this.textGenerator.obtenerTextoSeccion7PETCompleto(
      this.datos,
      this.seccionId,
      () => this.getPorcentajePET(),
      (grupo: string) => this.getPorcentajePETGrupo(grupo),
      () => this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoPET(): string {
    return this.textGenerator.obtenerTextoPET(
      this.datos,
      (grupo: string) => this.getPorcentajePETGrupo(grupo),
      () => this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoDetalePEA(): string {
    return this.textGenerator.obtenerTextoDetalePEA(this.datos);
  }

  obtenerTextoDefinicionPEA(): string {
    return this.textGenerator.obtenerTextoDefinicionPEA(
      this.datos,
      () => this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoAnalisisPEA(): string {
    return this.textGenerator.obtenerTextoAnalisisPEA(
      this.datos,
      () => this.getPorcentajePEA(),
      () => this.getPorcentajeNoPEA(),
      () => this.getPorcentajePEAHombres(),
      () => this.getPorcentajeNoPEAMujeres()
    );
  }

  obtenerTextoIndiceDesempleo(): string {
    return this.textGenerator.obtenerTextoIndiceDesempleo(
      this.datos,
      () => this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoAnalisisOcupacion(): string {
    return this.textGenerator.obtenerTextoAnalisisOcupacion(
      this.datos,
      () => this.getPorcentajePEADesocupada(),
      () => this.getPorcentajePEAOcupadaHombres(),
      () => this.getPorcentajePEAOcupadaMujeres()
    );
  }

  obtenerTextoSeccion7SituacionEmpleoCompleto(): string {
    return this.textGenerator.obtenerTextoSeccion7SituacionEmpleoCompleto(
      this.datos,
      this.seccionId,
      () => this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoSeccion7IngresosCompleto(): string {
    return this.textGenerator.obtenerTextoSeccion7IngresosCompleto(
      this.datos,
      this.seccionId,
      () => this.obtenerNombreComunidadActual()
    );
  }

  // ============ MÉTODOS DE PORCENTAJES ============

  getPorcentajePET(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const poblacionKey = prefijo ? `tablaAISD2TotalPoblacion${prefijo}` : 'tablaAISD2TotalPoblacion';
    const totalPoblacion = parseInt(this.datos[poblacionKey] || this.datos.tablaAISD2TotalPoblacion || '0') || 0;
    const totalPET = parseInt(this.getTotalPET()) || 0;
    
    if (totalPoblacion === 0 || totalPET === 0) {
      return '____';
    }
    
    const porcentaje = ((totalPET / totalPoblacion) * 100);
    return porcentaje.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %';
  }

  getPorcentajePETGrupo(rangoInicio: string): string {
    const petTabla = this.getTablaPET();
    if (!petTabla || !Array.isArray(petTabla)) {
      return '____';
    }
    
    const grupo = petTabla.find((item: any) => {
      if (!item.categoria) return false;
      const cat = item.categoria.toString().toLowerCase();
      const rangoLower = rangoInicio.toLowerCase();
      
      if (rangoLower === '15 a 29' || rangoLower === '15-29') {
        return cat.includes('15') && (cat.includes('29') || cat.includes('30'));
      }
      if (rangoLower === '65' || rangoLower === '65 a más') {
        return cat.includes('65') || cat.includes('65 a más');
      }
      
      return cat.includes(rangoLower);
    });
    
    return grupo?.porcentaje || '____';
  }

  getPorcentajePEA(): string {
    const peaTabla = this.getTablaPEA();
    if (!peaTabla || !Array.isArray(peaTabla)) {
      return '____';
    }
    const pea = peaTabla.find((item: any) => 
      item.categoria && item.categoria.includes('PEA Ocupada')
    );
    return pea?.porcentaje || '____';
  }

  getPorcentajeNoPEA(): string {
    const peaTabla = this.getTablaPEA();
    if (!peaTabla || !Array.isArray(peaTabla)) {
      return '____';
    }
    const noPea = peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentaje || '____';
  }

  getPorcentajePEAHombres(): string {
    const peaTabla = this.getTablaPEA();
    if (!peaTabla || !Array.isArray(peaTabla)) {
      return '____';
    }
    const pea = peaTabla.find((item: any) => 
      item.categoria && item.categoria.includes('PEA Ocupada')
    );
    return pea?.porcentajeHombres || '____';
  }

  getPorcentajeNoPEAMujeres(): string {
    const peaTabla = this.getTablaPEA();
    if (!peaTabla || !Array.isArray(peaTabla)) {
      return '____';
    }
    const noPea = peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentajeMujeres || '____';
  }

  getPorcentajePEADesocupada(): string {
    const peaOcupadaTabla = this.getTablaPEAOcupada();
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla)) {
      return '____';
    }
    const desocupada = peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('desocupada')
    );
    return desocupada?.porcentaje || '____';
  }

  getPorcentajePEAOcupadaHombres(): string {
    const peaOcupadaTabla = this.getTablaPEAOcupada();
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeHombres || '____';
  }

  getPorcentajePEAOcupadaMujeres(): string {
    const peaOcupadaTabla = this.getTablaPEAOcupada();
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeMujeres || '____';
  }

  // ============ HANDLERS DE CAMBIO DE CAMPO ============

  protected override onFieldChange(fieldId: string, value: any): void {
    let valorLimpio: any = value;
    if (value === undefined || value === 'undefined') {
      valorLimpio = '';
    }

    super.onFieldChange(fieldId, valorLimpio);
    this.cdRef.detectChanges();
  }

  // Métodos de callback para tablas dinámicas
  onTablaPETActualizada(): void {
    this.calcularPorcentajesPET();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTablaPEAActualizada(): void {
    this.calcularPorcentajesPEA();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTablaPEAOcupadaActualizada(): void {
    this.calcularPorcentajesPEAOcupada();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  trackByIndex(index: number): number {
    return index;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
}
