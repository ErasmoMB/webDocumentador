import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION21_CONFIG, SECCION21_TEMPLATES } from './seccion21-constants';

@Component({
  selector: 'app-seccion21-view',
  templateUrl: './seccion21-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion21ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION21_CONFIG.sectionId;

  // ✅ EXPORTAR CONSTANTES PARA EL TEMPLATE
  readonly SECCION21_TEMPLATES = SECCION21_TEMPLATES;

  override useReactiveSync: boolean = true;

  // PHOTO_PREFIX como Signal para que se actualice cuando cambie el grupo
  readonly photoPrefixSignal: Signal<string>;
  
  // NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;

  constructor(
    cdRef: ChangeDetectorRef, 
    injector: Injector, 
    private sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService
  ) {
    super(cdRef, injector);
    
    // Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const prefix = prefijo ? `fotografia${prefijo}` : 'fotografia';
      return prefix;
    });
    
    // Signal para número global de tabla
    this.globalTableNumberSignal = computed(() => {
      // La tabla de ubicación es la primera (índice 0)
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      return globalNum;
    });
    
    // Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      
      const photoNumbers = fotos.map((_, index) => {
        // photoIndex 0-basado (la primera foto del grupo es 0)
        // La fórmula en GlobalNumberingService es: offset + photoIndex + 1
        const globalNum = this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
        return globalNum;
      });
      
      return photoNumbers;
    });
    

    
    // Effect para loguear el grupo AISI actual
    effect(() => {
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
    });

    effect(() => {
      const data = this.formDataSignal();
      // Solo actualizar si hay datos disponibles
      if (!data || Object.keys(data).length === 0) {
        this.cdRef.markForCheck();
        return;
      }
      const prefijo = this.obtenerPrefijoGrupo();
      const centroConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
      const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
      const tituloTablaKey = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
      
      const tablas: Record<string, any> = {};
      tablas[tablaKey] = this.ubicacionCpSignal();
      tablas['ubicacionCpTabla'] = tablas[tablaKey]; // Para compatibilidad
      tablas[centroConPrefijo] = data['centroPobladoAISI'] || '____';
      tablas['centroPobladoAISI'] = tablas[centroConPrefijo]; // Para compatibilidad
      tablas[tituloTablaKey] = PrefijoHelper.obtenerValorConPrefijo(data, 'cuadroTituloUbicacionCp', this.seccionId) || `Ubicación referencial – Centro Poblado ${tablas[centroConPrefijo]}`;
      
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
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion21_aisi_intro_completo')();
    if (manual && manual.trim().length > 0) return manual;
    
    const data = this.formDataSignal();
    const centro = this.obtenerNombreCentroPobladoActual();
    const provincia = data['provinciaSeleccionada'] || '____';
    const departamento = data['departamentoSeleccionado'] || '____';
    
    return SECCION21_TEMPLATES.parrafoAISITemplate
      .replace(/{CENTRO}/g, centro)
      .replace(/{PROVINCIA}/g, provincia)
      .replace(/{DEPARTAMENTO}/g, departamento);
  });

  readonly parrafoCentroSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion21_centro_poblado_completo')();
    if (manual && manual.trim().length > 0) return manual;
    
    const data = this.formDataSignal();
    const centro = this.obtenerNombreCentroPobladoActual();
    const provincia = data['provinciaSeleccionada'] || '____';
    const departamento = data['departamentoSeleccionado'] || '____';
    const ley = this.projectFacade.selectField(this.seccionId, null, 'leyCreacionDistrito')() || '____';
    const fecha = this.projectFacade.selectField(this.seccionId, null, 'fechaCreacionDistrito')() || '____';
    const distrito = this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || '____';
    const distritoAnterior = this.projectFacade.selectField(this.seccionId, null, 'distritoAnterior')() || '____';
    
    return SECCION21_TEMPLATES.parrafoCentroTemplate
      .replace(/{CENTRO}/g, centro)
      .replace(/{PROVINCIA}/g, provincia)
      .replace(/{DEPARTAMENTO}/g, departamento)
      .replace(/{LEY}/g, ley)
      .replace(/{FECHA}/g, fecha)
      .replace(/{DISTRITO}/g, distrito)
      .replace(/{DISTRITOANTERIOR}/g, distritoAnterior);
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
      hash += `${i}:${!!imagen}:`;
    }
    return hash;
  });

  readonly ubicacionCpSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    return (fromField as any[]) || [];
  });

  // Signal para título del cuadro de ubicación
  readonly cuadroTituloSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tituloKey = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
    const centroKey = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
    const centro = this.projectFacade.selectField(this.seccionId, null, centroKey)() || '____';
    return titulo || `Ubicación referencial – Centro Poblado ${centro}`;
  });

  // Signal para fuente del cuadro de ubicación
  readonly cuadroFuenteSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fuenteKey = prefijo ? `cuadroFuenteUbicacionCp${prefijo}` : 'cuadroFuenteUbicacionCp';
    return this.projectFacade.selectField(this.seccionId, null, fuenteKey)() || 'GEADES (2024)';
  });

  readonly viewModel = computed(() => ({
    fotos: this.fotosCacheSignal(),
    ubicacionCp: this.ubicacionCpSignal(),
    parrafoAisi: this.parrafoAisiSignal(),
    parrafoCentro: this.parrafoCentroSignal()
  }));

  formatearParrafo(texto: string): SafeHtml {
    if (!texto) return '';
    // Reemplazar saltos de línea con <br>
    const textoConBR = texto.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(textoConBR);
  }

  getFotoByIndex(index: number): FotoItem {
    const fotos = this.fotosCacheSignal();
    return fotos[index] || null;
  }

  // Helper para obtener tabla de ubicación
  getTableData(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
    return this.ubicacionCpSignal();
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  override ngOnDestroy(): void {}
}
