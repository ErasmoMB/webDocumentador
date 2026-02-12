import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';

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

  override useReactiveSync: boolean = true;

  // PHOTO_PREFIX como Signal para que se actualice cuando cambie el grupo
  readonly photoPrefixSignal: Signal<string>;
  
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
    
    console.debug('[SECCION21-FORM] Constructor iniciado');
    
    // Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const prefix = prefijo ? `fotografia${prefijo}` : 'fotografia';
      console.debug(`[SECCION21-FORM] photoPrefixSignal: ${prefix}`);
      return prefix;
    });
    
    // Signal para número global de tabla
    this.globalTableNumberSignal = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      console.debug(`[SECCION21-FORM] globalTableNumberSignal: Cuadro N° ${globalNum}`);
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
      console.debug(`[SECCION21-FORM] globalPhotoNumbersSignal: ${photoNumbers.join(', ')}`);
      return photoNumbers;
    });

    // Effect para logging
    effect(() => {
      console.debug(`[PHOTO-PREFIX-SIGNAL-FORM] ${this.photoPrefixSignal()}`);
      console.debug(`[NUMERACION-GLOBAL-FORM] Tabla: ${this.globalTableNumberSignal()}`);
    });

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

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly parrafoAisiSignal: Signal<string> = computed(() => {
    // ✅ LEER TEXTO PERSONALIZADO O GENERAR AUTOMÁTICO
    const fieldBase = 'parrafoSeccion21_aisi_intro_completo';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldBase)();
    
    // Si hay texto personalizado, mostrarlo
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Si no, generar automáticamente para el formulario
    const data = this.formDataSignal();
    const centro = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId) || 'Cahuacho';
    const provincia = PrefijoHelper.obtenerValorConPrefijo(data, 'provinciaSeleccionada', this.seccionId) || '';
    const departamento = PrefijoHelper.obtenerValorConPrefijo(data, 'departamentoSeleccionado', this.seccionId) || '';
    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el CP ${centro}, capital distrital de la jurisdicción homónima, en la provincia de ${provincia}, en el departamento de ${departamento}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente.`;
  });

  readonly centroPobladoAisiSignal: Signal<string> = computed(() => {
    return this.getCentroPobladoAISI() || '____';
  });

  readonly labelFotografiasSignal: Signal<string> = computed(() => {
    return `Fotografías de ${this.getCentroPobladoAISI() || '____'}`;
  });

  readonly tituloDefaultFotoSignal: Signal<string> = computed(() => {
    return `Centro Poblado ${this.getCentroPobladoAISI() || '____'}`;
  });

  getCentroPobladoAISI(): string {
    const data = this.formDataSignal();
    return PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId);
  }

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

  readonly origenPobladores1Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `origenPobladores1${prefijo}` : 'origenPobladores1';
    return this.projectFacade.selectField(this.seccionId, null, fieldPref)() || '';
  });

  readonly origenPobladores2Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `origenPobladores2${prefijo}` : 'origenPobladores2';
    return this.projectFacade.selectField(this.seccionId, null, fieldPref)() || '';
  });

  readonly departamentoOrigenSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `departamentoOrigen${prefijo}` : 'departamentoOrigen';
    return this.projectFacade.selectField(this.seccionId, null, fieldPref)() || '';
  });

  readonly anexosEjemploSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldPref = prefijo ? `anexosEjemplo${prefijo}` : 'anexosEjemplo';
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
    this.onFieldChange('leyCreacionDistrito', valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { 'leyCreacionDistrito': valor }); } catch (e) {}
  }

  onFechaCreacionDistritoChange(valor: string): void {
    this.onFieldChange('fechaCreacionDistrito', valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { 'fechaCreacionDistrito': valor }); } catch (e) {}
  }

  onDistritoAnteriorChange(valor: string): void {
    this.onFieldChange('distritoAnterior', valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { 'distritoAnterior': valor }); } catch (e) {}
  }

  onOrigenPobladores1Change(valor: string): void {
    this.onFieldChange('origenPobladores1', valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { 'origenPobladores1': valor }); } catch (e) {}
  }

  onOrigenPobladores2Change(valor: string): void {
    this.onFieldChange('origenPobladores2', valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { 'origenPobladores2': valor }); } catch (e) {}
  }

  onDepartamentoOrigenChange(valor: string): void {
    this.onFieldChange('departamentoOrigen', valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { 'departamentoOrigen': valor }); } catch (e) {}
  }

  onAnexosEjemploChange(valor: string): void {
    this.onFieldChange('anexosEjemplo', valor);
    try { this.formChange.persistFields(this.seccionId, 'form', { 'anexosEjemplo': valor }); } catch (e) {}
  }

  readonly parrafoCentroSignal: Signal<string> = computed(() => {
    // ✅ LEER TEXTO PERSONALIZADO O GENERAR AUTOMÁTICO
    const fieldBase = 'parrafoSeccion21_centro_poblado_completo';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldBase)();
    
    // Si hay texto personalizado, mostrarlo
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Si no, generar automáticamente para el formulario
    const data = this.formDataSignal();
    const centro = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId) || 'Cahuacho';
    const provincia = PrefijoHelper.obtenerValorConPrefijo(data, 'provinciaSeleccionada', this.seccionId) || 'Caravelí';
    const departamento = PrefijoHelper.obtenerValorConPrefijo(data, 'departamentoSeleccionado', this.seccionId) || 'Arequipa';
    const ley = PrefijoHelper.obtenerValorConPrefijo(data, 'leyCreacionDistrito', this.seccionId) || '8004';
    const fecha = PrefijoHelper.obtenerValorConPrefijo(data, 'fechaCreacionDistrito', this.seccionId) || '22 de febrero de 1935';
    const distrito = PrefijoHelper.obtenerValorConPrefijo(data, 'distritoSeleccionado', this.seccionId) || 'Cahuacho';
    const distritoAnterior = PrefijoHelper.obtenerValorConPrefijo(data, 'distritoAnterior', this.seccionId) || 'Caravelí';
    const origen1 = PrefijoHelper.obtenerValorConPrefijo(data, 'origenPobladores1', this.seccionId) || 'Caravelí';
    const origen2 = PrefijoHelper.obtenerValorConPrefijo(data, 'origenPobladores2', this.seccionId) || 'Parinacochas';
    const deptoOrigen = PrefijoHelper.obtenerValorConPrefijo(data, 'departamentoOrigen', this.seccionId) || 'Ayacucho';
    const anexos = PrefijoHelper.obtenerValorConPrefijo(data, 'anexosEjemplo', this.seccionId) || 'Ayroca o Sóndor';
    return `El CP ${centro} es la capital del distrito homónimo, perteneciente a la provincia de ${provincia}, en el departamento de ${departamento}. Su designación como capital distrital se oficializó mediante la Ley N°${ley}, promulgada el ${fecha}, fecha en que se creó el distrito de ${distrito}. Antes de ello, este asentamiento era un caserío del distrito de ${distritoAnterior}.`;
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefix = this.photoPrefixSignal();
    console.debug(`[FOTOS-FORM-DEBUG] fotosCacheSignal | seccionId: ${this.seccionId} | prefix: ${prefix}`);
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      
      console.debug(`[FOTOS-FORM-DEBUG]   i=${i} | campo: ${prefix}${i}Imagen | valor: ${imagen ? 'SÍ' : 'NO'}`);
      
      if (imagen) {
        fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
    }
    console.debug(`[FOTOS-FORM-DEBUG] FINAL | fotos.length: ${fotos.length}`);
    return fotos;
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const prefix = this.photoPrefixSignal();
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  readonly ubicacionCpSignal: Signal<any[]> = computed(() => {
    const tablaKey = this.getTablaKeyUbicacionCp();
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
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
    const tabla = this.ubicacionCpSignal();
    this.onFieldChange('ubicacionCpTabla', [...tabla], { refresh: false });
    try {
      this.formChange.persistFields(this.seccionId, 'table', { 'ubicacionCpTabla': tabla });
    } catch (e) {}
    this.actualizarDatos();
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
    
    // Actualizar tanto el objeto local como el store para que el título se actualice
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI; // Mantener compatibilidad
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }); } catch (e) {}
    
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

    // Inicializar Título y Fuente de tabla
    const tituloField = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
    const valorTitulo = `Ubicación referencial – Centro Poblado ${this.getCentroPobladoAISI() || '____'}`;
    if (!this.datos[tituloField] || this.datos[tituloField] !== valorTitulo) {
      this.datos[tituloField] = valorTitulo;
      this.datos['cuadroTituloUbicacionCp'] = valorTitulo; // Para compatibilidad
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
        console.debug(`[AISI-DEBUG] 🔄 DETECTADO CAMBIO EN CCPPs | prefijo: ${prefijo} | ccppIds: ${ccppIdsActuales.substring(0, 50)}... | re-autollar: ${tablaVacia || tieneCapitalActual}`);
        // Re-autollar después de un pequeño delay para asegurar que los datos estén sincronizados
        setTimeout(() => {
          this.autoPoblarTablaUbicacionCp(this.getCentroPobladoAISI() || '', prefijo);
        }, 100);
      }
    });
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  actualizarParrafoAisi(valor: string): void {
    this.onFieldChange('parrafoSeccion21_aisi_intro_completo', valor);
    try { this.formChange.persistFields(this.seccionId, 'text', { 'parrafoSeccion21_aisi_intro_completo': valor }); } catch (e) {}
  }

  actualizarParrafoCentro(valor: string): void {
    this.onFieldChange('parrafoSeccion21_centro_poblado_completo', valor);
    try { this.formChange.persistFields(this.seccionId, 'text', { 'parrafoSeccion21_centro_poblado_completo': valor }); } catch (e) {}
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
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
    this.datos[fieldId] = valor;
    this.datos['cuadroTituloUbicacionCp'] = valor; // Compatibilidad
    this.onFieldChange(fieldId, valor, { refresh: false });
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  onFuenteUbicacionChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `cuadroFuenteUbicacionCp${prefijo}` : 'cuadroFuenteUbicacionCp';
    this.datos[fieldId] = valor;
    this.datos['cuadroFuenteUbicacionCp'] = valor; // Compatibilidad
    this.onFieldChange(fieldId, valor, { refresh: false });
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  
  // ============================================================================
  // AUTO-POBLAR TABLA UBICACIÓN CP CON DATOS DEL CENTRO POBLADO
  // ============================================================================
  
  private autoPoblarTablaUbicacionCp(nombreCentroPoblado: string, prefijo: string): void {
    const tablaKeyPref = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
    
    console.debug(`[AISI-DEBUG] 🔍 AUTO-POBLAR TABLA | seccion: ${this.seccionId} | prefijo: ${prefijo}`);
    
    // ✅ NUEVA LÓGICA: Obtener CCPPs del grupo AISI actual
    const ccppsDelGrupo = this.obtenerCCPPsDelGrupoAISI();
    console.debug(`[AISI-DEBUG] 📋 CCPPs del grupo: ${ccppsDelGrupo.length}`);
    
    if (ccppsDelGrupo.length === 0) {
      console.debug(`[AISI-DEBUG] ⏭️ SKIP - no hay CCPPs en el grupo`);
      return;
    }
    
    // Buscar capital en LOS CCPPs DEL GRUPO ACTUAL
    const capitalDelGrupo = ccppsDelGrupo.find(cc => 
      cc.categoria && cc.categoria.toLowerCase().includes('capital')
    );
    
    // Si no hay capital en el grupo, usar el de mayor población del grupo
    let ccppSeleccionado = capitalDelGrupo;
    if (!ccppSeleccionado) {
      console.debug(`[AISI-DEBUG] ℹ️ No se encontró capital en el grupo, buscando el de mayor población...`);
      ccppSeleccionado = ccppsDelGrupo.reduce((max, cc) => 
        (cc.poblacion > (max?.poblacion || 0)) ? cc : max
      , ccppsDelGrupo[0]);
    }
    
    if (!ccppSeleccionado) {
      console.debug(`[AISI-DEBUG] ⏭️ SKIP - no se pudo seleccionar CCPP`);
      return;
    }
    
    console.debug(`[AISI-DEBUG] ✅ CCPP SELECCIONADO: ${ccppSeleccionado.nombre} | categoria: ${ccppSeleccionado.categoria} | poblacion: ${ccppSeleccionado.poblacion}`);
    
    // ✅ VERIFICAR SI LA TABLA YA TIENE EL CCPP CORRECTO
    const tablaActual = this.projectFacade.selectField(this.seccionId, null, tablaKeyPref)();
    const ccppActualTabla = tablaActual?.[0]?.localidad;
    
    // Si la tabla ya tiene el CCPP correcto del grupo, no re-autollar
    if (ccppActualTabla === ccppSeleccionado.nombre) {
      console.debug(`[AISI-DEBUG] ⏭️ SKIP - tabla ya tiene el CCPP correcto: ${ccppActualTabla}`);
      return;
    }
    
    // Si la tabla tiene datos old de otro CCPP, re-autollar
    if (ccppActualTabla && ccppActualTabla !== ccppSeleccionado.nombre) {
      console.debug(`[AISI-DEBUG] 🔄 ACTUALIZANDO - tabla tiene: ${ccppActualTabla} → grupo necesita: ${ccppSeleccionado.nombre}`);
    }
    
    // Crear fila con datos del centro poblado
    const tabla = [{
      localidad: ccppSeleccionado.nombre || '',
      coordenadas: ccppSeleccionado.este && ccppSeleccionado.norte ? `${ccppSeleccionado.este}, ${ccppSeleccionado.norte}` : '',
      altitud: ccppSeleccionado.altitud ? `${ccppSeleccionado.altitud} m.s.n.m.` : '',
      distrito: ccppSeleccionado.dist || '',
      provincia: ccppSeleccionado.prov || '',
      departamento: ccppSeleccionado.dpto || ''
    }];
    
    console.debug(`[AISI-DEBUG] ✅ AUTO-POBLAR TABLA | ccpp: ${ccppSeleccionado.nombre} | coordenadas: ${tabla[0].coordenadas} | altitud: ${tabla[0].altitud}`);
    
    // Guardar en tabla prefijada (aislamiento)
    this.projectFacade.setField(this.seccionId, null, tablaKeyPref, tabla);
    this.datos[tablaKeyPref] = tabla;
    
    // Persistir en formChange
    try { this.formChange.persistFields(this.seccionId, 'table', { [tablaKeyPref]: tabla }); } catch (e) {}
    
    // Forzar actualización
    this.cdRef.detectChanges();
  }

  trackByIndex(index: number): number { return index; }
}
