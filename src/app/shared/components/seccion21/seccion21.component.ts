import { Component, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion21',
  templateUrl: './seccion21.component.html',
  styleUrls: ['./seccion21.component.css']
})
export class Seccion21Component implements OnInit, OnDestroy, DoCheck {
  datos: any = {};
  fotografiasCahuachoCache: any[] = [];
  private datosAnteriores: any = {};
  watchedFields: string[] = ['parrafoSeccion21_aisi_intro_completo', 'parrafoSeccion21_centro_poblado_completo', 'centroPobladoAISI', 'provinciaSeleccionada', 'departamentoSeleccionado', 'leyCreacionDistrito', 'fechaCreacionDistrito', 'distritoSeleccionado', 'distritoAnterior', 'origenPobladores1', 'origenPobladores2', 'departamentoOrigen', 'anexosEjemplo', 'ubicacionCpTabla'];

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
    this.actualizarFotografiasCache();
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
  }

  ngOnDestroy() {
  }

  ngDoCheck() {
    const datosActuales = this.formularioService.obtenerDatos();
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (hayCambios) {
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    this.datos = this.formularioService.obtenerDatos();
    this.actualizarFotografiasCache();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = JSON.parse(JSON.stringify((this.datos as any)[campo] || null));
    });
  }

  private loadSectionData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection('3.1.4.B');
    if (fieldsToLoad.length > 0) {
      this.sectionDataLoader.loadSectionData('3.1.4.B', fieldsToLoad).subscribe();
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

  actualizarFotografiasCache() {
    this.fotografiasCahuachoCache = this.getFotografiasCahuachoVista();
  }

  getFotografiasCahuachoVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1');
    return this.imageService.loadImages(
      '3.1.4.B.1',
      'fotografiaCahuacho',
      groupPrefix
    );
  }
}

