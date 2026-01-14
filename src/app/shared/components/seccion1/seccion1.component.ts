import { Component, OnInit, OnDestroy, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { TextNormalizationService } from 'src/app/core/services/text-normalization.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { FormularioDatos } from 'src/app/core/models/formulario.model';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion1',
  templateUrl: './seccion1.component.html',
  styleUrls: ['./seccion1.component.css']
})
export class Seccion1Component implements OnInit, OnDestroy, DoCheck {
  datos: FormularioDatos = {} as FormularioDatos;
  private datosAnteriores: any = {};
  private subscription?: Subscription;
  seccionId: string = '3.1.1';
  fotografiasSeccion1: FotoItem[] = [];
  watchedFields: string[] = [
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
    private formularioService: FormularioService,
    private textNormalization: TextNormalizationService,
    private fieldMapping: FieldMappingService,
    private sectionDataLoader: SectionDataLoaderService,
    private imageService: ImageManagementService,
    private photoNumberingService: PhotoNumberingService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    this.loadSectionData();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngDoCheck() {
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

    if (hayCambios) {
      this.actualizarDatos();
      if (necesitaRecargar) {
        this.loadSectionData();
      }
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    this.datos = this.formularioService.obtenerDatos();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
    this.cargarFotografias();
    this.cdRef.detectChanges();
  }

  private loadSectionData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (fieldsToLoad.length > 0) {
      this.sectionDataLoader.loadSectionData(this.seccionId, fieldsToLoad).subscribe();
    }
  }

  getDataSourceType(fieldName: string): 'manual' | 'automatic' | 'section' {
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

  obtenerPrefijoGrupo(): string {
    return '';
  }

  cargarFotografias(): void {
    this.fotografiasSeccion1 = this.imageService.loadImages(
      this.seccionId,
      'fotografiaSeccion1'
    );
  }
}

