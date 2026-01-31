import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, effect, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion3Component } from './seccion3.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { Seccion3TextGeneratorService } from 'src/app/core/services/seccion3-text-generator.service';
import { Seccion3FuentesManagementService } from 'src/app/core/services/seccion3-fuentes-management.service';
import { Subscription } from 'rxjs';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule,
        Seccion3Component
    ],
    selector: 'app-seccion3-form',
    templateUrl: './seccion3-form.component.html'
})
export class Seccion3FormComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  @ViewChild(Seccion3Component) seccion3Component!: Seccion3Component;
  
  formData: any = {};
  fuentesSecundarias: string[] = [];
  private subscription?: Subscription;

  entrevistadosConfig: TableConfig = {
    tablaKey: 'entrevistados',
    totalKey: 'nombre',
    estructuraInicial: [{ nombre: '', cargo: '', organizacion: '' }]
  };

  columnasEntrevistados: any[] = [
    { field: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre completo' },
    { field: 'cargo', label: 'Cargo', type: 'text', placeholder: 'Cargo o función' },
    { field: 'organizacion', label: 'Organización', type: 'text', placeholder: 'Organización' }
  ];

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly fuentesSecundariasListaSignal: Signal<string[]>;
  readonly entrevistadosSignal: Signal<any[]>;

  constructor(
    private projectFacade: ProjectStateFacade,
    private cdRef: ChangeDetectorRef,
    private formChange: FormChangeService,
    private tableFacade: TableManagementFacade,
    private textGenerator: Seccion3TextGeneratorService,
    private fuentesManagement: Seccion3FuentesManagementService
  ) {
    this.formDataSignal = computed(() => {
      return this.projectFacade.selectSectionFields(this.seccionId, null)();
    });

    this.fuentesSecundariasListaSignal = computed(() => {
      const value = this.projectFacade.selectField(this.seccionId, null, 'fuentesSecundariasLista')();
      return Array.isArray(value) ? value : [];
    });

    this.entrevistadosSignal = computed(() => {
      const value = this.projectFacade.selectField(this.seccionId, null, 'entrevistados')();
      return Array.isArray(value) ? value : [];
    });

    effect(() => {
      const formData = this.formDataSignal();
      const fuentesSecundariasLista = this.fuentesSecundariasListaSignal();
      const entrevistados = this.entrevistadosSignal();
      
      const formDataCopy = { ...formData };
      
      const entrevistadosLocales = this.formData?.['entrevistados'];
      if (Array.isArray(entrevistadosLocales) && entrevistadosLocales.length > 0) {
        formDataCopy['entrevistados'] = [...entrevistadosLocales];
      } else if (Array.isArray(entrevistados) && entrevistados.length > 0) {
        formDataCopy['entrevistados'] = [...entrevistados];
      }
      
      this.formData = formDataCopy;
      this.fuentesSecundarias = this.fuentesManagement.inicializarFuentes(formData);
      
      this.cdRef.markForCheck();
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    this.projectFacade.setField(this.seccionId, null, fieldId, valorLimpio);
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
    this.cdRef.markForCheck();
  }

  obtenerTextoMetodologia(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoMetodologia(formData);
  }

  obtenerTextoFuentesPrimarias(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoFuentesPrimarias(formData);
  }

  obtenerTextoFuentesSecundarias(): string {
    const formData = this.formDataSignal();
    return this.textGenerator.obtenerTextoFuentesSecundarias(formData);
  }

  obtenerListaFuentesSecundarias(): string[] {
    return this.fuentesSecundariasListaSignal();
  }

  actualizarFuenteSecundaria(index: number, valor: string): void {
    const listaActual = [...(this.fuentesSecundariasListaSignal() || [])];
    if (listaActual[index] !== valor) {
      listaActual[index] = valor;
      this.projectFacade.setField(this.seccionId, null, 'fuentesSecundariasLista', listaActual);
      this.formChange.persistFields(this.seccionId, 'form', { 
        fuentesSecundariasLista: listaActual 
      });
      this.cdRef.markForCheck();
    }
  }

  eliminarFuenteSecundaria(index: number): void {
    const listaActual = [...(this.fuentesSecundariasListaSignal() || [])];
    listaActual.splice(index, 1);
    this.projectFacade.setField(this.seccionId, null, 'fuentesSecundariasLista', listaActual);
    this.formChange.persistFields(this.seccionId, 'form', { 
      fuentesSecundariasLista: listaActual 
    });
    this.cdRef.markForCheck();
  }

  agregarFuenteSecundaria(): void {
    const listaActual = [...(this.fuentesSecundariasListaSignal() || [])];
    listaActual.push('');
    this.projectFacade.setField(this.seccionId, null, 'fuentesSecundariasLista', listaActual);
    this.formChange.persistFields(this.seccionId, 'form', { 
      fuentesSecundariasLista: listaActual 
    });
    this.cdRef.markForCheck();
  }

  trackByIndex(index: number): number {
    return index;
  }

  obtenerTablaEntrevistados(): any[] {
    return this.entrevistadosSignal();
  }

  /**
   * Sincroniza formData desde el store (útil tras "Llenar datos" para que el cuadro del formulario se actualice de inmediato).
   */
  sincronizarDesdeStore(): void {
    const formData = this.formDataSignal();
    const entrevistados = this.entrevistadosSignal();
    const fuentesLista = this.fuentesSecundariasListaSignal();
    this.formData = { ...formData };
    if (Array.isArray(entrevistados)) {
      this.formData['entrevistados'] = [...entrevistados];
    }
    this.fuentesSecundarias = Array.isArray(fuentesLista) ? [...fuentesLista] : [];
    this.cdRef.markForCheck();
  }

  onTablaUpdated(): void {
    setTimeout(() => {
      const entrevistados = this.formData.entrevistados || [];
      if (Array.isArray(entrevistados)) {
        this.projectFacade.setField(this.seccionId, null, 'entrevistados', entrevistados);
        this.formChange.persistFields(this.seccionId, 'form', { entrevistados });
      }
      this.cdRef.markForCheck();
    }, 0);
  }

  onFotografiasChange(fotos: any[]): void {
    if (this.seccion3Component) {
      this.seccion3Component.onFotografiasChange(fotos);
    }
  }

  get photoPrefix(): string {
    return this.seccion3Component?.PHOTO_PREFIX || 'fotografiaSeccion3';
  }

  get key(): number {
    return Date.now();
  }

  get fotografias(): any[] {
    return this.seccion3Component?.fotografiasSeccion3 || [];
  }
}
