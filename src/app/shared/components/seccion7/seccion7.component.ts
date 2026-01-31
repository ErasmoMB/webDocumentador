import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { debugLog } from 'src/app/shared/utils/debug';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { TableWrapperComponent } from '../table-wrapper/table-wrapper.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule
  ],
  selector: 'app-seccion7',
  templateUrl: './seccion7.component.html',
  styleUrls: ['./seccion7.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion7Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private datosSubscription?: Subscription;
  private stateSubscription?: Subscription;
  private actualizandoDatos: boolean = false;
  
  // Cached tables with calculated percentages
  private petTablaConPorcentajes: any[] = [];
  private peaTablaConPorcentajes: any[] = [];
  private peaOcupadaTablaConPorcentajes: any[] = [];
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'poblacionDistritalCahuacho', 'petDistritalCahuacho', 'ingresoFamiliarPerCapita', 'rankingIngresoPerCapita', 'petTabla', 'peaTabla', 'peaOcupadaTabla', 'cuadroTituloPET', 'cuadroFuentePET', 'cuadroTituloPEA', 'cuadroFuentePEA', 'cuadroTituloPEAOcupada', 'cuadroFuentePEAOcupada', 'parrafoSeccion7_situacion_empleo_completo', 'parrafoSeccion7_ingresos_completo', 'textoPET', 'textoDetalePEA', 'textoDefinicionPEA', 'textoAnalisisPEA', 'textoIndiceDesempleo', 'textoAnalisisOcupacion'];
  
  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  override fotografiasCache: FotoItem[] = [];

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override autoLoader: AutoBackendDataLoaderService,
    private stateAdapter: ReactiveStateAdapter,
    private groupConfig: GroupConfigService,
    private centrosPobladosActivos: CentrosPobladosActivosService,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, autoLoader, injector, undefined, undefined);
  }

  protected override onInitCustom(): void {
    this.asegurarArraysValidos();
    this.calcularPorcentajesPET();
    this.calcularPorcentajesPEA();
    this.calcularPorcentajesPEAOcupada();
    
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTablaInicial = this.datos[petTablaKey] || null;
    this.datosAnteriores[petTablaKey] = petTablaInicial;
    
    this.cargarFotografias();
    this.cargarTablasPEADistrital();
    
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
    
    this.datosSubscription = this.stateAdapter.datos$.pipe(
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
    if (this.datosSubscription) {
      this.datosSubscription.unsubscribe();
    }
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
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
    const petTablaAnteriorKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTablaAnterior = this.datosAnteriores[petTablaAnteriorKey] || null;

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
      this.datosAnteriores[petTablaAnteriorKey] = petTablaActual;
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

  getTablaKeyPET(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `petTabla${prefijo}` : 'petTabla';
  }

  private getTablaPET(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'petTabla', this.seccionId);
    return pref || this.datos.petTabla || [];
  }

  private getTablaPEA(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'peaTabla', this.seccionId);
    return pref || this.datos.peaTabla || [];
  }

  private getTablaPEAOcupada(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'peaOcupadaTabla', this.seccionId);
    return pref || this.datos.peaOcupadaTabla || [];
  }

  private calcularPorcentajesPET(): void {
    const petTabla = this.getTablaPET();
    if (!petTabla || !Array.isArray(petTabla)) {
      this.petTablaConPorcentajes = [];
      return;
    }

    // Calcular total dinámicamente como suma de casos en la tabla
    const total = petTabla.reduce((sum, item) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return sum;
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      debugLog('⚠️ Total casos en tabla PET <= 0, retornando sin porcentajes');
      this.petTablaConPorcentajes = petTabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      return;
    }

    // Calcular porcentajes basados en el total de la tabla
    const tablaConPorcentajes = petTabla.map((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) {
        return null; // Excluir filas total
      }

      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      debugLog(`📊 Cálculo porcentaje PET ${item.categoria}: ${casos} / ${total} = ${porcentaje.toFixed(2)}% -> ${porcentajeFormateado}`);

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    }).filter(item => item !== null);

    this.petTablaConPorcentajes = tablaConPorcentajes;
    debugLog('✅ PET tabla con porcentajes calculada:', this.petTablaConPorcentajes);
  }

  private calcularPorcentajesPEA(): void {
    const peaTabla = this.getTablaPEA();
    if (!peaTabla || !Array.isArray(peaTabla)) {
      this.peaTablaConPorcentajes = [];
      return;
    }

    // Filtrar filas que no son total
    const datosSinTotal = peaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });

    if (datosSinTotal.length === 0) {
      this.peaTablaConPorcentajes = [];
      return;
    }

    // Calcular totales para porcentajes
    const totalHombres = datosSinTotal.reduce((sum: number, item: any) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      return sum + hombres;
    }, 0);

    const totalMujeres = datosSinTotal.reduce((sum: number, item: any) => {
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      return sum + mujeres;
    }, 0);

    const totalCasos = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    // Calcular porcentajes
    const tablaConPorcentajes = datosSinTotal.map((item: any) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;

      let porcentajeHombres = '';
      let porcentajeMujeres = '';
      let porcentaje = '';

      if (totalHombres > 0) {
        porcentajeHombres = ((hombres / totalHombres) * 100)
          .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          .replace('.', ',') + ' %';
      }

      if (totalMujeres > 0) {
        porcentajeMujeres = ((mujeres / totalMujeres) * 100)
          .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          .replace('.', ',') + ' %';
      }

      if (totalCasos > 0) {
        porcentaje = ((casos / totalCasos) * 100)
          .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          .replace('.', ',') + ' %';
      }

      return {
        ...item,
        hombres,
        mujeres,
        casos,
        porcentajeHombres,
        porcentajeMujeres,
        porcentaje
      };
    });

    this.peaTablaConPorcentajes = tablaConPorcentajes;
  }

  private calcularPorcentajesPEAOcupada(): void {
    const peaOcupadaTabla = this.getTablaPEAOcupada();
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla)) {
      this.peaOcupadaTablaConPorcentajes = [];
      return;
    }

    // Filtrar filas que no son total
    const datosSinTotal = peaOcupadaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });

    if (datosSinTotal.length === 0) {
      this.peaOcupadaTablaConPorcentajes = [];
      return;
    }

    // Calcular totales para porcentajes
    const totalHombres = datosSinTotal.reduce((sum: number, item: any) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      return sum + hombres;
    }, 0);

    const totalMujeres = datosSinTotal.reduce((sum: number, item: any) => {
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      return sum + mujeres;
    }, 0);

    const totalCasos = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    // Calcular porcentajes
    const tablaConPorcentajes = datosSinTotal.map((item: any) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;

      let porcentajeHombres = '';
      let porcentajeMujeres = '';
      let porcentaje = '';

      if (totalHombres > 0) {
        porcentajeHombres = ((hombres / totalHombres) * 100)
          .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          .replace('.', ',') + ' %';
      }

      if (totalMujeres > 0) {
        porcentajeMujeres = ((mujeres / totalMujeres) * 100)
          .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          .replace('.', ',') + ' %';
      }

      if (totalCasos > 0) {
        porcentaje = ((casos / totalCasos) * 100)
          .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          .replace('.', ',') + ' %';
      }

      return {
        ...item,
        hombres,
        mujeres,
        casos,
        porcentajeHombres,
        porcentajeMujeres,
        porcentaje
      };
    });

    this.peaOcupadaTablaConPorcentajes = tablaConPorcentajes;
  }

  getPETTablaSinTotal(): any[] {
    return this.petTablaConPorcentajes;
  }

  getTotalPET(): string {
    const datosSinTotal = this.getPETTablaSinTotal();
    if (datosSinTotal.length === 0) {
      return '0';
    }
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  onPETFieldChange(index: number, field: string, value: any): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const tabla = this.getTablaPET();

    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;

      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);

        if (total > 0) {
          const casos = typeof tabla[index].casos === 'number' ? tabla[index].casos : parseInt(tabla[index].casos) || 0;
          const porcentaje = ((casos / total) * 100)
            .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            .replace('.', ',') + ' %';
          tabla[index].porcentaje = porcentaje;
        }

        // CRÍTICO: Limpiar párrafo personalizado para que se regenere
        const parrafoPETKey = prefijo ? `parrafoSeccion7_pet_completo${prefijo}` : 'parrafoSeccion7_pet_completo';
        if (this.datos[parrafoPETKey]) {
          delete this.datos[parrafoPETKey];
          this.onFieldChange(parrafoPETKey as any, null);
        }
      }

      this.datos[petTablaKey] = [...tabla];
      this.onFieldChange(petTablaKey as any, tabla);
      this.calcularPorcentajesPET();
      this.cdRef.detectChanges();
    }
  }

  onPEAFieldChange(index: number, field: string, value: any): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const tabla = this.getTablaPEA();

    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;

      if (field === 'casos' || field === 'hombres' || field === 'mujeres') {
        const textoPEAKey = prefijo ? `textoDefinicionPEA${prefijo}` : 'textoDefinicionPEA';
        if (this.datos[textoPEAKey]) {
          delete this.datos[textoPEAKey];
          this.onFieldChange(textoPEAKey as any, null);
        }
      }

      this.datos[peaTablaKey] = [...tabla];
      this.onFieldChange(peaTablaKey as any, tabla);
      this.calcularPorcentajesPEA();
      this.cdRef.detectChanges();
    }
  }

  onPEAOcupadaFieldChange(index: number, field: string, value: any): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    const tabla = this.getTablaPEAOcupada();

    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;

      if (field === 'casos' || field === 'hombres' || field === 'mujeres') {
        const textoAnalisisKey = prefijo ? `textoAnalisisOcupacion${prefijo}` : 'textoAnalisisOcupacion';
        if (this.datos[textoAnalisisKey]) {
          delete this.datos[textoAnalisisKey];
          this.onFieldChange(textoAnalisisKey as any, null);
        }
      }

      this.datos[peaOcupadaTablaKey] = [...tabla];
      this.onFieldChange(peaOcupadaTablaKey as any, tabla);
      this.calcularPorcentajesPEAOcupada();
      this.cdRef.detectChanges();
    }
  }

  getPEATableSinTotal(): any[] {
    return this.peaTablaConPorcentajes;
  }

  getPEAOcupadaTableSinTotal(): any[] {
    return this.peaOcupadaTablaConPorcentajes;
  }

  getTotalPEA(): string {
    const datosSinTotal = this.getPEATableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalPEAHombres(): string {
    const datosSinTotal = this.getPEATableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      return sum + hombres;
    }, 0);
    return total.toString();
  }

  getTotalPEAMujeres(): string {
    const datosSinTotal = this.getPEATableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      return sum + mujeres;
    }, 0);
    return total.toString();
  }

  getTotalPEAOcupada(): string {
    const datosSinTotal = this.getPEAOcupadaTableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalPEAOcupadaHombres(): string {
    const datosSinTotal = this.getPEAOcupadaTableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      return sum + hombres;
    }, 0);
    return total.toString();
  }

  getTotalPEAOcupadaMujeres(): string {
    const datosSinTotal = this.getPEAOcupadaTableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      return sum + mujeres;
    }, 0);
    return total.toString();
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
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const poblacionKey = prefijo ? `tablaAISD2TotalPoblacion${prefijo}` : 'tablaAISD2TotalPoblacion';
    const totalPoblacion = parseInt(this.datos[poblacionKey] || this.datos.tablaAISD2TotalPoblacion || '0') || 0;
    const totalPET = parseInt(this.getTotalPET()) || 0;
    
    if (totalPoblacion === 0 || totalPET === 0) {
      return '____';
    }
    
    const porcentaje = ((totalPET / totalPoblacion) * 100);
    const resultado = porcentaje.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %';
    return resultado;
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

  getPorcentajePEAOcupada(): string {
    const peaOcupadaTabla = this.getTablaPEAOcupada();
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentaje || '____';
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

    // Mock implementation - replace with actual API call when BackendApiService is available
    // this.backendApi.getPEADistrital(ubigeo).pipe(
    //   map((r: any) => r?.data || null),
    //   catchError(() => of(null)),
    //   takeUntil(this.destroy$)
    // ).subscribe((data: any) => {
    //   if (!data) {
    //     return;
    //   }

    //   const peaTabla = this.construirTablaPEADesdeEstados(data.pea_estados || []);
    //   const peaOcupadaTabla = this.construirTablaPEAOcupada(data.pea_estados || []);

    //   this.onFieldChange(peaTablaKey as any, peaTabla);
    //   this.onFieldChange(peaOcupadaTablaKey as any, peaOcupadaTabla);
    // });

    // For now, use mock data
    const mockData = {
      pea_estados: [
        { estado: 'Ocupado', total: 300, hombres: 200, mujeres: 100 },
        { estado: 'Desocupado', total: 50, hombres: 30, mujeres: 20 }
      ]
    };

    const peaTabla = this.construirTablaPEADesdeEstados(mockData.pea_estados);
    const peaOcupadaTabla = this.construirTablaPEAOcupada(mockData.pea_estados);

    this.onFieldChange(peaTablaKey as any, peaTabla);
    this.onFieldChange(peaOcupadaTablaKey as any, peaOcupadaTabla);
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

  trackByIndex(index: number): number {
    return index;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasPEAVista(): FotoItem[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return this.fotografiasCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotografias = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    return fotografias || [];
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

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

  override onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion7PETCompleto(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let textoPersonalizado = this.datos.parrafoSeccion7_pet_completo;
    if (!textoPersonalizado && prefijo) {
      textoPersonalizado = this.datos[`parrafoSeccion7_pet_completo${prefijo}`];
    }
    if (textoPersonalizado && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajePET = this.getPorcentajePET();
    const porcentaje1529 = this.getPorcentajePETGrupo('15 a 29');
    const porcentaje65 = this.getPorcentajePETGrupo('65');
    
    return `En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar.\n\nLa población en edad de trabajar (PET) de la CC ${grupoAISD}, considerada desde los 15 años a más, se compone del ${porcentajePET} de la población total. El bloque etario que más aporta a la PET es el de 15 a 29 años, pues representa el ${porcentaje1529} de este grupo poblacional. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más al representar solamente un ${porcentaje65}.`;
  }

  obtenerTextoSeccion7PETCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion7PETCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajePET = this.getPorcentajePET();
    const porcentaje1529 = this.getPorcentajePETGrupo('15 a 29');
    const porcentaje65 = this.getPorcentajePETGrupo('65');
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    if (porcentajePET && porcentajePET !== '____' && porcentajePET !== '____%') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajePET), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajePET)}</span>`);
    }
    
    if (porcentaje1529 && porcentaje1529 !== '____' && porcentaje1529 !== '____%') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje1529), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje1529)}</span>`);
    }
    
    if (porcentaje65 && porcentaje65 !== '____' && porcentaje65 !== '____%') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje65), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje65)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoSeccion7SituacionEmpleoCompleto(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let textoPersonalizado = this.datos.parrafoSeccion7_situacion_empleo_completo;
    if (!textoPersonalizado && prefijo) {
      textoPersonalizado = this.datos[`parrafoSeccion7_situacion_empleo_completo${prefijo}`];
    }
    if (textoPersonalizado && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `En la CC ${grupoAISD}, la mayor parte de la población se dedica a actividades económicas de carácter independiente, siendo la ganadería la principal fuente de sustento. De manera complementaria, también se desarrolla la agricultura. Esta realidad implica que la mayoría de los comuneros se dediquen al trabajo por cuenta propia, centrado en la crianza de vacunos y ovinos como las principales especies ganaderas. Estas actividades son claves para la economía local, siendo la venta de ganado y sus derivados una fuente de ingresos importante para las familias. En el ámbito agrícola, las tierras comunales se destinan a la producción de cultivos como la papa, habas y cebada, productos que se destinan principalmente al autoconsumo y de manera esporádica a la comercialización en mercados cercanos.\n\nEl empleo dependiente en la CC ${grupoAISD} es mínimo y se encuentra limitado a aquellos que trabajan en instituciones públicas. Entre ellos se encuentran los docentes que laboran en las instituciones educativas locales, así como el personal que presta servicios en el puesto de salud. Estas ocupaciones representan un pequeño porcentaje de la fuerza laboral, ya que la mayoría de los comuneros siguen trabajando en actividades tradicionales como la ganadería y la agricultura, que forman parte de su modo de vida ancestral.`;
  }

  obtenerTextoSeccion7IngresosCompleto(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let textoPersonalizado = this.datos.parrafoSeccion7_ingresos_completo;
    if (!textoPersonalizado && prefijo) {
      textoPersonalizado = this.datos[`parrafoSeccion7_ingresos_completo${prefijo}`];
    }
    if (textoPersonalizado && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || '____';
    const ingresoPerCapita = this.datos.ingresoFamiliarPerCapita || '____';
    const ranking = this.datos.rankingIngresoPerCapita || '____';
    
    return `En la CC ${grupoAISD}, los ingresos de la población provienen principalmente de las actividades ganaderas y agrícolas, que son las fuentes económicas predominantes en la localidad. La venta de vacunos y ovinos, así como de productos agrícolas como papa, habas y cebada, proporciona ingresos variables, dependiendo de las condiciones climáticas y las fluctuaciones en los mercados locales. Sin embargo, debido a la dependencia de estos sectores primarios, los ingresos no son estables ni regulares, y pueden verse afectados por factores como las heladas, la falta de pasto en épocas de sequía o la baja demanda de los productos en el mercado.\n\nOtra parte de los ingresos proviene de los comuneros que participan en actividades de comercio de pequeña escala, vendiendo sus productos en mercados locales o en ferias regionales. No obstante, esta forma de generación de ingresos sigue siendo limitada y no representa una fuente principal para la mayoría de las familias. En cuanto a los pocos habitantes que se encuentran empleados de manera dependiente, tales como los maestros en las instituciones educativas y el personal del puesto de salud, sus ingresos son más regulares, aunque representan una porción muy pequeña de la población.\n\nAdicionalmente, cabe mencionar que, según el informe del PNUD 2019, el distrito de ${distrito} (jurisdicción que abarca a los poblados que conforman la CC ${grupoAISD}) cuenta con un ingreso familiar per cápita de S/. ${ingresoPerCapita} mensuales, ocupando el puesto N°${ranking} en el ranking de dicha variable, lo que convierte a dicha jurisdicción en una de las que cuentan con menor ingreso familiar per cápita en todo el país.`;
  }

  obtenerTextoPET(): string {
    if (this.datos.textoPET && this.datos.textoPET !== '____') {
      return this.datos.textoPET;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentaje1429 = this.getPorcentajePETGrupo('14 a 29');
    const porcentaje65 = this.getPorcentajePETGrupo('65');
    
    return `En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar. La población en edad de trabajar (PET) de la CC ${grupoAISD}, considerada desde los 15 años a más, se compone del total mostrado en la tabla siguiente. El bloque etario que más aporta a la PET es el de 14 a 29 años, pues representa el ${porcentaje1429} de este grupo poblacional. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más al representar solamente un ${porcentaje65}.`;
  }

  obtenerTextoDetalePEA(): string {
    if (this.datos.textoDetalePEA && this.datos.textoDetalePEA !== '____') {
      return this.datos.textoDetalePEA;
    }
    
    const distrito = this.datos.distritoSeleccionado || '____';
    const poblacionDistrital = this.datos.poblacionDistritalCahuacho || '____';
    const petDistrital = this.datos.petDistritalCahuacho || '____';
    
    return `No obstante, los indicadores de la PEA, tanto de su cantidad total como por subgrupos (Ocupada y Desocupada), se describen a nivel distrital siguiendo la información oficial de la publicación "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI. Para ello es importante tomar en cuenta que la población distrital de ${distrito}, jurisdicción donde se ubica el AISD en cuestión, es de ${poblacionDistrital} personas, y que la PET (de 14 años a más) al mismo nivel está conformada por ${petDistrital} personas.`;
  }

  obtenerTextoDefinicionPEA(): string {
    if (this.datos.textoDefinicionPEA && this.datos.textoDefinicionPEA !== '____') {
      return this.datos.textoDefinicionPEA;
    }
    
    const distrito = this.datos.distritoSeleccionado || '____';
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social de cualquier jurisdicción al nivel que se requiera. En este apartado, se presenta una descripción de la PEA del distrito de ${distrito}, jurisdicción que abarca a las poblaciones de la CC ${grupoAISD}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población en capacidad de trabajar en el distrito en cuestión.`;
  }

  obtenerTextoAnalisisPEA(): string {
    if (this.datos.textoAnalisisPEA && this.datos.textoAnalisisPEA !== '____') {
      return this.datos.textoAnalisisPEA;
    }
    
    const distrito = this.datos.distritoSeleccionado || '____';
    const porcentajePEA = this.getPorcentajePEA();
    const porcentajeNoPEA = this.getPorcentajeNoPEA();
    const porcentajePEAHombres = this.getPorcentajePEAHombres();
    const porcentajeNoPEAMujeres = this.getPorcentajeNoPEAMujeres();
    
    return `Del cuadro precedente, se aprecia que la PEA del distrito de ${distrito} representa un ${porcentajePEA} del total de la PET de la jurisdicción, mientras que la No PEA abarca el ${porcentajeNoPEA} restante. Asimismo, se visualiza que los hombres se encuentran predominantemente dentro del indicador de PEA con un ${porcentajePEAHombres}; mientras que, en el caso de las mujeres, se hallan mayormente en el indicador de No PEA (${porcentajeNoPEAMujeres}).`;
  }

  obtenerTextoIndiceDesempleo(): string {
    if (this.datos.textoIndiceDesempleo && this.datos.textoIndiceDesempleo !== '____') {
      return this.datos.textoIndiceDesempleo;
    }
    
    const distrito = this.datos.distritoSeleccionado || '____';
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `El índice de desempleo es un indicador clave para evaluar la salud económica de una jurisdicción de cualquier nivel, ya que refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en busca de empleo, pero no logra obtenerlo. En este ítem, se caracteriza el índice de desempleo del distrito de ${distrito}, el cual abarca los poblados de la CC ${grupoAISD}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población que forma parte de la PEA y distinguir entre sus subgrupos (Ocupada y Desocupada).`;
  }

  obtenerTextoPETConResaltado(): SafeHtml {
    const texto = this.obtenerTextoPET();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentaje1429 = this.getPorcentajePETGrupo('14 a 29');
    const porcentaje65 = this.getPorcentajePETGrupo('65');
    
    let html = this.escapeHtml(texto);
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (porcentaje1429 && porcentaje1429 !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje1429), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje1429)}</span>`);
    }
    if (porcentaje65 && porcentaje65 !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje65), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje65)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoDetalePEAConResaltado(): SafeHtml {
    const texto = this.obtenerTextoDetalePEA();
    const distrito = this.datos.distritoSeleccionado || '____';
    const poblacionDistrital = this.datos.poblacionDistritalCahuacho || '____';
    const petDistrital = this.datos.petDistritalCahuacho || '____';
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (poblacionDistrital && poblacionDistrital !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(poblacionDistrital), 'g'), `<span class="data-section">${this.escapeHtml(poblacionDistrital)}</span>`);
    }
    if (petDistrital && petDistrital !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(petDistrital), 'g'), `<span class="data-section">${this.escapeHtml(petDistrital)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoDefinicionPEAConResaltado(): SafeHtml {
    const texto = this.obtenerTextoDefinicionPEA();
    const distrito = this.datos.distritoSeleccionado || '____';
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoAnalisisPEAConResaltado(): SafeHtml {
    const texto = this.obtenerTextoAnalisisPEA();
    const distrito = this.datos.distritoSeleccionado || '____';
    const porcentajePEA = this.getPorcentajePEA();
    const porcentajeNoPEA = this.getPorcentajeNoPEA();
    const porcentajePEAHombres = this.getPorcentajePEAHombres();
    const porcentajeNoPEAMujeres = this.getPorcentajeNoPEAMujeres();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (porcentajePEA && porcentajePEA !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajePEA), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajePEA)}</span>`);
    }
    if (porcentajeNoPEA && porcentajeNoPEA !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeNoPEA), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeNoPEA)}</span>`);
    }
    if (porcentajePEAHombres && porcentajePEAHombres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajePEAHombres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajePEAHombres)}</span>`);
    }
    if (porcentajeNoPEAMujeres && porcentajeNoPEAMujeres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeNoPEAMujeres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeNoPEAMujeres)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoSeccion7SituacionEmpleoCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion7SituacionEmpleoCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    html = html.replace(/\n/g, '<br>');
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoSeccion7IngresosCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion7IngresosCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || '____';
    const ingresoPerCapita = this.datos.ingresoFamiliarPerCapita || '____';
    const ranking = this.datos.rankingIngresoPerCapita || '____';
    
    let html = this.escapeHtml(texto);
    html = html.replace(/\n/g, '<br>');
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (ingresoPerCapita && ingresoPerCapita !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(ingresoPerCapita), 'g'), `<span class="data-manual">${this.escapeHtml(ingresoPerCapita)}</span>`);
    }
    if (ranking && ranking !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(ranking), 'g'), `<span class="data-manual">${this.escapeHtml(ranking)}</span>`);
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

  obtenerTextoAnalisisOcupacion(): string {
    if (this.datos.textoAnalisisOcupacion && this.datos.textoAnalisisOcupacion !== '____') {
      return this.datos.textoAnalisisOcupacion;
    }
    
    const distrito = this.datos.distritoSeleccionado || '____';
    const porcentajeDesocupada = this.getPorcentajePEADesocupada();
    const porcentajeOcupadaHombres = this.getPorcentajePEAOcupadaHombres();
    const porcentajeOcupadaMujeres = this.getPorcentajePEAOcupadaMujeres();
    
    return `Del cuadro precedente, se halla que en el distrito de ${distrito} la PEA Desocupada representa un ${porcentajeDesocupada} del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada, con porcentajes de ${porcentajeOcupadaHombres} y ${porcentajeOcupadaMujeres}, respectivamente.`;
  }

  obtenerTextoIndiceDesempleoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoIndiceDesempleo();
    const distrito = this.datos.distritoSeleccionado || '____';
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoAnalisisOcupacionConResaltado(): SafeHtml {
    const texto = this.obtenerTextoAnalisisOcupacion();
    const distrito = this.datos.distritoSeleccionado || '____';
    const porcentajeDesocupada = this.getPorcentajePEADesocupada();
    const porcentajeOcupadaHombres = this.getPorcentajePEAOcupadaHombres();
    const porcentajeOcupadaMujeres = this.getPorcentajePEAOcupadaMujeres();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (porcentajeDesocupada && porcentajeDesocupada !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeDesocupada), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeDesocupada)}</span>`);
    }
    if (porcentajeOcupadaHombres && porcentajeOcupadaHombres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeOcupadaHombres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeOcupadaHombres)}</span>`);
    }
    if (porcentajeOcupadaMujeres && porcentajeOcupadaMujeres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeOcupadaMujeres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeOcupadaMujeres)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  protected override onFieldChange(fieldId: string, value: any): void {
    let valorLimpio: any = value;
    if (value === undefined || value === 'undefined') {
      valorLimpio = '';
    }

    super.onFieldChange(fieldId, valorLimpio);
    this.cdRef.detectChanges();
  }
}


