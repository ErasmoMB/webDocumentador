import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormularioDatos, CentroPobladoData, ComunidadCampesina } from '../models/formulario.model';
import { LoggerService } from './logger.service';
import { StateService } from './state.service';
import { ImageMigrationService } from './image-migration.service';

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

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private stateService: StateService,
    private imageMigration: ImageMigrationService
  ) {
    this.cargarDesdeLocalStorage();
    this.sincronizarConEstado();
    this.ejecutarMigracionImagenes();
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
      this.guardarEnLocalStorage();
      this.stateService.updateDato(campo, valor);
    }
  }

  actualizarDatos(nuevosDatos: Partial<FormularioDatos>): void {
    this.datos = { ...this.datos, ...nuevosDatos };
    this.guardarEnLocalStorage();
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

  private guardarEnLocalStorage() {
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
      
      if (data.datos.fotografias && Array.isArray(data.datos.fotografias)) {
        data.datos.fotografias.forEach((foto: any, index: number) => {
          const numero = foto.numero || `${index + 1}`;
          const partes = numero.split('.');
          if (partes.length >= 2) {
            const numFoto = parseInt(partes[1].trim());
            if (!isNaN(numFoto) && numFoto >= 1 && numFoto <= 10) {
              data.datos[`fotografiaAISD${numFoto}Titulo`] = foto.titulo || '';
              data.datos[`fotografiaAISD${numFoto}Fuente`] = foto.fuente || '';
              data.datos[`fotografiaAISD${numFoto}Imagen`] = foto.ruta || '';
            }
          }
        });
      }
      
      this.actualizarDatos(data.datos);
      
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

