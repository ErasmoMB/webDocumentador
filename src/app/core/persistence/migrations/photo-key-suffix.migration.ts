import {
  FieldEntry,
  FieldState,
  ProjectState,
  generateFieldKey,
  parseFieldKey,
} from '../../state/project-state.model';

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

const PHOTO_PROP_REGEX = /(Imagen|Titulo|Fuente|Numero)$/;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildTargetNameFromInserted(fieldName: string, groupSuffix: string): string | null {
  if (!groupSuffix) return null;
  if (fieldName.endsWith(groupSuffix)) return null;
  if (!PHOTO_PROP_REGEX.test(fieldName)) return null;

  const gs = escapeRegExp(groupSuffix);

  // Caso 1: serie con índice: fotografiaX_A11Imagen -> fotografiaX1Imagen_A1
  const withIndex = fieldName.match(new RegExp(`^(.*)${gs}(\\d+)(Imagen|Titulo|Fuente|Numero)$`));
  if (withIndex) {
    const basePrefix = withIndex[1];
    const idx = withIndex[2];
    const prop = withIndex[3];
    return `${basePrefix}${idx}${prop}${groupSuffix}`;
  }

  // Caso 2: base sin índice: fotografiaX_A1Imagen -> fotografiaXImagen_A1
  const baseOnly = fieldName.match(new RegExp(`^(.*)${gs}(Imagen|Titulo|Fuente|Numero)$`));
  if (baseOnly) {
    const basePrefix = baseOnly[1];
    const prop = baseOnly[2];
    return `${basePrefix}${prop}${groupSuffix}`;
  }

  return null;
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

export function applyPhotoKeySuffixMigration(state: ProjectState): MigrationResult {
  const allKeys = state.fields.allKeys;
  if (!allKeys || allKeys.length === 0) return { state, changed: false, notes: [] };

  let nextFields = state.fields;
  let changed = false;
  const notes: string[] = [];

  // Trabajamos sobre un snapshot para evitar problemas al editar mientras iteramos
  for (const key of [...allKeys]) {
    const parsed = parseFieldKey(key);
    if (!parsed.sectionId || parsed.groupId) continue;
    if (!parsed.fieldName) continue;

    const groupSuffix = getGroupSuffixFromSectionId(parsed.sectionId);
    if (!groupSuffix) continue;

    const targetName = buildTargetNameFromInserted(parsed.fieldName, groupSuffix);
    if (!targetName || targetName === parsed.fieldName) continue;

    const srcEntry = nextFields.byKey[key];
    if (!srcEntry) continue;

    const srcValue = srcEntry.state?.value;

    const targetKey = generateFieldKey(parsed.sectionId, null, targetName);
    const dstEntry = nextFields.byKey[targetKey];
    const dstValue = dstEntry?.state?.value;

    const srcHas = tieneContenidoReal(srcValue);
    const dstHas = tieneContenidoReal(dstValue);

    // Si el destino ya tiene contenido, igual limpiamos la clave antigua.
    if (!dstHas && srcHas) {
      nextFields = upsertFieldEntry(nextFields, parsed.sectionId, targetName, srcValue, srcEntry.state);
      changed = true;
      notes.push(`${parsed.sectionId}: ${parsed.fieldName} → ${targetName}`);
    }

    // Borrar la clave antigua (inserted) para dejar el estado limpio.
    if (nextFields.byKey[key]) {
      const { [key]: _removed, ...rest } = nextFields.byKey;
      nextFields = {
        ...nextFields,
        byKey: rest,
        allKeys: nextFields.allKeys.filter(k => k !== key),
      };
      changed = true;
    }
  }

  if (!changed) return { state, changed: false, notes: [] };
  return { state: { ...state, fields: nextFields }, changed: true, notes };
}
