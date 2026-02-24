import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION21_CONFIG, SECCION21_TEMPLATES } from './seccion21-constants';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule],
  selector: 'app-seccion21-form',
  templateUrl: './seccion21-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion21FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION21_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;

  // ✅ EXPORTAR CONSTANTES PARA EL TEMPLATE
  readonly SECCION21_TEMPLATES = SECCION21_TEMPLATES;

  override useReactiveSync: boolean = true;

  // PHOTO_PREFIX como Signal para que se actualice cuando cambie el grupo
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ PHOTO_PREFIX como string para compatibilidad con SectionPhotoCoordinator
  // Se actualiza en el constructor cuando cambia el grupo
  override PHOTO_PREFIX: string = '';
  
  // NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;

  constructor(
    cdRef: ChangeDetectorRef, 
    injector: Injector, 
    private formChange: FormChangeService,
    private globalNumbering: GlobalNumberingService
  ) {
    super(cdRef, injector);
    
    // Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      // Mantener el prefijo con grupo para compatibilidad con el sistema
      const prefijo = this.obtenerPrefijoGrupo();
      return prefijo ? `fotografia${prefijo}` : 'fotografia';
    });
    
    // ✅ Sincronizar PHOTO_PREFIX (string) con photoPrefixSignal para compatibilidad
    // con SectionPhotoCoordinator
    effect(() => {
      this.PHOTO_PREFIX = this.photoPrefixSignal();
    });
    
    // Signal para número global de tabla
    this.globalTableNumberSignal = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      return globalNum;
    });
    
    // Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      const photoNumbers = fotos.map((_, index) => {
        // NO agregar prefijo "3." porque getGlobalPhotoNumber ya lo incluye
        return this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
      });
      return photoNumbers;
    });



    // ✅ 0% LEGACY: Eliminado this.datos - usar solo Signals
    // Los datos se leen directamente desde formDataSignal y se renderizan en el template
    
    // Effect para fotos - se mantiene para Change Detection
    effect(() => {
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly parrafoAisiSignal: Signal<string> = computed(() => {
    // ✅ LEER TEXTO PERSONALIZADO O GENERAR AUTOMÁTICO
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `parrafoSeccion21_aisi_intro_completo${prefijo}` : 'parrafoSeccion21_aisi_intro_completo';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldPref)();
    
    // Si hay texto personalizado, mostrarlo
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Si no, generar automáticamente usando template y valores dinámicos
    const data = this.formDataSignal();
    const centro = this.obtenerNombreCentroPobladoActual();
    const provincia = data['provinciaSeleccionada'] || '____';
    const departamento = data['departamentoSeleccionado'] || '____';
    
    return SECCION21_TEMPLATES.parrafoAISITemplate
      .replace(/{CENTRO}/g, centro)
      .replace(/{PROVINCIA}/g, provincia)
      .replace(/{DEPARTAMENTO}/g, departamento);
  });

  readonly centroPobladoAisiSignal: Signal<string> = computed(() => {
    return this.obtenerNombreCentroPobladoActual();
  });

  readonly labelFotografiasSignal: Signal<string> = computed(() => {
    return `Fotografías de ${this.obtenerNombreCentroPobladoActual()}`;
  });

  readonly tituloDefaultFotoSignal: Signal<string> = computed(() => {
    return `Centro Poblado ${this.obtenerNombreCentroPobladoActual()}`;
  });


  // ✅ SEÑALES PARA CAMPOS CON PREFIJO (AISLAMIENT O COMPLETO)
  readonly leyCreacionDistritoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `leyCreacionDistrito${prefijo}` : 'leyCreacionDistrito';
    return this.projectFacade.selectField(this.seccionId, null, fieldPref)() || '';
  });

  readonly fechaCreacionDistritoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `fechaCreacionDistrito${prefijo}` : 'fechaCreacionDistrito';
    return this.projectFacade.selectField(this.seccionId, null, fieldPref)() || '';
  });

  readonly distritoAnteriorSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `distritoAnterior${prefijo}` : 'distritoAnterior';
    return this.projectFacade.selectField(this.seccionId, null, fieldPref)() || '';
  });

  readonly cuadroTituloUbicacionCpSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
    return this.projectFacade.selectField(this.seccionId, null, fieldPref)() || '';
  });

  readonly cuadroFuenteUbicacionCpSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `cuadroFuenteUbicacionCp${prefijo}` : 'cuadroFuenteUbicacionCp';
    return this.projectFacade.selectField(this.seccionId, null, fieldPref)() || '';
  });

  // HANDLERS PARA ACTUALIZAR CAMPOS CON PREFIJO
  onLeyCreacionDistritoChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `leyCreacionDistrito${prefijo}` : 'leyCreacionDistrito';
    this.onFieldChange(fieldPref, valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { [fieldPref]: valor }); } catch (e) {}
  }

  onFechaCreacionDistritoChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `fechaCreacionDistrito${prefijo}` : 'fechaCreacionDistrito';
    this.onFieldChange(fieldPref, valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { [fieldPref]: valor }); } catch (e) {}
  }

  onDistritoAnteriorChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `distritoAnterior${prefijo}` : 'distritoAnterior';
    this.onFieldChange(fieldPref, valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { [fieldPref]: valor }); } catch (e) {}
  }

  readonly parrafoCentroSignal: Signal<string> = computed(() => {
    // ✅ LEER TEXTO PERSONALIZADO O GENERAR AUTOMÁTICO
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `parrafoSeccion21_centro_poblado_completo${prefijo}` : 'parrafoSeccion21_centro_poblado_completo';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldPref)();
    
    // Si hay texto personalizado, mostrarlo
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Si no, generar automáticamente usando template y valores dinámicos
    const data = this.formDataSignal();
    const centro = this.obtenerNombreCentroPobladoActual();
    const provincia = data['provinciaSeleccionada'] || '____';
    const departamento = data['departamentoSeleccionado'] || '____';
    const ley = PrefijoHelper.obtenerValorConPrefijo(data, 'leyCreacionDistrito', this.seccionId) || '____';
    const fecha = PrefijoHelper.obtenerValorConPrefijo(data, 'fechaCreacionDistrito', this.seccionId) || '____';
    const distrito = PrefijoHelper.obtenerValorConPrefijo(data, 'distritoSeleccionado', this.seccionId) || '____';
    const distritoAnterior = PrefijoHelper.obtenerValorConPrefijo(data, 'distritoAnterior', this.seccionId) || '____';
    
    return SECCION21_TEMPLATES.parrafoCentroTemplate
      .replace(/{CENTRO}/g, centro)
      .replace(/{PROVINCIA}/g, provincia)
      .replace(/{DEPARTAMENTO}/g, departamento)
      .replace(/{LEY}/g, ley)
      .replace(/{FECHA}/g, fecha)
      .replace(/{DISTRITO}/g, distrito)
      .replace(/{DISTRITOANTERIOR}/g, distritoAnterior);
  })

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    // ✅ CORREGIDO: Usar prefijo base y grupo separados para el esquema correcto
    const basePrefix = 'fotografia'; // Prefijo base sin grupo
    const groupPrefix = this.obtenerPrefijoGrupo(); // _B1, _A1, etc.
    
    for (let i = 1; i <= 10; i++) {
      // Esquema correcto: {prefix}{i}{suffix}{group} → fotografia1Imagen_B1
      const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
      const titKey = groupPrefix ? `${basePrefix}${i}Titulo${groupPrefix}` : `${basePrefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${basePrefix}${i}Fuente${groupPrefix}` : `${basePrefix}${i}Fuente`;
      
      const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
      
      if (imagen) {
        fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
    }
    return fotos;
  });

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  readonly ubicacionCpSignal: Signal<any[]> = computed(() => {
    const tablaKey = this.getTablaKeyUbicacionCp();
    // Primero intentar con clave con prefijo
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    
    // Si no hay datos con prefijo, intentar con clave base
    const fromFieldBase = this.projectFacade.selectField(this.seccionId, null, 'ubicacionCpTabla')();
    const fromTableBase = this.projectFacade.selectTableData(this.seccionId, null, 'ubicacionCpTabla')();
    
    return fromField ?? fromTable ?? fromFieldBase ?? fromTableBase ?? [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }];
  });

  getTablaKeyUbicacionCp(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
  }

  get ubicacionCpConfig(): any {
    return {
      tablaKey: this.getTablaKeyUbicacionCp(),
      totalKey: 'localidad',
      // ✅ NO incluir campoTotal porque es texto, no número
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
    
    // Actualizar datos locales directamente para evitar recarga del DynamicTable
    this.datos[tablaKey] = [...tabla];
    this.datos['ubicacionCpTabla'] = [...tabla];
    
    // Persistir con la clave correcta (con prefijo si existe)
    this.onFieldChange(tablaKey, [...tabla], { refresh: false });
    // También mantener clave base para compatibilidad
    this.onFieldChange('ubicacionCpTabla', [...tabla], { refresh: false });
    
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, 'ubicacionCpTabla': tabla });
    } catch (e) {}
    
    // No llamar a actualizarDatos() aquí para evitar que el DynamicTable recargue datos
    this.cdRef.detectChanges();
  }

  readonly viewModel = computed(() => ({
    parrafoAisi: this.parrafoAisiSignal(),
    parrafoCentro: this.parrafoCentroSignal(),
    fotos: this.fotosCacheSignal(),
    ubicacionCp: this.ubicacionCpSignal()
  }));

  protected override onInitCustom(): void {
    // 📋 LOG DEL GRUPO AISI ACTUAL
    
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual (siempre)
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar solo el store con prefijo para aislamiento
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }); } catch (e) {}
    
    // ✅ INICIALIZAR PÁRRAFOS CON PREFIJO (AISLAMIENT O DE DATOS)
    const parrafoAisiField = prefijo ? `parrafoSeccion21_aisi_intro_completo${prefijo}` : 'parrafoSeccion21_aisi_intro_completo';
    const parrafoCentroField = prefijo ? `parrafoSeccion21_centro_poblado_completo${prefijo}` : 'parrafoSeccion21_centro_poblado_completo';
    
    // Solo inicializar si no existen datos
    if (!this.datos[parrafoAisiField]) {
      this.datos[parrafoAisiField] = '';
      this.projectFacade.setField(this.seccionId, null, parrafoAisiField, '');
      this.onFieldChange(parrafoAisiField, '', { refresh: false });
    }
    
    if (!this.datos[parrafoCentroField]) {
      this.datos[parrafoCentroField] = '';
      this.projectFacade.setField(this.seccionId, null, parrafoCentroField, '');
      this.onFieldChange(parrafoCentroField, '', { refresh: false });
    }
    
    // 🔍 FORZAR DETECCIÓN DE CAMBIOS PARA ACTUALIZAR EL TÍTULO
    this.cdRef.detectChanges();
    
    // ✅ AUTO-POBLAR TABLA UBICACIÓN CP CON DATOS DEL CENTRO POBLADO
    this.autoPoblarTablaUbicacionCp(centroPobladoAISI, prefijo);
    
    // Asegurar inicialización de tabla y campos (como en Seccion20)
    const tablaKey = this.getTablaKeyUbicacionCp();
    if (!this.datos[tablaKey] || !Array.isArray(this.datos[tablaKey]) || this.datos[tablaKey].length === 0) {
      this.datos[tablaKey] = structuredClone(this.ubicacionCpConfig.estructuraInicial);
      this.projectFacade.setField(this.seccionId, null, tablaKey, this.datos[tablaKey]);
      this.onFieldChange(tablaKey, this.datos[tablaKey], { refresh: false });
      try { this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: this.datos[tablaKey] }); } catch (e) {}
    }

    // Inicializar Título y Fuente de tabla CON PREFIJO
    const tituloField = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
    const valorTitulo = `Ubicación referencial – Centro Poblado ${this.obtenerNombreCentroPobladoActual()}`;
    if (!this.datos[tituloField] || this.datos[tituloField] !== valorTitulo) {
      this.datos[tituloField] = valorTitulo;
      this.projectFacade.setField(this.seccionId, null, tituloField, valorTitulo);
      this.onFieldChange(tituloField, valorTitulo, { refresh: false });
    }

    const fuenteField = prefijo ? `cuadroFuenteUbicacionCp${prefijo}` : 'cuadroFuenteUbicacionCp';
    if (!this.datos[fuenteField]) {
      const valorFuente = 'GEADES (2024)';
      this.datos[fuenteField] = valorFuente;
      this.projectFacade.setField(this.seccionId, null, fuenteField, valorFuente);
      this.onFieldChange(fuenteField, valorFuente, { refresh: false });
    }

    // ✅ EFFECT: Detectar cambios en CCPPs del grupo y re-autollar tabla si es necesario
    effect(() => {
      const ccppsActuales = this.obtenerCCPPsDelGrupoAISI();
      const ccppIdsActuales = ccppsActuales.map(cc => cc.id || cc.codigo).sort().join(',');
      const prefijo = this.obtenerPrefijoGrupo();
      const tablaKeyPref = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
      const tablaActual = this.projectFacade.selectField(this.seccionId, null, tablaKeyPref)();
      
      // Verificar si necesitamos re-autollar
      const tieneCapitalActual = ccppsActuales.some(cc => 
        cc.categoria && cc.categoria.toLowerCase().includes('capital')
      );
      
      // Si la tabla está vacía O el CCPP actual ya no es capital del grupo, re-autollar
      const tablaVacia = !tablaActual || !Array.isArray(tablaActual) || tablaActual.length === 0 || !tablaActual[0]?.localidad;
      
      if (tablaVacia || tieneCapitalActual) {

        // Auto-poblar tabla de ubicación sin delay - ya estamos en un effect() reactivo
        this.autoPoblarTablaUbicacionCp(this.obtenerNombreCentroPobladoActual(), prefijo);
      }
    });
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  actualizarParrafoAisi(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `parrafoSeccion21_aisi_intro_completo${prefijo}` : 'parrafoSeccion21_aisi_intro_completo';
    this.onFieldChange(fieldPref, valor);
    try { this.formChange.persistFields(this.seccionId, 'text', { [fieldPref]: valor }); } catch (e) {}
  }

  actualizarParrafoCentro(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `parrafoSeccion21_centro_poblado_completo${prefijo}` : 'parrafoSeccion21_centro_poblado_completo';
    this.onFieldChange(fieldPref, valor);
    try { this.formChange.persistFields(this.seccionId, 'text', { [fieldPref]: valor }); } catch (e) {}
  }

  getParrafoAisiFieldId(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion21_aisi_intro_completo${prefijo}` : 'parrafoSeccion21_aisi_intro_completo';
  }

  getParrafoCentroFieldId(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion21_centro_poblado_completo${prefijo}` : 'parrafoSeccion21_centro_poblado_completo';
  }

  inicializarUbicacionCp(): void {
    const tabla = [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }];
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
    
    // Inicializar con clave con prefijo y base
    this.projectFacade.setField(this.seccionId, null, tablaKey, tabla);
    this.projectFacade.setField(this.seccionId, null, 'ubicacionCpTabla', tabla);
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    this.onFieldChange('ubicacionCpTabla', tabla, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, ['ubicacionCpTabla']: tabla }); } catch (e) {}
  }

  agregarUbicacionCp(): void {
    const tabla = [...this.ubicacionCpSignal()];
    tabla.push({ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' });
    
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
    
    // Actualizar datos locales directamente para evitar recarga del DynamicTable
    this.datos[tablaKey] = [...tabla];
    this.datos['ubicacionCpTabla'] = [...tabla];
    
    // Actualizar con clave con prefijo
    this.projectFacade.setField(this.seccionId, null, tablaKey, tabla);
    // También mantener clave base
    this.projectFacade.setField(this.seccionId, null, 'ubicacionCpTabla', tabla);
    this.onFieldChange(tablaKey, tabla);
    this.onFieldChange('ubicacionCpTabla', tabla);
  }

  eliminarUbicacionCp(index: number): void {
    const tabla = [...this.ubicacionCpSignal()];
    if (tabla.length > 1) {
      tabla.splice(index, 1);
      
      const prefijo = this.obtenerPrefijoGrupo();
      const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
      
      // Actualizar datos locales directamente para evitar recarga del DynamicTable
      this.datos[tablaKey] = [...tabla];
      this.datos['ubicacionCpTabla'] = [...tabla];
      
      // Actualizar con clave con prefijo
      this.projectFacade.setField(this.seccionId, null, tablaKey, tabla);
      // También mantener clave base
      this.projectFacade.setField(this.seccionId, null, 'ubicacionCpTabla', tabla);
      this.onFieldChange(tablaKey, tabla);
      this.onFieldChange('ubicacionCpTabla', tabla);
    }
  }

  actualizarUbicacionCp(index: number, field: string, value: any): void {
    const tabla = [...this.ubicacionCpSignal()];
    if (!tabla[index]) return;
    tabla[index] = { ...tabla[index], [field]: value };
    
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
    
    // Actualizar datos locales directamente para evitar recarga del DynamicTable
    this.datos[tablaKey] = [...tabla];
    this.datos['ubicacionCpTabla'] = [...tabla];
    
    // Actualizar con clave con prefijo
    this.projectFacade.setField(this.seccionId, null, tablaKey, tabla);
    // También mantener clave base para compatibilidad
    this.projectFacade.setField(this.seccionId, null, 'ubicacionCpTabla', tabla);
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    this.onFieldChange('ubicacionCpTabla', tabla, { refresh: false });
    
    // Persistir en la clave con prefijo y base
    try { this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, ['ubicacionCpTabla']: tabla }); } catch (e) {}
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    // ✅ Usar prefijo base y grupo separados para el esquema correcto
    const prefix = 'fotografia'; // Prefijo base sin grupo
    const groupPrefix = this.obtenerPrefijoGrupo(); // _B1, _A1, etc.
    
    // NO llamar a onGrupoFotografiasChange porque usa el esquema incorrecto
    // En su lugar, guardar directamente en ProjectStateFacade y persistir
    const updates: Record<string, any> = {};
    
    // Limpiar fotos anteriores (hasta 10)
    for (let i = 1; i <= 10; i++) {
      const imgKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      const titKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
      updates[imgKey] = '';
      updates[titKey] = '';
      updates[fuenteKey] = '';
    }
    
    // Guardar nuevas fotos
    fotografias.forEach((foto, index) => {
      if (foto.imagen) {
        const idx = index + 1;
        const imgKey = groupPrefix ? `${prefix}${idx}Imagen${groupPrefix}` : `${prefix}${idx}Imagen`;
        const titKey = groupPrefix ? `${prefix}${idx}Titulo${groupPrefix}` : `${prefix}${idx}Titulo`;
        const fuenteKey = groupPrefix ? `${prefix}${idx}Fuente${groupPrefix}` : `${prefix}${idx}Fuente`;
        updates[imgKey] = foto.imagen;
        updates[titKey] = foto.titulo || '';
        updates[fuenteKey] = foto.fuente || '';
      }
    });
    
    // Guardar en ProjectStateFacade
    this.projectFacade.setFields(this.seccionId, null, updates);
    
    // Persistir al backend
    try {
      this.formChange.persistFields(this.seccionId, 'images', updates);
    } catch (e) {}
    
    this.cdRef.markForCheck();
  }

  onTituloUbicacionChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  onFuenteUbicacionChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `cuadroFuenteUbicacionCp${prefijo}` : 'cuadroFuenteUbicacionCp';
    this.datos[fieldId] = valor;
    this.onFieldChange(fieldId, valor, { refresh: false });
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  
  // ============================================================================
  // AUTO-POBLAR TABLA UBICACIÓN CP CON DATOS DEL CENTRO POBLADO
  // ============================================================================
  
  private autoPoblarTablaUbicacionCp(nombreCentroPoblado: string, prefijo: string): void {
    const tablaKeyPref = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
    

    
    // ✅ NUEVA LÓGICA: Obtener CCPPs del grupo AISI actual
    const ccppsDelGrupo = this.obtenerCCPPsDelGrupoAISI();

    
    if (ccppsDelGrupo.length === 0) {

      return;
    }
    
    // Buscar capital en LOS CCPPs DEL GRUPO ACTUAL
    const capitalDelGrupo = ccppsDelGrupo.find(cc => 
      cc.categoria && cc.categoria.toLowerCase().includes('capital')
    );
    
    // Si no hay capital en el grupo, usar el de mayor población del grupo
    let ccppSeleccionado = capitalDelGrupo;
    if (!ccppSeleccionado) {

      ccppSeleccionado = ccppsDelGrupo.reduce((max, cc) => 
        (cc.poblacion > (max?.poblacion || 0)) ? cc : max
      , ccppsDelGrupo[0]);
    }
    
    if (!ccppSeleccionado) {

      return;
    }
    

    
    // ✅ VERIFICAR SI LA TABLA YA TIENE EL CCPP CORRECTO
    const tablaActual = this.projectFacade.selectField(this.seccionId, null, tablaKeyPref)();
    const ccppActualTabla = tablaActual?.[0]?.localidad;
    
    // Si la tabla ya tiene el CCPP correcto del grupo, no re-autollar
    if (ccppActualTabla === ccppSeleccionado.nombre) {

      return;
    }
    
    // Si la tabla tiene datos old de otro CCPP, re-autollar
    if (ccppActualTabla && ccppActualTabla !== ccppSeleccionado.nombre) {

    }
    
    // Crear fila con datos del centro poblado (formateados como Sección 4)
    const tabla = [{
      localidad: ccppSeleccionado.nombre || '',
      coordenadas: this.formatCoordenadas(ccppSeleccionado.este, ccppSeleccionado.norte),
      altitud: this.formatAltitud(ccppSeleccionado.altitud),
      distrito: ccppSeleccionado.dist || '',
      provincia: ccppSeleccionado.prov || '',
      departamento: ccppSeleccionado.dpto || ''
    }];
    

    
    // Guardar en tabla prefijada (aislamiento)
    this.projectFacade.setField(this.seccionId, null, tablaKeyPref, tabla);
    this.datos[tablaKeyPref] = tabla;
    
    // Persistir en formChange
    try { this.formChange.persistFields(this.seccionId, 'table', { [tablaKeyPref]: tabla }); } catch (e) {}
    
    // Forzar actualización
    this.cdRef.detectChanges();
  }

  trackByIndex(index: number): number { return index; }

  /**
   * Formatea números con separadores de miles (locales para Perú)
   * @param valor - Número a formatear
   * @returns String formateado (ej: 663078 → "663,078")
   */
  private formatMiles(valor: number | string | undefined | null): string {
    if (valor === undefined || valor === null || valor === '') return '';
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) return '';
    return num.toLocaleString('es-PE');
  }

  /**
   * Formatea las coordenadas en el formato requerido (como Sección 4)
   * @param este - Coordenada Este
   * @param norte - Coordenada Norte
   * @returns String formateado con zona UTM (ej: "18L\nE:  663,078 m\nN:  8,285,498 m")
   */
  private formatCoordenadas(este: number | string | undefined | null, norte: number | string | undefined | null): string {
    const zonaUTM = '18L';
    const esteFormateado = this.formatMiles(este);
    const norteFormateado = this.formatMiles(norte);
    return `${zonaUTM}\nE:  ${esteFormateado} m\nN:  ${norteFormateado} m`;
  }

  /**
   * Formatea la altitud con su unidad
   * @param altitud - Valor de altitud
   * @returns String formateado (ej: 3423 → "3,423 msnm")
   */
  private formatAltitud(altitud: number | string | undefined | null): string {
    const altitudFormateada = this.formatMiles(altitud);
    return altitudFormateada ? `${altitudFormateada} msnm` : '';
  }
}
