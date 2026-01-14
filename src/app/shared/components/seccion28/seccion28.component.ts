import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion28',
  templateUrl: './seccion28.component.html',
  styleUrls: ['./seccion28.component.css']
})
export class Seccion28Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  fotografiasInstitucionalidadCache: any[] = [];
  private datosAnteriores: any = {};
  watchedFields: string[] = ['centroPobladoAISI', 'puestoSaludCpTabla', 'educacionCpTabla'];

  constructor(
    private formularioService: FormularioService,
    private fieldMapping: FieldMappingService,
    private sectionDataLoader: SectionDataLoaderService,
    private imageService: ImageManagementService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    this.loadSectionData();
    this.actualizarFotografiasCache();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seccionId']) {
      this.actualizarDatos();
      this.loadSectionData();
    }
  }

  ngDoCheck() {
    const datosActuales = this.formularioService.obtenerDatos();
    const centroPobladoAISIActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'centroPobladoAISI', this.seccionId);
    const centroPobladoAISIAnterior = this.datosAnteriores.centroPobladoAISI || null;
    const centroPobladoAISIEnDatos = this.datos.centroPobladoAISI || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (centroPobladoAISIActual !== centroPobladoAISIAnterior || centroPobladoAISIActual !== centroPobladoAISIEnDatos || hayCambios) {
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    this.actualizarValoresConPrefijo();
    this.actualizarFotografiasCache();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = JSON.parse(JSON.stringify((this.datos as any)[campo] || null));
    });
    this.cdRef.detectChanges();
  }

  actualizarValoresConPrefijo() {
    const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centroPobladoAISI || null;
    this.datosAnteriores.centroPobladoAISI = centroPobladoAISI || null;
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

  getFotoSalud(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaSaludAISITitulo'] || 'Infraestructura del Puesto de Salud ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaSaludAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaSaludAISIImagen'] || '';
    
    return {
      numero: '3. 34',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotografiasEducacion(): any[] {
    const fotos: any[] = [];
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    
    const foto1 = {
      numero: '3. 35',
      titulo: this.datos?.['fotografiaEducacion1AISITitulo'] || 'Infraestructura de la IE ' + centroPobladoAISI,
      fuente: this.datos?.['fotografiaEducacion1AISIFuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaEducacion1AISIImagen'] || ''
    };
    
    const foto2 = {
      numero: '3. 36',
      titulo: this.datos?.['fotografiaEducacion2AISITitulo'] || 'Infraestructura de la IE N°40271',
      fuente: this.datos?.['fotografiaEducacion2AISIFuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaEducacion2AISIImagen'] || ''
    };
    
    const foto3 = {
      numero: '3. 37',
      titulo: this.datos?.['fotografiaEducacion3AISITitulo'] || 'Infraestructura de la IE Virgen de Copacabana',
      fuente: this.datos?.['fotografiaEducacion3AISIFuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaEducacion3AISIImagen'] || ''
    };
    
    if (foto1.ruta || foto2.ruta || foto3.ruta) {
      if (foto1.ruta) fotos.push(foto1);
      if (foto2.ruta) fotos.push(foto2);
      if (foto3.ruta) fotos.push(foto3);
    }
    
    return fotos;
  }

  getFotoRecreacion(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaRecreacionAISITitulo'] || 'Plaza de toros del CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaRecreacionAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaRecreacionAISIImagen'] || '';
    
    return {
      numero: '3. 39',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoDeporte(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaDeporteAISITitulo'] || 'Losa deportiva en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaDeporteAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaDeporteAISIImagen'] || '';
    
    return {
      numero: '3. 40',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.7');
    return this.imageService.loadImages(
      '3.1.4.B.1.7',
      'fotografiaCahuachoB17',
      groupPrefix
    );
  }
}

