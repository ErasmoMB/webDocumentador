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
  selector: 'app-seccion9',
  templateUrl: './seccion9.component.html',
  styleUrls: ['./seccion9.component.css']
})
export class Seccion9Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'condicionOcupacionTabla', 'tiposMaterialesTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaEstructura';

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

  getTotalViviendasEmpadronadas(): string {
    const total = this.datos?.tablaAISD2TotalViviendasEmpadronadas || this.datos?.totalViviendasEmpadronadas || '____';
    return total !== '____' && total !== null && total !== undefined ? total.toString() : '____';
  }

  getViviendasOcupadas(): string {
    const ocupadas = this.datos?.tablaAISD2TotalViviendasOcupadas || this.datos?.totalViviendasOcupadas || '____';
    return ocupadas !== '____' && ocupadas !== null && ocupadas !== undefined ? ocupadas.toString() : '____';
  }

  getPorcentajeViviendasOcupadas(): string {
    const totalEmpadronadas = parseInt(this.datos?.tablaAISD2TotalViviendasEmpadronadas || this.datos?.totalViviendasEmpadronadas || '0') || 0;
    const totalOcupadas = parseInt(this.datos?.tablaAISD2TotalViviendasOcupadas || this.datos?.totalViviendasOcupadas || '0') || 0;
    
    if (totalEmpadronadas === 0) {
      return '____';
    }
    
    const porcentaje = ((totalOcupadas / totalEmpadronadas) * 100).toFixed(2).replace('.', ',') + ' %';
    return porcentaje;
  }

  getPorcentajeMaterial(categoria: string, tipoMaterial: string): string {
    if (!this.datos?.tiposMaterialesTabla || !Array.isArray(this.datos.tiposMaterialesTabla)) {
      return '____';
    }
    const item = this.datos.tiposMaterialesTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase()) &&
      item.tipoMaterial && item.tipoMaterial.toLowerCase().includes(tipoMaterial.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasEstructuraVista(): FotoItem[] {
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

  inicializarCondicionOcupacion() {
    if (!this.datos['condicionOcupacionTabla'] || this.datos['condicionOcupacionTabla'].length === 0) {
      this.datos['condicionOcupacionTabla'] = [
        { categoria: 'Viviendas ocupadas', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas desocupadas', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100%' }
      ];
      this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarCondicionOcupacion() {
    if (!this.datos['condicionOcupacionTabla']) {
      this.inicializarCondicionOcupacion();
    }
    const totalIndex = this.datos['condicionOcupacionTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['condicionOcupacionTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['condicionOcupacionTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarCondicionOcupacion(index: number) {
    if (this.datos['condicionOcupacionTabla'] && this.datos['condicionOcupacionTabla'].length > 1) {
      const item = this.datos['condicionOcupacionTabla'][index];
      if (item.categoria !== 'Total') {
        this.datos['condicionOcupacionTabla'].splice(index, 1);
        this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCondicionOcupacion(index: number, field: string, value: any) {
    if (!this.datos['condicionOcupacionTabla']) {
      this.inicializarCondicionOcupacion();
    }
    if (this.datos['condicionOcupacionTabla'][index]) {
      this.datos['condicionOcupacionTabla'][index][field] = value;
      if (field === 'casos' && this.datos['condicionOcupacionTabla'][index].categoria !== 'Total') {
        const totalCasos = this.datos['condicionOcupacionTabla']
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['condicionOcupacionTabla'].find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  inicializarTiposMateriales() {
    if (!this.datos['tiposMaterialesTabla'] || this.datos['tiposMaterialesTabla'].length === 0) {
      this.datos['tiposMaterialesTabla'] = [
        { categoria: 'Materiales de las paredes', tipoMaterial: 'Adobe', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de las paredes', tipoMaterial: 'Triplay / Calamina / Estera', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los techos', tipoMaterial: 'Plancha de calamina, fibra de cemento o similares', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los techos', tipoMaterial: 'Triplay / Estera / Carrizo', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los techos', tipoMaterial: 'Tejas', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los pisos', tipoMaterial: 'Tierra', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los pisos', tipoMaterial: 'Cemento', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos['tiposMaterialesTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarTiposMateriales() {
    if (!this.datos['tiposMaterialesTabla']) {
      this.inicializarTiposMateriales();
    }
    const totalIndex = this.datos['tiposMaterialesTabla'].findIndex((item: any) => item.tipoMaterial === 'Total');
    if (totalIndex >= 0) {
      this.datos['tiposMaterialesTabla'].splice(totalIndex, 0, { categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['tiposMaterialesTabla'].push({ categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos['tiposMaterialesTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarTiposMateriales(index: number) {
    if (this.datos['tiposMaterialesTabla'] && this.datos['tiposMaterialesTabla'].length > 1) {
      const item = this.datos['tiposMaterialesTabla'][index];
      if (item.tipoMaterial !== 'Total') {
        this.datos['tiposMaterialesTabla'].splice(index, 1);
        this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos['tiposMaterialesTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarTiposMateriales(index: number, field: string, value: any) {
    if (!this.datos['tiposMaterialesTabla']) {
      this.inicializarTiposMateriales();
    }
    if (this.datos['tiposMaterialesTabla'][index]) {
      this.datos['tiposMaterialesTabla'][index][field] = value;
      this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos['tiposMaterialesTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }
}

