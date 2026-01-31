import { Injector } from '@angular/core';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { createTableConfigFromRegistry, createTableHandlerFromFactory } from './section-table-utils';

export class SectionTableCoordinator {
  createTableConfig(
    injector: Injector | undefined,
    seccionId: string,
    tableKey: string,
    fallbackConfig?: Partial<TableConfig>
  ): TableConfig {
    return createTableConfigFromRegistry(injector, seccionId, tableKey, fallbackConfig);
  }

  createTableHandler(
    injector: Injector | undefined,
    getDatos: () => any,
    getSeccionId: () => string,
    setDatos: (newData: any) => void,
    onFieldChange: (fieldId: string, value: any) => void,
    detectChanges: () => void,
    tableKey: string,
    config: TableConfig | (() => TableConfig),
    afterChange?: () => void
  ): (index: number, field: string, value: any) => void {
    return createTableHandlerFromFactory(
      injector,
      getDatos,
      getSeccionId,
      setDatos,
      onFieldChange,
      detectChanges,
      tableKey,
      config,
      afterChange
    );
  }
}
