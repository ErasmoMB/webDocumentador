/**
 * FIELDS REDUCER
 * 
 * Reducer puro para comandos de campos.
 * Maneja: SetField, SetFields, ClearField, ClearSectionFields, TouchField.
 * 
 * REGLAS:
 * - Función pura: (state, command) => newState
 * - Sin efectos secundarios
 * - Siempre retorna nuevo objeto (inmutabilidad)
 * - Claves únicas: sectionId::groupId::fieldName o sectionId::fieldName
 */

import { 
  FieldsState, 
  FieldEntry,
  FieldState,
  FieldValue,
  INITIAL_FIELDS_STATE,
  generateFieldKey 
} from '../project-state.model';
import { 
  FieldCommand,
  SetFieldCommand,
  SetFieldsCommand,
  ClearFieldCommand,
  ClearSectionFieldsCommand,
  TouchFieldCommand
} from '../commands.model';

/**
 * Genera un nuevo timestamp
 */
function now(): number {
  return Date.now();
}

/**
 * Crea un nuevo estado de campo
 */
function createFieldState(
  value: FieldValue,
  source: 'user' | 'api' | 'default' | 'computed'
): FieldState {
  return {
    value,
    touched: source === 'user',
    dirty: source === 'user',
    autoloaded: source === 'api',
    source,
    lastModified: now()
  };
}

/**
 * Crea una entrada de campo completa
 */
function createFieldEntry(
  sectionId: string,
  groupId: string | null,
  fieldName: string,
  value: FieldValue,
  source: 'user' | 'api' | 'default' | 'computed'
): FieldEntry {
  return {
    sectionId,
    groupId,
    fieldName,
    state: createFieldState(value, source)
  };
}

/**
 * Reducer para SetField
 */
function handleSetField(
  state: FieldsState, 
  command: SetFieldCommand
): FieldsState {
  const { sectionId, groupId, fieldName, value, source } = command.payload;
  const key = generateFieldKey(sectionId, groupId, fieldName);
  
  const existingEntry = state.byKey[key];
  
  // Si el valor es el mismo, no crear nuevo objeto
  if (existingEntry && existingEntry.state.value === value) {
    return state;
  }

  const newEntry = createFieldEntry(sectionId, groupId, fieldName, value, source);
  const newAllKeys = state.allKeys.includes(key) 
    ? state.allKeys 
    : [...state.allKeys, key];

  return {
    ...state,
    byKey: {
      ...state.byKey,
      [key]: newEntry
    },
    allKeys: newAllKeys
  };
}

/**
 * Reducer para SetFields (múltiples campos)
 */
function handleSetFields(
  state: FieldsState, 
  command: SetFieldsCommand
): FieldsState {
  const { sectionId, groupId, fields } = command.payload;
  
  if (fields.length === 0) {
    return state; // No hay campos que actualizar
  }

  const newByKey = { ...state.byKey };
  const keysToAdd: string[] = [];

  for (const field of fields) {
    const key = generateFieldKey(sectionId, groupId, field.fieldName);
    const existingEntry = state.byKey[key];
    const prevVal = existingEntry?.state?.value;
    const nextVal = field.value;
    const valueChanged = prevVal !== nextVal && (
      typeof nextVal !== 'object' || nextVal === null
        ? true
        : JSON.stringify(prevVal) !== JSON.stringify(nextVal)
    );
    if (!existingEntry || valueChanged) {
      newByKey[key] = createFieldEntry(
        sectionId, 
        groupId, 
        field.fieldName, 
        field.value, 
        field.source
      );
      
      if (!state.allKeys.includes(key)) {
        keysToAdd.push(key);
      }
    }
  }

  // Si no hubo cambios, retornar estado original
  if (keysToAdd.length === 0 && Object.keys(newByKey).length === Object.keys(state.byKey).length) {
    let hasChanges = false;
    for (const key of Object.keys(newByKey)) {
      if (newByKey[key] !== state.byKey[key]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) {
      return state;
    }
  }

  return {
    ...state,
    byKey: newByKey,
    allKeys: keysToAdd.length > 0 ? [...state.allKeys, ...keysToAdd] : state.allKeys
  };
}

/**
 * Reducer para ClearField
 */
function handleClearField(
  state: FieldsState, 
  command: ClearFieldCommand
): FieldsState {
  const { sectionId, groupId, fieldName } = command.payload;
  const key = generateFieldKey(sectionId, groupId, fieldName);
  
  if (!state.byKey[key]) {
    return state; // Campo no existe
  }

  const { [key]: removed, ...remainingByKey } = state.byKey;

  return {
    ...state,
    byKey: remainingByKey,
    allKeys: state.allKeys.filter(k => k !== key)
  };
}

/**
 * Reducer para ClearSectionFields
 */
function handleClearSectionFields(
  state: FieldsState, 
  command: ClearSectionFieldsCommand
): FieldsState {
  const { sectionId, groupId } = command.payload;
  
  // Prefijo para filtrar campos
  const prefix = groupId 
    ? `${sectionId}::${groupId}::` 
    : `${sectionId}::`;

  // Encontrar claves a eliminar
  const keysToRemove = state.allKeys.filter(key => key.startsWith(prefix));
  
  if (keysToRemove.length === 0) {
    return state; // No hay campos que eliminar
  }

  const newByKey = { ...state.byKey };
  for (const key of keysToRemove) {
    delete newByKey[key];
  }

  return {
    ...state,
    byKey: newByKey,
    allKeys: state.allKeys.filter(key => !key.startsWith(prefix))
  };
}

/**
 * Reducer para TouchField
 */
function handleTouchField(
  state: FieldsState, 
  command: TouchFieldCommand
): FieldsState {
  const { sectionId, groupId, fieldName } = command.payload;
  const key = generateFieldKey(sectionId, groupId, fieldName);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state; // Campo no existe
  }

  if (existingEntry.state.touched) {
    return state; // Ya está touched
  }

  return {
    ...state,
    byKey: {
      ...state.byKey,
      [key]: {
        ...existingEntry,
        state: {
          ...existingEntry.state,
          touched: true,
          lastModified: now()
        }
      }
    }
  };
}

/**
 * FIELDS REDUCER PRINCIPAL
 * 
 * @param state - Estado actual de campos
 * @param command - Comando a ejecutar
 * @returns Nuevo estado de campos
 */
export function fieldsReducer(
  state: FieldsState = INITIAL_FIELDS_STATE,
  command: FieldCommand
): FieldsState {
  switch (command.type) {
    case 'field/set':
      return handleSetField(state, command);
    
    case 'field/setMultiple':
      return handleSetFields(state, command);
    
    case 'field/clear':
      return handleClearField(state, command);
    
    case 'field/clearSection':
      return handleClearSectionFields(state, command);
    
    case 'field/touch':
      return handleTouchField(state, command);
    
    default:
      return state;
  }
}

/**
 * Obtiene todos los campos de una sección
 */
export function getFieldsBySection(
  state: FieldsState, 
  sectionId: string,
  groupId: string | null = null
): FieldEntry[] {
  const prefix = groupId 
    ? `${sectionId}::${groupId}::` 
    : `${sectionId}::`;
  
  return state.allKeys
    .filter(key => key.startsWith(prefix))
    .map(key => state.byKey[key]);
}

/**
 * Obtiene el valor de un campo específico
 */
export function getFieldValue(
  state: FieldsState,
  sectionId: string,
  groupId: string | null,
  fieldName: string
): FieldValue | undefined {
  const key = generateFieldKey(sectionId, groupId, fieldName);
  return state.byKey[key]?.state.value;
}

/**
 * Verifica si un campo ha sido modificado por el usuario
 */
export function isFieldDirty(
  state: FieldsState,
  sectionId: string,
  groupId: string | null,
  fieldName: string
): boolean {
  const key = generateFieldKey(sectionId, groupId, fieldName);
  return state.byKey[key]?.state.dirty ?? false;
}

/**
 * Cuenta los campos dirty en una sección
 */
export function countDirtyFields(
  state: FieldsState,
  sectionId: string,
  groupId: string | null = null
): number {
  const fields = getFieldsBySection(state, sectionId, groupId);
  return fields.filter(f => f.state.dirty).length;
}
