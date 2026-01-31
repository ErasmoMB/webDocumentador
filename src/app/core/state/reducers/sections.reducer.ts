/**
 * SECTIONS REDUCER
 * 
 * Reducer puro para comandos de secciones.
 * Maneja: Initialize, SetActive, MarkComplete, Reset, AssignToGroup.
 * 
 * REGLAS:
 * - Función pura: (state, command) => newState
 * - Sin efectos secundarios
 * - Siempre retorna nuevo objeto (inmutabilidad)
 */

import { 
  SectionsState, 
  SectionState,
  INITIAL_SECTIONS_STATE 
} from '../project-state.model';
import { 
  SectionCommand,
  InitializeSectionCommand,
  SetActiveSectionCommand,
  MarkSectionCompleteCommand,
  ResetSectionCommand,
  AssignSectionToGroupCommand
} from '../commands.model';
import { GroupType } from '../../models/section-config.model';

/**
 * Genera un nuevo timestamp
 */
function now(): number {
  return Date.now();
}

/**
 * Crea una nueva sección con valores por defecto
 */
function createSectionState(
  id: string,
  groupType: GroupType,
  groupId: string | null
): SectionState {
  return {
    id,
    isInitialized: true,
    isComplete: false,
    groupId,
    groupType,
    lastModified: now()
  };
}

/**
 * Reducer para InitializeSection
 */
function handleInitializeSection(
  state: SectionsState, 
  command: InitializeSectionCommand
): SectionsState {
  const { sectionId, groupType, groupId } = command.payload;
  
  // Si ya existe y está inicializada, solo actualizar timestamps
  if (state.byId[sectionId]?.isInitialized) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [sectionId]: {
          ...state.byId[sectionId],
          lastModified: now()
        }
      }
    };
  }

  const newSection = createSectionState(sectionId, groupType, groupId);
  const newAllIds = state.allIds.includes(sectionId) 
    ? state.allIds 
    : [...state.allIds, sectionId];

  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: newSection
    },
    allIds: newAllIds
  };
}

/**
 * Reducer para SetActiveSection
 */
function handleSetActiveSection(
  state: SectionsState, 
  command: SetActiveSectionCommand
): SectionsState {
  const { sectionId } = command.payload;
  
  if (state.activeSectionId === sectionId) {
    return state; // No change
  }

  return {
    ...state,
    activeSectionId: sectionId
  };
}

/**
 * Reducer para MarkSectionComplete
 */
function handleMarkSectionComplete(
  state: SectionsState, 
  command: MarkSectionCompleteCommand
): SectionsState {
  const { sectionId, isComplete } = command.payload;
  const section = state.byId[sectionId];
  
  if (!section) {
    return state; // Sección no existe
  }

  if (section.isComplete === isComplete) {
    return state; // No change
  }

  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: {
        ...section,
        isComplete,
        lastModified: now()
      }
    }
  };
}

/**
 * Reducer para ResetSection
 */
function handleResetSection(
  state: SectionsState, 
  command: ResetSectionCommand
): SectionsState {
  const { sectionId, preserveStructure } = command.payload;
  const section = state.byId[sectionId];
  
  if (!section) {
    return state; // Sección no existe
  }

  if (preserveStructure) {
    // Mantener estructura pero resetear estado
    return {
      ...state,
      byId: {
        ...state.byId,
        [sectionId]: {
          ...section,
          isComplete: false,
          lastModified: now()
        }
      }
    };
  }

  // Reset completo - remover sección
  const { [sectionId]: removed, ...remainingById } = state.byId;
  return {
    ...state,
    byId: remainingById,
    allIds: state.allIds.filter(id => id !== sectionId),
    activeSectionId: state.activeSectionId === sectionId ? null : state.activeSectionId
  };
}

/**
 * Reducer para AssignSectionToGroup
 */
function handleAssignSectionToGroup(
  state: SectionsState, 
  command: AssignSectionToGroupCommand
): SectionsState {
  const { sectionId, groupId } = command.payload;
  const section = state.byId[sectionId];
  
  if (!section) {
    return state; // Sección no existe
  }

  if (section.groupId === groupId) {
    return state; // No change
  }

  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: {
        ...section,
        groupId,
        lastModified: now()
      }
    }
  };
}

/**
 * SECTIONS REDUCER PRINCIPAL
 * 
 * @param state - Estado actual de secciones
 * @param command - Comando a ejecutar
 * @returns Nuevo estado de secciones
 */
export function sectionsReducer(
  state: SectionsState = INITIAL_SECTIONS_STATE,
  command: SectionCommand
): SectionsState {
  switch (command.type) {
    case 'section/initialize':
      return handleInitializeSection(state, command);
    
    case 'section/setActive':
      return handleSetActiveSection(state, command);
    
    case 'section/markComplete':
      return handleMarkSectionComplete(state, command);
    
    case 'section/reset':
      return handleResetSection(state, command);
    
    case 'section/assignToGroup':
      return handleAssignSectionToGroup(state, command);
    
    default:
      return state;
  }
}

/**
 * Obtiene todas las secciones de un grupo específico
 */
export function getSectionsByGroup(
  state: SectionsState, 
  groupId: string
): SectionState[] {
  return state.allIds
    .map(id => state.byId[id])
    .filter(section => section.groupId === groupId);
}

/**
 * Obtiene todas las secciones de un tipo de grupo
 */
export function getSectionsByGroupType(
  state: SectionsState, 
  groupType: GroupType
): SectionState[] {
  return state.allIds
    .map(id => state.byId[id])
    .filter(section => section.groupType === groupType);
}

/**
 * Verifica si todas las secciones de un grupo están completas
 */
export function isGroupComplete(
  state: SectionsState, 
  groupId: string
): boolean {
  const sections = getSectionsByGroup(state, groupId);
  return sections.length > 0 && sections.every(s => s.isComplete);
}
