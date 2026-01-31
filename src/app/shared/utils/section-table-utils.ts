import { Injector } from '@angular/core';
import { SectionTableRegistryService } from 'src/app/core/services/section-table-registry.service';
import { TableHandlerFactoryService } from 'src/app/core/services/table-handler-factory.service';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { PrefijoHelper } from './prefijo-helper';

export function getSectionKeyForRegistry(seccionId: string): string {
  const simpleMatch = seccionId.match(/^3\.1\.(\d+)$/);
  if (simpleMatch) return `seccion${simpleMatch[1]}`;
  return `seccion${seccionId.replace(/\./g, '_')}`;
}

export function getDefaultTableConfig(
  tableKey: string,
  fallbackConfig?: Partial<TableConfig>
): TableConfig {
  return {
    tablaKey: tableKey,
    totalKey: fallbackConfig?.totalKey || 'categoria',
    campoTotal: fallbackConfig?.campoTotal || 'casos',
    campoPorcentaje: fallbackConfig?.campoPorcentaje || 'porcentaje',
    calcularPorcentajes: fallbackConfig?.calcularPorcentajes ?? true,
    camposParaCalcular: fallbackConfig?.camposParaCalcular || ['casos'],
    estructuraInicial: fallbackConfig?.estructuraInicial || [{}]
  };
}

export function createTableConfigFromRegistry(
  injector: Injector | undefined,
  seccionId: string,
  tableKey: string,
  fallbackConfig?: Partial<TableConfig>
): TableConfig {
  try {
    if (!injector) return getDefaultTableConfig(tableKey, fallbackConfig);

    const registry = injector.get(SectionTableRegistryService, null);
    if (!registry) return getDefaultTableConfig(tableKey, fallbackConfig);

    const sectionKey = getSectionKeyForRegistry(seccionId);
    const registryConfig = registry.getTableConfig(sectionKey, tableKey);

    return registryConfig || getDefaultTableConfig(tableKey, fallbackConfig);
  } catch {
    return getDefaultTableConfig(tableKey, fallbackConfig);
  }
}

export function createFallbackTableHandler(
  getSeccionId: () => string,
  getDatos: () => any,
  setDatos: (newData: any) => void,
  onFieldChange: (fieldId: string, value: any) => void,
  detectChanges: () => void,
  tableKey: string,
  config: TableConfig | (() => TableConfig),
  afterChange?: () => void
): (index: number, field: string, value: any) => void {
  return (index: number, field: string, value: any) => {
    const datos = getDatos();
    const seccionId = getSeccionId();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    const tablaKeyConPrefijo = prefijo ? `${tableKey}${prefijo}` : tableKey;

    const currentConfig = typeof config === 'function' ? config() : config;

    if (!datos[tablaKeyConPrefijo] || !Array.isArray(datos[tablaKeyConPrefijo])) {
      datos[tablaKeyConPrefijo] = currentConfig.estructuraInicial || [{}];
    }

    const tabla = [...datos[tablaKeyConPrefijo]];
    if (!tabla[index]) tabla[index] = {};
    tabla[index][field] = value;

    datos[tablaKeyConPrefijo] = tabla;
    setDatos(datos);
    onFieldChange(tablaKeyConPrefijo, tabla);

    if (afterChange) afterChange();
    detectChanges();
  };
}

export function createTableHandlerFromFactory(
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
  try {
    if (!injector) {
      return createFallbackTableHandler(
        getSeccionId,
        getDatos,
        setDatos,
        onFieldChange,
        detectChanges,
        tableKey,
        config,
        afterChange
      );
    }

    const factory = injector.get(TableHandlerFactoryService, null);
    if (!factory) {
      return createFallbackTableHandler(
        getSeccionId,
        getDatos,
        setDatos,
        onFieldChange,
        detectChanges,
        tableKey,
        config,
        afterChange
      );
    }

    const getConfig = typeof config === 'function' ? config : () => config;

    return factory.createHandler(
      tableKey,
      getDatos,
      getSeccionId,
      getConfig,
      setDatos,
      detectChanges,
      afterChange
    );
  } catch {
    return createFallbackTableHandler(
      getSeccionId,
      getDatos,
      setDatos,
      onFieldChange,
      detectChanges,
      tableKey,
      config,
      afterChange
    );
  }
}
