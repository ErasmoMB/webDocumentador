import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION22_TEMPLATES } from './seccion22-constants';

@Component({
  selector: 'app-seccion22-view',
  templateUrl: './seccion22-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion22ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.1';

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
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoDemografiaAISI${prefijo}` : 'textoDemografiaAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return manual;
    
    // ✅ Usar template fijo y reemplazar {COMUNIDAD} con el nombre actual
    const cp = this.obtenerNombreCentroPobladoActual();
    return SECCION22_TEMPLATES.textoDemografiaTemplate.replace(/{COMUNIDAD}/g, cp);
  });

  // ✅ CORREGIDO - Usar template fijo (sin reemplazo porque el template no contiene {COMUNIDAD})
  readonly textoGrupoEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoGrupoEtarioAISI${prefijo}` : 'textoGrupoEtarioAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
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
    
    // Intentar leer con prefijo primero, luego sin prefijo
    const conPrefijo = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    if (conPrefijo && Array.isArray(conPrefijo) && conPrefijo.length > 0) {
      return conPrefijo;
    }
    
    // Fallback a la versión sin prefijo
    const sinPrefijo = this.projectFacade.selectField(this.seccionId, null, 'poblacionSexoAISI')();
    return (sinPrefijo && Array.isArray(sinPrefijo)) ? sinPrefijo : [];
  });

  // ✅ CORREGIDO - Leer tabla con prefijo
  readonly poblacionEtarioSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `poblacionEtarioAISI${prefijo}` : 'poblacionEtarioAISI';
    
    // Intentar leer con prefijo primero, luego sin prefijo
    const conPrefijo = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    if (conPrefijo && Array.isArray(conPrefijo) && conPrefijo.length > 0) {
      return conPrefijo;
    }
    
    // Fallback a la versión sin prefijo
    const sinPrefijo = this.projectFacade.selectField(this.seccionId, null, 'poblacionEtarioAISI')();
    return (sinPrefijo && Array.isArray(sinPrefijo)) ? sinPrefijo : [];
  });

  // ✅ SEGÚN PATRÓN: No filtrar filas, mostrar todas incluyendo Total (sin estilos especiales)
  // El backend ya envía la fila Total, no necesitamos filtrarla ni calcularla
  readonly poblacionSexoConfigView = computed(() => ({ 
    ...this.poblacionSexoConfig, 
    showFooter: false  // No mostrar footer especial, la fila Total viene en los datos
  }));
  
  readonly poblacionEtarioConfigView = computed(() => ({ 
    ...this.poblacionEtarioConfig, 
    showFooter: false  // No mostrar footer especial, la fila Total viene en los datos
  }));
  
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
    
    // ✅ CORREGIDO: Usar aisiGroups() signal a través de obtenerNombreCentroPobladoActual()
    const cp = this.obtenerNombreCentroPobladoActual();
    const year = '2017';
    
    if (cuadro && String(cuadro).trim().length > 0) {
      const titulo = String(cuadro);
      if (titulo.includes('CP ____')) {
        return titulo.replace('CP ____', `CP ${cp}`);
      }
      if (!titulo.includes('CP ')) {
        return `${titulo} – CP ${cp} (${year})`;
      }
      return titulo;
    }

    const base = this.tituloPoblacionSexoSignal();
    if (!base || base.trim() === '') {
      return `Población por sexo – CP ${cp} (${year})`;
    }
    if (base.includes('CP ____')) {
      return base.replace('CP ____', `CP ${cp}`);
    }
    if (base.includes('CP ')) {
      return base;
    }
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
    
    // ✅ CORREGIDO: Usar aisiGroups() signal a través de obtenerNombreCentroPobladoActual()
    const cp = this.obtenerNombreCentroPobladoActual();
    const year = '2017';
    
    if (cuadro && String(cuadro).trim().length > 0) {
      const titulo = String(cuadro);
      if (titulo.includes('CP ____')) {
        return titulo.replace('CP ____', `CP ${cp}`);
      }
      if (!titulo.includes('CP ')) {
        return `${titulo} – CP ${cp} (${year})`;
      }
      return titulo;
    }

    const base = this.tituloPoblacionEtarioSignal();
    if (!base || base.trim() === '') {
      return `Población por grupo etario – CP ${cp} (${year})`;
    }
    if (base.includes('CP ____')) {
      return base.replace('CP ____', `CP ${cp}`);
    }
    if (base.includes('CP ')) {
      return base;
    }
    return `${base} – CP ${cp} (${year})`;
  })

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
    // ✅ CORREGIDO: Usar signals directos que incluyen TODAS las filas (incluyendo Total)
    poblacionSexo: this.poblacionSexoSignal(),
    poblacionSexoView: this.poblacionSexoSignal(), // Sin filtrar, mostrar todas las filas
    poblacionEtario: this.poblacionEtarioSignal(),
    poblacionEtarioView: this.poblacionEtarioSignal(), // Sin filtrar, mostrar todas las filas
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
        const globalNum = this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
        return globalNum;
      });
      
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

    // ✅ EFFECT: Actualizar cuando los datos de las tablas cambian
    effect(() => {
      const sexo = this.poblacionSexoSignal();
      const etario = this.poblacionEtarioSignal();
      
      // Forzar detección de cambios cuando hay nuevos datos
      if (sexo && sexo.length > 0) {
        this.cdRef.markForCheck();
      }
      if (etario && etario.length > 0) {
        this.cdRef.markForCheck();
      }
    });

    // ✅ EFFECT: Resetear cuando cambia el prefijo del grupo (si quisieras recargar en ese caso)
    effect(() => {
      this.obtenerPrefijoGrupo(); // Solo depender del prefijo para react
    });
  }

  protected override onInitCustom(): void {
    // ✅ NO cargar del backend en vista - el form component ya lo hizo
    // Solo leer del estado compartido
  }

  protected override detectarCambios(): boolean { 
    return false; 
  }

  protected override actualizarValoresConPrefijo(): void {
    // Restaurar centroPobladoAISI con el prefijo correcto
    const centro = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centro || null;
  }

  trackByIndex(index: number): number { return index; }
}
