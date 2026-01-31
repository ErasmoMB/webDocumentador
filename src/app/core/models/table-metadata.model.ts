/**
 * Metadata para configuración declarativa de tablas backend
 * Este modelo permite definir tablas de forma declarativa sin código repetitivo
 */

export interface TableColumnMetadata {
  field: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  readonly?: boolean;
  options?: string[]; // Para selects
}

export interface TableConfigMetadata {
  totalKey: string;
  campoTotal: string;
  campoPorcentaje?: string;
  calcularPorcentajes?: boolean;
  estructuraInicial?: any[];
  camposParaCalcular?: string[];
}

export interface TransformConfigMetadata {
  categoriaField?: string;     // Campo que contiene la categoría
  casosField?: string;         // Campo numérico principal
  porcentajeField?: string;    // Campo de porcentaje (auto-calculado)
  groupBy?: string[];          // Campos para agrupar en agregación
  sumFields?: string[];        // Campos a sumar en agregación
  customFields?: {              // Mapeo de campos personalizados
    [backendField: string]: string; // backendField -> frontendField
  };
}

export interface TableValidationMetadata {
  minRows?: number;
  maxRows?: number;
  requiredFields?: string[];
  customValidator?: (row: any) => boolean;
}

export interface TableMetadata {
  // Identificación
  sectionKey: string;           // 'seccion6_aisd'
  fieldName: string;            // 'poblacionSexoAISD'
  tablaKey?: string;            // Mismo que fieldName o diferente (default: fieldName)
  
  // Backend
  endpoint: string;             // '/centros-poblados/por-codigos-ubigeo'
  method?: 'GET' | 'POST';      // Default: 'GET'
  paramType?: 'id_ubigeo' | 'ubigeo'; // Default: 'id_ubigeo'
  aggregatable?: boolean;       // Default: false
  
  // Transformación
  transformType?: 'standard' | 'aggregate' | 'custom' | 'passthrough';
  transformConfig?: TransformConfigMetadata;
  customTransform?: (data: any) => any; // Para transformType: 'custom'
  
  // Tabla
  tableConfig: TableConfigMetadata;
  
  // Edición
  editable: boolean;
  columns?: TableColumnMetadata[];
  
  // Validación
  validation?: TableValidationMetadata;
  
  // Metadata adicional
  description?: string;         // Descripción de la tabla
  source?: string;              // Fuente de datos
}
