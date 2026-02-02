import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion7TableConfigService } from 'src/app/core/services/domain/seccion7-table-config.service';
import { Seccion7DataService } from 'src/app/core/services/domain/seccion7-data.service';
import { Seccion7TextGeneratorService } from 'src/app/core/services/domain/seccion7-text-generator.service';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        CoreSharedModule
    ],
    selector: 'app-seccion7-view-internal',
    templateUrl: './seccion7-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion7ViewInternalComponent extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  
  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  override fotografiasCache: FotoItem[] = [];

  tablaPETConfig = this.tableConfigService.getTablaPETConfig();
  tablaPEAConfig = this.tableConfigService.getTablaPEAConfig();
  tablaPEAOcupadaConfig = this.tableConfigService.getTablaPEAOcupadaConfig();

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly petTablaSignal: Signal<any[]>;
  readonly peaTablaSignal: Signal<any[]>;
  readonly peaOcupadaTablaSignal: Signal<any[]>;
  readonly photoFieldsHash: Signal<string>;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private tableConfigService: Seccion7TableConfigService,
    private dataService: Seccion7DataService,
    private textGenerator: Seccion7TextGeneratorService
  ) {
    super(cdRef, injector);

    this.formDataSignal = computed(() => {
      return this.projectFacade.selectSectionFields(this.seccionId, null)();
    });

    this.petTablaSignal = computed(() => {
      const formData = this.formDataSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
      const tablaActual = Array.isArray(formData[petTablaKey]) ? formData[petTablaKey] : [];
      
      if (tablaActual.length === 0) {
        return [
          { categoria: '15 a 29 años', casos: 0, porcentaje: '0,00 %' },
          { categoria: '30 a 44 años', casos: 0, porcentaje: '0,00 %' },
          { categoria: '45 a 64 años', casos: 0, porcentaje: '0,00 %' },
          { categoria: '65 años a más', casos: 0, porcentaje: '0,00 %' },
          { categoria: 'Total', casos: 0, porcentaje: '100,00 %' }
        ];
      }
      
      return tablaActual;
    });

    this.peaTablaSignal = computed(() => {
      const formData = this.formDataSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
      const tablaActual = Array.isArray(formData[peaTablaKey]) ? formData[peaTablaKey] : [];
      
      if (tablaActual.length === 0) {
        return [
          { categoria: 'PEA', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
          { categoria: 'No PEA', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
          { categoria: 'Total', hombres: 0, porcentajeHombres: '100,00 %', mujeres: 0, porcentajeMujeres: '100,00 %', casos: 0, porcentaje: '100,00 %' }
        ];
      }
      
      return tablaActual;
    });

    this.peaOcupadaTablaSignal = computed(() => {
      const formData = this.formDataSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
      const tablaActual = Array.isArray(formData[peaOcupadaTablaKey]) ? formData[peaOcupadaTablaKey] : [];
      
      if (tablaActual.length === 0) {
        return [
          { categoria: 'PEA Ocupada', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
          { categoria: 'PEA Desocupada', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
          { categoria: 'Total', hombres: 0, porcentajeHombres: '100,00 %', mujeres: 0, porcentajeMujeres: '100,00 %', casos: 0, porcentaje: '100,00 %' }
        ];
      }
      
      return tablaActual;
    });

    this.photoFieldsHash = computed(() => {
      let hash = '';
      for (let i = 1; i <= 10; i++) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente`;
        const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen`;
        
        const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
        const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
        const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();
        
        hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
      }
      return hash;
    });

    effect(() => {
      const formData = this.formDataSignal();
      this.datos = { ...formData };
      this.cdRef.markForCheck();
    });

    // ✅ MODO IDEAL: Sincronización automática de tablas PET desde Signal
    effect(() => {
      const tabla = this.petTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
      this.datos[petTablaKey] = tabla;
      this.cdRef.markForCheck();
    });

    // ✅ MODO IDEAL: Sincronización automática de tablas PEA desde Signal
    effect(() => {
      const tabla = this.peaTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
      this.datos[peaTablaKey] = tabla;
      this.cdRef.markForCheck();
    });

    // ✅ MODO IDEAL: Sincronización automática de tablas PEA Ocupada desde Signal
    effect(() => {
      const tabla = this.peaOcupadaTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
      this.datos[peaOcupadaTablaKey] = tabla;
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.logGrupoActual();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  override cargarFotografias(): void {
    const formData = this.formDataSignal();
    const fotos: FotoItem[] = [];

    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen`;
      const imagen = formData[imagenKey];

      if (imagen) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente`;
        const numeroKey = `${this.PHOTO_PREFIX}${i}Numero`;

        fotos.push({
          imagen: imagen,
          titulo: formData[tituloKey] || '',
          fuente: formData[fuenteKey] || '',
          numero: formData[numeroKey] || i
        });
      }
    }

    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
  }

  getFotografiasPEAVista(): FotoItem[] {
    return this.fotografiasCache;
  }

  getTablaPET(): any[] {
    return this.petTablaSignal();
  }

  getPETTablaSinTotal(): any[] {
    const tabla = this.petTablaSignal();
    return tabla.filter((item: any) => 
      item.categoria && !item.categoria.toString().toLowerCase().includes('total')
    );
  }

  getTotalPET(): string {
    const tabla = this.petTablaSignal();
    const total = tabla.find((item: any) => 
      item.categoria && item.categoria.toString().toLowerCase().includes('total')
    );
    return total?.casos?.toString() || '0';
  }

  /**
   * Obtiene la tabla PET con porcentajes calculados dinámicamente
   * Similar a getPoblacionSexoConPorcentajes() y getPoblacionEtarioConPorcentajes()
   * Principio SOLID: Single Responsibility - Este método solo calcula porcentajes para PET
   */
  getPETConPorcentajes(): any[] {
    const tablaPET = this.getPETTablaSinTotal();
    if (!tablaPET || !Array.isArray(tablaPET) || tablaPET.length === 0) {
      return [];
    }

    // Calcular total dinámicamente como suma de casos en la tabla
    const total = tablaPET.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      return tablaPET.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    // Calcular porcentajes basados en el total de la tabla
    const tablaConPorcentajes = tablaPET.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });

    // Agregar fila de total si no existe
    const filaTotal = {
      categoria: 'Total',
      casos: total,
      porcentaje: '100,00 %'
    };
    tablaConPorcentajes.push(filaTotal);
    
    return tablaConPorcentajes;
  }

  getTablaPEA(): any[] {
    return this.peaTablaSignal();
  }

  getPEATableSinTotal(): any[] {
    const tabla = this.peaTablaSignal();
    return tabla.filter((item: any) => 
      item.categoria && !item.categoria.toString().toLowerCase().includes('total')
    );
  }

  getTotalPEAHombres(): string {
    const tabla = this.peaTablaSignal();
    const total = tabla.find((item: any) => 
      item.categoria && item.categoria.toString().toLowerCase().includes('total')
    );
    return total?.hombres?.toString() || '0';
  }

  getTotalPEAMujeres(): string {
    const tabla = this.peaTablaSignal();
    const total = tabla.find((item: any) => 
      item.categoria && item.categoria.toString().toLowerCase().includes('total')
    );
    return total?.mujeres?.toString() || '0';
  }

  getTotalPEA(): string {
    const tabla = this.peaTablaSignal();
    const total = tabla.find((item: any) => 
      item.categoria && item.categoria.toString().toLowerCase().includes('total')
    );
    return total?.casos?.toString() || '0';
  }

  getTablaPEAOcupada(): any[] {
    return this.peaOcupadaTablaSignal();
  }

  getPEAOcupadaTableSinTotal(): any[] {
    const tabla = this.peaOcupadaTablaSignal();
    return tabla.filter((item: any) => 
      item.categoria && !item.categoria.toString().toLowerCase().includes('total')
    );
  }

  getTotalPEAOcupadaHombres(): string {
    const tabla = this.peaOcupadaTablaSignal();
    const total = tabla.find((item: any) => 
      item.categoria && item.categoria.toString().toLowerCase().includes('total')
    );
    return total?.hombres?.toString() || '0';
  }

  getTotalPEAOcupadaMujeres(): string {
    const tabla = this.peaOcupadaTablaSignal();
    const total = tabla.find((item: any) => 
      item.categoria && item.categoria.toString().toLowerCase().includes('total')
    );
    return total?.mujeres?.toString() || '0';
  }

  getTotalPEAOcupada(): string {
    const tabla = this.peaOcupadaTablaSignal();
    const total = tabla.find((item: any) => 
      item.categoria && item.categoria.toString().toLowerCase().includes('total')
    );
    return total?.casos?.toString() || '0';
  }

  /**
   * Obtiene la tabla PEA con porcentajes calculados dinámicamente
   * Calcula porcentajes para hombres, mujeres y total
   * Principio SOLID: Single Responsibility - Este método solo calcula porcentajes para PEA
   */
  getPEAConPorcentajes(): any[] {
    const tablaPEA = this.getPEATableSinTotal();
    if (!tablaPEA || !Array.isArray(tablaPEA) || tablaPEA.length === 0) {
      return [];
    }

    // Calcular totales dinámicamente
    const totalHombres = tablaPEA.reduce((sum, item) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      return sum + hombres;
    }, 0);

    const totalMujeres = tablaPEA.reduce((sum, item) => {
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      return sum + mujeres;
    }, 0);

    const totalCasos = tablaPEA.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (totalHombres <= 0 && totalMujeres <= 0 && totalCasos <= 0) {
      return tablaPEA.map((item: any) => ({
        ...item,
        porcentajeHombres: '0,00 %',
        porcentajeMujeres: '0,00 %',
        porcentaje: '0,00 %'
      }));
    }

    // Calcular porcentajes para cada fila
    const tablaConPorcentajes = tablaPEA.map((item: any) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;

      // Calcular porcentaje de hombres
      const porcentajeHombres = totalHombres > 0 
        ? (hombres / totalHombres) * 100 
        : 0;
      const porcentajeHombresFormateado = porcentajeHombres
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      // Calcular porcentaje de mujeres
      const porcentajeMujeres = totalMujeres > 0 
        ? (mujeres / totalMujeres) * 100 
        : 0;
      const porcentajeMujeresFormateado = porcentajeMujeres
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      // Calcular porcentaje total
      const porcentajeTotal = totalCasos > 0 
        ? (casos / totalCasos) * 100 
        : 0;
      const porcentajeTotalFormateado = porcentajeTotal
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      return {
        ...item,
        hombres,
        mujeres,
        casos,
        porcentajeHombres: porcentajeHombresFormateado,
        porcentajeMujeres: porcentajeMujeresFormateado,
        porcentaje: porcentajeTotalFormateado
      };
    });

    // Agregar fila de total
    const filaTotal = {
      categoria: 'Total',
      hombres: totalHombres,
      mujeres: totalMujeres,
      casos: totalCasos,
      porcentajeHombres: '100,00 %',
      porcentajeMujeres: '100,00 %',
      porcentaje: '100,00 %'
    };
    tablaConPorcentajes.push(filaTotal);
    
    return tablaConPorcentajes;
  }

  /**
   * Obtiene la tabla PEA Ocupada con porcentajes calculados dinámicamente
   * Calcula porcentajes para hombres, mujeres y total
   * Principio SOLID: Single Responsibility - Este método solo calcula porcentajes para PEA Ocupada
   */
  getPEAOcupadaConPorcentajes(): any[] {
    const tablaPEAOcupada = this.getPEAOcupadaTableSinTotal();
    if (!tablaPEAOcupada || !Array.isArray(tablaPEAOcupada) || tablaPEAOcupada.length === 0) {
      return [];
    }

    // Calcular totales dinámicamente
    const totalHombres = tablaPEAOcupada.reduce((sum, item) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      return sum + hombres;
    }, 0);

    const totalMujeres = tablaPEAOcupada.reduce((sum, item) => {
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      return sum + mujeres;
    }, 0);

    const totalCasos = tablaPEAOcupada.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (totalHombres <= 0 && totalMujeres <= 0 && totalCasos <= 0) {
      return tablaPEAOcupada.map((item: any) => ({
        ...item,
        porcentajeHombres: '0,00 %',
        porcentajeMujeres: '0,00 %',
        porcentaje: '0,00 %'
      }));
    }

    // Calcular porcentajes para cada fila
    const tablaConPorcentajes = tablaPEAOcupada.map((item: any) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;

      // Calcular porcentaje de hombres
      const porcentajeHombres = totalHombres > 0 
        ? (hombres / totalHombres) * 100 
        : 0;
      const porcentajeHombresFormateado = porcentajeHombres
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      // Calcular porcentaje de mujeres
      const porcentajeMujeres = totalMujeres > 0 
        ? (mujeres / totalMujeres) * 100 
        : 0;
      const porcentajeMujeresFormateado = porcentajeMujeres
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      // Calcular porcentaje total
      const porcentajeTotal = totalCasos > 0 
        ? (casos / totalCasos) * 100 
        : 0;
      const porcentajeTotalFormateado = porcentajeTotal
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      return {
        ...item,
        hombres,
        mujeres,
        casos,
        porcentajeHombres: porcentajeHombresFormateado,
        porcentajeMujeres: porcentajeMujeresFormateado,
        porcentaje: porcentajeTotalFormateado
      };
    });

    // Agregar fila de total
    const filaTotal = {
      categoria: 'Total',
      hombres: totalHombres,
      mujeres: totalMujeres,
      casos: totalCasos,
      porcentajeHombres: '100,00 %',
      porcentajeMujeres: '100,00 %',
      porcentaje: '100,00 %'
    };
    tablaConPorcentajes.push(filaTotal);
    
    return tablaConPorcentajes;
  }

  // ============ MÉTODOS DE PORCENTAJES (usando DataService) ============

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

  obtenerTextoSeccion7PETCompletoConResaltado(): SafeHtml {
    return this.textGenerator.obtenerTextoSeccion7PETCompletoConResaltado(
      this.datos,
      this.seccionId,
      () => this.getPorcentajePET(),
      (grupo: string) => this.getPorcentajePETGrupo(grupo),
      () => this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoSeccion7SituacionEmpleoCompleto(): string {
    return this.textGenerator.obtenerTextoSeccion7SituacionEmpleoCompleto(
      this.datos,
      this.seccionId,
      () => this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoSeccion7SituacionEmpleoCompletoConResaltado(): SafeHtml {
    return this.textGenerator.obtenerTextoSeccion7SituacionEmpleoCompletoConResaltado(
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

  obtenerTextoSeccion7IngresosCompletoConResaltado(): SafeHtml {
    return this.textGenerator.obtenerTextoSeccion7IngresosCompletoConResaltado(
      this.datos,
      this.seccionId,
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

  obtenerTextoPETConResaltado(): SafeHtml {
    return this.textGenerator.obtenerTextoPETConResaltado(
      this.datos,
      (grupo: string) => this.getPorcentajePETGrupo(grupo),
      () => this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoDetalePEA(): string {
    return this.textGenerator.obtenerTextoDetalePEA(this.datos);
  }

  obtenerTextoDetalePEAConResaltado(): SafeHtml {
    return this.textGenerator.obtenerTextoDetalePEAConResaltado(this.datos);
  }

  obtenerTextoDefinicionPEA(): string {
    return this.textGenerator.obtenerTextoDefinicionPEA(
      this.datos,
      () => this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoDefinicionPEAConResaltado(): SafeHtml {
    return this.textGenerator.obtenerTextoDefinicionPEAConResaltado(
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

  obtenerTextoAnalisisPEAConResaltado(): SafeHtml {
    return this.textGenerator.obtenerTextoAnalisisPEAConResaltado(
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

  obtenerTextoIndiceDesempleoConResaltado(): SafeHtml {
    return this.textGenerator.obtenerTextoIndiceDesempleoConResaltado(
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

  obtenerTextoAnalisisOcupacionConResaltado(): SafeHtml {
    return this.textGenerator.obtenerTextoAnalisisOcupacionConResaltado(
      this.datos,
      () => this.getPorcentajePEADesocupada(),
      () => this.getPorcentajePEAOcupadaHombres(),
      () => this.getPorcentajePEAOcupadaMujeres()
    );
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Métodos requeridos por BaseSectionComponent
  detectarCambios(): boolean {
    return false;
  }

  actualizarValoresConPrefijo(): void {
    // No necesario en vista de solo lectura
  }
}
