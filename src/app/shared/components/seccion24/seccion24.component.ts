import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion24',
  templateUrl: './seccion24.component.html',
  styleUrls: ['./seccion24.component.css']
})
export class Seccion24Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'actividadesEconomicasAISI', 'ciudadOrigenComercio'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB13';
  
  fotografiasActividadesEconomicasCache: any[] = [];
  fotografiasMercadoCache: any[] = [];
  fotografiasInstitucionalidadCache: any[] = [];

  actividadesEconomicasConfig: TableConfig = {
    tablaKey: 'actividadesEconomicasAISI',
    totalKey: 'actividad',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ actividad: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, null as any, cdRef);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
  }

  protected override detectarCambios(): boolean {
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
      return true;
    }
    
    return false;
  }

  protected override actualizarDatos(): void {
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

  protected override actualizarValoresConPrefijo(): void {
    const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centroPobladoAISI || null;
    this.datosAnteriores.centroPobladoAISI = centroPobladoAISI || null;
  }

  protected override tieneFotografias(): boolean {
    return true;
  }

  override actualizarFotografiasCache() {
    this.fotografiasActividadesEconomicasCache = this.getFotografiasActividadesEconomicas();
    this.fotografiasMercadoCache = this.getFotografiasMercado();
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
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

  getFotografiasActividadesEconomicasParaImageUpload(): FotoItem[] {
    return this.fotografiasActividadesEconomicasCache.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.ruta
    }));
  }

  getFotografiasMercadoParaImageUpload(): FotoItem[] {
    return this.fotografiasMercadoCache.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.ruta
    }));
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
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  obtenerTextoActividadesEconomicasAISI(): string {
    return this.datos.textoActividadesEconomicasAISI || '';
  }
}

