import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule],
  selector: 'app-seccion21-form',
  templateUrl: './seccion21-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion21FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaCahuacho';
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly parrafoAisiSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion21_aisi_intro_completo')();
    if (manual && manual.trim().length > 0) return manual;
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    const provincia = this.projectFacade.selectField(this.seccionId, null, 'provinciaSeleccionada')() || 'Caravelí';
    const departamento = this.projectFacade.selectField(this.seccionId, null, 'departamentoSeleccionado')() || 'Arequipa';
    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el CP ${centro}, capital distrital de la jurisdicción homónima, en la provincia de ${provincia}, en el departamento de ${departamento}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente.`;
  });

  readonly parrafoCentroSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion21_centro_poblado_completo')();
    if (manual && manual.trim().length > 0) return manual;
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    const provincia = this.projectFacade.selectField(this.seccionId, null, 'provinciaSeleccionada')() || 'Caravelí';
    const departamento = this.projectFacade.selectField(this.seccionId, null, 'departamentoSeleccionado')() || 'Arequipa';
    const ley = this.projectFacade.selectField(this.seccionId, null, 'leyCreacionDistrito')() || '8004';
    const fecha = this.projectFacade.selectField(this.seccionId, null, 'fechaCreacionDistrito')() || '22 de febrero de 1935';
    const distrito = this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || 'Cahuacho';
    const distritoAnterior = this.projectFacade.selectField(this.seccionId, null, 'distritoAnterior')() || 'Caravelí';
    const origen1 = this.projectFacade.selectField(this.seccionId, null, 'origenPobladores1')() || 'Caravelí';
    const origen2 = this.projectFacade.selectField(this.seccionId, null, 'origenPobladores2')() || 'Parinacochas';
    const deptoOrigen = this.projectFacade.selectField(this.seccionId, null, 'departamentoOrigen')() || 'Ayacucho';
    const anexos = this.projectFacade.selectField(this.seccionId, null, 'anexosEjemplo')() || 'Ayroca o Sóndor';

    return `El CP ${centro} es la capital del distrito homónimo, perteneciente a la provincia de ${provincia}, en el departamento de ${departamento}. Su designación como capital distrital se oficializó mediante la Ley N°${ley}, promulgada el ${fecha}, fecha en que se creó el distrito de ${distrito}. Antes de ello, este asentamiento era un caserío del distrito de ${distritoAnterior}.`;
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      if (imagen) {
        fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
    }
    return fotos;
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

  readonly ubicacionCpSignal: Signal<any[]> = computed(() => {
    const fromField = this.projectFacade.selectField(this.seccionId, null, 'ubicacionCpTabla')();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, 'ubicacionCpTabla')();
    return fromField ?? fromTable ?? [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }];
  });

  getTablaKeyUbicacionCp(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
  }

  get ubicacionCpConfig(): any {
    return {
      tablaKey: this.getTablaKeyUbicacionCp(),
      totalKey: 'localidad',
      campoTotal: 'localidad',
      estructuraInicial: [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }]
    };
  }

  get columnasUbicacionCp(): any[] {
    // DynamicTable expects { field, label, type? }
    return [
      { field: 'localidad', label: 'Localidad', type: 'text' },
      { field: 'coordenadas', label: 'Coordenadas', type: 'text' },
      { field: 'altitud', label: 'Altitud', type: 'text' },
      { field: 'distrito', label: 'Distrito', type: 'text' },
      { field: 'provincia', label: 'Provincia', type: 'text' },
      { field: 'departamento', label: 'Departamento', type: 'text' }
    ];
  }

  onTablaUpdated(): void {
    const tablaKey = this.getTablaKeyUbicacionCp();
    const tabla = this.ubicacionCpSignal();
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange('ubicacionCpTabla', this.datos[tablaKey], { refresh: false });

    // Persistir tanto la clave con prefijo como la clave base
    const tablaKeyBase = 'ubicacionCpTabla';
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, [tablaKeyBase]: tabla });
    } catch (e) {}

    // Forzar actualización de la vista
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}

    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  readonly viewModel = computed(() => ({
    parrafoAisi: this.parrafoAisiSignal(),
    parrafoCentro: this.parrafoCentroSignal(),
    fotos: this.fotosCacheSignal(),
    ubicacionCp: this.ubicacionCpSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private formChange: FormChangeService) {
    super(cdRef, injector);

    effect(() => {
      const data = this.formDataSignal();
      const tablas: Record<string, any> = {};
      tablas['ubicacionCpTabla'] = this.ubicacionCpSignal();
      this.datos = { ...data, ...tablas };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // 🔍 AGREGAR LOG PARA VERIFICAR GRUPOS AISI
    this.logGrupoActual();
    
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual (siempre)
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    console.log(`[Seccion21] Auto-llenando centroPobladoAISI: "${centroPobladoAISI}"`);
    
    // Actualizar tanto el objeto local como el store para que el título se actualice
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, 'centroPobladoAISI', centroPobladoAISI);
    this.onFieldChange('centroPobladoAISI', centroPobladoAISI, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'form', { centroPobladoAISI }); } catch (e) {}
    
    // 🔍 FORZAR DETECCIÓN DE CAMBIOS PARA ACTUALIZAR EL TÍTULO
    this.cdRef.detectChanges();
    
    console.log(`[Seccion21] Título actualizado a: "B.1. Centro Poblado ${centroPobladoAISI}"`);
    
    // Asegurar inicialización de tabla y campos (como en Seccion20)
    const tablaKey = this.getTablaKeyUbicacionCp();
    if (!this.datos[tablaKey] || !Array.isArray(this.datos[tablaKey]) || this.datos[tablaKey].length === 0) {
      this.datos[tablaKey] = structuredClone(this.ubicacionCpConfig.estructuraInicial);
      this.projectFacade.setField(this.seccionId, null, tablaKey, this.datos[tablaKey]);
      this.onFieldChange(tablaKey, this.datos[tablaKey], { refresh: false });
      try { this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: this.datos[tablaKey] }); } catch (e) {}
    }

    // Inicializar Título y Fuente de tabla
    const tituloField = 'cuadroTituloUbicacionCp';
    const valorTitulo = `Ubicación referencial – Centro Poblado ${this.datos.centroPobladoAISI || this.datos.informacionReferencialAISI?.centro_poblado || '____'}`;
    if (!this.datos[tituloField] || this.datos[tituloField] !== valorTitulo) {
      this.datos[tituloField] = valorTitulo;
      this.projectFacade.setField(this.seccionId, null, tituloField, valorTitulo);
      this.onFieldChange(tituloField, valorTitulo, { refresh: false });
    }

    const fuenteField = 'cuadroFuenteUbicacionCp';
    if (!this.datos[fuenteField]) {
      const valorFuente = 'GEADES (2024)';
      this.datos[fuenteField] = valorFuente;
      this.projectFacade.setField(this.seccionId, null, fuenteField, valorFuente);
      this.onFieldChange(fuenteField, valorFuente, { refresh: false });
    }
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  actualizarParrafoAisi(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'parrafoSeccion21_aisi_intro_completo', valor);
    this.onFieldChange('parrafoSeccion21_aisi_intro_completo', valor);
  }

  actualizarParrafoCentro(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'parrafoSeccion21_centro_poblado_completo', valor);
    this.onFieldChange('parrafoSeccion21_centro_poblado_completo', valor);
  }

  inicializarUbicacionCp(): void {
    const tabla = [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }];
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo) this.projectFacade.setField(this.seccionId, null, `ubicacionCpTabla${prefijo}`, tabla);
    this.projectFacade.setField(this.seccionId, null, 'ubicacionCpTabla', tabla);
    this.onFieldChange('ubicacionCpTabla', tabla, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'table', { [this.getTablaKeyUbicacionCp()]: tabla, ['ubicacionCpTabla']: tabla }); } catch (e) {}
  }

  agregarUbicacionCp(): void {
    const tabla = [...this.ubicacionCpSignal()];
    tabla.push({ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' });
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo) this.projectFacade.setField(this.seccionId, null, `ubicacionCpTabla${prefijo}`, tabla);
    this.projectFacade.setField(this.seccionId, null, 'ubicacionCpTabla', tabla);
    this.onFieldChange('ubicacionCpTabla', tabla);
  }

  eliminarUbicacionCp(index: number): void {
    const tabla = [...this.ubicacionCpSignal()];
    if (tabla.length > 1) {
      tabla.splice(index, 1);
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) this.projectFacade.setField(this.seccionId, null, `ubicacionCpTabla${prefijo}`, tabla);
      this.projectFacade.setField(this.seccionId, null, 'ubicacionCpTabla', tabla);
      this.onFieldChange('ubicacionCpTabla', tabla);
    }
  }

  actualizarUbicacionCp(index: number, field: string, value: any): void {
    const tabla = [...this.ubicacionCpSignal()];
    if (!tabla[index]) return;
    tabla[index] = { ...tabla[index], [field]: value };
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo) this.projectFacade.setField(this.seccionId, null, `ubicacionCpTabla${prefijo}`, tabla);
    this.projectFacade.setField(this.seccionId, null, 'ubicacionCpTabla', tabla);
    this.onFieldChange('ubicacionCpTabla', tabla, { refresh: false });
    // Persistir en la clave base y forzar actualización inmediata
    try { this.formChange.persistFields(this.seccionId, 'table', { [this.getTablaKeyUbicacionCp()]: tabla, ['ubicacionCpTabla']: tabla }); } catch (e) {}
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.cdRef.markForCheck();
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  onTituloUbicacionChange(valor: string): void {
    const fieldId = 'cuadroTituloUbicacionCp';
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  onFuenteUbicacionChange(valor: string): void {
    const fieldId = 'cuadroFuenteUbicacionCp';
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  trackByIndex(index: number): number { return index; }
}
