import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { LoadSeccion29UseCase, UpdateSeccion29DataUseCase, Seccion29ViewModel } from '../../../core/application/use-cases';
import { Seccion29Data } from '../../../core/domain/entities';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';

@Component({
  selector: 'app-seccion29',
  templateUrl: './seccion29.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ImageUploadComponent,
    ParagraphEditorComponent,
    GenericTableComponent,
    CoreSharedModule
  ],
  standalone: true
})
export class Seccion29Component implements OnInit, OnDestroy {
  @Input() seccionId: string = '3.1.4.B.1.8';
  @Input() modoFormulario: boolean = false;

  viewModel$!: Observable<Seccion29ViewModel>;
  private subscriptions: Subscription[] = [];

  readonly PHOTO_PREFIX = 'fotografiaCahuachoB18';
  fotografiasInstitucionalidad: FotoItem[] = [];

  // Form data
  centroPobladoAISI: string = '';
  natalidadMortalidadCpTabla: any[] = [];
  morbilidadCpTabla: any[] = [];
  afiliacionSaludTabla: any[] = [];
  textoNatalidadCP1: string = '';
  textoNatalidadCP2: string = '';
  textoMorbilidadCP: string = '';
  textoAfiliacionSalud: string = '';

  constructor(
    private loadSeccion29UseCase: LoadSeccion29UseCase,
    private updateSeccion29DataUseCase: UpdateSeccion29DataUseCase,
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
    this.viewModel$ = this.loadSeccion29UseCase.execute();
    const subscription = this.viewModel$.subscribe(viewModel => {
      this.centroPobladoAISI = viewModel.data.centroPobladoAISI || '';
      this.natalidadMortalidadCpTabla = viewModel.data.natalidadMortalidadCpTabla || [];
      this.morbilidadCpTabla = viewModel.data.morbilidadCpTabla || [];
      this.afiliacionSaludTabla = viewModel.data.afiliacionSaludTabla || [];
      this.textoNatalidadCP1 = viewModel.data.textoNatalidadCP1 || '';
      this.textoNatalidadCP2 = viewModel.data.textoNatalidadCP2 || '';
      this.textoMorbilidadCP = viewModel.data.textoMorbilidadCP || '';
      this.textoAfiliacionSalud = viewModel.data.textoAfiliacionSalud || '';
      this.cdRef.detectChanges();
    });
    this.subscriptions.push(subscription);
  }

  private loadFotografias(): void {
    // TODO: Implement photo loading using PhotoService
    this.fotografiasInstitucionalidad = [];
  }

  onCentroPobladoChange(value: string): void {
    this.centroPobladoAISI = value;
    this.updateData();
  }

  onNatalidadMortalidadTablaChange(tabla: any[]): void {
    this.natalidadMortalidadCpTabla = tabla;
    this.updateData();
  }

  onMorbilidadTablaChange(tabla: any[]): void {
    this.morbilidadCpTabla = tabla;
    this.updateData();
  }

  onAfiliacionSaludTablaChange(tabla: any[]): void {
    this.afiliacionSaludTabla = tabla;
    this.updateData();
  }

  onTextoNatalidadCP1Change(value: string): void {
    this.textoNatalidadCP1 = value;
    this.updateData();
  }

  onTextoNatalidadCP2Change(value: string): void {
    this.textoNatalidadCP2 = value;
    this.updateData();
  }

  onTextoMorbilidadChange(value: string): void {
    this.textoMorbilidadCP = value;
    this.updateData();
  }

  onTextoAfiliacionSaludChange(value: string): void {
    this.textoAfiliacionSalud = value;
    this.updateData();
  }

  private updateData(): void {
    const updates: Partial<Seccion29Data> = {
      centroPobladoAISI: this.centroPobladoAISI,
      natalidadMortalidadCpTabla: this.natalidadMortalidadCpTabla,
      morbilidadCpTabla: this.morbilidadCpTabla,
      afiliacionSaludTabla: this.afiliacionSaludTabla,
      textoNatalidadCP1: this.textoNatalidadCP1,
      textoNatalidadCP2: this.textoNatalidadCP2,
      textoMorbilidadCP: this.textoMorbilidadCP,
      textoAfiliacionSalud: this.textoAfiliacionSalud
    };

    this.updateSeccion29DataUseCase.execute(updates).subscribe();
  }

  // Backward compatibility methods
  get datos(): any {
    return {
      centroPobladoAISI: this.centroPobladoAISI,
      natalidadMortalidadCpTabla: this.natalidadMortalidadCpTabla,
      morbilidadCpTabla: this.morbilidadCpTabla,
      afiliacionSaludTabla: this.afiliacionSaludTabla,
      textoNatalidadCP1: this.textoNatalidadCP1,
      textoNatalidadCP2: this.textoNatalidadCP2,
      textoMorbilidadCP: this.textoMorbilidadCP,
      textoAfiliacionSalud: this.textoAfiliacionSalud
    };
  }

  get fotografiasInstitucionalidadCache(): FotoItem[] {
    return this.fotografiasInstitucionalidad;
  }

  // Template helper methods
  getNatalidad2023(): number {
    const item = this.natalidadMortalidadCpTabla.find((item: any) => item.anio === 2023);
    return item?.natalidad || 0;
  }

  getNatalidad2024(): number {
    const item = this.natalidadMortalidadCpTabla.find((item: any) => item.anio === 2024);
    return item?.natalidad || 0;
  }

  getMortalidad2023(): number {
    const item = this.natalidadMortalidadCpTabla.find((item: any) => item.anio === 2023);
    return item?.mortalidad || 0;
  }

  getMortalidad2024(): number {
    const item = this.natalidadMortalidadCpTabla.find((item: any) => item.anio === 2024);
    return item?.mortalidad || 0;
  }

  getNatalidadMortalidadSinTotal(): any[] {
    return this.natalidadMortalidadCpTabla.filter((item: any) =>
      !item.anio?.toString().toLowerCase().includes('total')
    );
  }

  getTotalNatalidadMortalidad(): any {
    return this.natalidadMortalidadCpTabla.find((item: any) =>
      item.anio?.toString().toLowerCase().includes('total')
    ) || { anio: 'Total', natalidad: 0, mortalidad: 0 };
  }

  getCasosInfeccionesRespiratorias(): number {
    const item = this.morbilidadCpTabla.find((item: any) =>
      item.grupo?.toString().toLowerCase().includes('infecciones')
    );
    return item?.casos || 0;
  }

  getCasosObesidad(): number {
    const item = this.morbilidadCpTabla.find((item: any) =>
      item.grupo?.toString().toLowerCase().includes('obesidad')
    );
    return item?.casos || 0;
  }

  getMorbilidadSinTotal(): any[] {
    return this.morbilidadCpTabla.filter((item: any) =>
      !item.grupo?.toString().toLowerCase().includes('total')
    );
  }

  getTotalMorbilidadRango0_11(): number {
    return this.morbilidadCpTabla
      .filter((item: any) => !item.grupo?.toString().toLowerCase().includes('total'))
      .reduce((sum: number, item: any) => sum + (item.edad0_11 || 0), 0);
  }

  getTotalMorbilidadRango12_17(): number {
    return this.morbilidadCpTabla
      .filter((item: any) => !item.grupo?.toString().toLowerCase().includes('total'))
      .reduce((sum: number, item: any) => sum + (item.edad12_17 || 0), 0);
  }

  getTotalMorbilidadRango18_29(): number {
    return this.morbilidadCpTabla
      .filter((item: any) => !item.grupo?.toString().toLowerCase().includes('total'))
      .reduce((sum: number, item: any) => sum + (item.edad18_29 || 0), 0);
  }

  getTotalMorbilidadRango30_59(): number {
    return this.morbilidadCpTabla
      .filter((item: any) => !item.grupo?.toString().toLowerCase().includes('total'))
      .reduce((sum: number, item: any) => sum + (item.edad30_59 || 0), 0);
  }

  getTotalMorbilidadRango60_mas(): number {
    return this.morbilidadCpTabla
      .filter((item: any) => !item.grupo?.toString().toLowerCase().includes('total'))
      .reduce((sum: number, item: any) => sum + (item.edad60_mas || 0), 0);
  }

  getTotalMorbilidadCasos(): number {
    return this.morbilidadCpTabla
      .filter((item: any) => !item.grupo?.toString().toLowerCase().includes('total'))
      .reduce((sum: number, item: any) => sum + (item.casos || 0), 0);
  }

  getPorcentajeSIS(): string {
    const item = this.afiliacionSaludTabla.find((item: any) =>
      item.categoria?.toString().toLowerCase().includes('sis')
    );
    return item?.porcentaje || '0,00 %';
  }

  getPorcentajeESSALUD(): string {
    const item = this.afiliacionSaludTabla.find((item: any) =>
      item.categoria?.toString().toLowerCase().includes('essalud')
    );
    return item?.porcentaje || '0,00 %';
  }

  getPorcentajeSinSeguro(): string {
    const item = this.afiliacionSaludTabla.find((item: any) =>
      item.categoria?.toString().toLowerCase().includes('sin seguro')
    );
    return item?.porcentaje || '0,00 %';
  }

  getAfiliacionSaludAISIConPorcentajes(): any[] {
    return this.afiliacionSaludTabla.map((item: any) => ({
      ...item,
      porcentaje: item.porcentaje || '0,00 %'
    }));
  }

  getAfiliacionSaludSinTotal(): any[] {
    return this.afiliacionSaludTabla.filter((item: any) =>
      !item.categoria?.toString().toLowerCase().includes('total')
    );
  }

  getTotalAfiliacionSalud(): any {
    return this.afiliacionSaludTabla.find((item: any) =>
      item.categoria?.toString().toLowerCase().includes('total')
    ) || { categoria: 'Total', casos: 0, porcentaje: '0,00 %' };
  }

  getFotografiasVista(): FotoItem[] {
    return this.fotografiasInstitucionalidad;
  }

  obtenerTextoNatalidadCP1(): string {
    return this.textoNatalidadCP1;
  }

  obtenerTextoNatalidadCP2(): string {
    return this.textoNatalidadCP2;
  }

  obtenerTextoMorbilidadCP(): string {
    return this.textoMorbilidadCP;
  }

  obtenerTextoAfiliacionSalud(): string {
    return this.textoAfiliacionSalud;
  }

  // Placeholder methods for template compatibility
  onFieldChange(field: string, value: any, options?: any): void {
    // This method is called from template but we handle changes through specific methods
  }

  natalidadMortalidadConfig: any = {};
  columnasNatalidadMortalidad: any[] = [];
  onTablaUpdated(): void {}

  morbilidadConfig: any = {};
  columnasMorbilidad: any[] = [];
  onMorbilidadFieldChange(index: number, field: string, value: any): void {}
  onMorbilidadTableUpdated(): void {}

  afiliacionSaludConfig: any = {};
  columnasAfiliacionSalud: any[] = [];
  onAfiliacionSaludTableUpdated(): void {}

  fotografiasFormMulti: FotoItem[] = [];
  onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasInstitucionalidad = fotografias;
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
}
