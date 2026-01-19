import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormularioDatos, CentroPobladoData, ComunidadCampesina } from '../models/formulario.model';
import { LoggerService } from './logger.service';
import { StateService } from './state.service';
import { ImageMigrationService } from './image-migration.service';
import { ImageBackendService } from './image-backend.service';

@Injectable({
  providedIn: 'root'
})
export class FormularioService {

  datos: FormularioDatos = {
    projectName: '',
    grupoAISD: '',
    grupoAISI: '',
    departamentoSeleccionado: '',
    provinciaSeleccionada: '',
    distritoSeleccionado: '',
    detalleProyecto: '',
    aisdComponente1: '',
    aisdComponente2: '',
    aisiComponente1: '',
    aisiComponente2: '',
    seleccionados: [],
    seleccionadosAISI: [],
    cantidadEntrevistas: '',
    cantidadEncuestas: '',
    fechaTrabajoCampo: '',
    componenteFuentesPrimarias1: '',
    componenteFuentesPrimarias2: '',
    justificacionAISI: '',
    pagina4DistDpto: '',
    consultora: '',
    entrevistados: [],
    muestra: '',
    universo: '',
    margen: '',
    nameuniverso: '',
    variable: '',
    fuente: '',
    nivel: '',
    detalleEncuesta: '',
    precisionEncuesta: '',
    encuestadoPorcentaje: '',
    noEncuestados: '',
    noResultadoPorcentaje: '',
    influenciaSocialDirecta: '',
    componente1Pagina5: '',
    descripcionTabla: '',
    componente2Pagina5: '',
    tablepagina6: [],
    imagenes: [],
    poblacionSexo: '',
    poblacionEtarios: '',
    codigos: [],
    coordenadasAISD: '',
    altitudAISD: '',
    centroPobladoAISI: '',
    centroPobladoSeleccionadoData: null,
    datosobtenidosAPI: [],
    datosobtenidosAPI2: [],
    detallePET: '',
    detallePetDistrital: '',
    detallePeaDistrital: '',
    detallePeaEmpleo1: '',
    encuestasIndependiente: '',
    encuestasDependientePublica: '',
    encuestasDependientePrivada: '',
    encuestasNoAplica: '',
    detallePeaSituacionEmpleo: '',
    detalleIngresos: '',
    ingresosMensualesPromedio: '',
    ingresosMaximo: '',
    detalleIndiceDesempleo: '',
    component1Data: '',
    myComponent: '',
    myComponent2: '',
    myComponent3: '',
    myComponent4: '',
    detalleCaracteristicasEconomicas: '',
    detalleCaracteristicasEconomicas2: '',
    encuestasNoAplicaPagina9: '',
    tablepagina9: [],
    datosobtenidosAPI3: [],
    viviendasComponent1: '',
    viviendasComponent2: '',
    totalViviendas: '',
    totalViviendasOcupadas: '',
    porcentajeViviendasOcupadas: '',
    imagenes2: [],
    datosobtenidosAPI4: {},
    textoInstitucionalidad: '',
    textoDemografiaAISD: '',
    textoPEA_AISD: '',
    textoActividadesEconomicasAISD: '',
    textoUsoSuelos: '',
    textoRecursosNaturales: '',
    textoIDH: '',
    textoNBI: '',
    textoOrganizacionSocial: '',
    textoFestividades: '',
    textoCostumbres: '',
    textoTurismo: '',
    textoDemografiaAISI: '',
    textoPEA_AISI: '',
    textoActividadesEconomicasAISI: '',
    textoViviendaAISI: '',
    textoServiciosBasicosAISI: '',
    textoTransporteAISI: '',
    textoTelecomunicacionesAISI: '',
    textoInfraestructuraAISI: '',
    textoSaludAISI: '',
    textoEducacionAISI: '',
    textoInfraestructuraEducacionPost: '',
    cantidadEstudiantesEducacionTabla: [],
    ieAyrocaTabla: [],
    ie40270Tabla: [],
    textoAlumnosPorSexoGrado: '',
    alumnosIEAyrocaTabla: [],
    alumnosIE40270Tabla: [],
    totalH: '',
    totalM: '',
    textoNatalidadMortalidad: '',
    natalidadMortalidadTabla: [],
    textoMorbilidad: '',
    morbiliadTabla: [],
    morbilidadTabla: [],
    textoAfiliacionSalud: '',
    afiliacionSaludTabla: [],
    fotografias: [],
    comunidadesCampesinas: [],
    parrafoSeccion1_principal: '',
    parrafoSeccion1_4: '',
    objetivoSeccion1_1: '',
    objetivoSeccion1_2: '',
    parrafoSeccion2_introduccion: '',
    parrafoSeccion2_aisd_completo: '',
    parrafoSeccion2_aisi_completo: '',
    parrafoSeccion3_metodologia: '',
    parrafoSeccion3_fuentes_primarias: '',
    parrafoSeccion3_fuentes_primarias_cuadro: '',
    parrafoSeccion3_fuentes_secundarias: '',
    fuentesSecundariasLista: [
      'Base de Datos de Pueblos Indígenas u Originarios – BDPI.',
      'Censos Nacionales 2017 (XII de Población, VII de Vivienda y III de Comunidades Indígenas) ejecutados por el Instituto Nacional de Estadística e Informática (INEI).',
      'Estadísticas de la Calidad Educativa (ESCALE) de la Unidad de Estadística del Ministerio de Educación (MINEDU).',
      'Ministerio de Energía y Minas (MINEM).',
      'Ministerio de Trabajo y Promoción del Empleo (MTPE).',
      'Ministerio de Transporte y Comunicaciones (MTC).',
      'Observatorio Socio Económico Laboral (OSEL).',
      'Organismo Supervisor de Inversión Privada en Telecomunicaciones – OSIPTEL.',
      'Programa de Naciones Unidas para el Desarrollo – PNUD.',
      'Registro Nacional de Instituciones Prestadoras de Servicios de Salud (RENIPRESS).',
      'Repositorio Digital de Información Multisectorial (REDINFORMA) – MIDIS.',
      'Repositorio Único Nacional de Información en Salud (REUNIS).',
      'Resultados Definitivos de la Población Económicamente Activa 2017 – INEI.',
      'Sistema de Información Distrital para la Gestión Pública – INEI.'
    ],
    parrafoSeccion5_institucionalidad: '',
    parrafoSeccion5_institucionalidad_A1: '',
    parrafoSeccion5_institucionalidad_A2: '',
    parrafoSeccion4_introduccion_aisd: '',
    parrafoSeccion4_comunidad_completo: '',
    parrafoSeccion4_caracterizacion_indicadores: '',
    parrafoSeccion7_situacion_empleo_completo: '',
    parrafoSeccion7_ingresos_completo: '',
    parrafoSeccion8_ganaderia_completo: '',
    parrafoSeccion8_agricultura_completo: '',
    parrafoSeccion10_servicios_basicos_intro: '',
    parrafoSeccion11_transporte_completo: '',
    parrafoSeccion11_telecomunicaciones_completo: '',
    parrafoSeccion12_salud_completo: '',
    parrafoSeccion12_educacion_completo: '',
    parrafoSeccion13_natalidad_mortalidad_completo: '',
    parrafoSeccion13_morbilidad_completo: '',
    parrafoSeccion14_indicadores_educacion_intro: '',
    parrafoSeccion21_aisi_intro_completo: '',
    parrafoSeccion21_centro_poblado_completo: '',
    parrafoSeccion15_religion_completo: '',
    parrafoSeccion16_agua_completo: '',
    parrafoSeccion16_recursos_naturales_completo: '',
    parrafoSeccion30_indicadores_educacion_intro: '',
  };

  jsonData: CentroPobladoData[] = [];
  private readonly STORAGE_KEY = 'formulario_datos';
  private readonly STORAGE_JSON_KEY = 'formulario_json';
  private readonly STORAGE_TABLA_FILAS_KEY = 'tabla_aisd2_filas_activas';
  private saveDebounceSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private stateService: StateService,
    private imageMigration: ImageMigrationService,
    private imageBackendService: ImageBackendService
  ) {
    this.cargarDesdeLocalStorage();
    this.sincronizarConEstado();
    this.ejecutarMigracionImagenes();
    this.inicializarDebounceGuardado();
  }

  private inicializarDebounceGuardado(): void {
    this.saveDebounceSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.ejecutarGuardado();
    });
  }

  private async ejecutarMigracionImagenes(): Promise<void> {
    const MIGRATION_KEY = 'imagenes_migradas_v1';
    
    // Verificar si ya se ejecutó la migración
    if (localStorage.getItem(MIGRATION_KEY)) {
      return;
    }

    try {
      const tamanioActual = this.imageMigration.obtenerTamanioLocalStorage();
      
      // Solo migrar si el tamaño es mayor a 3 MB
      if (tamanioActual > 3) {
        this.logger.info('Iniciando migración automática de imágenes...');
        await this.imageMigration.comprimirImagenesEnLocalStorage();
        localStorage.setItem(MIGRATION_KEY, 'true');
        this.logger.info('Migración completada exitosamente');
        
        // Recargar datos desde localStorage
        this.cargarDesdeLocalStorage();
      }
    } catch (error) {
      this.logger.error('Error durante la migración automática:', error);
    }
  }

  private sincronizarConEstado(): void {
    this.stateService.setDatos(this.datos);
  }

  actualizarDato(campo: keyof FormularioDatos, valor: any): void {
    if (this.datos) {
      (this.datos as any)[campo] = valor;
      this.programarGuardado();
      this.stateService.updateDato(campo, valor);
    }
  }

  actualizarDatos(nuevosDatos: Partial<FormularioDatos>): void {
    this.datos = { ...this.datos, ...nuevosDatos };
    this.programarGuardado();
    this.stateService.setDatos(this.datos);
  }

  reemplazarDatos(nuevosDatos: FormularioDatos): void {
    if (!nuevosDatos) {
      this.logger.warn('reemplazarDatos: nuevosDatos es null o undefined');
      return;
    }
    try {
      this.datos = JSON.parse(JSON.stringify(nuevosDatos));
      this.stateService.setDatos(this.datos);
    } catch (error) {
      this.logger.error('Error al reemplazar datos', error);
      this.datos = { ...nuevosDatos };
      this.stateService.setDatos(this.datos);
    }
  }

  obtenerDatos(): FormularioDatos {
    return this.datos;
  }

  guardarJSON(data: CentroPobladoData[]): void {
    this.jsonData = data;
    this.guardarJSONEnLocalStorage();
  }

  obtenerJSON(): CentroPobladoData[] {
    return this.jsonData;
  }

  private programarGuardado(): void {
    this.saveDebounceSubject.next();
  }

  private ejecutarGuardado(): void {
    try {
      const datosSerializados = JSON.stringify(this.datos);
      const tamanioMB = new Blob([datosSerializados]).size / (1024 * 1024);
      
      if (tamanioMB > 4) {
        this.logger.warn(`Los datos son muy grandes (${tamanioMB.toFixed(2)} MB). Algunas imágenes pueden no guardarse correctamente.`);
      }
      
      localStorage.setItem(this.STORAGE_KEY, datosSerializados);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        this.logger.error('Error: localStorage está lleno. Intenta eliminar datos antiguos o reducir el tamaño de las imágenes.');
      } else {
        this.logger.error('Error al guardar en localStorage', error);
      }
    }
  }

  private guardarEnLocalStorage(): void {
    this.ejecutarGuardado();
  }

  private guardarJSONEnLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_JSON_KEY, JSON.stringify(this.jsonData));
    } catch (error) {
      this.logger.error('Error al guardar JSON en localStorage', error);
    }
  }

  private cargarDesdeLocalStorage(): void {
    try {
      const datosGuardados = localStorage.getItem(this.STORAGE_KEY);
      if (datosGuardados) {
        const datosCargados = JSON.parse(datosGuardados);
        Object.keys(datosCargados).forEach(key => {
          (this.datos as any)[key] = datosCargados[key];
        });
      }

      const jsonGuardado = localStorage.getItem(this.STORAGE_JSON_KEY);
      if (jsonGuardado) {
        this.jsonData = JSON.parse(jsonGuardado);
      }
    } catch (error) {
      this.logger.error('Error al cargar desde localStorage', error);
    }
  }

  guardarFilasActivasTablaAISD2(codigosActivos: string[], prefijo: string = ''): void {
    try {
      const key = prefijo ? `${this.STORAGE_TABLA_FILAS_KEY}${prefijo}` : this.STORAGE_TABLA_FILAS_KEY;
      localStorage.setItem(key, JSON.stringify(codigosActivos));
    } catch (error) {
      this.logger.error('Error al guardar filas activas', error);
    }
  }

  obtenerFilasActivasTablaAISD2(prefijo: string = ''): string[] {
    try {
      const key = prefijo ? `${this.STORAGE_TABLA_FILAS_KEY}${prefijo}` : this.STORAGE_TABLA_FILAS_KEY;
      const filasGuardadas = localStorage.getItem(key);
      if (filasGuardadas) {
        return JSON.parse(filasGuardadas);
      }
      if (!prefijo) {
        const filasA1 = localStorage.getItem(`${this.STORAGE_TABLA_FILAS_KEY}_A1`);
        if (filasA1) {
          return JSON.parse(filasA1);
        }
      }
    } catch (error) {
      this.logger.error('Error al obtener filas activas', error);
    }
    return [];
  }

  limpiarDatos() {
    const formularioId = this.datos.projectName || 'default';
    if (formularioId && formularioId !== 'default') {
      this.imageBackendService.deleteAllFormularioImages(formularioId).subscribe({
        next: (response) => {
          this.logger.info(`Se eliminaron ${response.deleted_count} imagen(es) del backend`);
        },
        error: (error) => {
          this.logger.warn('Error al eliminar imágenes del backend:', error);
        }
      });
    }
    
    this.datos = {
      projectName: '',
      grupoAISD: '',
      grupoAISI: '',
      departamentoSeleccionado: '',
      provinciaSeleccionada: '',
      distritoSeleccionado: '',
      detalleProyecto: '',
      aisdComponente1: '',
      aisdComponente2: '',
      aisiComponente1: '',
      aisiComponente2: '',
    seleccionados: [],
    seleccionadosAISI: [],
      cantidadEntrevistas: '',
      cantidadEncuestas: '',
      fechaTrabajoCampo: '',
      componenteFuentesPrimarias1: '',
      componenteFuentesPrimarias2: '',
      justificacionAISI: '',
      pagina4DistDpto: '',
      consultora: '',
      entrevistados: [],
      muestra: '',
      universo: '',
      margen: '',
      nameuniverso: '',
      variable: '',
      fuente: '',
      nivel: '',
      detalleEncuesta: '',
      precisionEncuesta: '',
      encuestadoPorcentaje: '',
      noEncuestados: '',
      noResultadoPorcentaje: '',
      influenciaSocialDirecta: '',
      componente1Pagina5: '',
      descripcionTabla: '',
      componente2Pagina5: '',
      tablepagina6: [],
      imagenes: [],
      poblacionSexo: '',
      poblacionEtarios: '',
      codigos: [],
      coordenadasAISD: '',
      altitudAISD: '',
      centroPobladoAISI: '',
      centroPobladoSeleccionadoData: null,
      datosobtenidosAPI: [],
      datosobtenidosAPI2: [],
      detallePET: '',
      detallePetDistrital: '',
      detallePeaDistrital: '',
      detallePeaEmpleo1: '',
      encuestasIndependiente: '',
      encuestasDependientePublica: '',
      encuestasDependientePrivada: '',
      encuestasNoAplica: '',
      detallePeaSituacionEmpleo: '',
      detalleIngresos: '',
      ingresosMensualesPromedio: '',
      ingresosMaximo: '',
      detalleIndiceDesempleo: '',
      component1Data: '',
      myComponent: '',
      myComponent2: '',
      myComponent3: '',
      myComponent4: '',
      detalleCaracteristicasEconomicas: '',
      detalleCaracteristicasEconomicas2: '',
      encuestasNoAplicaPagina9: '',
      tablepagina9: [],
      datosobtenidosAPI3: [],
      viviendasComponent1: '',
      viviendasComponent2: '',
      totalViviendas: '',
      totalViviendasOcupadas: '',
      porcentajeViviendasOcupadas: '',
      imagenes2: [],
      datosobtenidosAPI4: {},
      textoInstitucionalidad: '',
      textoDemografiaAISD: '',
      textoPEA_AISD: '',
      textoActividadesEconomicasAISD: '',
      textoUsoSuelos: '',
      textoRecursosNaturales: '',
      textoIDH: '',
      textoNBI: '',
      textoOrganizacionSocial: '',
      textoFestividades: '',
      textoCostumbres: '',
      textoTurismo: '',
      textoDemografiaAISI: '',
      textoPEA_AISI: '',
      textoActividadesEconomicasAISI: '',
      textoViviendaAISI: '',
      textoServiciosBasicosAISI: '',
      textoTransporteAISI: '',
      textoTelecomunicacionesAISI: '',
      textoInfraestructuraAISI: '',
      textoSaludAISI: '',
      textoEducacionAISI: '',
      textoInfraestructuraEducacionPost: '',
      cantidadEstudiantesEducacionTabla: [],
      ieAyrocaTabla: [],
      ie40270Tabla: [],
      textoAlumnosPorSexoGrado: '',
      alumnosIEAyrocaTabla: [],
      alumnosIE40270Tabla: [],
      totalH: '',
      totalM: '',
      textoNatalidadMortalidad: '',
      natalidadMortalidadTabla: [],
      textoMorbilidad: '',
      morbiliadTabla: [],
      morbilidadTabla: [],
      textoAfiliacionSalud: '',
      afiliacionSaludTabla: [],
      fotografias: [],
      parrafoSeccion1_principal: '',
      parrafoSeccion1_4: '',
      objetivoSeccion1_1: '',
      objetivoSeccion1_2: '',
      parrafoSeccion2_introduccion: '',
      parrafoSeccion2_aisd_completo: '',
      parrafoSeccion2_aisi_completo: '',
      parrafoSeccion3_metodologia: '',
      parrafoSeccion3_fuentes_primarias: '',
      parrafoSeccion3_fuentes_primarias_cuadro: '',
      parrafoSeccion3_fuentes_secundarias: '',
      fuentesSecundariasLista: [
        'Base de Datos de Pueblos Indígenas u Originarios – BDPI.',
        'Censos Nacionales 2017 (XII de Población, VII de Vivienda y III de Comunidades Indígenas) ejecutados por el Instituto Nacional de Estadística e Informática (INEI).',
        'Estadísticas de la Calidad Educativa (ESCALE) de la Unidad de Estadística del Ministerio de Educación (MINEDU).',
        'Ministerio de Energía y Minas (MINEM).',
        'Ministerio de Trabajo y Promoción del Empleo (MTPE).',
        'Ministerio de Transporte y Comunicaciones (MTC).',
        'Observatorio Socio Económico Laboral (OSEL).',
        'Organismo Supervisor de Inversión Privada en Telecomunicaciones – OSIPTEL.',
        'Programa de Naciones Unidas para el Desarrollo – PNUD.',
        'Registro Nacional de Instituciones Prestadoras de Servicios de Salud (RENIPRESS).',
        'Repositorio Digital de Información Multisectorial (REDINFORMA) – MIDIS.',
        'Repositorio Único Nacional de Información en Salud (REUNIS).',
        'Resultados Definitivos de la Población Económicamente Activa 2017 – INEI.',
        'Sistema de Información Distrital para la Gestión Pública – INEI.'
      ],
      parrafoSeccion5_institucionalidad: '',
      parrafoSeccion5_institucionalidad_A1: '',
      parrafoSeccion5_institucionalidad_A2: '',
      parrafoSeccion4_introduccion_aisd: '',
      parrafoSeccion4_comunidad_completo: '',
      parrafoSeccion4_caracterizacion_indicadores: '',
      parrafoSeccion7_situacion_empleo_completo: '',
      parrafoSeccion7_ingresos_completo: '',
      parrafoSeccion8_ganaderia_completo: '',
      parrafoSeccion8_agricultura_completo: '',
      parrafoSeccion10_servicios_basicos_intro: '',
      parrafoSeccion11_transporte_completo: '',
      parrafoSeccion11_telecomunicaciones_completo: '',
      parrafoSeccion12_salud_completo: '',
      parrafoSeccion12_educacion_completo: '',
      parrafoSeccion13_natalidad_mortalidad_completo: '',
      parrafoSeccion13_morbilidad_completo: '',
      parrafoSeccion14_indicadores_educacion_intro: '',
      parrafoSeccion21_aisi_intro_completo: '',
      parrafoSeccion21_centro_poblado_completo: '',
      parrafoSeccion15_religion_completo: '',
      parrafoSeccion16_agua_completo: '',
      parrafoSeccion16_recursos_naturales_completo: '',
      parrafoSeccion30_indicadores_educacion_intro: '',
      comunidadesCampesinas: [],
    };
    this.jsonData = [];
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_JSON_KEY);
    localStorage.removeItem(this.STORAGE_TABLA_FILAS_KEY);
    
    const prefijos = ['_A1', '_A2', '_A3', '_A4', '_A5', '_B1', '_B2'];
    prefijos.forEach(prefijo => {
      localStorage.removeItem(`${this.STORAGE_TABLA_FILAS_KEY}${prefijo}`);
    });
    
    prefijos.forEach(prefijo => {
      for (let i = 1; i <= 20; i++) {
        const campos = [
          `tablaAISD2Fila${i}Punto${prefijo}`,
          `tablaAISD2Fila${i}Codigo${prefijo}`,
          `tablaAISD2Fila${i}Poblacion${prefijo}`,
          `tablaAISD2Fila${i}ViviendasEmpadronadas${prefijo}`,
          `tablaAISD2Fila${i}ViviendasOcupadas${prefijo}`
        ];
        campos.forEach(campo => {
          if (this.datos[campo as keyof FormularioDatos]) {
            delete this.datos[campo as keyof FormularioDatos];
          }
        });
      }
    });
    
    this.stateService.setDatos(this.datos);
  }

  aplicarTransformacionesMock(datos: any): any {
    const datosTransformados = { ...datos };

    if (datosTransformados.fotografias && Array.isArray(datosTransformados.fotografias)) {
      datosTransformados.fotografias.forEach((foto: any, index: number) => {
        const numero = foto.numero || `${index + 1}`;
        const partes = numero.split('.');
        if (partes.length >= 2) {
          const numFoto = parseInt(partes[1].trim());
          if (!isNaN(numFoto) && numFoto >= 1 && numFoto <= 10) {
            datosTransformados[`fotografiaAISD${numFoto}Titulo`] = foto.titulo || '';
            datosTransformados[`fotografiaAISD${numFoto}Fuente`] = foto.fuente || '';
            datosTransformados[`fotografiaAISD${numFoto}Imagen`] = foto.ruta || '';
          }
        }
      });
    }

    const aliasPairs: Array<[string, string]> = [
      ['textoPoblacionSexoAISD', 'textoPoblacionSexo'],
      ['poblacionSexoAISD', 'poblacionSexoTabla'],
      ['textoPoblacionEtarioAISD', 'textoPoblacionEtario'],
      ['poblacionEtarioAISD', 'poblacionEtarioTabla']
    ];

    aliasPairs.forEach(([dest, src]) => {
      if (datosTransformados[dest] === undefined && datosTransformados[src] !== undefined) {
        datosTransformados[dest] = datosTransformados[src];
      }
    });

    if (datosTransformados.tablaAISD2TotalPoblacion === undefined && Array.isArray(datosTransformados.poblacionSexoAISD)) {
      const total = datosTransformados.poblacionSexoAISD.reduce((sum: number, item: any) => {
        const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
        return sum + casos;
      }, 0);
      datosTransformados.tablaAISD2TotalPoblacion = total;
    }

    if (!datosTransformados.parrafoSeccion13_natalidad_mortalidad_completo && datosTransformados.textoNatalidadMortalidad) {
      datosTransformados.parrafoSeccion13_natalidad_mortalidad_completo = datosTransformados.textoNatalidadMortalidad;
    }

    if (!datosTransformados.parrafoSeccion13_morbilidad_completo && datosTransformados.textoMorbilidad) {
      datosTransformados.parrafoSeccion13_morbilidad_completo = datosTransformados.textoMorbilidad;
    }

    const fuenteMorbilidad = datosTransformados.morbilidadCpTabla || datosTransformados.morbiliadTabla || datosTransformados.morbilidadTabla;
    if (Array.isArray(fuenteMorbilidad) && fuenteMorbilidad.length > 0) {
      const toInt = (valor: any): number => parseInt(String(valor ?? '0').replace(/\s+/g, '')) || 0;
      const tablaTransformada = fuenteMorbilidad.map((item: any) => ({
        grupo: item.grupo || '____',
        rango0_11: toInt(item.rango0_11 ?? item.edad0_11 ?? '0'),
        rango12_17: toInt(item.rango12_17 ?? item.edad12_17 ?? '0'),
        rango18_29: toInt(item.rango18_29 ?? item.edad18_29 ?? '0'),
        rango30_59: toInt(item.rango30_59 ?? item.edad30_59 ?? '0'),
        rango60: toInt(item.rango60 ?? item.edad60_mas ?? '0'),
        casos: toInt(item.casos ?? '0')
      }));
      datosTransformados.morbilidadTabla = tablaTransformada;
      datosTransformados.morbiliadTabla = tablaTransformada;
    }

    if (Array.isArray(datosTransformados.natalidadMortalidadTabla) && datosTransformados.natalidadMortalidadTabla.length > 0) {
      datosTransformados.natalidadMortalidadTabla = datosTransformados.natalidadMortalidadTabla.map((item: any) => ({
        anio: item.anio || '____',
        natalidad: parseInt(String(item.natalidad ?? '0')) || 0,
        mortalidad: parseInt(String(item.mortalidad ?? '0')) || 0
      }));
    }

    if (Array.isArray(datosTransformados.afiliacionSaludTabla) && datosTransformados.afiliacionSaludTabla.length > 0) {
      datosTransformados.afiliacionSaludTabla = datosTransformados.afiliacionSaludTabla.map((item: any) => ({
        categoria: item.categoria || '____',
        casos: parseInt(String(item.casos ?? '0')) || 0,
        porcentaje: item.porcentaje || '0%'
      }));
      
      datosTransformados.afiliacionSaludTabla.forEach((item: any) => {
        if (item.categoria?.includes('SIS') && !item.categoria?.includes('ESSALUD')) {
          datosTransformados.porcentajeSIS = item.porcentaje?.replace(/[^0-9,]/g, '') || '84,44';
        } else if (item.categoria?.includes('ESSALUD')) {
          datosTransformados.porcentajeESSALUD = item.porcentaje?.replace(/[^0-9,]/g, '') || '3,56';
        } else if (item.categoria?.includes('sin seguro') || item.categoria?.includes('Ningún')) {
          datosTransformados.porcentajeSinSeguro = item.porcentaje?.replace(/[^0-9,]/g, '') || '12,00';
        }
      });
    }

    const normalizarTablaVivienda = (tabla: any[]) => tabla.map((item: any) => ({
      categoria: item.categoria || '____',
      casos: parseInt(String(item.casos ?? '0')) || 0,
      porcentaje: item.porcentaje || '0%'
    }));

    if (Array.isArray(datosTransformados.tiposViviendaCpTabla) && datosTransformados.tiposViviendaCpTabla.length > 0) {
      const tablaTransformada = normalizarTablaVivienda(datosTransformados.tiposViviendaCpTabla);
      datosTransformados.tiposViviendaCpTabla = tablaTransformada;
      datosTransformados.tiposViviendaAISI = tablaTransformada;
    }

    if (Array.isArray(datosTransformados.condicionOcupacionCpTabla) && datosTransformados.condicionOcupacionCpTabla.length > 0) {
      const tablaTransformada = normalizarTablaVivienda(datosTransformados.condicionOcupacionCpTabla);
      datosTransformados.condicionOcupacionCpTabla = tablaTransformada;
      datosTransformados.condicionOcupacionAISI = tablaTransformada;
    }

    if (Array.isArray(datosTransformados.tiposMaterialesTabla) && datosTransformados.tiposMaterialesTabla.length > 0) {
      const materialesTransformada = datosTransformados.tiposMaterialesTabla.map((item: any) => ({
        categoria: item.categoria || '____',
        tipoMaterial: item.tipoMaterial || '____',
        casos: parseInt(String(item.casos ?? '0')) || 0,
        porcentaje: item.porcentaje || '0%'
      }));
      datosTransformados.tiposMaterialesTabla = materialesTransformada;
      datosTransformados.materialesViviendaAISI = materialesTransformada;
    }

    if (datosTransformados.textoViviendas && !datosTransformados.textoViviendaAISI) {
      datosTransformados.textoViviendaAISI = datosTransformados.textoViviendas;
    }

    if (datosTransformados.textoEstructura && !datosTransformados.textoEstructuraAISI) {
      datosTransformados.textoEstructuraAISI = datosTransformados.textoEstructura;
    }

    if (!datosTransformados.textoEstructuraAISI && Array.isArray(datosTransformados.tiposMaterialesTabla) && datosTransformados.tiposMaterialesTabla.length > 0) {
      const pisosTierra = datosTransformados.tiposMaterialesTabla.find((item: any) => 
        item.categoria?.includes('pisos') && item.tipoMaterial?.includes('Tierra')
      );
      const pisosCemento = datosTransformados.tiposMaterialesTabla.find((item: any) => 
        item.categoria?.includes('pisos') && item.tipoMaterial?.includes('Cemento')
      );
      const porcTierra = pisosTierra?.porcentaje || '79,59 %';
      const porcCemento = pisosCemento?.porcentaje || '20,41 %';
      const distrito = datosTransformados.distritoSeleccionado || 'Cahuacho';
      
      datosTransformados.textoEstructuraAISI = `Según la información recabada de los Censos Nacionales 2017, dentro del CP ${distrito}, el único material empleado para la construcción de las paredes de las viviendas es el adobe. Respecto a los techos, también se cuenta con un único material, que son las planchas de calamina, fibra de cemento o similares.\n\nFinalmente, en cuanto a los pisos, la mayoría están hechos de tierra (${porcTierra}). El porcentaje restante, que consta del ${porcCemento}, cuentan con pisos elaborados a base de cemento.`;
    }

    if (!datosTransformados.centroPobladoAISI && datosTransformados.distritoSeleccionado) {
      datosTransformados.centroPobladoAISI = datosTransformados.distritoSeleccionado;
    }

    if (!datosTransformados.textoOcupacionViviendaAISI && datosTransformados.condicionOcupacionCpTabla) {
      const ocupadasPresentes = datosTransformados.condicionOcupacionCpTabla.find((item: any) => 
        item.categoria?.includes('presentes')
      );
      const porcentaje = ocupadasPresentes?.porcentaje || '29,88 %';
      const casos = ocupadasPresentes?.casos || '49';
      const distrito = datosTransformados.distritoSeleccionado || 'Cahuacho';
      datosTransformados.textoOcupacionViviendaAISI = `Para poder describir el acápite de estructura de las viviendas de esta localidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas con personas presentes que llegan a la cantidad de ${casos}. A continuación, se muestra el cuadro con la información respecto a la condición de ocupación de viviendas, tal como realiza el Censo Nacional 2017. De aquí se halla que las viviendas ocupadas con personas presentes representan el ${porcentaje} del conjunto analizado.`;
    }

    return datosTransformados;
  }

  async cargarMockCapitulo3(): Promise<boolean> {
    const timestamp = new Date().getTime();
    const url = `/assets/mockData/capitulo3.json?v=${timestamp}`;
    
    try {
      const data = await firstValueFrom(this.http.get<any>(url));
      
      if (!data) {
        this.logger.error('Mock vacío o no encontrado', null, url);
        return false;
      }
      
      if (!data.datos) {
        this.logger.error('No se encontró la propiedad "datos" en el JSON');
        return false;
      }
      
      const datosTransformados = this.aplicarTransformacionesMock(data.datos);
      
      this.actualizarDatos(datosTransformados);
      
      if (data?.json) {
        this.guardarJSON(data.json);
      }
      
      return true;
    } catch (error: any) {
      this.logger.error('Error HTTP al cargar mock capitulo3', error);
      if (error.status === 404) {
        this.logger.error('Archivo no encontrado en', null, url);
      } else if (error.status === 0) {
        this.logger.error('Error de red o CORS. Verifique que el servidor esté ejecutándose y que el archivo exista en', null, url);
      } else if (error.error) {
        this.logger.error('Error del servidor', error.error);
      }
      return false;
    }
  }

}

