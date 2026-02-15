import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DataSourceDirective } from '../../directives/data-source.directive';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FormularioDatos } from 'src/app/core/models/formulario.model';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        GenericTableComponent,
        CoreSharedModule,
        DataSourceDirective,
    ],
    selector: 'app-seccion31',
    templateUrl: './seccion31.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion31Component implements OnInit, OnChanges, DoCheck {
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

  getFotografiasAspectosCulturalesParaImageUpload(): FotoItem[] {
    const fotografias = this.datos?.['fotografiasAspectosCulturales'] || [];
    return fotografias.map((f: any) => ({
      titulo: f.titulo || '',
      fuente: f.fuente || '',
      imagen: f.ruta || f.imagen || ''
    })).filter((f: FotoItem) => f.imagen && f.imagen.trim() !== '');
  }
}

