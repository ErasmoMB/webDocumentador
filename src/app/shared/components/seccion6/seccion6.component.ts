import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LoadSeccion6UseCase, UpdateSeccion6DataUseCase, Seccion6ViewModel } from '../../../core/application/use-cases';
import { Seccion6Data } from '../../../core/domain/entities';
import { TableManagementFacade } from '../../../core/services/tables/table-management.facade';
import { TableConfig } from '../../../core/services/table-management.service';
import { FotoItem } from '../image-upload/image-upload.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { CoreSharedModule } from '../../../shared/modules/core-shared.module';

@Component({
  selector: 'app-seccion6',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    ParagraphEditorComponent
  ],
  templateUrl: './seccion6.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion6Component implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() modoFormulario: boolean = false;
  @Input() seccionId: string = '3.1.6';

  viewModel$!: Observable<Seccion6ViewModel>;
  fotografiasSeccion6: FotoItem[] = [];
  fotografiasFormMulti: FotoItem[] = [];

  readonly PHOTO_PREFIX = 'fotografiaDemografia';

  poblacionSexoConfig: TableConfig = {
    tablaKey: 'poblacionSexoAISD',
    totalKey: 'sexo',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ sexo: '', casos: 0, porcentaje: '0%' }]
  };

  poblacionEtarioConfig: TableConfig = {
    tablaKey: 'poblacionEtarioAISD',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }]
  };

  constructor(
    private loadSeccion6UseCase: LoadSeccion6UseCase,
    private updateSeccion6DataUseCase: UpdateSeccion6DataUseCase,
    private tableFacade: TableManagementFacade,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.viewModel$ = this.loadSeccion6UseCase.execute();
    this.cargarFotografias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Backward compatibility methods for template
  getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return 'manual';
  }

  formatearParrafo(texto: string): string {
    return texto || '';
  }

  cargarFotografias(): void {
    // Mock implementation - in real app would load from service
    this.fotografiasSeccion6 = [];
  }

  obtenerTextoPoblacionSexo(): string {
    return '';
  }

  obtenerTextoPoblacionEtario(): string {
    return '';
  }

  obtenerTablaPoblacionSexo(): any[] {
    return [];
  }

  obtenerTablaPoblacionEtario(): any[] {
    return [];
  }

  onTablaUpdated(): void {
    this.cdRef.detectChanges();
  }

  // New methods for Clean Architecture
  onDataUpdate(updates: Partial<Seccion6Data>): void {
    this.updateSeccion6DataUseCase.execute(updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Data updated successfully
        this.cdRef.detectChanges();
      });
  }

  onFieldChange(field: keyof Seccion6Data, value: any): void {
    this.onDataUpdate({ [field]: value });
  }

  onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasSeccion6 = fotografias;
    this.fotografiasFormMulti = [...fotografias];
    // Update data through use case if needed
    this.cdRef.detectChanges();
  }

  // Additional methods for template compatibility
  getTablaKeyPoblacionSexo(): string {
    return 'poblacionSexoAISD';
  }

  getTablaKeyPoblacionEtario(): string {
    return 'poblacionEtarioAISD';
  }

  onPoblacionSexoFieldChange(index: number, field: string, value: any): void {
    // Implementation would update data through use case
  }

  onPoblacionEtarioFieldChange(index: number, field: string, value: any): void {
    // Implementation would update data through use case
  }

  onPoblacionSexoTableUpdated(): void {
    this.cdRef.detectChanges();
  }

  onPoblacionEtarioTableUpdated(): void {
    this.cdRef.detectChanges();
  }

  // Backward compatibility getters for template
  get datos(): any {
    // This would be replaced with proper ViewModel access
    return {};
  }

  get columnasPoblacionSexo(): any[] {
    return [
      { field: 'sexo', label: 'Sexo', type: 'text', placeholder: 'Masculino/Femenino' },
      { field: 'casos', label: 'Casos', type: 'number', placeholder: '0' },
      { field: 'porcentaje', label: 'Porcentaje', type: 'text', placeholder: '0%' }
    ];
  }

  get columnasPoblacionEtario(): any[] {
    return [
      { field: 'categoria', label: 'Categoría Etaria', type: 'text', placeholder: '0-17 años' },
      { field: 'casos', label: 'Casos', type: 'number', placeholder: '0' },
      { field: 'porcentaje', label: 'Porcentaje', type: 'text', placeholder: '0%' }
    ];
  }

  calculateTotal(items: any[]): number {
    return items?.reduce((total, item) => total + (item.casos || 0), 0) || 0;
  }
}

