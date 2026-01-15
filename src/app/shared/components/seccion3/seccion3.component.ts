import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion3',
  templateUrl: './seccion3.component.html',
  styleUrls: ['./seccion3.component.css']
})
export class Seccion3Component extends BaseSectionComponent {
  @Input() override seccionId: string = '3.1.3';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccion3';
  
  fotografiasSeccion3: FotoItem[] = [];
  
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

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected detectarCambios(): boolean {
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

    return hayCambios;
  }

  protected actualizarValoresConPrefijo(): void {
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
  }

  override getDataSourceType(fieldName: string): 'manual' | 'automatic' | 'section' {
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

  agregarEntrevistado() {
    if (!this.datos.entrevistados) {
      this.datos.entrevistados = [];
    }
    this.datos.entrevistados.push({ nombre: '', cargo: '', organizacion: '' });
    this.formularioService.actualizarDato('entrevistados', this.datos.entrevistados);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarEntrevistado(index: number) {
    if (this.datos.entrevistados && this.datos.entrevistados.length > 0) {
      this.datos.entrevistados.splice(index, 1);
      this.formularioService.actualizarDato('entrevistados', this.datos.entrevistados);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarEntrevistado(index: number, campo: string, value: string) {
    if (!this.datos.entrevistados) {
      this.datos.entrevistados = [];
    }
    if (!this.datos.entrevistados[index]) {
      this.datos.entrevistados[index] = { nombre: '', cargo: '', organizacion: '' };
    }
    (this.datos.entrevistados[index] as any)[campo] = value;
    this.formularioService.actualizarDato('entrevistados', this.datos.entrevistados);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }
}

