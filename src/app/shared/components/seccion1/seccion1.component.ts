import { Component, OnDestroy, Input, SimpleChanges, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { TextNormalizationService } from 'src/app/core/services/text-normalization.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { StateService } from 'src/app/core/services/state.service';
import { ChangeDetectorRef } from '@angular/core';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion1',
  templateUrl: './seccion1.component.html',
  styleUrls: ['./seccion1.component.css']
})
export class Seccion1Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.1';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccion1';
  
  fotografiasSeccion1: FotoItem[] = [];
  private subscription?: Subscription;
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = [
    'parrafoSeccion1_principal',
    'parrafoSeccion1_4',
    'objetivoSeccion1_1',
    'objetivoSeccion1_2',
    'projectName',
    'distritoSeleccionado',
    'provinciaSeleccionada',
    'departamentoSeleccionado'
  ];

  constructor(
    formularioService: FormularioService,
    private textNormalization: TextNormalizationService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private stateService: StateService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  override ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['modoFormulario'] && !this.modoFormulario) {
      setTimeout(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    let hayCambios = false;
    let necesitaRecargar = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
        
        if (campo === 'distritoSeleccionado' || campo === 'provinciaSeleccionada' || campo === 'departamentoSeleccionado') {
          necesitaRecargar = true;
        }
      }
    }

    if (necesitaRecargar && hayCambios) {
      this.loadSectionData();
    }

    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
  }

  override getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return this.fieldMapping.getDataSourceType(fieldName);
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  normalizarNombreProyecto(texto: string | undefined | null, conArticulo: boolean = true): string {
    return this.textNormalization.normalizarNombreProyecto(texto, conArticulo);
  }

  capitalizarTexto(texto: string): string {
    return this.textNormalization.capitalizarTexto(texto);
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasSeccion1 = [...fotos];
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      fotografias,
      groupPrefix
    );
    
    this.fotografiasSeccion1 = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.fotografiasFormMulti = [...fotografias];
    
    this.cdRef.detectChanges();
  }

  obtenerTextoParrafoPrincipal(): string {
    if (this.datos.parrafoSeccion1_principal) {
      return this.datos.parrafoSeccion1_principal;
    }
    
    const proyecto = this.datos.projectName || '____';
    const distrito = this.datos.distritoSeleccionado || '____';
    const provincia = this.datos.provinciaSeleccionada || '____';
    const departamento = this.datos.departamentoSeleccionado || '____';
    
    return `Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ${proyecto}, como un patrón de referencia inicial en base a la cual se pueda medir los impactos sobre la población del entorno directo del Proyecto.\n\nEl proyecto ${proyecto} se encuentra ubicado en el distrito de ${distrito}, en la provincia de ${provincia}, en el departamento de ${departamento}, bajo la administración del Gobierno Regional de ${departamento}, en el sur del Perú.\n\nEste estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental, los Términos de Referencia comunes para actividades de exploración minera y la Guía de Relaciones Comunitarias del Ministerio de Energía y Minas (MINEM).`;
  }

  obtenerTextoIntroduccionObjetivos(): string {
    if (this.datos.parrafoSeccion1_4) {
      return this.datos.parrafoSeccion1_4;
    }
    
    return 'Los objetivos de la presente línea de base social (LBS) son los siguientes:';
  }

  obtenerTextoObjetivo1(): string {
    if (this.datos.objetivoSeccion1_1) {
      return this.datos.objetivoSeccion1_1;
    }
    
    const proyecto = this.datos.projectName || '____';
    const proyectoNormalizado = this.textNormalization.normalizarNombreProyecto(proyecto, false);
    
    return `Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera ${proyectoNormalizado}.`;
  }

  obtenerTextoObjetivo2(): string {
    if (this.datos.objetivoSeccion1_2) {
      return this.datos.objetivoSeccion1_2;
    }
    
    return 'Brindar información básica de los poblados comprendidos en el área de influencia social donde se realizará el Proyecto que sirvan de base para poder determinar los posibles impactos sociales a originarse en esta primera etapa de exploración y, por ende, prevenir, reducir o mitigar las consecuencias negativas y potenciar las positivas.';
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
        this.cdRef.detectChanges();
        
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

  llenarDatosPrueba() {
    const datosPrueba = {
      projectName: 'Paka',
      departamentoSeleccionado: 'Arequipa',
      provinciaSeleccionada: 'Caravelí',
      distritoSeleccionado: 'Cahuacho'
    };
    
    Object.keys(datosPrueba).forEach(key => {
      this.formularioService.actualizarDato(key as any, (datosPrueba as any)[key]);
    });
    
    const jsonPrueba = [
      {
        "ITEM": 1,
        "UBIGEO": 40306,
        "CODIGO": 403060001,
        "CCPP": "Cahuacho",
        "CATEGORIA": "Capital distrital",
        "POBLACION": 160,
        "DPTO": "Arequipa",
        "PROV": "Caravelí",
        "DIST": "Cahuacho",
        "ESTE": 663078,
        "NORTE": 8285498,
        "ALTITUD": 3423
      }
    ];
    
    this.formularioService.guardarJSON(jsonPrueba);
    this.formularioService.actualizarDato('centrosPobladosJSON', jsonPrueba);
    this.formularioService.actualizarDato('geoInfo', {
      DPTO: 'Arequipa',
      PROV: 'Caravelí',
      DIST: 'Cahuacho'
    });
    this.formularioService.actualizarDato('jsonFileName', 'datos_prueba.json');
    
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }
}

