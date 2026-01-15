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
  selector: 'app-seccion13',
  templateUrl: './seccion13.component.html',
  styleUrls: ['./seccion13.component.css']
})
export class Seccion13Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'parrafoSeccion13_natalidad_mortalidad_completo', 'parrafoSeccion13_morbilidad_completo', 'natalidadMortalidadTabla', 'morbilidadTabla', 'porcentajeSIS', 'porcentajeESSALUD', 'porcentajeSinSeguro', 'afiliacionSaludTabla', 'textoAfiliacionSalud'];
  
  override readonly PHOTO_PREFIX = 'fotografiaSaludIndicadores';
  private stateSubscription?: Subscription;

  natalidadMortalidadConfig: TableConfig = {
    tablaKey: 'natalidadMortalidadTabla',
    totalKey: 'anio',
    campoTotal: 'natalidad',
    campoPorcentaje: 'mortalidad',
    estructuraInicial: [
      { anio: '2023', natalidad: 0, mortalidad: 0 },
      { anio: '2024 (hasta 13/11)', natalidad: 0, mortalidad: 0 }
    ]
  };

  morbilidadConfig: TableConfig = {
    tablaKey: 'morbilidadTabla',
    totalKey: 'grupo',
    campoTotal: 'casos',
    campoPorcentaje: 'casos',
    estructuraInicial: [
      { grupo: 'Infecciones agudas de las vías respiratorias superiores', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
      { grupo: 'Obesidad y otros de hiperalimentación', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 }
    ]
  };

  afiliacionSaludConfig: TableConfig = {
    tablaKey: 'afiliacionSaludTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: 'SIS', casos: 0, porcentaje: '0%' },
      { categoria: 'ESSALUD', casos: 0, porcentaje: '0%' },
      { categoria: 'Sin seguro', casos: 0, porcentaje: '0%' },
      { categoria: 'Total', casos: 0, porcentaje: '0%' }
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

  override obtenerPrefijoGrupo(): string {
    if (this.seccionId === '3.1.4.A.1.6' || this.seccionId.startsWith('3.1.4.A.1.')) return '_A1';
    if (this.seccionId === '3.1.4.A.2.6' || this.seccionId.startsWith('3.1.4.A.2.')) return '_A2';
    if (this.seccionId === '3.1.4.B.1.6' || this.seccionId.startsWith('3.1.4.B.1.')) return '_B1';
    if (this.seccionId === '3.1.4.B.2.6' || this.seccionId.startsWith('3.1.4.B.2.')) return '_B2';
    return '';
  }

  getFotografiasSaludIndicadoresVista(): FotoItem[] {
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

  obtenerTextoSeccion13NatalidadMortalidadCompleto(): string {
    if (this.datos.parrafoSeccion13_natalidad_mortalidad_completo) {
      return this.datos.parrafoSeccion13_natalidad_mortalidad_completo;
    }
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
    return `El presente ítem proporciona una visión crucial sobre las dinámicas demográficas, reflejando las tendencias en el crecimiento poblacional. De los datos obtenidos en el Puesto de Salud ${grupoAISD} durante el trabajo de campo, se obtiene que en el año 2023 solo ocurrió un nacimiento, mientras que para el 2024 (hasta el 13 de noviembre) se dieron un total de tres (03) nacimientos.\n\nRespecto a la mortalidad, según la misma fuente, se obtiene que en el año 2023 se registró un fallecimiento, por suicidio; mientras que para el 2024 no ocurrieron decesos dentro de la CC ${grupoAISD}, hasta la fecha indicada.`;
  }

  obtenerTextoSeccion13MorbilidadCompleto(): string {
    if (this.datos.parrafoSeccion13_morbilidad_completo) {
      return this.datos.parrafoSeccion13_morbilidad_completo;
    }
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    return `De acuerdo con las entrevistas aplicadas durante el trabajo de campo, las autoridades locales y los informantes calificados reportaron que las enfermedades más recurrentes dentro de la CC ${grupoAISD} son las infecciones respiratorias agudas (IRAS) y las enfermedades diarreicas agudas (EDAS). Asimismo, se mencionan casos de hipertensión y diabetes, que son más frecuentes en adultos mayores.\n\nEn cuanto a los grupos de morbilidad que se hallan a nivel distrital de ${distrito} (jurisdicción que abarca a los poblados de la CC ${grupoAISD}) para el año 2023, se destaca que las condiciones más frecuentes son las infecciones agudas de las vías respiratorias superiores (1012 casos) y la obesidad y otros de hiperalimentación (191 casos). Para la primera, se reportó un mayor número de casos en el bloque etario de 0-11 años, mientras que para la segunda, el rango de 30-59 años mostró más casos. A continuación, se presenta el cuadro con la cantidad de casos por grupo de morbilidad y bloques etarios dentro del distrito, según el portal REUNIS del MINSA.`;
  }

  obtenerTextoAfiliacionSalud(): string {
    if (this.datos.textoAfiliacionSalud && this.datos.textoAfiliacionSalud !== '____') {
      return this.datos.textoAfiliacionSalud;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const porcentajeSIS = this.datos.porcentajeSIS || '84,44';
    const porcentajeESSALUD = this.datos.porcentajeESSALUD || '3,56';
    const porcentajeSinSeguro = this.datos.porcentajeSinSeguro || '12,00';
    
    return `Dentro de la CC ${grupoAISD}, la mayoría de habitantes se encuentran afiliados a algún tipo de seguro de salud. Es así que el Seguro Integral de Salud (SIS) se halla en primer lugar, al abarcar el ${porcentajeSIS} % de la población. A ello le sigue ESSALUD, con un ${porcentajeESSALUD} %. Por otro lado, el ${porcentajeSinSeguro} % de la población no cuenta con ningún tipo de seguro de salud.`;
  }

  onMorbilidadFieldChange(index: number, field: string, value: any) {
    if (!this.datos['morbilidadTabla'] && !this.datos['morbiliadTabla']) {
      this.tableService.inicializarTabla(this.datos, this.morbilidadConfig);
    }
    const tabla = this.datos['morbilidadTabla'] || this.datos['morbiliadTabla'];
    if (tabla && tabla[index]) {
      tabla[index][field] = value;
      if (field !== 'casos' && field !== 'grupo') {
        this.calcularTotalesMorbilidad();
      }
      const key = this.datos['morbilidadTabla'] ? 'morbilidadTabla' : 'morbiliadTabla';
      this.formularioService.actualizarDato(key, tabla);
    }
  }

  onMorbilidadTableUpdated() {
    this.calcularTotalesMorbilidad();
    const key = this.datos['morbilidadTabla'] ? 'morbilidadTabla' : 'morbiliadTabla';
    this.formularioService.actualizarDato(key, this.datos[key]);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularTotalesMorbilidad() {
    const tabla = this.datos['morbilidadTabla'] || this.datos['morbiliadTabla'];
    if (!tabla || tabla.length === 0) {
      return;
    }
    tabla.forEach((item: any) => {
      const rango0_11 = parseFloat(item.rango0_11) || 0;
      const rango12_17 = parseFloat(item.rango12_17) || 0;
      const rango18_29 = parseFloat(item.rango18_29) || 0;
      const rango30_59 = parseFloat(item.rango30_59) || 0;
      const rango60 = parseFloat(item.rango60) || 0;
      const total = rango0_11 + rango12_17 + rango18_29 + rango30_59 + rango60;
      item.casos = total;
    });
  }
}

