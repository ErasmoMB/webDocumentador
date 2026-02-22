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
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { transformPoblacionSexoDesdeDemograficos, transformPoblacionEtarioDesdeDemograficos } from 'src/app/core/config/table-transforms';
import { 
  SECCION22_TEMPLATES, 
  SECCION22_TABLA_POBLACION_SEXO_CONFIG, 
  SECCION22_TABLA_POBLACION_ETARIO_CONFIG,
  SECCION22_COLUMNAS_POBLACION_SEXO,
  SECCION22_COLUMNAS_POBLACION_ETARIO
} from './seccion22-constants';
import { debugLog } from 'src/app/shared/utils/debug';

// ✅ Función helper para desenvuelver datos del backend
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  // El backend devuelve un array con un objeto que contiene rows
  if (Array.isArray(responseData) && responseData.length > 0) {
    return responseData[0]?.rows || responseData;
  }
  if (responseData.data) {
    const data = responseData.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.rows || data;
    }
    return data;
  }
  return [];
};

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

  // ✅ PHOTO_PREFIX como string para compatibilidad con SectionPhotoCoordinator
  // Se actualiza cuando cambia el grupo
  override PHOTO_PREFIX: string = '';
  
  // ✅ EXPORTAR TEMPLATES PARA EL HTML
  readonly SECCION22_TEMPLATES = SECCION22_TEMPLATES;
  
  // ✅ EXPORTAR CONFIGURACIONES Y COLUMNAS PARA LAS TABLAS
  readonly SECCION22_TABLA_POBLACION_SEXO_CONFIG = SECCION22_TABLA_POBLACION_SEXO_CONFIG;
  readonly SECCION22_TABLA_POBLACION_ETARIO_CONFIG = SECCION22_TABLA_POBLACION_ETARIO_CONFIG;
  readonly SECCION22_COLUMNAS_POBLACION_SEXO = SECCION22_COLUMNAS_POBLACION_SEXO;
  readonly SECCION22_COLUMNAS_POBLACION_ETARIO = SECCION22_COLUMNAS_POBLACION_ETARIO;

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
    // ✅ CORREGIDO: Usar prefijo base y grupo separados para el esquema correcto
    const basePrefix = 'fotografiaCahuacho'; // Prefijo base sin grupo
    const groupPrefix = this.obtenerPrefijoGrupo(); // _B1, _A1, etc.
    
    for (let i = 1; i <= 10; i++) {
      // Esquema correcto: {prefix}{i}{suffix}{group} → fotografiaCahuacho1Imagen_B1
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

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const basePrefix = 'fotografiaCahuacho';
    const groupPrefix = this.obtenerPrefijoGrupo();
    for (let i = 1; i <= 10; i++) {
      const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
      const titKey = groupPrefix ? `${basePrefix}${i}Titulo${groupPrefix}` : `${basePrefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${basePrefix}${i}Fuente${groupPrefix}` : `${basePrefix}${i}Fuente`;
      
      const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
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
    
    // ✅ NUEVO: Reemplazar "CP ____" con el nombre real del centro poblado
    if (base.includes('CP ____')) {
      return base.replace('CP ____', `CP ${cp}`);
    }
    
    // ✅ Si no contiene "CP" en absoluto, agregarlo
    if (!base.includes('CP ')) {
      if (!base || base.trim() === '') return `Población por sexo – CP ${cp} (${year})`;
      return `${base} – CP ${cp} (${year})`;
    }
    
    // ✅ Si ya tiene "CP" con algo diferente a "____", devolverlo tal cual
    return base;
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
    
    // ✅ NUEVO: Reemplazar "CP ____" con el nombre real del centro poblado
    if (base.includes('CP ____')) {
      return base.replace('CP ____', `CP ${cp}`);
    }
    
    // ✅ Si no contiene "CP" en absoluto, agregarlo
    if (!base.includes('CP ')) {
      if (!base || base.trim() === '') return `Población por grupo etario – CP ${cp} (${year})`;
      return `${base} – CP ${cp} (${year})`;
    }
    
    // ✅ Si ya tiene "CP" con algo diferente a "____", devolverlo tal cual
    return base;
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
    private globalNumbering: GlobalNumberingService,
    private backendApi: BackendApiService
  ) {
    super(cdRef, injector);
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      // Mantener el prefijo con grupo para compatibilidad con el sistema
      const prefijo = this.obtenerPrefijoGrupo();
      return prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';
    });
    
    // ✅ Sincronizar PHOTO_PREFIX (string) con photoPrefixSignal para compatibilidad
    // con SectionPhotoCoordinator
    effect(() => {
      this.PHOTO_PREFIX = this.photoPrefixSignal();
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

  /**
   * ✅ Inicializa las tablas como arrays vacíos antes de llenar con backend
   * Esto evita errores si el backend tarda o falla
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Inicializar población por sexo
    const poblacionSexoKey = prefijo ? `poblacionSexoAISI${prefijo}` : 'poblacionSexoAISI';
    this.projectFacade.setField(this.seccionId, null, poblacionSexoKey, []);
    this.projectFacade.setField(this.seccionId, null, 'poblacionSexoAISI', []);
    
    // Inicializar población por grupo etario
    const poblacionEtarioKey = prefijo ? `poblacionEtarioAISI${prefijo}` : 'poblacionEtarioAISI';
    this.projectFacade.setField(this.seccionId, null, poblacionEtarioKey, []);
    this.projectFacade.setField(this.seccionId, null, 'poblacionEtarioAISI', []);
  }

  /**
   * ✅ Carga datos de los endpoints del backend para las tablas de demografía AISI
   * - poblacionSexoAISI: /demograficos/datos
   * - poblacionEtarioAISI: /demograficos/etario
   */
  private cargarDatosDelBackend(): void {
    // ✅ OBTENER códigos de centros poblados del grupo AISI actual
    const codigosArray = this.getCodigosCentrosPobladosAISI();
    const codigos = [...codigosArray]; // Copia mutable

    if (!codigos || codigos.length === 0) {
      debugLog('[SECCION22] ⚠️ No hay centros poblados en el grupo AISI actual');
      return;
    }

    debugLog('[SECCION22] 📡 Cargando datos demográficos desde backend...', { codigos });

    // ✅ OBTENER PREFIJO para guardar con clave correcta
    const prefijo = this.obtenerPrefijoGrupo();

    // Cargar población por sexo desde /demograficos/datos
    this.backendApi.postDatosDemograficos(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformPoblacionSexoDesdeDemograficos(datosDesenvueltos);
          debugLog('[SECCION22] ✅ Datos de sexo cargados:', datosTransformados);
          
          // Guardar en el state CON PREFIJO y SIN PREFIJO (fallback)
          if (datosTransformados.length > 0) {
            const tablaKey = `poblacionSexoAISI${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            this.projectFacade.setField(this.seccionId, null, 'poblacionSexoAISI', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          debugLog('[SECCION22] ❌ Error transformando datos de sexo:', e);
        }
      },
      error: (err: any) => {
        debugLog('[SECCION22] ❌ Error cargando población por sexo:', err);
      }
    });

    // Cargar población por grupo etario desde /demograficos/etario
    this.backendApi.postEtario(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformPoblacionEtarioDesdeDemograficos(datosDesenvueltos);
          debugLog('[SECCION22] ✅ Datos de etario cargados:', datosTransformados);
          
          // Guardar en el state CON PREFIJO y SIN PREFIJO (fallback)
          if (datosTransformados.length > 0) {
            const tablaKey = `poblacionEtarioAISI${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            this.projectFacade.setField(this.seccionId, null, 'poblacionEtarioAISI', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          debugLog('[SECCION22] ❌ Error transformando datos de etario:', e);
        }
      },
      error: (err: any) => {
        debugLog('[SECCION22] ❌ Error cargando población por etario:', err);
      }
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
    // ✅ CORREGIDO: Guardar títulos con "CP ____" para que se reemplace dinámicamente
    const tituloSexoField = prefijo ? `cuadroTituloPoblacionSexo${prefijo}` : 'cuadroTituloPoblacionSexo';
    if (!this.datos[tituloSexoField]) {
      const valorTitulo = 'Población por sexo – CP ____ (2017)';
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
      const valorTitulo = 'Población por grupo etario – CP ____ (2017)';
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

    // ✅ VERIFICAR SI YA EXISTEN DATOS PERSISTIDOS antes de cargar del backend
    const formData = this.formDataSignal();
    const poblacionSexoKey = prefijo ? `poblacionSexoAISI${prefijo}` : 'poblacionSexoAISI';
    const poblacionEtarioKey = prefijo ? `poblacionEtarioAISI${prefijo}` : 'poblacionEtarioAISI';
    
    const existingSexoData = formData[poblacionSexoKey];
    const existingEtarioData = formData[poblacionEtarioKey];
    
    const hasSexoData = existingSexoData && Array.isArray(existingSexoData) && existingSexoData.length > 0;
    const hasEtarioData = existingEtarioData && Array.isArray(existingEtarioData) && existingEtarioData.length > 0;
    
    // Solo cargar del backend si no hay datos persistidos en ninguna tabla
    if (!hasSexoData || !hasEtarioData) {
      debugLog('[SECCION22] No hay datos persistidos, cargando del backend...');
      this.inicializarTablasVacias();
      this.cargarDatosDelBackend();
    } else {
      debugLog('[SECCION22] Datos persistidos encontrados, no se carga del backend');
    }
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void {
    this.datos.centroPobladoAISI = (this.datos as any)?.centroPobladoAISI || null;
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
    // ✅ Usar prefijo base y grupo separados para el esquema correcto
    const prefix = 'fotografiaCahuacho'; // Prefijo base
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
