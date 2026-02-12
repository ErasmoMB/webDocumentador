import { Observable } from 'rxjs';
import { SectionData, CalculatedSectionData, PETData, PEAData, PEAOcupadaData, Seccion2Data, ComunidadCampesina, DistritoAISI, GrupoConfig, Seccion23Data, Seccion3Data, Entrevistado, Seccion10Data, Seccion6Data, Seccion7Data, Seccion8Data, Seccion9Data, Seccion26Data, Seccion12Data, Seccion25Data, Seccion28Data, Seccion29Data, Seccion24Data, Seccion22Data, Seccion30Data } from './entities';
import { Injectable } from '@angular/core';

export abstract class ISectionDataService {
  abstract getSectionData(seccionId: string): Observable<SectionData>;
  abstract updateSectionData(seccionId: string, data: Partial<SectionData>): Observable<void>;
}

export abstract class ISeccion2DataService {
  abstract getSeccion2Data(): Observable<Seccion2Data>;
  abstract updateSeccion2Data(updates: Partial<Seccion2Data>): Observable<Seccion2Data>;
}

export abstract class IPercentageCalculatorService {
  abstract calculatePETPercentages(data: PETData[]): PETData[];
  abstract calculatePEAPercentages(data: PEAData[]): PEAData[];
  abstract calculatePEAOcupadaPercentages(data: PEAOcupadaData[]): PEAOcupadaData[];
}

export abstract class ISectionCalculatorService {
  constructor() {}
  abstract calculateSectionData(data: SectionData): CalculatedSectionData;
}

export abstract class ITextGeneratorService {
  abstract generatePETText(data: SectionData): string;
  abstract generatePEAText(data: SectionData): string;
  abstract generateEmploymentText(data: SectionData): string;
  abstract generateIncomeText(data: SectionData): string;
}

export abstract class ISeccion2TextGeneratorService {
  abstract generateComunidadesText(data: Seccion2Data): string;
  abstract generateDistritosText(data: Seccion2Data): string;
  abstract generateGroupConfigurationText(data: Seccion2Data): string;
}

export abstract class IPhotoService {
  abstract loadPhotos(seccionId: string, prefix: string): any[];
  abstract savePhotos(seccionId: string, prefix: string, photos: any[]): void;
}

export interface IValidationService {
  validateSectionData(data: SectionData): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export abstract class ISeccion23DataService {
  constructor() {}
  abstract getSeccion23Data(): Observable<Seccion23Data>;
  abstract updateSeccion23Data(updates: Partial<Seccion23Data>): Observable<Seccion23Data>;
  abstract loadPEAData(ubigeos: string[]): Observable<any>;
}

export abstract class ISeccion23TextGeneratorService {
  constructor() {}
  abstract generatePEAAText(data: Seccion23Data): string;
  abstract generatePETText(data: Seccion23Data): string;
  abstract generateEmploymentText(data: Seccion23Data): string;
  abstract generateIncomeText(data: Seccion23Data): string;
  abstract generateDistrictIndicatorsText(data: Seccion23Data): string;
}

export abstract class ISeccion3DataService {
  constructor() {}
  abstract getSeccion3Data(): Observable<Seccion3Data>;
  abstract updateSeccion3Data(updates: Partial<Seccion3Data>): Observable<Seccion3Data>;
}

export abstract class ISeccion3TextGeneratorService {
  constructor() {}
  abstract generateMetodologiaText(data: Seccion3Data): string;
  abstract generateFuentesPrimariasText(data: Seccion3Data): string;
  abstract generateFuentesSecundariasText(data: Seccion3Data): string;
  abstract generateEntrevistasText(data: Seccion3Data): string;
}

export abstract class ISeccion10DataService {
  constructor() {}
  abstract getSeccion10Data(): Observable<Seccion10Data>;
  abstract updateSeccion10Data(updates: Partial<Seccion10Data>): Observable<Seccion10Data>;
}

export abstract class ISeccion10TextGeneratorService {
  constructor() {}
  abstract generateServiciosBasicosIntroText(data: Seccion10Data): string;
  abstract generateAguaText(data: Seccion10Data): string;
  abstract generateSaneamientoText(data: Seccion10Data): string;
  abstract generateElectricidadText(data: Seccion10Data): string;
  abstract generateDesechosSolidosText(data: Seccion10Data): string;
  abstract generateEnergiaCocinarText(data: Seccion10Data): string;
}

export abstract class ISeccion6DataService {
  constructor() {}
  abstract getSeccion6Data(): Observable<Seccion6Data>;
  abstract updateSeccion6Data(updates: Partial<Seccion6Data>): Observable<Seccion6Data>;
}

export abstract class ISeccion6TextGeneratorService {
  constructor() {}
  abstract generatePoblacionSexoText(data: Seccion6Data): string;
  abstract generatePoblacionEtarioText(data: Seccion6Data): string;
}

export abstract class ISeccion7DataService {
  constructor() {}
  abstract getSeccion7Data(): Observable<Seccion7Data>;
  abstract updateSeccion7Data(updates: Partial<Seccion7Data>): Observable<Seccion7Data>;
}

export abstract class ISeccion7TextGeneratorService {
  constructor() {}
  abstract generatePETText(data: Seccion7Data): string;
  abstract generatePEAText(data: Seccion7Data): string;
  abstract generatePEAOcupadaText(data: Seccion7Data): string;
  abstract generateSituacionEmpleoText(data: Seccion7Data): string;
  abstract generateIngresosText(data: Seccion7Data): string;
}

export abstract class ISeccion8DataService {
  constructor() {}
  abstract getSeccion8Data(): Observable<Seccion8Data>;
  abstract updateSeccion8Data(updates: Partial<Seccion8Data>): Observable<Seccion8Data>;
}

export abstract class ISeccion8TextGeneratorService {
  constructor() {}
  abstract generateGanaderiaText(data: Seccion8Data): string;
  abstract generateAgriculturaText(data: Seccion8Data): string;
  abstract generateActividadesEconomicasText(data: Seccion8Data): string;
  abstract generateMercadoComercializacionText(data: Seccion8Data): string;
  abstract generateHabitosConsumoText(data: Seccion8Data): string;
}

export abstract class ISeccion9DataService {
  constructor() {}
  abstract getSeccion9Data(): Observable<Seccion9Data>;
  abstract updateSeccion9Data(updates: Partial<Seccion9Data>): Observable<Seccion9Data>;
}

export abstract class ISeccion9TextGeneratorService {
  constructor() {}
  abstract generateViviendasText(data: Seccion9Data): string;
  abstract generateEstructuraText(data: Seccion9Data): string;
}

export abstract class ISeccion26DataService {
  constructor() {}
  abstract getSeccion26Data(): Observable<Seccion26Data>;
  abstract updateSeccion26Data(updates: Partial<Seccion26Data>): Observable<Seccion26Data>;
}

export abstract class ISeccion26TextGeneratorService {
  constructor() {}
  abstract generateIntroServiciosBasicosText(data: Seccion26Data): string;
  abstract generateServiciosAguaText(data: Seccion26Data): string;
  abstract generateDesagueText(data: Seccion26Data): string;
  abstract generateDesechosSolidosText(data: Seccion26Data): string;
  abstract generateElectricidadText(data: Seccion26Data): string;
  abstract generateEnergiaCocinarText(data: Seccion26Data): string;
}

export abstract class ISeccion12DataService {
  constructor() {}
  abstract getSeccion12Data(): Observable<Seccion12Data>;
  abstract updateSeccion12Data(updates: Partial<Seccion12Data>): Observable<Seccion12Data>;
}

export abstract class ISeccion12TextGeneratorService {
  constructor() {}
  abstract generateSaludText(data: Seccion12Data): string;
  abstract generateEducacionText(data: Seccion12Data): string;
  abstract generateInfraestructuraEducacionText(data: Seccion12Data): string;
  abstract generateAlumnosPorSexoGradoText(data: Seccion12Data): string;
  abstract generateInfraestructuraRecreacionText(data: Seccion12Data): string;
  abstract generateInfraestructuraDeporteText(data: Seccion12Data): string;
}

export abstract class ISeccion22DataService {
  constructor() {}
  abstract getSeccion22Data(): Observable<Seccion22Data>;
  abstract updateSeccion22Data(updates: Partial<Seccion22Data>): Observable<Seccion22Data>;
}

export abstract class ISeccion22TextGeneratorService {
  constructor() {}
  abstract generateDemografiaText(data: Seccion22Data): string;
  abstract generateGrupoEtarioText(data: Seccion22Data): string;
}

export abstract class ISeccion25DataService {
  constructor() {}
  abstract getSeccion25Data(): Observable<Seccion25Data>;
  abstract updateSeccion25Data(updates: Partial<Seccion25Data>): Observable<Seccion25Data>;
}

export abstract class ISeccion25TextGeneratorService {
  constructor() {}
  abstract generateViviendaText(data: Seccion25Data): string;
  abstract generateOcupacionViviendaText(data: Seccion25Data): string;
  abstract generateEstructuraText(data: Seccion25Data): string;
}

export abstract class ISeccion28DataService {
  constructor() {}
  abstract getSeccion28Data(): Observable<Seccion28Data>;
  abstract updateSeccion28Data(updates: Partial<Seccion28Data>): Observable<Seccion28Data>;
}

export abstract class ISeccion28TextGeneratorService {
  constructor() {}
  abstract generateSaludText(data: Seccion28Data): string;
  abstract generateEducacionText(data: Seccion28Data): string;
  abstract generateRecreacionText(data: Seccion28Data): string;
  abstract generateDeporteText(data: Seccion28Data): string;
}

export abstract class ISeccion29DataService {
  constructor() {}
  abstract getSeccion29Data(): Observable<Seccion29Data>;
  abstract updateSeccion29Data(updates: Partial<Seccion29Data>): Observable<Seccion29Data>;
}

export abstract class ISeccion29TextGeneratorService {
  constructor() {}
  abstract generateNatalidadText(data: Seccion29Data): string;
  abstract generateMorbilidadText(data: Seccion29Data): string;
  abstract generateAfiliacionSaludText(data: Seccion29Data): string;
}

export abstract class ISeccion24DataService {
  constructor() {}
  abstract getSeccion24Data(): Observable<Seccion24Data>;
  abstract updateSeccion24Data(updates: Partial<Seccion24Data>): Observable<Seccion24Data>;
}

export abstract class ISeccion24TextGeneratorService {
  constructor() {}
  abstract generateActividadesEconomicasText(data: Seccion24Data): string;
  abstract generateMercadoText(data: Seccion24Data): string;
  abstract generateHabitosConsumoText(data: Seccion24Data): string;
}

export abstract class ISeccion30DataService {
  constructor() {}
  abstract getSeccion30Data(): Observable<Seccion30Data>;
  abstract updateSeccion30Data(updates: Partial<Seccion30Data>): Observable<Seccion30Data>;
}

export abstract class ISeccion30TextGeneratorService {
  constructor() {}
  abstract generateNivelEducativoText(data: Seccion30Data): string;
  abstract generateTasaAnalfabetismoText(data: Seccion30Data): string;
}
