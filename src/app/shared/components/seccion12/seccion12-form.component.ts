import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION12_PHOTO_PREFIX_SALUD, SECCION12_PHOTO_PREFIX_IE_AYROCA, SECCION12_PHOTO_PREFIX_IE_40270, SECCION12_PHOTO_PREFIX_RECREACION, SECCION12_PHOTO_PREFIX_DEPORTE, SECCION12_TEMPLATES } from './seccion12-constants';
import { SessionDataService } from 'src/app/core/services/session/session-data.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';

@Component({
  selector: 'app-seccion12-form',
  templateUrl: './seccion12-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageUploadComponent,
    CoreSharedModule
  ]
})
export class Seccion12FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.12';
  @Input() override modoFormulario: boolean = false;

  // ✅ Inyectar SessionDataService para almacenamiento temporal
  private sessionDataService = this.injector.get(SessionDataService);

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION12_TEMPLATES = SECCION12_TEMPLATES;

  readonly PHOTO_PREFIX_SALUD = 'fotografiaSalud';
  readonly PHOTO_PREFIX_IE_AYROCA = 'fotografiaIEAyroca';
  readonly PHOTO_PREFIX_IE_40270 = 'fotografiaIE40270';
  readonly PHOTO_PREFIX_RECREACION = 'fotografiaRecreacion';
  readonly PHOTO_PREFIX_DEPORTE = 'fotografiaDeporte';

  // ✅ Helper para obtener prefijo de grupo
  obtenerPrefijo(): string {
    return this.obtenerPrefijoGrupo();
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

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  // ✅ NUEVO: formDataSignal para UNICA_VERDAD
  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ OPTIMIZACIÓN: Una sola señal computada que obtiene TODOS los datos CON PREFIJO
  readonly allSectionData: Signal<Record<string, any>> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const allFields = [
      // Párrafos CON PREFIJO
      `parrafoSeccion12_salud_completo${prefijo}`, `parrafoSeccion12_educacion_completo${prefijo}`, `textoInfraestructuraEducacionPost${prefijo}`,
      `parrafoSeccion12_recreacion_completo${prefijo}`, `parrafoSeccion12_deporte_completo${prefijo}`,
      // Geo info (sin prefijo)
      'geoInfo',
      // Tablas CON PREFIJO
      `caracteristicasSaludTabla${prefijo}`, `cantidadEstudiantesEducacionTabla${prefijo}`, `ieAyrocaTabla${prefijo}`, `ie40270Tabla${prefijo}`,
      `alumnosIEAyrocaTabla${prefijo}`, `alumnosIE40270Tabla${prefijo}`,
      // Títulos y fuentes CON PREFIJO
      `caracteristicasSaludTitulo${prefijo}`, `caracteristicasSaludFuente${prefijo}`,
      `cantidadEstudiantesEducacionTitulo${prefijo}`, `cantidadEstudiantesEducacionFuente${prefijo}`,
      `ieAyrocaTitulo${prefijo}`, `ieAyrocaFuente${prefijo}`, `ie40270Titulo${prefijo}`, `ie40270Fuente${prefijo}`,
      `alumnosIEAyrocaTitulo${prefijo}`, `alumnosIEAyrocaFuente${prefijo}`, `alumnosIE40270Titulo${prefijo}`, `alumnosIE40270Fuente${prefijo}`
    ];

    // Fotos: agregar todos los campos de fotos CON PREFIJO (5 prefijos x 10 fotos x 3 campos = 150 campos)
    const photoPrefixes = [this.PHOTO_PREFIX_SALUD, this.PHOTO_PREFIX_IE_AYROCA, this.PHOTO_PREFIX_IE_40270, this.PHOTO_PREFIX_RECREACION, this.PHOTO_PREFIX_DEPORTE];
    photoPrefixes.forEach(prefix => {
      for (let i = 1; i <= 10; i++) {
        allFields.push(`${prefix}${i}Titulo${prefijo}`, `${prefix}${i}Fuente${prefijo}`, `${prefix}${i}Imagen${prefijo}`);
      }
    });

    const result: Record<string, any> = {};
    allFields.forEach(field => {
      result[field] = this.projectFacade.selectField(this.seccionId, null, field)();
    });
    return result;
  });

  // ✅ Señales derivadas optimizadas (dependen solo de allSectionData)
  readonly grupoAISDSignal: Signal<string> = computed(() => {
    const grupos = this.projectFacade.groupsByType('AISD')();
    return grupos.length > 0 ? grupos[0].nombre : '____';
  });

  readonly provinciaSignal: Signal<string> = computed(() => {
    const geoInfo = this.allSectionData()['geoInfo'] || {};
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

  readonly caracteristicasSaludConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `caracteristicasSaludTabla${this.obtenerPrefijo()}`,
    totalKey: 'categoria',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: true,
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
    noInicializarDesdeEstructura: true,
    estructuraInicial: [],
    calcularPorcentajes: true
  }));

  readonly ieAyrocaConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `ieAyrocaTabla${this.obtenerPrefijo()}`,
    totalKey: 'categoria',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: true,
    estructuraInicial: [
      { categoria: 'Tipo de I.E.', descripcion: '' },
      { categoria: 'Nombre del(la) director(a)', descripcion: '' },
      { categoria: 'Características y observaciones', descripcion: '' }
    ]
  }));

  readonly ie40270ConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `ie40270Tabla${this.obtenerPrefijo()}`,
    totalKey: 'categoria',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: true,
    estructuraInicial: [
      { categoria: 'Tipo de I.E.', descripcion: '' },
      { categoria: 'Nombre del(la) director(a)', descripcion: '' },
      { categoria: 'Características y observaciones', descripcion: '' }
    ]
  }));

  readonly alumnosIEAyrocaConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `alumnosIEAyrocaTabla${this.obtenerPrefijo()}`,
    totalKey: 'nombre',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: false,
    estructuraInicial: [
      { nombre: '', nivel: '', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 }
    ]
  }));

  readonly alumnosIE40270ConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `alumnosIE40270Tabla${this.obtenerPrefijo()}`,
    totalKey: 'nombre',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: false,
    estructuraInicial: [
      { nombre: '', nivel: '', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 }
    ]
  }));

  readonly tablaSaludSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const tablaKey = `caracteristicasSaludTabla${prefijo}`;
    const v = data[tablaKey] ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return ((v && Array.isArray(v) && v.length > 0) ? v : this.caracteristicasSaludConfigSignal().estructuraInicial) || [];
  });

  readonly tablaEstudiantesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const tablaKey = `cantidadEstudiantesEducacionTabla${prefijo}`;
    const v = data[tablaKey] ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return ((v && Array.isArray(v) && v.length > 0) ? v : this.cantidadEstudiantesEducacionConfigSignal().estructuraInicial) || [];
  });

  readonly tablaIEAyrocaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const tablaKey = `ieAyrocaTabla${prefijo}`;
    const v = data[tablaKey] ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return ((v && Array.isArray(v) && v.length > 0) ? v : this.ieAyrocaConfigSignal().estructuraInicial) || [];
  });

  readonly tablaIE40270Signal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const tablaKey = `ie40270Tabla${prefijo}`;
    const v = data[tablaKey] ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return ((v && Array.isArray(v) && v.length > 0) ? v : this.ie40270ConfigSignal().estructuraInicial) || [];
  });

  readonly tablaAlumnosIEAyrocaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const tablaKey = `alumnosIEAyrocaTabla${prefijo}`;
    const fromField = data[tablaKey];
    const fromTableData = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    const resultado = fromField ?? fromTableData ?? [];
    
    // ✅ SIEMPRE mostrar al menos una fila vacía editable (nunca "Sin datos")
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
    const data = this.allSectionData();
    const tablaKey = `alumnosIE40270Tabla${prefijo}`;
    const fromField = data[tablaKey];
    const fromTableData = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    const resultado = fromField ?? fromTableData ?? [];
    
    // ✅ SIEMPRE mostrar al menos una fila vacía editable (nunca "Sin datos")
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
    const data = this.allSectionData();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = data[`${this.PHOTO_PREFIX_SALUD}${i}Titulo${prefijo}`];
      const fuente = data[`${this.PHOTO_PREFIX_SALUD}${i}Fuente${prefijo}`];
      const imagen = data[`${this.PHOTO_PREFIX_SALUD}${i}Imagen${prefijo}`];
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
    const data = this.allSectionData();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = data[`${this.PHOTO_PREFIX_IE_AYROCA}${i}Titulo${prefijo}`];
      const fuente = data[`${this.PHOTO_PREFIX_IE_AYROCA}${i}Fuente${prefijo}`];
      const imagen = data[`${this.PHOTO_PREFIX_IE_AYROCA}${i}Imagen${prefijo}`];
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
    const data = this.allSectionData();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = data[`${this.PHOTO_PREFIX_IE_40270}${i}Titulo${prefijo}`];
      const fuente = data[`${this.PHOTO_PREFIX_IE_40270}${i}Fuente${prefijo}`];
      const imagen = data[`${this.PHOTO_PREFIX_IE_40270}${i}Imagen${prefijo}`];
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
    const data = this.allSectionData();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = data[`${this.PHOTO_PREFIX_RECREACION}${i}Titulo${prefijo}`];
      const fuente = data[`${this.PHOTO_PREFIX_RECREACION}${i}Fuente${prefijo}`];
      const imagen = data[`${this.PHOTO_PREFIX_RECREACION}${i}Imagen${prefijo}`];
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
    const data = this.allSectionData();
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = data[`${this.PHOTO_PREFIX_DEPORTE}${i}Titulo${prefijo}`];
      const fuente = data[`${this.PHOTO_PREFIX_DEPORTE}${i}Fuente${prefijo}`];
      const imagen = data[`${this.PHOTO_PREFIX_DEPORTE}${i}Imagen${prefijo}`];
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

  readonly tituloCaracteristicasSaludSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`caracteristicasSaludTitulo${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    const grupoAISD = this.grupoAISDSignal();
    return SECCION12_TEMPLATES.textosDefaultSalud.titulo(grupoAISD);
  });

  readonly fuenteCaracteristicasSaludSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`caracteristicasSaludFuente${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultSalud.fuente;
  });

  readonly tituloCantidadEstudiantesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`cantidadEstudiantesEducacionTitulo${prefijo}`];
    if (v && String(v).trim().length > 0) return String(v);
    const grupoAISD = this.grupoAISDSignal();
    return SECCION12_TEMPLATES.textosDefaultEducacion.tituloEstudiantes(grupoAISD);
  });

  readonly fuenteCantidadEstudiantesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`cantidadEstudiantesEducacionFuente${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultEducacion.fuenteEstudiantes;
  });

  readonly tituloIEAyrocaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`ieAyrocaTitulo${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultEducacion.tituloIEAyroca;
  });

  readonly fuenteIEAyrocaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`ieAyrocaFuente${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultEducacion.fuenteIEAyroca;
  });

  readonly tituloIE40270Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`ie40270Titulo${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultEducacion.tituloIE40270;
  });

  readonly fuenteIE40270Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`ie40270Fuente${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultEducacion.fuenteIE40270;
  });

  readonly tituloAlumnosIEAyrocaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`alumnosIEAyrocaTitulo${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultAlumnos.tituloAlumnosAyroca;
  });

  readonly fuenteAlumnosIEAyrocaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`alumnosIEAyrocaFuente${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultAlumnos.fuenteAlumnosAyroca;
  });

  readonly tituloAlumnosIE40270Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`alumnosIE40270Titulo${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultAlumnos.tituloAlumnos40270;
  });

  readonly fuenteAlumnosIE40270Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    const v = data[`alumnosIE40270Fuente${prefijo}`];
    return (v && String(v).trim().length > 0) ? String(v) : SECCION12_TEMPLATES.textosDefaultAlumnos.fuenteAlumnos40270;
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

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const data = this.allSectionData();
    let hash = '';
    const prefixes = [
      this.PHOTO_PREFIX_SALUD,
      this.PHOTO_PREFIX_IE_AYROCA,
      this.PHOTO_PREFIX_IE_40270,
      this.PHOTO_PREFIX_RECREACION,
      this.PHOTO_PREFIX_DEPORTE
    ];
    for (const prefix of prefixes) {
      for (let i = 1; i <= 10; i++) {
        const titulo = data[`${prefix}${i}Titulo${prefijo}`] || '';
        const fuente = data[`${prefix}${i}Fuente${prefijo}`] || '';
        const imagen = data[`${prefix}${i}Imagen${prefijo}`] ? '1' : '0';
        hash += `${titulo}|${fuente}|${imagen}|`;
      }
    }
    return hash;
  });

  readonly columnasSalud = [
    { field: 'categoria', label: 'Categoría', type: 'text' as const, readonly: true },
    { field: 'descripcion', label: 'Descripción', type: 'textarea' as const }
  ];

  readonly columnasEstudiantes = [
    { field: 'institucion', label: 'Nombre de IE', type: 'text' as const },
    { field: 'nivel', label: 'Nivel', type: 'text' as const },
    { field: 'gestion', label: 'Tipo de Gestión', type: 'text' as const },
    { field: 'total', label: 'Cantidad de estudiantes', type: 'number' as const },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text' as const, readonly: true }
  ];

  readonly columnasIECategoria = [
    { field: 'categoria', label: 'Categoría', type: 'text' as const, readonly: true },
    { field: 'descripcion', label: 'Descripción', type: 'textarea' as const }
  ];

  readonly columnasAlumnosAyroca = [
    { field: 'nombre', label: 'Nombre de IE', type: 'text' as const },
    { field: 'nivel', label: 'Nivel', type: 'text' as const },
    { field: 'totalH', label: 'Total H', type: 'number' as const },
    { field: 'totalM', label: 'Total M', type: 'number' as const },
    { field: 'tresH', label: '3 años H', type: 'number' as const },
    { field: 'tresM', label: '3 años M', type: 'number' as const },
    { field: 'cuatroH', label: '4 años H', type: 'number' as const },
    { field: 'cuatroM', label: '4 años M', type: 'number' as const },
    { field: 'cincoH', label: '5 años H', type: 'number' as const },
    { field: 'cincoM', label: '5 años M', type: 'number' as const }
  ];

  readonly columnasAlumnos40270 = [
    { field: 'nombre', label: 'Nombre de IE', type: 'text' as const },
    { field: 'nivel', label: 'Nivel', type: 'text' as const },
    { field: 'totalH', label: 'Total H', type: 'number' as const },
    { field: 'totalM', label: 'Total M', type: 'number' as const },
    { field: 'unoH', label: '1º H', type: 'number' as const },
    { field: 'unoM', label: '1º M', type: 'number' as const },
    { field: 'dosH', label: '2º H', type: 'number' as const },
    { field: 'dosM', label: '2º M', type: 'number' as const },
    { field: 'tresH', label: '3º H', type: 'number' as const },
    { field: 'tresM', label: '3º M', type: 'number' as const },
    { field: 'cuatroH', label: '4º H', type: 'number' as const },
    { field: 'cuatroM', label: '4º M', type: 'number' as const },
    { field: 'cincoH', label: '5º H', type: 'number' as const },
    { field: 'cincoM', label: '5º M', type: 'number' as const },
    { field: 'seisH', label: '6º H', type: 'number' as const },
    { field: 'seisM', label: '6º M', type: 'number' as const }
  ];

  readonly columnasAlumnos = this.columnasAlumnosAyroca; // Fallback por defecto

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private formChange: FormChangeService  // ✅ Para persistencia en Redis
  ) {
    super(cdRef, injector);

    // ✅ EFECTO PARA FOTOS: Solo depende de photoFieldsHash (NO CAUSAR BUCLES)
    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });
  }

  // Guardas para evitar escrituras repetidas
  private lastAyrocaTableHash: string = '';
  private last40270TableHash: string = '';

  /**
   * ⚠️ DESACTIVADO: Esta función causaba bucles infinitos al intentar inicializar
   * filas en un effect. El estado las inicializa correctamente cuando se cargan.
   * 
   * @deprecated - No usar dentro de effects
   */
  private ensureMinimumAlumnosRows(): void {
    // TODO: Si se necesita inicializar tablas, hacerlo SOLO en onInitCustom(), no en effects
    return;
  }

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
  }

  onCellChange(tablaKey: string, rowIndex: number, field: string, value: any): void {
    const tabla = this.datos[tablaKey] || [];
    if (rowIndex < 0) return;
    if (rowIndex >= tabla.length) {
      while (tabla.length <= rowIndex) tabla.push({});
    }
    tabla[rowIndex][field] = value;
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange(tablaKey, this.datos[tablaKey], { refresh: false });
    this.cdRef.markForCheck();
  }

  onFotografiasSaludChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_SALUD, fotografias);
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  onFotografiasIEAyrocaChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_IE_AYROCA, fotografias);
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  onFotografiasIE40270Change(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_IE_40270, fotografias);
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  onFotografiasRecreacionChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_RECREACION, fotografias);
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  onFotografiasDeporteChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_DEPORTE, fotografias);
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
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

  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    // 🔵 [SECCION12] Depuración de guardado de datos
    console.log(`🔵 [SECCION12] onFieldChange - Campo: ${fieldId}, Valor:`, value);

    // ⚠️ NO agregar prefijo aquí - puede que ya lo tenga desde onCaracteristicasSaludTableUpdated
    // Solo si NO tiene prefijo, agregarlo
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo && !fieldId.includes(prefijo) ? `${fieldId}${prefijo}` : fieldId;
    
    // Guardar en SessionDataService (backend) para datos temporales
    void this.sessionDataService.saveData(`seccion-12:${campoConPrefijo}`, value)
      .then(() => {
        console.log(`✅ [SECCION12] Datos guardados en backend: ${campoConPrefijo}`);
      })
      .catch((error) => {
        console.warn(`⚠️ [SECCION12] Error guardando en backend, usando fallback localStorage:`, error);
      });

    super.onFieldChange(campoConPrefijo, value, options);
  }

  trackByIndex(index: number): number {
    return index;
  }

  obtenerTabla(tablaKey: string): any[] {
    return this.datos[tablaKey] || [];
  }

  // ✅ HANDLERS DE TABLAS - Sincronización perfecta con ProjectState + Redis
  onCaracteristicasSaludTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `caracteristicasSaludTabla${prefijo}`;
    
    const tablaDelState = this.formDataSignal()[tablaKey];
    const datos = tablaDelState || updatedData || [];
    this.datos[tablaKey] = datos;
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { notifySync: true });
      console.log(`✅ [SECCION12] Tabla guardada en Redis: ${tablaKey}`);
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }

    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.detectChanges(); // ✅ INMEDIATO
  }

  onCantidadEstudiantesTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `cantidadEstudiantesEducacionTabla${prefijo}`;
    const tablaDelState = this.formDataSignal()[tablaKey];
    const datos = tablaDelState || updatedData || [];
    this.datos[tablaKey] = datos;
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { notifySync: true });
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }
    
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.detectChanges(); // ✅ INMEDIATO
  }

  onIEAyrocaTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `ieAyrocaTabla${prefijo}`;
    const tablaDelState = this.formDataSignal()[tablaKey];
    const datos = tablaDelState || updatedData || [];
    this.datos[tablaKey] = datos;
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { notifySync: true });
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }
    
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.detectChanges(); // ✅ INMEDIATO
  }

  onIE40270TableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `ie40270Tabla${prefijo}`;
    const tablaDelState = this.formDataSignal()[tablaKey];
    const datos = tablaDelState || updatedData || [];
    this.datos[tablaKey] = datos;
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { notifySync: true });
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }
    
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.detectChanges(); // ✅ INMEDIATO
  }

  onAlumnosIEAyrocaTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIEAyrocaTabla${prefijo}`;
    const tablaDelState = this.formDataSignal()[tablaKey];
    const datos = tablaDelState || updatedData || [];
    this.datos[tablaKey] = datos;
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { notifySync: true });
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }
    
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.detectChanges(); // ✅ INMEDIATO
  }

  onAlumnosIE40270TableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIE40270Tabla${prefijo}`;
    const tablaDelState = this.formDataSignal()[tablaKey];
    const datos = tablaDelState || updatedData || [];
    this.datos[tablaKey] = datos;
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { notifySync: true });
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }
    
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.detectChanges(); // ✅ INMEDIATO
  }

  // ✅ MÉTODOS PARA TABLA IE AYROCA (TABLA MULTINIVEL HTML)
  actualizarAlumnoAyroca(index: number, field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIEAyrocaTabla${prefijo}`;
    const tablaActual = this.formDataSignal()[tablaKey] || [];
    if (index >= 0 && index < tablaActual.length) {
      const fila = { ...tablaActual[index] };
      fila[field] = value;
      
      const tablaActualizada = [...tablaActual];
      tablaActualizada[index] = fila;
      
      // ✅ Persistir en Redis via FormChangeService
      try {
        this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActualizada }, { notifySync: true });
      } catch (error) {
        console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
      }
      
      this.onFieldChange(tablaKey, tablaActualizada, { refresh: true });
      this.cdRef.markForCheck();
    }
  }

  agregarAlumnoAyroca(): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIEAyrocaTabla${prefijo}`;
    const nuevoAlumno = {
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
    };

    const tablaActual = this.formDataSignal()[tablaKey] || [];
    const tablaActualizada = [...tablaActual, nuevoAlumno];
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActualizada }, { notifySync: true });
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }
    
    this.onFieldChange(tablaKey, tablaActualizada, { refresh: true });
    this.cdRef.markForCheck();
  }

  eliminarAlumnoAyroca(index: number): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIEAyrocaTabla${prefijo}`;
    const tablaActual = this.formDataSignal()[tablaKey] || [];
    if (index < 0 || index >= tablaActual.length) {
      return;
    }
    const tablaActualizada = tablaActual.filter((_: any, i: number) => i !== index);
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActualizada }, { notifySync: true });
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }
    
    this.onFieldChange(tablaKey, tablaActualizada, { refresh: true });
    this.cdRef.markForCheck();
  }

  // ✅ MÉTODOS PARA TABLA IE 40270 (TABLA MULTINIVEL HTML)
  actualizarAlumno40270(index: number, field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIE40270Tabla${prefijo}`;
    const tablaActual = this.formDataSignal()[tablaKey] || [];
    if (index >= 0 && index < tablaActual.length) {
      const fila = { ...tablaActual[index] };
      fila[field] = value;
      
      const tablaActualizada = [...tablaActual];
      tablaActualizada[index] = fila;
      
      // ✅ Persistir en Redis via FormChangeService
      try {
        this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActualizada }, { notifySync: true });
      } catch (error) {
        console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
      }
      
      this.onFieldChange(tablaKey, tablaActualizada, { refresh: true });
      this.cdRef.markForCheck();
    }
  }

  agregarAlumno40270(): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIE40270Tabla${prefijo}`;
    const nuevoAlumno = {
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
    };

    const tablaActual = this.formDataSignal()[tablaKey] || [];
    const tablaActualizada = [...tablaActual, nuevoAlumno];
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActualizada }, { notifySync: true });
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }
    
    this.onFieldChange(tablaKey, tablaActualizada, { refresh: true });
    this.cdRef.markForCheck();
  }

  eliminarAlumno40270(index: number): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `alumnosIE40270Tabla${prefijo}`;
    const tablaActual = this.formDataSignal()[tablaKey] || [];
    if (index < 0 || index >= tablaActual.length) {
      return;
    }
    const tablaActualizada = tablaActual.filter((_: any, i: number) => i !== index);
    
    // ✅ Persistir en Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActualizada }, { notifySync: true });
    } catch (error) {
      console.warn(`⚠️ [SECCION12] Error guardando tabla en Redis:`, error);
    }
    
    this.onFieldChange(tablaKey, tablaActualizada, { refresh: true });
    this.cdRef.markForCheck();
  }
}
