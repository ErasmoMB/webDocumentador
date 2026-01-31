import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, effect, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion1Component } from '../seccion1/seccion1.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { GruposService } from 'src/app/core/services/domain/grupos.service';
import { Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { UIStoreService } from 'src/app/core/state/ui-store.contract';
import { createJSONProcessingBatch, validateJSONStructure, getJSONStats } from 'src/app/core/services/data/json-normalizer';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, CoreSharedModule, Seccion1Component],
    selector: 'app-seccion1-form-wrapper',
    templateUrl: './seccion1-form-wrapper.component.html',
    styleUrls: ['./seccion1-form-wrapper.component.css']
})
export class Seccion1FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  
  formData: any = {};
  jsonFileName: string = '';
  centrosPobladosJSON: any[] = [];
  geoInfo: any = {};
  private subscription?: Subscription;

  private projectFacade: ProjectStateFacade;
  private store: UIStoreService;

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly jsonFileNameSignal: Signal<string>;
  readonly centrosPobladosJSONSignal: Signal<any[]>;
  readonly geoInfoSignal: Signal<any>;

  constructor(
    private formChange: FormChangeService,
    private gruposService: GruposService,
    private injector: Injector,
    private cdRef: ChangeDetectorRef,
    store: UIStoreService
  ) {
    this.projectFacade = this.injector.get(ProjectStateFacade);
    this.store = store;

    this.formDataSignal = computed(() => {
      return this.projectFacade.selectSectionFields(this.seccionId, null)();
    });

    this.jsonFileNameSignal = computed(() => {
      const value = this.projectFacade.selectField(this.seccionId, null, 'jsonFileName')();
      return value || '';
    });

    this.centrosPobladosJSONSignal = computed(() => {
      const value = this.projectFacade.selectField(this.seccionId, null, 'centrosPobladosJSON')();
      return Array.isArray(value) ? value : [];
    });

    this.geoInfoSignal = computed(() => {
      const value = this.projectFacade.selectField(this.seccionId, null, 'geoInfo')();
      return value || {};
    });

    effect(() => {
      const formData = this.formDataSignal();
      const jsonFileName = this.jsonFileNameSignal();
      const centrosPobladosJSON = this.centrosPobladosJSONSignal();
      const geoInfo = this.geoInfoSignal();

      this.formData = { ...formData };
      this.jsonFileName = jsonFileName;
      this.centrosPobladosJSON = [...centrosPobladosJSON];
      this.geoInfo = { ...geoInfo };
      
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
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
  }

  onJSONFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        
        const validation = validateJSONStructure(jsonContent);
        if (!validation.valid) {
          alert(validation.error || 'Error al procesar el archivo JSON. Verifique el formato.');
          return;
        }

        const { batch, result } = createJSONProcessingBatch(jsonContent, {
          fileName: file.name,
          transactionId: `json_upload_${Date.now()}`
        });

        if (batch) {
          this.store.dispatch(batch);
          
          setTimeout(() => {
            try {
              this.projectFacade.aisdGroups();
              this.projectFacade.aisiGroups();
            } catch (error) {
              // Silently handle error
            }
          }, 100);
          
          this.projectFacade.initializeSectionsTree();
        }

        const rawData = result.rawData || [];
        const ubicacion = result.ubicacion;
        
        this.gruposService.cargarCentrosPobladosDesdeJSON(jsonContent);
        
        const updates: Record<string, any> = {
          centrosPobladosJSON: rawData,
          jsonCompleto: jsonContent,
          jsonFileName: file.name
        };

        if (ubicacion) {
          const geoInfo: any = {};
          if (ubicacion.departamento) {
            geoInfo.DPTO = ubicacion.departamento;
            updates['departamentoSeleccionado'] = ubicacion.departamento;
          }
          if (ubicacion.provincia) {
            geoInfo.PROV = ubicacion.provincia;
            updates['provinciaSeleccionada'] = ubicacion.provincia;
          }
          if (ubicacion.distrito) {
            geoInfo.DIST = ubicacion.distrito;
            updates['distritoSeleccionado'] = ubicacion.distrito;
          }
          updates['geoInfo'] = geoInfo;
          this.geoInfo = geoInfo;
        }

        this.formChange.persistFields(this.seccionId, 'form', updates);
        
        this.centrosPobladosJSON = [...rawData];
        this.jsonFileName = file.name;
        this.formData = { ...this.formData, ...updates };
        
        this.cdRef.detectChanges();
        
      } catch (error) {
        alert('Error al procesar el archivo JSON. Verifique el formato.');
      }
    };
    
    reader.readAsText(file);
  }


  selectJSONFile() {
    const fileInput = document.getElementById('jsonFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
