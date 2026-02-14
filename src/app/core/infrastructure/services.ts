import { Injectable } from '@angular/core';
import { Observable, of, map, from } from 'rxjs';
import { ISectionDataService, IPercentageCalculatorService, ISectionCalculatorService, ITextGeneratorService, IPhotoService, ISeccion2DataService, ISeccion2TextGeneratorService, ISeccion23DataService, ISeccion23TextGeneratorService, ISeccion3DataService, ISeccion3TextGeneratorService, ISeccion10DataService, ISeccion10TextGeneratorService, ISeccion6DataService, ISeccion6TextGeneratorService, ISeccion7DataService, ISeccion7TextGeneratorService, ISeccion8DataService, ISeccion8TextGeneratorService, ISeccion9DataService, ISeccion9TextGeneratorService, ISeccion26DataService, ISeccion26TextGeneratorService, ISeccion12DataService, ISeccion12TextGeneratorService, ISeccion25DataService, ISeccion25TextGeneratorService, ISeccion28DataService, ISeccion28TextGeneratorService, ISeccion29DataService, ISeccion29TextGeneratorService, ISeccion24DataService, ISeccion24TextGeneratorService, ISeccion22DataService, ISeccion22TextGeneratorService, ISeccion30DataService, ISeccion30TextGeneratorService } from '../domain/interfaces';
import { SectionData, CalculatedSectionData, PETData, PEAData, PEAOcupadaData, Seccion2Data, ComunidadCampesina, DistritoAISI, Seccion23Data, PETGrupoEdad, PEADistritoSexo, PEAOcupadaDesocupada, Seccion3Data, Entrevistado, Seccion10Data, Seccion6Data, Seccion7Data, Seccion8Data, Seccion9Data, Seccion26Data, Seccion12Data, Seccion25Data, Seccion28Data, Seccion29Data, Seccion24Data, Seccion22Data, Seccion30Data } from '../domain/entities';
import { MockDataService } from '../services/infrastructure/mock-data.service';
import { ProjectStateFacade } from '../state/project-state.facade';
import { BehaviorSubject } from 'rxjs';
import { 
  GrupoAISD, 
  GrupoAISI, 
  Grupo, 
  CentroPoblado, 
  ContextoGrupo,
  SECCIONES_AISD,
  SECCIONES_AISI 
} from '../models/grupos.model';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../services/utilities/config.service';
import { StorageFacade } from '../services/infrastructure/storage-facade.service';

@Injectable({
  providedIn: 'root'
})
export class SectionDataService extends ISectionDataService {
  getSectionData(seccionId: string): Observable<SectionData> {
    return of(this.getMockData());
  }

  updateSectionData(seccionId: string, data: Partial<SectionData>): Observable<void> {
    return of(void 0);
  }

  private getMockData(): SectionData {
    return {
      petTabla: [],
      peaTabla: [],
      peaOcupadaTabla: []
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class PercentageCalculatorService extends IPercentageCalculatorService {
  calculatePETPercentages(data: PETData[]): PETData[] {
    if (!data || data.length === 0) return [];

    const filteredData = data.filter(item =>
      !item.categoria?.toLowerCase().includes('total')
    );

    const total = filteredData.reduce((sum, item) => sum + (item.casos || 0), 0);

    if (total <= 0) return filteredData;

    return filteredData.map(item => {
      const casos = item.casos || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });
  }

  calculatePEAPercentages(data: PEAData[]): PEAData[] {
    if (!data || data.length === 0) return [];

    const filteredData = data.filter(item =>
      !item.categoria?.toLowerCase().includes('total')
    );

    const totalHombres = filteredData.reduce((sum, item) => sum + (item.hombres || 0), 0);
    const totalMujeres = filteredData.reduce((sum, item) => sum + (item.mujeres || 0), 0);
    const totalCasos = filteredData.reduce((sum, item) => sum + (item.casos || 0), 0);

    return filteredData.map(item => {
      const hombres = item.hombres || 0;
      const mujeres = item.mujeres || 0;
      const casos = item.casos || 0;

      const porcentajeHombres = totalHombres > 0 ? (hombres / totalHombres) * 100 : 0;
      const porcentajeMujeres = totalMujeres > 0 ? (mujeres / totalMujeres) * 100 : 0;
      const porcentaje = totalCasos > 0 ? (casos / totalCasos) * 100 : 0;

      const formatPercent = (value: number) =>
        value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          .replace('.', ',') + ' %';

      return {
        ...item,
        hombres,
        mujeres,
        casos,
        porcentajeHombres: formatPercent(porcentajeHombres),
        porcentajeMujeres: formatPercent(porcentajeMujeres),
        porcentaje: formatPercent(porcentaje)
      };
    });
  }

  calculatePEAOcupadaPercentages(data: PEAOcupadaData[]): PEAOcupadaData[] {
    return this.calculatePEAPercentages(data);
  }
}

@Injectable({
  providedIn: 'root'
})
export class SectionCalculatorService extends ISectionCalculatorService {
  constructor(private percentageCalculator: PercentageCalculatorService) {
    super();
  }

  calculateSectionData(data: SectionData): CalculatedSectionData {
    const petTablaConPorcentajes = this.percentageCalculator.calculatePETPercentages(data.petTabla || []);
    const peaTablaConPorcentajes = this.percentageCalculator.calculatePEAPercentages(data.peaTabla || []);
    const peaOcupadaTablaConPorcentajes = this.percentageCalculator.calculatePEAOcupadaPercentages(data.peaOcupadaTabla || []);

    return {
      petTablaConPorcentajes,
      peaTablaConPorcentajes,
      peaOcupadaTablaConPorcentajes,
      totalPET: this.calculateTotal(petTablaConPorcentajes, 'casos'),
      totalPEA: this.calculateTotal(peaTablaConPorcentajes, 'casos'),
      totalPEAHombres: this.calculateTotal(peaTablaConPorcentajes, 'hombres'),
      totalPEAMujeres: this.calculateTotal(peaTablaConPorcentajes, 'mujeres'),
      totalPEAOcupada: this.calculateTotal(peaOcupadaTablaConPorcentajes, 'casos'),
      totalPEAOcupadaHombres: this.calculateTotal(peaOcupadaTablaConPorcentajes, 'hombres'),
      totalPEAOcupadaMujeres: this.calculateTotal(peaOcupadaTablaConPorcentajes, 'mujeres')
    };
  }

  private calculateTotal(data: any[], field: string): string {
    if (!data || data.length === 0) return '0';
    const total = data.reduce((sum, item) => sum + (item[field] || 0), 0);
    return total.toString();
  }
}

@Injectable({
  providedIn: 'root'
})
export class TextGeneratorService extends ITextGeneratorService {
  generatePETText(data: SectionData): string {
    return 'Texto PET generado';
  }

  generatePEAText(data: SectionData): string {
    return 'Texto PEA generado';
  }

  generateEmploymentText(data: SectionData): string {
    return 'Texto de empleo generado';
  }

  generateIncomeText(data: SectionData): string {
    return 'Texto de ingresos generado';
  }
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService extends IPhotoService {
  loadPhotos(seccionId: string, prefix: string): any[] {
    return [];
  }

  savePhotos(seccionId: string, prefix: string, photos: any[]): void {
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion2DataService extends ISeccion2DataService {
  constructor(private mockDataService: MockDataService) {
    super();
  }

  getSeccion2Data(): Observable<Seccion2Data> {
    return from(this.mockDataService.getCapitulo3Datos()).pipe(
      map(datos => ({
        comunidadesCampesinas: datos.comunidadesCampesinas || [],
        distritosAISI: datos.distritosAISI || [],
        groupConfiguration: datos.groupConfiguration || {
          selectedComunidades: [],
          selectedDistritos: [],
          groupName: '',
          description: ''
        }
      }))
    );
  }

  updateSeccion2Data(updates: Partial<Seccion2Data>): Observable<Seccion2Data> {
    // For now, just return the updates as a mock implementation
    return of(updates as Seccion2Data);
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion2TextGeneratorService extends ISeccion2TextGeneratorService {
  generateComunidadesText(data: Seccion2Data): string {
    const count = data.comunidadesCampesinas?.length || 0;
    return `Se han identificado ${count} comunidades campesinas en el área de estudio.`;
  }

  generateDistritosText(data: Seccion2Data): string {
    const count = data.distritosAISI?.length || 0;
    return `Se han identificado ${count} distritos AISI en el área de estudio.`;
  }

  generateGroupConfigurationText(data: Seccion2Data): string {
    const comunidadesCount = data.groupConfiguration?.selectedComunidades?.length || 0;
    const distritosCount = data.groupConfiguration?.selectedDistritos?.length || 0;
    const groupName = data.groupConfiguration?.groupName || 'Sin nombre';

    return `Configuración del grupo "${groupName}" con ${comunidadesCount} comunidades campesinas y ${distritosCount} distritos AISI seleccionados.`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion23DataService extends ISeccion23DataService {
  getSeccion23Data(): Observable<Seccion23Data> {
    return of(this.getMockSeccion23Data());
  }

  updateSeccion23Data(updates: Partial<Seccion23Data>): Observable<Seccion23Data> {
    const currentData = this.getMockSeccion23Data();
    const updatedData = { ...currentData, ...updates };
    return of(updatedData);
  }

  loadPEAData(ubigeos: string[]): Observable<any> {
    // Mock implementation - in real app this would call backend
    return of({
      success: true,
      tabla_3_41_pea_grupos_edad: this.getMockPETGruposEdad(),
      tabla_3_42_3_43_pea_estado_sexo: this.getMockPEAEstadoSexo()
    });
  }

  private getMockSeccion23Data(): Seccion23Data {
    return {
      petGruposEdadAISI: [],
      peaDistritoSexoTabla: [],
      peaOcupadaDesocupadaTabla: [],
      poblacionDistritalAISI: 0,
      petDistritalAISI: 0,
      ingresoPerCapitaAISI: 0,
      rankingIngresoAISI: 0,
      textoPEAAISI: '',
      textoPET_AISI: '',
      textoIndicadoresDistritalesAISI: '',
      textoPEA_AISI: '',
      textoAnalisisPEA_AISI: '',
      textoEmpleoAISI: '',
      textoIngresosAISI: '',
      textoIndiceDesempleoAISI: ''
    };
  }

  private getMockPETGruposEdad(): PETGrupoEdad[] {
    return [
      { categoria: '0-14 años', orden: 1, casos: 150, porcentaje: '15,00 %' },
      { categoria: '15-29 años', orden: 2, casos: 200, porcentaje: '20,00 %' },
      { categoria: '30-44 años', orden: 3, casos: 250, porcentaje: '25,00 %' },
      { categoria: '45-59 años', orden: 4, casos: 200, porcentaje: '20,00 %' },
      { categoria: '60 años y más', orden: 5, casos: 200, porcentaje: '20,00 %' }
    ];
  }

  private getMockPEAEstadoSexo(): any[] {
    return [
      { estado: 'Ocupado', sexo: 'Hombre', cantidad: 300 },
      { estado: 'Ocupado', sexo: 'Mujer', cantidad: 200 },
      { estado: 'Desocupado', sexo: 'Hombre', cantidad: 50 },
      { estado: 'Desocupado', sexo: 'Mujer', cantidad: 30 }
    ];
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion23TextGeneratorService extends ISeccion23TextGeneratorService {
  generatePEAAText(data: Seccion23Data): string {
    const totalPEA = data.peaDistritoSexoTabla?.reduce((sum, item) => sum + (item.casos || 0), 0) || 0;
    return `La Población Económicamente Activa (PEA) del distrito AISI asciende a ${totalPEA} personas.`;
  }

  generatePETText(data: Seccion23Data): string {
    const totalPET = data.petGruposEdadAISI?.reduce((sum, item) => sum + (item.casos || 0), 0) || 0;
    return `La Población en Edad de Trabajar (PET) del distrito AISI es de ${totalPET} personas.`;
  }

  generateEmploymentText(data: Seccion23Data): string {
    const ocupados = data.peaDistritoSexoTabla?.find(item => item.categoria?.toLowerCase().includes('ocupad'))?.casos || 0;
    const totalPEA = data.peaDistritoSexoTabla?.reduce((sum, item) => sum + (item.casos || 0), 0) || 0;
    const tasaEmpleo = totalPEA > 0 ? ((ocupados / totalPEA) * 100).toFixed(2) : '0.00';
    return `La tasa de empleo en el distrito AISI es del ${tasaEmpleo}%, con ${ocupados} personas ocupadas.`;
  }

  generateIncomeText(data: Seccion23Data): string {
    return `El ingreso per cápita del distrito AISI es de S/ ${data.ingresoPerCapitaAISI?.toFixed(2) || '0.00'}, ocupando el ranking ${data.rankingIngresoAISI || 'N/A'} en la provincia.`;
  }

  generateDistrictIndicatorsText(data: Seccion23Data): string {
    return `El distrito AISI cuenta con una población total de ${data.poblacionDistritalAISI || 0} habitantes y una PET de ${data.petDistritalAISI || 0} personas en edad de trabajar.`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion3DataService extends ISeccion3DataService {
  constructor(private projectFacade: ProjectStateFacade) {
    super();
  }

  getSeccion3Data(): Observable<Seccion3Data> {
    const datos = this.projectFacade.obtenerDatos();
    const seccion3Data: Seccion3Data = {
      parrafoSeccion3_metodologia: datos['parrafoSeccion3_metodologia'] || '',
      parrafoSeccion3_fuentes_primarias: datos['parrafoSeccion3_fuentes_primarias'] || '',
      parrafoSeccion3_fuentes_primarias_cuadro: datos['parrafoSeccion3_fuentes_primarias_cuadro'] || '',
      parrafoSeccion3_fuentes_secundarias: datos['parrafoSeccion3_fuentes_secundarias'] || '',
      cantidadEntrevistas: Number(datos['cantidadEntrevistas']) || 0,
      fechaTrabajoCampo: datos['fechaTrabajoCampo'] || '',
      consultora: datos['consultora'] || '',
      entrevistados: datos['entrevistados'] || [],
      fuentesSecundariasLista: datos['fuentesSecundariasLista'] || []
    };
    return of(seccion3Data);
  }

  updateSeccion3Data(updates: Partial<Seccion3Data>): Observable<Seccion3Data> {
    // For now, just return the updates merged with current data
    return this.getSeccion3Data().pipe(
      map(currentData => ({ ...currentData, ...updates }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion3TextGeneratorService extends ISeccion3TextGeneratorService {
  generateMetodologiaText(data: Seccion3Data): string {
    return data.parrafoSeccion3_metodologia || 'Texto de metodología ____.';
  }

  generateFuentesPrimariasText(data: Seccion3Data): string {
    const textoBase = data.parrafoSeccion3_fuentes_primarias || 'Fuentes primarias no especificadas.';
    const cuadroTexto = data.parrafoSeccion3_fuentes_primarias_cuadro || '';
    return cuadroTexto ? `${textoBase}\n\n${cuadroTexto}` : textoBase;
  }

  generateFuentesSecundariasText(data: Seccion3Data): string {
    const textoBase = data.parrafoSeccion3_fuentes_secundarias || 'Fuentes secundarias no especificadas.';
    const lista = data.fuentesSecundariasLista || [];
    if (lista.length > 0) {
      const listaFormateada = lista.map((fuente, index) => `${index + 1}. ${fuente}`).join('\n');
      return `${textoBase}\n\n${listaFormateada}`;
    }
    return textoBase;
  }

  generateEntrevistasText(data: Seccion3Data): string {
    const cantidad = data.cantidadEntrevistas || 0;
    const fecha = data.fechaTrabajoCampo || 'fecha no especificada';
    const consultora = data.consultora || 'consultora no especificada';
    const entrevistados = data.entrevistados || [];

    let texto = `Se realizaron ${cantidad} entrevistas durante el trabajo de campo realizado el ${fecha} por la ${consultora}.`;

    if (entrevistados.length > 0) {
      texto += '\n\nEntrevistados:';
      entrevistados.forEach((entrevistado, index) => {
        texto += `\n${index + 1}. ${entrevistado.nombre} - ${entrevistado.cargo} (${entrevistado.organizacion})`;
      });
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion10DataService extends ISeccion10DataService {
  getSeccion10Data(): Observable<Seccion10Data> {
    return of(this.getMockSeccion10Data());
  }

  updateSeccion10Data(updates: Partial<Seccion10Data>): Observable<Seccion10Data> {
    const currentData = this.getMockSeccion10Data();
    const updatedData = { ...currentData, ...updates };
    return of(updatedData);
  }

  private getMockSeccion10Data(): Seccion10Data {
    return {
      grupoAISD: '',
      distritoSeleccionado: '',
      parrafoSeccion10_servicios_basicos_intro: '',
      abastecimientoAguaTabla: [],
      cuotaMensualAgua: '',
      tiposSaneamientoTabla: [],
      saneamientoTabla: [],
      alumbradoElectricoTabla: [],
      empresaElectrica: '',
      costoElectricidadMinimo: '',
      costoElectricidadMaximo: '',
      textoServiciosAgua: '',
      textoServiciosAguaDetalle: '',
      textoServiciosDesague: '',
      textoServiciosDesagueDetalle: '',
      textoDesechosSolidos1: '',
      textoDesechosSolidos2: '',
      textoDesechosSolidos3: '',
      textoElectricidad1: '',
      textoElectricidad2: '',
      textoEnergiaParaCocinar: ''
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion10TextGeneratorService extends ISeccion10TextGeneratorService {
  generateServiciosBasicosIntroText(data: Seccion10Data): string {
    return data.parrafoSeccion10_servicios_basicos_intro || 'Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento. En 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia el total de viviendas con ocupantes presentes (____), tal como realiza el Censo Nacional ____.';
  }

  generateAguaText(data: Seccion10Data): string {
    const textoBase = data.textoServiciosAgua || '';
    const detalle = data.textoServiciosAguaDetalle || '';
    const cuota = data.cuotaMensualAgua || '';
    
    let texto = textoBase;
    if (detalle) {
      texto += '\n\n' + detalle;
    }
    if (cuota) {
      texto += `\n\nCuota mensual de agua: S/ ${cuota}`;
    }
    
    return texto || 'Información sobre servicios de agua ____.';
  }

  generateSaneamientoText(data: Seccion10Data): string {
    const textoBase = data.textoServiciosDesague || '';
    const detalle = data.textoServiciosDesagueDetalle || '';
    
    let texto = textoBase;
    if (detalle) {
      texto += '\n\n' + detalle;
    }
    
    return texto || 'Información sobre servicios de saneamiento ____.';
  }

  generateElectricidadText(data: Seccion10Data): string {
    const texto1 = data.textoElectricidad1 || '';
    const texto2 = data.textoElectricidad2 || '';
    const empresa = data.empresaElectrica || '';
    const costoMin = data.costoElectricidadMinimo || '';
    const costoMax = data.costoElectricidadMaximo || '';
    
    let texto = texto1;
    if (texto2) {
      texto += '\n\n' + texto2;
    }
    if (empresa) {
      texto += `\n\nEmpresa eléctrica: ${empresa}`;
    }
    if (costoMin && costoMax) {
      texto += `\n\nCosto de electricidad: S/ ${costoMin} - S/ ${costoMax}`;
    }
    
    return texto || 'Información sobre servicios de electricidad ____.';
  }

  generateDesechosSolidosText(data: Seccion10Data): string {
    const texto1 = data.textoDesechosSolidos1 || '';
    const texto2 = data.textoDesechosSolidos2 || '';
    const texto3 = data.textoDesechosSolidos3 || '';
    
    let texto = texto1;
    if (texto2) {
      texto += '\n\n' + texto2;
    }
    if (texto3) {
      texto += '\n\n' + texto3;
    }
    
    return texto || 'Información sobre gestión de desechos sólidos ____.';
  }

  generateEnergiaCocinarText(data: Seccion10Data): string {
    return data.textoEnergiaParaCocinar || 'Información sobre energía para cocinar ____.';
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion6DataService extends ISeccion6DataService {
  getSeccion6Data(): Observable<Seccion6Data> {
    return of(this.getMockSeccion6Data());
  }

  updateSeccion6Data(updates: Partial<Seccion6Data>): Observable<Seccion6Data> {
    const currentData = this.getMockSeccion6Data();
    const updatedData = { ...currentData, ...updates };
    return of(updatedData);
  }

  private getMockSeccion6Data(): Seccion6Data {
    return {
      grupoAISD: '',
      distritoSeleccionado: '',
      poblacionSexoAISD: [],
      poblacionEtarioAISD: [],
      textoPoblacionSexoAISD: '',
      textoPoblacionEtarioAISD: ''
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion6TextGeneratorService extends ISeccion6TextGeneratorService {
  generatePoblacionSexoText(data: Seccion6Data): string {
    const tabla = data.poblacionSexoAISD || [];
    if (!tabla.length) {
      return 'Respecto a la población de la CC ____, tomando en cuenta data obtenida de los Censos Nacionales ____ y los puntos de población que la conforman, existen un total de ____ habitantes que residen permanentemente en la comunidad. De este conjunto, el ____ % son varones, por lo que se aprecia una ____ mayoría de dicho grupo frente a sus pares femeninos (____ %).';
    }

    let texto = 'La distribución de la población por sexo es la siguiente:';
    
    tabla.forEach(item => {
      if (item.sexo && item.casos !== undefined) {
        texto += `\n- ${item.sexo}: ${item.casos} personas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoPoblacionSexoAISD) {
      texto += '\n\n' + data.textoPoblacionSexoAISD;
    }

    return texto;
  }

  generatePoblacionEtarioText(data: Seccion6Data): string {
    const tabla = data.poblacionEtarioAISD || [];
    if (!tabla.length) {
      return 'En una clasificación en grandes grupos de edad, se puede observar que el grupo etario mayoritario en la CC ____ es el de ____ años, puesto que representa el ____ % de la población total. En segundo lugar, bastante cerca del primero, se halla el bloque etario de ____ años (____ %). Por otro lado, el conjunto minoritario está conformado por la población de ____ años a más, pues solo representa un ____ %.';
    }

    let texto = 'La distribución de la población por grupos etarios es la siguiente:';
    
    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} personas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoPoblacionEtarioAISD) {
      texto += '\n\n' + data.textoPoblacionEtarioAISD;
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion7DataService extends ISeccion7DataService {
  getSeccion7Data(): Observable<Seccion7Data> {
    return of(this.getMockSeccion7Data());
  }

  updateSeccion7Data(updates: Partial<Seccion7Data>): Observable<Seccion7Data> {
    const currentData = this.getMockSeccion7Data();
    const updatedData = { ...currentData, ...updates };
    return of(updatedData);
  }

  private getMockSeccion7Data(): Seccion7Data {
    return {
      grupoAISD: '',
      distritoSeleccionado: '',
      poblacionDistritalCahuacho: '',
      petDistritalCahuacho: '',
      ingresoFamiliarPerCapita: '',
      rankingIngresoPerCapita: '',
      petTabla: [],
      peaTabla: [],
      peaOcupadaTabla: [],
      cuadroTituloPET: '',
      cuadroFuentePET: '',
      cuadroTituloPEA: '',
      cuadroFuentePEA: '',
      cuadroTituloPEAOcupada: '',
      cuadroFuentePEAOcupada: '',
      parrafoSeccion7_situacion_empleo_completo: '',
      parrafoSeccion7_ingresos_completo: '',
      textoPET: '',
      textoDetalePEA: '',
      textoDefinicionPEA: '',
      textoAnalisisPEA: '',
      textoIndiceDesempleo: '',
      textoPEAOcupada: '',
      textoAnalisisPEAOcupada: '',
      fotografiasPEA: []
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion7TextGeneratorService extends ISeccion7TextGeneratorService {
  generatePETText(data: Seccion7Data): string {
    // TODO: Implement PET text generation logic
    return 'Texto PET generado';
  }

  generatePEAText(data: Seccion7Data): string {
    // TODO: Implement PEA text generation logic
    return 'Texto PEA generado';
  }

  generatePEAOcupadaText(data: Seccion7Data): string {
    // TODO: Implement PEA Ocupada text generation logic
    return 'Texto PEA Ocupada generado';
  }

  generateSituacionEmpleoText(data: Seccion7Data): string {
    // TODO: Implement situacion empleo text generation logic
    return 'Texto situación empleo generado';
  }

  generateIngresosText(data: Seccion7Data): string {
    // TODO: Implement ingresos text generation logic
    return 'Texto ingresos generado';
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion8DataService extends ISeccion8DataService {
  getSeccion8Data(): Observable<Seccion8Data> {
    return of(this.getMockSeccion8Data());
  }

  updateSeccion8Data(updates: Partial<Seccion8Data>): Observable<Seccion8Data> {
    const currentData = this.getMockSeccion8Data();
    const updatedData = { ...currentData, ...updates };
    return of(updatedData);
  }

  private getMockSeccion8Data(): Seccion8Data {
    return {
      grupoAISD: '',
      provinciaSeleccionada: '',
      parrafoSeccion8_ganaderia_completo: '',
      parrafoSeccion8_agricultura_completo: '',
      peaOcupacionesTabla: [],
      poblacionPecuariaTabla: [],
      caracteristicasAgriculturaTabla: [],
      textoActividadesEconomicas: '',
      textoFuentesActividadesEconomicas: '',
      textoAnalisisCuadro310: '',
      textoMercadoComercializacion1: '',
      textoMercadoComercializacion2: '',
      textoHabitosConsumo1: '',
      textoHabitosConsumo2: ''
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion8TextGeneratorService extends ISeccion8TextGeneratorService {
  generateGanaderiaText(data: Seccion8Data): string {
    return data.parrafoSeccion8_ganaderia_completo || 'Información sobre ganadería ____.';
  }

  generateAgriculturaText(data: Seccion8Data): string {
    return data.parrafoSeccion8_agricultura_completo || 'Información sobre agricultura ____.';
  }

  generateActividadesEconomicasText(data: Seccion8Data): string {
    const textoBase = data.textoActividadesEconomicas || '';
    const fuentes = data.textoFuentesActividadesEconomicas || '';
    const analisis = data.textoAnalisisCuadro310 || '';
    
    let texto = textoBase;
    if (fuentes) {
      texto += '\n\nFuentes: ' + fuentes;
    }
    if (analisis) {
      texto += '\n\nAnálisis: ' + analisis;
    }
    
    return texto || 'Información sobre actividades económicas ____.';
  }

  generateMercadoComercializacionText(data: Seccion8Data): string {
    const texto1 = data.textoMercadoComercializacion1 || '';
    const texto2 = data.textoMercadoComercializacion2 || '';
    
    let texto = texto1;
    if (texto2) {
      texto += '\n\n' + texto2;
    }
    
    return texto || 'Información sobre mercado y comercialización ____.';
  }

  generateHabitosConsumoText(data: Seccion8Data): string {
    const texto1 = data.textoHabitosConsumo1 || '';
    const texto2 = data.textoHabitosConsumo2 || '';
    
    let texto = texto1;
    if (texto2) {
      texto += '\n\n' + texto2;
    }
    
    return texto || 'Información sobre hábitos de consumo ____.';
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion9DataService extends ISeccion9DataService {
  getSeccion9Data(): Observable<Seccion9Data> {
    return of(this.getMockSeccion9Data());
  }

  updateSeccion9Data(updates: Partial<Seccion9Data>): Observable<Seccion9Data> {
    const currentData = this.getMockSeccion9Data();
    const updatedData = { ...currentData, ...updates };
    return of(updatedData);
  }

  private getMockSeccion9Data(): Seccion9Data {
    return {
      grupoAISD: '',
      condicionOcupacionTabla: [],
      tiposMaterialesTabla: [],
      textoViviendas: '',
      textoEstructura: ''
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion9TextGeneratorService extends ISeccion9TextGeneratorService {
  generateViviendasText(data: Seccion9Data): string {
    const tabla = data.condicionOcupacionTabla || [];
    if (!tabla.length) {
      return 'Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ____ se hallan un total de ____ viviendas empadronadas. De estas, solamente ____ se encuentran ocupadas, representando un ____ %. Cabe mencionar que, para poder describir el acápite de estructura de las viviendas de esta comunidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas.';
    }

    let texto = 'La condición de ocupación de las viviendas es la siguiente:';
    
    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} viviendas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoViviendas) {
      texto += '\n\n' + data.textoViviendas;
    }

    return texto;
  }

  generateEstructuraText(data: Seccion9Data): string {
    const tabla = data.tiposMaterialesTabla || [];
    if (!tabla.length) {
      return 'Según la información recabada de los Censos Nacionales ____, dentro de la CC ____, el material más empleado para la construcción de las paredes de las viviendas es el ____, pues representa el ____ %. A ello le complementa el material de ____ (____ %). Respecto a los techos, destacan principalmente las ____ con un ____ %. El porcentaje restante consiste en ____ (____ %) y en ____ (____ %). Finalmente, en cuanto a los pisos, la mayoría están hechos de ____ (____ %). Por otra parte, el porcentaje restante (____ %) consiste en ____.';
    }

    let texto = 'Los tipos de materiales utilizados en la construcción son:';
    
    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} viviendas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoEstructura) {
      texto += '\n\n' + data.textoEstructura;
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion26DataService extends ISeccion26DataService {
  constructor() {
    super();
  }

  getSeccion26Data(): Observable<Seccion26Data> {
    return of(this.getMockData());
  }

  updateSeccion26Data(updates: Partial<Seccion26Data>): Observable<Seccion26Data> {
    const currentData = this.getMockData();
    const updatedData = { ...currentData, ...updates };
    return of(updatedData);
  }

  private getMockData(): Seccion26Data {
    return {
      centroPobladoAISI: '',
      abastecimientoAguaCpTabla: [],
      saneamientoCpTabla: [],
      coberturaElectricaCpTabla: [],
      combustiblesCocinarCpTabla: [],
      textoIntroServiciosBasicosAISI: '',
      textoServiciosAguaAISI: '',
      textoDesagueCP: '',
      textoDesechosSolidosCP: '',
      textoElectricidadCP: '',
      textoEnergiaCocinarCP: ''
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion26TextGeneratorService extends ISeccion26TextGeneratorService {
  constructor() {
    super();
  }

  generateIntroServiciosBasicosText(data: Seccion26Data): string {
    const centroPoblado = data.centroPobladoAISI || 'Centro Poblado';
    return `A continuación se presenta información sobre los servicios básicos en ${centroPoblado}.`;
  }

  generateServiciosAguaText(data: Seccion26Data): string {
    const tabla = data.abastecimientoAguaCpTabla || [];
    if (!tabla.length) {
      return 'Información sobre abastecimiento de agua ____.';
    }

    let texto = 'El abastecimiento de agua se distribuye de la siguiente manera:';

    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} viviendas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoServiciosAguaAISI) {
      texto += '\n\n' + data.textoServiciosAguaAISI;
    }

    return texto;
  }

  generateDesagueText(data: Seccion26Data): string {
    const tabla = data.saneamientoCpTabla || [];
    if (!tabla.length) {
      return 'Información sobre saneamiento ____.';
    }

    let texto = 'El servicio de saneamiento se distribuye de la siguiente manera:';

    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} viviendas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoDesagueCP) {
      texto += '\n\n' + data.textoDesagueCP;
    }

    return texto;
  }

  generateDesechosSolidosText(data: Seccion26Data): string {
    return data.textoDesechosSolidosCP || 'Información sobre manejo de desechos sólidos ____.';
  }

  generateElectricidadText(data: Seccion26Data): string {
    const tabla = data.coberturaElectricaCpTabla || [];
    if (!tabla.length) {
      return 'Información sobre cobertura eléctrica ____.';
    }

    let texto = 'La cobertura eléctrica se distribuye de la siguiente manera:';

    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} viviendas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoElectricidadCP) {
      texto += '\n\n' + data.textoElectricidadCP;
    }

    return texto;
  }

  generateEnergiaCocinarText(data: Seccion26Data): string {
    const tabla = data.combustiblesCocinarCpTabla || [];
    if (!tabla.length) {
      return 'Información sobre combustibles para cocinar ____.';
    }

    let texto = 'Los combustibles utilizados para cocinar se distribuyen de la siguiente manera:';

    tabla.forEach(item => {
      if (item.nombre && item.casos !== undefined) {
        texto += `\n- ${item.nombre}: ${item.casos} viviendas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoEnergiaCocinarCP) {
      texto += '\n\n' + data.textoEnergiaCocinarCP;
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion12DataService extends ISeccion12DataService {
  constructor() {
    super();
  }

  getSeccion12Data(): Observable<Seccion12Data> {
    return of(this.getMockData());
  }

  updateSeccion12Data(updates: Partial<Seccion12Data>): Observable<Seccion12Data> {
    const currentData = this.getMockData();
    const updatedData = { ...currentData, ...updates };
    return of(updatedData);
  }

  private getMockData(): Seccion12Data {
    return {
      grupoAISD: '',
      provinciaSeleccionada: '',
      caracteristicasSaludTabla: [],
      cantidadEstudiantesEducacionTabla: [],
      ieAyrocaTabla: [],
      ie40270Tabla: [],
      alumnosIEAyrocaTabla: [],
      alumnosIE40270Tabla: [],
      parrafoSeccion12_salud_completo: '',
      parrafoSeccion12_educacion_completo: '',
      textoInfraestructuraEducacionPost: '',
      textoAlumnosPorSexoGrado: '',
      textoInfraestructuraRecreacion: '',
      textoInfraestructuraRecreacionDetalle: '',
      textoInfraestructuraDeporte: '',
      textoInfraestructuraDeportDetalle: ''
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion12TextGeneratorService extends ISeccion12TextGeneratorService {
  constructor() {
    super();
  }

  generateSaludText(data: Seccion12Data): string {
    const tabla = data.caracteristicasSaludTabla || [];
    if (!tabla.length) {
      return 'Información sobre características de salud ____.';
    }

    let texto = 'Características del establecimiento de salud:';

    tabla.forEach(item => {
      if (item.categoria && item.descripcion) {
        texto += `\n- ${item.categoria}: ${item.descripcion}`;
      }
    });

    if (data.parrafoSeccion12_salud_completo) {
      texto += '\n\n' + data.parrafoSeccion12_salud_completo;
    }

    return texto;
  }

  generateEducacionText(data: Seccion12Data): string {
    const tabla = data.cantidadEstudiantesEducacionTabla || [];
    if (!tabla.length) {
      return 'Información sobre educación ____.';
    }

    let texto = 'Información sobre instituciones educativas:';

    tabla.forEach(item => {
      if (item.institucion && item.total !== undefined) {
        texto += `\n- ${item.institucion}: ${item.total} estudiantes`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.parrafoSeccion12_educacion_completo) {
      texto += '\n\n' + data.parrafoSeccion12_educacion_completo;
    }

    return texto;
  }

  generateInfraestructuraEducacionText(data: Seccion12Data): string {
    return data.textoInfraestructuraEducacionPost || 'Información sobre infraestructura educativa ____.';
  }

  generateAlumnosPorSexoGradoText(data: Seccion12Data): string {
    return data.textoAlumnosPorSexoGrado || 'Información sobre alumnos por sexo y grado ____.';
  }

  generateInfraestructuraRecreacionText(data: Seccion12Data): string {
    let texto = data.textoInfraestructuraRecreacion || 'Dentro de la CC ____ se cuenta con un espacio destinado a la recreación de la población. Este es el parque recreacional público, el cual se ubica entre el puesto de salud y el local comunal. Aquí la población puede reunirse y también cuenta con juegos recreativos destinados a los niños. La siguiente infraestructura es la plaza de toros, que se halla en la zona este del anexo, y es un punto de gran relevancia cultural; en especial, durante las festividades patronales. En adición a ello, otro espacio de reunión es la plaza central del anexo ____. Este lugar sirve ocasionalmente como punto de encuentro para los comuneros, quienes se reúnen allí de manera informal en momentos importantes o festivos.';

    if (data.textoInfraestructuraRecreacionDetalle) {
      texto += '\n\n' + data.textoInfraestructuraRecreacionDetalle;
    }

    return texto;
  }

  generateInfraestructuraDeporteText(data: Seccion12Data): string {
    let texto = data.textoInfraestructuraDeporte || 'En la CC ____, la infraestructura deportiva es limitada. Los únicos espacios dedicados al deporte son una losa deportiva y un "estadio". Estas infraestructuras son utilizadas principalmente para partidos de fútbol y otros encuentros deportivos informales que se organizan entre los comuneros, especialmente durante festividades locales. Respecto a la losa deportiva, esta se encuentra hecha a base de cemento. Por otra parte, el "estadio" es un campo de juego de pasto natural de un tamaño más extenso que la losa. No obstante, no cuenta con infraestructura adicional como gradas o servicios higiénicos.';

    if (data.textoInfraestructuraDeportDetalle) {
      texto += '\n\n' + data.textoInfraestructuraDeportDetalle;
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion25DataService extends ISeccion25DataService {
  constructor() {
    super();
  }

  getSeccion25Data(): Observable<Seccion25Data> {
    return of(this.getMockData());
  }

  updateSeccion25Data(updates: Partial<Seccion25Data>): Observable<Seccion25Data> {
    const currentData = this.getMockData();
    const updatedData = { ...currentData, ...updates };
    return of(updatedData);
  }

  private getMockData(): Seccion25Data {
    return {
      centroPobladoAISI: '',
      tiposViviendaAISI: [],
      condicionOcupacionAISI: [],
      materialesViviendaAISI: [],
      textoViviendaAISI: '',
      textoOcupacionViviendaAISI: '',
      textoEstructuraAISI: ''
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion25TextGeneratorService extends ISeccion25TextGeneratorService {
  constructor() {
    super();
  }

  generateViviendaText(data: Seccion25Data): string {
    const tabla = data.tiposViviendaAISI || [];
    if (!tabla.length) {
      return 'Información sobre tipos de vivienda ____.';
    }

    let texto = 'Los tipos de vivienda se distribuyen de la siguiente manera:';

    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} viviendas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoViviendaAISI) {
      texto += '\n\n' + data.textoViviendaAISI;
    }

    return texto;
  }

  generateOcupacionViviendaText(data: Seccion25Data): string {
    const tabla = data.condicionOcupacionAISI || [];
    if (!tabla.length) {
      return 'Información sobre condición de ocupación ____.';
    }

    let texto = 'La condición de ocupación de las viviendas es la siguiente:';

    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} viviendas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoOcupacionViviendaAISI) {
      texto += '\n\n' + data.textoOcupacionViviendaAISI;
    }

    return texto;
  }

  generateEstructuraText(data: Seccion25Data): string {
    const tabla = data.materialesViviendaAISI || [];
    if (!tabla.length) {
      return 'Información sobre materiales de vivienda ____.';
    }

    let texto = 'Los materiales utilizados en la construcción son:';

    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} viviendas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoEstructuraAISI) {
      texto += '\n\n' + data.textoEstructuraAISI;
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion28DataService extends ISeccion28DataService {
  constructor() {
    super();
  }

  getSeccion28Data(): Observable<Seccion28Data> {
    return of({
      centroPobladoAISI: '',
      puestoSaludCpTabla: [],
      educacionCpTabla: [],
      nombreIEMayorEstudiantes: '',
      cantidadEstudiantesIEMayor: 0,
      textoSaludCP: '',
      textoEducacionCP: '',
      textoRecreacionCP1: '',
      textoRecreacionCP2: '',
      textoRecreacionCP3: '',
      textoDeporteCP1: '',
      textoDeporteCP2: ''
    });
  }

  updateSeccion28Data(updates: Partial<Seccion28Data>): Observable<Seccion28Data> {
    return this.getSeccion28Data().pipe(
      map(currentData => ({ ...currentData, ...updates }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion28TextGeneratorService extends ISeccion28TextGeneratorService {
  constructor() {
    super();
  }

  generateSaludText(data: Seccion28Data): string {
    const tabla = data.puestoSaludCpTabla || [];
    if (!tabla.length) {
      return 'Información sobre puestos de salud ____.';
    }

    let texto = 'Los puestos de salud disponibles son:';

    tabla.forEach(item => {
      if (item.categoria && item.descripcion) {
        texto += `\n- ${item.categoria}: ${item.descripcion}`;
      }
    });

    if (data.textoSaludCP) {
      texto += '\n\n' + data.textoSaludCP;
    }

    return texto;
  }

  generateEducacionText(data: Seccion28Data): string {
    const tabla = data.educacionCpTabla || [];
    if (!tabla.length) {
      return 'Información sobre educación ____.';
    }

    let texto = 'Las instituciones educativas presentes son:';

    tabla.forEach(item => {
      if (item.nombreIE && item.cantidadEstudiantes !== undefined) {
        texto += `\n- ${item.nombreIE}: ${item.cantidadEstudiantes} estudiantes`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.nombreIEMayorEstudiantes && data.cantidadEstudiantesIEMayor) {
      texto += `\n\nLa institución educativa con mayor número de estudiantes es ${data.nombreIEMayorEstudiantes} con ${data.cantidadEstudiantesIEMayor} estudiantes.`;
    }

    if (data.textoEducacionCP) {
      texto += '\n\n' + data.textoEducacionCP;
    }

    return texto;
  }

  generateRecreacionText(data: Seccion28Data): string {
    let texto = 'Información sobre recreación:';

    if (data.textoRecreacionCP1) {
      texto += '\n\n' + data.textoRecreacionCP1;
    }
    if (data.textoRecreacionCP2) {
      texto += '\n\n' + data.textoRecreacionCP2;
    }
    if (data.textoRecreacionCP3) {
      texto += '\n\n' + data.textoRecreacionCP3;
    }

    if (!data.textoRecreacionCP1 && !data.textoRecreacionCP2 && !data.textoRecreacionCP3) {
      texto = 'Información sobre recreación ____.';
    }

    return texto;
  }

  generateDeporteText(data: Seccion28Data): string {
    let texto = 'Información sobre deporte:';

    if (data.textoDeporteCP1) {
      texto += '\n\n' + data.textoDeporteCP1;
    }
    if (data.textoDeporteCP2) {
      texto += '\n\n' + data.textoDeporteCP2;
    }

    if (!data.textoDeporteCP1 && !data.textoDeporteCP2) {
      texto = 'Información sobre deporte ____.';
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion29DataService extends ISeccion29DataService {
  constructor() {
    super();
  }

  getSeccion29Data(): Observable<Seccion29Data> {
    return of({
      centroPobladoAISI: '',
      natalidadMortalidadCpTabla: [],
      morbilidadCpTabla: [],
      afiliacionSaludTabla: [],
      textoNatalidadCP1: '',
      textoNatalidadCP2: '',
      textoMorbilidadCP: '',
      textoAfiliacionSalud: ''
    });
  }

  updateSeccion29Data(updates: Partial<Seccion29Data>): Observable<Seccion29Data> {
    return this.getSeccion29Data().pipe(
      map(currentData => ({ ...currentData, ...updates }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion29TextGeneratorService extends ISeccion29TextGeneratorService {
  constructor() {
    super();
  }

  generateNatalidadText(data: Seccion29Data): string {
    const tabla = data.natalidadMortalidadCpTabla || [];
    if (!tabla.length) {
      return 'Información sobre natalidad y mortalidad ____.';
    }

    let texto = 'Estadísticas de natalidad y mortalidad por año:';

    tabla.forEach(item => {
      if (item.anio && item.natalidad !== undefined && item.mortalidad !== undefined) {
        texto += `\n- ${item.anio}: ${item.natalidad} nacimientos, ${item.mortalidad} defunciones`;
      }
    });

    if (data.textoNatalidadCP1) {
      texto += '\n\n' + data.textoNatalidadCP1;
    }
    if (data.textoNatalidadCP2) {
      texto += '\n\n' + data.textoNatalidadCP2;
    }

    return texto;
  }

  generateMorbilidadText(data: Seccion29Data): string {
    const tabla = data.morbilidadCpTabla || [];
    if (!tabla.length) {
      return 'Información sobre morbilidad ____.';
    }

    let texto = 'Casos de morbilidad por grupo etario:';

    tabla.forEach(item => {
      if (item.grupo && item.casos !== undefined) {
        texto += `\n- ${item.grupo}: ${item.casos} casos`;
        if (item.edad0_11 !== undefined || item.edad12_17 !== undefined ||
            item.edad18_29 !== undefined || item.edad30_59 !== undefined ||
            item.edad60_mas !== undefined) {
          const detalles = [];
          if (item.edad0_11 > 0) detalles.push(`${item.edad0_11} casos 0-11 años`);
          if (item.edad12_17 > 0) detalles.push(`${item.edad12_17} casos 12-17 años`);
          if (item.edad18_29 > 0) detalles.push(`${item.edad18_29} casos 18-29 años`);
          if (item.edad30_59 > 0) detalles.push(`${item.edad30_59} casos 30-59 años`);
          if (item.edad60_mas > 0) detalles.push(`${item.edad60_mas} casos 60+ años`);
          if (detalles.length > 0) {
            texto += ` (${detalles.join(', ')})`;
          }
        }
      }
    });

    if (data.textoMorbilidadCP) {
      texto += '\n\n' + data.textoMorbilidadCP;
    }

    return texto;
  }

  generateAfiliacionSaludText(data: Seccion29Data): string {
    const tabla = data.afiliacionSaludTabla || [];
    if (!tabla.length) {
      return 'Información sobre afiliación a salud ____.';
    }

    let texto = 'Afiliación a seguros de salud:';

    tabla.forEach(item => {
      if (item.categoria && item.casos !== undefined) {
        texto += `\n- ${item.categoria}: ${item.casos} personas`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoAfiliacionSalud) {
      texto += '\n\n' + data.textoAfiliacionSalud;
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion24DataService extends ISeccion24DataService {
  constructor() {
    super();
  }

  getSeccion24Data(): Observable<Seccion24Data> {
    return of({
      centroPobladoAISI: '',
      actividadesEconomicasAISI: [],
      ciudadOrigenComercio: '',
      textoIntroActividadesEconomicasAISI: '',
      textoActividadesEconomicasAISI: '',
      textoMercadoProductos: '',
      textoHabitosConsumo: ''
    });
  }

  updateSeccion24Data(updates: Partial<Seccion24Data>): Observable<Seccion24Data> {
    return this.getSeccion24Data().pipe(
      map(currentData => ({ ...currentData, ...updates }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion24TextGeneratorService extends ISeccion24TextGeneratorService {
  constructor() {
    super();
  }

  generateActividadesEconomicasText(data: Seccion24Data): string {
    if (!data.actividadesEconomicasAISI || !data.actividadesEconomicasAISI.length) {
      return 'Información sobre actividades económicas ____.';
    }

    let texto = 'Actividades económicas en el centro poblado:';

    if (data.textoIntroActividadesEconomicasAISI) {
      texto = data.textoIntroActividadesEconomicasAISI;
    }

    data.actividadesEconomicasAISI.forEach((item: any) => {
      if (item.actividad && item.casos !== undefined) {
        texto += `\n- ${item.actividad}: ${item.casos} casos`;
        if (item.porcentaje) {
          texto += ` (${item.porcentaje})`;
        }
      }
    });

    if (data.textoActividadesEconomicasAISI) {
      texto += '\n\n' + data.textoActividadesEconomicasAISI;
    }

    return texto;
  }

  generateMercadoText(data: Seccion24Data): string {
    if (!data.ciudadOrigenComercio) {
      return 'Información sobre mercado y origen de productos ____.';
    }

    let texto = `Los productos comercializados provienen principalmente de: ${data.ciudadOrigenComercio}`;

    if (data.textoMercadoProductos) {
      texto += '\n\n' + data.textoMercadoProductos;
    }

    return texto;
  }

  generateHabitosConsumoText(data: Seccion24Data): string {
    if (!data.textoHabitosConsumo) {
      return 'Información sobre hábitos de consumo ____.';
    }

    return data.textoHabitosConsumo;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion22DataService extends ISeccion22DataService {
  constructor() {
    super();
  }

  getSeccion22Data(): Observable<Seccion22Data> {
    return of(this.getMockData());
  }

  updateSeccion22Data(updates: Partial<Seccion22Data>): Observable<Seccion22Data> {
    return this.getSeccion22Data().pipe(
      map(data => ({ ...data, ...updates }))
    );
  }

  private getMockData(): Seccion22Data {
    return {
      centroPobladoAISI: 'Cahuacho',
      poblacionSexoAISI: [
        { sexo: 'Hombres', casos: 1250, porcentaje: '48,54 %' },
        { sexo: 'Mujeres', casos: 1325, porcentaje: '51,46 %' }
      ],
      poblacionEtarioAISI: [
        { categoria: '0-14 años', casos: 850, porcentaje: '33,00 %' },
        { categoria: '15-64 años', casos: 1600, porcentaje: '62,16 %' },
        { categoria: '65 años a más', casos: 125, porcentaje: '4,85 %' }
      ],
      textoDemografiaAISI: '',
      textoGrupoEtarioAISI: ''
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion22TextGeneratorService extends ISeccion22TextGeneratorService {
  constructor() {
    super();
  }

  generateDemografiaText(data: Seccion22Data): string {
    if (!data.poblacionSexoAISI || data.poblacionSexoAISI.length === 0) {
      return 'Respecto a la población del CP ____, tomando en cuenta los Censos Nacionales ____, existen ____ habitantes que viven permanentemente en la localidad. De este conjunto, el ____ % son mujeres, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares masculinos (____ %).';
    }

    const hombres = data.poblacionSexoAISI.find(item => item.sexo.toLowerCase().includes('hombre'));
    const mujeres = data.poblacionSexoAISI.find(item => item.sexo.toLowerCase().includes('mujer'));

    let texto = `Respecto a la población del CP ${data.centroPobladoAISI || '____'}, tomando en cuenta los Censos Nacionales ____, existen ____ habitantes que viven permanentemente en la localidad. De este conjunto, el ____ % son mujeres, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares masculinos (____ %).`;

    if (hombres && mujeres) {
      // No agregar números específicos para mantener como plantilla
    }

    if (data.textoDemografiaAISI) {
      texto += '\n\n' + data.textoDemografiaAISI;
    }

    return texto;
  }

  generateGrupoEtarioText(data: Seccion22Data): string {
    if (!data.poblacionEtarioAISI || data.poblacionEtarioAISI.length === 0) {
      return 'En una clasificación por grupos etarios se puede observar que esta población se encuentra mayoritariamente en la categoría de ____ años, representando el ____ % del conjunto total. En segundo lugar, cerca del primer bloque se halla la categoría de ____ años (____ %). En cuanto al bloque etario minoritario, hay una igualdad entre aquellos que van de ____ años y los de ____ años a más, pues ambos grupos representan el ____ % cada uno.';
    }

    const grupos = data.poblacionEtarioAISI.map(grupo =>
      `${grupo.categoria}: ${grupo.casos} personas (${grupo.porcentaje})`
    ).join(', ');

    let texto = `En una clasificación por grupos etarios se puede observar que esta población se encuentra mayoritariamente en la categoría de ____ años, representando el ____ % del conjunto total. En segundo lugar, cerca del primer bloque se halla la categoría de ____ años (____ %). En cuanto al bloque etario minoritario, hay una igualdad entre aquellos que van de ____ años y los de ____ años a más, pues ambos grupos representan el ____ % cada uno.`;

    if (data.textoGrupoEtarioAISI) {
      texto += '\n\n' + data.textoGrupoEtarioAISI;
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion30DataService extends ISeccion30DataService {
  constructor() {
    super();
  }

  getSeccion30Data(): Observable<Seccion30Data> {
    return of(this.getMockData());
  }

  updateSeccion30Data(updates: Partial<Seccion30Data>): Observable<Seccion30Data> {
    return this.getSeccion30Data().pipe(
      map(data => ({ ...data, ...updates }))
    );
  }

  private getMockData(): Seccion30Data {
    return {
      centroPobladoAISI: 'Cahuacho',
      parrafoSeccion30_indicadores_educacion_intro: '',
      nivelEducativoTabla: [
        { nivel: 'Sin nivel', hombres: 20, mujeres: 25, total: 45 },
        { nivel: 'Primaria completa', hombres: 55, mujeres: 65, total: 120 },
        { nivel: 'Secundaria completa', hombres: 40, mujeres: 45, total: 85 },
        { nivel: 'Superior', hombres: 4, mujeres: 4, total: 8 }
      ],
      tasaAnalfabetismoTabla: [
        { grupo: 'Hombres', total: 125, alfabetos: 115, analfabetos: 10, tasaAnalfabetismo: '8,00 %' },
        { grupo: 'Mujeres', total: 133, alfabetos: 110, analfabetos: 23, tasaAnalfabetismo: '17,29 %' }
      ],
      textoNivelEducativo: '',
      textoTasaAnalfabetismo: ''
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Seccion30TextGeneratorService extends ISeccion30TextGeneratorService {
  constructor() {
    super();
  }

  generateNivelEducativoText(data: Seccion30Data): string {
    if (!data.nivelEducativoTabla || data.nivelEducativoTabla.length === 0) {
      return 'Información sobre niveles educativos ____.';
    }

    const totalEducativo = data.nivelEducativoTabla.reduce((sum, nivel) => sum + nivel.total, 0);
    const niveles = data.nivelEducativoTabla.map(nivel => {
      const porcentaje = totalEducativo > 0 ? ((nivel.total / totalEducativo) * 100).toFixed(1) + '%' : '0%';
      return `${nivel.nivel}: ${nivel.total} personas (${porcentaje})`;
    }).join(', ');

    let texto = `Los niveles educativos en ${data.centroPobladoAISI || 'Cahuacho'} se distribuyen de la siguiente manera: ${niveles}.`;

    if (data.textoNivelEducativo) {
      texto += '\n\n' + data.textoNivelEducativo;
    }

    return texto;
  }

  generateTasaAnalfabetismoText(data: Seccion30Data): string {
    if (!data.tasaAnalfabetismoTabla || data.tasaAnalfabetismoTabla.length === 0) {
      return 'Información sobre tasas de analfabetismo ____.';
    }

    const tasas = data.tasaAnalfabetismoTabla.map(item =>
      `${item.grupo}: ${item.tasaAnalfabetismo} (${item.analfabetos} de ${item.total} personas)`
    ).join(', ');

    let texto = `Las tasas de analfabetismo en ${data.centroPobladoAISI || 'Cahuacho'} son: ${tasas}.`;

    if (data.textoTasaAnalfabetismo) {
      texto += '\n\n' + data.textoTasaAnalfabetismo;
    }

    return texto;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GruposService {
  private readonly STORAGE_KEY_AISD = 'lbs_grupos_aisd';
  private readonly STORAGE_KEY_AISI = 'lbs_grupos_aisi';
  private readonly STORAGE_KEY_CCPP = 'lbs_centros_poblados';

  // Estado reactivo
  private gruposAISDSubject = new BehaviorSubject<GrupoAISD[]>([]);
  private gruposAISISubject = new BehaviorSubject<GrupoAISI[]>([]);
  private centrosPobladosSubject = new BehaviorSubject<CentroPoblado[]>([]);

  public gruposAISD$: Observable<GrupoAISD[]> = this.gruposAISDSubject.asObservable();
  public gruposAISI$: Observable<GrupoAISI[]> = this.gruposAISISubject.asObservable();
  public centrosPoblados$: Observable<CentroPoblado[]> = this.centrosPobladosSubject.asObservable();

  constructor(private storage: StorageFacade) {
    this.cargarDesdeStorage();
  }

  // ==================== GESTIÓN DE CENTROS POBLADOS ====================

  /**
   * Carga centros poblados desde JSON
   * Formato esperado: { "NOMBRE_GRUPO": [array de CCPP], ... }
   */
  cargarCentrosPobladosDesdeJSON(jsonData: any): void {
    try {
      const centrosPoblados: CentroPoblado[] = [];

      // Procesar cada grupo del JSON
      Object.keys(jsonData).forEach(key => {
        const datos = jsonData[key];
        if (Array.isArray(datos)) {
          datos.forEach((item: any) => {
            // Validar estructura mínima
            if (item.CCPP && item.UBIGEO) {
              centrosPoblados.push({
                ITEM: item.ITEM || 0,
                UBIGEO: item.UBIGEO,
                CODIGO: item.CODIGO || '',
                CCPP: item.CCPP,
                CATEGORIA: item.CATEGORIA || '',
                POBLACION: item.POBLACION || 0,
                DPTO: item.DPTO || '',
                PROV: item.PROV || '',
                DIST: item.DIST || '',
                ESTE: item.ESTE || 0,
                NORTE: item.NORTE || 0,
                ALTITUD: item.ALTITUD || 0
              });
            }
          });
        }
      });

      this.centrosPobladosSubject.next(centrosPoblados);
      this.guardarEnStorage(this.STORAGE_KEY_CCPP, centrosPoblados);
      
      // Logged: Centros poblados cargados: {centrosPoblados.length}
    } catch (error) {
      console.error('❌ Error al cargar centros poblados:', error);
      throw new Error('Formato de JSON inválido');
    }
  }

  /**
   * Obtiene todos los centros poblados disponibles
   */
  getCentrosPoblados(): CentroPoblado[] {
    return this.centrosPobladosSubject.value;
  }

  /**
   * Filtra centros poblados por criterio
   */
  filtrarCentrosPoblados(filtro: Partial<CentroPoblado>): CentroPoblado[] {
    const todos = this.getCentrosPoblados();
    return todos.filter(ccpp => {
      return Object.keys(filtro).every(key => {
        const filterValue = (filtro as any)[key];
        const ccppValue = (ccpp as any)[key];
        return filterValue === undefined || ccppValue === filterValue;
      });
    });
  }

  // ==================== GESTIÓN DE GRUPOS AISD ====================

  /**
   * Crea un nuevo grupo AISD (Comunidad Campesina)
   */
  crearGrupoAISD(nombre: string, centrosPoblados: CentroPoblado[] = []): GrupoAISD {
    const grupos = this.gruposAISDSubject.value;
    const nuevoOrden = grupos.length + 1;

    const nuevoGrupo: GrupoAISD = {
      id: this.generarId(),
      nombre,
      tipo: 'AISD',
      orden: nuevoOrden,
      centrosPoblados,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const nuevosGrupos = [...grupos, nuevoGrupo];
    this.gruposAISDSubject.next(nuevosGrupos);
    this.guardarEnStorage(this.STORAGE_KEY_AISD, nuevosGrupos);

    // Logged: Grupo AISD creado: A.{nuevoOrden} - {nombre}
    return nuevoGrupo;
  }

  /**
   * Actualiza un grupo AISD existente
   */
  actualizarGrupoAISD(id: string, cambios: Partial<GrupoAISD>): void {
    const grupos = this.gruposAISDSubject.value;
    const index = grupos.findIndex(g => g.id === id);

    if (index !== -1) {
      grupos[index] = {
        ...grupos[index],
        ...cambios,
        updatedAt: new Date()
      };
      this.gruposAISDSubject.next([...grupos]);
      this.guardarEnStorage(this.STORAGE_KEY_AISD, grupos);
      // Logged: Grupo AISD actualizado: {grupos[index].nombre}
    }
  }

  /**
   * Elimina un grupo AISD y reordena los restantes
   */
  eliminarGrupoAISD(id: string): void {
    let grupos = this.gruposAISDSubject.value.filter(g => g.id !== id);
    
    // Reordenar
    grupos = grupos.map((g, index) => ({ ...g, orden: index + 1 }));
    
    this.gruposAISDSubject.next(grupos);
    this.guardarEnStorage(this.STORAGE_KEY_AISD, grupos);
    // Logged: Grupo AISD eliminado. Total grupos: {grupos.length}
  }

  /**
   * Obtiene todos los grupos AISD
   */
  getGruposAISD(): GrupoAISD[] {
    return this.gruposAISDSubject.value;
  }

  /**
   * Obtiene un grupo AISD por ID
   */
  getGrupoAISDPorId(id: string): GrupoAISD | undefined {
    return this.gruposAISDSubject.value.find(g => g.id === id);
  }

  // ==================== GESTIÓN DE GRUPOS AISI ====================

  /**
   * Crea un nuevo grupo AISI (Distrito)
   */
  crearGrupoAISI(nombre: string, centrosPoblados: CentroPoblado[] = []): GrupoAISI {
    const grupos = this.gruposAISISubject.value;
    const nuevoOrden = grupos.length + 1;

    const nuevoGrupo: GrupoAISI = {
      id: this.generarId(),
      nombre,
      tipo: 'AISI',
      orden: nuevoOrden,
      centrosPoblados,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const nuevosGrupos = [...grupos, nuevoGrupo];
    this.gruposAISISubject.next(nuevosGrupos);
    this.guardarEnStorage(this.STORAGE_KEY_AISI, nuevosGrupos);

    // Logged: Grupo AISI creado: B.{nuevoOrden} - {nombre}
    return nuevoGrupo;
  }

  /**
   * Actualiza un grupo AISI existente
   */
  actualizarGrupoAISI(id: string, cambios: Partial<GrupoAISI>): void {
    const grupos = this.gruposAISISubject.value;
    const index = grupos.findIndex(g => g.id === id);

    if (index !== -1) {
      grupos[index] = {
        ...grupos[index],
        ...cambios,
        updatedAt: new Date()
      };
      this.gruposAISISubject.next([...grupos]);
      this.guardarEnStorage(this.STORAGE_KEY_AISI, grupos);
      // Logged: Grupo AISI actualizado: {grupos[index].nombre}
    }
  }

  /**
   * Elimina un grupo AISI y reordena los restantes
   */
  eliminarGrupoAISI(id: string): void {
    let grupos = this.gruposAISISubject.value.filter(g => g.id !== id);
    
    // Reordenar
    grupos = grupos.map((g, index) => ({ ...g, orden: index + 1 }));
    
    this.gruposAISISubject.next(grupos);
    this.guardarEnStorage(this.STORAGE_KEY_AISI, grupos);
    // Logged: Grupo AISI eliminado. Total grupos: {grupos.length}
  }

  /**
   * Obtiene todos los grupos AISI
   */
  getGruposAISI(): GrupoAISI[] {
    return this.gruposAISISubject.value;
  }

  /**
   * Obtiene un grupo AISI por ID
   */
  getGrupoAISIPorId(id: string): GrupoAISI | undefined {
    return this.gruposAISISubject.value.find(g => g.id === id);
  }

  // ==================== GENERACIÓN DE CONTEXTO ====================

  /**
   * Genera contexto para una subsección AISD
   * @param grupoId ID del grupo AISD
   * @param numeroSeccion Número de sección (4-20)
   */
  generarContextoAISD(grupoId: string, numeroSeccion: number): ContextoGrupo | null {
    const grupo = this.getGrupoAISDPorId(grupoId);
    if (!grupo) return null;

    const configSeccion = SECCIONES_AISD.find((s: any) => s.numero === numeroSeccion);
    if (!configSeccion) return null;

    const seccionNumero = `A.${grupo.orden}.${configSeccion.subseccion}`;

    return {
      grupoTipo: 'AISD',
      grupoId: grupo.id,
      grupoNombre: grupo.nombre,
      grupoOrden: grupo.orden,
      seccionNumero,
      seccionTitulo: configSeccion.titulo,
      centrosPoblados: grupo.centrosPoblados
    };
  }

  /**
   * Genera contexto para una subsección AISI
   * @param grupoId ID del grupo AISI
   * @param numeroSeccion Número de sección (21-30)
   */
  generarContextoAISI(grupoId: string, numeroSeccion: number): ContextoGrupo | null {
    const grupo = this.getGrupoAISIPorId(grupoId);
    if (!grupo) return null;

    const configSeccion = SECCIONES_AISI.find((s: any) => s.numero === numeroSeccion);
    if (!configSeccion) return null;

    const seccionNumero = `B.${grupo.orden}.${configSeccion.subseccion}`;

    return {
      grupoTipo: 'AISI',
      grupoId: grupo.id,
      grupoNombre: grupo.nombre,
      grupoOrden: grupo.orden,
      seccionNumero,
      seccionTitulo: configSeccion.titulo,
      centrosPoblados: grupo.centrosPoblados
    };
  }

  /**
   * Genera todos los contextos para todas las subsecciones de un grupo AISD
   */
  generarTodosContextosAISD(grupoId: string): ContextoGrupo[] {
    return SECCIONES_AISD
      .map((s: any) => this.generarContextoAISD(grupoId, s.numero))
      .filter((c: any) => c !== null) as ContextoGrupo[];
  }

  /**
   * Genera todos los contextos para todas las subsecciones de un grupo AISI
   */
  generarTodosContextosAISI(grupoId: string): ContextoGrupo[] {
    return SECCIONES_AISI
      .map((s: any) => this.generarContextoAISI(grupoId, s.numero))
      .filter((c: any) => c !== null) as ContextoGrupo[];
  }

  // ==================== UTILIDADES ====================

  /**
   * Limpia todos los datos
   */
  limpiarTodo(): void {
    this.gruposAISDSubject.next([]);
    this.gruposAISISubject.next([]);
    this.centrosPobladosSubject.next([]);
    
    this.storage.removeItem(this.STORAGE_KEY_AISD);
    this.storage.removeItem(this.STORAGE_KEY_AISI);
    this.storage.removeItem(this.STORAGE_KEY_CCPP);
    
    // Logged: Todos los datos de grupos han sido eliminados
  }

  /**
   * Exporta configuración completa a JSON
   */
  exportarConfiguracion(): string {
    return JSON.stringify({
      centrosPoblados: this.centrosPobladosSubject.value,
      gruposAISD: this.gruposAISDSubject.value,
      gruposAISI: this.gruposAISISubject.value,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Importa configuración completa desde JSON
   */
  importarConfiguracion(jsonString: string): void {
    try {
      const config = JSON.parse(jsonString);
      
      if (config.centrosPoblados) {
        this.centrosPobladosSubject.next(config.centrosPoblados);
        this.guardarEnStorage(this.STORAGE_KEY_CCPP, config.centrosPoblados);
      }
      
      if (config.gruposAISD) {
        this.gruposAISDSubject.next(config.gruposAISD);
        this.guardarEnStorage(this.STORAGE_KEY_AISD, config.gruposAISD);
      }
      
      if (config.gruposAISI) {
        this.gruposAISISubject.next(config.gruposAISI);
        this.guardarEnStorage(this.STORAGE_KEY_AISI, config.gruposAISI);
      }
      
      // Logged: Configuración importada correctamente
    } catch (error) {
      console.error('❌ Error al importar configuración:', error);
      throw new Error('JSON de configuración inválido');
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private cargarDesdeStorage(): void {
    const aisd = this.leerDesdeStorage<GrupoAISD[]>(this.STORAGE_KEY_AISD, []);
    const aisi = this.leerDesdeStorage<GrupoAISI[]>(this.STORAGE_KEY_AISI, []);
    const ccpp = this.leerDesdeStorage<CentroPoblado[]>(this.STORAGE_KEY_CCPP, []);

    if (aisd.length > 0) this.gruposAISDSubject.next(aisd);
    if (aisi.length > 0) this.gruposAISISubject.next(aisi);
    if (ccpp.length > 0) this.centrosPobladosSubject.next(ccpp);
  }

  private guardarEnStorage(key: string, data: any): void {
    try {
      this.storage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  private leerDesdeStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = this.storage.getItem(key);
      return data ? (JSON.parse(data) as T) : defaultValue;
    } catch (error) {
      console.error('Error al leer desde localStorage:', error);
      return defaultValue;
    }
  }

  private generarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PeaService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    const baseUrl = this.configService.getApiUrl();
    this.apiUrl = `${baseUrl}/pea`;
  }

  /**
   * Obtiene datos PEA agregados para múltiples UBIGEOs
   * Usado para llenar las 3 tablas de Sección 23
   */
  obtenerPorCodigos(codigos_ubigeo: string[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/por-codigos`,
      { codigos_ubigeo }
    );
  }

  /**
   * Obtiene datos PEA para un UBIGEO específico
   */
  obtenerDetallePorUbigeo(ubigeo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detalle/${ubigeo}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class EducacionService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.getApiUrl();
  }

  /**
   * Obtiene niveles educativos para un CPP específico (Sección 28)
   */
  obtenerNivelesPorCpp(cpp: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/educacion/niveles?id_ubigeo=${cpp}`);
  }

  /**
   * Obtiene datos de nivel educativo alcanzado (Sección 30 - Cuadro 3.58)
   * @param cpp Código CPP del centro poblado
   */
  obtenerNivelEducativoPorCpp(cpp: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/educacion/nivel-educativo?id_ubigeo=${cpp}`);
  }
}

