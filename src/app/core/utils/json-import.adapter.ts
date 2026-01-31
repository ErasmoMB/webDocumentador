/**
 * JSON IMPORT ADAPTER
 * 
 * Adapter PURO para normalizar datos JSON importados.
 * Convierte formatos externos a estructuras internas del ProjectState.
 * 
 * LÓGICA DE NEGOCIO:
 * - 1 key raíz (ej: "CAHUACHO") → Tipo 'AISD' (Área de Influencia Social Directa - Comunidad)
 * - Múltiples keys (ej: "CCPP X", "CCPP Y") → Tipo 'AISI' (Área de Influencia Social Indirecta - Distrito)
 * 
 * FORMATOS SOPORTADOS:
 * 
 * CASO A - Una comunidad (AISD):
 * {
 *   "CAHUACHO": [
 *     { ITEM: 1, UBIGEO: 40306, CODIGO: 403060001, CCPP: "Centro1", ... }
 *   ]
 * }
 * 
 * CASO B - Múltiples comunidades (AISI):
 * {
 *   "CCPP SAN PEDRO": [...],
 *   "CCPP LIMA": [...]
 * }
 * 
 * CASO C - Array directo (sin grupos):
 * [
 *   { ITEM: 1, UBIGEO: 40306, CODIGO: 403060001, CCPP: "Centro1", ... }
 * ]
 * 
 * @example
 * const result = normalizeImportData(jsonContent);
 * // { groups: [...], ccpps: [...], metadata: {...} }
 */

import { CCPP } from '../models/group-config.model';
import { CentroPobladoData } from '../models/formulario.model';

// ============================================================================
// TIPOS DE SALIDA
// ============================================================================

/**
 * Tipo de área de influencia determinado por el contenido
 */
export type InfluenceAreaType = 'AISD' | 'AISI';

/**
 * Grupo normalizado para el ProjectState
 */
export interface NormalizedGroup {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: InfluenceAreaType;
  readonly parentId: string | null;
  readonly orden: number;
  readonly ccppIds: readonly string[];
}

/**
 * CCPP normalizado con ID único
 */
export interface NormalizedCCPP extends CCPP {
  readonly id: string;
}

/**
 * Metadata extraída del JSON
 */
export interface ImportedMetadata {
  readonly departamento: string;
  readonly provincia: string;
  readonly distrito: string;
  readonly detectedType: InfluenceAreaType;
  readonly totalCCPP: number;
  readonly totalGroups: number;
}

/**
 * Resultado completo de la normalización
 */
export interface NormalizedImportResult {
  readonly groups: readonly NormalizedGroup[];
  readonly ccpps: readonly NormalizedCCPP[];
  readonly metadata: ImportedMetadata;
  readonly success: boolean;
  readonly errors: readonly string[];
}

// ============================================================================
// FUNCIONES AUXILIARES PURAS
// ============================================================================

/**
 * Genera un ID único para un CCPP basado en UBIGEO y CODIGO
 */
function generateCCPPId(ccpp: CentroPobladoData): string {
  const ubigeo = ccpp.UBIGEO ?? 0;
  const codigo = ccpp.CODIGO ?? Date.now();
  return String(codigo);
}

/**
 * Genera un ID único para un grupo
 */
function generateGroupId(nombre: string, index: number): string {
  const safeName = nombre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `group_${safeName}_${index}`;
}

/**
 * Limpia el nombre de un grupo (remueve prefijos comunes)
 */
function cleanGroupName(rawName: string): string {
  let name = rawName.trim();
  
  // Remover prefijos comunes
  const prefixes = ['CCPP ', 'CC ', 'CP '];
  for (const prefix of prefixes) {
    if (name.toUpperCase().startsWith(prefix.toUpperCase())) {
      name = name.substring(prefix.length).trim();
      break;
    }
  }
  
  return name || rawName;
}

/**
 * Normaliza un CentroPobladoData a NormalizedCCPP
 */
function normalizeCCPP(raw: CentroPobladoData): NormalizedCCPP {
  return {
    id: generateCCPPId(raw),
    item: raw.ITEM ?? 0,
    ubigeo: raw.UBIGEO ?? 0,
    codigo: String(raw.CODIGO ?? ''),
    nombre: raw.CCPP ?? '',
    categoria: raw.CATEGORIA ?? '',
    poblacion: raw.POBLACION ?? 0,
    dpto: raw.DPTO ?? '',
    prov: raw.PROV ?? '',
    dist: raw.DIST ?? '',
    este: raw.ESTE ?? 0,
    norte: raw.NORTE ?? 0,
    altitud: raw.ALTITUD ?? 0
  };
}

/**
 * Extrae metadata de ubicación del primer CCPP disponible
 */
function extractUbicacionFromCCPP(ccpps: readonly NormalizedCCPP[]): {
  departamento: string;
  provincia: string;
  distrito: string;
} {
  if (ccpps.length === 0) {
    return { departamento: '', provincia: '', distrito: '' };
  }
  
  const first = ccpps[0];
  return {
    departamento: first.dpto,
    provincia: first.prov,
    distrito: first.dist
  };
}

/**
 * Detecta si el JSON es un array directo o un objeto con grupos
 */
function isArrayFormat(json: unknown): json is CentroPobladoData[] {
  return Array.isArray(json);
}

/**
 * Detecta si el JSON es un objeto con grupos
 */
function isObjectFormat(json: unknown): json is Record<string, CentroPobladoData[]> {
  if (json === null || json === undefined) return false;
  if (Array.isArray(json)) return false;
  if (typeof json !== 'object') return false;
  
  const keys = Object.keys(json);
  if (keys.length === 0) return false;
  
  // Verificar que al menos una key tenga un array
  for (const key of keys) {
    const value = (json as Record<string, unknown>)[key];
    if (Array.isArray(value)) return true;
  }
  
  return false;
}

/**
 * Valida que un objeto tenga propiedades de CCPP
 */
function isCCPPLike(obj: unknown): obj is CentroPobladoData {
  if (!obj || typeof obj !== 'object') return false;
  // Al menos debe tener alguna propiedad característica
  return 'CCPP' in obj || 'CODIGO' in obj || 'UBIGEO' in obj;
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE NORMALIZACIÓN
// ============================================================================

/**
 * Normaliza datos JSON importados a estructuras internas del ProjectState.
 * 
 * Esta es una FUNCIÓN PURA - no tiene side effects.
 * 
 * @param json - Contenido JSON parseado (puede ser array u objeto)
 * @returns Resultado normalizado con grupos, ccpps y metadata
 * 
 * @example
 * // Caso A: Una comunidad
 * const jsonA = { "CAHUACHO": [{...}, {...}] };
 * const resultA = normalizeImportData(jsonA);
 * // resultA.metadata.detectedType === 'AISD'
 * 
 * // Caso B: Múltiples comunidades
 * const jsonB = { "CCPP X": [...], "CCPP Y": [...] };
 * const resultB = normalizeImportData(jsonB);
 * // resultB.metadata.detectedType === 'AISI'
 */
export function normalizeImportData(json: unknown): NormalizedImportResult {
  const errors: string[] = [];
  
  // =========================================================================
  // CASO 1: Array directo de CCPP (sin grupos)
  // =========================================================================
  if (isArrayFormat(json)) {
    const rawCCPPs = json.filter(isCCPPLike);
    
    if (rawCCPPs.length === 0 && json.length > 0) {
      errors.push('El array no contiene objetos CCPP válidos');
      return createEmptyResult(errors);
    }
    
    const ccpps = rawCCPPs.map(normalizeCCPP);
    const ubicacion = extractUbicacionFromCCPP(ccpps);
    
    // Crear un grupo default basado en el distrito
    const groupName = ubicacion.distrito || 'Grupo Principal';
    const group: NormalizedGroup = {
      id: generateGroupId(groupName, 0),
      nombre: groupName,
      tipo: 'AISD', // Array simple = AISD
      parentId: null,
      orden: 0,
      ccppIds: ccpps.map(c => c.id)
    };
    
    return {
      groups: ccpps.length > 0 ? [group] : [],
      ccpps,
      metadata: {
        ...ubicacion,
        detectedType: 'AISD',
        totalCCPP: ccpps.length,
        totalGroups: ccpps.length > 0 ? 1 : 0
      },
      success: true,
      errors: []
    };
  }
  
  // =========================================================================
  // CASO 2: Objeto con grupos
  // =========================================================================
  if (isObjectFormat(json)) {
    const keys = Object.keys(json);
    
    // LÓGICA DE NEGOCIO:
    // - 1 key → AISD (Comunidad única)
    // - N keys → AISI (Múltiples comunidades/distritos)
    const detectedType: InfluenceAreaType = keys.length === 1 ? 'AISD' : 'AISI';
    
    const allCCPPs: NormalizedCCPP[] = [];
    const groups: NormalizedGroup[] = [];
    
    keys.forEach((groupKey, index) => {
      const rawArray = json[groupKey];
      
      if (!Array.isArray(rawArray)) {
        errors.push(`El grupo "${groupKey}" no contiene un array válido`);
        return;
      }
      
      const validRawCCPPs = rawArray.filter(isCCPPLike);
      const normalizedCCPPs = validRawCCPPs.map(normalizeCCPP);
      
      // Agregar a la lista plana
      allCCPPs.push(...normalizedCCPPs);
      
      // Crear grupo
      const cleanedName = cleanGroupName(groupKey);
      groups.push({
        id: generateGroupId(cleanedName, index),
        nombre: cleanedName,
        tipo: detectedType,
        parentId: null,
        orden: index,
        ccppIds: normalizedCCPPs.map(c => c.id)
      });
    });
    
    const ubicacion = extractUbicacionFromCCPP(allCCPPs);
    
    return {
      groups,
      ccpps: allCCPPs,
      metadata: {
        ...ubicacion,
        detectedType,
        totalCCPP: allCCPPs.length,
        totalGroups: groups.length
      },
      success: errors.length === 0,
      errors
    };
  }
  
  // =========================================================================
  // CASO 3: Formato no reconocido
  // =========================================================================
  errors.push('Formato de JSON no reconocido. Esperado: array de CCPP o objeto con grupos.');
  return createEmptyResult(errors);
}

/**
 * Crea un resultado vacío con errores
 */
function createEmptyResult(errors: string[]): NormalizedImportResult {
  return {
    groups: [],
    ccpps: [],
    metadata: {
      departamento: '',
      provincia: '',
      distrito: '',
      detectedType: 'AISD',
      totalCCPP: 0,
      totalGroups: 0
    },
    success: false,
    errors
  };
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida que el JSON tenga el formato esperado antes de normalizar
 */
export function validateImportJson(json: unknown): {
  valid: boolean;
  format: 'array' | 'object' | 'unknown';
  errors: string[];
} {
  if (json === null || json === undefined) {
    return { valid: false, format: 'unknown', errors: ['JSON es null o undefined'] };
  }
  
  if (isArrayFormat(json)) {
    if (json.length === 0) {
      return { valid: true, format: 'array', errors: [] };
    }
    
    const hasValidCCPP = json.some(isCCPPLike);
    if (!hasValidCCPP) {
      return { valid: false, format: 'array', errors: ['Array no contiene objetos CCPP válidos'] };
    }
    
    return { valid: true, format: 'array', errors: [] };
  }
  
  if (isObjectFormat(json)) {
    const keys = Object.keys(json);
    const invalidKeys: string[] = [];
    
    for (const key of keys) {
      const value = (json as Record<string, unknown>)[key];
      if (!Array.isArray(value)) {
        invalidKeys.push(key);
      }
    }
    
    if (invalidKeys.length === keys.length) {
      return { valid: false, format: 'object', errors: ['Ninguna key contiene un array válido'] };
    }
    
    return { 
      valid: true, 
      format: 'object', 
      errors: invalidKeys.length > 0 
        ? [`Keys inválidas ignoradas: ${invalidKeys.join(', ')}`] 
        : [] 
    };
  }
  
  return { valid: false, format: 'unknown', errors: ['Formato no reconocido'] };
}

/**
 * Obtiene estadísticas del JSON sin procesarlo completamente
 */
export function getImportStats(json: unknown): {
  format: 'array' | 'object' | 'unknown';
  estimatedGroups: number;
  estimatedCCPP: number;
  detectedType: InfluenceAreaType | null;
} {
  if (isArrayFormat(json)) {
    return {
      format: 'array',
      estimatedGroups: 1,
      estimatedCCPP: json.filter(isCCPPLike).length,
      detectedType: 'AISD'
    };
  }
  
  if (isObjectFormat(json)) {
    const keys = Object.keys(json);
    let totalCCPP = 0;
    
    for (const key of keys) {
      const value = (json as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        totalCCPP += value.filter(isCCPPLike).length;
      }
    }
    
    return {
      format: 'object',
      estimatedGroups: keys.length,
      estimatedCCPP: totalCCPP,
      detectedType: keys.length === 1 ? 'AISD' : 'AISI'
    };
  }
  
  return {
    format: 'unknown',
    estimatedGroups: 0,
    estimatedCCPP: 0,
    detectedType: null
  };
}
