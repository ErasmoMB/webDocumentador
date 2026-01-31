import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion3Component } from './seccion3.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { Seccion3TextGeneratorService } from 'src/app/core/services/seccion3-text-generator.service';
import { Seccion3FuentesManagementService } from 'src/app/core/services/seccion3-fuentes-management.service';
import { Subscription } from 'rxjs';

/**
 * Componente de FORMULARIO para Sección 3
 * Solo formulario completo (párrafos, entrevistados, fuentes, imágenes)
 * Responsabilidad única: Formulario de edición
 */
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
    campoTotal: 'nombre',
    campoPorcentaje: 'cargo',
    estructuraInicial: [{ nombre: '', cargo: '', organizacion: '' }]
  };

  columnasEntrevistados: any[] = [
    { field: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre completo' },
    { field: 'cargo', label: 'Cargo', type: 'text', placeholder: 'Cargo o función' },
    { field: 'organizacion', label: 'Organización', type: 'text', placeholder: 'Organización' }
  ];

  constructor(
    private projectFacade: ProjectStateFacade,
    private stateAdapter: ReactiveStateAdapter,
    private cdRef: ChangeDetectorRef,
    private formChange: FormChangeService,
    private tableFacade: TableManagementFacade,
    private textGenerator: Seccion3TextGeneratorService,
    private fuentesManagement: Seccion3FuentesManagementService
  ) {}

  ngOnInit() {
    // ✅ Solo cargar datos iniciales, NO suscribirse a cambios
    // El formulario ES la fuente de los cambios, no debe reaccionar a ellos
    this.actualizarDatos();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  actualizarDatos() {
    const datos = this.projectFacade.obtenerDatos();
    this.formData = { ...datos };
    this.fuentesSecundarias = this.fuentesManagement.inicializarFuentes(datos);
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
    // ✅ No llamar actualizarDatos() aquí - causa pérdida de caracteres
  }

  obtenerTextoMetodologia(): string {
    return this.textGenerator.obtenerTextoMetodologia(this.formData);
  }

  obtenerTextoFuentesPrimarias(): string {
    return this.textGenerator.obtenerTextoFuentesPrimarias(this.formData);
  }

  obtenerTextoFuentesSecundarias(): string {
    return this.textGenerator.obtenerTextoFuentesSecundarias(this.formData);
  }

  obtenerListaFuentesSecundarias(): string[] {
    return this.fuentesManagement.obtenerFuentes(this.formData);
  }

  actualizarFuenteSecundaria(index: number, valor: string): void {
    this.fuentesManagement.actualizarFuente(index, valor, this.formData);
    setTimeout(() => {
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }, 0);
  }

  eliminarFuenteSecundaria(index: number): void {
    this.fuentesManagement.eliminarFuente(index, this.formData);
    setTimeout(() => {
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }, 0);
  }

  agregarFuenteSecundaria(): void {
    this.fuentesManagement.agregarFuente(this.formData);
    setTimeout(() => {
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }, 0);
  }

  obtenerTablaEntrevistados(): any[] {
    return this.formData.entrevistados || [];
  }

  onTablaUpdated(): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }
}
