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
  selector: 'app-seccion20',
  templateUrl: './seccion20.component.html',
  styleUrls: ['./seccion20.component.css']
})
export class Seccion20Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'sitioArqueologico', 'festividades', 'textoFestividades'];
  
  override readonly PHOTO_PREFIX = 'fotografiaFestividades';

  festividadesConfig: TableConfig = {
    tablaKey: 'festividades',
    totalKey: 'festividad',
    campoTotal: 'festividad',
    campoPorcentaje: 'fecha',
    estructuraInicial: [{ festividad: '', fecha: '' }]
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

  protected override onInitCustom(): void {
    if (this.modoFormulario) {
      if (this.seccionId) {
        setTimeout(() => {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }, 0);
      }
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        if (this.seccionId) {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }
      });
    } else {
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

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasFestividadesVista(): FotoItem[] {
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

  onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
  }

  obtenerTextoFestividades(): string {
    if (this.datos.textoFestividades && this.datos.textoFestividades !== '____') {
      return this.datos.textoFestividades;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
    const sitioArqueologico = this.datos.sitioArqueologico || 'Incahuasi';
    
    return `En la CC ${grupoAISD}, las festividades son momentos de gran importancia cultural y social que refuerzan los lazos comunitarios y mantienen vivas las tradiciones locales. Entre las celebraciones más destacadas se encuentran los carnavales, que tienen lugar en el mes de febrero. Esta festividad está marcada por el entusiasmo de la población, quienes participan en juegos con agua y desfiles.\n\nOtra celebración significativa es la dedicada a la Virgen de Chapi, que se lleva a cabo cada 1° de mayo. En esta fecha, los devotos organizan misas solemnes, procesiones en honor a la Virgen y actividades sociales que congregan a familias locales y visitantes. Del 3 al 5 de mayo, se celebra la Fiesta de las Cruces, en la que se realizan ceremonias religiosas, procesiones y actividades tradicionales, como la tauromaquia, acompañadas por grupos musicales que animan el ambiente.\n\nEn junio, el calendario festivo incluye dos importantes celebraciones: la festividad de San Vicente Ferrer (que es la fiesta patronal principal de la comunidad), que se realiza del 21 al 23 de junio, y el aniversario de la comunidad, celebrado el 24 de junio con actos protocolares, actividades culturales y sociales. Ambas fechas están caracterizadas por su componente religioso, con misas y procesiones, además de eventos que integran a toda la comunidad.\n\nUna festividad de gran relevancia ambiental y cultural es el Chaku, o esquila de vicuñas, una actividad tradicional vinculada al aprovechamiento sostenible de esta especie emblemática de los Andes. Aunque las fechas de esta celebración suelen variar, se tiene la propuesta de realizarla cada 15 de noviembre, coincidiendo con el Día de la Vicuña. Durante el Chaku, además de la esquila, se realizan actividades culturales, ceremonias andinas y eventos de integración comunitaria.\n\nEn cuanto al potencial turístico, la CC ${grupoAISD} destaca no solo por sus festividades tradicionales, sino también por las ruinas arqueológicas de ${sitioArqueologico}, un sitio de valor histórico y cultural. Este lugar, que guarda vestigios del pasado incaico, representa una oportunidad para atraer visitantes interesados en la historia, la arqueología y el turismo vivencial. La promoción de este recurso puede complementar las festividades y posicionar a la comunidad como un destino atractivo para el turismo sostenible, generando beneficios económicos y culturales para sus habitantes.`;
  }
}

