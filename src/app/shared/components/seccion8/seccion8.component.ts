import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion8',
  templateUrl: './seccion8.component.html',
  styleUrls: ['./seccion8.component.css']
})
export class Seccion8Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'provinciaSeleccionada', 'parrafoSeccion8_ganaderia_completo', 'parrafoSeccion8_agricultura_completo', 'peaOcupacionesTabla', 'poblacionPecuariaTabla', 'caracteristicasAgriculturaTabla'];
  
  readonly PHOTO_PREFIX_GANADERIA = 'fotografiaGanaderia';
  readonly PHOTO_PREFIX_AGRICULTURA = 'fotografiaAgricultura';
  readonly PHOTO_PREFIX_COMERCIO = 'fotografiaComercio';
  
  fotografiasGanaderiaFormMulti: FotoItem[] = [];
  fotografiasAgriculturaFormMulti: FotoItem[] = [];
  fotografiasComercioFormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';

  peaOcupacionesConfig: TableConfig = {
    tablaKey: 'peaOcupacionesTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  poblacionPecuariaConfig: TableConfig = {
    tablaKey: 'poblacionPecuariaTabla',
    totalKey: 'especie',
    campoTotal: 'especie',
    campoPorcentaje: 'cantidadPromedio',
    estructuraInicial: [{ especie: '', cantidadPromedio: '', ventaUnidad: '' }]
  };

  caracteristicasAgriculturaConfig: TableConfig = {
    tablaKey: 'caracteristicasAgriculturaTabla',
    totalKey: 'categoria',
    campoTotal: 'categoria',
    campoPorcentaje: 'detalle',
    estructuraInicial: [{ categoria: '', detalle: '' }]
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService,
    private stateService: StateService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  protected override tieneFotografias(): boolean {
    return false;
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  getPorcentajeOcupacion(categoria: string): string {
    if (!this.datos?.peaOcupacionesTabla || !Array.isArray(this.datos.peaOcupacionesTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupacionesTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasGanaderiaFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_GANADERIA,
      groupPrefix
    );
    this.fotografiasAgriculturaFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_AGRICULTURA,
      groupPrefix
    );
    this.fotografiasComercioFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_COMERCIO,
      groupPrefix
    );
  }

  protected override onInitCustom(): void {
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  onFotografiasGanaderiaChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_GANADERIA, fotografias);
    this.fotografiasGanaderiaFormMulti = [...fotografias];
  }

  onFotografiasAgriculturaChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_AGRICULTURA, fotografias);
    this.fotografiasAgriculturaFormMulti = [...fotografias];
  }

  onFotografiasComercioChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_COMERCIO, fotografias);
    this.fotografiasComercioFormMulti = [...fotografias];
  }

  obtenerTextoSeccion8GanaderiaCompleto(): string {
    if (this.datos.parrafoSeccion8_ganaderia_completo) {
      return this.datos.parrafoSeccion8_ganaderia_completo;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const provincia = this.datos.provinciaSeleccionada || 'Caravelí';
    
    return `En la CC ${grupoAISD}, la ganadería es la actividad económica predominante, con un 80 % de la producción destinada al autoconsumo familiar y un 20 % a la venta, según los entrevistados. Las principales especies que se crían son los vacunos y los ovinos, aunque también se crían caprinos y animales menores como gallinas y cuyes. El precio del ganado en pie varía dependiendo de la especie: los vacunos se venden entre S/. 1 200 y S/. 1 500, los ovinos entre S/. 180 y S/. 200, las gallinas entre S/. 20 y S/. 30, y los cuyes entre S/. 25 y S/. 30.\n\nLa alimentación del ganado se basa principalmente en pasto natural, aunque también se les proporciona pasto cultivable en las temporadas de escasez. Uno de los productos derivados más importantes es el queso, el cual se destina particularmente a la capital provincial de ${provincia} para la venta; también se elabora yogurt, aunque en menor medida.\n\nA pesar de la importancia de esta actividad para la economía local, la ganadería enfrenta diversas problemáticas. Entre las principales están la falta de especialistas en salud veterinaria, así como los desafíos climáticos, especialmente las heladas, que pueden reducir la disponibilidad de pastos y generar pérdidas en los rebaños. Estas dificultades impactan directamente en la productividad y los ingresos de los comuneros ganaderos.`;
  }

  obtenerTextoSeccion8AgriculturaCompleto(): string {
    if (this.datos.parrafoSeccion8_agricultura_completo) {
      return this.datos.parrafoSeccion8_agricultura_completo;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    
    return `En la CC ${grupoAISD}, la agricultura desempeña un papel complementario a la ganadería, y la mayor parte de la producción, cerca de un 95 % según los entrevistados, se destina al autoconsumo, mientras que solo un 5 % se comercializa. Los principales cultivos son la papa, habas, cebada y forraje (como avena y alfalfa), los cuales son esenciales para la dieta de las familias comuneras y en menor medida para la alimentación del ganado. Estos productos se cultivan en pequeñas parcelas, con cada familia disponiendo de un promedio de 1 ½ hectárea de tierra.\n\nEl sistema de riego utilizado en la comunidad es principalmente por gravedad, aprovechando las fuentes de agua disponibles en la zona. Sin embargo, la actividad agrícola enfrenta serios desafíos, como las heladas, que dañan los cultivos durante las temporadas frías, y las sequías, que disminuyen la disponibilidad de agua, afectando la capacidad productiva de las familias. Adicionalmente, se enfrentan plagas y enfermedades como roedores y el gusano blanco. Estas problemáticas, recurrentes en el ciclo agrícola, limitan tanto la cantidad como la calidad de los productos cosechados.`;
  }


  getFotografiasGanaderiaVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_GANADERIA,
      groupPrefix
    );
  }

  getFotografiasAgriculturaVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_AGRICULTURA,
      groupPrefix
    );
  }

  getFotografiasComercioVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_COMERCIO,
      groupPrefix
    );
  }
}

