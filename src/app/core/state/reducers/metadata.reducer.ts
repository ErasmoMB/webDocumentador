/**
 * METADATA REDUCER
 * 
 * Reducer puro para comandos de metadata del proyecto.
 * Maneja: projectName, consultora, detalleProyecto, timestamps.
 * 
 * REGLAS:
 * - Función pura: (state, command) => newState
 * - Sin efectos secundarios
 * - Siempre retorna nuevo objeto (inmutabilidad)
 */

import { 
  ProjectMetadata, 
  INITIAL_PROJECT_METADATA 
} from '../project-state.model';
import { 
  MetadataCommand,
  SetProjectNameCommand,
  SetConsultoraCommand,
  SetDetalleProyectoCommand,
  SetUbicacionGlobalCommand,
  UpdateMetadataCommand
} from '../commands.model';

/**
 * Genera un nuevo timestamp
 */
function now(): number {
  return Date.now();
}

/**
 * Reducer para SetProjectName
 */
function handleSetProjectName(
  state: ProjectMetadata, 
  command: SetProjectNameCommand
): ProjectMetadata {
  if (state.projectName === command.payload.projectName) {
    return state; // No change
  }
  return {
    ...state,
    projectName: command.payload.projectName,
    updatedAt: now()
  };
}

/**
 * Reducer para SetConsultora
 */
function handleSetConsultora(
  state: ProjectMetadata, 
  command: SetConsultoraCommand
): ProjectMetadata {
  if (state.consultora === command.payload.consultora) {
    return state; // No change
  }
  return {
    ...state,
    consultora: command.payload.consultora,
    updatedAt: now()
  };
}

/**
 * Reducer para SetDetalleProyecto
 */
function handleSetDetalleProyecto(
  state: ProjectMetadata, 
  command: SetDetalleProyectoCommand
): ProjectMetadata {
  if (state.detalleProyecto === command.payload.detalleProyecto) {
    return state; // No change
  }
  return {
    ...state,
    detalleProyecto: command.payload.detalleProyecto,
    updatedAt: now()
  };
}

/**
 * Reducer para UpdateMetadata (actualización parcial)
 */
function handleUpdateMetadata(
  state: ProjectMetadata, 
  command: UpdateMetadataCommand
): ProjectMetadata {
  const { projectName, consultora, detalleProyecto } = command.payload;
  
  // Verificar si hay cambios reales
  const hasChanges = 
    (projectName !== undefined && projectName !== state.projectName) ||
    (consultora !== undefined && consultora !== state.consultora) ||
    (detalleProyecto !== undefined && detalleProyecto !== state.detalleProyecto);
  
  if (!hasChanges) {
    return state; // No change
  }

  return {
    ...state,
    ...(projectName !== undefined && { projectName }),
    ...(consultora !== undefined && { consultora }),
    ...(detalleProyecto !== undefined && { detalleProyecto }),
    updatedAt: now()
  };
}

/**
 * METADATA REDUCER PRINCIPAL
 * 
 * @param state - Estado actual de metadata
 * @param command - Comando a ejecutar
 * @returns Nuevo estado de metadata
 */
export function metadataReducer(
  state: ProjectMetadata = INITIAL_PROJECT_METADATA,
  command: MetadataCommand
): ProjectMetadata {
  switch (command.type) {
    case 'metadata/setProjectName':
      return handleSetProjectName(state, command);
    
    case 'metadata/setConsultora':
      return handleSetConsultora(state, command);
    
    case 'metadata/setDetalleProyecto':
      return handleSetDetalleProyecto(state, command);
    
    // ✅ NUEVO: Guardar ubicación global
    case 'metadata/setUbicacionGlobal': {
      const ubCmd = command as SetUbicacionGlobalCommand;
      return {
        ...state,
        departamentoSeleccionado: ubCmd.payload.departamento,
        provinciaSeleccionada: ubCmd.payload.provincia,
        distritoSeleccionado: ubCmd.payload.distrito,
        updatedAt: now()
      };
    }
    
    case 'metadata/update':
      return handleUpdateMetadata(state, command);
    
    default:
      return state;
  }
}

/**
 * Crea un nuevo estado de metadata con valores iniciales y timestamp
 */
export function createInitialMetadata(projectId?: string): ProjectMetadata {
  const timestamp = now();
  return {
    ...INITIAL_PROJECT_METADATA,
    projectId: projectId || `project_${timestamp}`,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

/**
 * Resetea metadata a valores por defecto manteniendo projectId y createdAt
 */
export function resetMetadataPreservingIdentity(state: ProjectMetadata): ProjectMetadata {
  return {
    ...INITIAL_PROJECT_METADATA,
    projectId: state.projectId,
    createdAt: state.createdAt,
    updatedAt: now()
  };
}
