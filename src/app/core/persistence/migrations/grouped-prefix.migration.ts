import {
  FieldEntry,
  FieldState,
  ProjectState,
  TableEntry,
  TableState,
  generateFieldKey,
  generateTableKey,
  parseFieldKey,
} from '../../state/project-state.model';

import { getPrefixableFieldsForSection } from './grouped-fields.registry';

export interface MigrationResult {
  readonly state: ProjectState;
  readonly changed: boolean;
  readonly notes: string[];
}

function tieneContenidoReal(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;

  if (typeof valor === 'string') {
    const s = valor.trim();
    return s !== '' && s !== '____' && s !== 'null';
  }

  if (typeof valor === 'number') return true;
  if (typeof valor === 'boolean') return true;

  if (Array.isArray(valor)) {
    if (valor.length === 0) return false;
    return valor.some(v => tieneContenidoReal(v));
  }

  if (typeof valor === 'object') {
    const o = valor as Record<string, unknown>;
    if (Object.keys(o).length === 0) return false;
    return Object.values(o).some(v => tieneContenidoReal(v));
  }

  return true;
}

function getGroupSuffixFromSectionId(sectionId: string): string {
  const m = sectionId.match(/^3\.1\.4\.([A-Z])\.(\d+)(\.|$)/);
  if (m) return `_${m[1]}${m[2]}`;

  const simple = sectionId.match(/^3\.1\.4\.([A-Z])(\.|$)/);
  if (simple) return `_${simple[1]}1`;

  return '';
}

function getSectionNumberFromSectionId(sectionId: string): number | null {
  // AISD: 3.1.4.A.{grupo}.{subseccion}  -> sección = 4 + subseccion (5..20)
  const a = sectionId.match(/^3\.1\.4\.A\.(\d+)\.(\d+)$/);
  if (a) {
    const sub = Number(a[2]);
    if (Number.isFinite(sub) && sub >= 1 && sub <= 16) return 4 + sub;
  }

  // AISI: 3.1.4.B.{grupo}.{subseccion} -> sección = 21 + subseccion (22..36)
  const b = sectionId.match(/^3\.1\.4\.B\.(\d+)\.(\d+)$/);
  if (b) {
    const sub = Number(b[2]);
    if (Number.isFinite(sub) && sub >= 1 && sub <= 15) return 21 + sub;
  }

  // AISI intro: 3.1.4.B o 3.1.4.B.{grupo} -> sección 21
  const bIntro = sectionId.match(/^3\.1\.4\.B(?:\.(\d+))?$/);
  if (bIntro) return 21;

  return null;
}

function isGroupedTargetSection(sectionNumber: number): boolean {
  return (sectionNumber >= 5 && sectionNumber <= 20) || (sectionNumber >= 21 && sectionNumber <= 36);
}

function getFieldEntry(state: ProjectState, sectionId: string, fieldName: string): FieldEntry | undefined {
  const key = generateFieldKey(sectionId, null, fieldName);
  return state.fields.byKey[key];
}

function upsertFieldEntry(
  fields: ProjectState['fields'],
  sectionId: string,
  fieldName: string,
  value: unknown,
  baseState?: FieldState
): ProjectState['fields'] {
  const key = generateFieldKey(sectionId, null, fieldName);

  const now = Date.now();
  const stateToUse: FieldState = baseState
    ? { ...baseState, value: value as any, lastModified: now }
    : {
        value: value as any,
        touched: false,
        dirty: false,
        autoloaded: true,
        source: 'computed',
        lastModified: now,
      };

  const entry: FieldEntry = {
    sectionId,
    groupId: null,
    fieldName,
    state: stateToUse,
  };

  const byKey = { ...fields.byKey, [key]: entry };
  const allKeys = fields.allKeys.includes(key) ? fields.allKeys : [...fields.allKeys, key];

  return { ...fields, byKey, allKeys };
}

function parseTableKey(key: string): { sectionId: string; groupId: string | null; tableKey: string } {
  const parts = key.split('::');
  if (parts.length === 3) {
    return { sectionId: parts[0], groupId: parts[1], tableKey: parts[2] };
  }
  return { sectionId: parts[0], groupId: null, tableKey: parts[1] };
}

function getTableEntry(state: ProjectState, sectionId: string, tableKey: string): TableEntry | undefined {
  const key = generateTableKey(sectionId, null, tableKey);
  return state.tables.byKey[key];
}

function upsertTableEntry(
  tables: ProjectState['tables'],
  sectionId: string,
  tableKey: string,
  state: TableState
): ProjectState['tables'] {
  const key = generateTableKey(sectionId, null, tableKey);
  const now = Date.now();
  const nextState: TableState = { ...state, lastModified: now };

  const entry: TableEntry = {
    sectionId,
    groupId: null,
    tableKey,
    state: nextState,
  };

  const byKey = { ...tables.byKey, [key]: entry };
  const allKeys = tables.allKeys.includes(key) ? tables.allKeys : [...tables.allKeys, key];
  return { ...tables, byKey, allKeys };
}

const GROUP_MARKER_REGEX = /_(A|B)\d+/;
const PHOTO_SERIES_REGEX = /^(fotografia\w*?)(\d+)(Titulo|Fuente|Imagen|Numero)$/;

function getPrefixedName(baseFieldName: string, groupSuffix: string): string {
  // Fotos (esquema canónico): sufijo de grupo al final. Ej: fotografiaDemografia1Titulo -> fotografiaDemografia1Titulo_A1
  const m = baseFieldName.match(PHOTO_SERIES_REGEX);
  if (m) {
    const prefix = m[1];
    const idx = m[2];
    const tail = m[3];
    return `${prefix}${idx}${tail}${groupSuffix}`;
  }

  // Default: sufijar al final. Ej: poblacionSexoAISD -> poblacionSexoAISD_A1
  return `${baseFieldName}${groupSuffix}`;
}

function collectSectionIds(state: ProjectState): string[] {
  const out = new Set<string>();

  for (const key of state.fields.allKeys) {
    const parsed = parseFieldKey(key);
    if (parsed.sectionId) out.add(parsed.sectionId);
  }

  for (const key of state.tables.allKeys) {
    const parsed = parseTableKey(key);
    if (parsed.sectionId) out.add(parsed.sectionId);
  }

  return [...out];
}

function getFallbackBaseFieldsFromState(state: ProjectState, sectionId: string): string[] {
  // Para secciones sin WATCHED_FIELDS (31–36 legacy), migrar solo lo que exista en el estado.
  const baseNames: string[] = [];
  const seen = new Set<string>();

  for (const key of state.fields.allKeys) {
    const parsed = parseFieldKey(key);
    if (parsed.sectionId !== sectionId) continue;
    if (parsed.groupId) continue;
    if (!parsed.fieldName) continue;
    if (GROUP_MARKER_REGEX.test(parsed.fieldName)) continue;
    if (seen.has(parsed.fieldName)) continue;
    const entry = state.fields.byKey[key];
    if (!tieneContenidoReal(entry?.state?.value)) continue;
    seen.add(parsed.fieldName);
    baseNames.push(parsed.fieldName);
  }

  return baseNames;
}

function getFallbackBaseTablesFromState(state: ProjectState, sectionId: string): string[] {
  const baseNames: string[] = [];
  const seen = new Set<string>();

  for (const key of state.tables.allKeys) {
    const parsed = parseTableKey(key);
    if (parsed.sectionId !== sectionId) continue;
    if (parsed.groupId) continue;
    if (!parsed.tableKey) continue;
    if (GROUP_MARKER_REGEX.test(parsed.tableKey)) continue;
    if (seen.has(parsed.tableKey)) continue;
    const entry = state.tables.byKey[key];
    if (!entry?.state?.rows || entry.state.rows.length === 0) continue;
    seen.add(parsed.tableKey);
    baseNames.push(parsed.tableKey);
  }

  return baseNames;
}

export function applyGroupedPrefixMigration(state: ProjectState): MigrationResult {
  const sectionIds = collectSectionIds(state);
  if (sectionIds.length === 0) return { state, changed: false, notes: [] };

  let nextState: ProjectState = state;
  let changed = false;
  const notes: string[] = [];
  let copies = 0;

  for (const sectionId of sectionIds) {
    const sectionNumber = getSectionNumberFromSectionId(sectionId);
    if (!sectionNumber || !isGroupedTargetSection(sectionNumber)) continue;

    const groupSuffix = getGroupSuffixFromSectionId(sectionId);
    if (!groupSuffix) continue;

    // Preferir registry; si no hay, fallback a lo que exista en el state (31–36 legacy)
    const registryBase = getPrefixableFieldsForSection(sectionNumber);
    const baseFields = registryBase.length > 0 ? registryBase : getFallbackBaseFieldsFromState(nextState, sectionId);
    const baseTables = registryBase.length > 0 ? registryBase : getFallbackBaseTablesFromState(nextState, sectionId);

    // 1) Campos
    for (const baseFieldName of baseFields) {
      if (!baseFieldName) continue;
      if (GROUP_MARKER_REGEX.test(baseFieldName)) continue;

      const legacy = getFieldEntry(nextState, sectionId, baseFieldName);
      if (!legacy || !tieneContenidoReal(legacy.state.value)) continue;

      const destName = getPrefixedName(baseFieldName, groupSuffix);
      const dest = getFieldEntry(nextState, sectionId, destName);
      if (dest && tieneContenidoReal(dest.state.value)) continue;

      const fields = upsertFieldEntry(nextState.fields, sectionId, destName, legacy.state.value, legacy.state);
      nextState = { ...nextState, fields };
      changed = true;
      copies++;
    }

    // 2) Tablas (si están en el store de tablas)
    for (const baseTableKey of baseTables) {
      if (!baseTableKey) continue;
      if (GROUP_MARKER_REGEX.test(baseTableKey)) continue;

      const legacy = getTableEntry(nextState, sectionId, baseTableKey);
      if (!legacy || !legacy.state.rows || legacy.state.rows.length === 0) continue;

      const destKey = getPrefixedName(baseTableKey, groupSuffix);
      const dest = getTableEntry(nextState, sectionId, destKey);
      if (dest && dest.state.rows && dest.state.rows.length > 0) continue;

      const tables = upsertTableEntry(nextState.tables, sectionId, destKey, legacy.state);
      nextState = { ...nextState, tables };
      changed = true;
      copies++;
    }
  }

  if (changed) {
    notes.push(`Migración grouped aplicada: ${copies} copias legacy→prefijo`);
  }

  return { state: nextState, changed, notes };
}
