import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule, DynamicTableComponent, ImageUploadComponent, ParagraphEditorComponent],
  selector: 'app-seccion24-form',
  templateUrl: './seccion24-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion24FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.3';
  @Input() override modoFormulario: boolean = false;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly actividadesEconomicasSignal: Signal<any[]> = computed(() => {
    // Prefer table storage (canonical for tabular data) and fallback to legacy field if needed
    return this.projectFacade.selectTableData(this.seccionId, null, 'actividadesEconomicasAISI')() ?? this.projectFacade.selectField(this.seccionId, null, 'actividadesEconomicasAISI')() ?? [];
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    // Fotos generales (PHOTO_PREFIX)
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

  readonly viewModel = computed(() => ({
    centroPoblado: (this.formDataSignal() as any)?.centroPobladoAISI || '',
    actividadesEconomicas: this.actividadesEconomicasSignal(),
    ciudadOrigenComercio: (this.formDataSignal() as any)?.ciudadOrigenComercio || '',
    textos: {
      intro: (() => {
        const manual = this.projectFacade.selectField(this.seccionId, null, 'textoIntroActividadesEconomicasAISI')();
        if (manual && manual.trim().length > 0) return (manual.split('\n\n')[0] || manual);
        return this.generarTextoIntroDefault();
      })(),
      introLong: (() => {
        const manual = this.projectFacade.selectField(this.seccionId, null, 'textoIntroActividadesEconomicasAISI')();
        if (manual && manual.trim().length > 0) return (manual.split('\n\n')[1] || '');
        return this.generarTextoIntroLongDefault();
      })(),
      analisis: this.projectFacade.selectField(this.seccionId, null, 'textoActividadesEconomicasAISI')() || this.generarTextoAnalisisDefault(),
      mercado: this.projectFacade.selectField(this.seccionId, null, 'textoMercadoProductos')() || this.generarTextoMercadoDefault(),
      habitos: this.projectFacade.selectField(this.seccionId, null, 'textoHabitosConsumo')() || this.generarTextoHabitosDefault(),
      fuente: this.projectFacade.selectField(this.seccionId, null, 'fuenteActividadesEconomicasAISI')() || this.generarFuenteDefault()
    },


    fotos: this.fotosCacheSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private formChange: FormChangeService) {
    super(cdRef, injector);
    // Inicializar PHOTO_PREFIX dinámicamente basado en el grupo actual
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

    effect(() => {
      const data = this.formDataSignal();
      const actividades = this.actividadesEconomicasSignal();
      this.datos = { ...data, actividadesEconomicasAISI: actividades };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar tanto el objeto local como el store
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }); } catch (e) {}
    
    // Ensure table has initial structure (use table store as primary)
    const tablaKey = 'actividadesEconomicasAISI';
    const current = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
    if (!Array.isArray(current) || current.length === 0) {
      // Default: una sola fila vacía para que el cuadro aparezca limpio en el formulario
      const inicial = [{ actividad: '', casos: '', porcentaje: '' }];
      console.info('[Seccion24] Inicializando tabla actividadesEconomicasAISI con 1 fila vacía');
      try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, inicial); } catch (e) { console.error('[Seccion24] setTableData init error', e); }
      try { const payloadInit: any = { [tablaKey]: inicial }; const prefInit = this.obtenerPrefijoGrupo(); if (prefInit) payloadInit[`${tablaKey}${prefInit}`] = inicial; this.formChange.persistFields(this.seccionId, 'table', payloadInit); } catch (e) { console.error('[Seccion24] persist init error', e); }
      // Mantener sincronía con campo legacy para compatibilidad
      try { this.projectFacade.setField(this.seccionId, null, tablaKey, inicial); } catch (e) { console.error('[Seccion24] setField init error', e); }
    }
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void {
    // Restaurar centroPobladoAISI con el prefijo correcto
    const centro = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centro || null;
  }

  actualizarCentroPoblado(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'centroPobladoAISI', valor);
    this.onFieldChange('centroPobladoAISI', valor);
  }

  onActividadesEconomicasChange(tabla: any[]): void {
    console.info('[Seccion24] onActividadesEconomicasChange payload len:', Array.isArray(tabla) ? tabla.length : typeof tabla);
    // Persist primarily as TABLE and mirror to legacy field for compatibility
    try { this.projectFacade.setTableData(this.seccionId, null, 'actividadesEconomicasAISI', tabla); } catch (e) { console.error('[Seccion24] setTableData error', e); }
    try {
      const payload: any = { actividadesEconomicasAISI: tabla };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`actividadesEconomicasAISI${prefijo}`] = tabla;
      this.formChange.persistFields(this.seccionId, 'table', payload);
    } catch (e) { console.error('[Seccion24] formChange.persistFields error', e); }
    // Mirror to legacy field so components reading fields see the update immediately
    try { const prefijo = this.obtenerPrefijoGrupo(); if (prefijo) this.projectFacade.setField(this.seccionId, null, `actividadesEconomicasAISI${prefijo}`, tabla); } catch (e) { console.error('[Seccion24] setField error', e); }
    try { this.projectFacade.setField(this.seccionId, null, 'actividadesEconomicasAISI', tabla); } catch (e) { console.error('[Seccion24] setField error', e); }
    // Notify section about the change (updates this.datos and triggers persistence)
    this.onFieldChange('actividadesEconomicasAISI', tabla);
    try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  actualizarCiudadOrigenComercio(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'ciudadOrigenComercio', valor);
    try {
      const payload: any = { ciudadOrigenComercio: valor };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`ciudadOrigenComercio${prefijo}`] = valor;
      this.formChange.persistFields(this.seccionId, 'form', payload);
    } catch (e) {}
    this.onFieldChange('ciudadOrigenComercio', valor);
  }

  actualizarTexto(fieldId: string, valor: string): void {
    // Special behavior only for the intro field: preserve second paragraph when editing Párrafo 1
    if (fieldId === 'textoIntroActividadesEconomicasAISI') {
      const actual = this.projectFacade.selectField(this.seccionId, null, fieldId)() || '';
      const parts = actual.split('\n\n');
      // Prefer stored second paragraph; if none, use generated view default
      const storedSecond = parts[1] || '';
      const generatedSecond = this.viewModel().textos?.introLong || '';
      const second = (storedSecond && storedSecond.trim().length > 0) ? storedSecond : (generatedSecond || '');
      const nuevo = second && second.trim().length > 0 ? `${valor}\n\n${second}` : valor;
      this.projectFacade.setField(this.seccionId, null, fieldId, nuevo);
      try {
        const payload: any = { [fieldId]: nuevo };
        const prefijo = this.obtenerPrefijoGrupo();
        if (prefijo) payload[`${fieldId}${prefijo}`] = nuevo;
        this.formChange.persistFields(this.seccionId, 'text', payload);
      } catch (e) {}
      this.onFieldChange(fieldId, nuevo);
      return;
    }

    // Default behavior: save exactly what the user typed (no merging with other generated texts)
    this.projectFacade.setField(this.seccionId, null, fieldId, valor);
    try {
      const payload: any = { [fieldId]: valor };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`${fieldId}${prefijo}`] = valor;
      this.formChange.persistFields(this.seccionId, 'text', payload);
    } catch (e) {}
    this.onFieldChange(fieldId, valor);
  }

  actualizarIntroLong(valor: string): void {
    const fieldId = 'textoIntroActividadesEconomicasAISI';
    const actual = this.projectFacade.selectField(this.seccionId, null, fieldId)() || '';
    const parts = actual.split('\n\n');
    const first = parts[0] || this.generarTextoIntroDefault();
    const nuevo = `${first}\n\n${valor}`;
    this.projectFacade.setField(this.seccionId, null, fieldId, nuevo);
    try { const payload: any = { [fieldId]: nuevo }; const prefijo = this.obtenerPrefijoGrupo(); if (prefijo) payload[`${fieldId}${prefijo}`] = nuevo; this.formChange.persistFields(this.seccionId, 'text', payload); } catch (e) {}
    this.onFieldChange(fieldId, nuevo);
  }

  onFotografiasChangeHandler(fotografias: FotoItem[], prefix?: string): void {
    this.onFotografiasChange(fotografias, prefix);
    this.cdRef.markForCheck();
  }

  private generarTextoIntroDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    return `Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describirá la estructura y la diversidad de las actividades económicas en la capital distrital de ${cp}, que forma parte del AISI.`;
  }

  private generarTextoAnalisisDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    const actividades = this.actividadesEconomicasSignal() || [];
    const agricultura = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('agricultura'));
    const administracion = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('administración'));
    const porcentajeAgricultura = agricultura?.porcentaje && String(agricultura.porcentaje).trim().length > 0 ? agricultura.porcentaje : '____';
    const porcentajeAdministracion = administracion?.porcentaje && String(administracion.porcentaje).trim().length > 0 ? administracion.porcentaje : '____';

    return `Del cuadro anterior, se aprecia que la actividad económica más frecuente dentro del CP ${cp} es el grupo "Agricultura, ganadería, silvicultura y pesca" con un ${porcentajeAgricultura}. Esto se condice con las entrevistas aplicadas en campo, pues los informantes y autoridades declararon que la mayoría de la población se dedica principalmente a la agricultura y a la ganadería. La segunda actividad más frecuente dentro de esta localidad es la de "Administración pública y defensa; planes de seguridad social de afiliación obligatoria" con ${porcentajeAdministracion}.`;
  }

  private generarTextoMercadoDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || this.projectFacade.selectField(this.seccionId, null, 'ciudadOrigenComercio')() || 'Caravelí';

    return `El CP ${cp} no cuenta con un mercado formal que centralice las actividades comerciales de la localidad. El comercio en este lugar es incipiente y se lleva a cabo principalmente a través de pequeñas bodegas. Estas bodegas atienden la demanda cotidiana en la localidad, pero la oferta sigue siendo limitada y gran parte de los productos llega desde ${ciudadOrigen}. Además, la comercialización de productos en ${cp} se complementa con la presencia de comerciantes mayoristas que viajan hacia la localidad para comprar y vender productos. La mayoría de estos comerciantes provienen de la ciudad de ${ciudadOrigen}, desde donde abastecen las bodegas locales con mercancías diversas. Este sistema de intermediación permite que los pobladores de ${cp} accedan a una variedad más amplia de productos, aunque la oferta sigue siendo limitada en comparación con las zonas urbanas más grandes. La falta de un mercado formal y de una infraestructura de comercio mayor limita el desarrollo del intercambio comercial en la localidad, pero el dinamismo de las pequeñas bodegas y la llegada de comerciantes externos contribuyen a mantener un flujo de productos que satisface las necesidades básicas de la población.`;
  }

  private generarTextoHabitosDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || this.projectFacade.selectField(this.seccionId, null, 'ciudadOrigenComercio')() || 'Caravelí';

    return `En la capital distrital de ${cp}, los hábitos de consumo están basados principalmente en alimentos tradicionales y accesibles dentro de la comunidad. Los productos más consumidos incluyen tubérculos (como papa y oca) y verduras, los cuales son esenciales en la dieta diaria de los hogares. Estos productos se adquieren tanto a través de la producción local, como es el caso de la papa y la oca, como de compras a pequeños comerciantes que llegan a la capital distrital desde ${ciudadOrigen}. La papa, por ser uno de los cultivos más abundantes en la zona, tiene un rol fundamental en la alimentación, acompañando la mayoría de las comidas junto a otros carbohidratos. En cuanto al consumo de proteínas, los habitantes del pueblo suelen recurrir a la carne de animales menores como las gallinas y los cuyes, así como de vacuno, los cuales son criados en sus propias viviendas. Estas carnes son un complemento importante en la dieta y una fuente de nutrientes esenciales, especialmente en eventos familiares o festividades. Si bien se consumen otros tipos de carne en menor proporción, como ovino, estas son generalmente reservadas para ocasiones especiales.`;
  }

  private generarFuenteDefault(): string {
    return 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas.';
  }

  private generarTextoIntroLongDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || 'Cahuacho';
    return `A partir de fuentes oficiales, se exploran las principales fuentes de ingresos y los sectores productivos más relevantes dentro del CP ${cp} (capital distrital). En esta ocasión, se recurre a los datos provistos por los Censos Nacionales 2017.`;
  }

  actualizarFuente(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'fuenteActividadesEconomicasAISI', valor);
    try {
      const payload: any = { fuenteActividadesEconomicasAISI: valor };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`fuenteActividadesEconomicasAISI${prefijo}`] = valor;
      this.formChange.persistFields(this.seccionId, 'form', payload);
    } catch (e) {}
    this.onFieldChange('fuenteActividadesEconomicasAISI', valor);
  }

  trackByIndex(index: number): number { return index; }
}
