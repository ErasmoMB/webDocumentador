import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface DatosJSON {
  DPTO: string;
  PROV: string;
  DIST: string;
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
    textoAfiliacionSalud: '',
    afiliacionSaludTabla: [],
    fotografias: [],
  };

  jsonData: any[] = [];

  constructor(private http: HttpClient) {}

  actualizarDato(campo: string, valor: any) {
    if (this.datos) {
      this.datos[campo] = valor;
    }
  }

  actualizarDatos(nuevosDatos: any) {
    this.datos = { ...this.datos, ...nuevosDatos };
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
  }

  obtenerJSON(): DatosJSON[] {
    return this.jsonData;
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

