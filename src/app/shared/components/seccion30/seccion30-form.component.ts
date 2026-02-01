import { Component, Input, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/core/services/table-management.service';

@Component({
  selector: 'app-seccion30-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  templateUrl: './seccion30-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion30FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.9';
  @Input() override modoFormulario: boolean = false;

  private stateSubscription?: Subscription;
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB19';
  override fotografiasCache: FotoItem[] = [];

  override watchedFields: string[] = [
    'centroPobladoAISI',
    'parrafoSeccion30_indicadores_educacion_intro',
    'nivelEducativoTabla',
    'tasaAnalfabetismoTabla',
    'textoNivelEducativo',
    'textoTasaAnalfabetismo'
  ];

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
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private stateAdapter: ReactiveStateAdapter
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();

    if (this.modoFormulario) {
      this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  protected detectarCambios(): boolean {
    return false;
  }

  protected actualizarValoresConPrefijo(): void {
    // No-op for this component
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  protected getSectionKey(): string {
    return 'seccion30_aisi';
  }

  onNivelEducativoTableUpdated(): void {
    this.actualizarDatos();
  }

  onTasaAnalfabetismoTableUpdated(): void {
    this.actualizarDatos();
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasCache = fotografias;
    this.actualizarDatos();
  }
}
