import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BackendApiService } from './backend-api.service';
import { FormularioService } from './formulario.service';
import { UbigeoHelperService } from './ubigeo-helper.service';
import { CentrosPobladosActivosService } from './centros-poblados-activos.service';

export interface FieldMapping {
  fieldName: string;
  endpoint?: string;
  endpointParams?: (seccionId: string, datos: any) => any;
  transform?: (data: any) => any;
  dataSource: 'manual' | 'section' | 'backend';
}

@Injectable({
  providedIn: 'root'
})
export class FieldMappingService {
  private fieldMappings: Map<string, FieldMapping> = new Map();
  private testDataFields: Set<string> = new Set();

  constructor(
    private backendApi: BackendApiService,
    private formularioService: FormularioService,
    private ubigeoHelper: UbigeoHelperService,
    private centrosPobladosActivos: CentrosPobladosActivosService
  ) {
    this.initializeMappings();
  }

  private initializeMappings(): void {
    this.fieldMappings.set('projectName', { fieldName: 'projectName', dataSource: 'manual' });
    this.fieldMappings.set('distritoSeleccionado', { fieldName: 'distritoSeleccionado', dataSource: 'section' });
    this.fieldMappings.set('provinciaSeleccionada', { fieldName: 'provinciaSeleccionada', dataSource: 'section' });
    this.fieldMappings.set('departamentoSeleccionado', { fieldName: 'departamentoSeleccionado', dataSource: 'section' });
    this.fieldMappings.set('comunidadesCampesinas', { fieldName: 'comunidadesCampesinas', dataSource: 'section' });
    this.fieldMappings.set('grupoAISD', { fieldName: 'grupoAISD', dataSource: 'manual' });
    this.fieldMappings.set('grupoAISI', { fieldName: 'grupoAISI', dataSource: 'section' });
    this.fieldMappings.set('centroPobladoAISI', { fieldName: 'centroPobladoAISI', dataSource: 'manual' });
    this.fieldMappings.set('cantidadEntrevistas', { fieldName: 'cantidadEntrevistas', dataSource: 'manual' });
    this.fieldMappings.set('fechaTrabajoCampo', { fieldName: 'fechaTrabajoCampo', dataSource: 'manual' });
    this.fieldMappings.set('consultora', { fieldName: 'consultora', dataSource: 'manual' });
    this.fieldMappings.set('entrevistados', { fieldName: 'entrevistados', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion1_principal', { fieldName: 'parrafoSeccion1_principal', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion1_4', { fieldName: 'parrafoSeccion1_4', dataSource: 'manual' });
    this.fieldMappings.set('objetivoSeccion1_1', { fieldName: 'objetivoSeccion1_1', dataSource: 'manual' });
    this.fieldMappings.set('objetivoSeccion1_2', { fieldName: 'objetivoSeccion1_2', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion2_introduccion', { fieldName: 'parrafoSeccion2_introduccion', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion2_aisd_completo', { fieldName: 'parrafoSeccion2_aisd_completo', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion2_aisi_completo', { fieldName: 'parrafoSeccion2_aisi_completo', dataSource: 'manual' });
    this.fieldMappings.set('aisdComponente1', { fieldName: 'aisdComponente1', dataSource: 'manual' });
    this.fieldMappings.set('aisdComponente2', { fieldName: 'aisdComponente2', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion3_metodologia', { fieldName: 'parrafoSeccion3_metodologia', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion3_fuentes_primarias', { fieldName: 'parrafoSeccion3_fuentes_primarias', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion3_fuentes_primarias_cuadro', { fieldName: 'parrafoSeccion3_fuentes_primarias_cuadro', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion3_fuentes_secundarias', { fieldName: 'parrafoSeccion3_fuentes_secundarias', dataSource: 'manual' });
    this.fieldMappings.set('fuentesSecundariasLista', { fieldName: 'fuentesSecundariasLista', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion4_introduccion_aisd', { fieldName: 'parrafoSeccion4_introduccion_aisd', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion4_comunidad_completo', { fieldName: 'parrafoSeccion4_comunidad_completo', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion4_caracterizacion_indicadores', { fieldName: 'parrafoSeccion4_caracterizacion_indicadores', dataSource: 'manual' });
    this.fieldMappings.set('coordenadasAISD', { fieldName: 'coordenadasAISD', dataSource: 'section' });
    this.fieldMappings.set('altitudAISD', { fieldName: 'altitudAISD', dataSource: 'section' });
    this.fieldMappings.set('tablaAISD1Localidad', { fieldName: 'tablaAISD1Localidad', dataSource: 'section' });
    this.fieldMappings.set('tablaAISD1Coordenadas', { fieldName: 'tablaAISD1Coordenadas', dataSource: 'section' });
    this.fieldMappings.set('tablaAISD1Altitud', { fieldName: 'tablaAISD1Altitud', dataSource: 'section' });
    this.fieldMappings.set('tablaAISD1Distrito', { fieldName: 'tablaAISD1Distrito', dataSource: 'section' });
    this.fieldMappings.set('tablaAISD1Provincia', { fieldName: 'tablaAISD1Provincia', dataSource: 'section' });
    this.fieldMappings.set('tablaAISD1Departamento', { fieldName: 'tablaAISD1Departamento', dataSource: 'section' });
    this.fieldMappings.set('cuadroTituloAISD1', { fieldName: 'cuadroTituloAISD1', dataSource: 'manual' });
    this.fieldMappings.set('cuadroFuenteAISD1', { fieldName: 'cuadroFuenteAISD1', dataSource: 'manual' });
    this.fieldMappings.set('cuadroTituloAISD2', { fieldName: 'cuadroTituloAISD2', dataSource: 'manual' });
    this.fieldMappings.set('cuadroFuenteAISD2', { fieldName: 'cuadroFuenteAISD2', dataSource: 'manual' });
    this.fieldMappings.set('parrafoSeccion5_institucionalidad', { fieldName: 'parrafoSeccion5_institucionalidad', dataSource: 'manual' });
    this.fieldMappings.set('tituloInstituciones', { fieldName: 'tituloInstituciones', dataSource: 'manual' });
    this.fieldMappings.set('fuenteInstituciones', { fieldName: 'fuenteInstituciones', dataSource: 'manual' });
    this.fieldMappings.set('tablepagina6', { fieldName: 'tablepagina6', dataSource: 'manual' });

    this.fieldMappings.set('ubigeoAISD', { fieldName: 'ubigeoAISD', dataSource: 'backend' });
    this.fieldMappings.set('distritoAISD', { fieldName: 'distritoAISD', dataSource: 'backend' });
    this.fieldMappings.set('provinciaAISD', { fieldName: 'provinciaAISD', dataSource: 'backend' });
    this.fieldMappings.set('departamentoAISD', { fieldName: 'departamentoAISD', dataSource: 'backend' });
    this.fieldMappings.set('componentesCC', { fieldName: 'componentesCC', dataSource: 'backend' });
    this.fieldMappings.set('poblacionSexoAISD', { 
      fieldName: 'poblacionSexoAISD', 
      dataSource: 'backend',
      endpoint: '/aisd/poblacion-sexo'
    });
    this.fieldMappings.set('poblacionEtarioAISD', { 
      fieldName: 'poblacionEtarioAISD', 
      dataSource: 'backend',
      endpoint: '/aisd/poblacion-etario'
    });
    this.fieldMappings.set('petAISD', { fieldName: 'petAISD', dataSource: 'backend' });
    this.fieldMappings.set('petTabla', { 
      fieldName: 'petTabla', 
      dataSource: 'backend',
      endpoint: '/aisd/poblacion-etario'
    });
    this.fieldMappings.set('peaOcupacionesTabla', { 
      fieldName: 'peaOcupacionesTabla', 
      dataSource: 'backend',
      endpoint: '/economicos/principales'
    });
    this.fieldMappings.set('tablaAISD2Punto', { fieldName: 'tablaAISD2Punto', dataSource: 'backend' });
    this.fieldMappings.set('tablaAISD2Codigo', { fieldName: 'tablaAISD2Codigo', dataSource: 'backend' });
    this.fieldMappings.set('tablaAISD2Poblacion', { fieldName: 'tablaAISD2Poblacion', dataSource: 'backend' });
    this.fieldMappings.set('materialesConstruccionAISD', { fieldName: 'materialesConstruccionAISD', dataSource: 'backend' });
    this.fieldMappings.set('serviciosBasicosAISD', { fieldName: 'serviciosBasicosAISD', dataSource: 'backend' });

    this.fieldMappings.set('ubigeoAISI', { fieldName: 'ubigeoAISI', dataSource: 'backend' });
    this.fieldMappings.set('distritoAISI', { fieldName: 'distritoAISI', dataSource: 'backend' });
    this.fieldMappings.set('provinciaAISI', { fieldName: 'provinciaAISI', dataSource: 'backend' });
    this.fieldMappings.set('departamentoAISI', { fieldName: 'departamentoAISI', dataSource: 'backend' });
    this.fieldMappings.set('centroPobladoCapitalAISI', { fieldName: 'centroPobladoCapitalAISI', dataSource: 'backend' });
    this.fieldMappings.set('poblacionSexoAISI', { fieldName: 'poblacionSexoAISI', dataSource: 'backend' });
    this.fieldMappings.set('poblacionEtarioAISI', { fieldName: 'poblacionEtarioAISI', dataSource: 'backend' });
    this.fieldMappings.set('petAISI', { fieldName: 'petAISI', dataSource: 'backend' });
    this.fieldMappings.set('peaDistritalAISI', { fieldName: 'peaDistritalAISI', dataSource: 'backend' });
    this.fieldMappings.set('actividadesEconomicasAISI', { fieldName: 'actividadesEconomicasAISI', dataSource: 'backend' });
    this.fieldMappings.set('materialesConstruccionAISI', { fieldName: 'materialesConstruccionAISI', dataSource: 'backend' });
    this.fieldMappings.set('serviciosBasicosAISI', { fieldName: 'serviciosBasicosAISI', dataSource: 'backend' });
  }

  getMapping(fieldName: string): FieldMapping | undefined {
    return this.fieldMappings.get(fieldName);
  }

  getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    if (this.testDataFields.has(fieldName)) {
      return 'manual';
    }
    const mapping = this.getMapping(fieldName);
    return mapping?.dataSource || 'manual';
  }

  loadDataForField(fieldName: string, seccionId: string): Observable<any> {
    const mapping = this.getMapping(fieldName);
    if (!mapping || !mapping.endpoint) {
      return of(null);
    }

    const datos = this.formularioService.obtenerDatos();
    let params: any = {};
    
    if (mapping.endpointParams) {
      params = mapping.endpointParams(seccionId, datos);
    } else {
      const idUbigeo = this.ubigeoHelper.getIdUbigeoPrincipal(seccionId);
      if (idUbigeo) {
        params.id_ubigeo = idUbigeo;
      }
    }

    if (!params.id_ubigeo) {
      return of(null);
    }

    if (mapping.endpoint === '/demograficos/datos') {
      return this.backendApi.getDatosDemograficos(params.id_ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    if (mapping.endpoint === '/aisd/informacion-referencial') {
      return this.backendApi.getInformacionReferencialAISD(params.id_ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    if (mapping.endpoint === '/aisd/centros-poblados') {
      return this.backendApi.getCentrosPobladosAISD(params.id_ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    if (mapping.endpoint === '/aisd/poblacion-sexo') {
      return this.cargarDatosAgregadosAISD(
        seccionId,
        (codigo) => this.backendApi.getDatosDemograficos(codigo),
        this.agregarDatosDemograficos
      ).pipe(
        map(response => {
          const transformado = this.transformarPoblacionSexo(response);
          if (transformado.length === 0) {
            console.warn(`⚠️ [FieldMapping] Población por sexo: datos vacíos después de transformar`);
          }
          return transformado;
        })
      );
    }

    if (mapping.endpoint === '/aisd/poblacion-etario') {
      return this.cargarDatosAgregadosAISD(
        seccionId,
        (codigo) => this.backendApi.getDatosDemograficos(codigo),
        this.agregarDatosDemograficos
      ).pipe(
        map(response => {
          const transformado = this.transformarPoblacionEtario(response);
          if (transformado.length === 0) {
            console.warn(`⚠️ [FieldMapping] Población etario: datos vacíos después de transformar`);
          }
          return transformado;
        })
      );
    }

    if (mapping.endpoint === '/aisd/pet') {
      return this.cargarDatosAgregadosAISD(
        seccionId,
        (codigo) => this.backendApi.getPET(codigo),
        this.agregarDatosDemografia
      ).pipe(
        map(response => mapping.transform ? mapping.transform(response) : response)
      );
    }

    if (fieldName === 'petTabla') {
      return this.cargarDatosAgregadosAISD(
        seccionId,
        (codigo) => this.backendApi.getDatosDemograficos(codigo),
        this.agregarDatosDemograficos
      ).pipe(
        map(response => {
          const transformado = this.transformarPET(response);
          if (transformado.length === 0) {
            console.warn(`⚠️ [FieldMapping] PET: datos vacíos después de transformar`);
          }
          return transformado;
        })
      );
    }

    if (fieldName === 'peaOcupacionesTabla') {
      return this.cargarDatosAgregadosAISD(
        seccionId,
        (codigo) => {
          return this.backendApi.getActividadesPrincipales(codigo).pipe(
            map(response => {
              const datos = response?.data || response || [];
              const datosFiltrados = Array.isArray(datos) ? datos.filter(item => {
                if (!item) return false;
                const actividadPrincipal = item.actividad_principal;
                const totalTrabajadores = parseInt(item.total_trabajadores || '0') || 0;
                return actividadPrincipal !== null && 
                       actividadPrincipal !== undefined && 
                       actividadPrincipal !== '' &&
                       totalTrabajadores > 0;
              }) : [];
              return datosFiltrados;
            })
          );
        },
        this.agregarDatosOcupaciones
      ).pipe(
        map(datosAgregados => {
          const transformado = this.transformarPEAOcupaciones(datosAgregados);
          if (transformado.length === 0) {
            console.warn(`⚠️ [FieldMapping] PEA Ocupaciones: No hay datos válidos después de transformar`);
          }
          return transformado;
        })
      );
    }

    if (mapping.endpoint === '/aisd/materiales-construccion') {
      return this.cargarDatosAgregadosAISD(
        seccionId,
        (codigo) => this.backendApi.getMaterialesConstruccion(codigo),
        this.agregarDatosMateriales
      ).pipe(
        map(response => mapping.transform ? mapping.transform(response) : response)
      );
    }

    if (mapping.endpoint === '/aisi/informacion-referencial') {
      return this.backendApi.getInformacionReferencialAISI(params.ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    if (mapping.endpoint === '/aisi/centros-poblados') {
      return this.backendApi.getCentrosPobladosAISI(params.ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    if (mapping.endpoint === '/aisi/pea-distrital') {
      return this.backendApi.getPEADistrital(params.ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    if (mapping.endpoint === '/aisi/viviendas-censo') {
      return this.backendApi.getViviendasCenso(params.ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    return of(null);
  }

  private cargarDatosAgregadosAISD<T>(
    seccionId: string,
    consultaPorCodigo: (codigo: string) => Observable<any>,
    agregarFuncion: (acumulado: T[], nuevo: any) => T[]
  ): Observable<T[]> {
    const prefijo = this.obtenerPrefijoDeSeccionId(seccionId);
    
    if (!prefijo || !prefijo.startsWith('_A')) {
      const idUbigeo = this.ubigeoHelper.getIdUbigeoPrincipal(seccionId);
      if (idUbigeo) {
        return consultaPorCodigo(idUbigeo).pipe(
          map(response => {
            const datos = response?.data || response || [];
            return datos;
          }),
          catchError((error) => {
            console.error(`❌ [FieldMapping] Error consultando backend:`, error);
            return of([]);
          })
        );
      }
      return of([]);
    }

    const codigosActivos = this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo);
    
    if (codigosActivos.length === 0) {
      console.error(`❌ [FieldMapping] No hay códigos activos para ${prefijo}. Ve a la Sección 4 (Cuadro 3.3).`);
      return of([]);
    }

    if (codigosActivos.length === 1) {
      return consultaPorCodigo(codigosActivos[0]).pipe(
        map(response => {
          const datos = response?.data || response || [];
          return datos;
        }),
        catchError((error) => {
          console.error(`❌ [FieldMapping] Error consultando backend:`, error);
          return of([]);
        })
      );
    }

    const consultas = codigosActivos.map(codigo =>
      consultaPorCodigo(codigo).pipe(
        map(response => {
          const datos = response?.data || response || [];
          return datos;
        }),
        catchError((error) => {
          console.error(`❌ [FieldMapping] Error consultando código ${codigo}:`, error);
          return of([]);
        })
      )
    );

    return forkJoin(consultas).pipe(
      map(resultados => {
        let acumulado: T[] = [];
        let totalConDatos = 0;
        resultados.forEach((datos) => {
          if (Array.isArray(datos) && datos.length > 0) {
            totalConDatos++;
            acumulado = agregarFuncion(acumulado, datos);
          }
        });
        if (totalConDatos === 0) {
          console.warn(`⚠️ [FieldMapping] Ningún código UBIGEO devolvió datos. Total códigos consultados: ${codigosActivos.length}`);
        } else {
          console.log(`✅ [FieldMapping] ${totalConDatos} de ${codigosActivos.length} códigos devolvieron datos. Acumulado:`, acumulado);
        }
        return acumulado;
      }),
      catchError((error) => {
        console.error(`❌ [FieldMapping] Error agregando datos:`, error);
        return of([]);
      })
    );
  }

  private agregarDatosDemografia(acumulado: any[], nuevos: any[]): any[] {
    if (!Array.isArray(nuevos) || nuevos.length === 0) {
      return acumulado;
    }

    const resultado = [...acumulado];

    nuevos.forEach(nuevoItem => {
      const existente = resultado.find(item => {
        const claveExistente = item.sexo || item.categoria || item.grupo || '';
        const claveNuevo = nuevoItem.sexo || nuevoItem.categoria || nuevoItem.grupo || '';
        return claveExistente.toLowerCase() === claveNuevo.toLowerCase();
      });

      if (existente) {
        const casosExistente = parseInt(existente.casos || '0') || 0;
        const casosNuevo = parseInt(nuevoItem.casos || '0') || 0;
        existente.casos = casosExistente + casosNuevo;
      } else {
        resultado.push({ ...nuevoItem });
      }
    });

    return resultado;
  }

  private agregarDatosDemograficos(acumulado: any[], nuevos: any[]): any[] {
    if (!Array.isArray(nuevos) || nuevos.length === 0) {
      return acumulado;
    }

    if (acumulado.length === 0) {
      return nuevos.map(item => ({ ...item }));
    }

    const resultado = { ...acumulado[0] };

    nuevos.forEach(item => {
      if (item.hombres !== undefined && item.hombres !== null) {
        resultado.hombres = (resultado.hombres || 0) + (item.hombres || 0);
      }
      if (item.mujeres !== undefined && item.mujeres !== null) {
        resultado.mujeres = (resultado.mujeres || 0) + (item.mujeres || 0);
      }
      if (item.de_1_a_14 !== undefined && item.de_1_a_14 !== null) {
        resultado.de_1_a_14 = (resultado.de_1_a_14 || 0) + (item.de_1_a_14 || 0);
      }
      if (item.de_15_a_29 !== undefined && item.de_15_a_29 !== null) {
        resultado.de_15_a_29 = (resultado.de_15_a_29 || 0) + (item.de_15_a_29 || 0);
      }
      if (item.de_30_a_44 !== undefined && item.de_30_a_44 !== null) {
        resultado.de_30_a_44 = (resultado.de_30_a_44 || 0) + (item.de_30_a_44 || 0);
      }
      if (item.de_45_a_64 !== undefined && item.de_45_a_64 !== null) {
        resultado.de_45_a_64 = (resultado.de_45_a_64 || 0) + (item.de_45_a_64 || 0);
      }
      if (item.mayores_65 !== undefined && item.mayores_65 !== null) {
        resultado.mayores_65 = (resultado.mayores_65 || 0) + (item.mayores_65 || 0);
      }
      if (item.poblacion_total !== undefined && item.poblacion_total !== null) {
        resultado.poblacion_total = (resultado.poblacion_total || 0) + (item.poblacion_total || 0);
      }
    });

    return [resultado];
  }

  private transformarPoblacionSexo(datos: any[]): any[] {
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    const datosAgregados = datos[0];
    const hombres = datosAgregados.hombres || 0;
    const mujeres = datosAgregados.mujeres || 0;
    const total = hombres + mujeres;

    if (total === 0) {
      console.warn(`⚠️ [FieldMapping] Población por sexo: total es 0`);
      return [];
    }

    const porcentajeHombres = total > 0 ? ((hombres / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %';
    const porcentajeMujeres = total > 0 ? ((mujeres / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %';

    return [
      { sexo: 'Hombres', casos: hombres, porcentaje: porcentajeHombres },
      { sexo: 'Mujeres', casos: mujeres, porcentaje: porcentajeMujeres }
    ];
  }

  private transformarPoblacionEtario(datos: any[]): any[] {
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    const datosAgregados = datos[0];
    const de_1_a_14 = datosAgregados.de_1_a_14 || 0;
    const de_15_a_29 = datosAgregados.de_15_a_29 || 0;
    const de_30_a_44 = datosAgregados.de_30_a_44 || 0;
    const de_45_a_64 = datosAgregados.de_45_a_64 || 0;
    const mayores_65 = datosAgregados.mayores_65 || 0;
    const total = de_1_a_14 + de_15_a_29 + de_30_a_44 + de_45_a_64 + mayores_65;

    if (total === 0) {
      console.warn(`⚠️ [FieldMapping] Población etario: total es 0`);
      return [];
    }

    const calcularPorcentaje = (valor: number) => total > 0 ? ((valor / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %';

    return [
      { categoria: '0 a 14 años', casos: de_1_a_14, porcentaje: calcularPorcentaje(de_1_a_14) },
      { categoria: '15 a 29 años', casos: de_15_a_29, porcentaje: calcularPorcentaje(de_15_a_29) },
      { categoria: '30 a 44 años', casos: de_30_a_44, porcentaje: calcularPorcentaje(de_30_a_44) },
      { categoria: '45 a 64 años', casos: de_45_a_64, porcentaje: calcularPorcentaje(de_45_a_64) },
      { categoria: '65 años a más', casos: mayores_65, porcentaje: calcularPorcentaje(mayores_65) }
    ];
  }

  private transformarPET(datos: any[]): any[] {
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    const datosAgregados = datos[0];
    const de_15_a_29 = datosAgregados.de_15_a_29 || 0;
    const de_30_a_44 = datosAgregados.de_30_a_44 || 0;
    const de_45_a_64 = datosAgregados.de_45_a_64 || 0;
    const mayores_65 = datosAgregados.mayores_65 || 0;
    const totalPET = de_15_a_29 + de_30_a_44 + de_45_a_64 + mayores_65;

    if (totalPET === 0) {
      console.warn(`⚠️ [FieldMapping] PET: total es 0`);
      return [];
    }

    const calcularPorcentaje = (valor: number) => totalPET > 0 ? ((valor / totalPET) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %';

    return [
      { categoria: '15 a 29 años', casos: de_15_a_29, porcentaje: calcularPorcentaje(de_15_a_29) },
      { categoria: '30 a 44 años', casos: de_30_a_44, porcentaje: calcularPorcentaje(de_30_a_44) },
      { categoria: '45 a 64 años', casos: de_45_a_64, porcentaje: calcularPorcentaje(de_45_a_64) },
      { categoria: '65 años a más', casos: mayores_65, porcentaje: calcularPorcentaje(mayores_65) }
    ];
  }

  private agregarDatosOcupaciones(acumulado: any[], nuevos: any[]): any[] {
    if (!Array.isArray(nuevos) || nuevos.length === 0) {
      return acumulado;
    }

    const resultado = [...acumulado];

    nuevos.forEach(nuevoItem => {
      const actividadPrincipal = nuevoItem.actividad_principal || '';
      const totalTrabajadores = parseInt(nuevoItem.total_trabajadores || '0') || 0;
      
      if (!actividadPrincipal || actividadPrincipal.trim() === '' || totalTrabajadores === 0) {
        return;
      }
      
      const existente = resultado.find(item => {
        const catExistente = (item.categoria || item.actividad_principal || '').toLowerCase();
        return catExistente === actividadPrincipal.toLowerCase();
      });

      if (existente) {
        const casosExistente = parseInt(existente.casos || existente.total_trabajadores || '0') || 0;
        existente.casos = casosExistente + totalTrabajadores;
        existente.total_trabajadores = existente.casos;
      } else {
        resultado.push({ 
          categoria: actividadPrincipal,
          casos: totalTrabajadores,
          total_trabajadores: totalTrabajadores,
          porcentaje: nuevoItem.porcentaje ? nuevoItem.porcentaje.toString().replace('.', ',') + ' %' : '0,00 %'
        });
      }
    });

    return resultado;
  }

  private transformarPEAOcupaciones(datos: any[]): any[] {
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    const datosFiltrados = datos.filter(item => {
      const categoria = item.categoria || item.actividad_principal || '';
      const casos = parseInt(item.casos || item.total_trabajadores || '0') || 0;
      return categoria.trim() !== '' && casos > 0;
    });

    if (datosFiltrados.length === 0) {
      return [];
    }

    const totalCasos = datosFiltrados.reduce((sum, item) => {
      return sum + (parseInt(item.casos || item.total_trabajadores || '0') || 0);
    }, 0);

    if (totalCasos === 0) {
      return [];
    }

    return datosFiltrados.map(item => {
      const casos = parseInt(item.casos || item.total_trabajadores || '0') || 0;
      const porcentaje = totalCasos > 0 ? ((casos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %';
      
      return {
        categoria: item.categoria || item.actividad_principal || '',
        casos: casos,
        porcentaje: porcentaje
      };
    });
  }

  private agregarDatosMateriales(acumulado: any[], nuevos: any[]): any[] {
    if (!Array.isArray(nuevos) || nuevos.length === 0) {
      return acumulado;
    }

    const resultado = [...acumulado];

    nuevos.forEach(nuevoItem => {
      const categoria = nuevoItem.categoria || nuevoItem.tipo || '';
      const material = nuevoItem.material || nuevoItem.tipoMaterial || '';
      
      const existente = resultado.find(item => {
        const catExistente = (item.categoria || item.tipo || '').toLowerCase();
        const matExistente = (item.material || item.tipoMaterial || '').toLowerCase();
        return catExistente === categoria.toLowerCase() && matExistente === material.toLowerCase();
      });

      if (existente) {
        const casosExistente = parseInt(existente.casos || '0') || 0;
        const casosNuevo = parseInt(nuevoItem.casos || '0') || 0;
        existente.casos = casosExistente + casosNuevo;
      } else {
        resultado.push({ ...nuevoItem });
      }
    });

    return resultado;
  }

  private obtenerPrefijoDeSeccionId(seccionId: string): string {
    const matchA = seccionId.match(/^3\.1\.4\.A\.(\d+)/);
    if (matchA) {
      return `_A${matchA[1]}`;
    }
    
    const matchB = seccionId.match(/^3\.1\.4\.B\.(\d+)/);
    if (matchB) {
      return `_B${matchB[1]}`;
    }
    
    if (seccionId.startsWith('3.1.4.A')) {
      return '_A1';
    } else if (seccionId.startsWith('3.1.4.B')) {
      return '_B1';
    }
    
    return '';
  }

  markFieldAsTestData(fieldName: string): void {
    this.testDataFields.add(fieldName);
  }

  clearTestDataFields(): void {
    this.testDataFields.clear();
  }

  isTestDataField(fieldName: string): boolean {
    return this.testDataFields.has(fieldName);
  }

  markFieldsAsTestData(fields: string[]): void {
    fields.forEach(field => this.testDataFields.add(field));
  }

  hasAnyTestDataForSection(seccionId: string): boolean {
    const fields = this.getFieldsForSection(seccionId);
    return fields.some(field => this.testDataFields.has(field));
  }

  getFieldsForSection(seccionId: string): string[] {
    const sectionFields: { [key: string]: string[] } = {
      '3.1.1': [
        'projectName',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado',
        'parrafoSeccion1_principal',
        'parrafoSeccion1_4',
        'objetivoSeccion1_1',
        'objetivoSeccion1_2'
      ],
      '3.1.2': [
        'grupoAISD',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado',
        'aisdComponente1',
        'aisdComponente2',
        'grupoAISI',
        'parrafoSeccion2_introduccion',
        'parrafoSeccion2_aisd_completo',
        'parrafoSeccion2_aisi_completo'
      ],
      '3.1.2.A': [
        'grupoAISD',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado',
        'aisdComponente1',
        'aisdComponente2',
        'parrafoSeccion2_introduccion',
        'parrafoSeccion2_aisd_completo'
      ],
      '3.1.2.B': [
        'grupoAISI',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado',
        'parrafoSeccion2_introduccion',
        'parrafoSeccion2_aisi_completo'
      ],
      '3.1.3': [
        'parrafoSeccion3_metodologia',
        'parrafoSeccion3_fuentes_primarias',
        'parrafoSeccion3_fuentes_primarias_cuadro',
        'parrafoSeccion3_fuentes_secundarias',
        'cantidadEntrevistas',
        'fechaTrabajoCampo',
        'consultora',
        'entrevistados',
        'fuentesSecundariasLista'
      ],
      '3.1.3.A': [
        'parrafoSeccion3_metodologia',
        'parrafoSeccion3_fuentes_primarias',
        'parrafoSeccion3_fuentes_primarias_cuadro',
        'cantidadEntrevistas',
        'fechaTrabajoCampo',
        'consultora',
        'entrevistados'
      ],
      '3.1.3.B': [
        'parrafoSeccion3_fuentes_secundarias',
        'fuentesSecundariasLista'
      ],
      '3.1.4': [
        'grupoAISD',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado',
        'aisdComponente1',
        'aisdComponente2',
        'coordenadasAISD',
        'altitudAISD',
        'tablaAISD1Localidad',
        'tablaAISD1Coordenadas',
        'tablaAISD1Altitud',
        'tablaAISD1Distrito',
        'tablaAISD1Provincia',
        'tablaAISD1Departamento',
        'cuadroTituloAISD1',
        'cuadroFuenteAISD1',
        'cuadroTituloAISD2',
        'cuadroFuenteAISD2',
        'parrafoSeccion4_introduccion_aisd',
        'parrafoSeccion4_comunidad_completo',
        'parrafoSeccion4_caracterizacion_indicadores'
      ],
      '3.1.4.A': [
        'grupoAISD',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado',
        'aisdComponente1',
        'aisdComponente2',
        'coordenadasAISD',
        'altitudAISD',
        'tablaAISD1Localidad',
        'tablaAISD1Coordenadas',
        'tablaAISD1Altitud',
        'tablaAISD1Distrito',
        'tablaAISD1Provincia',
        'tablaAISD1Departamento',
        'cuadroTituloAISD1',
        'cuadroFuenteAISD1',
        'cuadroTituloAISD2',
        'cuadroFuenteAISD2',
        'parrafoSeccion4_introduccion_aisd',
        'parrafoSeccion4_comunidad_completo',
        'parrafoSeccion4_caracterizacion_indicadores'
      ],
      '3.1.4.A.1': [
        'grupoAISD',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado',
        'aisdComponente1',
        'aisdComponente2',
        'coordenadasAISD',
        'altitudAISD',
        'tablaAISD1Localidad',
        'tablaAISD1Coordenadas',
        'tablaAISD1Altitud',
        'tablaAISD1Distrito',
        'tablaAISD1Provincia',
        'tablaAISD1Departamento',
        'tablaAISD1Fila1Localidad',
        'tablaAISD1Fila1Coordenadas',
        'tablaAISD1Fila1Altitud',
        'tablaAISD1Fila1Distrito',
        'tablaAISD1Fila1Provincia',
        'tablaAISD1Fila1Departamento',
        'tablaAISD2Fila1Punto',
        'tablaAISD2Fila1Codigo',
        'tablaAISD2Fila1Poblacion',
        'tablaAISD2Fila1ViviendasEmpadronadas',
        'tablaAISD2Fila1ViviendasOcupadas',
        'tablaAISD2Fila2Punto',
        'tablaAISD2Fila2Codigo',
        'tablaAISD2Fila2Poblacion',
        'tablaAISD2Fila2ViviendasEmpadronadas',
        'tablaAISD2Fila2ViviendasOcupadas',
        'tablaAISD2Fila3Punto',
        'tablaAISD2Fila3Codigo',
        'tablaAISD2Fila3Poblacion',
        'tablaAISD2Fila3ViviendasEmpadronadas',
        'tablaAISD2Fila3ViviendasOcupadas',
        'tablaAISD2Fila4Punto',
        'tablaAISD2Fila4Codigo',
        'tablaAISD2Fila4Poblacion',
        'tablaAISD2Fila4ViviendasEmpadronadas',
        'tablaAISD2Fila4ViviendasOcupadas',
        'tablaAISD2TotalPoblacion',
        'cuadroTituloAISD1',
        'cuadroFuenteAISD1',
        'cuadroTituloAISD2',
        'cuadroFuenteAISD2',
        'parrafoSeccion4_introduccion_aisd',
        'parrafoSeccion4_comunidad_completo',
        'parrafoSeccion4_caracterizacion_indicadores'
      ],
      '3.1.4.A.1.2': [
        'grupoAISD',
        'textoPoblacionSexoAISD',
        'poblacionSexoAISD',
        'textoPoblacionEtarioAISD',
        'poblacionEtarioAISD',
        'tablaAISD2TotalPoblacion'
      ],
      '3.1.4.A.1.9': [
        'grupoAISD',
        'distritoSeleccionado',
        'parrafoSeccion13_natalidad_mortalidad_completo',
        'parrafoSeccion13_morbilidad_completo',
        'natalidadMortalidadTabla',
        'morbilidadTabla',
        'porcentajeSIS',
        'porcentajeESSALUD',
        'porcentajeSinSeguro',
        'afiliacionSaludTabla',
        'textoAfiliacionSalud'
      ],
      '3.1.4.A.2.2': [
        'grupoAISD',
        'textoPoblacionSexoAISD',
        'poblacionSexoAISD',
        'textoPoblacionEtarioAISD',
        'poblacionEtarioAISD',
        'tablaAISD2TotalPoblacion'
      ],
      '3.1.4.A.2.9': [
        'grupoAISD',
        'distritoSeleccionado',
        'parrafoSeccion13_natalidad_mortalidad_completo',
        'parrafoSeccion13_morbilidad_completo',
        'natalidadMortalidadTabla',
        'morbilidadTabla',
        'porcentajeSIS',
        'porcentajeESSALUD',
        'porcentajeSinSeguro',
        'afiliacionSaludTabla',
        'textoAfiliacionSalud'
      ],
      '3.1.4.B': [
        'centroPobladoAISI',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado'
      ],
      '3.1.4.B.1': [
        'centroPobladoAISI',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado'
      ],
      '3.1.5': [
        'parrafoSeccion5_institucionalidad',
        'grupoAISD',
        'tituloInstituciones',
        'fuenteInstituciones',
        'tablepagina6',
        'textoInstitucionalidad'
      ],
      '3.1.4.A.1.1': [
        'grupoAISD',
        'textoInstitucionalidad',
        'tituloInstituciones',
        'fuenteInstituciones',
        'tablepagina6'
      ],
      '3.1.4.A.1.3': [
        'grupoAISD',
        'textoPET',
        'petTabla',
        'textoDefinicionPEA',
        'textoDetalePEA',
        'textoAnalisisPEA',
        'peaTabla',
        'textoIndiceDesempleo',
        'textoAnalisisOcupacion',
        'peaOcupadaTabla',
        'textoSituacionEmpleo',
        'textoIngresosPoblacion',
        'peaOcupacionesTabla',
        'textoAnalisisCuadro310'
      ],
      '3.1.4.A.1.4': [
        'grupoAISD',
        'textoActividadesEconomicas',
        'textoFuentesActividadesEconomicas',
        'peaOcupacionesTabla',
        'textoAnalisisCuadro310',
        'textoGanaderia1',
        'textoGanaderia2',
        'textoGanaderia3',
        'poblacionPecuariaTabla',
        'textoAgricultura1',
        'textoAgricultura2',
        'caracteristicasAgriculturaTabla',
        'textoMercadoComercializacion1',
        'textoMercadoComercializacion2',
        'textoHabitosConsumo1',
        'textoHabitosConsumo2'
      ],
      '3.1.4.A.1.5': [
        'grupoAISD',
        'textoViviendas',
        'condicionOcupacionTabla',
        'textoEstructura',
        'tiposMaterialesTabla'
      ],
      '3.1.4.A.1.6': [
        'grupoAISD',
        'textoServiciosBasicos',
        'textoServiciosAgua',
        'abastecimientoAguaTabla',
        'textoServiciosAguaDetalle',
        'textoServiciosDesague',
        'tiposSaneamientoTabla',
        'textoServiciosDesagueDetalle',
        'textoDesechosSolidos1',
        'textoDesechosSolidos2',
        'textoDesechosSolidos3',
        'textoElectricidad1',
        'coberturaElectricaTabla',
        'textoElectricidad2',
        'textoEnergiaParaCocinar'
      ],
      '3.1.4.A.1.7': [
        'grupoAISD',
        'textoTransporte1',
        'textoTransporte2',
        'textoTelecomunicaciones1',
        'textoTelecomunicaciones2',
        'telecomunicacionesTabla'
      ],
      '3.1.4.A.1.8': [
        'grupoAISD',
        'textoInfraestructuraSalud',
        'textoInfraestructuraSaludDetalle',
        'caracteristicasSaludTabla',
        'textoInfraestructuraEducacion',
        'textoInfraestructuraEducacionPost',
        'cantidadEstudiantesEducacionTabla',
        'ieAyrocaTabla',
        'ie40270Tabla',
        'textoAlumnosPorSexoGrado',
        'alumnosIEAyrocaTabla',
        'alumnosIE40270Tabla',
        'textoInfraestructuraRecreacion',
        'textoInfraestructuraRecreacionDetalle',
        'textoInfraestructuraDeporte',
        'textoInfraestructuraDeportDetalle'
      ],
      '3.1.4.A.1.10': [
        'grupoAISD',
        'textoEducacion',
        'textoNivelEducativo',
        'nivelEducativoTabla',
        'textoAnalfabetismo',
        'tasaAnalfabetismoTabla',
        'cantidadEstudiantesGeneroTabla'
      ],
      '3.1.4.A.1.11': [
        'grupoAISD',
        'textoAspectosCulturales',
        'textoIdioma',
        'lenguasMaternasTabla',
        'textoReligion',
        'religionesTabla'
      ],
      '3.1.4.A.1.12': [
        'grupoAISD',
        'textoAgua',
        'textoUsosSuelos',
        'textoRecursosNaturalesZona',
        'textoTenenciaDelTierra'
      ],
      '3.1.4.A.1.13': [
        'grupoAISD',
        'textoIndiceDesarrolloHumano',
        'indiceDesarrolloHumanoTabla'
      ],
      '3.1.4.A.1.14': [
        'grupoAISD',
        'textoNecesidadesBasicasInsatisfechas',
        'nbiCCAyrocaTabla',
        'nbiDistritoCahuachoTabla'
      ],
      '3.1.4.A.1.15': [
        'grupoAISD',
        'textoOrganizacionSocial',
        'autoridades'
      ],
      '3.1.4.A.1.16': [
        'grupoAISD',
        'textoFestividades',
        'festividades'
      ],
      '3.1.4.B.1.1': [
        'centroPobladoAISI',
        'distritoSeleccionado',
        'provinciaSeleccionada',
        'departamentoSeleccionado',
        'textoAISIIntro',
        'textoCentroPoblado',
        'ubicacionCpTabla'
      ],
      '3.1.4.B.1.2': [
        'centroPobladoAISI',
        'distritoSeleccionado',
        'textoDemografiaAISI',
        'poblacionSexoAISI',
        'poblacionEtarioAISI'
      ],
      '3.1.4.B.1.3': [
        'centroPobladoAISI',
        'distritoSeleccionado',
        'textoPEA_AISI',
        'petGruposEdadAISI',
        'peaDistritoSexoTabla',
        'peaOcupadaDesocupadaTabla'
      ],
      '3.1.4.B.1.4': [
        'centroPobladoAISI',
        'textoActividadesEconomicasAISI',
        'actividadesEconomicasAISI',
        'textoMercadoProductos',
        'textoHabitosConsumo'
      ],
      '3.1.4.B.1.5': [
        'centroPobladoAISI',
        'tiposViviendaCpTabla',
        'condicionOcupacionCpTabla',
        'abastecimientoAguaCpTabla',
        'textoDesagueCP',
        'saneamientoCpTabla',
        'textoDesechosSolidosCP',
        'textoElectricidadCP',
        'coberturaElectricaCpTabla',
        'textoEnergiaCocinarCP',
        'combustiblesCocinarCpTabla'
      ],
      '3.1.4.B.1.6': [
        'centroPobladoAISI',
        'textoTransporteCP1',
        'textoTransporteCP2',
        'textoTelecomunicacionesCP1',
        'textoTelecomunicacionesCP2',
        'textoTelecomunicacionesCP3',
        'telecomunicacionesCpTabla'
      ],
      '3.1.4.B.1.7': [
        'centroPobladoAISI',
        'textoSaludCP',
        'puestoSaludCpTabla',
        'textoEducacionCP',
        'educacionCpTabla',
        'textoRecreacionCP1',
        'textoRecreacionCP2',
        'textoRecreacionCP3',
        'textoDeporteCP1',
        'textoDeporteCP2'
      ],
      '3.1.4.B.1.8': [
        'centroPobladoAISI',
        'textoNatalidadCP1',
        'textoNatalidadCP2',
        'natalidadMortalidadCpTabla',
        'textoMorbilidadCP',
        'morbilidadCpTabla',
        'textoAfiliacionSalud',
        'afiliacionSaludTabla'
      ],
      '3.1.4.B.1.9': [
        'centroPobladoAISI',
        'textoEducacion',
        'textoNivelEducativo',
        'nivelEducativoTabla',
        'textoAnalfabetismo',
        'tasaAnalfabetismoTabla',
        'textoAspectosCulturales',
        'textoIdioma',
        'lenguasMaternasTabla',
        'textoReligion',
        'religionesTabla',
        'textoFuentesAgua',
        'textoUsosSuelos',
        'textoRecursosNaturalesZona'
      ]
    };

    // Prefer most specific mapping first
    if (sectionFields[seccionId]) {
      return sectionFields[seccionId];
    }

    // Fallback to base (e.g., 3.1.4)
    const baseSeccionId = seccionId.split('.').slice(0, 3).join('.');
    if (sectionFields[baseSeccionId]) {
      return sectionFields[baseSeccionId];
    }

    return [];
  }
}
