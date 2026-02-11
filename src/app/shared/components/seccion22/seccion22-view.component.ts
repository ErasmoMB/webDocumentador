import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ISeccion22TextGeneratorService } from 'src/app/core/domain/interfaces';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { GlobalNumberingService } from 'src/app/core/services/global-numbering.service';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';

@Component({
  selector: 'app-seccion22-view',
  templateUrl: './seccion22-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion22ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.1';

  // ✅ PHOTO_PREFIX como Signal para que se actualice cuando cambie el grupo
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalTableNumberSignal2: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;
  
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  // ✅ CORREGIDO - Leer texto con prefijo
  readonly textoDemografiaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoDemografiaAISI${prefijo}` : 'textoDemografiaAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return manual;
    const data = this.formDataSignal() as any;
    // ✅ Usar el valor con prefijo para el textGenerator
    const dataConPrefijo = {
      ...data,
      centroPobladoAISI: PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId) || data.centroPobladoAISI,
      poblacionSexoAISI: this.poblacionSexoSignal(),
      poblacionEtarioAISI: this.poblacionEtarioSignal()
    };
    return this.textGenerator.generateDemografiaText(dataConPrefijo);
  });

  // ✅ CORREGIDO - Leer texto con prefijo
  readonly textoGrupoEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoGrupoEtarioAISI${prefijo}` : 'textoGrupoEtarioAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return manual;
    const data = this.formDataSignal() as any;
    // ✅ Usar el valor con prefijo para el textGenerator
    const dataConPrefijo = {
      ...data,
      centroPobladoAISI: PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId) || data.centroPobladoAISI,
      poblacionSexoAISI: this.poblacionSexoSignal(),
      poblacionEtarioAISI: this.poblacionEtarioSignal()
    };
    return this.textGenerator.generateGrupoEtarioText(dataConPrefijo);
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefix = this.photoPrefixSignal();
    console.debug(`[FOTOS-VIEW-DEBUG] fotosCacheSignal | seccionId: ${this.seccionId} | prefix: ${prefix}`);
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      
      console.debug(`[FOTOS-VIEW-DEBUG]   i=${i} | campo: ${prefix}${i}Imagen | valor: ${imagen ? 'SÍ' : 'NO'}`);
      
      if (imagen) {
        fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
    }
    console.debug(`[FOTOS-VIEW-DEBUG] FINAL | fotos.length: ${fotos.length}`);
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

  // Table configs to match monolithic view
  readonly poblacionSexoConfig = {
    columns: [
      { key: 'sexo', header: 'Sexo', width: '40%' },
      { key: 'casos', header: 'Casos', width: '30%', align: 'center' as const },
      { key: 'porcentaje', header: 'Porcentaje', width: '30%', align: 'center' as const }
    ],
    showHeader: true,
    showFooter: false
  };

  readonly poblacionEtarioConfig = {
    columns: [
      { key: 'categoria', header: 'Categoría', width: '40%' },
      { key: 'casos', header: 'Casos', width: '30%', align: 'center' as const },
      { key: 'porcentaje', header: 'Porcentaje', width: '30%', align: 'center' as const }
    ],
    showHeader: true,
    showFooter: false
  };

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

  // Filtered view arrays (exclude 'Total' row appended by percentage helpers)
  readonly poblacionSexoViewSignal: Signal<any[]> = computed(() => {
    const rows = this.poblacionSexoSignal() || [];
    return rows.filter((row: any) => {
      const key = row?.sexo ?? '';
      const keyStr = (typeof key === 'string') ? key : (key?.value ?? '');
      return !String(keyStr).toLowerCase().includes('total');
    });
  });

  readonly poblacionEtarioViewSignal: Signal<any[]> = computed(() => {
    const rows = this.poblacionEtarioSignal() || [];
    return rows.filter((row: any) => {
      const key = row?.categoria ?? '';
      const keyStr = (typeof key === 'string') ? key : (key?.value ?? '');
      return !String(keyStr).toLowerCase().includes('total');
    });
  });

  // Total row signals: extract the 'Total' row if present, or compute totals as fallback
  readonly poblacionSexoTotalRowSignal: Signal<any | null> = computed(() => {
    const rows = this.poblacionSexoSignal() || [];
    const found = rows.find((r: any) => {
      const key = r?.sexo ?? '';
      const keyStr = (typeof key === 'string') ? key : (key?.value ?? '');
      return String(keyStr).toLowerCase().includes('total');
    });
    if (found) return found;

    const filtered = rows.filter((r: any) => {
      const key = r?.sexo ?? '';
      const keyStr = (typeof key === 'string') ? key : (key?.value ?? '');
      return !String(keyStr).toLowerCase().includes('total');
    });
    const total = filtered.reduce((sum: number, row: any) => {
      const casos = typeof row?.casos === 'number' ? row.casos : parseInt(row?.casos) || 0;
      return sum + casos;
    }, 0);
    if (total === 0) return null;
    return { sexo: 'Total', casos: { value: total, isCalculated: true }, porcentaje: { value: '100,00 %', isCalculated: true } };
  });

  readonly poblacionEtarioTotalRowSignal: Signal<any | null> = computed(() => {
    const rows = this.poblacionEtarioSignal() || [];
    const found = rows.find((r: any) => {
      const key = r?.categoria ?? '';
      const keyStr = (typeof key === 'string') ? key : (key?.value ?? '');
      return String(keyStr).toLowerCase().includes('total');
    });
    if (found) return found;

    const filtered = rows.filter((r: any) => {
      const key = r?.categoria ?? '';
      const keyStr = (typeof key === 'string') ? key : (key?.value ?? '');
      return !String(keyStr).toLowerCase().includes('total');
    });
    const total = filtered.reduce((sum: number, row: any) => {
      const casos = typeof row?.casos === 'number' ? row.casos : parseInt(row?.casos) || 0;
      return sum + casos;
    }, 0);
    if (total === 0) return null;
    return { categoria: 'Total', casos: { value: total, isCalculated: true }, porcentaje: { value: '100,00 %', isCalculated: true } };
  });

  // Configs that include footer/total row for the view
  readonly poblacionSexoConfigView = computed(() => ({ ...this.poblacionSexoConfig, showFooter: !!this.poblacionSexoTotalRowSignal(), totalRow: this.poblacionSexoTotalRowSignal() }));
  readonly poblacionEtarioConfigView = computed(() => ({ ...this.poblacionEtarioConfig, showFooter: !!this.poblacionEtarioTotalRowSignal(), totalRow: this.poblacionEtarioTotalRowSignal() }));
  
  // ✅ CORREGIDO - Leer título con prefijo
  readonly tituloPoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `cuadroTituloPoblacionSexo${prefijo}` : 'cuadroTituloPoblacionSexo';
    return this.projectFacade.selectField(this.seccionId, null, fieldKey)() || 'Población por sexo';
  });

  readonly fullTituloPoblacionSexoSignal: Signal<string> = computed(() => {
    // ✅ Prefer explicit cuadro field with prefijo if present
    const prefijo = this.obtenerPrefijoGrupo();
    const cuadroKey = prefijo ? `cuadroTituloPoblacionSexo${prefijo}` : 'cuadroTituloPoblacionSexo';
    const cuadro = this.projectFacade.selectField(this.seccionId, null, cuadroKey)();
    if (cuadro && String(cuadro).trim().length > 0) return cuadro;

    const base = this.tituloPoblacionSexoSignal();
    const cp = PrefijoHelper.obtenerValorConPrefijo(this.formDataSignal(), 'centroPobladoAISI', this.seccionId) || '____';
    const year = '2017';
    if (!base || base.trim() === '') return `Población por sexo – CP ${cp} (${year})`;
    if (base.includes('– CP') || base.includes('CP ') || base.includes('(')) return base;
    return `${base} – CP ${cp} (${year})`;
  });

  // ✅ CORREGIDO - Leer fuente con prefijo
  readonly fuentePoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `cuadroFuentePoblacionSexo${prefijo}` : 'cuadroFuentePoblacionSexo';
    return this.projectFacade.selectField(this.seccionId, null, fieldKey)() || 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.';
  });

  // ✅ CORREGIDO - Leer título con prefijo
  readonly tituloPoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `cuadroTituloPoblacionEtario${prefijo}` : 'cuadroTituloPoblacionEtario';
    return this.projectFacade.selectField(this.seccionId, null, fieldKey)() || 'Población por grupo etario';
  });

  readonly fullTituloPoblacionEtarioSignal: Signal<string> = computed(() => {
    // ✅ Prefer explicit cuadro field with prefijo if present
    const prefijo = this.obtenerPrefijoGrupo();
    const cuadroKey = prefijo ? `cuadroTituloPoblacionEtario${prefijo}` : 'cuadroTituloPoblacionEtario';
    const cuadro = this.projectFacade.selectField(this.seccionId, null, cuadroKey)();
    if (cuadro && String(cuadro).trim().length > 0) return cuadro;

    const base = this.tituloPoblacionEtarioSignal();
    const cp = PrefijoHelper.obtenerValorConPrefijo(this.formDataSignal(), 'centroPobladoAISI', this.seccionId) || '____';
    const year = '2017';
    if (!base || base.trim() === '') return `Población por grupo etario – CP ${cp} (${year})`;
    if (base.includes('– CP') || base.includes('CP ') || base.includes('(')) return base;
    return `${base} – CP ${cp} (${year})`;
  });

  // ✅ CORREGIDO - Leer fuente con prefijo
  readonly fuentePoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `cuadroFuentePoblacionEtario${prefijo}` : 'cuadroFuentePoblacionEtario';
    return this.projectFacade.selectField(this.seccionId, null, fieldKey)() || 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
  });

  readonly viewModel = computed(() => ({
    data: this.formDataSignal(),
    texts: {
      demografiaText: this.textoDemografiaSignal(),
      grupoEtarioText: this.textoGrupoEtarioSignal()
    },
    fotos: this.fotosCacheSignal(),
    poblacionSexo: this.poblacionSexoSignal(),
    poblacionSexoView: this.poblacionSexoViewSignal(),
    poblacionEtario: this.poblacionEtarioSignal(),
    poblacionEtarioView: this.poblacionEtarioViewSignal(),
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
    private textGenerator: ISeccion22TextGeneratorService,
    private globalNumbering: GlobalNumberingService,
    private tableNumbering: TableNumberingService
  ) {
    super(cdRef, injector);
    
    console.debug('[SECCION22-VIEW] Constructor iniciado');
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const prefix = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';
      console.debug(`[SECCION22-VIEW] photoPrefixSignal: ${prefix}`);
      return prefix;
    });
    
    // ✅ Signal para número global de tabla (primera tabla: poblacionSexoAISI)
    this.globalTableNumberSignal = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      console.debug(`[SECCION22-VIEW] globalTableNumberSignal: Cuadro N° ${globalNum}`);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (segunda tabla: poblacionEtarioAISI)
    this.globalTableNumberSignal2 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
      console.debug(`[SECCION22-VIEW] globalTableNumberSignal2: Cuadro N° ${globalNum}`);
      return globalNum;
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      console.log(`[SECCION22-VIEW] 📷 Calculando fotos para ${this.seccionId}`);
      console.log(`[SECCION22-VIEW]   prefix: ${prefix}, fotos.length: ${fotos.length}`);
      
      const photoNumbers = fotos.map((_, index) => {
        const globalNum = this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
        console.log(`[SECCION22-VIEW]   foto ${index}: ${globalNum}`);
        return globalNum;
      });
      
      console.log(`[SECCION22-VIEW] globalPhotoNumbersSignal: ${photoNumbers.join(', ')}`);
      return photoNumbers;
    });
    
    // ✅ Effect para loguear el grupo AISI actual
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
        
        console.log(`🗺️ GRUPO AISI: ${grupoId} - ${grupo.nombre || 'Sin nombre'}`);
        console.log(`Centros Poblados (${ccppIds.length}):`, ccppIds);
        console.log(`📍 CCPP SELECCIONADO: ${ccppSeleccionado?.nombre || 'N/A'} | categoria: ${ccppSeleccionado?.categoria || 'N/A'} | poblacion: ${ccppSeleccionado?.poblacion || 0}`);
        console.log(`🔢 NÚMERO GLOBAL DE TABLA: ${this.globalTableNumberSignal()}`);
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
      const tablaKeySexo = prefijo ? `poblacionSexoAISI${prefijo}` : 'poblacionSexoAISI';
      const tablaKeyEtario = prefijo ? `poblacionEtarioAISI${prefijo}` : 'poblacionEtarioAISI';
      
      const tablas: Record<string, any> = {};
      tablas[tablaKeySexo] = this.poblacionSexoSignal();
      tablas['poblacionSexoAISI'] = tablas[tablaKeySexo]; // Para compatibilidad
      tablas[tablaKeyEtario] = this.poblacionEtarioSignal();
      tablas['poblacionEtarioAISI'] = tablas[tablaKeyEtario]; // Para compatibilidad
      tablas[centroConPrefijo] = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId) || '____';
      tablas['centroPobladoAISI'] = tablas[centroConPrefijo]; // Para compatibilidad
      
      this.datos = { ...data, ...tablas };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }

  protected override actualizarValoresConPrefijo(): void {
    // Restaurar centroPobladoAISI con el prefijo correcto
    const centro = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centro || null;
  }

  trackByIndex(index: number): number { return index; }
}
