import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { LoadSeccion22UseCase, UpdateSeccion22DataUseCase, Seccion22ViewModel } from '../../../core/application/use-cases';
import { Seccion22Data, PoblacionSexoData, PoblacionEtarioData } from '../../../core/domain/entities';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent, TableColumn, TableConfig } from '../generic-table/generic-table.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';

@Component({
  selector: 'app-seccion22',
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
  templateUrl: './seccion22.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion22Component implements OnInit, OnDestroy {
  @Input() seccionId: string = '3.1.4.B.1.1';
  @Input() modoFormulario: boolean = false;

  // View model
  viewModel$!: Observable<Seccion22ViewModel>;
  private subscription?: Subscription;

  // Backward compatibility properties
  fotografiasCahuachoB11FormMulti: FotoItem[] = [];
  fotografiasInstitucionalidadCache: any[] = [];

  readonly PHOTO_PREFIX_CAHUACHO_B11 = 'fotografiaCahuachoB11';
  readonly PHOTO_PREFIX = '';

  // Table configurations
  poblacionSexoConfig: TableConfig = {
    columns: [
      { key: 'sexo', header: 'Sexo', width: '40%' },
      { key: 'casos', header: 'Casos', width: '30%', align: 'center' as const },
      { key: 'porcentaje', header: 'Porcentaje', width: '30%', align: 'center' as const }
    ],
    showHeader: true,
    showFooter: false
  };

  poblacionEtarioConfig: TableConfig = {
    columns: [
      { key: 'categoria', header: 'Categoría', width: '40%' },
      { key: 'casos', header: 'Casos', width: '30%', align: 'center' as const },
      { key: 'porcentaje', header: 'Porcentaje', width: '30%', align: 'center' as const }
    ],
    showHeader: true,
    showFooter: false
  };

  // Dynamic table configurations for editing
  poblacionSexoDynamicConfig = {
    tablaKey: 'poblacionSexoAISI',
    totalKey: 'sexo',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  poblacionEtarioDynamicConfig = {
    tablaKey: 'poblacionEtarioAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  constructor(
    private loadSeccion22UseCase: LoadSeccion22UseCase,
    private updateSeccion22DataUseCase: UpdateSeccion22DataUseCase,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadData(): void {
    this.viewModel$ = this.loadSeccion22UseCase.execute();
    this.subscription = this.viewModel$.subscribe(viewModel => {
      this.updateFotografiasCache();
      this.cdRef.detectChanges();
    });
  }

  // Backward compatibility getters
  get datos(): any {
    // This will be populated by the view model subscription
    let currentData: Seccion22Data | null = null;
    this.subscription = this.viewModel$.subscribe(vm => currentData = vm.data);
    return currentData || {};
  }

  get centroPobladoAISI(): string {
    return this.datos.centroPobladoAISI || 'Cahuacho';
  }

  get poblacionSexoAISI(): PoblacionSexoData[] {
    return this.datos.poblacionSexoAISI || [];
  }

  get poblacionEtarioAISI(): PoblacionEtarioData[] {
    return this.datos.poblacionEtarioAISI || [];
  }

  get textoDemografiaAISI(): string {
    return this.datos.textoDemografiaAISI || '';
  }

  get textoGrupoEtarioAISI(): string {
    return this.datos.textoGrupoEtarioAISI || '';
  }

  // Event handlers
  onFieldChange(field: keyof Seccion22Data, value: any): void {
    this.updateSeccion22DataUseCase.execute({ [field]: value }).subscribe();
  }

  onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasCahuachoB11FormMulti = fotografias;
    // Update the data through use case
    this.updateSeccion22DataUseCase.execute({
      fotografiasCahuachoB11: fotografias
    }).subscribe();
  }

  onPoblacionSexoTableUpdated(): void {
    // Table updated, data is already persisted through the dynamic table
  }

  onPoblacionEtarioTableUpdated(): void {
    // Table updated, data is already persisted through the dynamic table
  }

  // Backward compatibility methods
  private updateFotografiasCache(): void {
    // Update cache from current data
    this.fotografiasInstitucionalidadCache = this.datos.fotografiasCahuachoB11 || [];
  }

  // Text getters for template compatibility
  obtenerTextoDemografiaAISI(): string {
    return this.datos.textoDemografiaAISI || '';
  }

  obtenerTextoGrupoEtarioAISI(): string {
    return this.datos.textoGrupoEtarioAISI || '';
  }
}

