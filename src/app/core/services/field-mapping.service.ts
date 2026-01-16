import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendApiService } from './backend-api.service';
import { FormularioService } from './formulario.service';
import { UbigeoHelperService } from './ubigeo-helper.service';

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
    private ubigeoHelper: UbigeoHelperService
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
    this.fieldMappings.set('poblacionSexoAISD', { fieldName: 'poblacionSexoAISD', dataSource: 'backend' });
    this.fieldMappings.set('poblacionEtarioAISD', { fieldName: 'poblacionEtarioAISD', dataSource: 'backend' });
    this.fieldMappings.set('petAISD', { fieldName: 'petAISD', dataSource: 'backend' });
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
      return this.backendApi.getPoblacionPorSexo(params.id_ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    if (mapping.endpoint === '/aisd/poblacion-etario') {
      return this.backendApi.getPoblacionPorGrupoEtario(params.id_ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    if (mapping.endpoint === '/aisd/pet') {
      return this.backendApi.getPET(params.id_ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
      );
    }

    if (mapping.endpoint === '/aisd/materiales-construccion') {
      return this.backendApi.getMaterialesConstruccion(params.id_ubigeo).pipe(
        map(response => mapping.transform ? mapping.transform(response.data) : response.data)
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
