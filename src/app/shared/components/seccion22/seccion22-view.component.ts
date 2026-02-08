import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ISeccion22TextGeneratorService } from 'src/app/core/domain/interfaces';

@Component({
  selector: 'app-seccion22-view',
  templateUrl: './seccion22-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion22ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.1';

  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB11';
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  // Generate texts using the injected text generator service when manual text is missing
  readonly textoDemografiaSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoDemografiaAISI')();
    if (manual && manual.trim().length > 0) return manual;
    const data = this.formDataSignal() as any;
    return this.textGenerator.generateDemografiaText(data);
  });

  readonly textoGrupoEtarioSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoGrupoEtarioAISI')();
    if (manual && manual.trim().length > 0) return manual;
    const data = this.formDataSignal() as any;
    return this.textGenerator.generateGrupoEtarioText(data);
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

  readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
    return this.projectFacade.selectTableData(this.seccionId, null, 'poblacionSexoAISI')() ?? this.projectFacade.selectField(this.seccionId, null, 'poblacionSexoAISI')() ?? [];
  });

  readonly poblacionEtarioSignal: Signal<any[]> = computed(() => {
    return this.projectFacade.selectTableData(this.seccionId, null, 'poblacionEtarioAISI')() ?? this.projectFacade.selectField(this.seccionId, null, 'poblacionEtarioAISI')() ?? [];
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
  readonly tituloPoblacionSexoSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'tituloPoblacionSexoAISI')() || 'Población por sexo';
  });

  readonly fullTituloPoblacionSexoSignal: Signal<string> = computed(() => {
    // Prefer explicit cuadro field if present
    const cuadro = this.projectFacade.selectField(this.seccionId, null, 'cuadroTituloPoblacionSexo')();
    if (cuadro && String(cuadro).trim().length > 0) return cuadro;

    const base = this.tituloPoblacionSexoSignal();
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || 'Cahuacho';
    const year = '2017';
    if (!base || base.trim() === '') return `Población por sexo – CP ${cp} (${year})`;
    if (base.includes('– CP') || base.includes('CP ') || base.includes('(')) return base;
    return `${base} – CP ${cp} (${year})`;
  });

  readonly fuentePoblacionSexoSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'fuentePoblacionSexoAISI')() || 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.';
  });

  readonly tituloPoblacionEtarioSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'tituloPoblacionEtarioAISI')() || 'Población por grupo etario';
  });

  readonly fullTituloPoblacionEtarioSignal: Signal<string> = computed(() => {
    // Prefer explicit cuadro field if present
    const cuadro = this.projectFacade.selectField(this.seccionId, null, 'cuadroTituloPoblacionEtario')();
    if (cuadro && String(cuadro).trim().length > 0) return cuadro;

    const base = this.tituloPoblacionEtarioSignal();
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || 'Cahuacho';
    const year = '2017';
    if (!base || base.trim() === '') return `Población por grupo etario – CP ${cp} (${year})`;
    if (base.includes('– CP') || base.includes('CP ') || base.includes('(')) return base;
    return `${base} – CP ${cp} (${year})`;
  });

  readonly fuentePoblacionEtarioSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'fuentePoblacionEtarioAISI')() || 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
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

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private textGenerator: ISeccion22TextGeneratorService) {
    super(cdRef, injector);

    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void { }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  trackByIndex(index: number): number { return index; }
}
