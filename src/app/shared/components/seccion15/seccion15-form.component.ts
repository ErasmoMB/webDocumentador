import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TableConfig } from '../../../core/services/table-management.service';
import { FormChangeService } from '../../../core/services/state/form-change.service';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion15-form',
    templateUrl: './seccion15-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion15FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.11';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaIglesia';
  override useReactiveSync: boolean = true;

  fotografiasIglesia: FotoItem[] = [];

  override watchedFields: string[] = [
    'lenguasMaternasTabla',
    'religionesTabla',
    'parrafoSeccion15_religion_completo',
    'textoAspectosCulturales',
    'textoIdioma',
    'fotografiaIglesia'
  ];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly textoAspectosCulturalesSignal: Signal<string> = computed(() => {
    const stored = this.projectFacade.selectField(this.seccionId, null, 'textoAspectosCulturales')();
    return stored && String(stored).trim().length > 0 ? stored : this.generarTextoAspectosCulturalesDefault();
  });

  readonly textoIdiomaSignal: Signal<string> = computed(() => {
    const stored = this.projectFacade.selectField(this.seccionId, null, 'textoIdioma')();
    return stored && String(stored).trim().length > 0 ? stored : this.generarTextoIdiomaDefault();
  });

  readonly parrafoReligionSignal: Signal<string> = computed(() => {
    const stored = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion15_religion_completo')();
    return stored && String(stored).trim().length > 0 ? stored : this.generarTextoReligionDefault();
  });

  readonly lenguasMaternasSignal: Signal<any[]> = computed(() => {
    const fromField = this.projectFacade.selectField(this.seccionId, null, 'lenguasMaternasTabla')();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, 'lenguasMaternasTabla')();
    return fromField ?? fromTable ?? [];
  });

  readonly religionesSignal: Signal<any[]> = computed(() => {
    const fromField = this.projectFacade.selectField(this.seccionId, null, 'religionesTabla')();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, 'religionesTabla')();
    return fromField ?? fromTable ?? [];
  });

  readonly lenguasMaternasConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: 'lenguasMaternasTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  }));

  readonly religionesConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: 'religionesTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  }));

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private formChangeService: FormChangeService
  ) {
    super(cdRef, injector);

    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...this.projectFacade.obtenerDatos(), ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.lenguasMaternasSignal();
      this.religionesSignal();
      this.cdRef.markForCheck();
    });
  }

  private generarTextoAspectosCulturalesDefault(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    const nombre = comunidad && comunidad !== '____' ? comunidad : '____';
    return `Los aspectos culturales juegan un papel significativo en la vida social y cultural de una comunidad, influyendo en sus valores, costumbres y prácticas cotidianas. En esta sección, se caracterizan y describen la diversidad religiosa en la CC ${nombre}, explorando las principales creencias.`;
  }

  private generarTextoIdiomaDefault(): string {
    return 'La lengua materna es la primera lengua o idioma que aprende una persona. De la data obtenida de los Censos Nacionales 2017, se aprecia que el castellano es la categoría mayoritaria, pues representa la mayor parte de la población de 3 años a más. En segundo lugar se halla el quechua como primer idioma.';
  }

  private generarTextoReligionDefault(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    const nombre = comunidad && comunidad !== '____' ? comunidad : '____';
    return `En la actualidad, la confesión predominante dentro de la CC ${nombre} es la católica. Según las entrevistas aplicadas, la permanencia del catolicismo como la religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz ${nombre}, y a la inexistencia de templos evangélicos o de otras confesiones.\n\nEsta iglesia es el principal punto de reunión religiosa de la comunidad y juega un rol importante en la vida espiritual de sus habitantes. Otro espacio con gran valor espiritual es el cementerio, en donde los comuneros entierran y visitan a sus difuntos. Este lugar se halla al sur del anexo ${nombre}.`;
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  onLenguasMaternasTableUpdated(updatedData?: any[]): void {
    const dataToPersist = updatedData || this.lenguasMaternasSignal();
    this.formChangeService.persistFields(this.seccionId, 'table', {
      lenguasMaternasTabla: dataToPersist
    }, { updateState: true, notifySync: true, persist: false });

    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, 'lenguasMaternasTabla')() || dataToPersist || [];
    this.datos['lenguasMaternasTabla'] = tablaPersistida;
    this.onFieldChange('lenguasMaternasTabla', tablaPersistida, { refresh: false });
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  onReligionesTableUpdated(updatedData?: any[]): void {
    const dataToPersist = updatedData || this.religionesSignal();
    this.formChangeService.persistFields(this.seccionId, 'table', {
      religionesTabla: dataToPersist
    }, { updateState: true, notifySync: true, persist: false });

    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, 'religionesTabla')() || dataToPersist || [];
    this.datos['religionesTabla'] = tablaPersistida;
    this.onFieldChange('religionesTabla', tablaPersistida, { refresh: false });
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
  }

  override getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return 'manual';
  }

  onInputChange(fieldName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.onFieldChange(fieldName, target.value);
    }
  }
}