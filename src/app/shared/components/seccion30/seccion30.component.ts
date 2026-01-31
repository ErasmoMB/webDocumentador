import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { LoadSeccion30UseCase, UpdateSeccion30DataUseCase, Seccion30ViewModel } from '../../../core/application/use-cases';
import { Seccion30Data, NivelEducativoData, TasaAnalfabetismoData } from '../../../core/domain/entities';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent, TableColumn, TableConfig } from '../generic-table/generic-table.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';

@Component({
  selector: 'app-seccion30',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GenericTableComponent,
    DynamicTableComponent,
    ParagraphEditorComponent,
    ImageUploadComponent,
    CoreSharedModule
  ],
  templateUrl: './seccion30.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion30Component implements OnInit, OnDestroy {
  @Input() seccionId: string = '3.1.4.B.1.9';
  @Input() modoFormulario: boolean = false;

  // View model
  viewModel$!: Observable<Seccion30ViewModel>;
  private subscription?: Subscription;

  // Backward compatibility properties
  fotografiasCahuachoB19FormMulti: FotoItem[] = [];
  fotografiasInstitucionalidadCache: any[] = [];

  readonly PHOTO_PREFIX_CAHUACHO_B19 = 'fotografiaCahuachoB19';
  readonly PHOTO_PREFIX = 'fotografiaCahuachoB19';

  // Table configurations
  nivelEducativoConfig: TableConfig = {
    columns: [
      { key: 'nivel', header: 'Nivel Educativo', width: '50%' },
      { key: 'casos', header: 'Casos', width: '25%', align: 'center' as const },
      { key: 'porcentaje', header: 'Porcentaje', width: '25%', align: 'center' as const }
    ],
    showHeader: true,
    showFooter: false
  };

  tasaAnalfabetismoConfig: TableConfig = {
    columns: [
      { key: 'grupo', header: 'Grupo', width: '25%' },
      { key: 'total', header: 'Total', width: '20%', align: 'center' as const },
      { key: 'alfabetos', header: 'Alfabetos', width: '20%', align: 'center' as const },
      { key: 'analfabetos', header: 'Analfabetos', width: '20%', align: 'center' as const },
      { key: 'tasaAnalfabetismo', header: 'Tasa', width: '15%', align: 'center' as const }
    ],
    showHeader: true,
    showFooter: false
  };

  // Dynamic table configurations for editing
  nivelEducativoDynamicConfig = {
    tablaKey: 'nivelEducativoTabla',
    totalKey: 'nivel',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  tasaAnalfabetismoDynamicConfig = {
    tablaKey: 'tasaAnalfabetismoTabla',
    totalKey: 'grupo',
    campoTotal: 'total',
    calcularPorcentajes: false,
    camposParaCalcular: []
  };

  constructor(
    private loadSeccion30UseCase: LoadSeccion30UseCase,
    private updateSeccion30DataUseCase: UpdateSeccion30DataUseCase,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadData(): void {
    this.viewModel$ = this.loadSeccion30UseCase.execute();
    this.subscription = this.viewModel$.subscribe(viewModel => {
      this.updateFotografiasCache();
      this.cdRef.detectChanges();
    });
  }

  // Backward compatibility getters
  get datos(): any {
    // This will be populated by the view model subscription
    let currentData: Seccion30Data | null = null;
    this.subscription = this.viewModel$.subscribe(vm => currentData = vm.data);
    return currentData || {};
  }

  get centroPobladoAISI(): string {
    return this.datos.centroPobladoAISI || 'Cahuacho';
  }

  get nivelEducativoTabla(): NivelEducativoData[] {
    return this.datos.nivelEducativoTabla || [];
  }

  get tasaAnalfabetismoTabla(): TasaAnalfabetismoData[] {
    return this.datos.tasaAnalfabetismoTabla || [];
  }

  get textoNivelEducativo(): string {
    return this.datos.textoNivelEducativo || '';
  }

  get textoTasaAnalfabetismo(): string {
    return this.datos.textoTasaAnalfabetismo || '';
  }

  // Event handlers
  onFieldChange(field: keyof Seccion30Data, value: any): void {
    this.updateSeccion30DataUseCase.execute({ [field]: value }).subscribe();
  }

  onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasCahuachoB19FormMulti = fotografias;
    // Update the data through use case
    this.updateSeccion30DataUseCase.execute({
      fotografiasCahuachoB19: fotografias
    }).subscribe();
  }

  onNivelEducativoTableUpdated(): void {
    // Table updated, data is already persisted through the dynamic table
  }

  onTasaAnalfabetismoTableUpdated(): void {
    // Table updated, data is already persisted through the dynamic table
  }

  // Backward compatibility methods
  private updateFotografiasCache(): void {
    // Update cache from current data
    this.fotografiasInstitucionalidadCache = this.datos.fotografiasCahuachoB19 || [];
  }

  // Text getters for template compatibility
  obtenerTextoNivelEducativo(): string {
    return this.datos.textoNivelEducativo || '';
  }

  obtenerTextoTasaAnalfabetismo(): string {
    return this.datos.textoTasaAnalfabetismo || '';
  }
}
