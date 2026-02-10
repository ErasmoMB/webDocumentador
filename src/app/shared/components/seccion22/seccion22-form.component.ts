import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ISeccion22TextGeneratorService } from 'src/app/core/domain/interfaces';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule],
  selector: 'app-seccion22-form',
  templateUrl: './seccion22-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion22FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.1';
  @Input() override modoFormulario: boolean = false;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly textoDemografiaSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoDemografiaAISI')();
    if (manual && manual.trim().length > 0) return manual;
    const data = this.formDataSignal() as any;
    try { return this.textGenerator.generateDemografiaText(data); } catch (e) { return ''; }
  });

  readonly textoGrupoEtarioSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoGrupoEtarioAISI')();
    if (manual && manual.trim().length > 0) return manual;
    const data = this.formDataSignal() as any;
    try { return this.textGenerator.generateGrupoEtarioText(data); } catch (e) { return ''; }
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      if (imagen) fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
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

  readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
    return this.projectFacade.selectTableData(this.seccionId, null, 'poblacionSexoAISI')() ?? this.projectFacade.selectField(this.seccionId, null, 'poblacionSexoAISI')() ?? [];
  });

  readonly poblacionEtarioSignal: Signal<any[]> = computed(() => {
    return this.projectFacade.selectTableData(this.seccionId, null, 'poblacionEtarioAISI')() ?? this.projectFacade.selectField(this.seccionId, null, 'poblacionEtarioAISI')() ?? [];
  });

  readonly tituloPoblacionSexoSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'tituloPoblacionSexoAISI')() || 'Población por sexo';
  });

  // Full title includes CP name and year when not already provided
  readonly fullTituloPoblacionSexoSignal: Signal<string> = computed(() => {
    const base = this.tituloPoblacionSexoSignal();
    const cp = PrefijoHelper.obtenerValorConPrefijo(this.formDataSignal(), 'centroPobladoAISI', this.seccionId) || '____';
    const year = '2017';
    if (!base || base.trim() === '') return `Población por sexo – CP ${cp} (${year})`;
    if (base.includes('– CP') || base.includes('CP ') || base.includes('(')) return base;
    return `${base} – CP ${cp} (${year})`;
  });

  readonly fuentePoblacionSexoSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'fuentePoblacionSexoAISI')() || 'Censos Nacionales 2017';
  });

  readonly tituloPoblacionEtarioSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'tituloPoblacionEtarioAISI')() || 'Población por grupo etario';
  });

  readonly fullTituloPoblacionEtarioSignal: Signal<string> = computed(() => {
    const base = this.tituloPoblacionEtarioSignal();
    const cp = PrefijoHelper.obtenerValorConPrefijo(this.formDataSignal(), 'centroPobladoAISI', this.seccionId) || '____';
    const year = '2017';
    if (!base || base.trim() === '') return `Población por grupo etario – CP ${cp} (${year})`;
    if (base.includes('– CP') || base.includes('CP ') || base.includes('(')) return base;
    return `${base} – CP ${cp} (${year})`;
  });

  readonly fuentePoblacionEtarioSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'fuentePoblacionEtarioAISI')() || 'Censos Nacionales 2017';
  });

  readonly viewModel = computed(() => ({
    textoDemografia: this.textoDemografiaSignal(),
    textoGrupoEtario: this.textoGrupoEtarioSignal(),
    fotos: this.fotosCacheSignal(),
    poblacionSexo: this.poblacionSexoSignal(),
    poblacionEtario: this.poblacionEtarioSignal(),
    tituloPoblacionSexo: this.tituloPoblacionSexoSignal(),
    fullTituloPoblacionSexo: this.fullTituloPoblacionSexoSignal(),
    fuentePoblacionSexo: this.fuentePoblacionSexoSignal(),
    tituloPoblacionEtario: this.tituloPoblacionEtarioSignal(),
    fullTituloPoblacionEtario: this.fullTituloPoblacionEtarioSignal(),
    fuentePoblacionEtario: this.fuentePoblacionEtarioSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private formChange: FormChangeService, private textGenerator: ISeccion22TextGeneratorService) {
    super(cdRef, injector);
    // Inicializar PHOTO_PREFIX dinámicamente basado en el grupo actual
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar tanto el objeto local como el store
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }); } catch (e) {}
    
    // Inicializar párrafos con valores por defecto
    const textoDemografia = this.projectFacade.selectField(this.seccionId, null, 'textoDemografiaAISI')();
    if (!textoDemografia || textoDemografia.trim() === '') {
      this.projectFacade.setField(this.seccionId, null, 'textoDemografiaAISI', '');
      try { this.formChange.persistFields(this.seccionId, 'text', { textoDemografiaAISI: '' }); } catch (e) {}
    }
    const textoGrupoEtario = this.projectFacade.selectField(this.seccionId, null, 'textoGrupoEtarioAISI')();
    if (!textoGrupoEtario || textoGrupoEtario.trim() === '') {
      this.projectFacade.setField(this.seccionId, null, 'textoGrupoEtarioAISI', '');
      try { this.formChange.persistFields(this.seccionId, 'text', { textoGrupoEtarioAISI: '' }); } catch (e) {}
    }

    // Inicializar tabla Población por Sexo con estructura fija (Hombre / Mujer) y no editable
    const tablaKeySexo = 'poblacionSexoAISI';
    const existingFieldSexo = this.projectFacade.selectField(this.seccionId, null, tablaKeySexo)();
    const existingTableSexo = this.projectFacade.selectTableData(this.seccionId, null, tablaKeySexo)();
    const currentSexo = existingFieldSexo ?? existingTableSexo ?? [];

    if (!Array.isArray(currentSexo) || currentSexo.length === 0) {
      const inicialSexo = [
        { sexo: 'Hombre', casos: '', porcentaje: '' },
        { sexo: 'Mujer', casos: '', porcentaje: '' }
      ];

      // Persistir en clave base y clave con prefijo si aplica
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      if (prefijo) {
        this.projectFacade.setField(this.seccionId, null, `${tablaKeySexo}${prefijo}`, inicialSexo);
      }
      this.projectFacade.setField(this.seccionId, null, tablaKeySexo, inicialSexo);
      try { this.formChange.persistFields(this.seccionId, 'table', { [tablaKeySexo]: inicialSexo }); } catch (e) {}

      // Actualizar datos locales
      this.datos[tablaKeySexo] = inicialSexo;
      this.cdRef.markForCheck();
    }

    // Inicializar tabla Población por Grupo Etario con estructura fija
    const tablaKeyEtario = 'poblacionEtarioAISI';
    const existingFieldEtario = this.projectFacade.selectField(this.seccionId, null, tablaKeyEtario)();
    const existingTableEtario = this.projectFacade.selectTableData(this.seccionId, null, tablaKeyEtario)();
    const currentEtario = existingFieldEtario ?? existingTableEtario ?? [];

    if (!Array.isArray(currentEtario) || currentEtario.length === 0) {
      const inicialEtario = [
        { categoria: '0 a 14 años', casos: '', porcentaje: '' },
        { categoria: '15 a 29 años', casos: '', porcentaje: '' },
        { categoria: '30 a 44 años', casos: '', porcentaje: '' },
        { categoria: '45 a 64 años', casos: '', porcentaje: '' },
        { categoria: '65 años a más', casos: '', porcentaje: '' }
      ];

      // Persistir en clave base y clave con prefijo si aplica
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      if (prefijo) {
        this.projectFacade.setField(this.seccionId, null, `${tablaKeyEtario}${prefijo}`, inicialEtario);
      }
      this.projectFacade.setField(this.seccionId, null, tablaKeyEtario, inicialEtario);
      try { this.formChange.persistFields(this.seccionId, 'table', { [tablaKeyEtario]: inicialEtario }); } catch (e) {}

      // Actualizar datos locales
      this.datos[tablaKeyEtario] = inicialEtario;
      this.cdRef.markForCheck();
    }

    // Inicializar Títulos y Fuentes de cuadros (patrón Sección 21)
    const tituloSexoField = 'cuadroTituloPoblacionSexo';
    if (!this.datos[tituloSexoField]) {
      const valorTitulo = `Población por sexo – CP ${PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId) || '____'} (2017)`;
      this.datos[tituloSexoField] = valorTitulo;
      this.onFieldChange(tituloSexoField, valorTitulo, { refresh: false });
    }

    const fuenteSexoField = 'cuadroFuentePoblacionSexo';
    if (!this.datos[fuenteSexoField]) {
      const valorFuente = 'Censos Nacionales 2017';
      this.datos[fuenteSexoField] = valorFuente;
      this.onFieldChange(fuenteSexoField, valorFuente, { refresh: false });
    }

    const tituloEtarioField = 'cuadroTituloPoblacionEtario';
    if (!this.datos[tituloEtarioField]) {
      const valorTitulo = `Población por grupo etario – CP ${PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId) || '____'} (2017)`;
      this.datos[tituloEtarioField] = valorTitulo;
      this.onFieldChange(tituloEtarioField, valorTitulo, { refresh: false });
    }

    const fuenteEtarioField = 'cuadroFuentePoblacionEtario';
    if (!this.datos[fuenteEtarioField]) {
      const valorFuente = 'Censos Nacionales 2017';
      this.datos[fuenteEtarioField] = valorFuente;
      this.onFieldChange(fuenteEtarioField, valorFuente, { refresh: false });
    }
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void {
    // Restaurar centroPobladoAISI con el prefijo correcto
    const centro = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centro || null;
  }

  actualizarTextoDemografia(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'textoDemografiaAISI', valor);
    this.onFieldChange('textoDemografiaAISI', valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  actualizarTextoGrupoEtario(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'textoGrupoEtarioAISI', valor);
    this.onFieldChange('textoGrupoEtarioAISI', valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  actualizarTituloPoblacionSexo(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'tituloPoblacionSexoAISI', valor);
    this.onFieldChange('tituloPoblacionSexoAISI', valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  actualizarFuentePoblacionSexo(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'fuentePoblacionSexoAISI', valor);
    this.onFieldChange('fuentePoblacionSexoAISI', valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  // Handlers para editar el título completo del cuadro (patrón Sección 21)
  onTituloCuadroPoblacionSexoChange(valor: string): void {
    const fieldId = 'cuadroTituloPoblacionSexo';
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });

    // Also update base title for compatibility
    try {
      this.projectFacade.setField(this.seccionId, null, 'tituloPoblacionSexoAISI', valor);
      this.formChange.persistFields(this.seccionId, 'text', { [fieldId]: valor, tituloPoblacionSexoAISI: valor });
    } catch (e) {}

    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  onFuenteCuadroPoblacionSexoChange(valor: string): void {
    const fieldId = 'cuadroFuentePoblacionSexo';
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });

    // Also keep base fuente field in sync for compatibility
    try {
      this.projectFacade.setField(this.seccionId, null, 'fuentePoblacionSexoAISI', valor);
      this.formChange.persistFields(this.seccionId, 'text', { [fieldId]: valor, fuentePoblacionSexoAISI: valor });
    } catch (e) {}

    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  onTituloCuadroPoblacionEtarioChange(valor: string): void {
    const fieldId = 'cuadroTituloPoblacionEtario';
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });

    // Also update base title for compatibility
    try {
      this.projectFacade.setField(this.seccionId, null, 'tituloPoblacionEtarioAISI', valor);
      this.formChange.persistFields(this.seccionId, 'text', { [fieldId]: valor, tituloPoblacionEtarioAISI: valor });
    } catch (e) {}

    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  onFuenteCuadroPoblacionEtarioChange(valor: string): void {
    const fieldId = 'cuadroFuentePoblacionEtario';
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });

    // Also keep base fuente field in sync
    try {
      this.projectFacade.setField(this.seccionId, null, 'fuentePoblacionEtarioAISI', valor);
      this.formChange.persistFields(this.seccionId, 'text', { [fieldId]: valor, fuentePoblacionEtarioAISI: valor });
    } catch (e) {}

    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  private normalizarTabla(tabla: any[]): any[] {
    return tabla.map((row: any) => {
      const rowNormalizado: any = {};
      for (const key in row) {
        const valor = row[key];
        // Si es objeto con { value, isCalculated }, extraer solo el value
        rowNormalizado[key] = typeof valor === 'object' && valor?.value !== undefined ? valor.value : valor;
      }
      return rowNormalizado;
    });
  }

  onPoblacionSexoUpdated(eventOrTabla: any): void {
    const tabla = Array.isArray(eventOrTabla) ? eventOrTabla : (eventOrTabla?.detail ?? eventOrTabla);
    if (!Array.isArray(tabla)) return;
    
    // Calcular porcentajes
    const tablaConPorcentajes = TablePercentageHelper.calcularPorcentajesPoblacionSexo(tabla);
    
    // Normalizar valores (extraer solo valores simples)
    const tablaNormalizada = this.normalizarTabla(tablaConPorcentajes);
    
    // Persistir tabla con clave base Y clave con prefijo si aplica
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    this.projectFacade.setField(this.seccionId, null, 'poblacionSexoAISI', tablaNormalizada);
    if (prefijo) {
      this.projectFacade.setField(this.seccionId, null, `poblacionSexoAISI${prefijo}`, tablaNormalizada);
    }
    try {
      const payload: any = { poblacionSexoAISI: tablaNormalizada };
      if (prefijo) payload[`poblacionSexoAISI${prefijo}`] = tablaNormalizada;
      this.formChange.persistFields(this.seccionId, 'table', payload);
    } catch (e) {}
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  onPoblacionEtarioUpdated(eventOrTabla: any): void {
    const tabla = Array.isArray(eventOrTabla) ? eventOrTabla : (eventOrTabla?.detail ?? eventOrTabla);
    if (!Array.isArray(tabla)) return;
    
    // Calcular porcentajes
    const tablaConPorcentajes = TablePercentageHelper.calcularPorcentajesSimple(tabla, 'casos');
    
    // Normalizar valores (extraer solo valores simples)
    const tablaNormalizada = this.normalizarTabla(tablaConPorcentajes);
    
    // Persistir tabla con clave base Y clave con prefijo si aplica
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    this.projectFacade.setField(this.seccionId, null, 'poblacionEtarioAISI', tablaNormalizada);
    if (prefijo) {
      this.projectFacade.setField(this.seccionId, null, `poblacionEtarioAISI${prefijo}`, tablaNormalizada);
    }
    try {
      const payload: any = { poblacionEtarioAISI: tablaNormalizada };
      if (prefijo) payload[`poblacionEtarioAISI${prefijo}`] = tablaNormalizada;
      this.formChange.persistFields(this.seccionId, 'table', payload);
    } catch (e) {}
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  trackByIndex(index: number): number { return index; }
}
