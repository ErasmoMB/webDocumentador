import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';

@Component({
  selector: 'app-seccion24-view',
  templateUrl: './seccion24-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion24ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.3';

  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB13';
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly textoIntroShortSignal = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoIntroActividadesEconomicasAISI')();
    if (manual && manual.trim().length > 0) return (manual.split('\n\n')[0] || manual);
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || 'Cahuacho';
    return `Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describirá la estructura y la diversidad de las actividades económicas en la capital distrital de ${cp}, que forma parte del AISI.`;
  });

  readonly textoIntroLongSignal = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoIntroActividadesEconomicasAISI')();
    if (manual && manual.trim().length > 0) return (manual.split('\n\n')[1] || '');
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || 'Cahuacho';
    return `A partir de fuentes oficiales, se exploran las principales fuentes de ingresos y los sectores productivos más relevantes dentro del CP ${cp} (capital distrital). En esta ocasión, se recurre a los datos provistos por los Censos Nacionales 2017.`;
  });

  readonly actividadesEconomicasSignal = computed(() => {
    const raw = this.projectFacade.selectTableData(this.seccionId, null, 'actividadesEconomicasAISI')() ?? this.projectFacade.selectField(this.seccionId, null, 'actividadesEconomicasAISI')() ?? [];
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
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoActividadesEconomicasAISI')();
    if (manual && manual.trim().length > 0) return manual;

    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || 'Cahuacho';
    const actividades = this.actividadesEconomicasSignal();
    const agricultura = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('agricultura'));
    const administracion = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('administración'));
    const porcentajeAgricultura = agricultura?.porcentaje && String(agricultura.porcentaje).trim().length > 0 ? agricultura.porcentaje : '____';
    const porcentajeAdministracion = administracion?.porcentaje && String(administracion.porcentaje).trim().length > 0 ? administracion.porcentaje : '____';

    return `Del cuadro anterior, se aprecia que la actividad económica más frecuente dentro del CP ${cp} es el grupo "Agricultura, ganadería, silvicultura y pesca" con un ${porcentajeAgricultura}. Esto se condice con las entrevistas aplicadas en campo, pues los informantes y autoridades declararon que la mayoría de la población se dedica principalmente a la agricultura y a la ganadería. La segunda actividad más frecuente dentro de esta localidad es la de "Administración pública y defensa; planes de seguridad social de afiliación obligatoria" con ${porcentajeAdministracion}.`;
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
  });

  readonly fotosActividadesSignal: Signal<FotoItem[]> = computed(() => {
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, 'fotografiaActividadesEconomicas', groupPrefix);
  });

  readonly fotosMercadoSignal: Signal<FotoItem[]> = computed(() => {
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, 'fotografiaMercado', groupPrefix);
  });

  readonly mercadoSignal = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoMercadoProductos')();
    if (manual && manual.trim().length > 0) return manual;
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || 'Cahuacho';
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || 'Caravelí';
    return `El CP ${cp} no cuenta con un mercado formal que centralice las actividades comerciales de la localidad. El comercio en este lugar es incipiente y se lleva a cabo principalmente a través de pequeñas bodegas. Estas bodegas atienden la demanda cotidiana en la localidad, pero la oferta sigue siendo limitada y gran parte de los productos llega desde ${ciudadOrigen}.\n\nAdemás, la comercialización de productos en ${cp} se complementa con la presencia de comerciantes mayoristas que viajan hacia la localidad para comprar y vender productos. La mayoría de estos comerciantes provienen de la ciudad de ${ciudadOrigen}, desde donde abastecen las bodegas locales con mercancías diversas. Este sistema de intermediación permite que los pobladores de ${cp} accedan a una variedad más amplia de productos, aunque la oferta sigue siendo limitada en comparación con las zonas urbanas más grandes. La falta de un mercado formal y de una infraestructura de comercio mayor limita el desarrollo del intercambio comercial en la localidad, pero el dinamismo de las pequeñas bodegas y la llegada de comerciantes externos contribuyen a mantener un flujo de productos que satisface las necesidades básicas de la población.`;
  });

  readonly habitosSignal = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoHabitosConsumo')();
    if (manual && manual.trim().length > 0) return manual;
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || 'Cahuacho';
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || 'Caravelí';
    return `En la capital distrital de ${cp}, los hábitos de consumo están basados principalmente en alimentos tradicionales y accesibles dentro de la comunidad. Los productos más consumidos incluyen tubérculos (como papa y oca) y verduras, los cuales son esenciales en la dieta diaria de los hogares. Estos productos se adquieren tanto a través de la producción local, como es el caso de la papa y la oca, como de compras a pequeños comerciantes que llegan a la capital distrital desde ${ciudadOrigen}. La papa, por ser uno de los cultivos más abundantes en la zona, tiene un rol fundamental en la alimentación, acompañando la mayoría de las comidas junto a otros carbohidratos.\n\nEn cuanto al consumo de proteínas, los habitantes del pueblo suelen recurrir a la carne de animales menores como las gallinas y los cuyes, así como de vacuno, los cuales son criados en sus propias viviendas. Estas carnes son un complemento importante en la dieta y una fuente de nutrientes esenciales, especialmente en eventos familiares o festividades. Si bien se consumen otros tipos de carne en menor proporción, como ovino, estas son generalmente reservadas para ocasiones especiales.`;
  });

  readonly fuenteSignal = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'fuenteActividadesEconomicasAISI')() || 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.';
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
    fotos: this.fotosCacheSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
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
