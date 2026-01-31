/**
 * JSON NORMALIZER
 * 
 * Funciones PURAS para normalizar los diferentes formatos de JSON de centros poblados
 * a un modelo interno unificado que puede ser convertido a Commands de ProjectState.
 * 
 * FORMATOS SOPORTADOS:
 * 
 * FORMATO A (Array simple - sin grupos):
 * [
 *   { ITEM, UBIGEO, CODIGO, CCPP, CATEGORIA, POBLACION, DPTO, PROV, DIST, ESTE, NORTE, ALTITUD },
 *   ...
 * ]
 * 
 * FORMATO B (Objeto con grupos - AISD agrupados):
 * {
 *   "CC Comunidad1": [{ ITEM, UBIGEO, CODIGO, CCPP, ... }, ...],
 *   "CC Comunidad2": [{ ITEM, UBIGEO, CODIGO, CCPP, ... }, ...],
 *   ...
 * }
 * 
 * FASE 1 del plan de migración: Integración real de Sección 1 con ProjectState
 */

import { CCPP } from '../../models/group-config.model';
import { CentroPobladoData } from '../../models/formulario.model';
import { 
  ProjectStateCommand,
  AddGroupCommand,
  RegisterCCPPBatchCommand,
  SetUbicacionCommand,
  UpdateMetadataCommand,
  BatchCommand
} from '../../state/commands.model';

// ============================================================================
// TIPOS INTERNOS NORMALIZADOS
// ============================================================================

/**
 * Formato de CCPP normalizado (estandarizado)
 */
export interface NormalizedCCPP {
  readonly id: string;
  readonly item: number;
  readonly ubigeo: number;
  readonly codigo: string;
  readonly nombre: string;
  readonly categoria: string;
  readonly poblacion: number;
  readonly dpto: string;
  readonly prov: string;
  readonly dist: string;
  readonly este: number;
  readonly norte: number;
  readonly altitud: number;
}

/**
 * Grupo normalizado (comunidad campesina o distrito)
 */
export interface NormalizedGroup {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: 'AISD' | 'AISI';
  readonly ccppIds: readonly string[];
}

/**
 * Ubicación geográfica normalizada
 */
export interface NormalizedUbicacion {
  readonly departamento: string;
  readonly provincia: string;
  readonly distrito: string;
}

/**
 * Resultado completo de la normalización del JSON
 */
export interface NormalizedJSONResult {
  readonly format: 'A' | 'B' | 'unknown';
  readonly ccppList: readonly NormalizedCCPP[];
  readonly groups: readonly NormalizedGroup[];
  readonly ubicacion: NormalizedUbicacion;
  readonly rawData: readonly CentroPobladoData[];
}

// ============================================================================
// DETECCIÓN DE FORMATO
// ============================================================================

export type JSONFormat = 'A' | 'B' | 'unknown';

/**
 * Detecta el formato del JSON de entrada
 * 
 * @param json - Contenido JSON parseado
 * @returns Formato detectado: 'A' (array), 'B' (objeto con grupos), 'unknown'
 */
export function detectJSONFormat(json: unknown): JSONFormat {
  if (json === null || json === undefined) {
    return 'unknown';
  }

  // Formato A: Array directo de CCPP
  if (Array.isArray(json)) {
    if (json.length === 0) return 'A'; // Array vacío es formato A válido
    // Verificar que el primer elemento tenga propiedades de CCPP
    const first = json[0];
    if (typeof first === 'object' && first !== null) {
      if ('CCPP' in first || 'CODIGO' in first || 'UBIGEO' in first) {
        return 'A';
      }
    }
    return 'unknown';
  }

  // Formato B: Objeto con grupos
  if (typeof json === 'object') {
    const keys = Object.keys(json);
    if (keys.length === 0) return 'unknown';

    // Verificar que al menos una key contenga un array de CCPP
    for (const key of keys) {
      const value = (json as Record<string, unknown>)[key];
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          if ('CCPP' in firstItem || 'CODIGO' in firstItem || 'UBIGEO' in firstItem) {
            return 'B';
          }
        }
      }
    }
    return 'unknown';
  }

  return 'unknown';
}

// ============================================================================
// NORMALIZACIÓN DE CCPP
// ============================================================================

/**
 * Genera un ID único para un CCPP basado en sus propiedades
 */
export function generateCCPPId(ccpp: CentroPobladoData): string {
  const ubigeo = ccpp.UBIGEO ?? 0;
  const codigo = ccpp.CODIGO ?? Date.now();
  return `ccpp_${ubigeo}_${codigo}`;
}

/**
 * Normaliza un CentroPobladoData a NormalizedCCPP
 */
export function normalizeCCPP(ccpp: CentroPobladoData): NormalizedCCPP {
  const id = generateCCPPId(ccpp);
  return {
    id,
    item: ccpp.ITEM ?? 0,
    ubigeo: ccpp.UBIGEO ?? 0,
    codigo: String(ccpp.CODIGO ?? ''),
    nombre: ccpp.CCPP ?? '',
    categoria: ccpp.CATEGORIA ?? '',
    poblacion: ccpp.POBLACION ?? 0,
    dpto: ccpp.DPTO ?? '',
    prov: ccpp.PROV ?? '',
    dist: ccpp.DIST ?? '',
    este: ccpp.ESTE ?? 0,
    norte: ccpp.NORTE ?? 0,
    altitud: ccpp.ALTITUD ?? 0
  };
}

/**
 * Extrae ubicación del primer CCPP
 */
export function extractUbicacion(ccppList: readonly CentroPobladoData[]): NormalizedUbicacion {
  if (ccppList.length === 0) {
    return { departamento: '', provincia: '', distrito: '' };
  }
  const first = ccppList[0];
  return {
    departamento: first.DPTO ?? '',
    provincia: first.PROV ?? '',
    distrito: first.DIST ?? ''
  };
}

// ============================================================================
// NORMALIZACIÓN FORMATO A (Array simple)
// ============================================================================

/**
 * Normaliza JSON en Formato A (array simple sin grupos)
 * Crea un grupo AISD "default" con todos los CCPP
 */
export function normalizeFormatA(jsonArray: CentroPobladoData[]): NormalizedJSONResult {
  const normalizedCCPP = jsonArray.map(normalizeCCPP);
  const ubicacion = extractUbicacion(jsonArray);
  
  // No crear grupo si no hay CCPP
  const groups: NormalizedGroup[] = normalizedCCPP.length > 0 ? [{
    id: `aisd_default_${Date.now()}`,
    nombre: ubicacion.distrito || 'Grupo Principal',
    tipo: 'AISD',
    ccppIds: normalizedCCPP.map(c => c.codigo) // ✅ Usar codigo, no id
  }] : [];

  return {
    format: 'A',
    ccppList: normalizedCCPP,
    groups,
    ubicacion,
    rawData: jsonArray
  };
}

// ============================================================================
// NORMALIZACIÓN FORMATO B (Objeto con grupos)
// ============================================================================

/**
 * Limpia el nombre de grupo (remueve prefijo "CCPP " si existe)
 */
export function cleanGroupName(rawName: string): string {
  let name = rawName.trim();
  // Remover prefijos comunes
  if (name.toUpperCase().startsWith('CCPP ')) {
    name = name.substring(5).trim();
  }
  if (name.toUpperCase().startsWith('CC ')) {
    name = name.substring(3).trim();
  }
  return name || rawName;
}

/**
 * Genera un ID único para un grupo basado en su nombre
 */
export function generateGroupId(tipo: 'AISD' | 'AISI', nombre: string, index: number): string {
  const prefix = tipo.toLowerCase();
  const safeName = nombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${prefix}_${safeName}_${index}_${Date.now()}`;
}

/**
 * Normaliza JSON en Formato B (objeto con grupos)
 * Crea grupos AISD de las keys y grupos AISI de los distritos únicos
 */
export function normalizeFormatB(jsonObject: Record<string, CentroPobladoData[]>): NormalizedJSONResult {
  const allCCPP: NormalizedCCPP[] = [];
  const groups: NormalizedGroup[] = [];
  let rawData: CentroPobladoData[] = [];
  
  const keys = Object.keys(jsonObject);
  
  // Map para agrupar CCPP por distrito: { "SAN PEDRO": [ccppIds], "LIMA": [ccppIds] }
  const ccppIdsByDistrict: Record<string, string[]> = {};
  
  keys.forEach((groupKey, index) => {
    const groupCCPP = jsonObject[groupKey];
    if (!Array.isArray(groupCCPP)) return;
    
    // Normalizar CCPP del grupo
    const normalizedGroupCCPP = groupCCPP.map(normalizeCCPP);
    allCCPP.push(...normalizedGroupCCPP);
    rawData = rawData.concat(groupCCPP);
    
    // Crear grupo AISD
    const groupName = cleanGroupName(groupKey);
    groups.push({
      id: generateGroupId('AISD', groupName, index),
      nombre: groupName,
      tipo: 'AISD',
      ccppIds: normalizedGroupCCPP.map(c => c.codigo) // ✅ Usar codigo, no id
    });
    
    // Agrupar CCPP por distrito para crear grupos AISI
    normalizedGroupCCPP.forEach(ccpp => {
      const districtName = ccpp.dist || 'Sin Distrito';
      if (!ccppIdsByDistrict[districtName]) {
        ccppIdsByDistrict[districtName] = [];
      }
      ccppIdsByDistrict[districtName].push(ccpp.codigo); // ✅ Usar codigo, no id
    });
  });
  
  // Crear grupos AISI (distritos únicos)
  let aisiIndex = 0;
  Object.entries(ccppIdsByDistrict).forEach(([districtName, ccppIds]) => {
    groups.push({
      id: generateGroupId('AISI', districtName, aisiIndex),
      nombre: districtName,
      tipo: 'AISI',
      ccppIds: ccppIds
    });
    aisiIndex++;
  });

  const ubicacion = extractUbicacion(rawData);

  return {
    format: 'B',
    ccppList: allCCPP,
    groups,
    ubicacion,
    rawData
  };
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE NORMALIZACIÓN
// ============================================================================

/**
 * Normaliza cualquier formato de JSON a un resultado unificado
 * 
 * @param json - Contenido JSON parseado (puede ser array u objeto)
 * @returns Resultado normalizado con ccpp, grupos y ubicación
 */
export function normalizeJSON(json: unknown): NormalizedJSONResult {
  const format = detectJSONFormat(json);
  
  switch (format) {
    case 'A':
      return normalizeFormatA(json as CentroPobladoData[]);
    case 'B':
      return normalizeFormatB(json as Record<string, CentroPobladoData[]>);
    default:
      return {
        format: 'unknown',
        ccppList: [],
        groups: [],
        ubicacion: { departamento: '', provincia: '', distrito: '' },
        rawData: []
      };
  }
}

// ============================================================================
// CONVERSIÓN A COMMANDS
// ============================================================================

/**
 * Convierte NormalizedCCPP[] a formato CCPP del modelo
 */
export function normalizedToCCPPModel(normalized: readonly NormalizedCCPP[]): CCPP[] {
  return normalized.map(n => ({
    item: n.item,
    ubigeo: n.ubigeo,
    codigo: n.codigo,
    nombre: n.nombre,
    categoria: n.categoria,
    poblacion: n.poblacion,
    dpto: n.dpto,
    prov: n.prov,
    dist: n.dist,
    este: n.este,
    norte: n.norte,
    altitud: n.altitud
  }));
}

/**
 * Crea un RegisterCCPPBatchCommand desde el resultado normalizado
 */
export function createRegisterCCPPCommand(result: NormalizedJSONResult): RegisterCCPPBatchCommand | null {
  if (result.ccppList.length === 0) return null;
  
  return {
    type: 'groupConfig/registerCCPPBatch',
    payload: {
      ccppList: normalizedToCCPPModel(result.ccppList)
    }
  };
}

/**
 * Crea AddGroupCommands desde el resultado normalizado
 */
export function createGroupCommands(result: NormalizedJSONResult): AddGroupCommand[] {
  return result.groups.map(group => ({
    type: 'groupConfig/addGroup',
    payload: {
      tipo: group.tipo,
      nombre: group.nombre,
      parentId: null,
      ccppIds: [...group.ccppIds]
    }
  }));
}

/**
 * Crea un SetUbicacionCommand desde el resultado normalizado
 */
export function createUbicacionCommand(result: NormalizedJSONResult): SetUbicacionCommand | null {
  const { ubicacion } = result;
  if (!ubicacion.departamento && !ubicacion.provincia && !ubicacion.distrito) {
    return null;
  }
  
  return {
    type: 'project/setUbicacion',
    payload: {
      departamento: ubicacion.departamento,
      provincia: ubicacion.provincia,
      distrito: ubicacion.distrito
    }
  };
}

/**
 * Crea un UpdateMetadataCommand opcional (para projectName basado en JSON filename)
 */
export function createMetadataCommand(fileName?: string): UpdateMetadataCommand | null {
  if (!fileName) return null;
  
  // Extraer nombre del archivo sin extensión
  const baseName = fileName.replace(/\.json$/i, '');
  
  return {
    type: 'metadata/update',
    payload: {
      projectName: baseName
    }
  };
}

// ============================================================================
// BATCH COMMAND BUILDER
// ============================================================================

export interface CreateBatchOptions {
  /** Nombre del archivo JSON (opcional, para metadata) */
  fileName?: string;
  /** Si true, limpia grupos existentes antes de agregar nuevos */
  clearExisting?: boolean;
  /** Transaction ID para el batch */
  transactionId?: string;
}

/**
 * Crea un BatchCommand completo para procesar un JSON de centros poblados
 * 
 * @param json - Contenido JSON parseado
 * @param options - Opciones de configuración
 * @returns BatchCommand listo para dispatch, o null si no hay datos
 */
export function createJSONProcessingBatch(
  json: unknown,
  options: CreateBatchOptions = {}
): { batch: BatchCommand | null; result: NormalizedJSONResult } {
  const result = normalizeJSON(json);
  
  if (result.format === 'unknown' || result.ccppList.length === 0) {
    return { batch: null, result };
  }

  const commands: ProjectStateCommand[] = [];

  // 1. Metadata (opcional)
  const metadataCmd = createMetadataCommand(options.fileName);
  if (metadataCmd) {
    commands.push(metadataCmd);
  }

  // 2. Ubicación
  const ubicacionCmd = createUbicacionCommand(result);
  if (ubicacionCmd) {
    commands.push(ubicacionCmd);
  }

  // 3. Registrar CCPP (debe ser antes de grupos para que los IDs existan)
  const ccppCmd = createRegisterCCPPCommand(result);
  if (ccppCmd) {
    commands.push(ccppCmd);
  }

  // 4. Crear grupos AISD
  const groupCmds = createGroupCommands(result);
  commands.push(...groupCmds);

  if (commands.length === 0) {
    return { batch: null, result };
  }

  const batch: BatchCommand = {
    type: 'batch/execute',
    payload: {
      commands,
      transactionId: options.transactionId || `json_process_${Date.now()}`
    }
  };

  return { batch, result };
}

// ============================================================================
// UTILIDADES DE VALIDACIÓN
// ============================================================================

/**
 * Valida que el JSON tenga la estructura mínima requerida
 */
export function validateJSONStructure(json: unknown): { valid: boolean; error?: string } {
  const format = detectJSONFormat(json);
  
  if (format === 'unknown') {
    return {
      valid: false,
      error: 'Formato de JSON no reconocido. Debe ser un array de centros poblados o un objeto con grupos.'
    };
  }

  const result = normalizeJSON(json);
  
  if (result.ccppList.length === 0) {
    return {
      valid: false,
      error: 'El JSON no contiene centros poblados válidos.'
    };
  }

  // Validar que los CCPP tengan campos mínimos
  const invalidCCPP = result.ccppList.filter(c => !c.nombre && !c.codigo);
  if (invalidCCPP.length > 0) {
    return {
      valid: false,
      error: `Se encontraron ${invalidCCPP.length} centros poblados sin nombre ni código.`
    };
  }

  return { valid: true };
}

/**
 * Cuenta estadísticas del JSON procesado
 */
export function getJSONStats(result: NormalizedJSONResult): {
  totalCCPP: number;
  totalGroups: number;
  totalPoblacion: number;
  format: JSONFormat;
} {
  return {
    totalCCPP: result.ccppList.length,
    totalGroups: result.groups.length,
    totalPoblacion: result.ccppList.reduce((sum, c) => sum + c.poblacion, 0),
    format: result.format
  };
}
