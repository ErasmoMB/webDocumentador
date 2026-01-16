import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';

@Component({
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

  constructor(
    private formularioService: FormularioService,
    private stateService: StateService
  ) {
    this.actualizarDatos();
  }

  ngOnInit() {
    this.actualizarDatos();
    this.subscription = this.stateService.datos$.subscribe(datos => {
      if (datos) {
        this.actualizarDatos();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  actualizarDatos() {
    const datos = this.formularioService.obtenerDatos();
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
    this.formData[fieldId] = valorLimpio;
    this.formularioService.actualizarDato(fieldId as any, valorLimpio);
    this.actualizarDatos();
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
        
        this.formularioService.guardarJSON(data);
        this.formularioService.actualizarDato('centrosPobladosJSON', data);
        this.formularioService.actualizarDato('jsonCompleto', jsonCompleto);
        this.formularioService.actualizarDato('geoInfo', geoInfo);
        this.formularioService.actualizarDato('jsonFileName', fileName);
        
        if (comunidadesCampesinas && comunidadesCampesinas.length > 0) {
          this.formularioService.actualizarDato('comunidadesCampesinas', comunidadesCampesinas);
        }
        
        if (geoInfo.DPTO) {
          this.formularioService.actualizarDato('departamentoSeleccionado', geoInfo.DPTO);
        }
        if (geoInfo.PROV) {
          this.formularioService.actualizarDato('provinciaSeleccionada', geoInfo.PROV);
        }
        if (geoInfo.DIST) {
          this.formularioService.actualizarDato('distritoSeleccionado', geoInfo.DIST);
        }
        
        this.actualizarDatos();
        
      } catch (error) {
        console.error('Error al procesar JSON:', error);
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
