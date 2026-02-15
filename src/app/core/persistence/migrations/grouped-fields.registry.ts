export type GroupedFieldsRegistryEntry = {
  sectionNumber: number;
  watchedFields: readonly string[];
  /**
   * Campos que explícitamente NO deben prefijarse (compartidos entre grupos)
   * aunque estén en watchedFields.
   */
  sharedFields?: readonly string[];
  /**
   * Nota operativa para secciones que no siguen el patrón estándar.
   * (Ej: secciones legacy sin constants/watchedFields)
   */
  note?: string;
};

// ========= Imports (WATCHED_FIELDS) =========
// AISD 5–18 (prefijado A#)
import { SECCION5_WATCHED_FIELDS } from 'src/app/shared/components/seccion5/seccion5-constants';
import { SECCION6_WATCHED_FIELDS } from 'src/app/shared/components/seccion6/seccion6-constants';
import { SECCION7_WATCHED_FIELDS } from 'src/app/shared/components/seccion7/seccion7-constants';
import { SECCION8_WATCHED_FIELDS } from 'src/app/shared/components/seccion8/seccion8-constants';
import { SECCION9_WATCHED_FIELDS } from 'src/app/shared/components/seccion9/seccion9-constants';
import { SECCION10_WATCHED_FIELDS } from 'src/app/shared/components/seccion10/seccion10-constants';
import { SECCION11_WATCHED_FIELDS } from 'src/app/shared/components/seccion11/seccion11-constants';
import { SECCION12_WATCHED_FIELDS } from 'src/app/shared/components/seccion12/seccion12-constants';
import { SECCION13_WATCHED_FIELDS } from 'src/app/shared/components/seccion13/seccion13-constants';
import { SECCION14_WATCHED_FIELDS } from 'src/app/shared/components/seccion14/seccion14-constants';
import { SECCION15_WATCHED_FIELDS } from 'src/app/shared/components/seccion15/seccion15-constants';
import { SECCION16_WATCHED_FIELDS } from 'src/app/shared/components/seccion16/seccion16-constants';
import { SECCION17_WATCHED_FIELDS } from 'src/app/shared/components/seccion17/seccion17-constants';
import { SECCION18_WATCHED_FIELDS } from 'src/app/shared/components/seccion18/seccion18-constants';

// AISD 19–20 (19 grouped, 20 NO grouped)
import { SECCION19_WATCHED_FIELDS } from 'src/app/shared/components/seccion19/seccion19.constants';
import { SECCION20_WATCHED_FIELDS } from 'src/app/shared/components/seccion20/seccion20.constants';

// AISI 21–30 (prefijado B#)
import { SECCION21_WATCHED_FIELDS } from 'src/app/shared/components/seccion21/seccion21-constants';
import { SECCION22_WATCHED_FIELDS } from 'src/app/shared/components/seccion22/seccion22-constants';
import { SECCION23_WATCHED_FIELDS } from 'src/app/shared/components/seccion23/seccion23-constants';
import { SECCION24_WATCHED_FIELDS } from 'src/app/shared/components/seccion24/seccion24-constants';
import { SECCION25_WATCHED_FIELDS } from 'src/app/shared/components/seccion25/seccion25-constants';
import { SECCION26_WATCHED_FIELDS } from 'src/app/shared/components/seccion26/seccion26-constants';
import { SECCION27_WATCHED_FIELDS } from 'src/app/shared/components/seccion27/seccion27-constants';
import { SECCION28_WATCHED_FIELDS } from 'src/app/shared/components/seccion28/seccion28-constants';
import { SECCION29_WATCHED_FIELDS } from 'src/app/shared/components/seccion29/seccion29-constants';
import { SECCION30_WATCHED_FIELDS } from 'src/app/shared/components/seccion30/seccion30-constants';

// ========= Registry =========

/**
 * Registry canónico para migraciones de aislamiento por prefijo (grouped).
 *
 * - `watchedFields`: fuente “bruta” (tal cual la sección los observa / persiste).
 * - `getBaseFieldsForSection(...)`: normaliza a campos legacy/base (sin `_A1/_B2` en el nombre).
 * - `getPrefixableFieldsForSection(...)`: baseFields menos sharedFields.
 */
export const GROUPED_FIELDS_REGISTRY: Record<number, GroupedFieldsRegistryEntry> = {
  // ===== AISD (5–20) =====
  5: { sectionNumber: 5, watchedFields: SECCION5_WATCHED_FIELDS },
  6: { sectionNumber: 6, watchedFields: SECCION6_WATCHED_FIELDS },
  7: { sectionNumber: 7, watchedFields: SECCION7_WATCHED_FIELDS },
  8: { sectionNumber: 8, watchedFields: SECCION8_WATCHED_FIELDS },
  9: { sectionNumber: 9, watchedFields: SECCION9_WATCHED_FIELDS },
  10: { sectionNumber: 10, watchedFields: SECCION10_WATCHED_FIELDS },
  11: { sectionNumber: 11, watchedFields: SECCION11_WATCHED_FIELDS },
  12: { sectionNumber: 12, watchedFields: SECCION12_WATCHED_FIELDS },
  13: { sectionNumber: 13, watchedFields: SECCION13_WATCHED_FIELDS },
  14: { sectionNumber: 14, watchedFields: SECCION14_WATCHED_FIELDS },
  15: { sectionNumber: 15, watchedFields: SECCION15_WATCHED_FIELDS },
  16: { sectionNumber: 16, watchedFields: SECCION16_WATCHED_FIELDS },
  17: { sectionNumber: 17, watchedFields: SECCION17_WATCHED_FIELDS },
  18: { sectionNumber: 18, watchedFields: SECCION18_WATCHED_FIELDS },
  19: { sectionNumber: 19, watchedFields: SECCION19_WATCHED_FIELDS },
  20: {
    sectionNumber: 20,
    watchedFields: SECCION20_WATCHED_FIELDS,
    note: 'Sección 20 se usa como grouped vía IDs 3.1.4.A.{grupo}.16 (aunque su constants tenga otro sectionId).',
  },

  // ===== AISI (21–36) =====
  21: {
    sectionNumber: 21,
    watchedFields: SECCION21_WATCHED_FIELDS,
    sharedFields: ['centroPobladoAISI', 'provinciaSeleccionada', 'departamentoSeleccionado'],
  },
  22: {
    sectionNumber: 22,
    watchedFields: SECCION22_WATCHED_FIELDS,
    sharedFields: ['centroPobladoAISI'],
  },
  23: { sectionNumber: 23, watchedFields: SECCION23_WATCHED_FIELDS },
  24: { sectionNumber: 24, watchedFields: SECCION24_WATCHED_FIELDS },
  25: { sectionNumber: 25, watchedFields: SECCION25_WATCHED_FIELDS },
  26: { sectionNumber: 26, watchedFields: SECCION26_WATCHED_FIELDS },
  27: { sectionNumber: 27, watchedFields: SECCION27_WATCHED_FIELDS },
  28: { sectionNumber: 28, watchedFields: SECCION28_WATCHED_FIELDS },
  29: { sectionNumber: 29, watchedFields: SECCION29_WATCHED_FIELDS },
  30: { sectionNumber: 30, watchedFields: SECCION30_WATCHED_FIELDS },

  // 31–36: no hay *-constants con WATCHED_FIELDS (componentes legacy)
  31: { sectionNumber: 31, watchedFields: [], note: 'No hay constants/watchers: componente legacy (ProjectStateFacade + PrefijoHelper).' },
  32: { sectionNumber: 32, watchedFields: [], note: 'No hay constants/watchers: componente legacy (ProjectStateFacade + PrefijoHelper).' },
  33: { sectionNumber: 33, watchedFields: [], note: 'No hay constants/watchers: componente legacy (ProjectStateFacade + PrefijoHelper).' },
  34: { sectionNumber: 34, watchedFields: [], note: 'No hay constants/watchers: componente legacy (ProjectStateFacade + PrefijoHelper).' },
  35: { sectionNumber: 35, watchedFields: [], note: 'No hay constants/watchers: componente legacy (ProjectStateFacade + PrefijoHelper).' },
  36: { sectionNumber: 36, watchedFields: [], note: 'No hay constants/watchers: componente legacy (ProjectStateFacade + PrefijoHelper).' },
};

const GROUP_MARKER_REGEX = /_(A|B)\d+/;

function dedupePreserveOrder(items: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

/**
 * Devuelve los campos “base/legacy” de una sección.
 * - Quita variantes que ya incluyen marcador de grupo en el nombre (ej: `_A1`, `_B2`).
 * - Mantiene fotos/tablas/párrafos base (sin marcador) tal cual.
 */
export function getBaseFieldsForSection(sectionNumber: number): string[] {
  const entry = GROUPED_FIELDS_REGISTRY[sectionNumber];
  if (!entry) return [];
  return dedupePreserveOrder(entry.watchedFields.filter((f) => !GROUP_MARKER_REGEX.test(f)));
}

/**
 * Campos base que SÍ deberían migrarse a su versión prefijada.
 */
export function getPrefixableFieldsForSection(sectionNumber: number): string[] {
  const entry = GROUPED_FIELDS_REGISTRY[sectionNumber];
  if (!entry) return [];
  const base = getBaseFieldsForSection(sectionNumber);
  const shared = new Set(entry.sharedFields ?? []);
  return base.filter((f) => !shared.has(f));
}
