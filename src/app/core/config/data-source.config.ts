export interface FieldDataSourceConfig {
  field: string;
  source: 'manual' | 'section';
  endpoint?: string;
  transform?: (data: any) => any;
}

export const DATA_SOURCE_CONFIG: FieldDataSourceConfig[] = [
  { field: 'projectName', source: 'manual' },
  { field: 'distritoSeleccionado', source: 'section' },
  { field: 'provinciaSeleccionada', source: 'section' },
  { field: 'departamentoSeleccionado', source: 'section' },
  { field: 'grupoAISD', source: 'manual' },
  { field: 'grupoAISI', source: 'manual' },
  { field: 'aisdComponente1', source: 'manual' },
  { field: 'aisdComponente2', source: 'manual' },
  { field: 'centroPobladoAISI', source: 'section' },
  { field: 'cantidadEntrevistas', source: 'manual' },
  { field: 'fechaTrabajoCampo', source: 'manual' },
  { field: 'consultora', source: 'manual' },
  { field: 'entrevistados', source: 'manual' },
  { field: 'tablaAISD2TotalPoblacion', source: 'section' },
  { field: 'tablaAISD2TotalViviendasEmpadronadas', source: 'section' },
  { field: 'tablaAISD2TotalViviendasOcupadas', source: 'section' },
  { field: 'poblacionPecuariaTabla', source: 'manual' },
  { field: 'caracteristicasSaludTabla', source: 'manual' },
  { field: 'educacionCpTabla', source: 'section' },
  { field: 'tituloInstituciones', source: 'manual' },
  { field: 'fuenteInstituciones', source: 'manual' },
];

export function getDataSourceForField(fieldName: string): 'manual' | 'section' {
  const config = DATA_SOURCE_CONFIG.find(c => c.field === fieldName);
  return config?.source || 'manual';
}


