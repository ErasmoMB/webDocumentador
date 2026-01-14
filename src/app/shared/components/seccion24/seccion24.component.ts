import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion24',
  templateUrl: './seccion24.component.html',
  styleUrls: ['./seccion24.component.css']
})
export class Seccion24Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  fotografiasActividadesEconomicasCache: any[] = [];
  fotografiasMercadoCache: any[] = [];
  fotografiasInstitucionalidadCache: any[] = [];
  private datosAnteriores: any = {};
  watchedFields: string[] = ['centroPobladoAISI', 'actividadesEconomicasAISI'];
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
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
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
    const datosAnteriores = JSON.stringify({
      actividades: this.datos?.['fotografiaActividadesEconomicasImagen'],
      mercado: this.datos?.['fotografiaMercadoImagen']
    });
    
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    this.actualizarValoresConPrefijo();
    
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = JSON.parse(JSON.stringify((this.datos as any)[campo] || null));
    });
    
    const datosActuales = JSON.stringify({
      actividades: this.datos?.['fotografiaActividadesEconomicasImagen'],
      mercado: this.datos?.['fotografiaMercadoImagen']
    });
    
    if (datosAnteriores !== datosActuales) {
      this.actualizarFotografiasCache();
      this.cdRef.detectChanges();
    } else {
      this.actualizarFotografiasCache();
    }
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

  actualizarFotografiasCache() {
    this.fotografiasActividadesEconomicasCache = this.getFotografiasActividadesEconomicas();
    this.fotografiasMercadoCache = this.getFotografiasMercado();
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
    this.cdRef.markForCheck();
  }

  getFotografiasActividadesEconomicas(): any[] {
    const fotografias = [];
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `fotografiaActividadesEconomicas${i}Titulo`;
      const fuenteKey = `fotografiaActividadesEconomicas${i}Fuente`;
      const imagenKey = `fotografiaActividadesEconomicas${i}Imagen`;
      
      let titulo = this.datos?.[tituloKey];
      let fuente = this.datos?.[fuenteKey];
      let imagen = this.datos?.[imagenKey];
      
      const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
      if (i === 1) {
        titulo = titulo || this.datos?.['fotografiaActividadesEconomicasTitulo'] || 'Parcelas agrícolas en el CP ' + centroPobladoAISI;
        fuente = fuente || this.datos?.['fotografiaActividadesEconomicasFuente'] || 'GEADES, 2024';
        imagen = imagen || this.datos?.['fotografiaActividadesEconomicasImagen'] || '';
      }
      
      if (imagen && typeof imagen === 'string' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.startsWith('blob:'))) {
        fotografias.push({
          numero: `3. ${25 + i}`,
          titulo: titulo || 'Parcelas agrícolas en el CP ' + centroPobladoAISI,
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    return fotografias;
  }

  getFotografiasMercado(): any[] {
    const fotografias = [];
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `fotografiaMercado${i}Titulo`;
      const fuenteKey = `fotografiaMercado${i}Fuente`;
      const imagenKey = `fotografiaMercado${i}Imagen`;
      
      let titulo = this.datos?.[tituloKey];
      let fuente = this.datos?.[fuenteKey];
      let imagen = this.datos?.[imagenKey];
      
      const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
      if (i === 1) {
        titulo = titulo || this.datos?.['fotografiaMercadoTitulo'] || 'Bodega en el CP ' + centroPobladoAISI;
        fuente = fuente || this.datos?.['fotografiaMercadoFuente'] || 'GEADES, 2024';
        imagen = imagen || this.datos?.['fotografiaMercadoImagen'] || '';
      }
      
      if (imagen && typeof imagen === 'string' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.startsWith('blob:'))) {
        fotografias.push({
          numero: `3. ${35 + i}`,
          titulo: titulo || 'Bodega en el CP ' + centroPobladoAISI,
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    return fotografias;
  }

  getPorcentajeAgricultura(): string {
    if (!this.datos?.actividadesEconomicasAISI || !Array.isArray(this.datos.actividadesEconomicasAISI)) {
      return '____';
    }
    const item = this.datos.actividadesEconomicasAISI.find((item: any) => 
      item.actividad && item.actividad.toLowerCase().includes('agricultura')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeAdministracion(): string {
    if (!this.datos?.actividadesEconomicasAISI || !Array.isArray(this.datos.actividadesEconomicasAISI)) {
      return '____';
    }
    const item = this.datos.actividadesEconomicasAISI.find((item: any) => 
      item.actividad && item.actividad.toLowerCase().includes('administración')
    );
    return item?.porcentaje || '____';
  }

  getFotoActividadesEconomicas(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaActividadesEconomicasTitulo'] || 'Actividades económicas en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaActividadesEconomicasFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaActividadesEconomicasImagen'] || '';
    
    return {
      numero: '3. 26',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoMercado(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaMercadoTitulo'] || 'Comercio en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaMercadoFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaMercadoImagen'] || '';
    
    return {
      numero: '3. 27',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.3');
    return this.imageService.loadImages(
      '3.1.4.B.1.3',
      'fotografiaCahuachoB13',
      groupPrefix
    );
  }
}

