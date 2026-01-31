import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { Subscription } from 'rxjs';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { TableWrapperComponent } from '../table-wrapper/table-wrapper.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { debugLog } from 'src/app/shared/utils/debug';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
// Clean Architecture imports
import { LoadSeccion12UseCase, UpdateSeccion12DataUseCase, Seccion12ViewModel } from 'src/app/core/application/use-cases';
import { Seccion12Data } from 'src/app/core/domain/entities';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion12',
    templateUrl: './seccion12.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion12Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'provinciaSeleccionada', 'parrafoSeccion12_salud_completo', 'parrafoSeccion12_educacion_completo', 'caracteristicasSaludTabla', 'cantidadEstudiantesEducacionTabla', 'ieAyrocaTabla', 'ie40270Tabla', 'alumnosIEAyrocaTabla', 'alumnosIE40270Tabla', 'textoInfraestructuraEducacionPost', 'textoAlumnosPorSexoGrado', 'textoInfraestructuraRecreacion', 'textoInfraestructuraRecreacionDetalle', 'textoInfraestructuraDeporte', 'textoInfraestructuraDeportDetalle'];
  
  readonly PHOTO_PREFIX_SALUD = 'fotografiaSalud';
  readonly PHOTO_PREFIX_IE_AYROCA = 'fotografiaIEAyroca';
  readonly PHOTO_PREFIX_IE_40270 = 'fotografiaIE40270';
  readonly PHOTO_PREFIX_RECREACION = 'fotografiaRecreacion';
  readonly PHOTO_PREFIX_DEPORTE = 'fotografiaDeporte';
  
  fotografiasSaludFormMulti: FotoItem[] = [];
  fotografiasIEAyrocaFormMulti: FotoItem[] = [];
  fotografiasIE40270FormMulti: FotoItem[] = [];
  fotografiasRecreacionFormMulti: FotoItem[] = [];
  fotografiasDeporteFormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';
  override fotografiasCache: FotoItem[] = [];
  fotografiasSaludCache: FotoItem[] = [];
  fotografiasIEAyrocaCache: FotoItem[] = [];
  fotografiasIE40270Cache: FotoItem[] = [];
  fotografiasRecreacionCache: FotoItem[] = [];
  fotografiasDeporteCache: FotoItem[] = [];
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();

  // Clean Architecture ViewModel
  seccion12ViewModel$ = this.loadSeccion12UseCase.execute();
  seccion12ViewModel?: Seccion12ViewModel;

  get caracteristicasSaludConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyCaracteristicasSalud(),
      totalKey: 'categoria',
      campoTotal: 'categoria',
      campoPorcentaje: 'descripcion',
      estructuraInicial: [
        { categoria: 'Nombre', descripcion: 'Puesto de Salud Ayroca' },
        { categoria: 'Ubicación', descripcion: 'Ayroca - Cahuacho - Caravelí - Arequipa' },
        { categoria: 'Director Médico y/o Responsable de la Atención de Salud', descripcion: 'Daniela Manuel Sivinche' },
        { categoria: 'Código Único de IPRESS', descripcion: '00001379' },
        { categoria: 'Categoría del EESS', descripcion: 'I-2' },
        { categoria: 'Tipo de Establecimiento de Salud', descripcion: 'Establecimiento de salud sin internamiento' },
        { categoria: 'Nombre de la subcategoría (Clasificación)', descripcion: 'Puestos de salud o postas médicas' },
        { categoria: 'Estado del EESS', descripcion: 'Activo' },
        { categoria: 'Condición del EESS', descripcion: 'Activo' },
        { categoria: 'Nombre de DISA/DIRESA', descripcion: 'DIRESA Arequipa' },
        { categoria: 'Nombre de RED', descripcion: 'Camaná - Caravelí' },
        { categoria: 'Nombre de MICRORED', descripcion: 'Caravelí' },
        { categoria: 'Institución a la que pertenece el establecimiento', descripcion: 'MINSA' },
        { categoria: 'Teléfono del establecimiento', descripcion: '944 649 039 (Obstetra Daniela Núñez)' },
        { categoria: 'Grupo objetivo', descripcion: 'Población general' },
        { categoria: 'Número de ambientes con los que cuenta el establecimiento', descripcion: '8' },
        { categoria: 'Horario de atención', descripcion: '08:00 - 20:00' },
        { categoria: 'Número de atenciones mensuales', descripcion: '400' },
        { categoria: 'Infraestructura y servicios', descripcion: '• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• Cuenta con paneles solares que permiten la refrigeración de vacunas.\n• No tiene acceso a Internet.\n• Los residuos sólidos comunes son recolectados mensualmente por la municipalidad, mientras que los residuos biocontaminados son recolectados por la RED.\n• La infraestructura del establecimiento consta de bloques de concreto en las paredes, calamina en los techos y cerámicos en los pisos.\n• El personal del establecimiento está conformado por cinco miembros: un médico, una obstetra, una enfermera y dos técnicos en enfermería.\n• Los servicios que se ofrecen son medicina, obstetricia y enfermería. Además, se coordina con la MICRORED la realización de campañas de salud como psicología y salud bucal.' }
      ]
    };
  }

  get cantidadEstudiantesEducacionConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyCantidadEstudiantesEducacion(),
      totalKey: 'institucion',
      campoTotal: 'total',
      campoPorcentaje: 'porcentaje',
      estructuraInicial: [
        { institucion: 'IE Ayroca', nivel: 'Inicial', gestion: 'Pública', total: 0, porcentaje: '0,00 %' },
        { institucion: 'IE N°40270', nivel: 'Primaria', gestion: 'Pública', total: 0, porcentaje: '0,00 %' }
      ],
      calcularPorcentajes: true,
      camposParaCalcular: ['total']
    };
  }

  get ieAyrocaConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyIEAyroca(),
      totalKey: 'categoria',
      campoTotal: 'categoria',
      campoPorcentaje: 'descripcion',
      estructuraInicial: [
        { categoria: 'Tipo de I.E.', descripcion: 'Pública de gestión directa, mixta' },
        { categoria: 'Nombre del(la) director(a)', descripcion: 'María Elena Aguayo Arias' },
        { categoria: 'Características y observaciones', descripcion: '• La institución educativa data del año 1989, aproximadamente.\n• La directora de la institución es a la vez profesora de los alumnos (unidocente). Se dispone de una sola aula.\n• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• Se clasifican los residuos sólidos, pero estos no son recolectados frecuentemente por la municipalidad.\n• La infraestructura consta de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• Se cuenta con el ambiente para la cocina y el comedor, pero hace falta la implementación del mismo.\n• No se cuenta con una biblioteca, por lo que se improvisa con un pequeño estante.\n• Los juegos recreativos de la institución se encuentran en condiciones precarias, puesto que se hallan oxidados.\n• Se halla una pequeña losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.' }
      ]
    };
  }

  get ie40270Config(): TableConfig {
    return {
      tablaKey: this.getTablaKeyIE40270(),
      totalKey: 'categoria',
      campoTotal: 'categoria',
      campoPorcentaje: 'descripcion',
      estructuraInicial: [
        { categoria: 'Tipo de I.E.', descripcion: 'Pública de gestión directa, mixta' },
        { categoria: 'Nombre del(la) director(a)', descripcion: 'Nieves Bernaola Torres' },
        { categoria: 'Características y observaciones', descripcion: '• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• La infraestructura consta de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• Se cuenta con dos aulas para el desarrollo de las actividades académicas.\n• Se halla una losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.' }
      ]
    };
  }

  get alumnosIEAyrocaConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyAlumnosIEAyroca(),
      totalKey: 'nombre',
      campoTotal: 'totalH',
      campoPorcentaje: 'totalM',
      estructuraInicial: [{ nombre: '', nivel: '', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 }]
    };
  }

  get alumnosIE40270Config(): TableConfig {
    return {
      tablaKey: this.getTablaKeyAlumnosIE40270(),
      totalKey: 'nombre',
      campoTotal: 'totalH',
      campoPorcentaje: 'totalM',
      estructuraInicial: [{ nombre: '', nivel: '', totalH: 0, totalM: 0, p1H: 0, p1M: 0, p2H: 0, p2M: 0, p3H: 0, p3M: 0, p4H: 0, p4M: 0, p5H: 0, p5M: 0, p6H: 0, p6M: 0 }]
    };
  }

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override autoLoader: AutoBackendDataLoaderService,
    protected override tableFacade: TableManagementFacade,
    private stateAdapter: ReactiveStateAdapter,
    private groupConfig: GroupConfigService,
    private sanitizer: DomSanitizer,
    // Clean Architecture dependencies
    private loadSeccion12UseCase: LoadSeccion12UseCase,
    private updateSeccion12DataUseCase: UpdateSeccion12DataUseCase
  ) {
    super(cdRef, autoLoader, injector, undefined, tableFacade);
    
    // Subscribe to ViewModel for Clean Architecture
    this.seccion12ViewModel$.subscribe(viewModel => {
      this.seccion12ViewModel = viewModel;
      this.cdRef.markForCheck();
    });
  }

  // Clean Architecture methods
  updateSeccion12Data(updates: Partial<Seccion12Data>): void {
    if (this.seccion12ViewModel) {
      const currentData = this.seccion12ViewModel.data;
      const updatedData = { ...currentData, ...updates };
      this.updateSeccion12DataUseCase.execute(updatedData).subscribe(updatedViewModel => {
        this.seccion12ViewModel = updatedViewModel;
        this.cdRef.markForCheck();
      });
    }
  }

  // Backward compatibility methods - delegate to Clean Architecture
  obtenerTextoSalud(): string {
    return this.seccion12ViewModel?.texts.saludText || this.datos.parrafoSeccion12_salud_completo || '';
  }

  obtenerTextoEducacion(): string {
    return this.seccion12ViewModel?.texts.educacionText || this.datos.parrafoSeccion12_educacion_completo || '';
  }

  obtenerTextoInfraestructuraEducacion(): string {
    return this.seccion12ViewModel?.texts.infraestructuraEducacionText || this.datos.textoInfraestructuraEducacionPost || '';
  }

  obtenerTextoAlumnosPorSexoGrado(): string {
    return this.seccion12ViewModel?.texts.alumnosPorSexoGradoText || this.datos.textoAlumnosPorSexoGrado || '';
  }

  obtenerTextoInfraestructuraRecreacion(): string {
    return this.seccion12ViewModel?.texts.infraestructuraRecreacionText || this.datos.textoInfraestructuraRecreacion || '';
  }

  obtenerTextoInfraestructuraDeporte(): string {
    return this.seccion12ViewModel?.texts.infraestructuraDeporteText || this.datos.textoInfraestructuraDeporte || '';
  }

  // Additional backward compatibility methods for template
  obtenerTextoAlumnosPorSexoGradoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoAlumnosPorSexoGrado();
    // Simple highlighting - in a real implementation this would be more sophisticated
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
  }

  obtenerTextoInfraestructuraRecreacionConResaltado(): SafeHtml {
    const texto = this.obtenerTextoInfraestructuraRecreacion();
    // Simple highlighting - in a real implementation this would be more sophisticated
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
  }

  obtenerTextoInfraestructuraRecreacionDetalle(): string {
    return this.datos.textoInfraestructuraRecreacionDetalle || '';
  }

  obtenerTextoInfraestructuraRecreacionDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoInfraestructuraRecreacionDetalle();
    // Simple highlighting - in a real implementation this would be more sophisticated
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
  }

  obtenerTextoInfraestructuraDeporteConResaltado(): SafeHtml {
    const texto = this.obtenerTextoInfraestructuraDeporte();
    // Simple highlighting - in a real implementation this would be more sophisticated
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
  }

  obtenerTextoInfraestructuraDeportDetalle(): string {
    return this.datos.textoInfraestructuraDeportDetalle || '';
  }

  obtenerTextoInfraestructuraDeportDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoInfraestructuraDeportDetalle();
    // Simple highlighting - in a real implementation this would be more sophisticated
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
  }

  protected getSectionKey(): string {
    return 'seccion12_aisi';
  }

  protected getLoadParameters(): string[] | null {
    const ccppDesdeGrupo = this.groupConfig.getAISDCCPPActivos();
    if (ccppDesdeGrupo && ccppDesdeGrupo.length > 0) {
      return ccppDesdeGrupo;
    }
    
    return null;
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    const prefijo = this.obtenerPrefijoGrupo();
    
    const tablasConPrefijo = ['caracteristicasSaludTabla', 'cantidadEstudiantesEducacionTabla', 'ieAyrocaTabla', 'ie40270Tabla', 'alumnosIEAyrocaTabla', 'alumnosIE40270Tabla'];
    
    for (const campo of this.watchedFields) {
      let valorActual: any = null;
      let valorAnterior: any = null;
      
      if (tablasConPrefijo.includes(campo)) {
        valorActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, campo, this.seccionId) || null;
        const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
        valorAnterior = this.datosAnteriores[campoConPrefijo] || this.datosAnteriores[campo] || null;
      } else {
        valorActual = (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campo] || null;
      }
      
      const sonIguales = this.compararValores(valorActual, valorAnterior);
      if (!sonIguales) {
        hayCambios = true;
        if (tablasConPrefijo.includes(campo)) {
          const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
          this.datosAnteriores[campoConPrefijo] = this.clonarValor(valorActual);
        } else {
          this.datosAnteriores[campo] = this.clonarValor(valorActual);
        }
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

  protected override tieneFotografias(): boolean {
    return false;
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  private getTablaCaracteristicasSalud(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'caracteristicasSaludTabla', this.seccionId) || this.datos.caracteristicasSaludTabla || [];
    return tabla;
  }

  getTablaKeyCaracteristicasSalud(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `caracteristicasSaludTabla${prefijo}` : 'caracteristicasSaludTabla';
  }

  getCaracteristicasSaludTabla(): any[] {
    return this.getTablaCaracteristicasSalud();
  }

  private getTablaCantidadEstudiantesEducacion(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'cantidadEstudiantesEducacionTabla', this.seccionId) || this.datos.cantidadEstudiantesEducacionTabla || [];
    return tabla;
  }

  getTablaKeyCantidadEstudiantesEducacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `cantidadEstudiantesEducacionTabla${prefijo}` : 'cantidadEstudiantesEducacionTabla';
  }

  getCantidadEstudiantesSinTotal(): any[] {
    const tabla = this.getTablaCantidadEstudiantesEducacion();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const institucion = item.institucion?.toString().toLowerCase() || '';
      return !institucion.includes('total');
    });
  }

  getTotalCantidadEstudiantes(): string {
    const tabla = this.getTablaCantidadEstudiantesEducacion();
    if (!tabla || !Array.isArray(tabla)) {
      return '0';
    }
    const datosSinTotal = tabla.filter((item: any) => {
      const institucion = item.institucion?.toString().toLowerCase() || '';
      return !institucion.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const total = typeof item.total === 'number' ? item.total : parseInt(item.total) || 0;
      return sum + total;
    }, 0);
    return total.toString();
  }

  /**
   * Obtiene la tabla Infraestructura Educativa con porcentajes calculados dinámicamente
   * Cuadro 3.20
   * Nota: Esta tabla usa 'total' en lugar de 'casos' como campo numérico
   */
  getCantidadEstudiantesConPorcentajes(): any[] {
    const tabla = this.getTablaCantidadEstudiantesEducacion();
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return [];
    }

    // Filtrar filas Total si existen
    const tablaSinTotal = tabla.filter((item: any) => {
      const institucion = item.institucion?.toString().toLowerCase() || '';
      return !institucion.includes('total');
    });

    // Calcular total dinámicamente usando 'total' como campo numérico
    const total = tablaSinTotal.reduce((sum, item) => {
      const totalItem = typeof item?.total === 'number' ? item.total : parseInt(item?.total) || 0;
      return sum + totalItem;
    }, 0);

    if (total <= 0) {
      debugLog('⚠️ Total estudiantes en tabla <= 0, retornando porcentajes 0,00%');
      return tablaSinTotal.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    // Calcular porcentajes basados en el total
    const tablaConPorcentajes = tablaSinTotal.map((item: any) => {
      const totalItem = typeof item?.total === 'number' ? item.total : parseInt(item?.total) || 0;
      const porcentaje = (totalItem / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      debugLog(`📊 Cálculo porcentaje Cuadro 3.20 ${item.institucion}: ${totalItem} / ${total} = ${porcentaje.toFixed(2)}%`);

      return {
        ...item,
        total: totalItem,
        porcentaje: porcentajeFormateado
      };
    });

    // Agregar fila de total
    const filaTotal = {
      institucion: 'Total',
      nivel: '____',
      gestion: '____',
      total: total,
      porcentaje: '100,00 %'
    };
    tablaConPorcentajes.push(filaTotal);

    debugLog('📊 Cuadro N° 3.20 - Infraestructura educativa:', tablaConPorcentajes);
    
    return tablaConPorcentajes;
  }

  private getTablaIEAyroca(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'ieAyrocaTabla', this.seccionId) || this.datos.ieAyrocaTabla || [];
    return tabla;
  }

  getTablaKeyIEAyroca(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `ieAyrocaTabla${prefijo}` : 'ieAyrocaTabla';
  }

  getIEAyrocaTabla(): any[] {
    return this.getTablaIEAyroca();
  }

  private getTablaIE40270(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'ie40270Tabla', this.seccionId) || this.datos.ie40270Tabla || [];
    return tabla;
  }

  getTablaKeyIE40270(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `ie40270Tabla${prefijo}` : 'ie40270Tabla';
  }

  getIE40270Tabla(): any[] {
    return this.getTablaIE40270();
  }

  private getTablaAlumnosIEAyroca(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'alumnosIEAyrocaTabla', this.seccionId) || this.datos.alumnosIEAyrocaTabla || [];
    return tabla;
  }

  getTablaKeyAlumnosIEAyroca(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `alumnosIEAyrocaTabla${prefijo}` : 'alumnosIEAyrocaTabla';
  }

  getAlumnosIEAyrocaTabla(): any[] {
    return this.getTablaAlumnosIEAyroca();
  }

  private getTablaAlumnosIE40270(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'alumnosIE40270Tabla', this.seccionId) || this.datos.alumnosIE40270Tabla || [];
    return tabla;
  }

  getTablaKeyAlumnosIE40270(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `alumnosIE40270Tabla${prefijo}` : 'alumnosIE40270Tabla';
  }

  getAlumnosIE40270Tabla(): any[] {
    return this.getTablaAlumnosIE40270();
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasSaludVista(): FotoItem[] {
    if (this.fotografiasSaludCache && this.fotografiasSaludCache.length > 0) {
      return [...this.fotografiasSaludCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_SALUD,
      groupPrefix
    );
    this.fotografiasSaludCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasSaludCache;
  }

  getFotografiasIEAyrocaVista(): FotoItem[] {
    if (this.fotografiasIEAyrocaCache && this.fotografiasIEAyrocaCache.length > 0) {
      return [...this.fotografiasIEAyrocaCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_IE_AYROCA,
      groupPrefix
    );
    this.fotografiasIEAyrocaCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasIEAyrocaCache;
  }

  getFotografiasIE40270Vista(): FotoItem[] {
    if (this.fotografiasIE40270Cache && this.fotografiasIE40270Cache.length > 0) {
      return [...this.fotografiasIE40270Cache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_IE_40270,
      groupPrefix
    );
    this.fotografiasIE40270Cache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasIE40270Cache;
  }

  getFotografiasRecreacionVista(): FotoItem[] {
    if (this.fotografiasRecreacionCache && this.fotografiasRecreacionCache.length > 0) {
      return [...this.fotografiasRecreacionCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RECREACION,
      groupPrefix
    );
    this.fotografiasRecreacionCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasRecreacionCache;
  }

  getFotografiasDeporteVista(): FotoItem[] {
    if (this.fotografiasDeporteCache && this.fotografiasDeporteCache.length > 0) {
      return [...this.fotografiasDeporteCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DEPORTE,
      groupPrefix
    );
    this.fotografiasDeporteCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasDeporteCache;
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasSaludFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_SALUD, groupPrefix);
    this.fotografiasIEAyrocaFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_IE_AYROCA, groupPrefix);
    this.fotografiasIE40270FormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_IE_40270, groupPrefix);
    this.fotografiasRecreacionFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_RECREACION, groupPrefix);
    this.fotografiasDeporteFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_DEPORTE, groupPrefix);
  }

  protected override onInitCustom(): void {
    this.eliminarFilasTotal();
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    this.calcularPorcentajesCantidadEstudiantes();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private eliminarFilasTotal(): void {
    const tablaKey = this.getTablaKeyCantidadEstudiantesEducacion();
    const tabla = this.getTablaCantidadEstudiantesEducacion();
    
    if (tabla && Array.isArray(tabla)) {
      const longitudOriginal = tabla.length;
      const datosFiltrados = tabla.filter((item: any) => {
        const institucion = item.institucion?.toString().toLowerCase() || '';
        return !institucion.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.onFieldChange(tablaKey, datosFiltrados);
      }
    }
  }

  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    
    const fotosSalud = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_SALUD, groupPrefix);
    this.fotografiasSaludCache = fotosSalud && fotosSalud.length > 0 ? [...fotosSalud] : [];
    
    const fotosIEAyroca = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_IE_AYROCA, groupPrefix);
    this.fotografiasIEAyrocaCache = fotosIEAyroca && fotosIEAyroca.length > 0 ? [...fotosIEAyroca] : [];
    
    const fotosIE40270 = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_IE_40270, groupPrefix);
    this.fotografiasIE40270Cache = fotosIE40270 && fotosIE40270.length > 0 ? [...fotosIE40270] : [];
    
    const fotosRecreacion = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_RECREACION, groupPrefix);
    this.fotografiasRecreacionCache = fotosRecreacion && fotosRecreacion.length > 0 ? [...fotosRecreacion] : [];
    
    const fotosDeporte = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_DEPORTE, groupPrefix);
    this.fotografiasDeporteCache = fotosDeporte && fotosDeporte.length > 0 ? [...fotosDeporte] : [];
    
    this.cdRef.markForCheck();
  }

  onFotografiasSaludChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_SALUD, fotografias);
    this.fotografiasSaludFormMulti = [...fotografias];
    this.fotografiasSaludCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasIEAyrocaChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_IE_AYROCA, fotografias);
    this.fotografiasIEAyrocaFormMulti = [...fotografias];
    this.fotografiasIEAyrocaCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasIE40270Change(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_IE_40270, fotografias);
    this.fotografiasIE40270FormMulti = [...fotografias];
    this.fotografiasIE40270Cache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasRecreacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_RECREACION, fotografias);
    this.fotografiasRecreacionFormMulti = [...fotografias];
    this.fotografiasRecreacionCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasDeporteChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_DEPORTE, fotografias);
    this.fotografiasDeporteFormMulti = [...fotografias];
    this.fotografiasDeporteCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion12SaludCompleto(): string {
    if (this.datos.parrafoSeccion12_salud_completo) {
      return this.datos.parrafoSeccion12_salud_completo;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    const provincia = this.datos.provinciaSeleccionada || '____';
    return `Dentro de la CC ${grupoAISD} se encuentra un puesto de salud, que está bajo la gestión directa del MINSA. Este establecimiento es de categoría I – 2 y brinda atención primaria a los habitantes de la comunidad. En la actualidad, se viene ofreciendo tres servicios con carácter permanente: medicina, obstetricia y enfermería; aunque también se coordina en conjunto con la MICRORED la realización de campañas de salud como psicología y salud bucal. No obstante, ante casos de mayor complejidad, la población es derivada a establecimientos de mayor categoría, principalmente ubicados en la ciudad de ${provincia}.`;
  }

  obtenerTextoSeccion12SaludCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion12SaludCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const provincia = this.datos.provinciaSeleccionada || '____';
    
    let textoConResaltado = texto
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(provincia)), `<span class="data-section">${this.escapeHtml(provincia)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoSeccion12EducacionCompleto(): string {
    if (this.datos.parrafoSeccion12_educacion_completo) {
      return this.datos.parrafoSeccion12_educacion_completo;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `Dentro de la CC ${grupoAISD} se hallan instituciones educativas de los dos primeros niveles de educación básica regular (inicial y primaria). Todas ellas se encuentran concentradas en el anexo ${grupoAISD}, el centro administrativo comunal. En base al Censo Educativo 2023, la institución con mayor cantidad de estudiantes dentro de la comunidad es la IE N°40270, la cual es de nivel primaria, con un total de 21 estudiantes. A continuación, se presenta el cuadro con la cantidad de estudiantes por institución educativa y nivel dentro de la localidad en cuestión.`;
  }

  obtenerTextoSeccion12EducacionCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion12EducacionCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let textoConResaltado = texto
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoInfraestructuraEducacionPost(): string {
    if (this.datos.textoInfraestructuraEducacionPost && this.datos.textoInfraestructuraEducacionPost !== '____') {
      return this.datos.textoInfraestructuraEducacionPost;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `De las entrevistas aplicadas durante el trabajo de campo, se recopiló información de carácter cualitativo de las instituciones educativas de la CC ${grupoAISD}. En los cuadros que se presentan a continuación se detallan características de cada una de ellas para el año 2024.`;
  }

  obtenerTextoInfraestructuraEducacionPostConResaltado(): SafeHtml {
    const texto = this.obtenerTextoInfraestructuraEducacionPost();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let textoConResaltado = texto
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  private compararValores(actual: any, anterior: any): boolean {
    if (actual === anterior) return true;
    if (actual === null || anterior === null) return actual === anterior;
    if (actual === undefined || anterior === undefined) return actual === anterior;
    if (Array.isArray(actual) && Array.isArray(anterior)) {
      if (actual.length !== anterior.length) return false;
      return actual.every((item, index) => this.compararValores(item, anterior[index]));
    }
    if (typeof actual === 'object' && typeof anterior === 'object') {
      const keysActual = Object.keys(actual);
      const keysAnterior = Object.keys(anterior);
      if (keysActual.length !== keysAnterior.length) return false;
      return keysActual.every(key => this.compararValores(actual[key], anterior[key]));
    }
    return actual === anterior;
  }

  private clonarValor(valor: any): any {
    if (valor === null || valor === undefined) return valor;
    if (Array.isArray(valor)) {
      return valor.map(item => this.clonarValor(item));
    }
    if (typeof valor === 'object') {
      const clon: any = {};
      for (const key in valor) {
        if (valor.hasOwnProperty(key)) {
          clon[key] = this.clonarValor(valor[key]);
        }
      }
      return clon;
    }
    return valor;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private escapeRegex(text: any): string {
    const str = typeof text === 'string' ? text : String(text || '');
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  onCantidadEstudiantesFieldChange(rowIndex: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyCantidadEstudiantesEducacion();
    const tabla = this.getTablaCantidadEstudiantesEducacion();
    if (tabla && tabla[rowIndex]) {
      tabla[rowIndex][field] = value;
      this.onFieldChange(tablaKey, tabla, { refresh: false });
      this.calcularPorcentajesCantidadEstudiantes();
    }
  }

  onCantidadEstudiantesTableUpdated(): void {
    const tablaKey = this.getTablaKeyCantidadEstudiantesEducacion();
    const tabla = this.getTablaCantidadEstudiantesEducacion();
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    this.calcularPorcentajesCantidadEstudiantes();
    this.cdRef.detectChanges();
  }

  private calcularPorcentajesCantidadEstudiantes(): void {
    const tabla = this.getTablaCantidadEstudiantesEducacion();
    if (!tabla || tabla.length === 0) return;

    const datosSinTotal = tabla.filter((item: any) => {
      const institucion = item.institucion?.toString().toLowerCase() || '';
      return !institucion.includes('total');
    });

    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const totalEstudiantes = typeof item.total === 'number' ? item.total : parseInt(item.total) || 0;
      return sum + totalEstudiantes;
    }, 0);

    if (total > 0) {
      datosSinTotal.forEach((item: any) => {
        const casos = typeof item.total === 'number' ? item.total : parseInt(item.total) || 0;
        const porcentaje = ((casos / total) * 100).toFixed(2).replace('.', ',');
        item.porcentaje = porcentaje + ' %';
      });
      
      const tablaKey = this.getTablaKeyCantidadEstudiantesEducacion();
      this.onFieldChange(tablaKey, tabla, { refresh: false });
    }
  }

  onCaracteristicasSaludTableUpdated(): void {
    const tablaKey = this.getTablaKeyCaracteristicasSalud();
    const tabla = this.getTablaCaracteristicasSalud();
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    this.cdRef.detectChanges();
  }

  onIEAyrocaTableUpdated(): void {
    const tablaKey = this.getTablaKeyIEAyroca();
    const tabla = this.getTablaIEAyroca();
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    this.cdRef.detectChanges();
  }

  onIE40270TableUpdated(): void {
    const tablaKey = this.getTablaKeyIE40270();
    const tabla = this.getTablaIE40270();
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    this.cdRef.detectChanges();
  }

  onAlumnosIEAyrocaTableUpdated(): void {
    const tablaKey = this.getTablaKeyAlumnosIEAyroca();
    const tabla = this.getTablaAlumnosIEAyroca();
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    this.cdRef.detectChanges();
  }

  onAlumnosIE40270TableUpdated(): void {
    const tablaKey = this.getTablaKeyAlumnosIE40270();
    const tabla = this.getTablaAlumnosIE40270();
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    this.cdRef.detectChanges();
  }
}


