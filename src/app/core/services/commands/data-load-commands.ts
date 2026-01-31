import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ICommand } from './interfaces';
import { IViviendaDataProvider, IMaterialesDataProvider } from '../domain/interfaces';
import { TableManagementFacade } from '../tables/table-management.facade';

export class LoadViviendaDataCommand implements ICommand<string[], any> {
  constructor(
    private viviendaProvider: IViviendaDataProvider,
    private tableFacade: TableManagementFacade,
    private tableConfig: any
  ) {}

  execute(codigos: string[]): Observable<any> {
    return this.viviendaProvider.obtenerTiposVivienda(codigos).pipe(
      map(response => {
        if (response && response.success && response.tipos_vivienda && Array.isArray(response.tipos_vivienda)) {
          const viviendas = response.tipos_vivienda.map((item: any) => ({
            categoria: item.tipo_vivienda || '',
            casos: Number(item.casos) || 0,
            porcentaje: '0,00 %'
          }));

          // Calcular porcentajes usando el facade
          this.tableFacade.calcularPorcentajes({ [this.tableConfig.tablaKey]: viviendas }, this.tableConfig);

          return viviendas;
        }
        return null;
      })
    );
  }

  canExecute(codigos: string[]): boolean {
    return codigos && codigos.length > 0;
  }
}

export class LoadMaterialesDataCommand implements ICommand<string[], any> {
  constructor(
    private materialesProvider: IMaterialesDataProvider,
    private tableFacade: TableManagementFacade,
    private tableConfig: any
  ) {}

  execute(codigos: string[]): Observable<any> {
    return this.materialesProvider.obtenerMateriales(codigos).pipe(
      map(response => {
        if (response && response.success && response.materiales_construccion && Array.isArray(response.materiales_construccion)) {
          const materiales = response.materiales_construccion.map((item: any) => ({
            categoria: item.categoria || '',
            tipoMaterial: item.tipo_material || '',
            casos: Number(item.casos) || 0,
            porcentaje: '0,00 %'
          }));

          // Calcular porcentajes usando el facade
          this.tableFacade.calcularPorcentajes({ [this.tableConfig.tablaKey]: materiales }, this.tableConfig);

          return materiales;
        }
        return null;
      })
    );
  }

  canExecute(codigos: string[]): boolean {
    return codigos && codigos.length > 0;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DataLoadCommandFactory {
  constructor(
    private viviendaProvider: IViviendaDataProvider,
    private materialesProvider: IMaterialesDataProvider,
    private tableFacade: TableManagementFacade
  ) {}

  createViviendaCommand(tableConfig: any): LoadViviendaDataCommand {
    return new LoadViviendaDataCommand(this.viviendaProvider, this.tableFacade, tableConfig);
  }

  createMaterialesCommand(tableConfig: any): LoadMaterialesDataCommand {
    return new LoadMaterialesDataCommand(this.materialesProvider, this.tableFacade, tableConfig);
  }
}
