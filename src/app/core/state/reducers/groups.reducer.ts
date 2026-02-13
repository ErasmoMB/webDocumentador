/**
 * GROUPS REDUCER
 * 
 * Reducer puro para comandos de configuración de grupos (AISD/AISI).
 * Maneja: AddGroup, RemoveGroup, RenameGroup, ReorderGroups, CCPP operations.
 * 
 * REGLAS:
 * - Función pura: (state, command) => newState
 * - Sin efectos secundarios
 * - Siempre retorna nuevo objeto (inmutabilidad)
 * - Re-numeración automática de IDs jerárquicos (A, A.1, A.1.1)
 */

import { 
  GroupConfigState, 
  GroupDefinition,
  CCPPRegistry,
  CCPPEntry,
  INITIAL_GROUP_CONFIG,
  INITIAL_CCPP_REGISTRY
} from '../project-state.model';
import { 
  GroupConfigCommand,
  AddGroupCommand,
  RemoveGroupCommand,
  RenameGroupCommand,
  ReorderGroupsCommand,
  SetGroupCCPPCommand,
  AddCCPPToGroupCommand,
  RemoveCCPPFromGroupCommand,
  RegisterCCPPCommand,
  RegisterCCPPBatchCommand
} from '../commands.model';

/**
 * Genera un nuevo timestamp
 */
function now(): number {
  return Date.now();
}

/**
 * Genera el siguiente ID de grupo basado en el padre y tipo
 * AISD → prefijos A (A.1, A.2, A.3...)
 * AISI → prefijos B (B.1, B.2, B.3...)
 */
function generateGroupId(
  groups: readonly GroupDefinition[],
  parentId: string | null,
  tipo: 'AISD' | 'AISI'
): string {
  // Determinar prefijo base según tipo
  const basePrefix = tipo === 'AISD' ? 'A' : 'B';
  
  if (parentId === null) {
    // Grupo raíz: A.1, A.2... o B.1, B.2...
    const rootGroups = groups.filter(g => g.parentId === null);
    const nextNum = rootGroups.length + 1;
    return `${basePrefix}.${nextNum}`;
  }
  
  // Subgrupo: A.1.1, A.1.2... o B.1.1, B.1.2...
  const siblings = groups.filter(g => g.parentId === parentId);
  const nextNum = siblings.length + 1;
  return `${parentId}.${nextNum}`;
}

/**
 * Re-numera todos los grupos manteniendo la jerarquía
 * AISD → prefijos A (A.1, A.2, A.3...)
 * AISI → prefijos B (B.1, B.2, B.3...)
 */
function renumberGroups(groups: readonly GroupDefinition[], tipo: 'AISD' | 'AISI'): GroupDefinition[] {
  const result: GroupDefinition[] = [];
  
  // Determinar prefijo base según tipo
  const basePrefix = tipo === 'AISD' ? 'A' : 'B';
  
  // Primero, grupos raíz
  const rootGroups = groups.filter(g => g.parentId === null);
  rootGroups.forEach((group, index) => {
    const newId = `${basePrefix}.${index + 1}`;
    result.push({
      ...group,
      id: newId,
      orden: index
    });
  });
  
  // Función recursiva para procesar hijos
  function processChildren(parentId: string, newParentId: string): void {
    const children = groups.filter(g => g.parentId === parentId);
    children.forEach((child, index) => {
      const newId = `${newParentId}.${index + 1}`;
      result.push({
        ...child,
        id: newId,
        parentId: newParentId,
        orden: index
      });
      processChildren(child.id, newId);
    });
  }
  
  // Procesar hijos de cada grupo raíz
  rootGroups.forEach((group, index) => {
    const newId = `${basePrefix}.${index + 1}`;
    processChildren(group.id, newId);
  });
  
  return result;
}

/**
 * Obtiene todos los IDs descendientes de un grupo
 */
function getDescendantIds(groups: readonly GroupDefinition[], groupId: string): string[] {
  const descendants: string[] = [];
  const directChildren = groups.filter(g => g.parentId === groupId);
  
  for (const child of directChildren) {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(groups, child.id));
  }
  
  return descendants;
}

// ============================================================================
// CCPP REGISTRY REDUCERS
// ============================================================================

/**
 * Reducer para RegisterCCPP
 */
function handleRegisterCCPP(
  state: CCPPRegistry, 
  command: RegisterCCPPCommand
): CCPPRegistry {
  const { ccpp } = command.payload;
  const id = String(ccpp.codigo);
  
  // Si ya existe, no duplicar
  if (state.byId[id]) {
    return state;
  }

  const entry: CCPPEntry = {
    ...ccpp,
    id
  };

  return {
    byId: {
      ...state.byId,
      [id]: entry
    },
    allIds: [...state.allIds, id]
  };
}

/**
 * Reducer para RegisterCCPPBatch
 */
function handleRegisterCCPPBatch(
  state: CCPPRegistry, 
  command: RegisterCCPPBatchCommand
): CCPPRegistry {
  const { ccppList } = command.payload;
  
  if (ccppList.length === 0) {
    return state;
  }

  const newById = { ...state.byId };
  const newIds: string[] = [];

  for (const ccpp of ccppList) {
    const id = String(ccpp.codigo);
    if (!newById[id]) {
      newById[id] = { ...ccpp, id };
      newIds.push(id);
    }
  }

  if (newIds.length === 0) {
    return state; // Todos ya existían
  }

  return {
    byId: newById,
    allIds: [...state.allIds, ...newIds]
  };
}

/**
 * CCPP REGISTRY REDUCER
 */
export function ccppRegistryReducer(
  state: CCPPRegistry = INITIAL_CCPP_REGISTRY,
  command: GroupConfigCommand
): CCPPRegistry {
  switch (command.type) {
    case 'groupConfig/registerCCPP':
      return handleRegisterCCPP(state, command);
    
    case 'groupConfig/registerCCPPBatch':
      return handleRegisterCCPPBatch(state, command);
    
    default:
      return state;
  }
}

// ============================================================================
// GROUP CONFIG REDUCERS
// ============================================================================

/**
 * Reducer para AddGroup
 */
function handleAddGroup(
  state: GroupConfigState, 
  command: AddGroupCommand
): GroupConfigState {
  const { tipo, nombre, parentId, ccppIds } = command.payload;
  
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  const newId = generateGroupId(groups, parentId, tipo);
  
  // Calcular orden
  const siblings = groups.filter(g => g.parentId === parentId);
  const orden = siblings.length;

  const newGroup: GroupDefinition = {
    id: newId,
    nombre,
    tipo,
    parentId,
    orden,
    ccppIds
  };

  const newGroups = [...groups, newGroup];

  return {
    ...state,
    [tipo.toLowerCase()]: newGroups,
    lastUpdated: now()
  };
}

/**
 * Reducer para RemoveGroup
 */
function handleRemoveGroup(
  state: GroupConfigState, 
  command: RemoveGroupCommand
): GroupConfigState {
  const { tipo, groupId, cascade } = command.payload;
  
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  
  // Encontrar grupo
  const groupExists = groups.some(g => g.id === groupId);
  if (!groupExists) {
    return state;
  }

  let idsToRemove: string[];
  if (cascade) {
    // Eliminar grupo y todos sus descendientes
    idsToRemove = [groupId, ...getDescendantIds(groups, groupId)];
  } else {
    // Solo eliminar el grupo específico (huérfanos se mantienen)
    idsToRemove = [groupId];
  }

  const filteredGroups = groups.filter(g => !idsToRemove.includes(g.id));
  const renumberedGroups = renumberGroups(filteredGroups, tipo);

  return {
    ...state,
    [tipo.toLowerCase()]: renumberedGroups,
    lastUpdated: now()
  };
}

/**
 * Reducer para RenameGroup
 */
function handleRenameGroup(
  state: GroupConfigState, 
  command: RenameGroupCommand
): GroupConfigState {
  const { tipo, groupId, nuevoNombre } = command.payload;
  
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  const groupIndex = groups.findIndex(g => g.id === groupId);
  
  if (groupIndex === -1) {
    return state;
  }

  const group = groups[groupIndex];
  if (group.nombre === nuevoNombre) {
    return state; // Sin cambios
  }

  const newGroups = [
    ...groups.slice(0, groupIndex),
    { ...group, nombre: nuevoNombre },
    ...groups.slice(groupIndex + 1)
  ];

  return {
    ...state,
    [tipo.toLowerCase()]: newGroups,
    lastUpdated: now()
  };
}

/**
 * Reducer para ReorderGroups
 */
function handleReorderGroups(
  state: GroupConfigState, 
  command: ReorderGroupsCommand
): GroupConfigState {
  const { tipo, orderedIds } = command.payload;
  
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  
  // Crear mapa de grupos
  const groupsById = new Map(groups.map(g => [g.id, g]));
  
  // Reordenar
  const reordered: GroupDefinition[] = [];
  for (const id of orderedIds) {
    const group = groupsById.get(id);
    if (group) {
      reordered.push(group);
      groupsById.delete(id);
    }
  }
  
  // Agregar los que no estaban en la lista
  for (const group of groupsById.values()) {
    reordered.push(group);
  }

  // Re-numerar
  const renumbered = renumberGroups(reordered, tipo);

  return {
    ...state,
    [tipo.toLowerCase()]: renumbered,
    lastUpdated: now()
  };
}

/**
 * Reducer para SetGroupCCPP
 */
function handleSetGroupCCPP(
  state: GroupConfigState, 
  command: SetGroupCCPPCommand
): GroupConfigState {
  const { tipo, groupId, ccppIds } = command.payload;
  
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  const groupIndex = groups.findIndex(g => g.id === groupId);
  
  if (groupIndex === -1) {
    return state;
  }

  const newGroups = [
    ...groups.slice(0, groupIndex),
    { ...groups[groupIndex], ccppIds },
    ...groups.slice(groupIndex + 1)
  ];

  return {
    ...state,
    [tipo.toLowerCase()]: newGroups,
    lastUpdated: now()
  };
}

/**
 * Reducer para AddCCPPToGroup
 */
function handleAddCCPPToGroup(
  state: GroupConfigState, 
  command: AddCCPPToGroupCommand
): GroupConfigState {
  const { tipo, groupId, ccppId } = command.payload;
  
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  const groupIndex = groups.findIndex(g => g.id === groupId);
  
  if (groupIndex === -1) {
    return state;
  }

  const group = groups[groupIndex];
  
  // No agregar duplicados
  if (group.ccppIds.includes(ccppId)) {
    return state;
  }

  const newGroups = [
    ...groups.slice(0, groupIndex),
    { ...group, ccppIds: [...group.ccppIds, ccppId] },
    ...groups.slice(groupIndex + 1)
  ];

  return {
    ...state,
    [tipo.toLowerCase()]: newGroups,
    lastUpdated: now()
  };
}

/**
 * Reducer para RemoveCCPPFromGroup
 */
function handleRemoveCCPPFromGroup(
  state: GroupConfigState, 
  command: RemoveCCPPFromGroupCommand
): GroupConfigState {
  const { tipo, groupId, ccppId } = command.payload;
  
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  const groupIndex = groups.findIndex(g => g.id === groupId);
  
  if (groupIndex === -1) {
    return state;
  }

  const group = groups[groupIndex];
  
  // Verificar que existe
  if (!group.ccppIds.includes(ccppId)) {
    return state;
  }

  const newGroups = [
    ...groups.slice(0, groupIndex),
    { ...group, ccppIds: group.ccppIds.filter(id => id !== ccppId) },
    ...groups.slice(groupIndex + 1)
  ];

  return {
    ...state,
    [tipo.toLowerCase()]: newGroups,
    lastUpdated: now()
  };
}

/**
 * GROUP CONFIG REDUCER PRINCIPAL
 * 
 * @param state - Estado actual de configuración de grupos
 * @param command - Comando a ejecutar
 * @returns Nuevo estado de configuración de grupos
 */
export function groupConfigReducer(
  state: GroupConfigState = INITIAL_GROUP_CONFIG,
  command: GroupConfigCommand
): GroupConfigState {
  switch (command.type) {
    case 'groupConfig/addGroup':
      return handleAddGroup(state, command);
    
    case 'groupConfig/removeGroup':
      return handleRemoveGroup(state, command);
    
    case 'groupConfig/renameGroup':
      return handleRenameGroup(state, command);
    
    case 'groupConfig/reorderGroups':
      return handleReorderGroups(state, command);
    
    case 'groupConfig/setGroupCCPP':
      return handleSetGroupCCPP(state, command);
    
    case 'groupConfig/addCCPPToGroup':
      return handleAddCCPPToGroup(state, command);
    
    case 'groupConfig/removeCCPPFromGroup':
      return handleRemoveCCPPFromGroup(state, command);
    
    // CCPP commands no afectan GroupConfigState
    case 'groupConfig/registerCCPP':
    case 'groupConfig/registerCCPPBatch':
      return state;
    
    default:
      return state;
  }
}

/**
 * Obtiene un grupo por ID
 */
export function getGroupById(
  state: GroupConfigState,
  tipo: 'AISD' | 'AISI',
  groupId: string
): GroupDefinition | undefined {
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  return groups.find(g => g.id === groupId);
}

/**
 * Obtiene grupos raíz (sin padre)
 */
export function getRootGroups(
  state: GroupConfigState,
  tipo: 'AISD' | 'AISI'
): GroupDefinition[] {
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  return groups.filter(g => g.parentId === null);
}

/**
 * Obtiene grupos hijos de un padre
 */
export function getChildGroups(
  state: GroupConfigState,
  tipo: 'AISD' | 'AISI',
  parentId: string
): GroupDefinition[] {
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  return groups.filter(g => g.parentId === parentId);
}

/**
 * Verifica si hay grupos configurados
 */
export function hasGroups(
  state: GroupConfigState,
  tipo: 'AISD' | 'AISI'
): boolean {
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  return groups.length > 0;
}

/**
 * Cuenta total de grupos
 */
export function countGroups(
  state: GroupConfigState,
  tipo: 'AISD' | 'AISI'
): number {
  const groups = tipo === 'AISD' ? state.aisd : state.aisi;
  return groups.length;
}
