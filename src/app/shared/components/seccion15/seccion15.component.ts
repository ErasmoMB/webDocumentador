import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion15',
  templateUrl: './seccion15.component.html',
  styleUrls: ['./seccion15.component.css']
})
export class Seccion15Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'parrafoSeccion15_religion_completo', 'lenguasMaternasTabla', 'religionesTabla', 'textoAspectosCulturales', 'textoIdioma'];
  
  override readonly PHOTO_PREFIX = 'fotografiaIglesia';
  private stateSubscription?: Subscription;

  lenguasMaternasConfig: TableConfig = {
    tablaKey: 'lenguasMaternasTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: 'Castellano', casos: 0, porcentaje: '0%' },
      { categoria: 'Quechua', casos: 0, porcentaje: '0%' },
      { categoria: 'No sabe / No responde', casos: 0, porcentaje: '0%' },
      { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
    ],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  religionesConfig: TableConfig = {
    tablaKey: 'religionesTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: 'Católica', casos: 0, porcentaje: '0%' },
      { categoria: 'Evangélica', casos: 0, porcentaje: '0%' },
      { categoria: 'Otra', casos: 0, porcentaje: '0%' },
      { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
    ],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
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

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
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
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      fotografias,
      groupPrefix
    );
    this.fotografiasCache = [...fotografias];
    this.fotografiasFormMulti = [...fotografias];
    this.cdRef.detectChanges();
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

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
    this.eliminarFilasTotal();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private eliminarFilasTotal(): void {
    // Eliminar filas Total de lenguasMaternasTabla
    if (this.datos['lenguasMaternasTabla'] && Array.isArray(this.datos['lenguasMaternasTabla'])) {
      const longitudOriginal = this.datos['lenguasMaternasTabla'].length;
      this.datos['lenguasMaternasTabla'] = this.datos['lenguasMaternasTabla'].filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (this.datos['lenguasMaternasTabla'].length !== longitudOriginal) {
        this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
        this.cdRef.detectChanges();
      }
    }

    // Eliminar filas Total de religionesTabla
    if (this.datos['religionesTabla'] && Array.isArray(this.datos['religionesTabla'])) {
      const longitudOriginal = this.datos['religionesTabla'].length;
      this.datos['religionesTabla'] = this.datos['religionesTabla'].filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (this.datos['religionesTabla'].length !== longitudOriginal) {
        this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
        this.cdRef.detectChanges();
      }
    }
  }

  getLenguasMaternaSinTotal(): any[] {
    if (!this.datos?.lenguasMaternasTabla || !Array.isArray(this.datos.lenguasMaternasTabla)) {
      return [];
    }
    return this.datos.lenguasMaternasTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalLenguasMaternas(): string {
    const filtered = this.getLenguasMaternaSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getReligionesSinTotal(): any[] {
    if (!this.datos?.religionesTabla || !Array.isArray(this.datos.religionesTabla)) {
      return [];
    }
    return this.datos.religionesTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalReligiones(): string {
    const filtered = this.getReligionesSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  obtenerTextoSeccion15ReligionCompleto(): string {
    if (this.datos.parrafoSeccion15_religion_completo) {
      return this.datos.parrafoSeccion15_religion_completo;
    }
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    return `La confesión predominante dentro de la CC ${grupoAISD} es el catolicismo. Según las entrevistas, la permanencia del catolicismo como religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz de ${grupoAISD}, y a la no existencia de templos evangélicos u otras confesiones. Esta iglesia es descrita como el principal punto de encuentro religioso para la comunidad y desempeña un papel importante en la vida espiritual de sus habitantes. Otro espacio de valor espiritual es el cementerio, donde los comuneros entierran y visitan a sus difuntos. Este lugar se encuentra ubicado al sur del anexo ${grupoAISD}.`;
  }

  obtenerTextoIdioma(): string {
    if (this.datos.textoIdioma && this.datos.textoIdioma !== '____') {
      return this.datos.textoIdioma;
    }
    
    const porcentajeCastellano = this.getPorcentajeCastellano() || '____';
    const porcentajeQuechua = this.getPorcentajeQuechua() || '____';
    
    return `Se entiende por lengua materna aquella que es la primera lengua que aprende una persona. En base a los datos de la Plataforma Nacional de Datos Georreferenciados – Geo Perú, el castellano es la categoría mayoritaria, al representar el ${porcentajeCastellano} de la población de 3 años a más. En segundo lugar, se halla el quechua, siendo la lengua materna del ${porcentajeQuechua} de los habitantes.`;
  }

  inicializarLenguasMaternas() {
    this.tableService.inicializarTabla(this.datos, this.lenguasMaternasConfig);
    this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  agregarLenguasMaternas() {
    this.tableService.agregarFila(this.datos, this.lenguasMaternasConfig);
    this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarLenguasMaternas(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.lenguasMaternasConfig, index);
    if (deleted) {
      this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarLenguasMaternas(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.lenguasMaternasConfig, index, field, value);
    this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  inicializarReligiones() {
    this.tableService.inicializarTabla(this.datos, this.religionesConfig);
    this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  agregarReligiones() {
    this.tableService.agregarFila(this.datos, this.religionesConfig);
    this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarReligiones(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.religionesConfig, index);
    if (deleted) {
      this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarReligiones(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.religionesConfig, index, field, value);
    this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }
}

