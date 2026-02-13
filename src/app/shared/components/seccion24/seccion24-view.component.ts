import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION24_TEMPLATES, SECCION24_DEFAULT_TEXTS } from './seccion24-constants';

@Component({
  selector: 'app-seccion24-view',
  templateUrl: './seccion24-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion24ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.3';

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION24_TEMPLATES = SECCION24_TEMPLATES;

  // ✅ PHOTO_PREFIX como Signal
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;
  
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly textoIntroShortSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoIntroActividadesEconomicasAISI${prefijo}` : 'textoIntroActividadesEconomicasAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return (manual.split('\n\n')[0] || manual);
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    return SECCION24_DEFAULT_TEXTS.textoIntroActividadesEconomicasAISI.replace(/____/g, cp);
  });

  readonly textoIntroLongSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoIntroActividadesEconomicasAISI${prefijo}` : 'textoIntroActividadesEconomicasAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return (manual.split('\n\n')[1] || '');
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    return SECCION24_DEFAULT_TEXTS.textoIntroActividadesEconomicasAISILong.replace(/____/g, cp);
  });

  readonly actividadesEconomicasSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `actividadesEconomicasAISI${prefijo}` : 'actividadesEconomicasAISI';
    const raw = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
                this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
    const rows = Array.isArray(raw) ? raw : [];
    // Excluir filas de "Total" y filas sin casos válidos (>0)
    const filtered = rows.filter((r: any) => {
      const key = String(r?.actividad ?? '').toLowerCase();
      if (key.includes('total')) return false;
      const casosRaw = r?.casos;
      const num = Number(casosRaw);
      return !isNaN(num) && num > 0;
    });

    const total = filtered.reduce((sum: number, r: any) => sum + (Number(r?.casos) || 0), 0);
    const rowsWithPct = filtered.map((r: any) => ({
      ...r,
      porcentaje: total > 0 ? ((Number(r?.casos) || 0) / total * 100).toFixed(2).replace('.', ',') + '%' : ''
    }));
    // Append Total row when there is at least one row
    if (total > 0) {
      rowsWithPct.push({ actividad: 'Total', casos: total, porcentaje: '100,00%' });
    }
    return rowsWithPct;
  });

  readonly textoAnalisisSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoActividadesEconomicasAISI${prefijo}` : 'textoActividadesEconomicasAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return manual;

    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    const actividades = this.actividadesEconomicasSignal();
    const agricultura = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('agricultura'));
    const administracion = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('administración'));
    const porcentajeAgricultura = agricultura?.porcentaje && String(agricultura.porcentaje).trim().length > 0 ? agricultura.porcentaje : '____';
    const porcentajeAdministracion = administracion?.porcentaje && String(administracion.porcentaje).trim().length > 0 ? administracion.porcentaje : '____';

    return SECCION24_DEFAULT_TEXTS.textoActividadesEconomicasAISI
      .replace(/____/g, cp)
      .replace(/____/g, porcentajeAgricultura)
      .replace(/____/g, porcentajeAdministracion);
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const prefix = this.photoPrefixSignal();
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, prefix, groupPrefix);
  });

  readonly fotosActividadesSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const prefix = prefijo ? `fotografiaActividadesEconomicas${prefijo}` : 'fotografiaActividadesEconomicas';
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, prefix, groupPrefix);
  });

  readonly fotosMercadoSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const prefix = prefijo ? `fotografiaMercado${prefijo}` : 'fotografiaMercado';
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, prefix, groupPrefix);
  });

  readonly mercadoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoMercadoProductos${prefijo}` : 'textoMercadoProductos';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return manual;
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || SECCION24_DEFAULT_TEXTS.ciudadOrigenDefault;
    return SECCION24_DEFAULT_TEXTS.textoMercadoProductos
      .replace(/____/g, cp)
      .replace(/____/g, ciudadOrigen)
      .replace(/____/g, cp)
      .replace(/____/g, ciudadOrigen)
      .replace(/____/g, cp);
  });

  readonly habitosSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoHabitosConsumo${prefijo}` : 'textoHabitosConsumo';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return manual;
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || SECCION24_DEFAULT_TEXTS.ciudadOrigenDefault;
    return SECCION24_DEFAULT_TEXTS.textoHabitosConsumo
      .replace(/____/g, cp)
      .replace(/____/g, ciudadOrigen);
  });

  readonly fuenteSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `fuenteActividadesEconomicasAISI${prefijo}` : 'fuenteActividadesEconomicasAISI';
    return this.projectFacade.selectField(this.seccionId, null, fieldKey)() || SECCION24_DEFAULT_TEXTS.fuenteActividadesEconomicasAISI;
  });

  readonly viewModel = computed(() => ({
    data: this.formDataSignal(),
    textos: {
      introShort: this.textoIntroShortSignal(),
      introLong: this.textoIntroLongSignal(),
      analisis: this.textoAnalisisSignal(),
      mercado: this.mercadoSignal(),
      habitos: this.habitosSignal(),
      fuente: this.fuenteSignal()
    },
    actividades: this.actividadesEconomicasSignal(),
    fotos: this.fotosCacheSignal(),
    globalTableNumber: this.globalTableNumberSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private globalNumbering: GlobalNumberingService) {
    super(cdRef, injector);
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      return prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';
    });
    
    // Inicializar PHOTO_PREFIX para compatibilidad
    this.PHOTO_PREFIX = this.photoPrefixSignal();
    
    // ✅ Signal para número global de tabla (única tabla en sección 24)
    this.globalTableNumberSignal = computed(() => {
      return globalNumbering.getGlobalTableNumber(this.seccionId, 0);
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      return fotos.map((_, index) => globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index));
    });

    effect(() => {
      const data = this.formDataSignal();
      // Merge instead of replace: keep existing datos when selector is empty (fallback to BaseSectionComponent data)
      if (data && Object.keys(data).length > 0) {
        this.datos = { ...this.datos, ...data };
      }
      // Aplicar valores con prefijo después del merge (leer del signal, no de this.datos)
      const centroPrefijado = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId);
      if (centroPrefijado) {
        this.datos.centroPobladoAISI = centroPrefijado;
      }
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
  protected override actualizarValoresConPrefijo(): void { }

  trackByIndex(index: number): number { return index; }
}
