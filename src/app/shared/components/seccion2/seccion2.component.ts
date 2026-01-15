import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { ComunidadCampesina } from 'src/app/core/models/formulario.model';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion2',
  templateUrl: './seccion2.component.html',
  styleUrls: ['./seccion2.component.css']
})
export class Seccion2Component extends BaseSectionComponent {
  @Input() override seccionId: string = '3.1.2';
  @Input() override modoFormulario: boolean = false;
  
  distritosDisponibles: string[] = [];
  distritosSeleccionados: { [key: string]: string } = {};
  seccionesAISI: number[] = [];
  distritosDisponiblesAISI: string[] = [];
  distritosSeleccionadosAISI: string[] = [];
  comunidadesCampesinas: ComunidadCampesina[] = [];
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccion2';
  
  fotografiasSeccion2: FotoItem[] = [];
  
  override watchedFields: string[] = [
    'parrafoSeccion2_introduccion',
    'parrafoSeccion2_aisd_completo',
    'parrafoSeccion2_aisi_completo',
    'grupoAISD',
    'distritoSeleccionado',
    'provinciaSeleccionada',
    'departamentoSeleccionado',
    'aisdComponente1',
    'aisdComponente2',
    'grupoAISI',
    'distritosAISI',
    'seccionesAISI',
    'comunidadesCampesinas'
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

  protected override onInitCustom(): void {
    this.detectarDistritos();
    this.cargarSeccionesAISI();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    let hayCambios = false;
    let necesitaRecargar = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
        
        if (campo === 'distritoSeleccionado' || campo === 'provinciaSeleccionada' || campo === 'departamentoSeleccionado') {
          necesitaRecargar = true;
        }
      }
    }

    if (necesitaRecargar && hayCambios) {
      this.loadSectionData();
    }

    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
  }

  protected override actualizarDatosCustom(): void {
    this.distritosSeleccionados = this.datos['distritosAISI'] || {};
    this.distritosSeleccionadosAISI = this.datos['distritosSeleccionadosAISI'] || [];
    this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    if (this.comunidadesCampesinas.length === 0 && this.datos['grupoAISD']) {
      this.comunidadesCampesinas = [{
        id: 'cc_legacy',
        nombre: this.datos['grupoAISD'],
        centrosPobladosSeleccionados: this.datos['centrosPobladosSeleccionadosAISD'] || []
      }];
    }
    this.detectarDistritosAISI();
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

  obtenerDistritosSeleccionadosAISI(): string[] {
    return this.distritosSeleccionadosAISI || [];
  }

  obtenerTextoAISI(): string {
    const distritos = this.obtenerDistritosSeleccionadosAISI();
    
    if (distritos.length === 0) {
      return '____';
    }
    
    if (distritos.length === 1) {
      return distritos[0];
    }
    
    if (distritos.length === 2) {
      return `${distritos[0]} y ${distritos[1]}`;
    }
    
    const ultimo = distritos[distritos.length - 1];
    const anteriores = distritos.slice(0, -1).join(', ');
    return `${anteriores} y ${ultimo}`;
  }

  obtenerTextoAISIPlural(): string {
    const distritos = this.obtenerDistritosSeleccionadosAISI();
    return distritos.length > 1 ? 'distritos' : 'distrito';
  }

  obtenerTextoAISICentrosPoblados(): string {
    const distritos = this.obtenerDistritosSeleccionadosAISI();
    return distritos.length > 1 ? 'centros poblados' : 'centro poblado';
  }

  detectarDistritos() {
    const jsonData = this.formularioService.obtenerJSON();
    const distritosSet = new Set<string>();

    if (Array.isArray(jsonData)) {
      jsonData.forEach((cp: any) => {
        if (cp && cp.DIST) {
          distritosSet.add(cp.DIST);
        }
      });
    } else if (jsonData && typeof jsonData === 'object') {
      Object.keys(jsonData).forEach((key: string) => {
        const centrosPoblados: any = jsonData[key];
        if (Array.isArray(centrosPoblados)) {
          centrosPoblados.forEach((cp: any) => {
            if (cp && cp.DIST) {
              distritosSet.add(cp.DIST);
            }
          });
        } else if (centrosPoblados && typeof centrosPoblados === 'object' && centrosPoblados.DIST) {
          distritosSet.add(centrosPoblados.DIST);
        }
      });
    }

    this.distritosDisponibles = Array.from(distritosSet).sort();

    if (this.distritosDisponibles.length === 1 && !this.distritosSeleccionados['B1']) {
      this.distritosSeleccionados['B1'] = this.distritosDisponibles[0];
      this.guardarDistritosAISI();
    }

    if (this.distritosDisponibles.length > 1 && this.seccionesAISI.length === 0) {
      this.seccionesAISI = [1];
      this.guardarSeccionesAISI();
    }
  }

  cargarSeccionesAISI() {
    const secciones = this.datos['seccionesAISI'] || [];
    if (secciones.length === 0 && this.distritosDisponibles.length > 0) {
      this.seccionesAISI = [1];
    } else {
      this.seccionesAISI = secciones;
    }
  }

  seleccionarDistritoParaAISI(seccion: number, distrito: string) {
    const key = `B${seccion}`;
    this.distritosSeleccionados[key] = distrito;
    this.guardarDistritosAISI();
    
    const grupoAISIKey = seccion === 1 ? 'grupoAISI' : `grupoAISI_B${seccion}`;
    this.datos[grupoAISIKey] = distrito;
    this.formularioService.actualizarDato(grupoAISIKey, distrito);
    
    const centroPobladoKey = seccion === 1 ? 'centroPobladoAISI' : `centroPobladoAISI_B${seccion}`;
    this.datos[centroPobladoKey] = distrito;
    this.formularioService.actualizarDato(centroPobladoKey, distrito);
    
    this.actualizarDatos();
  }

  agregarSeccionAISI() {
    const nuevaSeccion = this.seccionesAISI.length > 0 
      ? Math.max(...this.seccionesAISI) + 1 
      : 1;
    this.seccionesAISI.push(nuevaSeccion);
    this.guardarSeccionesAISI();
  }

  eliminarSeccionAISI(seccion: number) {
    this.seccionesAISI = this.seccionesAISI.filter(s => s !== seccion);
    delete this.distritosSeleccionados[`B${seccion}`];
    this.guardarSeccionesAISI();
    this.guardarDistritosAISI();
    this.actualizarDatos();
  }

  guardarDistritosAISI() {
    this.datos['distritosAISI'] = this.distritosSeleccionados;
    this.formularioService.actualizarDato('distritosAISI', this.distritosSeleccionados);
  }

  guardarSeccionesAISI() {
    this.datos['seccionesAISI'] = this.seccionesAISI;
    this.formularioService.actualizarDato('seccionesAISI', this.seccionesAISI);
  }

  obtenerDistritoSeleccionado(seccion: number): string {
    return this.distritosSeleccionados[`B${seccion}`] || '';
  }

  tieneUnSoloDistrito(): boolean {
    return this.distritosDisponibles.length === 1;
  }

  tieneMultiplesDistritos(): boolean {
    return this.distritosDisponibles.length > 1;
  }

  obtenerSiguienteNumeroSeccion(): number {
    if (this.seccionesAISI.length === 0) {
      return 1;
    }
    return Math.max(...this.seccionesAISI) + 1;
  }

  obtenerComunidadesCampesinas(): ComunidadCampesina[] {
    return this.comunidadesCampesinas.filter(cc => cc.nombre && cc.nombre.trim() !== '');
  }

  obtenerTextoComunidades(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    if (comunidades.length === 0) {
      return '____';
    }
    if (comunidades.length === 1) {
      return comunidades[0].nombre;
    }
    if (comunidades.length === 2) {
      return `${comunidades[0].nombre} y ${comunidades[1].nombre}`;
    }
    const ultima = comunidades[comunidades.length - 1].nombre;
    const anteriores = comunidades.slice(0, -1).map(cc => cc.nombre).join(', ');
    return `${anteriores} y ${ultima}`;
  }

  obtenerTextoComunidadesPlural(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'las comunidades campesinas (CC)' : 'la comunidad campesina (CC)';
  }

  obtenerTextoComunidadesSingular(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'estas comunidades' : 'esta comunidad';
  }

  obtenerTextoComunidadesPosesion(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'Estas comunidades poseen' : 'Esta comunidad posee';
  }

  obtenerTextoComunidadesImpactos(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    if (comunidades.length === 0) {
      return '____';
    }
    if (comunidades.length === 1) {
      return comunidades[0].nombre;
    }
    if (comunidades.length === 2) {
      return `${comunidades[0].nombre} y ${comunidades[1].nombre}`;
    }
    const ultima = comunidades[comunidades.length - 1].nombre;
    const anteriores = comunidades.slice(0, -1).map(cc => cc.nombre).join(', ');
    return `${anteriores} y ${ultima}`;
  }

  obtenerTextoComunidadesFinal(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    if (comunidades.length === 0) {
      return '____';
    }
    if (comunidades.length === 1) {
      return comunidades[0].nombre;
    }
    if (comunidades.length === 2) {
      return `${comunidades[0].nombre} y ${comunidades[1].nombre}`;
    }
    const ultima = comunidades[comunidades.length - 1].nombre;
    const anteriores = comunidades.slice(0, -1).map(cc => cc.nombre).join(', ');
    return `${anteriores} y ${ultima}`;
  }

  obtenerPrefijoCCImpactos(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'las CC ' : 'la CC ';
  }

  obtenerPrefijoCCFinal(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'las CC ' : 'la CC ';
  }

  tieneUnaComunidad(): boolean {
    return this.obtenerComunidadesCampesinas().length === 1;
  }

  tieneMultiplesComunidades(): boolean {
    return this.obtenerComunidadesCampesinas().length > 1;
  }

  guardarCentrosPobladosSeleccionados(indiceComunidad: number, codigosSeleccionados: string[]): void {
    if (indiceComunidad >= 0 && indiceComunidad < this.comunidadesCampesinas.length) {
      this.comunidadesCampesinas[indiceComunidad].centrosPobladosSeleccionados = codigosSeleccionados;
      this.datos['comunidadesCampesinas'] = this.comunidadesCampesinas;
      this.formularioService.actualizarDato('comunidadesCampesinas', this.comunidadesCampesinas);
    }
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasSeccion2 = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = this.fotografiasSeccion2;
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

  obtenerTextoSeccion2Introduccion(): string {
    if (this.datos.parrafoSeccion2_introduccion) {
      return this.datos.parrafoSeccion2_introduccion;
    }
    
    return 'En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.\n\nAsimismo, el área de influencia social de un Proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho Proyecto).\n\nEl criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.\n\nEn base a estos criterios se han identificado las áreas de influencia social directa e indirecta:';
  }

  obtenerTextoSeccion2AISDCompleto(): string {
    if (this.datos.parrafoSeccion2_aisd_completo) {
      return this.datos.parrafoSeccion2_aisd_completo;
    }
    
    const comunidades = this.obtenerComunidadesCampesinas();
    const tieneUna = comunidades.length === 1;
    const tieneMultiples = comunidades.length > 1;
    const textoComunidades = this.obtenerTextoComunidades();
    const distrito = this.datos.distritoSeleccionado || '____';
    const aisd1 = this.datos.aisdComponente1 || '____';
    const aisd2 = this.datos.aisdComponente2 || '____';
    const departamento = this.datos.departamentoSeleccionado || '____';
    
    let texto = `El Área de influencia social directa (AISD) se delimita en torno a ${tieneUna ? 'la comunidad campesina (CC)' : 'las comunidades campesinas (CC)'} ${textoComunidades}`;
    texto += tieneUna 
      ? `, cuya área comunal se encuentra predominantemente en el distrito de ${distrito} y en menor proporción en los distritos de ${aisd1} y de ${aisd2}, pertenecientes al departamento de ${departamento}`
      : `, cuyas áreas comunales se encuentran predominantemente en el distrito de ${distrito} y en menor proporción en los distritos de ${aisd1} y de ${aisd2}, pertenecientes al departamento de ${departamento}`;
    texto += `. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. ${this.obtenerTextoComunidadesPosesion()} y gestiona${tieneMultiples ? 'n' : ''} las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto.\n\n`;
    texto += `La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de ${this.obtenerTextoComunidadesSingular()} requiere${tieneMultiples ? 'n' : ''} una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de ${tieneUna ? 'la comunidad' : 'las comunidades'}.\n\n`;
    texto += `Los impactos directos en ${this.obtenerPrefijoCCImpactos()}${this.obtenerTextoComunidadesImpactos()}, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y ${tieneUna ? 'la comunidad' : 'las comunidades'} promoverá${tieneMultiples ? 'n' : ''} un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de ${this.obtenerPrefijoCCFinal()}${this.obtenerTextoComunidadesFinal()}.`;
    
    return texto;
  }

  obtenerTextoSeccion2AISICompleto(): string {
    if (this.datos.parrafoSeccion2_aisi_completo) {
      return this.datos.parrafoSeccion2_aisi_completo;
    }
    
    const distritosAISI = this.obtenerDistritosSeleccionadosAISI();
    const tieneUnDistrito = distritosAISI.length === 1;
    const tieneMultiplesDistritos = distritosAISI.length > 1;
    const textoAISI = this.obtenerTextoAISI();
    
    if (tieneUnDistrito) {
      return `El Área de influencia social indirecta (AISI) se delimita en torno a la capital distrital de la jurisdicción de ${textoAISI}. Esta localidad se considera dentro del AISI debido a su función como centro administrativo y político de su respectivo distrito. Como capital distrital, el Centro Poblado (CP) ${textoAISI} es un punto focal para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en este centro poblado será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en el distrito de ${textoAISI}. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en este centro poblado contribuirá al dinamismo económico de la capital distrital, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
    } else if (tieneMultiplesDistritos) {
      return `El Área de influencia social indirecta (AISI) se delimita en torno a las capitales distritales de las jurisdicciones de ${textoAISI}. Estas localidades se consideran dentro del AISI debido a su función como centros administrativos y políticos de sus respectivos distritos. Como capitales distritales, los Centros Poblados (CP) de ${textoAISI} son puntos focales para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en estos centros poblados será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en los distritos de ${textoAISI}. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en estos centros poblados contribuirá al dinamismo económico de las capitales distritales, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
    }
    
    return '';
  }

  detectarDistritosAISI() {
    const jsonData = this.formularioService.obtenerJSON();
    const distritosSet = new Set<string>();

    if (Array.isArray(jsonData)) {
      jsonData.forEach((cp: any) => {
        if (cp && cp.DIST) {
          distritosSet.add(cp.DIST);
        }
      });
    } else if (jsonData && typeof jsonData === 'object') {
      Object.keys(jsonData).forEach((key: string) => {
        const centrosPoblados: any = jsonData[key];
        if (Array.isArray(centrosPoblados)) {
          centrosPoblados.forEach((cp: any) => {
            if (cp && cp.DIST) {
              distritosSet.add(cp.DIST);
            }
          });
        } else if (centrosPoblados && typeof centrosPoblados === 'object' && centrosPoblados.DIST) {
          distritosSet.add(centrosPoblados.DIST);
        }
      });
    }

    this.distritosDisponiblesAISI = Array.from(distritosSet).sort();

    if (this.distritosSeleccionadosAISI.length === 0 && this.distritosDisponiblesAISI.length > 0) {
      this.distritosSeleccionadosAISI = [...this.distritosDisponiblesAISI];
      this.onFieldChange('distritosSeleccionadosAISI', this.distritosSeleccionadosAISI);
    }
  }

  toggleDistritoAISI(distrito: string) {
    const index = this.distritosSeleccionadosAISI.indexOf(distrito);
    if (index > -1) {
      this.distritosSeleccionadosAISI.splice(index, 1);
    } else {
      this.distritosSeleccionadosAISI.push(distrito);
    }
    this.onFieldChange('distritosSeleccionadosAISI', [...this.distritosSeleccionadosAISI]);
    this.actualizarDatos();
  }

  estaDistritoSeleccionadoAISI(distrito: string): boolean {
    return this.distritosSeleccionadosAISI.includes(distrito);
  }
}

