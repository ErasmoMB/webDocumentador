import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { LoadSeccion30UseCase, UpdateSeccion30DataUseCase, Seccion30ViewModel } from '../../../core/application/use-cases';
import { Seccion30Data } from '../../../core/domain/entities';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';

@Component({
  selector: 'app-seccion30',
  templateUrl: './seccion30.component.html',
  imports: [
    CommonModule,
    FormsModule,
    GenericTableComponent,
    DynamicTableComponent,
    ParagraphEditorComponent,
    ImageUploadComponent,
    CoreSharedModule
  ],
  standalone: true
})
export class Seccion30Component implements OnInit, OnDestroy {
  @Input() seccionId: string = '3.1.4.B.1.9';
  @Input() modoFormulario: boolean = false;

  viewModel$!: Observable<Seccion30ViewModel>;
  private subscriptions: Subscription[] = [];

  readonly PHOTO_PREFIX_CAHUACHO_B19 = 'fotografiaCahuachoB19';
  readonly PHOTO_PREFIX = 'fotografiaCahuachoB19';
  fotografiasCahuachoB19FormMulti: FotoItem[] = [];

  // Form data - properties that will be populated from ViewModel
  centroPobladoAISI: string = '';
  parrafoSeccion30_indicadores_educacion_intro: string = '';
  nivelEducativoTabla: any[] = [];
  tasaAnalfabetismoTabla: any[] = [];
  textoNivelEducativo: string = '';
  textoTasaAnalfabetismo: string = '';

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
    private cdRef: ChangeDetectorRef,
    private projectFacade: ProjectStateFacade
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadFotografias();
    this.logGrupoActual();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadData(): void {
    this.viewModel$ = this.loadSeccion30UseCase.execute();
    const subscription = this.viewModel$.subscribe(viewModel => {
      this.centroPobladoAISI = viewModel.data.centroPobladoAISI || '';
      this.parrafoSeccion30_indicadores_educacion_intro = viewModel.data.parrafoSeccion30_indicadores_educacion_intro || '';
      this.nivelEducativoTabla = viewModel.data.nivelEducativoTabla || [];
      this.tasaAnalfabetismoTabla = viewModel.data.tasaAnalfabetismoTabla || [];
      this.textoNivelEducativo = viewModel.data.textoNivelEducativo || '';
      this.textoTasaAnalfabetismo = viewModel.data.textoTasaAnalfabetismo || '';
      this.cdRef.detectChanges();
    });
    this.subscriptions.push(subscription);
  }

  private loadFotografias(): void {
    // TODO: Implement photo loading using PhotoService
    this.fotografiasCahuachoB19FormMulti = [];
  }

  private logGrupoActual(): void {
    const match = this.seccionId.match(/^3\.1\.4\.B\.(\d+)/);
    if (!match) return;
    
    const numeroGrupo = parseInt(match[1], 10);
    const datos = this.projectFacade.obtenerDatos();
    
    const distritos = datos['distritosAISI'] || [];
    if (distritos.length === 0) {
      console.log('%c⚠️ No hay distritos cargados. Verifica que hayas cargado un JSON en sección 1.', 'color: #f59e0b; font-weight: bold');
      return;
    }
    
    const distritoActual = distritos[numeroGrupo - 1];
    if (!distritoActual) {
      console.log(`%c⚠️ No existe distrito B.${numeroGrupo}. Distritos disponibles: ${distritos.length}`, 'color: #f59e0b; font-weight: bold');
      return;
    }
    
    console.clear();
    console.log(`%c[DEBUG AISI] Analizando sección ${this.seccionId}`, 'color: #666; font-size: 12px');
    console.log(`%c🗺️ GRUPO AISI: B.${numeroGrupo} - ${distritoActual.nombre || 'Sin nombre'}`, 'color: #dc2626; font-weight: bold; font-size: 14px');
    console.log(`%cCentros Poblados (CCPP):`, 'color: #b91c1c; font-weight: bold');
    
    const centrosPobladosSeleccionados = distritoActual.centrosPobladosSeleccionados || [];
    if (centrosPobladosSeleccionados.length === 0) {
      console.log('  (Sin centros poblados asignados)');
      return;
    }
    
    const jsonCompleto = datos['jsonCompleto'] || {};
    const centrosDetalles: any[] = [];
    
    centrosPobladosSeleccionados.forEach((codigo: any) => {
      let encontrado = false;
      Object.keys(jsonCompleto).forEach((grupoKey: string) => {
        const grupoData = jsonCompleto[grupoKey];
        if (Array.isArray(grupoData)) {
          const centro = grupoData.find((c: any) => {
            const codigoCentro = String(c.CODIGO || '').trim();
            const codigoBuscado = String(codigo).trim();
            return codigoCentro === codigoBuscado;
          });
          if (centro && !encontrado) {
            centrosDetalles.push(centro);
            encontrado = true;
          }
        }
      });
    });
    
    if (centrosDetalles.length > 0) {
      centrosDetalles.forEach((cp: any, index: number) => {
        const nombre = cp.CCPP || cp.nombre || `CCPP ${index + 1}`;
        console.log(`  ${index + 1}. ${nombre} (Código: ${cp.CODIGO})`);
      });
    }
  }

  get datos(): any {
    return {
      centroPobladoAISI: this.centroPobladoAISI,
      parrafoSeccion30_indicadores_educacion_intro: this.parrafoSeccion30_indicadores_educacion_intro,
      nivelEducativoTabla: this.nivelEducativoTabla,
      tasaAnalfabetismoTabla: this.tasaAnalfabetismoTabla,
      textoNivelEducativo: this.textoNivelEducativo,
      textoTasaAnalfabetismo: this.textoTasaAnalfabetismo
    };
  }

  get fotografiasInstitucionalidadCache(): FotoItem[] {
    return this.fotografiasCahuachoB19FormMulti;
  }

  // Template helper methods
  onFieldChange(field: string, value: any): void {
    this.updateSeccion30DataUseCase.execute({ [field]: value }).subscribe();
  }

  onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasCahuachoB19FormMulti = fotografias;
    this.updateSeccion30DataUseCase.execute({
      fotografiasCahuachoB19: fotografias
    }).subscribe();
  }

  onNivelEducativoTableUpdated(): void {
    this.updateSeccion30DataUseCase.execute({
      nivelEducativoTabla: this.nivelEducativoTabla
    }).subscribe();
  }

  onTasaAnalfabetismoTableUpdated(): void {
    this.updateSeccion30DataUseCase.execute({
      tasaAnalfabetismoTabla: this.tasaAnalfabetismoTabla
    }).subscribe();
  }
}

