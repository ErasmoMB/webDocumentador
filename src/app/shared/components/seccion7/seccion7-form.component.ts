import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BaseSectionComponent } from '../base-section.component';
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
export class Seccion7FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.7';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  override useReactiveSync: boolean = true;

  fotografiasSeccion7: FotoItem[] = [];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly petTablaSignal: Signal<any[]> = computed(() => {
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

  readonly peaTablaSignal: Signal<any[]> = computed(() => {
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

  readonly peaOcupadaTablaSignal: Signal<any[]> = computed(() => {
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

  readonly photoFieldsHash: Signal<string> = computed(() => {
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

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    public tableCfg: Seccion7TableConfigService,
    public dataService: Seccion7DataService,
    public textGenerator: Seccion7TextGeneratorService
  ) {
    super(cdRef, injector);

    effect(() => {
      const formData = this.formDataSignal();
      this.datos = { ...formData };
      this.cdRef.markForCheck();
    });

    // ✅ MODO IDEAL: Sincronización automática de tablas PET
    effect(() => {
      const tabla = this.petTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
      const datosActuales = this.datos[petTablaKey];
      
      // Solo actualizar si la tabla en Signal es diferente a la en datos legacy
      if (JSON.stringify(tabla) !== JSON.stringify(datosActuales)) {
        this.datos[petTablaKey] = tabla;
      }
      this.cdRef.markForCheck();
    });

    // ✅ MODO IDEAL: Sincronización automática de tablas PEA
    effect(() => {
      const tabla = this.peaTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
      const datosActuales = this.datos[peaTablaKey];
      
      if (JSON.stringify(tabla) !== JSON.stringify(datosActuales)) {
        this.datos[peaTablaKey] = tabla;
      }
      this.cdRef.markForCheck();
    });

    // ✅ MODO IDEAL: Sincronización automática de tablas PEA Ocupada
    effect(() => {
      const tabla = this.peaOcupadaTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
      const datosActuales = this.datos[peaOcupadaTablaKey];
      
      if (JSON.stringify(tabla) !== JSON.stringify(datosActuales)) {
        this.datos[peaOcupadaTablaKey] = tabla;
      }
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.fotografiasSeccion7 = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

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
      calcularPorcentajes: false,
      camposParaCalcular: ['hombres', 'mujeres', 'casos']
    };
  }

  get peaOcupadaConfig() {
    return {
      tablaKey: 'peaOcupadaTabla',
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: false,
      camposParaCalcular: ['hombres', 'mujeres', 'casos']
    };
  }

  protected override onInitCustom(): void {
    this.asegurarArraysValidos();
    this.cargarFotografias();
    this.fotografiasSeccion7 = [...this.fotografiasCache];
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    this.eliminarFilasTotal();
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  protected override actualizarDatosCustom(): void {
    this.asegurarArraysValidos();
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

  getTablaPET(): any[] {
    return this.petTablaSignal();
  }

  getPETTablaSinTotal(): any[] {
    return this.petTablaSignal().filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPET(): string {
    const tabla = this.petTablaSignal();
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        return sum + (parseInt(item.casos) || 0);
      }
      return sum;
    }, 0);
    return total.toString();
  }

  getTablaPEA(): any[] {
    return this.peaTablaSignal();
  }

  getPEATableSinTotal(): any[] {
    return this.peaTablaSignal().filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPEAHombres(): string {
    const tabla = this.peaTablaSignal();
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        return sum + (parseInt(item.hombres) || 0);
      }
      return sum;
    }, 0);
    return total.toString();
  }

  getTotalPEAMujeres(): string {
    const tabla = this.peaTablaSignal();
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        return sum + (parseInt(item.mujeres) || 0);
      }
      return sum;
    }, 0);
    return total.toString();
  }

  getTotalPEA(): string {
    const tabla = this.peaTablaSignal();
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        return sum + (parseInt(item.casos) || 0);
      }
      return sum;
    }, 0);
    return total.toString();
  }

  getTablaPEAOcupada(): any[] {
    return this.peaOcupadaTablaSignal();
  }

  getPEAOcupadaTableSinTotal(): any[] {
    return this.peaOcupadaTablaSignal().filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPEAOcupadaHombres(): string {
    const tabla = this.peaOcupadaTablaSignal();
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        return sum + (parseInt(item.hombres) || 0);
      }
      return sum;
    }, 0);
    return total.toString();
  }

  getTotalPEAOcupadaMujeres(): string {
    const tabla = this.peaOcupadaTablaSignal();
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        return sum + (parseInt(item.mujeres) || 0);
      }
      return sum;
    }, 0);
    return total.toString();
  }

  getTotalPEAOcupada(): string {
    const tabla = this.peaOcupadaTablaSignal();
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        return sum + (parseInt(item.casos) || 0);
      }
      return sum;
    }, 0);
    return total.toString();
  }

  calcularPorcentajesPET(): void {
    const tabla = this.petTablaSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';

    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return;
    }

    const totalPET = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (!categoria.includes('total')) {
        return sum + (parseInt(item.casos) || 0);
      }
      return sum;
    }, 0);

    if (totalPET === 0) {
      return;
    }

    const tablaActualizada = tabla.map((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';

      if (categoria.includes('total')) {
        return {
          ...item,
          porcentaje: '100,00 %'
        };
      }

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

    this.projectFacade.setField(this.seccionId, null, petTablaKey, tablaActualizada);
  }

  calcularPorcentajesPEA(): void {
    const tabla = this.peaTablaSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';

    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return;
    }

    let totalHombres = 0;
    let totalMujeres = 0;
    let totalCasos = 0;

    tabla.forEach((item: any) => {
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

    const tablaActualizada = tabla.map((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';

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

    this.projectFacade.setField(this.seccionId, null, peaTablaKey, tablaActualizada);
  }

  calcularPorcentajesPEAOcupada(): void {
    const tabla = this.peaOcupadaTablaSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';

    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return;
    }

    let totalHombres = 0;
    let totalMujeres = 0;
    let totalCasos = 0;

    tabla.forEach((item: any) => {
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

    const tablaActualizada = tabla.map((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';

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

    this.projectFacade.setField(this.seccionId, null, peaOcupadaTablaKey, tablaActualizada);
  }

  // ============ GESTIÓN DE FOTOGRAFÍAS ============

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

  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    this.fotografiasSeccion7 = fotografias;
    this.cdRef.markForCheck();
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

  protected override onFieldChange(fieldId: string, value: any): void {
    let valorLimpio: any = value;
    if (value === undefined || value === 'undefined') {
      valorLimpio = '';
    }

    super.onFieldChange(fieldId, valorLimpio);
  }

  onTablaPETActualizada(): void {
    // ✅ MODO IDEAL: Persistir tabla actualizada y recalcular porcentajes
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const tablaActual = this.datos[petTablaKey] || [];
    
    // Persistir cambios al projectFacade
    this.projectFacade.setField(this.seccionId, null, petTablaKey, tablaActual);
    
    // Recalcular porcentajes
    this.calcularPorcentajesPET();
    this.cdRef.markForCheck();
  }

  onTablaPEAActualizada(): void {
    // ✅ MODO IDEAL: Persistir tabla actualizada y recalcular porcentajes
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const tablaActual = this.datos[peaTablaKey] || [];
    
    // Persistir cambios al projectFacade
    this.projectFacade.setField(this.seccionId, null, peaTablaKey, tablaActual);
    
    // Recalcular porcentajes
    this.calcularPorcentajesPEA();
    this.cdRef.markForCheck();
  }

  onTablaPEAOcupadaActualizada(): void {
    // ✅ MODO IDEAL: Persistir tabla actualizada y recalcular porcentajes
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    const tablaActual = this.datos[peaOcupadaTablaKey] || [];
    
    // Persistir cambios al projectFacade
    this.projectFacade.setField(this.seccionId, null, peaOcupadaTablaKey, tablaActual);
    
    // Recalcular porcentajes
    this.calcularPorcentajesPEAOcupada();
    this.cdRef.markForCheck();
  }

  trackByIndex(index: number): number {
    return index;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
}
