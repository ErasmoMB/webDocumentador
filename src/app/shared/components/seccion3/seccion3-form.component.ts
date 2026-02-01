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
      // ✅ Usar selectTableData() para obtener datos de tabla (no selectField())
      const value = this.projectFacade.selectTableData(this.seccionId, null, 'entrevistados')();
      return Array.isArray(value) ? value : [];
    });

    effect(() => {
      const formData = this.formDataSignal();
      const fuentesSecundariasLista = this.fuentesSecundariasListaSignal();
      const entrevistados = this.entrevistadosSignal();
      
      console.log(`🔄 [Seccion3] effect re-ejecutado - fuentesSecundariasLista del signal:`, fuentesSecundariasLista);
      
      const formDataCopy = { ...formData };
      
      // ✅ CRÍTICO: SIEMPRE actualizar desde los signals (prioridad del estado)
      // Esto asegura que los cambios se reflejen inmediatamente
      formDataCopy['entrevistados'] = Array.isArray(entrevistados) && entrevistados.length > 0 
        ? [...entrevistados] 
        : formDataCopy['entrevistados'] || [];
      
      // ✅ SINCRONIZAR FUENTES SECUNDARIAS desde el signal
      formDataCopy['fuentesSecundariasLista'] = Array.isArray(fuentesSecundariasLista) && fuentesSecundariasLista.length > 0
        ? [...fuentesSecundariasLista]
        : [];
      
      console.log(`🔄 [Seccion3] formData.fuentesSecundariasLista actualizado:`, formDataCopy['fuentesSecundariasLista']);
      
      this.formData = formDataCopy;
      this.fuentesSecundarias = this.fuentesManagement.inicializarFuentes(formData);
      
      this.cdRef.markForCheck();
    });
  }

  ngOnInit() {
    // ✅ CRÍTICO: Restaurar datos desde localStorage cuando se inicializa
    console.log(`🔄 [Seccion3FormComponent] ngOnInit() - Restaurando datos desde localStorage`);
    this.formChange.restoreSectionState(this.seccionId, this.formData);
    this.cdRef.markForCheck();
  }

  ngOnDestroy() {
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
    console.log(`📝 [Seccion3] actualizarFuenteSecundaria() - índice: ${index}, valor: "${valor}"`);
    console.log(`📝 [Seccion3] listaActual antes:`, listaActual);
    
    if (listaActual[index] !== valor) {
      listaActual[index] = valor;
      console.log(`📝 [Seccion3] listaActual después:`, listaActual);
      
      this.projectFacade.setField(this.seccionId, null, 'fuentesSecundariasLista', listaActual);
      console.log(`✅ [Seccion3] setField() llamado`);
      
      this.formChange.persistFields(this.seccionId, 'form', { 
        fuentesSecundariasLista: listaActual 
      });
      console.log(`✅ [Seccion3] persistFields() llamado`);
      
      this.cdRef.markForCheck();
      console.log(`✅ [Seccion3] markForCheck() llamado`);
    }
  }

  eliminarFuenteSecundaria(index: number): void {
    const listaActual = [...(this.fuentesSecundariasListaSignal() || [])];
    console.log(`📝 [Seccion3] eliminarFuenteSecundaria() - índice: ${index}`);
    console.log(`📝 [Seccion3] listaActual antes:`, listaActual);
    
    listaActual.splice(index, 1);
    console.log(`📝 [Seccion3] listaActual después:`, listaActual);
    
    this.projectFacade.setField(this.seccionId, null, 'fuentesSecundariasLista', listaActual);
    console.log(`✅ [Seccion3] setField() llamado`);
    
    this.formChange.persistFields(this.seccionId, 'form', { 
      fuentesSecundariasLista: listaActual 
    });
    console.log(`✅ [Seccion3] persistFields() llamado`);
    
    this.cdRef.markForCheck();
    console.log(`✅ [Seccion3] markForCheck() llamado`);
  }

  agregarFuenteSecundaria(): void {
    const listaActual = [...(this.fuentesSecundariasListaSignal() || [])];
    console.log(`📝 [Seccion3] agregarFuenteSecundaria()`);
    console.log(`📝 [Seccion3] listaActual antes:`, listaActual);
    
    listaActual.push('');
    console.log(`📝 [Seccion3] listaActual después:`, listaActual);
    
    this.projectFacade.setField(this.seccionId, null, 'fuentesSecundariasLista', listaActual);
    console.log(`✅ [Seccion3] setField() llamado`);
    
    this.formChange.persistFields(this.seccionId, 'form', { 
      fuentesSecundariasLista: listaActual 
    });
    console.log(`✅ [Seccion3] persistFields() llamado`);
    
    this.cdRef.markForCheck();
    console.log(`✅ [Seccion3] markForCheck() llamado`);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByFuente(index: number, fuente: string): string {
    // Track por el contenido de la fuente, no por índice
    // Esto asegura que Angular re-renderiza correctamente cuando se elimina
    return fuente || `empty-${index}`;
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
    console.log(`📝 [Seccion3] onTablaUpdated() llamado`);
    console.log(`📝 [Seccion3] formData.entrevistados antes:`, this.formData.entrevistados);
    
    setTimeout(() => {
      const entrevistados = this.formData.entrevistados || [];
      console.log(`📝 [Seccion3] entrevistados a guardar:`, entrevistados);
      
      if (Array.isArray(entrevistados)) {
        // ✅ Usar setTableData() para tablas, que es el comando apropiado
        this.projectFacade.setTableData(this.seccionId, null, 'entrevistados', entrevistados);
        console.log(`✅ [Seccion3] setTableData() llamado con ${entrevistados.length} filas`);
        
        // Persistir también en FormularioService (legacy storage)
        this.formChange.persistFields(this.seccionId, 'form', { entrevistados });
        console.log(`✅ [Seccion3] persistFields() llamado`);
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
