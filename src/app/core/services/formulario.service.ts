import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface DatosJSON {
  ITEM?: number;
  UBIGEO?: number;
  CODIGO?: number;
  CCPP?: string;
  CATEGORIA?: string;
  POBLACION?: number;
  DPTO?: string;
  PROV?: string;
  DIST?: string;
  ESTE?: number;
  NORTE?: number;
  ALTITUD?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormularioService {

  datos: any = {
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
  };

  jsonData: any[] = [];
  private readonly STORAGE_KEY = 'formulario_datos';
  private readonly STORAGE_JSON_KEY = 'formulario_json';
  private readonly STORAGE_TABLA_FILAS_KEY = 'tabla_aisd2_filas_activas';

  constructor(private http: HttpClient) {
    this.cargarDesdeLocalStorage();
  }

  actualizarDato(campo: string, valor: any) {
    if (this.datos) {
      this.datos[campo] = valor;
      this.guardarEnLocalStorage();
    }
  }

  actualizarDatos(nuevosDatos: any) {
    this.datos = { ...this.datos, ...nuevosDatos };
    this.guardarEnLocalStorage();
  }

  reemplazarDatos(nuevosDatos: any) {
    if (!nuevosDatos) {
      console.warn('reemplazarDatos: nuevosDatos es null o undefined');
      return;
    }
    try {
      this.datos = JSON.parse(JSON.stringify(nuevosDatos));
    } catch (error) {
      console.error('Error al reemplazar datos:', error);
      this.datos = { ...nuevosDatos };
    }
  }

  obtenerDatos() {
    return this.datos;
  }

  guardarJSON(data: any) {
    this.jsonData = data;
    this.guardarJSONEnLocalStorage();
  }

  obtenerJSON(): DatosJSON[] {
    return this.jsonData;
  }

  private guardarEnLocalStorage() {
    try {
      const datosSerializados = JSON.stringify(this.datos);
      const tamanioMB = new Blob([datosSerializados]).size / (1024 * 1024);
      
      if (tamanioMB > 4) {
        console.warn(`Los datos son muy grandes (${tamanioMB.toFixed(2)} MB). Algunas imágenes pueden no guardarse correctamente.`);
      }
      
      localStorage.setItem(this.STORAGE_KEY, datosSerializados);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.error('Error: localStorage está lleno. Intenta eliminar datos antiguos o reducir el tamaño de las imágenes.');
      } else {
        console.error('Error al guardar en localStorage:', error);
      }
    }
  }

  private guardarJSONEnLocalStorage() {
    try {
      localStorage.setItem(this.STORAGE_JSON_KEY, JSON.stringify(this.jsonData));
    } catch (error) {
      console.error('Error al guardar JSON en localStorage:', error);
    }
  }

  private cargarDesdeLocalStorage() {
    try {
      const datosGuardados = localStorage.getItem(this.STORAGE_KEY);
      if (datosGuardados) {
        this.datos = JSON.parse(datosGuardados);
      }

      const jsonGuardado = localStorage.getItem(this.STORAGE_JSON_KEY);
      if (jsonGuardado) {
        this.jsonData = JSON.parse(jsonGuardado);
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error);
    }
  }

  guardarFilasActivasTablaAISD2(codigosActivos: string[]) {
    try {
      localStorage.setItem(this.STORAGE_TABLA_FILAS_KEY, JSON.stringify(codigosActivos));
    } catch (error) {
      console.error('Error al guardar filas activas:', error);
    }
  }

  obtenerFilasActivasTablaAISD2(): string[] {
    try {
      const filasGuardadas = localStorage.getItem(this.STORAGE_TABLA_FILAS_KEY);
      if (filasGuardadas) {
        return JSON.parse(filasGuardadas);
      }
    } catch (error) {
      console.error('Error al obtener filas activas:', error);
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
    };
    this.jsonData = [];
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_JSON_KEY);
    localStorage.removeItem(this.STORAGE_TABLA_FILAS_KEY);
  }

  async cargarMockCapitulo3(): Promise<boolean> {
    const timestamp = new Date().getTime();
    const url = `/assets/mockData/capitulo3.json?v=${timestamp}`;
    
    try {
      const data = await firstValueFrom(this.http.get<any>(url));
      
      if (!data) {
        console.error('Mock vacío o no encontrado:', url);
        return false;
      }
      
      if (!data.datos) {
        console.error('No se encontró la propiedad "datos" en el JSON');
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
      console.error('Error HTTP al cargar mock capitulo3:', error);
      if (error.status === 404) {
        console.error('Archivo no encontrado en:', url);
      } else if (error.status === 0) {
        console.error('Error de red o CORS. Verifique que el servidor esté ejecutándose y que el archivo exista en:', url);
      } else if (error.error) {
        console.error('Error del servidor:', error.error);
      }
      return false;
    }
  }

}

