import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { SECCION14_PHOTO_PREFIX, SECCION14_DEFAULT_TEXTS, SECCION14_TEMPLATES, SECCION14_WATCHED_FIELDS } from './seccion14-constants';

@Component({
  selector: 'app-seccion14-form',
  templateUrl: './seccion14-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion14FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.10';
  @Input() override modoFormulario: boolean = false;

  // ✅ EXPORTAR TEMPLATES PARA EL HTML
  readonly SECCION14_TEMPLATES = SECCION14_TEMPLATES;

  override readonly PHOTO_PREFIX = SECCION14_PHOTO_PREFIX;
  override useReactiveSync: boolean = true;

  fotografiasSeccion14: FotoItem[] = [];

  override watchedFields: string[] = SECCION14_WATCHED_FIELDS;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ MÉTODOS INLINE PARA TEXTOS (CAPA 3: Default + Personalización del usuario)
  obtenerTextoIndicadoresEducacionIntro(): string {
    const prefijo = this.obtenerPrefijo();
    const campo = `parrafoSeccion14_indicadores_educacion_intro${prefijo}`;
    
    // CAPA 1: Personalización del usuario (máxima prioridad)
    if (this.datos[campo] && String(this.datos[campo]).trim().length > 0) {
      return String(this.datos[campo]);
    }
    
    // CAPA 3: Default hardcodeado
    return SECCION14_DEFAULT_TEXTS.textoIndicadoresEducacionIntro;
  }

  obtenerTextoNivelEducativo(): string {
    const prefijo = this.obtenerPrefijo();
    const campo = `textoNivelEducativo${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campo] && String(this.datos[campo]).trim().length > 0) {
      return String(this.datos[campo]);
    }
    
    // CAPA 3: Default
    return SECCION14_DEFAULT_TEXTS.textoNivelEducativo
      .replace('____% de la población ha alcanzado educación primaria', this.getPorcentajePrimaria() + '% de la población ha alcanzado educación primaria')
      .replace('____% secundaria', this.getPorcentajeSecundaria() + '% secundaria')
      .replace('____% educación superior no universitaria', this.getPorcentajeSuperiorNoUniversitaria() + '% educación superior no universitaria');
  }

  obtenerTextoTasaAnalfabetismo(): string {
    const prefijo = this.obtenerPrefijo();
    const campo = `textoTasaAnalfabetismo${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campo] && String(this.datos[campo]).trim().length > 0) {
      return String(this.datos[campo]);
    }
    
    // CAPA 3: Default con valores calculados
    return SECCION14_DEFAULT_TEXTS.textoTasaAnalfabetismo
      .replace('____%, lo que representa ____', this.getTasaAnalfabetismo() + '%, lo que representa ' + this.getCasosAnalfabetismo());
  }

  readonly nivelEducativoTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `nivelEducativoTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly tasaAnalfabetismoTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `tasaAnalfabetismoTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const prefijo = this.obtenerPrefijo();
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ CONFIGURACIONES DE TABLAS - Habilitar agregar/eliminar y cálculos
  readonly nivelEducativoConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `nivelEducativoTabla${this.obtenerPrefijo()}`,
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: false,
    estructuraInicial: [
      { categoria: '', casos: 0, porcentaje: '0%' }
    ],
    calcularPorcentajes: true
  }));

  readonly tasaAnalfabetismoConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `tasaAnalfabetismoTabla${this.obtenerPrefijo()}`,
    totalKey: 'indicador',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: false,
    estructuraInicial: [
      { indicador: '', casos: 0, porcentaje: '0%' }
    ],
    calcularPorcentajes: true
  }));

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);

    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  public obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  public override obtenerPrefijoGrupo(): string {
    return this.obtenerPrefijo();
  }

  getFieldIdIndicadoresEducacionIntro(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion14_indicadores_educacion_intro${prefijo}` : 'parrafoSeccion14_indicadores_educacion_intro';
  }

  getFieldIdNivelEducativo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoNivelEducativo${prefijo}` : 'textoNivelEducativo';
  }

  getFieldIdTasaAnalfabetismo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoTasaAnalfabetismo${prefijo}` : 'textoTasaAnalfabetismo';
  }

  getNivelEducativoConPorcentajes(): any[] {
    const tabla = this.nivelEducativoTablaSignal();
    if (!tabla || tabla.length === 0) return [];
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, 'casos');
  }

  getTasaAnalfabetismoConPorcentajes(): any[] {
    const tabla = this.tasaAnalfabetismoTablaSignal();
    if (!tabla || tabla.length === 0) return [];
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, 'casos');
  }

  onNivelEducativoTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `nivelEducativoTabla${prefijo}`;
    // Priorizar los datos emitidos por el dynamic-table para evitar race conditions
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || []);
    this.datos[tablaKey] = datos;

    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { updateState: true, notifySync: true, persist: false } as any);

    // Leer inmediatamente desde el store para validar que el cambio quedó
    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || [];

    // Alineado con Sección 13: actualizar this.datos con la tabla persistida para evitar inconsistencias
    this.datos[tablaKey] = tablaPersistida;

    this.cdRef.detectChanges();
  }

  onTasaAnalfabetismoTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `tasaAnalfabetismoTabla${prefijo}`;
    // Priorizar los datos emitidos por el dynamic-table para evitar race conditions
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || []);
    this.datos[tablaKey] = datos;

    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { updateState: true, notifySync: true, persist: false } as any);

    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || [];

    // Alineado con Sección 13: actualizar this.datos con la tabla persistida para evitar inconsistencias
    this.datos[tablaKey] = tablaPersistida;

    this.cdRef.detectChanges();
  }

  public override obtenerNombreComunidadActual(): string {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    return grupoAISD || '____';
  }

  getPorcentajePrimaria(): string {
    const tabla = this.getNivelEducativoConPorcentajes();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('primaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeSecundaria(): string {
    const tabla = this.getNivelEducativoConPorcentajes();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('secundaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeSuperiorNoUniversitaria(): string {
    const tabla = this.getNivelEducativoConPorcentajes();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('superior no universitaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getTasaAnalfabetismo(): string {
    const tabla = this.getTasaAnalfabetismoConPorcentajes();
    const item = tabla.find((i: any) => i.indicador?.toLowerCase().includes('no sabe'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getCasosAnalfabetismo(): string {
    const tabla = this.getTasaAnalfabetismoConPorcentajes();
    const item = tabla.find((i: any) => i.indicador?.toLowerCase().includes('no sabe'));
    return item?.casos ? String(item.casos) : '____';
  }

  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
    super.onFieldChange(campoConPrefijo, value, options);
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    super.onFotografiasChange(fotografias);
    this.fotografiasSeccion14 = fotografias;
    this.cdRef.markForCheck();
  }
}