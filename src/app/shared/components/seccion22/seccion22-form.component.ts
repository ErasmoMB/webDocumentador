import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION22_TEMPLATES } from './seccion22-constants';

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

  // ✅ EXPORTAR TEMPLATES PARA EL HTML
  readonly SECCION22_TEMPLATES = SECCION22_TEMPLATES;

  // ✅ PHOTO_PREFIX como Signal para que se actualice cuando cambie el grupo
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalTableNumberSignal2: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;
  
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  // ✅ CORREGIDO - Usar template fijo con reemplazo de CP
  readonly textoDemografiaSignal: Signal<string> = computed(() => {
    const fieldBase = 'textoDemografiaAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldBase)();
    if (manual && manual.trim().length > 0) return manual;
    
    // ✅ Usar template fijo y reemplazar {COMUNIDAD} con el nombre actual
    const cp = this.obtenerNombreCentroPobladoActual();
    return SECCION22_TEMPLATES.textoDemografiaTemplate.replace(/{COMUNIDAD}/g, cp);
  });

  // ✅ CORREGIDO - Usar template fijo con reemplazo (sin reemplazo de CP porque el template no lo tiene)
  readonly textoGrupoEtarioSignal: Signal<string> = computed(() => {
    const fieldBase = 'textoGrupoEtarioAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldBase)();
    if (manual && manual.trim().length > 0) return manual;
    
    // ✅ Usar template fijo - no contiene {COMUNIDAD}, solo placeholders ____
    return SECCION22_TEMPLATES.textoGrupoEtarioTemplate;
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefix = this.photoPrefixSignal();
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      
      if (imagen) {
        fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
    }
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

  // ✅ CORREGIDO - Leer tabla con prefijo
  readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `poblacionSexoAISI${prefijo}` : 'poblacionSexoAISI';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  // ✅ CORREGIDO - Leer tabla con prefijo
  readonly poblacionEtarioSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `poblacionEtarioAISI${prefijo}` : 'poblacionEtarioAISI';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  // ✅ CORREGIDO - Leer título con prefijo
  readonly tituloPoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `cuadroTituloPoblacionSexo${prefijo}` : 'cuadroTituloPoblacionSexo';
    return this.projectFacade.selectField(this.seccionId, null, fieldKey)() || 'Población por sexo';
  });

  // Full title includes CP name and year when not already provided
  readonly fullTituloPoblacionSexoSignal: Signal<string> = computed(() => {
    const base = this.tituloPoblacionSexoSignal();
    // ✅ CORREGIDO: Usar aisiGroups() signal a través de obtenerNombreCentroPobladoActual()
    const cp = this.obtenerNombreCentroPobladoActual();
    const year = '2017';
    if (!base || base.trim() === '') return `Población por sexo – CP ${cp} (${year})`;
    if (base.includes('– CP') || base.includes('CP ') || base.includes('(')) return base;
    return `${base} – CP ${cp} (${year})`;
  });

  // ✅ CORREGIDO - Leer fuente con prefijo
  readonly fuentePoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `cuadroFuentePoblacionSexo${prefijo}` : 'cuadroFuentePoblacionSexo';
    return this.projectFacade.selectField(this.seccionId, null, fieldKey)() || 'Censos Nacionales 2017';
  });

  // ✅ CORREGIDO - Leer título con prefijo
  readonly tituloPoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `cuadroTituloPoblacionEtario${prefijo}` : 'cuadroTituloPoblacionEtario';
    return this.projectFacade.selectField(this.seccionId, null, fieldKey)() || 'Población por grupo etario';
  });

  readonly fullTituloPoblacionEtarioSignal: Signal<string> = computed(() => {
    const base = this.tituloPoblacionEtarioSignal();
    // ✅ CORREGIDO: Usar aisiGroups() signal a través de obtenerNombreCentroPobladoActual()
    const cp = this.obtenerNombreCentroPobladoActual();
    const year = '2017';
    if (!base || base.trim() === '') return `Población por grupo etario – CP ${cp} (${year})`;
    if (base.includes('– CP') || base.includes('CP ') || base.includes('(')) return base;
    return `${base} – CP ${cp} (${year})`;
  });

  // ✅ CORREGIDO - Leer fuente con prefijo
  readonly fuentePoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `cuadroFuentePoblacionEtario${prefijo}` : 'cuadroFuentePoblacionEtario';
    return this.projectFacade.selectField(this.seccionId, null, fieldKey)() || 'Censos Nacionales 2017';
  });

  // ✅ Signals para claves de tablas (para usar en HTML)
  readonly tablaKeyPoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `poblacionSexoAISI${prefijo}` : 'poblacionSexoAISI';
  });

  readonly tablaKeyPoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `poblacionEtarioAISI${prefijo}` : 'poblacionEtarioAISI';
  });

  // ✅ Signals para claves de títulos y fuentes (para usar en HTML)
  readonly tituloKeyPoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `cuadroTituloPoblacionSexo${prefijo}` : 'cuadroTituloPoblacionSexo';
  });

  readonly fuenteKeyPoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `cuadroFuentePoblacionSexo${prefijo}` : 'cuadroFuentePoblacionSexo';
  });

  readonly tituloKeyPoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `cuadroTituloPoblacionEtario${prefijo}` : 'cuadroTituloPoblacionEtario';
  });

  readonly fuenteKeyPoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `cuadroFuentePoblacionEtario${prefijo}` : 'cuadroFuentePoblacionEtario';
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

  constructor(
    cdRef: ChangeDetectorRef, 
    injector: Injector, 
    private formChange: FormChangeService,
    private globalNumbering: GlobalNumberingService
  ) {
    super(cdRef, injector);
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const prefix = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';
      return prefix;
    });
    
    // ✅ Signal para número global de tabla (primera tabla: poblacionSexoAISI)
    this.globalTableNumberSignal = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (segunda tabla: poblacionEtarioAISI)
    this.globalTableNumberSignal2 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
      return globalNum;
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      const photoNumbers = fotos.map((_, index) => {
        return this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
      });
      return photoNumbers;
    });



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
    // ✅ LOG DEL GRUPO AISI ACTUAL (como en Sección 21)
    const grupo = this.obtenerGrupoActualAISI();
    const prefijo = this.obtenerPrefijoGrupo();
    
    if (grupo && prefijo) {
      // Extraer ID del prefijo: "_B1" → "B.1"
      const match = prefijo.match(/_B(\d+)/);
      const grupoId = match ? `B.${match[1]}` : prefijo;
      
      const ccppIds = grupo.ccppIds || [];
      
      // Obtener CCPPs del grupo y determinar cuál será usado
      const ccppsDelGrupo = this.obtenerCCPPsDelGrupoAISI();
      const capital = ccppsDelGrupo.find(cc => cc.categoria?.toLowerCase().includes('capital'));
      const mayorPoblacion = ccppsDelGrupo.reduce((max, cc) => 
        cc.poblacion > (max?.poblacion || 0) ? cc : max
      , ccppsDelGrupo[0]);
      const ccppSeleccionado = capital || mayorPoblacion;
    }

    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar tanto el objeto local como el store
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }); } catch (e) {}
    
    // 🔍 FORZAR DETECCIÓN DE CAMBIOS PARA ACTUALIZAR EL TÍTULO
    this.cdRef.detectChanges();
    
    // ✅ Inicializar párrafos con valores por defecto (con prefijo)
    const textoDemografiaKey = prefijo ? `textoDemografiaAISI${prefijo}` : 'textoDemografiaAISI';
    const textoDemografia = this.projectFacade.selectField(this.seccionId, null, textoDemografiaKey)();
    if (!textoDemografia || textoDemografia.trim() === '') {
      this.projectFacade.setField(this.seccionId, null, textoDemografiaKey, '');
      try { this.formChange.persistFields(this.seccionId, 'text', { [textoDemografiaKey]: '' }); } catch (e) {}
    }
    
    const textoGrupoEtarioKey = prefijo ? `textoGrupoEtarioAISI${prefijo}` : 'textoGrupoEtarioAISI';
    const textoGrupoEtario = this.projectFacade.selectField(this.seccionId, null, textoGrupoEtarioKey)();
    if (!textoGrupoEtario || textoGrupoEtario.trim() === '') {
      this.projectFacade.setField(this.seccionId, null, textoGrupoEtarioKey, '');
      try { this.formChange.persistFields(this.seccionId, 'text', { [textoGrupoEtarioKey]: '' }); } catch (e) {}
    }


    // ✅ Inicializar Títulos y Fuentes de cuadros CON PREFIJO (patrón Sección 21)
    const tituloSexoField = prefijo ? `cuadroTituloPoblacionSexo${prefijo}` : 'cuadroTituloPoblacionSexo';
    if (!this.datos[tituloSexoField]) {
      const valorTitulo = `Población por sexo – CP ${PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId) || '____'} (2017)`;
      this.datos[tituloSexoField] = valorTitulo;
      this.datos['cuadroTituloPoblacionSexo'] = valorTitulo; // Para compatibilidad
      this.onFieldChange(tituloSexoField, valorTitulo, { refresh: false });
    }

    const fuenteSexoField = prefijo ? `cuadroFuentePoblacionSexo${prefijo}` : 'cuadroFuentePoblacionSexo';
    if (!this.datos[fuenteSexoField]) {
      const valorFuente = SECCION22_TEMPLATES.fuentePoblacionSexoDefault;
      this.datos[fuenteSexoField] = valorFuente;
      this.datos['cuadroFuentePoblacionSexo'] = valorFuente; // Para compatibilidad
      this.onFieldChange(fuenteSexoField, valorFuente, { refresh: false });
    }

    const tituloEtarioField = prefijo ? `cuadroTituloPoblacionEtario${prefijo}` : 'cuadroTituloPoblacionEtario';
    if (!this.datos[tituloEtarioField]) {
      const valorTitulo = `Población por grupo etario – CP ${PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId) || '____'} (2017)`;
      this.datos[tituloEtarioField] = valorTitulo;
      this.datos['cuadroTituloPoblacionEtario'] = valorTitulo; // Para compatibilidad
      this.onFieldChange(tituloEtarioField, valorTitulo, { refresh: false });
    }

    const fuenteEtarioField = prefijo ? `cuadroFuentePoblacionEtario${prefijo}` : 'cuadroFuentePoblacionEtario';
    if (!this.datos[fuenteEtarioField]) {
      const valorFuente = SECCION22_TEMPLATES.fuentePoblacionEtarioDefault;
      this.datos[fuenteEtarioField] = valorFuente;
      this.datos['cuadroFuentePoblacionEtario'] = valorFuente; // Para compatibilidad
      this.onFieldChange(fuenteEtarioField, valorFuente, { refresh: false });
    }
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void {
    // Restaurar centroPobladoAISI con el prefijo correcto
    const centro = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centro || null;
  }

  // ✅ CORREGIDO - Handler con prefijo
  actualizarTextoDemografia(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoDemografiaAISI${prefijo}` : 'textoDemografiaAISI';
    this.projectFacade.setField(this.seccionId, null, fieldKey, valor);
    this.onFieldChange(fieldKey, valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  // ✅ CORREGIDO - Handler con prefijo
  actualizarTextoGrupoEtario(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoGrupoEtarioAISI${prefijo}` : 'textoGrupoEtarioAISI';
    this.projectFacade.setField(this.seccionId, null, fieldKey, valor);
    this.onFieldChange(fieldKey, valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  actualizarTituloPoblacionSexo(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `tituloPoblacionSexoAISI${prefijo}` : 'tituloPoblacionSexoAISI';
    this.projectFacade.setField(this.seccionId, null, fieldKey, valor);
    this.onFieldChange(fieldKey, valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  actualizarFuentePoblacionSexo(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `fuentePoblacionSexoAISI${prefijo}` : 'fuentePoblacionSexoAISI';
    this.projectFacade.setField(this.seccionId, null, fieldKey, valor);
    this.onFieldChange(fieldKey, valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  // ✅ CORREGIDO - Handler con prefijo
  onTituloCuadroPoblacionSexoChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `cuadroTituloPoblacionSexo${prefijo}` : 'cuadroTituloPoblacionSexo';
    this.datos[fieldId] = valor;
    this.datos['cuadroTituloPoblacionSexo'] = valor; // Para compatibilidad
    this.onFieldChange(fieldId, valor, { refresh: false });

    try {
      this.projectFacade.setField(this.seccionId, null, fieldId, valor);
      this.formChange.persistFields(this.seccionId, 'text', { [fieldId]: valor });
    } catch (e) {}

    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  // ✅ CORREGIDO - Handler con prefijo
  onFuenteCuadroPoblacionSexoChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `cuadroFuentePoblacionSexo${prefijo}` : 'cuadroFuentePoblacionSexo';
    this.datos[fieldId] = valor;
    this.datos['cuadroFuentePoblacionSexo'] = valor; // Para compatibilidad
    this.onFieldChange(fieldId, valor, { refresh: false });

    try {
      this.projectFacade.setField(this.seccionId, null, fieldId, valor);
      this.formChange.persistFields(this.seccionId, 'text', { [fieldId]: valor });
    } catch (e) {}

    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  // ✅ CORREGIDO - Handler con prefijo
  onTituloCuadroPoblacionEtarioChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `cuadroTituloPoblacionEtario${prefijo}` : 'cuadroTituloPoblacionEtario';
    this.datos[fieldId] = valor;
    this.datos['cuadroTituloPoblacionEtario'] = valor; // Para compatibilidad
    this.onFieldChange(fieldId, valor, { refresh: false });

    try {
      this.projectFacade.setField(this.seccionId, null, fieldId, valor);
      this.formChange.persistFields(this.seccionId, 'text', { [fieldId]: valor });
    } catch (e) {}

    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  // ✅ CORREGIDO - Handler con prefijo
  onFuenteCuadroPoblacionEtarioChange(valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `cuadroFuentePoblacionEtario${prefijo}` : 'cuadroFuentePoblacionEtario';
    this.datos[fieldId] = valor;
    this.datos['cuadroFuentePoblacionEtario'] = valor; // Para compatibilidad
    this.onFieldChange(fieldId, valor, { refresh: false });

    try {
      this.projectFacade.setField(this.seccionId, null, fieldId, valor);
      this.formChange.persistFields(this.seccionId, 'text', { [fieldId]: valor });
    } catch (e) {}

    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    const prefix = this.photoPrefixSignal();
    this.onGrupoFotografiasChange(prefix, fotografias);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
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
    
    // ✅ Persistir tabla con clave base Y clave con prefijo
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `poblacionSexoAISI${prefijo}` : 'poblacionSexoAISI';
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaNormalizada);
    this.projectFacade.setField(this.seccionId, null, 'poblacionSexoAISI', tablaNormalizada);
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaNormalizada, poblacionSexoAISI: tablaNormalizada });
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
    
    // ✅ Persistir tabla con clave base Y clave con prefijo
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `poblacionEtarioAISI${prefijo}` : 'poblacionEtarioAISI';
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaNormalizada);
    this.projectFacade.setField(this.seccionId, null, 'poblacionEtarioAISI', tablaNormalizada);
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaNormalizada, poblacionEtarioAISI: tablaNormalizada });
    } catch (e) {}
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  trackByIndex(index: number): number { return index; }
}
