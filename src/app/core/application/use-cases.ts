import { Injectable } from '@angular/core';
import { Observable, map, mergeMap } from 'rxjs';
import { ISectionDataService, ISectionCalculatorService, ITextGeneratorService, IPhotoService, ISeccion2DataService, ISeccion2TextGeneratorService, ISeccion23DataService, ISeccion23TextGeneratorService, ISeccion3DataService, ISeccion3TextGeneratorService, ISeccion10DataService, ISeccion10TextGeneratorService, ISeccion6DataService, ISeccion6TextGeneratorService, ISeccion7DataService, ISeccion7TextGeneratorService, ISeccion8DataService, ISeccion8TextGeneratorService, ISeccion9DataService, ISeccion9TextGeneratorService, ISeccion26DataService, ISeccion26TextGeneratorService, ISeccion12DataService, ISeccion12TextGeneratorService, ISeccion25DataService, ISeccion25TextGeneratorService, ISeccion28DataService, ISeccion28TextGeneratorService, ISeccion29DataService, ISeccion29TextGeneratorService, ISeccion24DataService, ISeccion24TextGeneratorService, ISeccion22DataService, ISeccion22TextGeneratorService, ISeccion30DataService, ISeccion30TextGeneratorService, ISeccion4DataService, ISeccion4TextGeneratorService, ISeccion5DataService, ISeccion5TextGeneratorService } from '../domain/interfaces';
import { SectionData, CalculatedSectionData, Seccion2Data, Seccion23Data, Seccion3Data, Seccion10Data, Seccion6Data, Seccion7Data, PETData, PEAData, PEAOcupadaData, Seccion8Data, Seccion9Data, Seccion26Data, Seccion12Data, Seccion25Data, Seccion28Data, Seccion29Data, Seccion24Data, Seccion22Data, Seccion30Data, NivelEducativoData, TasaAnalfabetismoData, Seccion4Data, TablaAISD1Row, TablaAISD2Row, Seccion5Data, Institucion } from '../domain/entities';
import { FotoItem } from '../../shared/components/image-upload/image-upload.component';

export interface SectionViewModel {
  data: SectionData;
  calculatedData: CalculatedSectionData;
  texts: {
    petText: string;
    peaText: string;
    employmentText: string;
    incomeText: string;
  };
  photos: any[];
}

@Injectable({
  providedIn: 'root'
})
export class LoadSectionUseCase {
  constructor(
    private sectionDataService: ISectionDataService,
    private calculatorService: ISectionCalculatorService,
    private textGenerator: ITextGeneratorService,
    private photoService: IPhotoService
  ) {}

  execute(seccionId: string): Observable<SectionViewModel> {
    return this.sectionDataService.getSectionData(seccionId).pipe(
      map(data => {
        const calculatedData = this.calculatorService.calculateSectionData(data);
        const photos = this.photoService.loadPhotos(seccionId, 'fotografiaPEA');

        return {
          data,
          calculatedData,
          texts: {
            petText: this.textGenerator.generatePETText(data),
            peaText: this.textGenerator.generatePEAText(data),
            employmentText: this.textGenerator.generateEmploymentText(data),
            incomeText: this.textGenerator.generateIncomeText(data)
          },
          photos
        };
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSectionDataUseCase {
  constructor(
    private sectionDataService: ISectionDataService,
    private calculatorService: ISectionCalculatorService
  ) {}

  execute(seccionId: string, updates: Partial<SectionData>): Observable<CalculatedSectionData> {
    return this.sectionDataService.updateSectionData(seccionId, updates).pipe(
      map(() => {
        // After update, get the current data and calculate
        return this.sectionDataService.getSectionData(seccionId).pipe(
          map(data => this.calculatorService.calculateSectionData(data))
        );
      }),
      // Flatten the nested observable
      mergeMap(obs => obs)
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class CalculateSectionDataUseCase {
  constructor(private calculatorService: ISectionCalculatorService) {}

  execute(data: SectionData): CalculatedSectionData {
    return this.calculatorService.calculateSectionData(data);
  }
}

export interface Seccion2ViewModel {
  data: Seccion2Data;
  texts: {
    comunidadesText: string;
    distritosText: string;
    groupConfigurationText: string;
  };
}

export interface Seccion23ViewModel {
  data: Seccion23Data;
  texts: {
    peaText: string;
    petText: string;
    employmentText: string;
    incomeText: string;
    districtIndicatorsText: string;
  };
}

export interface Seccion3ViewModel {
  data: Seccion3Data;
  texts: {
    metodologiaText: string;
    fuentesPrimariasText: string;
    fuentesSecundariasText: string;
    entrevistasText: string;
  };
}

export interface Seccion4ViewModel {
  data: Seccion4Data;
  texts: {
    introduccionText: string;
    comunidadText: string;
    caracterizacionText: string;
  };
  tables: {
    tablaAISD1: TablaAISD1Row[];
    tablaAISD2: TablaAISD2Row[];
  };
  calculations: {
    totalesAISD2: {
      poblacion: number;
      empadronadas: number;
      ocupadas: number;
    };
  };
  sources: {
    tablaAISD1Source: string;
    tablaAISD2Source: string;
  };
}

export interface Seccion5ViewModel {
  data: Seccion5Data;
  texts: {
    institucionalidadText: string;
  };
  tables: {
    institucionesTable: Institucion[];
  };
  calculations: {
    resumenInstituciones: {
      total: number;
      disponibles: number;
      noDisponibles: number;
    };
  };
  photos: FotoItem[];
  sources: {
    institucionesSource: string;
  };
}

export interface Seccion10ViewModel {
  data: Seccion10Data;
  texts: {
    serviciosBasicosIntroText: string;
    aguaText: string;
    saneamientoText: string;
    electricidadText: string;
    desechosSolidosText: string;
    energiaCocinarText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion23UseCase {
  constructor(
    private dataService: ISeccion23DataService,
    private textGenerator: ISeccion23TextGeneratorService
  ) {}

  execute(): Observable<Seccion23ViewModel> {
    return this.dataService.getSeccion23Data().pipe(
      map(data => ({
        data,
        texts: {
          peaText: this.textGenerator.generatePEAAText(data),
          petText: this.textGenerator.generatePETText(data),
          employmentText: this.textGenerator.generateEmploymentText(data),
          incomeText: this.textGenerator.generateIncomeText(data),
          districtIndicatorsText: this.textGenerator.generateDistrictIndicatorsText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion23DataUseCase {
  constructor(
    private dataService: ISeccion23DataService,
    private textGenerator: ISeccion23TextGeneratorService
  ) {}

  execute(updates: Partial<Seccion23Data>): Observable<Seccion23ViewModel> {
    return this.dataService.updateSeccion23Data(updates).pipe(
      map(data => ({
        data,
        texts: {
          peaText: this.textGenerator.generatePEAAText(data),
          petText: this.textGenerator.generatePETText(data),
          employmentText: this.textGenerator.generateEmploymentText(data),
          incomeText: this.textGenerator.generateIncomeText(data),
          districtIndicatorsText: this.textGenerator.generateDistrictIndicatorsText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion2UseCase {
  constructor(
    private seccion2DataService: ISeccion2DataService,
    private seccion2TextGenerator: ISeccion2TextGeneratorService
  ) {}

  execute(): Observable<Seccion2ViewModel> {
    return this.seccion2DataService.getSeccion2Data().pipe(
      map(data => ({
        data,
        texts: {
          comunidadesText: this.seccion2TextGenerator.generateComunidadesText(data),
          distritosText: this.seccion2TextGenerator.generateDistritosText(data),
          groupConfigurationText: this.seccion2TextGenerator.generateGroupConfigurationText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion2DataUseCase {
  constructor(private seccion2DataService: ISeccion2DataService) {}

  execute(updates: Partial<Seccion2Data>): Observable<Seccion2Data> {
    return this.seccion2DataService.updateSeccion2Data(updates);
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion3UseCase {
  constructor(
    private seccion3DataService: ISeccion3DataService,
    private seccion3TextGenerator: ISeccion3TextGeneratorService
  ) {}

  execute(): Observable<Seccion3ViewModel> {
    return this.seccion3DataService.getSeccion3Data().pipe(
      map(data => ({
        data,
        texts: {
          metodologiaText: this.seccion3TextGenerator.generateMetodologiaText(data),
          fuentesPrimariasText: this.seccion3TextGenerator.generateFuentesPrimariasText(data),
          fuentesSecundariasText: this.seccion3TextGenerator.generateFuentesSecundariasText(data),
          entrevistasText: this.seccion3TextGenerator.generateEntrevistasText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion3DataUseCase {
  constructor(private seccion3DataService: ISeccion3DataService) {}

  execute(updates: Partial<Seccion3Data>): Observable<Seccion3Data> {
    return this.seccion3DataService.updateSeccion3Data(updates);
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion4UseCase {
  constructor(
    private seccion4DataService: ISeccion4DataService
  ) {}

  execute(): Observable<Seccion4ViewModel> {
    return this.seccion4DataService.getSeccion4Data().pipe(
      map(data => {
        return {
          data,
          texts: {
            introduccionText: '',
            comunidadText: '',
            caracterizacionText: ''
          },
          tables: {
            tablaAISD1: data['tablaAISD1Datos'] || [],
            tablaAISD2: data['tablaAISD2Datos'] || []
          },
          calculations: {
            totalesAISD2: {
              poblacion: data['tablaAISD2Datos']?.reduce((sum: number, row: TablaAISD2Row) => sum + (parseInt(row.poblacion) || 0), 0) || 0,
              empadronadas: 0, // No existe en TablaAISD2Row
              ocupadas: 0 // No existe en TablaAISD2Row
            }
          },
          sources: {
            tablaAISD1Source: data['cuadroFuenteAISD1'] || '',
            tablaAISD2Source: data['cuadroFuenteAISD1'] || '' // Usando la misma fuente por ahora
          }
        };
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion4DataUseCase {
  constructor(private seccion4DataService: ISeccion4DataService) {}

  execute(updates: Partial<Seccion4Data>): Observable<Seccion4Data> {
    return this.seccion4DataService.updateSeccion4Data(updates);
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion10UseCase {
  constructor(
    private seccion10DataService: ISeccion10DataService,
    private seccion10TextGenerator: ISeccion10TextGeneratorService
  ) {}

  execute(): Observable<Seccion10ViewModel> {
    return this.seccion10DataService.getSeccion10Data().pipe(
      map(data => ({
        data,
        texts: {
          serviciosBasicosIntroText: this.seccion10TextGenerator.generateServiciosBasicosIntroText(data),
          aguaText: this.seccion10TextGenerator.generateAguaText(data),
          saneamientoText: this.seccion10TextGenerator.generateSaneamientoText(data),
          electricidadText: this.seccion10TextGenerator.generateElectricidadText(data),
          desechosSolidosText: this.seccion10TextGenerator.generateDesechosSolidosText(data),
          energiaCocinarText: this.seccion10TextGenerator.generateEnergiaCocinarText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion10DataUseCase {
  constructor(
    private seccion10DataService: ISeccion10DataService,
    private seccion10TextGenerator: ISeccion10TextGeneratorService
  ) {}

  execute(updates: Seccion10Data): Observable<Seccion10ViewModel> {
    return this.seccion10DataService.updateSeccion10Data(updates).pipe(
      map(data => ({
        data,
        texts: {
          serviciosBasicosIntroText: this.seccion10TextGenerator.generateServiciosBasicosIntroText(data),
          aguaText: this.seccion10TextGenerator.generateAguaText(data),
          saneamientoText: this.seccion10TextGenerator.generateSaneamientoText(data),
          electricidadText: this.seccion10TextGenerator.generateElectricidadText(data),
          desechosSolidosText: this.seccion10TextGenerator.generateDesechosSolidosText(data),
          energiaCocinarText: this.seccion10TextGenerator.generateEnergiaCocinarText(data)
        }
      }))
    );
  }
}

export interface Seccion6ViewModel {
  data: Seccion6Data;
  texts: {
    poblacionSexoText: string;
    poblacionEtarioText: string;
  };
  titles: {
    poblacionSexoTitle: string;
    poblacionEtarioTitle: string;
  };
  tables: {
    poblacionSexoData: any[];
    poblacionEtarioData: any[];
  };
  calculations: {
    totalPoblacionSexo: number;
    porcentajeTotalPoblacionSexo: string;
    totalPoblacionEtario: number;
    porcentajeTotalPoblacionEtario: string;
  };
  sources: {
    poblacionSexoSource: string;
    poblacionEtarioSource: string;
  };
}

export interface Seccion7ViewModel {
  data: Seccion7Data;
  texts: {
    petText: string;
    peaText: string;
    peaOcupadaText: string;
    situacionEmpleoText: string;
    ingresosText: string;
  };
  titles: {
    petTitle: string;
    peaTitle: string;
    peaOcupadaTitle: string;
  };
  tables: {
    petData: PETData[];
    peaData: PEAData[];
    peaOcupadaData: PEAOcupadaData[];
  };
  calculations: {
    totalPET: string;
    totalPEA: string;
    totalPEAHombres: string;
    totalPEAMujeres: string;
    totalPEAOcupada: string;
    totalPEAOcupadaHombres: string;
    totalPEAOcupadaMujeres: string;
  };
  sources: {
    petSource: string;
    peaSource: string;
    peaOcupadaSource: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion6UseCase {
  constructor(
    private seccion6DataService: ISeccion6DataService,
    private seccion6TextGenerator: ISeccion6TextGeneratorService
  ) {}

  execute(): Observable<Seccion6ViewModel> {
    return this.seccion6DataService.getSeccion6Data().pipe(
      map(data => ({
        data,
        texts: {
          poblacionSexoText: this.seccion6TextGenerator.generatePoblacionSexoText(data),
          poblacionEtarioText: this.seccion6TextGenerator.generatePoblacionEtarioText(data)
        },
        titles: {
          poblacionSexoTitle: `Población por sexo – CC ${data.grupoAISD || '____'} (2017)`,
          poblacionEtarioTitle: `Población por grandes grupos de edad – CC ${data.grupoAISD || '____'} (2017)`
        },
        tables: {
          poblacionSexoData: data['poblacionSexo'] || [],
          poblacionEtarioData: data['poblacionEtario'] || []
        },
        calculations: {
          totalPoblacionSexo: this.calculateTotalPoblacionSexo(data),
          porcentajeTotalPoblacionSexo: this.calculatePorcentajeTotalPoblacionSexo(data),
          totalPoblacionEtario: this.calculateTotalPoblacionEtario(data),
          porcentajeTotalPoblacionEtario: this.calculatePorcentajeTotalPoblacionEtario(data)
        },
        sources: {
          poblacionSexoSource: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',
          poblacionEtarioSource: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)'
        }
      }))
    );
  }

  private calculateTotalPoblacionSexo(data: Seccion6Data): number {
    return data['poblacionSexo']?.reduce((total: number, item: any) => total + (item.casos || 0), 0) || 0;
  }

  private calculatePorcentajeTotalPoblacionSexo(data: Seccion6Data): string {
    const total = this.calculateTotalPoblacionSexo(data);
    return total > 0 ? '100,00 %' : '0,00 %';
  }

  private calculateTotalPoblacionEtario(data: Seccion6Data): number {
    return data['poblacionEtario']?.reduce((total: number, item: any) => total + (item.casos || 0), 0) || 0;
  }

  private calculatePorcentajeTotalPoblacionEtario(data: Seccion6Data): string {
    const total = this.calculateTotalPoblacionEtario(data);
    return total > 0 ? '100,00 %' : '0,00 %';
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion6DataUseCase {
  constructor(
    private seccion6DataService: ISeccion6DataService,
    private seccion6TextGenerator: ISeccion6TextGeneratorService
  ) {}

  execute(updates: Partial<Seccion6Data>): Observable<Seccion6ViewModel> {
    return this.seccion6DataService.updateSeccion6Data(updates).pipe(
      map(data => ({
        data,
        texts: {
          poblacionSexoText: this.seccion6TextGenerator.generatePoblacionSexoText(data),
          poblacionEtarioText: this.seccion6TextGenerator.generatePoblacionEtarioText(data)
        },
        titles: {
          poblacionSexoTitle: `Población por sexo – CC ${data.grupoAISD || '____'} (2017)`,
          poblacionEtarioTitle: `Población por grandes grupos de edad – CC ${data.grupoAISD || '____'} (2017)`
        },
        tables: {
          poblacionSexoData: data['poblacionSexo'] || [],
          poblacionEtarioData: data['poblacionEtario'] || []
        },
        calculations: {
          totalPoblacionSexo: this.calculateTotalPoblacionSexo(data),
          porcentajeTotalPoblacionSexo: this.calculatePorcentajeTotalPoblacionSexo(data),
          totalPoblacionEtario: this.calculateTotalPoblacionEtario(data),
          porcentajeTotalPoblacionEtario: this.calculatePorcentajeTotalPoblacionEtario(data)
        },
        sources: {
          poblacionSexoSource: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',
          poblacionEtarioSource: 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)'
        }
      }))
    );
  }

  private calculateTotalPoblacionSexo(data: Seccion6Data): number {
    return data['poblacionSexo']?.reduce((total: number, item: any) => total + (item.casos || 0), 0) || 0;
  }

  private calculatePorcentajeTotalPoblacionSexo(data: Seccion6Data): string {
    const total = this.calculateTotalPoblacionSexo(data);
    return total > 0 ? '100,00 %' : '0,00 %';
  }

  private calculateTotalPoblacionEtario(data: Seccion6Data): number {
    return data['poblacionEtario']?.reduce((total: number, item: any) => total + (item.casos || 0), 0) || 0;
  }

  private calculatePorcentajeTotalPoblacionEtario(data: Seccion6Data): string {
    const total = this.calculateTotalPoblacionEtario(data);
    return total > 0 ? '100,00 %' : '0,00 %';
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion7UseCase {
  constructor(
    private seccion7DataService: ISeccion7DataService,
    private seccion7TextGenerator: ISeccion7TextGeneratorService
  ) {}

  execute(): Observable<Seccion7ViewModel> {
    return this.seccion7DataService.getSeccion7Data().pipe(
      map(data => ({
        data,
        texts: {
          petText: this.seccion7TextGenerator.generatePETText(data),
          peaText: this.seccion7TextGenerator.generatePEAText(data),
          peaOcupadaText: this.seccion7TextGenerator.generatePEAOcupadaText(data),
          situacionEmpleoText: this.seccion7TextGenerator.generateSituacionEmpleoText(data),
          ingresosText: this.seccion7TextGenerator.generateIngresosText(data)
        },
        titles: {
          petTitle: `Población en Edad de Trabajar – ${data.grupoAISD || '____'} (2017)`,
          peaTitle: `Población Económicamente Activa – ${data.grupoAISD || '____'} (2017)`,
          peaOcupadaTitle: `PEA Ocupada – ${data.grupoAISD || '____'} (2017)`
        },
        tables: {
          petData: data.petTabla || [],
          peaData: data.peaTabla || [],
          peaOcupadaData: data.peaOcupadaTabla || []
        },
        calculations: {
          totalPET: this.calculateTotalPET(data),
          totalPEA: this.calculateTotalPEA(data),
          totalPEAHombres: this.calculateTotalPEAHombres(data),
          totalPEAMujeres: this.calculateTotalPEAMujeres(data),
          totalPEAOcupada: this.calculateTotalPEAOcupada(data),
          totalPEAOcupadaHombres: this.calculateTotalPEAOcupadaHombres(data),
          totalPEAOcupadaMujeres: this.calculateTotalPEAOcupadaMujeres(data)
        },
        sources: {
          petSource: data.cuadroFuentePET || 'INEI - Censo Nacional 2017',
          peaSource: data.cuadroFuentePEA || 'INEI - Censo Nacional 2017',
          peaOcupadaSource: data.cuadroFuentePEAOcupada || 'INEI - Censo Nacional 2017'
        }
      }))
    );
  }

  private calculateTotalPET(data: Seccion7Data): string {
    return data.petTabla?.reduce((total, item) => total + (item.casos || 0), 0).toString() || '0';
  }

  private calculateTotalPEA(data: Seccion7Data): string {
    return data.peaTabla?.reduce((total, item) => total + (item.casos || 0), 0).toString() || '0';
  }

  private calculateTotalPEAHombres(data: Seccion7Data): string {
    return data.peaTabla?.reduce((total, item) => total + (item.hombres || 0), 0).toString() || '0';
  }

  private calculateTotalPEAMujeres(data: Seccion7Data): string {
    return data.peaTabla?.reduce((total, item) => total + (item.mujeres || 0), 0).toString() || '0';
  }

  private calculateTotalPEAOcupada(data: Seccion7Data): string {
    return data.peaOcupadaTabla?.reduce((total, item) => total + (item.casos || 0), 0).toString() || '0';
  }

  private calculateTotalPEAOcupadaHombres(data: Seccion7Data): string {
    return data.peaOcupadaTabla?.reduce((total, item) => total + (item.hombres || 0), 0).toString() || '0';
  }

  private calculateTotalPEAOcupadaMujeres(data: Seccion7Data): string {
    return data.peaOcupadaTabla?.reduce((total, item) => total + (item.mujeres || 0), 0).toString() || '0';
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion7DataUseCase {
  constructor(
    private seccion7DataService: ISeccion7DataService,
    private seccion7TextGenerator: ISeccion7TextGeneratorService
  ) {}

  execute(updates: Partial<Seccion7Data>): Observable<Seccion7ViewModel> {
    return this.seccion7DataService.updateSeccion7Data(updates).pipe(
      map(data => ({
        data,
        texts: {
          petText: this.seccion7TextGenerator.generatePETText(data),
          peaText: this.seccion7TextGenerator.generatePEAText(data),
          peaOcupadaText: this.seccion7TextGenerator.generatePEAOcupadaText(data),
          situacionEmpleoText: this.seccion7TextGenerator.generateSituacionEmpleoText(data),
          ingresosText: this.seccion7TextGenerator.generateIngresosText(data)
        },
        titles: {
          petTitle: `Población en Edad de Trabajar – ${data.grupoAISD || '____'} (2017)`,
          peaTitle: `Población Económicamente Activa – ${data.grupoAISD || '____'} (2017)`,
          peaOcupadaTitle: `PEA Ocupada – ${data.grupoAISD || '____'} (2017)`
        },
        tables: {
          petData: data.petTabla || [],
          peaData: data.peaTabla || [],
          peaOcupadaData: data.peaOcupadaTabla || []
        },
        calculations: {
          totalPET: this.calculateTotalPET(data),
          totalPEA: this.calculateTotalPEA(data),
          totalPEAHombres: this.calculateTotalPEAHombres(data),
          totalPEAMujeres: this.calculateTotalPEAMujeres(data),
          totalPEAOcupada: this.calculateTotalPEAOcupada(data),
          totalPEAOcupadaHombres: this.calculateTotalPEAOcupadaHombres(data),
          totalPEAOcupadaMujeres: this.calculateTotalPEAOcupadaMujeres(data)
        },
        sources: {
          petSource: data.cuadroFuentePET || 'INEI - Censo Nacional 2017',
          peaSource: data.cuadroFuentePEA || 'INEI - Censo Nacional 2017',
          peaOcupadaSource: data.cuadroFuentePEAOcupada || 'INEI - Censo Nacional 2017'
        }
      }))
    );
  }

  private calculateTotalPET(data: Seccion7Data): string {
    return data.petTabla?.reduce((total, item) => total + (item.casos || 0), 0).toString() || '0';
  }

  private calculateTotalPEA(data: Seccion7Data): string {
    return data.peaTabla?.reduce((total, item) => total + (item.casos || 0), 0).toString() || '0';
  }

  private calculateTotalPEAHombres(data: Seccion7Data): string {
    return data.peaTabla?.reduce((total, item) => total + (item.hombres || 0), 0).toString() || '0';
  }

  private calculateTotalPEAMujeres(data: Seccion7Data): string {
    return data.peaTabla?.reduce((total, item) => total + (item.mujeres || 0), 0).toString() || '0';
  }

  private calculateTotalPEAOcupada(data: Seccion7Data): string {
    return data.peaOcupadaTabla?.reduce((total, item) => total + (item.casos || 0), 0).toString() || '0';
  }

  private calculateTotalPEAOcupadaHombres(data: Seccion7Data): string {
    return data.peaOcupadaTabla?.reduce((total, item) => total + (item.hombres || 0), 0).toString() || '0';
  }

  private calculateTotalPEAOcupadaMujeres(data: Seccion7Data): string {
    return data.peaOcupadaTabla?.reduce((total, item) => total + (item.mujeres || 0), 0).toString() || '0';
  }
}

export interface Seccion8ViewModel {
  data: Seccion8Data;
  texts: {
    ganaderiaText: string;
    agriculturaText: string;
    actividadesEconomicasText: string;
    mercadoComercializacionText: string;
    habitosConsumoText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion8UseCase {
  constructor(
    private seccion8DataService: ISeccion8DataService,
    private seccion8TextGenerator: ISeccion8TextGeneratorService
  ) {}

  execute(): Observable<Seccion8ViewModel> {
    return this.seccion8DataService.getSeccion8Data().pipe(
      map(data => ({
        data,
        texts: {
          ganaderiaText: this.seccion8TextGenerator.generateGanaderiaText(data),
          agriculturaText: this.seccion8TextGenerator.generateAgriculturaText(data),
          actividadesEconomicasText: this.seccion8TextGenerator.generateActividadesEconomicasText(data),
          mercadoComercializacionText: this.seccion8TextGenerator.generateMercadoComercializacionText(data),
          habitosConsumoText: this.seccion8TextGenerator.generateHabitosConsumoText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion8DataUseCase {
  constructor(
    private seccion8DataService: ISeccion8DataService,
    private seccion8TextGenerator: ISeccion8TextGeneratorService
  ) {}

  execute(updates: Seccion8Data): Observable<Seccion8ViewModel> {
    return this.seccion8DataService.updateSeccion8Data(updates).pipe(
      map(data => ({
        data,
        texts: {
          ganaderiaText: this.seccion8TextGenerator.generateGanaderiaText(data),
          agriculturaText: this.seccion8TextGenerator.generateAgriculturaText(data),
          actividadesEconomicasText: this.seccion8TextGenerator.generateActividadesEconomicasText(data),
          mercadoComercializacionText: this.seccion8TextGenerator.generateMercadoComercializacionText(data),
          habitosConsumoText: this.seccion8TextGenerator.generateHabitosConsumoText(data)
        }
      }))
    );
  }
}

export interface Seccion9ViewModel {
  data: Seccion9Data;
  texts: {
    viviendasText: string;
    estructuraText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion9UseCase {
  constructor(
    private seccion9DataService: ISeccion9DataService,
    private seccion9TextGenerator: ISeccion9TextGeneratorService
  ) {}

  execute(): Observable<Seccion9ViewModel> {
    return this.seccion9DataService.getSeccion9Data().pipe(
      map(data => ({
        data,
        texts: {
          viviendasText: this.seccion9TextGenerator.generateViviendasText(data),
          estructuraText: this.seccion9TextGenerator.generateEstructuraText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion9DataUseCase {
  constructor(
    private seccion9DataService: ISeccion9DataService,
    private seccion9TextGenerator: ISeccion9TextGeneratorService
  ) {}

  execute(updates: Seccion9Data): Observable<Seccion9ViewModel> {
    return this.seccion9DataService.updateSeccion9Data(updates).pipe(
      map(data => ({
        data,
        texts: {
          viviendasText: this.seccion9TextGenerator.generateViviendasText(data),
          estructuraText: this.seccion9TextGenerator.generateEstructuraText(data)
        }
      }))
    );
  }
}

export interface Seccion26ViewModel {
  data: Seccion26Data;
  texts: {
    introServiciosBasicosText: string;
    serviciosAguaText: string;
    desagueText: string;
    desechosSolidosText: string;
    electricidadText: string;
    energiaCocinarText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion26UseCase {
  constructor(
    private seccion26DataService: ISeccion26DataService,
    private seccion26TextGenerator: ISeccion26TextGeneratorService
  ) {}

  execute(): Observable<Seccion26ViewModel> {
    return this.seccion26DataService.getSeccion26Data().pipe(
      map(data => ({
        data,
        texts: {
          introServiciosBasicosText: this.seccion26TextGenerator.generateIntroServiciosBasicosText(data),
          serviciosAguaText: this.seccion26TextGenerator.generateServiciosAguaText(data),
          desagueText: this.seccion26TextGenerator.generateDesagueText(data),
          desechosSolidosText: this.seccion26TextGenerator.generateDesechosSolidosText(data),
          electricidadText: this.seccion26TextGenerator.generateElectricidadText(data),
          energiaCocinarText: this.seccion26TextGenerator.generateEnergiaCocinarText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion26DataUseCase {
  constructor(
    private seccion26DataService: ISeccion26DataService,
    private seccion26TextGenerator: ISeccion26TextGeneratorService
  ) {}

  execute(updates: Seccion26Data): Observable<Seccion26ViewModel> {
    return this.seccion26DataService.updateSeccion26Data(updates).pipe(
      map(data => ({
        data,
        texts: {
          introServiciosBasicosText: this.seccion26TextGenerator.generateIntroServiciosBasicosText(data),
          serviciosAguaText: this.seccion26TextGenerator.generateServiciosAguaText(data),
          desagueText: this.seccion26TextGenerator.generateDesagueText(data),
          desechosSolidosText: this.seccion26TextGenerator.generateDesechosSolidosText(data),
          electricidadText: this.seccion26TextGenerator.generateElectricidadText(data),
          energiaCocinarText: this.seccion26TextGenerator.generateEnergiaCocinarText(data)
        }
      }))
    );
  }
}

export interface Seccion12ViewModel {
  data: Seccion12Data;
  texts: {
    saludText: string;
    educacionText: string;
    infraestructuraEducacionText: string;
    alumnosPorSexoGradoText: string;
    infraestructuraRecreacionText: string;
    infraestructuraDeporteText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion12UseCase {
  constructor(
    private seccion12DataService: ISeccion12DataService,
    private seccion12TextGenerator: ISeccion12TextGeneratorService
  ) {}

  execute(): Observable<Seccion12ViewModel> {
    return this.seccion12DataService.getSeccion12Data().pipe(
      map(data => ({
        data,
        texts: {
          saludText: this.seccion12TextGenerator.generateSaludText(data),
          educacionText: this.seccion12TextGenerator.generateEducacionText(data),
          infraestructuraEducacionText: this.seccion12TextGenerator.generateInfraestructuraEducacionText(data),
          alumnosPorSexoGradoText: this.seccion12TextGenerator.generateAlumnosPorSexoGradoText(data),
          infraestructuraRecreacionText: this.seccion12TextGenerator.generateInfraestructuraRecreacionText(data),
          infraestructuraDeporteText: this.seccion12TextGenerator.generateInfraestructuraDeporteText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion12DataUseCase {
  constructor(
    private seccion12DataService: ISeccion12DataService,
    private seccion12TextGenerator: ISeccion12TextGeneratorService
  ) {}

  execute(updates: Seccion12Data): Observable<Seccion12ViewModel> {
    return this.seccion12DataService.updateSeccion12Data(updates).pipe(
      map(data => ({
        data,
        texts: {
          saludText: this.seccion12TextGenerator.generateSaludText(data),
          educacionText: this.seccion12TextGenerator.generateEducacionText(data),
          infraestructuraEducacionText: this.seccion12TextGenerator.generateInfraestructuraEducacionText(data),
          alumnosPorSexoGradoText: this.seccion12TextGenerator.generateAlumnosPorSexoGradoText(data),
          infraestructuraRecreacionText: this.seccion12TextGenerator.generateInfraestructuraRecreacionText(data),
          infraestructuraDeporteText: this.seccion12TextGenerator.generateInfraestructuraDeporteText(data)
        }
      }))
    );
  }
}

export interface Seccion25ViewModel {
  data: Seccion25Data;
  texts: {
    viviendaText: string;
    ocupacionViviendaText: string;
    estructuraText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion25UseCase {
  constructor(
    private seccion25DataService: ISeccion25DataService,
    private seccion25TextGenerator: ISeccion25TextGeneratorService
  ) {}

  execute(): Observable<Seccion25ViewModel> {
    return this.seccion25DataService.getSeccion25Data().pipe(
      map(data => ({
        data,
        texts: {
          viviendaText: this.seccion25TextGenerator.generateViviendaText(data),
          ocupacionViviendaText: this.seccion25TextGenerator.generateOcupacionViviendaText(data),
          estructuraText: this.seccion25TextGenerator.generateEstructuraText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion25DataUseCase {
  constructor(
    private seccion25DataService: ISeccion25DataService,
    private seccion25TextGenerator: ISeccion25TextGeneratorService
  ) {}

  execute(updates: Seccion25Data): Observable<Seccion25ViewModel> {
    return this.seccion25DataService.updateSeccion25Data(updates).pipe(
      map(data => ({
        data,
        texts: {
          viviendaText: this.seccion25TextGenerator.generateViviendaText(data),
          ocupacionViviendaText: this.seccion25TextGenerator.generateOcupacionViviendaText(data),
          estructuraText: this.seccion25TextGenerator.generateEstructuraText(data)
        }
      }))
    );
  }
}

export interface Seccion28ViewModel {
  data: Seccion28Data;
  texts: {
    saludText: string;
    educacionText: string;
    recreacionText: string;
    deporteText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion28UseCase {
  constructor(
    private seccion28DataService: ISeccion28DataService,
    private seccion28TextGenerator: ISeccion28TextGeneratorService
  ) {}

  execute(): Observable<Seccion28ViewModel> {
    return this.seccion28DataService.getSeccion28Data().pipe(
      map(data => ({
        data,
        texts: {
          saludText: this.seccion28TextGenerator.generateSaludText(data),
          educacionText: this.seccion28TextGenerator.generateEducacionText(data),
          recreacionText: this.seccion28TextGenerator.generateRecreacionText(data),
          deporteText: this.seccion28TextGenerator.generateDeporteText(data)
        }
      }))
    );
  }
}
export interface Seccion22ViewModel {
  data: Seccion22Data;
  texts: {
    demografiaText: string;
    grupoEtarioText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion22UseCase {
  constructor(
    private seccion22DataService: ISeccion22DataService,
    private seccion22TextGenerator: ISeccion22TextGeneratorService
  ) {}

  execute(): Observable<Seccion22ViewModel> {
    return this.seccion22DataService.getSeccion22Data().pipe(
      map(data => ({
        data,
        texts: {
          demografiaText: this.seccion22TextGenerator.generateDemografiaText(data),
          grupoEtarioText: this.seccion22TextGenerator.generateGrupoEtarioText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion22DataUseCase {
  constructor(
    private seccion22DataService: ISeccion22DataService,
    private seccion22TextGenerator: ISeccion22TextGeneratorService
  ) {}

  execute(updates: Partial<Seccion22Data>): Observable<Seccion22ViewModel> {
    return this.seccion22DataService.updateSeccion22Data(updates).pipe(
      map(updatedData => ({
        data: updatedData,
        texts: {
          demografiaText: this.seccion22TextGenerator.generateDemografiaText(updatedData),
          grupoEtarioText: this.seccion22TextGenerator.generateGrupoEtarioText(updatedData)
        }
      }))
    );
  }
}

export interface Seccion30ViewModel {
  data: Seccion30Data;
  texts: {
    nivelEducativoText: string;
    tasaAnalfabetismoText: string;
  };
  parrafoSeccion30_indicadores_educacion_intro: string;
  nivelMayoritario?: {
    categoria: string;
    porcentaje: string;
  };
  nivelSegundo?: {
    categoria: string;
    porcentaje: string;
  };
  nivelMinoritario?: {
    categoria: string;
    porcentaje: string;
  };
  nivelEducativoAISIConPorcentajes: NivelEducativoData[];
  tasaAnalfabetismoAISIConPorcentajes: TasaAnalfabetismoData[];
  fotografiasVista: FotoItem[];
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion30UseCase {
  constructor(
    private seccion30DataService: ISeccion30DataService,
    private seccion30TextGenerator: ISeccion30TextGeneratorService
  ) {}

  execute(): Observable<Seccion30ViewModel> {
    return this.seccion30DataService.getSeccion30Data().pipe(
      map(data => ({
        data,
        texts: {
          nivelEducativoText: this.seccion30TextGenerator.generateNivelEducativoText(data),
          tasaAnalfabetismoText: this.seccion30TextGenerator.generateTasaAnalfabetismoText(data)
        },
        parrafoSeccion30_indicadores_educacion_intro: data.parrafoSeccion30_indicadores_educacion_intro || '',
        nivelMayoritario: this.calculateNivelMayoritario(data.nivelEducativoTabla),
        nivelSegundo: this.calculateNivelSegundo(data.nivelEducativoTabla),
        nivelMinoritario: this.calculateNivelMinoritario(data.nivelEducativoTabla),
        nivelEducativoAISIConPorcentajes: this.calculateNivelEducativoWithPercentages(data.nivelEducativoTabla),
        tasaAnalfabetismoAISIConPorcentajes: this.calculateTasaAnalfabetismoWithPercentages(data.tasaAnalfabetismoTabla),
        fotografiasVista: (data.fotografiasCahuachoB19 || []) as FotoItem[]
      }))
    );
  }

  private calculateNivelMayoritario(nivelEducativoTabla: NivelEducativoData[]): { categoria: string; porcentaje: string } | undefined {
    if (!nivelEducativoTabla || nivelEducativoTabla.length === 0) return undefined;

    const total = nivelEducativoTabla.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return undefined;

    let maxPercentage = 0;
    let categoriaMayor = '';

    nivelEducativoTabla.forEach(item => {
      const percentage = (item.total / total) * 100;
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
        categoriaMayor = item.nivel;
      }
    });

    return {
      categoria: categoriaMayor,
      porcentaje: maxPercentage.toFixed(1) + '%'
    };
  }

  private calculateNivelSegundo(nivelEducativoTabla: NivelEducativoData[]): { categoria: string; porcentaje: string } | undefined {
    if (!nivelEducativoTabla || nivelEducativoTabla.length < 2) return undefined;

    const total = nivelEducativoTabla.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return undefined;

    const percentages = nivelEducativoTabla.map(item => ({
      categoria: item.nivel,
      percentage: (item.total / total) * 100
    })).sort((a, b) => b.percentage - a.percentage);

    if (percentages.length < 2) return undefined;

    return {
      categoria: percentages[1].categoria,
      porcentaje: percentages[1].percentage.toFixed(1) + '%'
    };
  }

  private calculateNivelMinoritario(nivelEducativoTabla: NivelEducativoData[]): { categoria: string; porcentaje: string } | undefined {
    if (!nivelEducativoTabla || nivelEducativoTabla.length === 0) return undefined;

    const total = nivelEducativoTabla.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return undefined;

    let minPercentage = 100;
    let categoriaMenor = '';

    nivelEducativoTabla.forEach(item => {
      const percentage = (item.total / total) * 100;
      if (percentage < minPercentage) {
        minPercentage = percentage;
        categoriaMenor = item.nivel;
      }
    });

    return {
      categoria: categoriaMenor,
      porcentaje: minPercentage.toFixed(1) + '%'
    };
  }

  private calculateNivelEducativoWithPercentages(data: NivelEducativoData[]): NivelEducativoData[] {
    if (!data || data.length === 0) return [];

    const total = data.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return data;

    return data.map(item => ({
      ...item,
      porcentajeHombres: item.hombres > 0 ? ((item.hombres / item.total) * 100).toFixed(1) + '%' : '0%',
      porcentajeMujeres: item.mujeres > 0 ? ((item.mujeres / item.total) * 100).toFixed(1) + '%' : '0%',
      porcentajeTotal: total > 0 ? ((item.total / total) * 100).toFixed(1) + '%' : '0%'
    }));
  }

  private calculateTasaAnalfabetismoWithPercentages(data: TasaAnalfabetismoData[]): TasaAnalfabetismoData[] {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      ...item,
      tasaAnalfabetismo: item.total > 0 ? (((item.alfabetos + item.analfabetos) / item.total) * 100).toFixed(1) + '%' : '0%'
    }));
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion30DataUseCase {
  constructor(
    private seccion30DataService: ISeccion30DataService,
    private seccion30TextGenerator: ISeccion30TextGeneratorService
  ) {}

  execute(updates: Partial<Seccion30Data>): Observable<Seccion30ViewModel> {
    return this.seccion30DataService.updateSeccion30Data(updates).pipe(
      map(updatedData => ({
        data: updatedData,
        texts: {
          nivelEducativoText: this.seccion30TextGenerator.generateNivelEducativoText(updatedData),
          tasaAnalfabetismoText: this.seccion30TextGenerator.generateTasaAnalfabetismoText(updatedData)
        },
        parrafoSeccion30_indicadores_educacion_intro: updatedData.parrafoSeccion30_indicadores_educacion_intro || '',
        nivelMayoritario: this.calculateNivelMayoritario(updatedData.nivelEducativoTabla),
        nivelSegundo: this.calculateNivelSegundo(updatedData.nivelEducativoTabla),
        nivelMinoritario: this.calculateNivelMinoritario(updatedData.nivelEducativoTabla),
        nivelEducativoAISIConPorcentajes: this.calculateNivelEducativoWithPercentages(updatedData.nivelEducativoTabla),
        tasaAnalfabetismoAISIConPorcentajes: this.calculateTasaAnalfabetismoWithPercentages(updatedData.tasaAnalfabetismoTabla),
        fotografiasVista: (updatedData.fotografiasCahuachoB19 || []) as FotoItem[]
      }))
    );
  }

  private calculateNivelMayoritario(nivelEducativoTabla: NivelEducativoData[]): { categoria: string; porcentaje: string } | undefined {
    if (!nivelEducativoTabla || nivelEducativoTabla.length === 0) return undefined;

    const total = nivelEducativoTabla.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return undefined;

    let maxPercentage = 0;
    let categoriaMayor = '';

    nivelEducativoTabla.forEach(item => {
      const percentage = (item.total / total) * 100;
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
        categoriaMayor = item.nivel;
      }
    });

    return {
      categoria: categoriaMayor,
      porcentaje: maxPercentage.toFixed(1) + '%'
    };
  }

  private calculateNivelSegundo(nivelEducativoTabla: NivelEducativoData[]): { categoria: string; porcentaje: string } | undefined {
    if (!nivelEducativoTabla || nivelEducativoTabla.length < 2) return undefined;

    const total = nivelEducativoTabla.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return undefined;

    const percentages = nivelEducativoTabla.map(item => ({
      categoria: item.nivel,
      percentage: (item.total / total) * 100
    })).sort((a, b) => b.percentage - a.percentage);

    if (percentages.length < 2) return undefined;

    return {
      categoria: percentages[1].categoria,
      porcentaje: percentages[1].percentage.toFixed(1) + '%'
    };
  }

  private calculateNivelMinoritario(nivelEducativoTabla: NivelEducativoData[]): { categoria: string; porcentaje: string } | undefined {
    if (!nivelEducativoTabla || nivelEducativoTabla.length === 0) return undefined;

    const total = nivelEducativoTabla.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return undefined;

    let minPercentage = 100;
    let categoriaMenor = '';

    nivelEducativoTabla.forEach(item => {
      const percentage = (item.total / total) * 100;
      if (percentage < minPercentage) {
        minPercentage = percentage;
        categoriaMenor = item.nivel;
      }
    });

    return {
      categoria: categoriaMenor,
      porcentaje: minPercentage.toFixed(1) + '%'
    };
  }

  private calculateNivelEducativoWithPercentages(data: NivelEducativoData[]): NivelEducativoData[] {
    if (!data || data.length === 0) return [];

    const total = data.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return data;

    return data.map(item => ({
      ...item,
      porcentajeHombres: item.hombres > 0 ? ((item.hombres / item.total) * 100).toFixed(1) + '%' : '0%',
      porcentajeMujeres: item.mujeres > 0 ? ((item.mujeres / item.total) * 100).toFixed(1) + '%' : '0%',
      porcentajeTotal: total > 0 ? ((item.total / total) * 100).toFixed(1) + '%' : '0%'
    }));
  }

  private calculateTasaAnalfabetismoWithPercentages(data: TasaAnalfabetismoData[]): TasaAnalfabetismoData[] {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      ...item,
      tasaAnalfabetismo: item.total > 0 ? (((item.alfabetos + item.analfabetos) / item.total) * 100).toFixed(1) + '%' : '0%'
    }));
  }
}export interface Seccion29ViewModel {
  data: Seccion29Data;
  texts: {
    natalidadText: string;
    morbilidadText: string;
    afiliacionSaludText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion29UseCase {
  constructor(
    private seccion29DataService: ISeccion29DataService,
    private seccion29TextGenerator: ISeccion29TextGeneratorService
  ) {}

  execute(): Observable<Seccion29ViewModel> {
    return this.seccion29DataService.getSeccion29Data().pipe(
      map(data => ({
        data,
        texts: {
          natalidadText: this.seccion29TextGenerator.generateNatalidadText(data),
          morbilidadText: this.seccion29TextGenerator.generateMorbilidadText(data),
          afiliacionSaludText: this.seccion29TextGenerator.generateAfiliacionSaludText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion29DataUseCase {
  constructor(
    private seccion29DataService: ISeccion29DataService,
    private seccion29TextGenerator: ISeccion29TextGeneratorService
  ) {}

  execute(updates: Partial<Seccion29Data>): Observable<Seccion29ViewModel> {
    return this.seccion29DataService.getSeccion29Data().pipe(
      map(currentData => {
        const updatedData = { ...currentData, ...updates };
        return {
          data: updatedData,
          texts: {
            natalidadText: this.seccion29TextGenerator.generateNatalidadText(updatedData),
            morbilidadText: this.seccion29TextGenerator.generateMorbilidadText(updatedData),
            afiliacionSaludText: this.seccion29TextGenerator.generateAfiliacionSaludText(updatedData)
          }
        };
      })
    );
  }
}

export interface Seccion24ViewModel {
  data: Seccion24Data;
  texts: {
    actividadesEconomicasText: string;
    mercadoText: string;
    habitosConsumoText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion24UseCase {
  constructor(
    private seccion24DataService: ISeccion24DataService,
    private seccion24TextGenerator: ISeccion24TextGeneratorService
  ) {}

  execute(): Observable<Seccion24ViewModel> {
    return this.seccion24DataService.getSeccion24Data().pipe(
      map(data => ({
        data,
        texts: {
          actividadesEconomicasText: this.seccion24TextGenerator.generateActividadesEconomicasText(data),
          mercadoText: this.seccion24TextGenerator.generateMercadoText(data),
          habitosConsumoText: this.seccion24TextGenerator.generateHabitosConsumoText(data)
        }
      }))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion24DataUseCase {
  constructor(
    private seccion24DataService: ISeccion24DataService,
    private seccion24TextGenerator: ISeccion24TextGeneratorService
  ) {}

  execute(updates: Partial<Seccion24Data>): Observable<Seccion24ViewModel> {
    return this.seccion24DataService.getSeccion24Data().pipe(
      map(currentData => {
        const updatedData = { ...currentData, ...updates };
        return {
          data: updatedData,
          texts: {
            actividadesEconomicasText: this.seccion24TextGenerator.generateActividadesEconomicasText(updatedData),
            mercadoText: this.seccion24TextGenerator.generateMercadoText(updatedData),
            habitosConsumoText: this.seccion24TextGenerator.generateHabitosConsumoText(updatedData)
          }
        };
      })
    );
  }
}
@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion28DataUseCase {
  constructor(
    private seccion28DataService: ISeccion28DataService,
    private seccion28TextGenerator: ISeccion28TextGeneratorService
  ) {}

  execute(updates: Partial<Seccion28Data>): Observable<Seccion28ViewModel> {
    return this.seccion28DataService.getSeccion28Data().pipe(
      map(currentData => {
        const updatedData = { ...currentData, ...updates };
        return {
          data: updatedData,
          texts: {
            saludText: this.seccion28TextGenerator.generateSaludText(updatedData),
            educacionText: this.seccion28TextGenerator.generateEducacionText(updatedData),
            recreacionText: this.seccion28TextGenerator.generateRecreacionText(updatedData),
            deporteText: this.seccion28TextGenerator.generateDeporteText(updatedData)
          }
        };
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoadSeccion5UseCase {
  constructor(
    private seccion5DataService: ISeccion5DataService,
    private photoService: IPhotoService
  ) {}

  execute(): Observable<Seccion5ViewModel> {
    return this.seccion5DataService.getSeccion5Data().pipe(
      map(data => {
        const nombreComunidad = this.seccion5DataService.obtenerNombreComunidadActual(data, '3.1.4.A.1');
        const photos = this.photoService.loadPhotos('3.1.4.A.1', 'fotografiaInstitucionalidad');

        return {
          data,
          texts: {
            institucionalidadText: ''
          },
          tables: {
            institucionesTable: data.tablepagina6 || []
          },
          calculations: {
            resumenInstituciones: this.seccion5DataService.obtenerResumenInstituciones(data.tablepagina6 || [])
          },
          photos,
          sources: {
            institucionesSource: data.fuenteInstituciones || 'GEADES (2024)'
          }
        };
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSeccion5DataUseCase {
  constructor(private seccion5DataService: ISeccion5DataService) {}

  execute(updates: Partial<Seccion5Data>): Observable<Seccion5Data> {
    return this.seccion5DataService.updateSeccion5Data(updates);
  }
}
