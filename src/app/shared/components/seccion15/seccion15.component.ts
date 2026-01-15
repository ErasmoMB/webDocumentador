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
  selector: 'app-seccion15',
  templateUrl: './seccion15.component.html',
  styleUrls: ['./seccion15.component.css']
})
export class Seccion15Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'parrafoSeccion15_religion_completo', 'lenguasMaternasTabla', 'religionesTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaIglesia';

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

  getPorcentajeCastellano(): string {
    if (!this.datos?.lenguasMaternasTabla || !Array.isArray(this.datos.lenguasMaternasTabla)) {
      return '____';
    }
    const castellano = this.datos.lenguasMaternasTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('castellano') || item.categoria.toLowerCase().includes('español'))
    );
    return castellano?.porcentaje || '____';
  }

  getPorcentajeQuechua(): string {
    if (!this.datos?.lenguasMaternasTabla || !Array.isArray(this.datos.lenguasMaternasTabla)) {
      return '____';
    }
    const quechua = this.datos.lenguasMaternasTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('quechua')
    );
    return quechua?.porcentaje || '____';
  }

  override obtenerPrefijoGrupo(): string {
    if (this.seccionId === '3.1.4.A.1.11' || this.seccionId.startsWith('3.1.4.A.1.')) {
      return '_A1';
    } else if (this.seccionId === '3.1.4.A.2.11' || this.seccionId.startsWith('3.1.4.A.2.')) {
      return '_A2';
    } else if (this.seccionId === '3.1.4.B.1.11' || this.seccionId.startsWith('3.1.4.B.1.')) {
      return '_B1';
    } else if (this.seccionId === '3.1.4.B.2.11' || this.seccionId.startsWith('3.1.4.B.2.')) {
      return '_B2';
    }
    return '';
  }

  getFotografiasIglesiaVista(): FotoItem[] {
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

  obtenerTextoSeccion15ReligionCompleto(): string {
    if (this.datos.parrafoSeccion15_religion_completo) {
      return this.datos.parrafoSeccion15_religion_completo;
    }
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    return `La confesión predominante dentro de la CC ${grupoAISD} es el catolicismo. Según las entrevistas, la permanencia del catolicismo como religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz de ${grupoAISD}, y a la no existencia de templos evangélicos u otras confesiones. Esta iglesia es descrita como el principal punto de encuentro religioso para la comunidad y desempeña un papel importante en la vida espiritual de sus habitantes. Otro espacio de valor espiritual es el cementerio, donde los comuneros entierran y visitan a sus difuntos. Este lugar se encuentra ubicado al sur del anexo ${grupoAISD}.`;
  }

  inicializarLenguasMaternas() {
    if (!this.datos['lenguasMaternasTabla'] || this.datos['lenguasMaternasTabla'].length === 0) {
      this.datos['lenguasMaternasTabla'] = [
        { categoria: 'Castellano', casos: 0, porcentaje: '0%' },
        { categoria: 'Quechua', casos: 0, porcentaje: '0%' },
        { categoria: 'No sabe / No responde', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarLenguasMaternas() {
    if (!this.datos['lenguasMaternasTabla']) {
      this.inicializarLenguasMaternas();
    }
    const totalIndex = this.datos['lenguasMaternasTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['lenguasMaternasTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['lenguasMaternasTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarLenguasMaternas(index: number) {
    if (this.datos['lenguasMaternasTabla'] && this.datos['lenguasMaternasTabla'].length > 1) {
      const item = this.datos['lenguasMaternasTabla'][index];
      if (item.categoria !== 'Total') {
        this.datos['lenguasMaternasTabla'].splice(index, 1);
        this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarLenguasMaternas(index: number, field: string, value: any) {
    if (!this.datos['lenguasMaternasTabla']) {
      this.inicializarLenguasMaternas();
    }
    if (this.datos['lenguasMaternasTabla'][index]) {
      this.datos['lenguasMaternasTabla'][index][field] = value;
      this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  inicializarReligiones() {
    if (!this.datos['religionesTabla'] || this.datos['religionesTabla'].length === 0) {
      this.datos['religionesTabla'] = [
        { categoria: 'Católica', casos: 0, porcentaje: '0%' },
        { categoria: 'Evangélica', casos: 0, porcentaje: '0%' },
        { categoria: 'Otra', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarReligiones() {
    if (!this.datos['religionesTabla']) {
      this.inicializarReligiones();
    }
    const totalIndex = this.datos['religionesTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['religionesTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['religionesTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarReligiones(index: number) {
    if (this.datos['religionesTabla'] && this.datos['religionesTabla'].length > 1) {
      const item = this.datos['religionesTabla'][index];
      if (item.categoria !== 'Total') {
        this.datos['religionesTabla'].splice(index, 1);
        this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarReligiones(index: number, field: string, value: any) {
    if (!this.datos['religionesTabla']) {
      this.inicializarReligiones();
    }
    if (this.datos['religionesTabla'][index]) {
      this.datos['religionesTabla'][index][field] = value;
      this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }
}

