import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion1Component } from '../seccion1/seccion1.component';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { GruposService } from 'src/app/core/services/domain/grupos.service';
import { Injector } from '@angular/core';
import { Subscription } from 'rxjs';

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
  private stateAdapter: ReactiveStateAdapter;

  constructor(
    private formChange: FormChangeService,
    private gruposService: GruposService,
    private injector: Injector,
    private cdRef: ChangeDetectorRef
  ) {
    this.projectFacade = this.injector.get(ProjectStateFacade);
    this.stateAdapter = this.injector.get(ReactiveStateAdapter);
    this.actualizarDatos();
  }

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
    this.centrosPobladosJSON = datos['centrosPobladosJSON'] || [];
    this.geoInfo = datos['geoInfo'] || {};
    this.jsonFileName = datos['jsonFileName'] || '';
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    // ✅ Actualizar localmente PRIMERO para sincronización inmediata
    this.formData[fieldId] = valorLimpio;
    
    // ✅ Persistir en background (no bloquea la UI)
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
    
    // ✅ NO llamar actualizarDatos() aquí - ya tenemos el valor actualizado localmente
    // Esto evita el problema de leer un valor desactualizado del storage
  }

  onJSONFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        const { data, geoInfo, fileName, comunidadesCampesinas, jsonCompleto } = this.procesarJSON(jsonContent, file.name);
        
        // ✅ NUEVO: Cargar en GruposService para sistema AISD/AISI
        this.gruposService.cargarCentrosPobladosDesdeJSON(jsonContent);
        const totalCCPP = this.gruposService.getCentrosPoblados().length;
        // ✅ [Sección 1] totalCCPP centros poblados cargados en GruposService desde file.name
        
        // Persistir centros poblados JSON directamente usando formChange
        const updates: Record<string, any> = {
          centrosPobladosJSON: data,
          jsonCompleto,
          geoInfo,
          jsonFileName: fileName
        };

        if (comunidadesCampesinas && comunidadesCampesinas.length > 0) {
          updates['comunidadesCampesinas'] = comunidadesCampesinas;
        }

        if (geoInfo.DPTO) {
          updates['departamentoSeleccionado'] = geoInfo.DPTO;
        }
        if (geoInfo.PROV) {
          updates['provinciaSeleccionada'] = geoInfo.PROV;
        }
        if (geoInfo.DIST) {
          updates['distritoSeleccionado'] = geoInfo.DIST;
        }

        this.formChange.persistFields(this.seccionId, 'form', updates);
        
        // ✅ Actualizar estado local del formulario para reflejar los cambios inmediatamente
        this.centrosPobladosJSON = data;
        this.geoInfo = geoInfo;
        this.jsonFileName = fileName;
        this.formData = { ...this.formData, ...updates };
        
        // ✅ Forzar detección de cambios ya que estamos dentro de FileReader callback
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

  private procesarJSON(jsonContent: any, fileName: string): { 
    data: any[], 
    geoInfo: any, 
    fileName: string, 
    comunidadesCampesinas?: any[],
    jsonCompleto?: any
  } {
    let centrosPoblados: any[] = [];
    let geoInfo: any = {};
    let comunidadesCampesinas: any[] = [];
    let jsonCompleto: any = null;
    
    if (Array.isArray(jsonContent)) {
      centrosPoblados = jsonContent;
      jsonCompleto = jsonContent;
    } else if (typeof jsonContent === 'object') {
      jsonCompleto = jsonContent;
      const keys = Object.keys(jsonContent);
      
      if (keys.length > 0) {
        for (const grupoKey of keys) {
          const grupoData = jsonContent[grupoKey];
          
          if (Array.isArray(grupoData)) {
            const centrosGrupo = grupoData;
            centrosPoblados = centrosPoblados.concat(centrosGrupo);
            
            const codigosGrupo = centrosGrupo
              .map((cp: any) => {
                const codigo = cp.CODIGO;
                if (codigo === null || codigo === undefined) return '';
                return codigo.toString().trim();
              })
              .filter((codigo: string) => codigo !== '');
            
            let nombreComunidad = grupoKey;
            if (nombreComunidad.toUpperCase().startsWith('CCPP ')) {
              nombreComunidad = nombreComunidad.substring(5).trim();
            }
            
            const comunidadId = `cc_${nombreComunidad.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
            comunidadesCampesinas.push({
              id: comunidadId,
              nombre: nombreComunidad,
              centrosPobladosSeleccionados: codigosGrupo
            });
          }
        }
      }
    }
    
    if (centrosPoblados.length > 0) {
      const primer = centrosPoblados[0];
      if (primer.DPTO) geoInfo.DPTO = primer.DPTO;
      if (primer.PROV) geoInfo.PROV = primer.PROV;
      if (primer.DIST) geoInfo.DIST = primer.DIST;
    }
    
    return { 
      data: centrosPoblados, 
      geoInfo, 
      fileName, 
      comunidadesCampesinas: comunidadesCampesinas.length > 0 ? comunidadesCampesinas : undefined,
      jsonCompleto
    };
  }
}
