import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion14',
  templateUrl: './seccion14.component.html',
  styleUrls: ['./seccion14.component.css']
})
export class Seccion14Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'parrafoSeccion14_indicadores_educacion_intro', 'nivelEducativoTabla', 'tasaAnalfabetismoTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaEducacionIndicadores';

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

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
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

  getPorcentajePrimaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const primaria = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('primaria')
    );
    return primaria?.porcentaje || '____';
  }

  getPorcentajeSecundaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const secundaria = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('secundaria')
    );
    return secundaria?.porcentaje || '____';
  }

  getPorcentajeSuperiorNoUniversitaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const superiorNoUniv = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('superior no universitaria') || item.categoria.toLowerCase().includes('superior no universitaria'))
    );
    return superiorNoUniv?.porcentaje || '____';
  }

  getTasaAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const noSabeLeer = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && (item.indicador.toLowerCase().includes('no sabe') || item.indicador.toLowerCase().includes('no puede'))
    );
    return noSabeLeer?.porcentaje || '____';
  }

  getCasosAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const noSabeLeer = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && (item.indicador.toLowerCase().includes('no sabe') || item.indicador.toLowerCase().includes('no puede'))
    );
    return noSabeLeer?.casos || '____';
  }

  getFotografiasEducacionIndicadoresVista(): FotoItem[] {
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

  obtenerTextoSeccion14IndicadoresEducacionIntro(): string {
    if (this.datos.parrafoSeccion14_indicadores_educacion_intro) {
      return this.datos.parrafoSeccion14_indicadores_educacion_intro;
    }
    return `La educación es un pilar fundamental para el desarrollo social y económico de una comunidad. En ese sentido, los indicadores de educación juegan un papel crucial al proporcionar una visión clara del estado actual del sistema educativo y su impacto en la población. Este apartado se centra en dos indicadores clave: el nivel educativo de la población y la tasa de analfabetismo. El análisis de estos indicadores permite comprender mejor las fortalezas y desafíos del sistema educativo local, así como diseñar estrategias efectivas para mejorar la calidad educativa y reducir las desigualdades en el acceso a la educación.`;
  }

  inicializarNivelEducativo() {
    if (!this.datos['nivelEducativoTabla'] || this.datos['nivelEducativoTabla'].length === 0) {
      this.datos['nivelEducativoTabla'] = [
        { categoria: 'Sin nivel o Inicial', casos: 0, porcentaje: '0%' },
        { categoria: 'Primaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Secundaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Superior no Universitaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Superior Universitaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarNivelEducativo() {
    if (!this.datos['nivelEducativoTabla']) {
      this.inicializarNivelEducativo();
    }
    const totalIndex = this.datos['nivelEducativoTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['nivelEducativoTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['nivelEducativoTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarNivelEducativo(index: number) {
    if (this.datos['nivelEducativoTabla'] && this.datos['nivelEducativoTabla'].length > 1) {
      const item = this.datos['nivelEducativoTabla'][index];
      if (item.categoria !== 'Total') {
        this.datos['nivelEducativoTabla'].splice(index, 1);
        this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNivelEducativo(index: number, field: string, value: any) {
    if (!this.datos['nivelEducativoTabla']) {
      this.inicializarNivelEducativo();
    }
    if (this.datos['nivelEducativoTabla'][index]) {
      this.datos['nivelEducativoTabla'][index][field] = value;
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  inicializarTasaAnalfabetismo() {
    if (!this.datos['tasaAnalfabetismoTabla'] || this.datos['tasaAnalfabetismoTabla'].length === 0) {
      this.datos['tasaAnalfabetismoTabla'] = [
        { indicador: 'Sabe leer y escribir', casos: 0, porcentaje: '0%' },
        { indicador: 'No sabe leer ni escribir', casos: 0, porcentaje: '0%' },
        { indicador: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarTasaAnalfabetismo() {
    if (!this.datos['tasaAnalfabetismoTabla']) {
      this.inicializarTasaAnalfabetismo();
    }
    const totalIndex = this.datos['tasaAnalfabetismoTabla'].findIndex((item: any) => item.indicador === 'Total');
    if (totalIndex >= 0) {
      this.datos['tasaAnalfabetismoTabla'].splice(totalIndex, 0, { indicador: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['tasaAnalfabetismoTabla'].push({ indicador: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarTasaAnalfabetismo(index: number) {
    if (this.datos['tasaAnalfabetismoTabla'] && this.datos['tasaAnalfabetismoTabla'].length > 1) {
      const item = this.datos['tasaAnalfabetismoTabla'][index];
      if (item.indicador !== 'Total') {
        this.datos['tasaAnalfabetismoTabla'].splice(index, 1);
        this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarTasaAnalfabetismo(index: number, field: string, value: any) {
    if (!this.datos['tasaAnalfabetismoTabla']) {
      this.inicializarTasaAnalfabetismo();
    }
    if (this.datos['tasaAnalfabetismoTabla'][index]) {
      this.datos['tasaAnalfabetismoTabla'][index][field] = value;
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }
}

