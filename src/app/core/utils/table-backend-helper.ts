/**
 * Helper para asegurar que todas las tablas se carguen desde backend y sean editables
 * Este helper proporciona métodos estándar para manejar tablas en subsecciones AISD/AISI
 */

import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

export interface TableBackendConfig {
  tablaKey: string;
  fieldName: string; // Nombre del campo en el mapping del backend
  sectionKey: string; // Clave de sección para el backend (ej: 'seccion6_aisd')
  estructuraInicial?: any[];
  calcularPorcentajes?: boolean;
  camposParaCalcular?: string[];
  totalKey?: string;
  campoTotal?: string;
  campoPorcentaje?: string;
}

/**
 * Aplica datos cargados del backend a una tabla con prefijo
 */
export function aplicarDatosTablaBackend(
  datos: any,
  seccionId: string,
  loadedData: { [fieldName: string]: any },
  config: TableBackendConfig
): void {
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
  const fieldKey = prefijo ? `${config.fieldName}${prefijo}` : config.fieldName;
  const tablaKey = prefijo ? `${config.tablaKey}${prefijo}` : config.tablaKey;

  // Si hay datos del backend para este campo
  if (loadedData[config.fieldName] !== undefined && loadedData[config.fieldName] !== null) {
    const data = loadedData[config.fieldName];
    
    // Solo actualizar si es un array válido o si no existe dato previo
    const existeDato = datos[tablaKey] !== undefined && datos[tablaKey] !== null;
    const vieneTablaNoVacia = Array.isArray(data) && data.length > 0;
    const actualEsPlaceholder = esTablaPlaceholder(datos[tablaKey]);

    const debeActualizar = !existeDato || (vieneTablaNoVacia && actualEsPlaceholder);

    if (debeActualizar && Array.isArray(data)) {
      datos[tablaKey] = [...data];
      datos[fieldKey] = [...data];
    }
  }
}

/**
 * Verifica si una tabla es un placeholder (vacía o con solo valores por defecto)
 */
function esTablaPlaceholder(valor: any): boolean {
  if (!Array.isArray(valor) || valor.length === 0) {
    return true;
  }

  // Verificar si todas las filas tienen valores vacíos o cero
  return valor.every((row: any) => {
    if (!row) return true;
    
    // Verificar campos numéricos
    const tieneCasos = row.casos !== undefined;
    const casos = tieneCasos ? (typeof row.casos === 'number' ? row.casos : parseInt(row.casos) || 0) : null;
    
    // Verificar campos de texto
    const tieneCategoria = row.categoria !== undefined;
    const categoriaVacia = tieneCategoria ? (row.categoria?.toString().trim() || '') === '' : true;
    
    const tieneSexo = row.sexo !== undefined;
    const sexoVacio = tieneSexo ? (row.sexo?.toString().trim() || '') === '' : true;
    
    const claveVacia = categoriaVacia && sexoVacio;
    
    // Es placeholder si la clave está vacía y los casos son 0 o null
    return claveVacia && (casos === null || casos === 0);
  });
}

/**
 * Obtiene la clave de tabla con prefijo si aplica
 */
export function obtenerTablaKeyConPrefijo(tablaKey: string, seccionId: string): string {
  const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
  return prefijo ? `${tablaKey}${prefijo}` : tablaKey;
}

/**
 * Asegura que una tabla sea editable y persista cambios
 */
export function persistirCambioTabla(
  datos: any,
  seccionId: string,
  tablaKey: string,
  onFieldChange: (field: any, value: any) => void
): void {
  const tablaKeyConPrefijo = obtenerTablaKeyConPrefijo(tablaKey, seccionId);
  const tabla = datos[tablaKeyConPrefijo] || datos[tablaKey] || [];
  onFieldChange(tablaKeyConPrefijo as any, tabla);
}
