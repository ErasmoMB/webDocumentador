import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DataSourceDirective } from '../../directives/data-source.directive';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FormularioDatos } from 'src/app/core/models/formulario.model';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        GenericTableComponent,
        CoreSharedModule,
        DataSourceDirective,
    ],
    selector: 'app-seccion36',
    templateUrl: './seccion36.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion36Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: FormularioDatos | null = null;
  private datosAnteriores: any = {};

  constructor(
    private projectFacade: ProjectStateFacade,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seccionId']) {
      this.actualizarDatos();
    }
  }

  ngDoCheck() {
    const datosActuales = this.projectFacade.obtenerDatos() as FormularioDatos;
    const centroPobladoAISIActual = (datosActuales as any)?.centroPobladoAISI || null;
    const centroPobladoAISIAnterior = this.datosAnteriores.centroPobladoAISI || null;
    const centroPobladoAISIEnDatos = (this.datos as any)?.centroPobladoAISI || null;
    
    if (centroPobladoAISIActual !== centroPobladoAISIAnterior || centroPobladoAISIActual !== centroPobladoAISIEnDatos) {
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    const datosNuevos = this.projectFacade.obtenerDatos() as FormularioDatos;
    this.datos = datosNuevos;
    this.actualizarValoresConPrefijo();
    this.cdRef.detectChanges();
  }

  actualizarValoresConPrefijo() {
    if (this.datos) {
      const centroPobladoAISI = (this.datos as any)?.centroPobladoAISI || null;
      (this.datos as any).centroPobladoAISI = centroPobladoAISI;
      this.datosAnteriores.centroPobladoAISI = centroPobladoAISI;
    }
  }

  shouldShowCategoriaCell(index: number): boolean {
    if (!this.datos?.mapaActores || index === 0) return true;
    return this.datos.mapaActores[index].categoria !== this.datos.mapaActores[index - 1].categoria;
  }

  getCategoriaRowSpan(categoria: string): number {
    if (!this.datos?.mapaActores) return 1;
    return this.datos.mapaActores.filter(a => a.categoria === categoria).length;
  }
}

