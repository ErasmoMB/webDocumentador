import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LoadSeccion3UseCase, UpdateSeccion3DataUseCase, Seccion3ViewModel } from '../../../core/application/use-cases';
import { Seccion3Data, Entrevistado } from '../../../core/domain/entities';
import { TableManagementFacade } from '../../../core/services/tables/table-management.facade';
import { TableConfig } from '../../../core/services/table-management.service';
import { FotoItem } from '../image-upload/image-upload.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { CoreSharedModule } from '../../../shared/modules/core-shared.module';
import { DataSourceDirective } from '../../directives/data-source.directive';

@Component({
  selector: 'app-seccion3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    GenericTableComponent,
    ParagraphEditorComponent,
    DataSourceDirective
  ],
  templateUrl: './seccion3.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion3Component implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() modoFormulario: boolean = false;
  @Input() seccionId: string = '3.1.3';

  viewModel$!: Observable<Seccion3ViewModel>;
  fotografiasSeccion3: FotoItem[] = [];

  readonly PHOTO_PREFIX = 'fotografiaSeccion3';

  entrevistadosConfig: TableConfig = {
    tablaKey: 'entrevistados',
    totalKey: 'nombre',
    campoTotal: 'nombre',
    campoPorcentaje: 'cargo',
    estructuraInicial: [{ nombre: '', cargo: '', organizacion: '' }]
  };

  constructor(
    private loadSeccion3UseCase: LoadSeccion3UseCase,
    private updateSeccion3DataUseCase: UpdateSeccion3DataUseCase,
    private tableFacade: TableManagementFacade,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.viewModel$ = this.loadSeccion3UseCase.execute();
    this.cargarFotografias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  actualizarDatos(): void {
    this.viewModel$ = this.loadSeccion3UseCase.execute();
    this.cdRef.markForCheck();
  }

  // Backward compatibility methods for template
  getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return 'manual';
  }

  formatearParrafo(texto: string): string {
    return texto || '';
  }

  obtenerFuentesSecundarias(): string[] {
    return [];
  }

  obtenerIntroFuentes(): string {
    return '';
  }

  cargarFotografias(): void {
    // Mock implementation - in real app would load from service
    this.fotografiasSeccion3 = [];
  }

  obtenerTextoSeccion3Metodologia(): string {
    return '';
  }

  obtenerTextoSeccion3FuentesPrimarias(): string {
    return '';
  }

  obtenerTextoSeccion3FuentesSecundarias(): string {
    return '';
  }

  obtenerListaFuentesSecundarias(): string[] {
    return [];
  }

  actualizarFuenteSecundaria(index: number, valor: string): void {
    // Implementation would update data through use case
  }

  eliminarFuenteSecundaria(index: number): void {
    // Implementation would update data through use case
  }

  agregarFuenteSecundaria(): void {
    // Implementation would update data through use case
  }

  obtenerTablaEntrevistados(): any[] {
    return [];
  }

  onTablaUpdated(): void {
    this.cdRef.detectChanges();
  }

  // New methods for Clean Architecture
  onDataUpdate(updates: Partial<Seccion3Data>): void {
    this.updateSeccion3DataUseCase.execute(updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Data updated successfully
        this.cdRef.detectChanges();
      });
  }

  onFieldChange(field: keyof Seccion3Data, value: any): void {
    this.onDataUpdate({ [field]: value });
  }

  onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasSeccion3 = fotografias;
    // Update data through use case if needed
    this.cdRef.detectChanges();
  }

  // Backward compatibility getters for template
  get datos(): any {
    // This would be replaced with proper ViewModel access
    return {};
  }

  get columnasEntrevistados(): any[] {
    return [
      { field: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre completo' },
      { field: 'cargo', label: 'Cargo', type: 'text', placeholder: 'Cargo o función' },
      { field: 'organizacion', label: 'Organización', type: 'text', placeholder: 'Organización' }
    ];
  }
}

