import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { LoadSeccion24UseCase, UpdateSeccion24DataUseCase, Seccion24ViewModel } from '../../../core/application/use-cases';
import { Seccion24Data } from '../../../core/domain/entities';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent, TableColumn, TableConfig } from '../generic-table/generic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';

@Component({
  selector: 'app-seccion24',
  templateUrl: './seccion24.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ImageUploadComponent,
    ParagraphEditorComponent,
    GenericTableComponent,
    CoreSharedModule
  ],
  standalone: true
})
export class Seccion24Component implements OnInit, OnDestroy {
  @Input() seccionId: string = '3.1.4.B.1.3';
  @Input() modoFormulario: boolean = false;

  viewModel$!: Observable<Seccion24ViewModel>;
  private subscriptions: Subscription[] = [];

  readonly PHOTO_PREFIX = 'fotografiaCahuachoB13';
  fotografiasActividadesEconomicas: FotoItem[] = [];
  fotografiasMercado: FotoItem[] = [];
  fotografiasHabitosConsumo: FotoItem[] = [];

  // Form properties for backward compatibility
  fotografiasActividadesEconomicasForm: FotoItem[] = [];
  fotografiasMercadoForm: FotoItem[] = [];
  fotografiasHabitosConsumoForm: FotoItem[] = [];

  // Table configuration for backward compatibility
  actividadesEconomicasConfig: TableConfig = {
    columns: [
      { key: 'actividad', header: 'Actividad Económica', width: '60%' },
      { key: 'casos', header: 'Casos', width: '20%', align: 'center' as const },
      { key: 'porcentaje', header: 'Porcentaje', width: '20%', align: 'center' as const, format: (value: any) => `${value}%` }
    ],
    showHeader: true,
    showFooter: false
  };

  // Dynamic table configuration for editable table
  actividadesEconomicasDynamicConfig = {
    tablaKey: 'actividadesEconomicasAISI',
    totalKey: 'actividad',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  // Form data
  centroPobladoAISI: string = '';
  actividadesEconomicasAISI: any[] = [];
  ciudadOrigenComercio: string = '';
  textoIntroActividadesEconomicasAISI: string = '';
  textoActividadesEconomicasAISI: string = '';
  textoMercadoProductos: string = '';
  textoHabitosConsumo: string = '';

  constructor(
    private loadSeccion24UseCase: LoadSeccion24UseCase,
    private updateSeccion24DataUseCase: UpdateSeccion24DataUseCase,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadFotografias();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadData(): void {
    this.viewModel$ = this.loadSeccion24UseCase.execute();
    const subscription = this.viewModel$.subscribe(viewModel => {
      this.centroPobladoAISI = viewModel.data.centroPobladoAISI || '';
      this.actividadesEconomicasAISI = viewModel.data.actividadesEconomicasAISI || [];
      this.ciudadOrigenComercio = viewModel.data.ciudadOrigenComercio || '';
      this.textoIntroActividadesEconomicasAISI = viewModel.data.textoIntroActividadesEconomicasAISI || '';
      this.textoActividadesEconomicasAISI = viewModel.data.textoActividadesEconomicasAISI || '';
      this.textoMercadoProductos = viewModel.data.textoMercadoProductos || '';
      this.textoHabitosConsumo = viewModel.data.textoHabitosConsumo || '';
      this.cdRef.detectChanges();
    });
    this.subscriptions.push(subscription);
  }

  private loadFotografias(): void {
    // TODO: Implement photo loading using PhotoService
    this.fotografiasActividadesEconomicas = [];
    this.fotografiasMercado = [];
    this.fotografiasHabitosConsumo = [];
  }

  onCentroPobladoChange(value: string): void {
    this.centroPobladoAISI = value;
    this.updateData();
  }

  onActividadesEconomicasChange(tabla: any[]): void {
    this.actividadesEconomicasAISI = tabla;
    this.updateData();
  }

  onCiudadOrigenComercioChange(value: string): void {
    this.ciudadOrigenComercio = value;
    this.updateData();
  }

  onTextoIntroActividadesChange(value: string): void {
    this.textoIntroActividadesEconomicasAISI = value;
    this.updateData();
  }

  onTextoActividadesChange(value: string): void {
    this.textoActividadesEconomicasAISI = value;
    this.updateData();
  }

  onTextoMercadoChange(value: string): void {
    this.textoMercadoProductos = value;
    this.updateData();
  }

  onTextoHabitosConsumoChange(value: string): void {
    this.textoHabitosConsumo = value;
    this.updateData();
  }

  private updateData(): void {
    const updates: Partial<Seccion24Data> = {
      centroPobladoAISI: this.centroPobladoAISI,
      actividadesEconomicasAISI: this.actividadesEconomicasAISI,
      ciudadOrigenComercio: this.ciudadOrigenComercio,
      textoIntroActividadesEconomicasAISI: this.textoIntroActividadesEconomicasAISI,
      textoActividadesEconomicasAISI: this.textoActividadesEconomicasAISI,
      textoMercadoProductos: this.textoMercadoProductos,
      textoHabitosConsumo: this.textoHabitosConsumo
    };

    this.updateSeccion24DataUseCase.execute(updates).subscribe();
  }

  // Backward compatibility methods
  get datos(): any {
    return {
      centroPobladoAISI: this.centroPobladoAISI,
      actividadesEconomicasAISI: this.actividadesEconomicasAISI,
      ciudadOrigenComercio: this.ciudadOrigenComercio,
      textoIntroActividadesEconomicasAISI: this.textoIntroActividadesEconomicasAISI,
      textoActividadesEconomicasAISI: this.textoActividadesEconomicasAISI,
      textoMercadoProductos: this.textoMercadoProductos,
      textoHabitosConsumo: this.textoHabitosConsumo
    };
  }

  get fotografiasActividadesEconomicasCache(): FotoItem[] {
    return this.fotografiasActividadesEconomicas;
  }

  get fotografiasMercadoCache(): FotoItem[] {
    return this.fotografiasMercado;
  }

  get fotografiasInstitucionalidadCache(): FotoItem[] {
    return this.fotografiasHabitosConsumo;
  }

  // Template helper methods
  getActividadesEconomicasSinTotal(): any[] {
    return this.actividadesEconomicasAISI.filter((item: any) =>
      !item.actividad?.toString().toLowerCase().includes('total')
    );
  }

  getActividadesEconomicasAISIConPorcentajes(): any[] {
    const tabla = this.getActividadesEconomicasSinTotal();
    // Simple percentage calculation - in a real implementation you'd use a service
    const total = tabla.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
    return tabla.map((item: any) => ({
      ...item,
      porcentaje: total > 0 ? ((Number(item.casos) || 0) / total * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %'
    }));
  }

  getPorcentajeAgricultura(): string {
    const item = this.actividadesEconomicasAISI.find((item: any) =>
      item.actividad && item.actividad.toLowerCase().includes('agricultura')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeAdministracion(): string {
    const item = this.actividadesEconomicasAISI.find((item: any) =>
      item.actividad && item.actividad.toLowerCase().includes('administración')
    );
    return item?.porcentaje || '____';
  }

  getFotografiasActividadesEconomicasParaImageUpload(): FotoItem[] {
    return this.fotografiasActividadesEconomicasCache;
  }

  getFotografiasMercadoParaImageUpload(): FotoItem[] {
    return this.fotografiasMercadoCache;
  }

  getFotografiasVista(): FotoItem[] {
    return this.fotografiasInstitucionalidadCache;
  }

  obtenerTextoIntroActividadesEconomicasAISI(): string {
    if (this.textoIntroActividadesEconomicasAISI && this.textoIntroActividadesEconomicasAISI !== '____') {
      return this.textoIntroActividadesEconomicasAISI;
    }
    const distrito = 'Cahuacho'; // This should come from a service
    const centroPoblado = this.centroPobladoAISI || 'Cahuacho';
    return `Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describirá la estructura y la diversidad de las actividades económicas en la capital distrital de ${distrito}, que forma parte del AISI.\n\nA partir de fuentes oficiales, se exploran las principales fuentes de ingresos y los sectores productivos más relevantes dentro del CP ${centroPoblado} (capital distrital). En esta ocasión, se recurre a los datos provistos por los Censos Nacionales 2017.`;
  }

  obtenerTextoActividadesEconomicasAISI(): string {
    if (this.textoActividadesEconomicasAISI && this.textoActividadesEconomicasAISI !== '____') {
      return this.textoActividadesEconomicasAISI;
    }
    const centroPoblado = this.centroPobladoAISI || 'Cahuacho';
    const porcentajeAgricultura = this.getPorcentajeAgricultura();
    const porcentajeAdministracion = this.getPorcentajeAdministracion();
    return `Del cuadro anterior, se aprecia que la actividad económica más frecuente dentro del CP ${centroPoblado} es el grupo "Agricultura, ganadería, silvicultura y pesca" con un ${porcentajeAgricultura}. Esto se condice con las entrevistas aplicadas en campo, pues los informantes y autoridades declararon que la mayoría de la población se dedica principalmente a la agricultura y a la ganadería. La segunda actividad más frecuente dentro de esta localidad es la de "Administración pública y defensa; planes de seguridad social de afiliación obligatoria" con ${porcentajeAdministracion}.`;
  }

  obtenerTextoMercadoProductos(): string {
    if (this.textoMercadoProductos && this.textoMercadoProductos !== '____') {
      return this.textoMercadoProductos;
    }
    const centroPoblado = this.centroPobladoAISI || 'Cahuacho';
    const distrito = 'Cahuacho'; // This should come from a service
    const ciudadOrigen = this.ciudadOrigenComercio || 'Caravelí';
    return `El CP ${centroPoblado} no cuenta con un mercado formal que centralice las actividades comerciales de la localidad. El comercio en este lugar es incipiente y se lleva a cabo principalmente a través de pequeñas bodegas. Estas bodegas atienden la demanda cotidiana en la localidad, pero la oferta sigue siendo limitada y gran parte de los productos llega desde ${ciudadOrigen}.\n\nAdemás, la comercialización de productos en ${distrito} se complementa con la presencia de comerciantes mayoristas que viajan hacia la localidad para comprar y vender productos. La mayoría de estos comerciantes provienen de la ciudad de ${ciudadOrigen}, desde donde abastecen las bodegas locales con mercancías diversas. Este sistema de intermediación permite que los pobladores de ${centroPoblado} accedan a una variedad más amplia de productos, aunque la oferta sigue siendo limitada en comparación con las zonas urbanas más grandes. La falta de un mercado formal y de una infraestructura de comercio mayor limita el desarrollo del intercambio comercial en la localidad, pero el dinamismo de las pequeñas bodegas y la llegada de comerciantes externos contribuyen a mantener un flujo de productos que satisface las necesidades básicas de la población.`;
  }

  obtenerTextoHabitosConsumo(): string {
    if (this.textoHabitosConsumo && this.textoHabitosConsumo !== '____') {
      return this.textoHabitosConsumo;
    }
    const distrito = 'Cahuacho'; // This should come from a service
    const centroPoblado = this.centroPobladoAISI || 'Cahuacho';
    const ciudadOrigen = this.ciudadOrigenComercio || 'Caravelí';
    return `En la capital distrital de ${distrito}, los hábitos de consumo están basados principalmente en alimentos tradicionales y accesibles dentro de la comunidad. Los productos más consumidos incluyen tubérculos (como papa y oca) y verduras, los cuales son esenciales en la dieta diaria de los hogares. Estos productos se adquieren tanto a través de la producción local, como es el caso de la papa y la oca, como de compras a pequeños comerciantes que llegan a la capital distrital desde ${ciudadOrigen}. La papa, por ser uno de los cultivos más abundantes en la zona, tiene un rol fundamental en la alimentación, acompañando la mayoría de las comidas junto a otros carbohidratos.\n\nEn cuanto al consumo de proteínas, los habitantes del pueblo suelen recurrir a la carne de animales menores como las gallinas y los cuyes, así como de vacuno, los cuales son criados en sus propias viviendas. Estas carnes son un complemento importante en la dieta y una fuente de nutrientes esenciales, especialmente en eventos familiares o festividades. Si bien se consumen otros tipos de carne en menor proporción, como ovino, estas son generalmente reservadas para ocasiones especiales. Los hábitos de consumo en esta localidad reflejan una combinación de autosuficiencia en algunos alimentos, y la dependencia de productos traídos por comerciantes para completar la dieta diaria.\n\nPor otra parte, cabe mencionar que en el CP ${centroPoblado} se preparan diversos platos tradicionales, comúnmente durante las festividades o en ocasiones especiales. Entre ellos destacan el cuy chactado, el picante de cuy, sopa de morón con charqui, picante de quinua, mazamorra de quinua y chicha de cebada.`;
  }

  onFieldChange(field: string, value: any, options?: any): void {
    // Simple field change handler for backward compatibility
    switch (field) {
      case 'textoIntroActividadesEconomicasAISI':
        this.onTextoIntroActividadesChange(value);
        break;
      case 'textoActividadesEconomicasAISI':
        this.onTextoActividadesChange(value);
        break;
      case 'textoMercadoProductos':
        this.onTextoMercadoChange(value);
        break;
      case 'textoHabitosConsumo':
        this.onTextoHabitosConsumoChange(value);
        break;
      case 'ciudadOrigenComercio':
        this.onCiudadOrigenComercioChange(value);
        break;
    }
  }

  onFotografiasActividadesEconomicasChange(fotografias: FotoItem[]): void {
    this.fotografiasActividadesEconomicasForm = [...fotografias];
    this.fotografiasActividadesEconomicas = [...fotografias];
  }

  onFotografiasMercadoChange(fotografias: FotoItem[]): void {
    this.fotografiasMercadoForm = [...fotografias];
    this.fotografiasMercado = [...fotografias];
  }

  onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasHabitosConsumoForm = [...fotografias];
    this.fotografiasHabitosConsumo = [...fotografias];
  }

  onActividadesEconomicasFieldChange(index: number, field: string, value: any): void {
    if (index >= 0 && index < this.actividadesEconomicasAISI.length) {
      this.actividadesEconomicasAISI[index][field] = value;
      this.updateData();
    }
  }

  onActividadesEconomicasTableUpdated(): void {
    this.updateData();
  }

  getTotalActividadesEconomicas(): any {
    return this.actividadesEconomicasAISI.find((item: any) =>
      item.actividad?.toString().toLowerCase().includes('total')
    ) || { actividad: 'Total', casos: 0, porcentaje: '0,00 %' };
  }
}
