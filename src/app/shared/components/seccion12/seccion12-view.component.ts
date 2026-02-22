import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION12_TEMPLATES } from './seccion12-constants';

@Component({
  selector: 'app-seccion12-view',
  templateUrl: './seccion12-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    ImageUploadComponent
  ]
})
export class Seccion12ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.12';
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION12_TEMPLATES = SECCION12_TEMPLATES;

  readonly PHOTO_PREFIX_SALUD = 'fotografiaSalud';
  readonly PHOTO_PREFIX_IE_AYROCA = 'fotografiaIEAyroca';
  readonly PHOTO_PREFIX_IE_40270 = 'fotografiaIE40270';
  readonly PHOTO_PREFIX_RECREACION = 'fotografiaRecreacion';
  readonly PHOTO_PREFIX_DEPORTE = 'fotografiaDeporte';

  // ✅ Helper para obtener prefijo de grupo
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  // ✅ Signals de prefijo de foto CON GRUPO para el HTML
  readonly photoPrefixSaludSignal: Signal<string> = computed(() => {
    return `${this.PHOTO_PREFIX_SALUD}${this.obtenerPrefijo()}`;
  });

  readonly photoPrefixIEAyrocaSignal: Signal<string> = computed(() => {
    return `${this.PHOTO_PREFIX_IE_AYROCA}${this.obtenerPrefijo()}`;
  });

  readonly photoPrefixIE40270Signal: Signal<string> = computed(() => {
    return `${this.PHOTO_PREFIX_IE_40270}${this.obtenerPrefijo()}`;
  });

  readonly photoPrefixRecreacionSignal: Signal<string> = computed(() => {
    return `${this.PHOTO_PREFIX_RECREACION}${this.obtenerPrefijo()}`;
  });

  readonly photoPrefixDeporteSignal: Signal<string> = computed(() => {
    return `${this.PHOTO_PREFIX_DEPORTE}${this.obtenerPrefijo()}`;
  });

  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  readonly allSectionData: Signal<Record<string, any>> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const sectionData = this.formDataSignal();
    const legacyData = this.projectFacade.obtenerDatos();
    return { ...legacyData, ...sectionData };
  });

  readonly grupoAISDSignal: Signal<string> = computed(() => {
    const grupos = this.projectFacade.groupsByType('AISD')();
    return grupos.length > 0 ? grupos[0].nombre : '____';
  });

  readonly provinciaSignal: Signal<string> = computed(() => {
    const geoInfo = this.projectFacade.selectField(this.seccionId, null, 'geoInfo')() || {};
    return geoInfo.PROV || '____';
  });

  readonly parrafoSaludSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const manual = data[`parrafoSeccion12_salud_completo${prefijo}`];
    if (manual && String(manual).trim().length > 0) return String(manual);
    const grupoAISD = this.grupoAISDSignal();
    const provincia = this.provinciaSignal();
    return SECCION12_TEMPLATES.textosDefaultSalud.parrafo(grupoAISD, provincia);
  });

  readonly parrafoEducacionSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const manual = data[`parrafoSeccion12_educacion_completo${prefijo}`];
    if (manual && String(manual).trim().length > 0) return String(manual);
    const grupoAISD = this.grupoAISDSignal();
    return SECCION12_TEMPLATES.textosDefaultEducacion.parrafoEducacion(grupoAISD);
  });

  readonly parrafoInfraestructuraPostSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const manual = data[`textoInfraestructuraEducacionPost${prefijo}`];
    if (manual && String(manual).trim().length > 0 && String(manual).trim() !== '____') return String(manual);
    const grupoAISD = this.grupoAISDSignal();
    return SECCION12_TEMPLATES.textosDefaultEducacion.parrafoInfraestructuraPost(grupoAISD);
  });

  readonly parrafoRecreacionSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const manual = data[`parrafoSeccion12_recreacion_completo${prefijo}`];
    if (manual && String(manual).trim().length > 0) return String(manual);
    const grupoAISD = this.grupoAISDSignal();
    return SECCION12_TEMPLATES.textosDefaultRecreacion.parrafo(grupoAISD);
  });

  readonly parrafoDeporteSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const manual = data[`parrafoSeccion12_deporte_completo${prefijo}`];
    if (manual && String(manual).trim().length > 0) return String(manual);
    const grupoAISD = this.grupoAISDSignal();
    return SECCION12_TEMPLATES.textosDefaultDeporte.parrafo(grupoAISD);
  });

  readonly tablaSaludSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `caracteristicasSaludTabla${prefijo}`;
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return ((v && Array.isArray(v) && v.length > 0) ? v : this.caracteristicasSaludConfigSignal().estructuraInicial) || [];
  });

  readonly tablaEstudiantesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `cantidadEstudiantesEducacionTabla${prefijo}`;
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return ((v && Array.isArray(v) && v.length > 0) ? v : this.cantidadEstudiantesEducacionConfigSignal().estructuraInicial) || [];
  });

  readonly tablaIEAyrocaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `ieAyrocaTabla${prefijo}`;
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return ((v && Array.isArray(v) && v.length > 0) ? v : this.ieAyrocaConfigSignal().estructuraInicial) || [];
  });

  readonly tablaIE40270Signal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `ie40270Tabla${prefijo}`;
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return ((v && Array.isArray(v) && v.length > 0) ? v : this.ie40270ConfigSignal().estructuraInicial) || [];
  });

  readonly tablaAlumnosIEAyrocaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIEAyrocaTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTableData = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    const resultado = fromField ?? fromTableData ?? [];
    
    // ✅ SIEMPRE mostrar al menos una fila vacía (nunca "Sin datos")
    if (!Array.isArray(resultado) || resultado.length === 0) {
      return [{
        nombre: '',
        nivel: '',
        totalH: 0,
        totalM: 0,
        tresH: 0,
        tresM: 0,
        cuatroH: 0,
        cuatroM: 0,
        cincoH: 0,
        cincoM: 0
      }];
    }
    return resultado;
  });

  readonly tablaAlumnosIE40270Signal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIE40270Tabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTableData = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    const resultado = fromField ?? fromTableData ?? [];
    
    // ✅ SIEMPRE mostrar al menos una fila vacía (nunca "Sin datos")
    if (!Array.isArray(resultado) || resultado.length === 0) {
      return [{
        nombre: '',
        nivel: '',
        totalH: 0,
        totalM: 0,
        primeroH: 0,
        primeroM: 0,
        segundoH: 0,
        segundoM: 0,
        terceroH: 0,
        terceroM: 0,
        cuartoH: 0,
        cuartoM: 0,
        quintoH: 0,
        quintoM: 0,
        sextoH: 0,
        sextoM: 0
      }];
    }
    return resultado;
  });

  readonly fotosSaludSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_SALUD}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_SALUD}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_SALUD}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  readonly fotosIEAyrocaSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_IE_AYROCA}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_IE_AYROCA}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_IE_AYROCA}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  readonly fotosIE40270Signal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_IE_40270}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_IE_40270}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_IE_40270}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  readonly fotosRecreacionSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RECREACION}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RECREACION}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RECREACION}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  readonly fotosDeporteSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_DEPORTE}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_DEPORTE}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_DEPORTE}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  // ✅ SIGNAL PARA FOTOGRAFÍAS - ÚNICA VERDAD (PATRÓN OBLIGATORIO)
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefijo = this.obtenerPrefijo();
    const prefixes = [
      this.PHOTO_PREFIX_SALUD,
      this.PHOTO_PREFIX_IE_AYROCA,
      this.PHOTO_PREFIX_IE_40270,
      this.PHOTO_PREFIX_RECREACION,
      this.PHOTO_PREFIX_DEPORTE
    ];
    
    for (const prefix of prefixes) {
      for (let i = 1; i <= 10; i++) {
        const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo${prefijo}`)();
        const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente${prefijo}`)();
        const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen${prefijo}`)();
        
        if (imagen) {
          fotos.push({
            titulo: titulo || `Fotografía ${i}`,
            fuente: fuente || 'GEADES, 2024',
            imagen: imagen
          } as FotoItem);
        }
      }
    }
    
    return fotos;
  });

  private readonly TABLE_KEYS = [
    'caracteristicasSaludTabla',
    'cantidadEstudiantesEducacionTabla',
    'ieAyrocaTabla',
    'ie40270Tabla',
    'alumnosIEAyrocaTabla',
    'alumnosIE40270Tabla'
  ] as const;

  readonly tituloCaracteristicasSaludSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`caracteristicasSaludTitulo${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return `Principales características del Puesto de Salud ${this.grupoAISDSignal()}`;
  });

  readonly fuenteCaracteristicasSaludSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`caracteristicasSaludFuente${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'GEADES (2024)';
  });

  readonly tituloCantidadEstudiantesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`cantidadEstudiantesEducacionTitulo${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return `Infraestructura educativa – CC ${this.grupoAISDSignal()} (2023)`;
  });

  readonly fuenteCantidadEstudiantesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`cantidadEstudiantesEducacionFuente${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'GEADES (2024)';
  });

  readonly tituloIEAyrocaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`ieAyrocaTitulo${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'Características IE Ayroca';
  });

  readonly fuenteIEAyrocaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`ieAyrocaFuente${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'GEADES (2024)';
  });

  readonly tituloIE40270Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`ie40270Titulo${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'Características IE N°40270';
  });

  readonly fuenteIE40270Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`ie40270Fuente${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'GEADES (2024)';
  });

  readonly tituloAlumnosIEAyrocaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`alumnosIEAyrocaTitulo${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'Alumnos IE Ayroca por sexo y grado';
  });

  readonly fuenteAlumnosIEAyrocaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`alumnosIEAyrocaFuente${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'GEADES (2024)';
  });

  readonly tituloAlumnosIE40270Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`alumnosIE40270Titulo${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'Alumnos IE N°40270 por sexo y grado';
  });

  readonly fuenteAlumnosIE40270Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`alumnosIE40270Fuente${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    return 'GEADES (2024)';
  });

  readonly cantidadEstudiantesConPorcentajesSignal: Signal<any[]> = computed(() => {
    const tabla = this.tablaEstudiantesSignal();
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return [];
    const tablaSinTotal = tabla.filter((item: any) => {
      const institucion = item.institucion?.toString().toLowerCase() || '';
      return !institucion.includes('total');
    });
    const total = tablaSinTotal.reduce((sum, item) => {
      const totalItem = typeof item?.total === 'number' ? item.total : parseInt(item?.total) || 0;
      return sum + totalItem;
    }, 0);
    if (total <= 0) {
      return tablaSinTotal.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }
    const tablaConPorcentajes = tablaSinTotal.map((item: any) => {
      const totalItem = typeof item?.total === 'number' ? item.total : parseInt(item?.total) || 0;
      const porcentaje = (totalItem / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';
      return { ...item, total: totalItem, porcentaje: porcentajeFormateado };
    });
    tablaConPorcentajes.push({
      institucion: 'Total',
      nivel: '____',
      gestion: '____',
      total: total,
      porcentaje: '100,00 %'
    });
    return tablaConPorcentajes;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    // ✅ EFECTO PARA FOTOS: Solo depende de fotosCacheSignal (simple y directo)
    effect(() => {
      this.fotosCacheSignal();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });

    // ✅ EFECTO PARA TABLAS: Reacciona a cambios de datos sin causar bucles
    // NOTA: No incluir allSectionData() aquí para evitar bucles. Las tablas se manejan por Signals
    effect(() => {
      // Leer todas las señales de tabla para que el effect reaccione a cambios
      const tablas = [
        this.tablaSaludSignal(),
        this.tablaEstudiantesSignal(),
        this.tablaIEAyrocaSignal(),
        this.tablaIE40270Signal(),
        this.tablaAlumnosIEAyrocaSignal(),
        this.tablaAlumnosIE40270Signal()
      ];
      // Forzar detección de cambios cuando cualquier tabla cambia
      this.cdRef.markForCheck();
    });
  }

  readonly caracteristicasSaludConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `caracteristicasSaludTabla${this.obtenerPrefijo()}`,
    totalKey: 'categoria',
    estructuraInicial: [
      { categoria: 'Nombre', descripcion: '' },
      { categoria: 'Ubicación', descripcion: '' },
      { categoria: 'Director Médico y/o Responsable de la Atención de Salud', descripcion: '' },
      { categoria: 'Código Único de IPRESS', descripcion: '' },
      { categoria: 'Categoría del EESS', descripcion: '' },
      { categoria: 'Tipo de Establecimiento de Salud', descripcion: '' },
      { categoria: 'Nombre de la subcategoría (Clasificación)', descripcion: '' },
      { categoria: 'Estado del EESS', descripcion: '' },
      { categoria: 'Condición del EESS', descripcion: '' },
      { categoria: 'Nombre de DISA/DIRESA', descripcion: '' },
      { categoria: 'Nombre de RED', descripcion: '' },
      { categoria: 'Nombre de MICRORED', descripcion: '' },
      { categoria: 'Institución a la que pertenece el establecimiento', descripcion: '' },
      { categoria: 'Teléfono del establecimiento', descripcion: '' },
      { categoria: 'Grupo objetivo', descripcion: '' },
      { categoria: 'Número de ambientes con los que cuenta el establecimiento', descripcion: '' },
      { categoria: 'Horario de atención', descripcion: '' },
      { categoria: 'Número de atenciones mensuales', descripcion: '' },
      { categoria: 'Infraestructura y servicios', descripcion: '' }
    ]
  }));

  readonly cantidadEstudiantesEducacionConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `cantidadEstudiantesEducacionTabla${this.obtenerPrefijo()}`,
    totalKey: 'institucion',
    campoTotal: 'total',
    campoPorcentaje: 'porcentaje',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    estructuraInicial: [],
    calcularPorcentajes: true
  }));

  readonly ieAyrocaConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `ieAyrocaTabla${this.obtenerPrefijo()}`,
    totalKey: 'categoria',
    campoTotal: 'categoria',
    campoPorcentaje: 'descripcion',
    estructuraInicial: [
      { categoria: 'Tipo de I.E.', descripcion: '' },
      { categoria: 'Nombre del(la) director(a)', descripcion: '' },
      { categoria: 'Características y observaciones', descripcion: '' }
    ]
  }));

  readonly ie40270ConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `ie40270Tabla${this.obtenerPrefijo()}`,
    totalKey: 'categoria',
    campoTotal: 'categoria',
    campoPorcentaje: 'descripcion',
    estructuraInicial: [
      { categoria: 'Tipo de I.E.', descripcion: '' },
      { categoria: 'Nombre del(la) director(a)', descripcion: '' },
      { categoria: 'Características y observaciones', descripcion: '' }
    ]
  }));

  readonly alumnosIEAyrocaConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `alumnosIEAyrocaTabla${this.obtenerPrefijo()}`,
    totalKey: 'nombre',
    campoTotal: 'totalH',
    campoPorcentaje: 'totalM',
    estructuraInicial: [{ nombre: '', nivel: '', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 }]
  }));

  readonly alumnosIE40270ConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `alumnosIE40270Tabla${this.obtenerPrefijo()}`,
    totalKey: 'nombre',
    campoTotal: 'totalH',
    campoPorcentaje: 'totalM',
    estructuraInicial: [{ nombre: '', nivel: '', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 }]
  }));

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    
    this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_SALUD, groupPrefix);
    this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_IE_AYROCA, groupPrefix);
    this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_IE_40270, groupPrefix);
    this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_RECREACION, groupPrefix);
    this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_DEPORTE, groupPrefix);
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
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  trackByIndex(index: number): number {
    return index;
  }
}