/**
 * PROJECT REDUCER
 * 
 * Reducer puro para comandos globales del proyecto.
 * Maneja: Load, Clear, MarkSaved, GlobalRegistry (ubicación, entrevistados).
 * 
 * REGLAS:
 * - Función pura: (state, command) => newState
 * - Sin efectos secundarios
 * - Siempre retorna nuevo objeto (inmutabilidad)
 */

import { 
  ProjectState, 
  INITIAL_PROJECT_STATE,
  GlobalRegistryState,
  INITIAL_GLOBAL_REGISTRY,
  ProjectMetadata,
  INITIAL_PROJECT_METADATA
} from '../project-state.model';
import { 
  ProjectCommand,
  LoadProjectCommand,
  ClearProjectCommand,
  MarkSavedCommand,
  SetUbicacionCommand,
  AddEntrevistadoCommand,
  RemoveEntrevistadoCommand,
  LoadJsonDataCommand
} from '../commands.model';
import { Entrevistado } from '../../models/formulario.model';
import { 
  normalizeImportData,
  NormalizedImportResult 
} from '../../utils/json-import.adapter';

/**
 * Genera un nuevo timestamp
 */
function now(): number {
  return Date.now();
}

// ============================================================================
// GLOBAL REGISTRY SUB-REDUCERS
// ============================================================================

/**
 * Reducer para SetUbicacion
 */
function handleSetUbicacion(
  state: GlobalRegistryState, 
  command: SetUbicacionCommand
): GlobalRegistryState {
  const { departamento, provincia, distrito } = command.payload;
  
  const newUbicacion = {
    departamento: departamento ?? state.ubicacion.departamento,
    provincia: provincia ?? state.ubicacion.provincia,
    distrito: distrito ?? state.ubicacion.distrito
  };

  // Verificar si hay cambios
  if (
    newUbicacion.departamento === state.ubicacion.departamento &&
    newUbicacion.provincia === state.ubicacion.provincia &&
    newUbicacion.distrito === state.ubicacion.distrito
  ) {
    return state;
  }

  return {
    ...state,
    ubicacion: newUbicacion
  };
}

/**
 * Reducer para AddEntrevistado
 */
function handleAddEntrevistado(
  state: GlobalRegistryState, 
  command: AddEntrevistadoCommand
): GlobalRegistryState {
  const newEntrevistado: Entrevistado = {
    nombre: command.payload.nombre,
    cargo: command.payload.cargo,
    organizacion: command.payload.organizacion
  };

  return {
    ...state,
    entrevistados: [...state.entrevistados, newEntrevistado]
  };
}

/**
 * Reducer para RemoveEntrevistado
 */
function handleRemoveEntrevistado(
  state: GlobalRegistryState, 
  command: RemoveEntrevistadoCommand
): GlobalRegistryState {
  const { index } = command.payload;

  if (index < 0 || index >= state.entrevistados.length) {
    return state; // Index inválido, no cambiar
  }

  return {
    ...state,
    entrevistados: state.entrevistados.filter((_, i) => i !== index)
  };
}

/**
 * GLOBAL REGISTRY REDUCER
 */
export function globalRegistryReducer(
  state: GlobalRegistryState = INITIAL_GLOBAL_REGISTRY,
  command: ProjectCommand
): GlobalRegistryState {
  switch (command.type) {
    case 'project/setUbicacion':
      return handleSetUbicacion(state, command);
    
    case 'project/addEntrevistado':
      return handleAddEntrevistado(state, command);
    
    case 'project/removeEntrevistado':
      return handleRemoveEntrevistado(state, command);
    
    default:
      return state;
  }
}

// ============================================================================
// PROJECT LEVEL REDUCERS
// ============================================================================

/**
 * Transforma datos legacy (FormularioDatos) a ProjectState
 * Esta función es pura - no tiene side effects
 */
function transformLegacyDataToState(
  data: any, 
  source: 'storage' | 'api'
): Partial<ProjectState> {
  const timestamp = now();
  
  // Extraer metadata
  const metadata = {
    projectId: data.projectId || `project_${timestamp}`,
    projectName: data.projectName || '',
    consultora: data.consultora || '',
    detalleProyecto: data.detalleProyecto || '',
    createdAt: data.createdAt || timestamp,
    updatedAt: timestamp,
    version: data.version || '1.0.0'
  };

  // Extraer ubicación
  const ubicacion = {
    departamento: data.departamentoSeleccionado || '',
    provincia: data.provinciaSeleccionada || '',
    distrito: data.distritoSeleccionado || ''
  };

  // Extraer entrevistados
  const entrevistados: Entrevistado[] = Array.isArray(data.entrevistados) 
    ? data.entrevistados.map((e: any) => ({
        nombre: e.nombre || '',
        cargo: e.cargo || '',
        organizacion: e.organizacion || ''
      }))
    : [];

  return {
    metadata,
    globalRegistry: {
      ...INITIAL_GLOBAL_REGISTRY,
      ubicacion,
      entrevistados
    },
    _internal: {
      isDirty: false,
      lastSaved: timestamp,
      loadedFrom: source
    }
  };
}

/**
 * Reducer para LoadProject
 */
function handleLoadProject(
  state: ProjectState, 
  command: LoadProjectCommand
): ProjectState {
  const transformedData = transformLegacyDataToState(
    command.payload.data,
    command.payload.source
  );

  return {
    ...state,
    ...transformedData
  } as ProjectState;
}

/**
 * Reducer para ClearProject
 */
function handleClearProject(
  state: ProjectState, 
  command: ClearProjectCommand
): ProjectState {
  if (command.payload.preserveMetadata) {
    // Mantener metadata pero limpiar todo lo demás
    return {
      ...INITIAL_PROJECT_STATE,
      metadata: {
        ...state.metadata,
        updatedAt: now()
      },
      _internal: {
        isDirty: true,
        lastSaved: state._internal.lastSaved,
        loadedFrom: state._internal.loadedFrom
      }
    };
  }

  // Limpiar todo, creando nueva metadata
  const timestamp = now();
  return {
    ...INITIAL_PROJECT_STATE,
    metadata: {
      ...INITIAL_PROJECT_METADATA,
      projectId: `project_${timestamp}`,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    _internal: {
      isDirty: false,
      lastSaved: 0,
      loadedFrom: 'fresh'
    }
  };
}

/**
 * Reducer para MarkSaved
 */
function handleMarkSaved(
  state: ProjectState, 
  command: MarkSavedCommand
): ProjectState {
  return {
    ...state,
    _internal: {
      ...state._internal,
      isDirty: false,
      lastSaved: command.payload.timestamp
    }
  };
}

/**
 * Reducer para LoadJsonData
 * 
 * Procesa un archivo JSON usando el json-import.adapter y actualiza el estado.
 * Esta función es PURA - toda la lógica de normalización está en el adapter.
 */
function handleLoadJsonData(
  state: ProjectState,
  command: LoadJsonDataCommand
): ProjectState {
  const timestamp = now();
  const { fileContent, projectName, fileName } = command.payload;
  
  // Usar el adapter para normalizar los datos
  const normalizedResult: NormalizedImportResult = normalizeImportData(fileContent);
  
  if (!normalizedResult.success) {
    // Si falla, logueamos errores pero no rompemos el estado
    console.warn('[ProjectReducer] LoadJsonData errors:', normalizedResult.errors);
    // Retornar estado sin cambios si hay error crítico
    if (normalizedResult.ccpps.length === 0) {
      return state;
    }
  }
  
  // Construir nuevo ccppRegistry
  const newByIdEntries = normalizedResult.ccpps.map(ccpp => [ccpp.id, ccpp] as const);
  const newCcppRegistry = {
    byId: {
      ...state.ccppRegistry.byId,
      ...Object.fromEntries(newByIdEntries)
    },
    allIds: [
      ...state.ccppRegistry.allIds,
      ...normalizedResult.ccpps.map(c => c.id).filter(id => !state.ccppRegistry.allIds.includes(id))
    ]
  };
  
  // Construir nuevo groupConfig según el tipo detectado
  const { detectedType } = normalizedResult.metadata;
  const newGroups = normalizedResult.groups.map((g, index) => ({
    id: g.id,
    nombre: g.nombre,
    tipo: detectedType,
    parentId: g.parentId,
    orden: g.orden,
    ccppIds: g.ccppIds
  }));
  
  const newGroupConfig = detectedType === 'AISD'
    ? {
        ...state.groupConfig,
        aisd: [...state.groupConfig.aisd, ...newGroups],
        lastUpdated: timestamp
      }
    : {
        ...state.groupConfig,
        aisi: [...state.groupConfig.aisi, ...newGroups],
        lastUpdated: timestamp
      };
  
  // Actualizar ubicación si está disponible
  const newGlobalRegistry = {
    ...state.globalRegistry,
    ubicacion: {
      departamento: normalizedResult.metadata.departamento || state.globalRegistry.ubicacion.departamento,
      provincia: normalizedResult.metadata.provincia || state.globalRegistry.ubicacion.provincia,
      distrito: normalizedResult.metadata.distrito || state.globalRegistry.ubicacion.distrito
    }
  };
  
  // Actualizar metadata del proyecto
  const newMetadata = {
    ...state.metadata,
    projectId: state.metadata.projectId || `project_${timestamp}`,
    projectName: projectName || state.metadata.projectName,
    updatedAt: timestamp,
    createdAt: state.metadata.createdAt || timestamp
  };
  
  return {
    ...state,
    metadata: newMetadata,
    ccppRegistry: newCcppRegistry,
    groupConfig: newGroupConfig,
    globalRegistry: newGlobalRegistry,
    _internal: {
      ...state._internal,
      isDirty: true,
      loadedFrom: 'api'
    }
  };
}

/**
 * PROJECT REDUCER PRINCIPAL
 * 
 * Este reducer maneja los comandos globales que afectan múltiples partes del estado.
 * Para comandos específicos de globalRegistry, delega al sub-reducer.
 * 
 * @param state - Estado completo del proyecto
 * @param command - Comando a ejecutar
 * @returns Nuevo estado del proyecto
 */
export function projectReducer(
  state: ProjectState = INITIAL_PROJECT_STATE,
  command: ProjectCommand
): ProjectState {
  switch (command.type) {
    case 'project/load':
      return handleLoadProject(state, command);
    
    case 'project/clear':
      return handleClearProject(state, command);
    
    case 'project/markSaved':
      return handleMarkSaved(state, command);
    
    case 'project/loadJsonData':
      return handleLoadJsonData(state, command);
    
    case 'project/setUbicacion':
    case 'project/addEntrevistado':
    case 'project/removeEntrevistado':
      return {
        ...state,
        globalRegistry: globalRegistryReducer(state.globalRegistry, command),
        _internal: {
          ...state._internal,
          isDirty: true
        }
      };
    
    default:
      return state;
  }
}

/**
 * Marca el estado como dirty (modificado)
 */
export function markStateDirty(state: ProjectState): ProjectState {
  if (state._internal.isDirty) {
    return state;
  }
  return {
    ...state,
    _internal: {
      ...state._internal,
      isDirty: true
    }
  };
}
