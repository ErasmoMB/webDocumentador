export interface FieldDataSourceConfig {
  field: string;
  source: 'manual' | 'automatic';
  endpoint?: string;
  transform?: (data: any) => any;
}

export const DATA_SOURCE_CONFIG: FieldDataSourceConfig[] = [
  { field: 'projectName', source: 'manual' },
  { field: 'distritoSeleccionado', source: 'automatic' },
  { field: 'provinciaSeleccionada', source: 'automatic' },
  { field: 'departamentoSeleccionado', source: 'automatic' },
  { field: 'grupoAISD', source: 'manual' },
  { field: 'grupoAISI', source: 'manual' },
  { field: 'aisdComponente1', source: 'manual' },
  { field: 'aisdComponente2', source: 'manual' },
  { field: 'centroPobladoAISI', source: 'automatic' },
  { field: 'cantidadEntrevistas', source: 'manual' },
  { field: 'fechaTrabajoCampo', source: 'manual' },
  { field: 'consultora', source: 'manual' },
  { field: 'entrevistados', source: 'manual' },
  { field: 'tablaAISD2TotalPoblacion', source: 'automatic' },
  { field: 'tablaAISD2TotalViviendasEmpadronadas', source: 'automatic' },
  { field: 'tablaAISD2TotalViviendasOcupadas', source: 'automatic' },
  { field: 'poblacionPecuariaTabla', source: 'manual' },
  { field: 'caracteristicasSaludTabla', source: 'manual' },
  { field: 'educacionCpTabla', source: 'automatic' },
  { field: 'tituloInstituciones', source: 'manual' },
  { field: 'fuenteInstituciones', source: 'manual' },
];

export function getDataSourceForField(fieldName: string): 'manual' | 'automatic' {
  const config = DATA_SOURCE_CONFIG.find(c => c.field === fieldName);
  return config?.source || 'manual';
}


