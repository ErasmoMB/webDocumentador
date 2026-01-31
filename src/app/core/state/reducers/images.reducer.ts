/**
 * IMAGES REDUCER
 * 
 * Reducer puro para comandos de imágenes.
 * Maneja: AddImage, UpdateImage, RemoveImage, ReorderImages, SetUploadStatus, ClearSectionImages.
 * 
 * REGLAS:
 * - Función pura: (state, command) => newState
 * - Sin efectos secundarios
 * - Siempre retorna nuevo objeto (inmutabilidad)
 * - Numeración global automática
 */

import { 
  ImagesState, 
  ImageEntry,
  INITIAL_IMAGES_STATE,
  generateImageGroupKey 
} from '../project-state.model';
import { 
  ImageCommand,
  AddImageCommand,
  UpdateImageCommand,
  RemoveImageCommand,
  ReorderImagesCommand,
  SetImageUploadStatusCommand,
  ClearSectionImagesCommand
} from '../commands.model';

/**
 * Genera un nuevo timestamp
 */
function now(): number {
  return Date.now();
}

/**
 * Genera un ID único para una imagen
 */
function generateImageId(): string {
  return `img_${now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calcula el siguiente número de imagen global
 */
function getNextImageNumber(state: ImagesState): number {
  if (state.allIds.length === 0) {
    return 1;
  }
  const maxNumber = Math.max(...state.allIds.map(id => state.byId[id].numero));
  return maxNumber + 1;
}

/**
 * Re-numera todas las imágenes globalmente
 */
function renumberAllImages(state: ImagesState): ImagesState {
  if (state.allIds.length === 0) {
    return state;
  }

  // Ordenar por sección/grupo y luego por orden
  const sortedIds = [...state.allIds].sort((a, b) => {
    const imgA = state.byId[a];
    const imgB = state.byId[b];
    
    // Primero por sección
    const sectionCompare = imgA.sectionId.localeCompare(imgB.sectionId);
    if (sectionCompare !== 0) return sectionCompare;
    
    // Luego por grupo
    const groupA = imgA.groupId || '';
    const groupB = imgB.groupId || '';
    const groupCompare = groupA.localeCompare(groupB);
    if (groupCompare !== 0) return groupCompare;
    
    // Finalmente por orden dentro del grupo
    return imgA.orden - imgB.orden;
  });

  const newById: Record<string, ImageEntry> = {};
  sortedIds.forEach((id, index) => {
    const img = state.byId[id];
    newById[id] = {
      ...img,
      numero: index + 1
    };
  });

  return {
    ...state,
    byId: newById
  };
}

/**
 * Actualiza el índice bySectionGroup
 */
function updateBySectionGroup(
  state: ImagesState
): Readonly<Record<string, readonly string[]>> {
  const newIndex: Record<string, string[]> = {};
  
  for (const id of state.allIds) {
    const img = state.byId[id];
    const key = generateImageGroupKey(img.sectionId, img.groupId);
    
    if (!newIndex[key]) {
      newIndex[key] = [];
    }
    newIndex[key].push(id);
  }

  // Ordenar cada grupo por orden
  for (const key of Object.keys(newIndex)) {
    newIndex[key].sort((a, b) => state.byId[a].orden - state.byId[b].orden);
  }

  return newIndex;
}

/**
 * Reducer para AddImage
 */
function handleAddImage(
  state: ImagesState, 
  command: AddImageCommand
): ImagesState {
  const { sectionId, groupId, titulo, fuente, preview, localPath } = command.payload;
  
  const newId = generateImageId();
  const groupKey = generateImageGroupKey(sectionId, groupId);
  
  // Calcular orden dentro del grupo
  const existingInGroup = state.bySectionGroup[groupKey] || [];
  const orden = existingInGroup.length;

  const newImage: ImageEntry = {
    id: newId,
    sectionId,
    groupId,
    numero: getNextImageNumber(state),
    titulo,
    fuente,
    preview,
    uploadStatus: 'pending',
    backendId: null,
    localPath,
    orden,
    lastModified: now()
  };

  const newState: ImagesState = {
    byId: {
      ...state.byId,
      [newId]: newImage
    },
    allIds: [...state.allIds, newId],
    bySectionGroup: state.bySectionGroup
  };

  // Actualizar índice
  return {
    ...newState,
    bySectionGroup: updateBySectionGroup(newState)
  };
}

/**
 * Reducer para UpdateImage
 */
function handleUpdateImage(
  state: ImagesState, 
  command: UpdateImageCommand
): ImagesState {
  const { imageId, changes } = command.payload;
  
  const existingImage = state.byId[imageId];
  if (!existingImage) {
    return state; // Imagen no existe
  }

  // Verificar si hay cambios reales
  const hasChanges = 
    (changes.titulo !== undefined && changes.titulo !== existingImage.titulo) ||
    (changes.fuente !== undefined && changes.fuente !== existingImage.fuente) ||
    (changes.preview !== undefined && changes.preview !== existingImage.preview);

  if (!hasChanges) {
    return state;
  }

  return {
    ...state,
    byId: {
      ...state.byId,
      [imageId]: {
        ...existingImage,
        ...(changes.titulo !== undefined && { titulo: changes.titulo }),
        ...(changes.fuente !== undefined && { fuente: changes.fuente }),
        ...(changes.preview !== undefined && { preview: changes.preview }),
        lastModified: now()
      }
    }
  };
}

/**
 * Reducer para RemoveImage
 */
function handleRemoveImage(
  state: ImagesState, 
  command: RemoveImageCommand
): ImagesState {
  const { imageId } = command.payload;
  
  if (!state.byId[imageId]) {
    return state; // Imagen no existe
  }

  const { [imageId]: removed, ...remainingById } = state.byId;
  const newAllIds = state.allIds.filter(id => id !== imageId);

  const newState: ImagesState = {
    byId: remainingById,
    allIds: newAllIds,
    bySectionGroup: state.bySectionGroup
  };

  // Re-numerar y actualizar índice
  const renumbered = renumberAllImages(newState);
  return {
    ...renumbered,
    bySectionGroup: updateBySectionGroup(renumbered)
  };
}

/**
 * Reducer para ReorderImages
 */
function handleReorderImages(
  state: ImagesState, 
  command: ReorderImagesCommand
): ImagesState {
  const { sectionId, groupId, orderedImageIds } = command.payload;
  const groupKey = generateImageGroupKey(sectionId, groupId);
  
  const existingInGroup = state.bySectionGroup[groupKey];
  if (!existingInGroup || existingInGroup.length === 0) {
    return state; // No hay imágenes en este grupo
  }

  // Actualizar orden de las imágenes
  const newById = { ...state.byId };
  let currentOrden = 0;
  
  for (const id of orderedImageIds) {
    if (newById[id] && newById[id].sectionId === sectionId && newById[id].groupId === groupId) {
      newById[id] = {
        ...newById[id],
        orden: currentOrden++,
        lastModified: now()
      };
    }
  }

  const newState: ImagesState = {
    ...state,
    byId: newById
  };

  // Re-numerar globalmente y actualizar índice
  const renumbered = renumberAllImages(newState);
  return {
    ...renumbered,
    bySectionGroup: updateBySectionGroup(renumbered)
  };
}

/**
 * Reducer para SetImageUploadStatus
 */
function handleSetImageUploadStatus(
  state: ImagesState, 
  command: SetImageUploadStatusCommand
): ImagesState {
  const { imageId, status, backendId } = command.payload;
  
  const existingImage = state.byId[imageId];
  if (!existingImage) {
    return state; // Imagen no existe
  }

  return {
    ...state,
    byId: {
      ...state.byId,
      [imageId]: {
        ...existingImage,
        uploadStatus: status,
        ...(backendId !== undefined && { backendId }),
        lastModified: now()
      }
    }
  };
}

/**
 * Reducer para ClearSectionImages
 */
function handleClearSectionImages(
  state: ImagesState, 
  command: ClearSectionImagesCommand
): ImagesState {
  const { sectionId, groupId } = command.payload;
  const groupKey = generateImageGroupKey(sectionId, groupId);
  
  const idsToRemove = state.bySectionGroup[groupKey] || [];
  if (idsToRemove.length === 0) {
    return state; // No hay imágenes que eliminar
  }

  const idsToRemoveSet = new Set(idsToRemove);
  const newById: Record<string, ImageEntry> = {};
  
  for (const id of state.allIds) {
    if (!idsToRemoveSet.has(id)) {
      newById[id] = state.byId[id];
    }
  }

  const newAllIds = state.allIds.filter(id => !idsToRemoveSet.has(id));

  const newState: ImagesState = {
    byId: newById,
    allIds: newAllIds,
    bySectionGroup: state.bySectionGroup
  };

  // Re-numerar y actualizar índice
  const renumbered = renumberAllImages(newState);
  return {
    ...renumbered,
    bySectionGroup: updateBySectionGroup(renumbered)
  };
}

/**
 * IMAGES REDUCER PRINCIPAL
 * 
 * @param state - Estado actual de imágenes
 * @param command - Comando a ejecutar
 * @returns Nuevo estado de imágenes
 */
export function imagesReducer(
  state: ImagesState = INITIAL_IMAGES_STATE,
  command: ImageCommand
): ImagesState {
  switch (command.type) {
    case 'image/add':
      return handleAddImage(state, command);
    
    case 'image/update':
      return handleUpdateImage(state, command);
    
    case 'image/remove':
      return handleRemoveImage(state, command);
    
    case 'image/reorder':
      return handleReorderImages(state, command);
    
    case 'image/setUploadStatus':
      return handleSetImageUploadStatus(state, command);
    
    case 'image/clearSection':
      return handleClearSectionImages(state, command);
    
    default:
      return state;
  }
}

/**
 * Obtiene todas las imágenes de una sección/grupo
 */
export function getImagesBySection(
  state: ImagesState, 
  sectionId: string,
  groupId: string | null = null
): ImageEntry[] {
  const groupKey = generateImageGroupKey(sectionId, groupId);
  const ids = state.bySectionGroup[groupKey] || [];
  return ids.map(id => state.byId[id]);
}

/**
 * Obtiene una imagen por ID
 */
export function getImageById(
  state: ImagesState,
  imageId: string
): ImageEntry | undefined {
  return state.byId[imageId];
}

/**
 * Cuenta imágenes pendientes de subida
 */
export function countPendingUploads(state: ImagesState): number {
  return state.allIds.filter(id => state.byId[id].uploadStatus === 'pending').length;
}

/**
 * Cuenta imágenes con error
 */
export function countUploadErrors(state: ImagesState): number {
  return state.allIds.filter(id => state.byId[id].uploadStatus === 'error').length;
}

/**
 * Obtiene el total de imágenes
 */
export function getTotalImages(state: ImagesState): number {
  return state.allIds.length;
}
