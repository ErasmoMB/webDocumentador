import { ProjectState, generateFieldKey, FieldEntry, FieldState } from '../../state/project-state.model';

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

function maybeCopyLegacyToPrefixed(
  state: ProjectState,
  sectionId: string,
  legacyField: string,
  targetField: string,
  notes: string[]
): { fields: ProjectState['fields']; changed: boolean } {
  const legacyEntry = getFieldEntry(state, sectionId, legacyField);
  const targetEntry = getFieldEntry(state, sectionId, targetField);

  const legacyValue = legacyEntry?.state?.value;
  const targetValue = targetEntry?.state?.value;

  const legacyHas = tieneContenidoReal(legacyValue);
  const targetHas = tieneContenidoReal(targetValue);

  if (!legacyHas || targetHas) {
    return { fields: state.fields, changed: false };
  }

  const nextFields = upsertFieldEntry(
    state.fields,
    sectionId,
    targetField,
    legacyValue,
    legacyEntry?.state
  );

  notes.push(`${sectionId}: ${legacyField} → ${targetField}`);
  return { fields: nextFields, changed: true };
}

export function applySection4PrefixMigration(state: ProjectState): MigrationResult {
  // Solo migramos las secciones “intro” de AISD: 3.1.4.A.{g}
  const sectionIds = Object.keys(state.sections.byId || {}).filter(id => /^3\.1\.4\.A\.(\d+)$/.test(id));

  if (sectionIds.length === 0) {
    return { state, changed: false, notes: [] };
  }

  let fields = state.fields;
  let changed = false;
  const notes: string[] = [];

  for (const sectionId of sectionIds) {
    const groupSuffix = getGroupSuffixFromSectionId(sectionId);
    if (!groupSuffix) continue;

    // Tablas (guardadas como arrays en fields)
    for (const base of ['tablaAISD1Datos', 'tablaAISD2Datos']) {
      const target = `${base}${groupSuffix}`;
      const r = maybeCopyLegacyToPrefixed({ ...state, fields }, sectionId, base, target, notes);
      if (r.changed) {
        fields = r.fields;
        changed = true;
      }
    }

    // Párrafos + títulos/fuentes
    const plainFields = [
      'parrafoSeccion4_introduccion_aisd',
      'parrafoSeccion4_comunidad_completo',
      'parrafoSeccion4_caracterizacion_indicadores',
      'cuadroTituloAISD1',
      'cuadroFuenteAISD1',
      'cuadroTituloAISD2',
      'cuadroFuenteAISD2',
    ];

    for (const base of plainFields) {
      const target = `${base}${groupSuffix}`;
      const r = maybeCopyLegacyToPrefixed({ ...state, fields }, sectionId, base, target, notes);
      if (r.changed) {
        fields = r.fields;
        changed = true;
      }
    }

    // Fotos Sección 4 (esquema canónico estilo ImageStorageService):
    // legacy: fotografiaUbicacionReferencial1Imagen
    // new:    fotografiaUbicacionReferencial1Imagen_A1
    const photoBases = ['fotografiaUbicacionReferencial', 'fotografiaPoblacionViviendas'];
    const photoProps = ['Imagen', 'Titulo', 'Fuente', 'Numero'];

    for (const basePrefix of photoBases) {
      // Con slot (1..10)
      for (let i = 1; i <= 10; i++) {
        for (const prop of photoProps) {
          const legacyKey = `${basePrefix}${i}${prop}`;
          const targetKey = `${basePrefix}${i}${prop}${groupSuffix}`;
          const r = maybeCopyLegacyToPrefixed({ ...state, fields }, sectionId, legacyKey, targetKey, notes);
          if (r.changed) {
            fields = r.fields;
            changed = true;
          }
        }
      }

      // Base (sin número)
      for (const prop of photoProps) {
        const legacyKey = `${basePrefix}${prop}`;
        const targetKey = `${basePrefix}${prop}${groupSuffix}`;
        const r = maybeCopyLegacyToPrefixed({ ...state, fields }, sectionId, legacyKey, targetKey, notes);
        if (r.changed) {
          fields = r.fields;
          changed = true;
        }
      }
    }
  }

  if (!changed) {
    return { state, changed: false, notes: [] };
  }

  return { state: { ...state, fields }, changed: true, notes };
}
