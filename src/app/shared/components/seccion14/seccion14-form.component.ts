import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';

@Component({
  selector: 'app-seccion14-form',
  templateUrl: './seccion14-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion14FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.14';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaEducacionIndicadores';
  override useReactiveSync: boolean = true;

  fotografiasSeccion14: FotoItem[] = [];

  override watchedFields: string[] = [
    'parrafoSeccion14_indicadores_educacion_intro',
    'textoNivelEducativo',
    'textoTasaAnalfabetismo',
    'cuadroTituloNivelEducativo',
    'cuadroFuenteNivelEducativo',
    'cuadroTituloTasaAnalfabetismo',
    'cuadroFuenteTasaAnalfabetismo'
  ];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  readonly nivelEducativoTablaSignal: Signal<any[]> = computed(() => {
    const fromField = this.projectFacade.selectField(this.seccionId, null, 'nivelEducativoTabla')();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, 'nivelEducativoTabla')();
    return fromField ?? fromTable ?? [];
  });

  readonly tasaAnalfabetismoTablaSignal: Signal<any[]> = computed(() => {
    const fromField = this.projectFacade.selectField(this.seccionId, null, 'tasaAnalfabetismoTabla')();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, 'tasaAnalfabetismoTabla')();
    return fromField ?? fromTable ?? [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ CONFIGURACIONES DE TABLAS - Habilitar agregar/eliminar y cálculos
  readonly nivelEducativoConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: 'nivelEducativoTabla',
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
    tablaKey: 'tasaAnalfabetismoTabla',
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
      this.datos = { ...this.projectFacade.obtenerDatos(), ...sectionData };
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

  public override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
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

  obtenerTextoSeccion14IndicadoresEducacionIntro(): string {
    const fieldId = this.getFieldIdIndicadoresEducacionIntro();
    const manual = this.datos[fieldId];
    if (manual && manual.trim().length > 0) return manual;
    return 'La educación es un indicador fundamental para medir el desarrollo humano y social de una comunidad. A continuación, se presentan los principales indicadores educativos de la población de la comunidad campesina, basados en los datos censales disponibles.';
  }

  obtenerTextoNivelEducativo(): string {
    const fieldId = this.getFieldIdNivelEducativo();
    const manual = this.datos[fieldId];
    if (manual && manual.trim().length > 0) return manual;
    return 'El nivel educativo alcanzado por la población de 15 años a más refleja el acceso y la calidad de la educación en la comunidad. Los datos muestran que ____% de la población ha alcanzado educación primaria, ____% secundaria y ____% educación superior no universitaria.';
  }

  obtenerTextoTasaAnalfabetismo(): string {
    const fieldId = this.getFieldIdTasaAnalfabetismo();
    const manual = this.datos[fieldId];
    if (manual && manual.trim().length > 0) return manual;
    return 'La tasa de analfabetismo en la población de 15 años a más es de ____%, lo que representa ____ personas que no saben leer ni escribir. Este indicador es crucial para identificar necesidades educativas y planificar intervenciones.';
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
    // Priorizar los datos emitidos por el dynamic-table para evitar race conditions
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, 'nivelEducativoTabla')() || []);
    console.log('[Seccion14][form] onNivelEducativoTableUpdated - incoming', { updatedDataLength: updatedData?.length ?? 0 });
    this.datos['nivelEducativoTabla'] = datos;

    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { nivelEducativoTabla: datos }, { updateState: true, notifySync: true, persist: false } as any);

    // Leer inmediatamente desde el store para validar que el cambio quedó
    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, 'nivelEducativoTabla')() || [];
    console.log('[Seccion14][form] after persist - tablaPersistida length:', (tablaPersistida && tablaPersistida.length) || 0);

    // Alineado con Sección 13: actualizar this.datos con la tabla persistida para evitar inconsistencias
    this.datos['nivelEducativoTabla'] = tablaPersistida;

    this.cdRef.detectChanges();
  }

  onTasaAnalfabetismoTableUpdated(updatedData?: any[]): void {
    // Priorizar los datos emitidos por el dynamic-table para evitar race conditions
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, 'tasaAnalfabetismoTabla')() || []);
    console.log('[Seccion14][form] onTasaAnalfabetismoTableUpdated - incoming', { updatedDataLength: updatedData?.length ?? 0 });
    this.datos['tasaAnalfabetismoTabla'] = datos;

    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { tasaAnalfabetismoTabla: datos }, { updateState: true, notifySync: true, persist: false } as any);

    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, 'tasaAnalfabetismoTabla')() || [];
    console.log('[Seccion14][form] after persist - tablaPersistida length:', (tablaPersistida && tablaPersistida.length) || 0);

    // Alineado con Sección 13: actualizar this.datos con la tabla persistida para evitar inconsistencias
    this.datos['tasaAnalfabetismoTabla'] = tablaPersistida;

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

  override onFotografiasChange(fotografias: FotoItem[]): void {
    super.onFotografiasChange(fotografias);
    this.fotografiasSeccion14 = fotografias;
    this.cdRef.markForCheck();
  }
}