import { Component, Input, ChangeDetectorRef, OnDestroy, SimpleChanges } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { StateService } from 'src/app/core/services/state.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion3',
  templateUrl: './seccion3.component.html',
  styleUrls: ['./seccion3.component.css']
})
export class Seccion3Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.3';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccion3';
  
  fotografiasSeccion3: FotoItem[] = [];
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = [
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

  entrevistadosConfig: TableConfig = {
    tablaKey: 'entrevistados',
    totalKey: 'nombre',
    campoTotal: 'nombre',
    campoPorcentaje: 'cargo',
    estructuraInicial: [{ nombre: '', cargo: '', organizacion: '' }]
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
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  override ngOnDestroy() {
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
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      
      let haCambiado = false;
      if (Array.isArray(valorActual) || Array.isArray(valorAnterior)) {
        haCambiado = JSON.stringify(valorActual) !== JSON.stringify(valorAnterior);
      } else if (typeof valorActual === 'object' && valorActual !== null || typeof valorAnterior === 'object' && valorAnterior !== null) {
        haCambiado = JSON.stringify(valorActual) !== JSON.stringify(valorAnterior);
      } else {
        haCambiado = valorActual !== valorAnterior;
      }
      
      if (haCambiado) {
        hayCambios = true;
        if (Array.isArray(valorActual)) {
          this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
        } else if (typeof valorActual === 'object' && valorActual !== null) {
          this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
        } else {
          this.datosAnteriores[campo] = valorActual;
        }
      }
    }

    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    this.watchedFields.forEach(campo => {
      const valor = (this.datos as any)[campo] || null;
      if (Array.isArray(valor)) {
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valor));
      } else if (typeof valor === 'object' && valor !== null) {
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valor));
      } else {
        this.datosAnteriores[campo] = valor;
      }
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

  obtenerFuentesSecundarias(): string[] {
    return this.datos.fuentesSecundariasLista || [];
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasSeccion3 = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = this.fotografiasSeccion3;
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      fotografias,
      groupPrefix
    );
    this.fotografiasSeccion3 = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.fotografiasFormMulti = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion3Metodologia(): string {
    if (this.datos.parrafoSeccion3_metodologia) {
      return this.datos.parrafoSeccion3_metodologia;
    }
    
    return 'Para la descripción del aspecto socioeconómico se ha utilizado una combinación de métodos y técnicas cualitativas de investigación social, entre ellas se ha seleccionado las técnicas de entrevistas semiestructuradas con autoridades locales y/o informantes calificados, así como de encuestas de carácter socioeconómico. Además de ello, se ha recurrido a la recopilación de documentos que luego son contrastados y completados con la consulta de diversas fuentes de información oficiales actualizadas respecto al área de influencia social tales como el Censo Nacional INEI (2017), Escale – MINEDU, la base de datos de la Oficina General de Estadística e Informática del Ministerio de Salud, entre otros.';
  }

  obtenerTextoSeccion3FuentesPrimarias(): string {
    if (this.datos.parrafoSeccion3_fuentes_primarias) {
      return this.datos.parrafoSeccion3_fuentes_primarias;
    }
    
    const cantidadEntrevistas = this.datos.cantidadEntrevistas || '____';
    return `Dentro de las fuentes primarias se consideran a las autoridades comunales y locales, así como pobladores que fueron entrevistados y proporcionaron información cualitativa y cuantitativa. Esta información de primera mano muestra datos fidedignos que proporcionan un alcance más cercano de la realidad en la que se desarrollan las poblaciones del área de influencia social. Para la obtención de información cualitativa, se realizaron un total de ${cantidadEntrevistas} entrevistas en profundidad a informantes calificados y autoridades locales.`;
  }

  obtenerTextoSeccion3FuentesSecundarias(): string {
    if (this.datos.parrafoSeccion3_fuentes_secundarias) {
      return this.datos.parrafoSeccion3_fuentes_secundarias;
    }
    
    return 'En la elaboración de la LBS se utilizó información cuantitativa de fuentes secundarias provenientes de fuentes oficiales, entre las que se encuentran las siguientes:';
  }

  obtenerListaFuentesSecundarias(): string[] {
    return this.datos.fuentesSecundariasLista || [];
  }

  actualizarFuenteSecundaria(index: number, valor: string): void {
    const lista = [...(this.datos.fuentesSecundariasLista || [])];
    lista[index] = valor;
    this.formularioService.actualizarDato('fuentesSecundariasLista', lista);
    this.actualizarDatos();
  }

  eliminarFuenteSecundaria(index: number): void {
    const lista = [...(this.datos.fuentesSecundariasLista || [])];
    lista.splice(index, 1);
    this.formularioService.actualizarDato('fuentesSecundariasLista', lista);
    this.actualizarDatos();
  }

  agregarFuenteSecundaria(): void {
    const lista = [...(this.datos.fuentesSecundariasLista || [])];
    lista.push('');
    this.formularioService.actualizarDato('fuentesSecundariasLista', lista);
    this.actualizarDatos();
  }

}

