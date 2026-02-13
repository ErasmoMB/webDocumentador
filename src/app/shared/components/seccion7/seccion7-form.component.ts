import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { TableColumn } from '../dynamic-table/dynamic-table.component';
import {
  SECCION7_WATCHED_FIELDS,
  SECCION7_SECTION_ID,
  SECCION7_TEMPLATES,
  SECCION7_TEXTOS_DEFAULT
} from './seccion7-constants';

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
  @Input() override seccionId: string = SECCION7_SECTION_ID;
  @Input() override modoFormulario: boolean = true;

  // ✅ Hacer TEMPLATES accesible en el template
  readonly SECCION7_TEMPLATES = SECCION7_TEMPLATES;

  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION7_WATCHED_FIELDS;

  // ✅ Signal de prefijo de grupo AISD
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  // ✅ Helper para usar en templates
  obtenerPrefijo(): string {
    return this.prefijoGrupoSignal();
  }

  // ✅ SIGNALS REACTIVOS CON AUTO-PERSIST - Campos editables de títulos y fuentes
  readonly cuadroTituloPET = this.createAutoSyncField('cuadroTituloPET', '');
  readonly cuadroFuentePET = this.createAutoSyncField('cuadroFuentePET', '');
  readonly cuadroTituloPEA = this.createAutoSyncField('cuadroTituloPEA', '');
  readonly cuadroFuentePEA = this.createAutoSyncField('cuadroFuentePEA', '');
  readonly cuadroTituloPEAOcupada = this.createAutoSyncField('cuadroTituloPEAOcupada', '');
  readonly cuadroFuentePEAOcupada = this.createAutoSyncField('cuadroFuentePEAOcupada', '');
  
  // ✅ SIGNALS REACTIVOS CON AUTO-PERSIST - Párrafos y textos editable
  readonly parrafoSeccion7PetCompleto = this.createAutoSyncField('parrafoSeccion7_pet_completo', '');
  readonly textoDetalePEA = this.createAutoSyncField('textoDetalePEA', '');
  readonly textoDefinicionPEA = this.createAutoSyncField('textoDefinicionPEA', '');
  readonly textoAnalisisPEA = this.createAutoSyncField('textoAnalisisPEA', '');
  readonly parrafoSeccion7SituacionEmpleoCompleto = this.createAutoSyncField('parrafoSeccion7_situacion_empleo_completo', '');
  readonly parrafoSeccion7IngresosCompleto = this.createAutoSyncField('parrafoSeccion7_ingresos_completo', '');
  readonly textoIndiceDesempleo = this.createAutoSyncField('textoIndiceDesempleo', '');
  readonly textoAnalisisOcupacion = this.createAutoSyncField('textoAnalisisOcupacion', '');

  fotografiasSeccion7: FotoItem[] = [];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly petTablaSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    return Array.isArray(formData[petTablaKey]) ? formData[petTablaKey] : [];
  });

  readonly peaTablaSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    return Array.isArray(formData[peaTablaKey]) ? formData[peaTablaKey] : [];
  });

  readonly peaOcupadaTablaSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    return Array.isArray(formData[peaOcupadaTablaKey]) ? formData[peaOcupadaTablaKey] : [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${prefix}${i}Titulo`;
      const fuenteKey = `${prefix}${i}Fuente`;
      const imagenKey = `${prefix}${i}Imagen`;

      const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();

      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ COLUMNAS DE TABLAS (INTEGRADO - SIN SERVICIOS EXTERNOS)
  readonly columnasTableaPET: TableColumn[] = [
    { field: 'categoria', label: 'Categoría', type: 'text', placeholder: 'Grupo de edad', readonly: true },
    { field: 'casos', label: 'Casos', type: 'number', dataType: 'number' },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
  ];

  readonly columnasTableaPEA: TableColumn[] = [
    { field: 'categoria', label: 'Categoría', type: 'text', placeholder: 'PEA, No PEA', readonly: true },
    { field: 'hombres', label: 'Hombres', type: 'number', dataType: 'number' },
    { field: 'porcentajeHombres', label: '% Hombres', type: 'text', readonly: true },
    { field: 'mujeres', label: 'Mujeres', type: 'number', dataType: 'number' },
    { field: 'porcentajeMujeres', label: '% Mujeres', type: 'text', readonly: true },
    { field: 'casos', label: 'Total', type: 'number', dataType: 'number', readonly: true },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
  ];

  readonly columnasTableaPEAOcupada: TableColumn[] = [
    { field: 'categoria', label: 'Categoría', type: 'text', placeholder: 'Ocupada, Desocupada', readonly: true },
    { field: 'hombres', label: 'Hombres', type: 'number', dataType: 'number' },
    { field: 'porcentajeHombres', label: '% Hombres', type: 'text', readonly: true },
    { field: 'mujeres', label: 'Mujeres', type: 'number', dataType: 'number' },
    { field: 'porcentajeMujeres', label: '% Mujeres', type: 'text', readonly: true },
    { field: 'casos', label: 'Total', type: 'number', dataType: 'number', readonly: true },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
  ];

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
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
    const prefijo = this.prefijoGrupoSignal();
    return {
      tablaKey: `petTabla${prefijo}`,
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  get peaConfig() {
    const prefijo = this.prefijoGrupoSignal();
    return {
      tablaKey: `peaTabla${prefijo}`,
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: false,
      camposParaCalcular: ['hombres', 'mujeres', 'casos']
    };
  }

  get peaOcupadaConfig() {
    const prefijo = this.prefijoGrupoSignal();
    return {
      tablaKey: `peaOcupadaTabla${prefijo}`,
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

  // ============ MÉTODOS DE TEXTO (INTEGRADOS - SIN SERVICIOS EXTERNOS) ============

  obtenerTextoSeccion7PETCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `parrafoSeccion7_pet_completo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['parrafoSeccion7_pet_completo'];
    if (texto && texto.trim() !== '') return texto;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar.\n\nLa población en edad de trabajar (PET) de la CC ${grupoAISD}, considerada desde los 15 años a más, se compone de la población total. El bloque etario que más aporta a la PEA es el de 15 a 29 años. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más.`;
  }

  obtenerTextoPET(): string {
    return this.obtenerTextoSeccion7PETCompleto();
  }

  obtenerTextoDetalePEA(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoDetalePEA${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['textoDetalePEA'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social. En este apartado, se presenta la caracterización de la PEA del distrito, empleando información oficial del INEI.`;
    }
    
    return texto;
  }

  obtenerTextoDefinicionPEA(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoDefinicionPEA${prefijo}`;
    return this.datos[manualKey] || this.datos['textoDefinicionPEA'] || 'La Población Económicamente Activa (PEA) corresponde a todas aquellas personas en edad de trabajar que se encuentran empleadas o desempleadas activamente buscando empleo.';
  }

  obtenerTextoAnalisisPEA(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoAnalisisPEA${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['textoAnalisisPEA'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `Del cuadro precedente, se aprecia que la PEA representa un porcentaje importante de la población en edad de trabajar. Asimismo, se evidencia una distribución diferenciada entre hombres y mujeres en su participación económica.`;
    }
    
    return texto;
  }

  obtenerTextoIndiceDesempleo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoIndiceDesempleo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['textoIndiceDesempleo'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `El índice de desempleo es un indicador clave para evaluar la salud económica de la jurisdicción. Refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en búsqueda activa de empleo sin haberlo logrado obtener.`;
    }
    
    return texto;
  }

  obtenerTextoAnalisisOcupacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoAnalisisOcupacion${prefijo}`;
    return this.datos[manualKey] || this.datos['textoAnalisisOcupacion'] || 'Del cuadro precedente, se halla que la PEA Desocupada representa un porcentaje del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada.';
  }

  obtenerTextoSeccion7SituacionEmpleoCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `parrafoSeccion7_situacion_empleo_completo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['parrafoSeccion7_situacion_empleo_completo'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `La situación del empleo refleja la estructura económica de la localidad. Permite diferenciar entre aquellos que trabajan de manera independiente, en actividades autónomas, y quienes se encuentran en empleos dependientes bajo relación laboral establecida.`;
    }
    
    return texto;
  }

  obtenerTextoSeccion7IngresosCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `parrafoSeccion7_ingresos_completo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['parrafoSeccion7_ingresos_completo'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `Los ingresos de la población provienen principalmente de las actividades económicas locales. Sin embargo, debido a dependencia de estos sectores y fluctuaciones del mercado, los ingresos no siempre resultan estables ni regulares, generando vulnerabilidad económica en las familias.`;
    }
    
    return texto;
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
