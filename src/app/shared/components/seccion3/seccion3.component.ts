import { Component, OnInit, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion3',
  templateUrl: './seccion3.component.html',
  styleUrls: ['./seccion3.component.css']
})
export class Seccion3Component implements OnInit, DoCheck {
  datos: any = {};
  private datosAnteriores: any = {};
  seccionId: string = '3.1.3';
  fotografiasSeccion3: FotoItem[] = [];
  watchedFields: string[] = [
    'parrafoSeccion3_metodologia',
    'parrafoSeccion3_fuentes_primarias',
    'parrafoSeccion3_fuentes_primarias_cuadro',
    'parrafoSeccion3_fuentes_secundarias',
    'cantidadEntrevistas',
    'fechaTrabajoCampo',
    'consultora',
    'entrevistados',
    'fuentesSecundariasLista'
  ];

  constructor(
    private formularioService: FormularioService,
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

  ngDoCheck() {
    const datosActuales = this.formularioService.obtenerDatos();
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
      }
    }

    if (hayCambios) {
      this.actualizarDatos();
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

  obtenerFuentesSecundarias(): string[] {
    return this.datos.fuentesSecundariasLista || [];
  }

  obtenerPrefijoGrupo(): string {
    return '';
  }

  cargarFotografias(): void {
    this.fotografiasSeccion3 = this.imageService.loadImages(
      this.seccionId,
      'fotografiaSeccion3'
    );
  }
}

