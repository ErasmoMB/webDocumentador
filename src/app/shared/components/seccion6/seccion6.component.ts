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
  selector: 'app-seccion6',
  templateUrl: './seccion6.component.html',
  styleUrls: ['./seccion6.component.css']
})
export class Seccion6Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'poblacionSexoAISD', 'poblacionEtarioAISD'];
  
  override readonly PHOTO_PREFIX = 'fotografiaDemografia';

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
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos) {
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  getPorcentajeHombres(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '____';
    }
    const hombres = this.datos.poblacionSexoAISD.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('hombre') || item.sexo.toLowerCase().includes('varon'))
    );
    return hombres?.porcentaje || '____';
  }

  getPorcentajeMujeres(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '____';
    }
    const mujeres = this.datos.poblacionSexoAISD.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('mujer') || item.sexo.toLowerCase().includes('femenin'))
    );
    return mujeres?.porcentaje || '____';
  }

  getPorcentajeGrupoEtario(categoria: string): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '____';
    }
    
    const grupo = this.datos.poblacionEtarioAISD.find((item: any) => {
      if (!item.categoria) return false;
      const itemCategoria = item.categoria.toLowerCase();
      const buscarCategoria = categoria.toLowerCase();
      
      if (buscarCategoria.includes('15 a 29')) {
        return itemCategoria.includes('15') && itemCategoria.includes('29');
      } else if (buscarCategoria.includes('0 a 14')) {
        return itemCategoria.includes('0') && (itemCategoria.includes('14') || itemCategoria.includes('menor'));
      } else if (buscarCategoria.includes('65')) {
        return itemCategoria.includes('65') || itemCategoria.includes('mayor');
      }
      
      return itemCategoria.includes(buscarCategoria);
    });
    
    return grupo?.porcentaje || '____';
  }

  getGrupoEtarioMayoritario(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '15 a 29 años';
    }
    
    let mayorPorcentaje = 0;
    let grupoMayoritario = '15 a 29 años';
    
    this.datos.poblacionEtarioAISD.forEach((item: any) => {
      if (item.porcentaje) {
        const porcentajeNum = parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim());
        if (!isNaN(porcentajeNum) && porcentajeNum > mayorPorcentaje) {
          mayorPorcentaje = porcentajeNum;
          grupoMayoritario = item.categoria || '15 a 29 años';
        }
      }
    });
    
    return grupoMayoritario;
  }

  getGrupoEtarioSegundo(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '0 a 14 años';
    }
    
    const gruposOrdenados = [...this.datos.poblacionEtarioAISD]
      .filter((item: any) => item.porcentaje && item.categoria)
      .map((item: any) => ({
        categoria: item.categoria,
        porcentaje: parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim())
      }))
      .filter((item: any) => !isNaN(item.porcentaje))
      .sort((a: any, b: any) => b.porcentaje - a.porcentaje);
    
    return gruposOrdenados.length > 1 ? gruposOrdenados[1].categoria : '0 a 14 años';
  }

  getGrupoEtarioMenoritario(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '65 años a más';
    }
    
    let menorPorcentaje = Infinity;
    let grupoMenoritario = '65 años a más';
    
    this.datos.poblacionEtarioAISD.forEach((item: any) => {
      if (item.porcentaje) {
        const porcentajeNum = parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim());
        if (!isNaN(porcentajeNum) && porcentajeNum < menorPorcentaje) {
          menorPorcentaje = porcentajeNum;
          grupoMenoritario = item.categoria || '65 años a más';
        }
      }
    });
    
    return grupoMenoritario;
  }

  getTotalPoblacionSexo(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '0';
    }
    const total = this.datos.poblacionSexoAISD.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalPoblacionEtario(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '0';
    }
    const total = this.datos.poblacionEtarioAISD.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  override obtenerPrefijoGrupo(): string {
    if (this.seccionId === '3.1.4.A.1.2' || this.seccionId.startsWith('3.1.4.A.1.')) return '_A1';
    if (this.seccionId === '3.1.4.A.2.2' || this.seccionId.startsWith('3.1.4.A.2.')) return '_A2';
    if (this.seccionId === '3.1.4.B.1.2' || this.seccionId.startsWith('3.1.4.B.1.')) return '_B1';
    if (this.seccionId === '3.1.4.B.2.2' || this.seccionId.startsWith('3.1.4.B.2.')) return '_B2';
    return '';
  }

  getFotografiasDemografiaVista(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaDemografia${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaDemografia${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Demografía';
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaDemografia${i}Fuente`];
        const fuente = fuenteConPrefijo || fuenteSinPrefijo || 'GEADES, 2024';
        fotografias.push({ imagen, titulo, fuente });
      }
    }
    return fotografias;
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.obtenerPrefijoGrupo();
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.obtenerPrefijoGrupo();
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

  inicializarPoblacionSexo() {
    if (!this.datos['poblacionSexoAISD'] || this.datos['poblacionSexoAISD'].length === 0) {
      this.datos['poblacionSexoAISD'] = [
        { sexo: 'Hombres', casos: 0, porcentaje: '0%' },
        { sexo: 'Mujeres', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('poblacionSexoAISD', this.datos['poblacionSexoAISD']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  inicializarPoblacionEtario() {
    if (!this.datos['poblacionEtarioAISD'] || this.datos['poblacionEtarioAISD'].length === 0) {
      this.datos['poblacionEtarioAISD'] = [
        { categoria: '0 a 14 años', casos: 0, porcentaje: '0%' },
        { categoria: '15 a 29 años', casos: 0, porcentaje: '0%' },
        { categoria: '30 a 44 años', casos: 0, porcentaje: '0%' },
        { categoria: '45 a 64 años', casos: 0, porcentaje: '0%' },
        { categoria: '65 años a más', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('poblacionEtarioAISD', this.datos['poblacionEtarioAISD']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarPoblacionSexo(index: number, field: string, value: any) {
    if (!this.datos['poblacionSexoAISD']) {
      this.inicializarPoblacionSexo();
    }
    if (this.datos['poblacionSexoAISD'][index]) {
      this.datos['poblacionSexoAISD'][index][field] = value;
      if (field === 'casos' && this.datos['tablaAISD2TotalPoblacion']) {
        const total = parseInt(this.datos['tablaAISD2TotalPoblacion']) || 0;
        if (total > 0) {
          const casos = parseInt(value) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2) + '%';
          this.datos['poblacionSexoAISD'][index].porcentaje = porcentaje;
        }
      }
      this.formularioService.actualizarDato('poblacionSexoAISD', this.datos['poblacionSexoAISD']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarPoblacionEtario(index: number, field: string, value: any) {
    if (!this.datos['poblacionEtarioAISD']) {
      this.inicializarPoblacionEtario();
    }
    if (this.datos['poblacionEtarioAISD'][index]) {
      this.datos['poblacionEtarioAISD'][index][field] = value;
      if (field === 'casos' && this.datos['tablaAISD2TotalPoblacion']) {
        const total = parseInt(this.datos['tablaAISD2TotalPoblacion']) || 0;
        if (total > 0) {
          const casos = parseInt(value) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2) + '%';
          this.datos['poblacionEtarioAISD'][index].porcentaje = porcentaje;
        }
      }
      this.formularioService.actualizarDato('poblacionEtarioAISD', this.datos['poblacionEtarioAISD']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }
}

