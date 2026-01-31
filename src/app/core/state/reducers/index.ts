/**
 * ROOT REDUCER
 * 
 * Reducer principal que combina todos los reducers de dominio.
 * Maneja BatchCommand y delega comandos específicos a sus reducers.
 * 
 * REGLAS:
 * - Función pura: (state, command) => newState
 * - Sin efectos secundarios
 * - Siempre retorna nuevo objeto (inmutabilidad)
 * - BatchCommand ejecuta comandos en secuencia
 */

import { 
  ProjectState, 
  INITIAL_PROJECT_STATE 
} from '../project-state.model';
import { 
  ProjectStateCommand,
  BatchCommand,
  isMetadataCommand,
  isGroupConfigCommand,
  isSectionCommand,
  isFieldCommand,
  isTableCommand,
  isImageCommand,
  isProjectCommand,
  isBatchCommand
} from '../commands.model';
import { metadataReducer } from './metadata.reducer';
import { projectReducer, markStateDirty } from './project.reducer';
import { sectionsReducer } from './sections.reducer';
import { fieldsReducer } from './fields.reducer';
import { tablesReducer } from './tables.reducer';
import { imagesReducer } from './images.reducer';
import { groupConfigReducer, ccppRegistryReducer } from './groups.reducer';

/**
 * Aplica un comando individual al estado
 */
function applyCommand(
  state: ProjectState, 
  command: ProjectStateCommand
): ProjectState {
  // Comandos de proyecto (afectan múltiples slices)
  if (isProjectCommand(command)) {
    return projectReducer(state, command);
  }

  // Comandos de metadata
  if (isMetadataCommand(command)) {
    const newMetadata = metadataReducer(state.metadata, command);
    if (newMetadata === state.metadata) {
      return state;
    }
    return markStateDirty({
      ...state,
      metadata: newMetadata
    });
  }

  // Comandos de configuración de grupos
  if (isGroupConfigCommand(command)) {
    const newGroupConfig = groupConfigReducer(state.groupConfig, command);
    const newCcppRegistry = ccppRegistryReducer(state.ccppRegistry, command);
    
    if (newGroupConfig === state.groupConfig && newCcppRegistry === state.ccppRegistry) {
      return state;
    }
    
    return markStateDirty({
      ...state,
      groupConfig: newGroupConfig,
      ccppRegistry: newCcppRegistry
    });
  }

  // Comandos de secciones
  if (isSectionCommand(command)) {
    const newSections = sectionsReducer(state.sections, command);
    if (newSections === state.sections) {
      return state;
    }
    return markStateDirty({
      ...state,
      sections: newSections
    });
  }

  // Comandos de campos
  if (isFieldCommand(command)) {
    const newFields = fieldsReducer(state.fields, command);
    if (newFields === state.fields) {
      return state;
    }
    return markStateDirty({
      ...state,
      fields: newFields
    });
  }

  // Comandos de tablas
  if (isTableCommand(command)) {
    const newTables = tablesReducer(state.tables, command);
    if (newTables === state.tables) {
      return state;
    }
    return markStateDirty({
      ...state,
      tables: newTables
    });
  }

  // Comandos de imágenes
  if (isImageCommand(command)) {
    const newImages = imagesReducer(state.images, command);
    if (newImages === state.images) {
      return state;
    }
    return markStateDirty({
      ...state,
      images: newImages
    });
  }

  // Comando no reconocido - retornar estado sin cambios
  return state;
}

/**
 * Maneja BatchCommand ejecutando comandos en secuencia
 */
function handleBatchCommand(
  state: ProjectState, 
  command: BatchCommand
): ProjectState {
  const { commands } = command.payload;
  
  if (commands.length === 0) {
    return state;
  }

  // Ejecutar comandos en secuencia
  let currentState = state;
  for (const cmd of commands) {
    // No permitir batch anidados
    if (isBatchCommand(cmd)) {
      console.warn('Nested batch commands are not allowed');
      continue;
    }
    currentState = applyCommand(currentState, cmd);
  }

  return currentState;
}

/**
 * ROOT REDUCER PRINCIPAL
 * 
 * Punto de entrada para todos los comandos del sistema.
 * Delega a reducers específicos según el tipo de comando.
 * 
 * @param state - Estado actual del proyecto
 * @param command - Comando a ejecutar
 * @returns Nuevo estado del proyecto
 */
export function rootReducer(
  state: ProjectState = INITIAL_PROJECT_STATE,
  command: ProjectStateCommand
): ProjectState {
  // Manejo especial para BatchCommand
  if (isBatchCommand(command)) {
    return handleBatchCommand(state, command);
  }

  return applyCommand(state, command);
}

/**
 * Crea un estado inicial con timestamp actual
 */
export function createInitialState(): ProjectState {
  const timestamp = Date.now();
  return {
    ...INITIAL_PROJECT_STATE,
    metadata: {
      ...INITIAL_PROJECT_STATE.metadata,
      projectId: `project_${timestamp}`,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    _internal: {
      ...INITIAL_PROJECT_STATE._internal,
      loadedFrom: 'fresh'
    }
  };
}

/**
 * Verifica si el estado ha sido modificado
 */
export function isStateDirty(state: ProjectState): boolean {
  return state._internal.isDirty;
}

/**
 * Obtiene información de debug del estado
 */
export function getStateDebugInfo(state: ProjectState): {
  sectionsCount: number;
  fieldsCount: number;
  tablesCount: number;
  imagesCount: number;
  aiGroupsCount: number;
  isiGroupsCount: number;
  isDirty: boolean;
  loadedFrom: string | null;
} {
  return {
    sectionsCount: state.sections.allIds.length,
    fieldsCount: state.fields.allKeys.length,
    tablesCount: state.tables.allKeys.length,
    imagesCount: state.images.allIds.length,
    aiGroupsCount: state.groupConfig.aisd.length,
    isiGroupsCount: state.groupConfig.aisi.length,
    isDirty: state._internal.isDirty,
    loadedFrom: state._internal.loadedFrom
  };
}

// Re-exportar para conveniencia
export { metadataReducer } from './metadata.reducer';
export { projectReducer, globalRegistryReducer, markStateDirty } from './project.reducer';
export { sectionsReducer } from './sections.reducer';
export { fieldsReducer } from './fields.reducer';
export { tablesReducer } from './tables.reducer';
export { imagesReducer } from './images.reducer';
export { groupConfigReducer, ccppRegistryReducer } from './groups.reducer';
