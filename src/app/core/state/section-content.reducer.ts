/**
 * SECTION CONTENT REDUCER - FASE 2
 * 
 * Reducer puro para comandos de contenido de secciones.
 * Maneja: InitializeTree, UpdateContent, AddImage, AddTable, AddParagraph, RemoveContent.
 * 
 * REGLAS:
 * - Función pura: (state, command) => newState
 * - Sin efectos secundarios
 * - Siempre retorna nuevo objeto (inmutabilidad)
 * - Numeración de imágenes/tablas NO se almacena (es computada via selectores)
 */

import {
  SectionsContentState,
  Section,
  SectionContent,
  ImageContent,
  TableContent,
  ParagraphContent,
  TableRowData,
  INITIAL_SECTIONS_CONTENT_STATE,
  generateContentId
} from './section.model';
import {
  SectionContentCommand,
  InitializeSectionsTreeCommand,
  UpdateSectionContentCommand,
  AddSectionImageCommand,
  AddSectionTableCommand,
  AddSectionParagraphCommand,
  RemoveSectionContentCommand,
  ReorderSectionContentCommand,
  SetActiveSectionContentCommand
} from './commands.model';
import { ProjectState } from './project-state.model';
import { generateInitialSections } from '../utils/section-generator.util';

/**
 * Genera un nuevo timestamp
 */
function now(): number {
  return Date.now();
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * Inicializa el árbol de secciones basado en el ProjectState actual.
 * Este handler recibe el ProjectState completo para usar generateInitialSections.
 */
export function handleInitializeSectionsTree(
  state: SectionsContentState,
  command: InitializeSectionsTreeCommand,
  projectState?: ProjectState
): SectionsContentState {
  if (!projectState) {
    console.warn('[SectionContentReducer] InitializeTree: projectState no proporcionado');
    return state;
  }
  
  // Usar el generador para crear el árbol inicial
  return generateInitialSections(projectState);
}

/**
 * Actualiza el contenido existente (texto, título o fuente)
 */
function handleUpdateContent(
  state: SectionsContentState,
  command: UpdateSectionContentCommand
): SectionsContentState {
  const { sectionId, contentId, changes } = command.payload;
  const section = state.byId[sectionId];
  
  if (!section) {
    console.warn(`[SectionContentReducer] UpdateContent: sección ${sectionId} no encontrada`);
    return state;
  }
  
  const contentIndex = section.contents.findIndex(c => c.id === contentId);
  if (contentIndex === -1) {
    console.warn(`[SectionContentReducer] UpdateContent: contenido ${contentId} no encontrado`);
    return state;
  }
  
  const existingContent = section.contents[contentIndex];
  const timestamp = now();
  
  // Crear nuevo contenido con cambios aplicados
  let updatedContent: SectionContent;
  
  if (existingContent.type === 'PARAGRAPH' && changes.text !== undefined) {
    updatedContent = {
      ...existingContent,
      text: changes.text,
      updatedAt: timestamp
    } as ParagraphContent;
  } else if (existingContent.type === 'IMAGE') {
    updatedContent = {
      ...existingContent,
      titulo: changes.titulo ?? existingContent.titulo,
      fuente: changes.fuente ?? existingContent.fuente,
      updatedAt: timestamp
    } as ImageContent;
  } else if (existingContent.type === 'TABLE') {
    updatedContent = {
      ...existingContent,
      titulo: changes.titulo ?? existingContent.titulo,
      fuente: changes.fuente ?? existingContent.fuente,
      updatedAt: timestamp
    } as TableContent;
  } else {
    return state; // Tipo no reconocido
  }
  
  const newContents = [...section.contents];
  newContents[contentIndex] = updatedContent;
  
  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: {
        ...section,
        contents: newContents,
        updatedAt: timestamp
      }
    },
    lastModified: timestamp
  };
}

/**
 * Agrega una imagen a una sección
 */
function handleAddImage(
  state: SectionsContentState,
  command: AddSectionImageCommand
): SectionsContentState {
  const { sectionId, titulo, fuente, preview, localPath } = command.payload;
  const section = state.byId[sectionId];
  
  if (!section) {
    console.warn(`[SectionContentReducer] AddImage: sección ${sectionId} no encontrada`);
    return state;
  }
  
  const timestamp = now();
  const newOrden = section.contents.length;
  
  const newImage: ImageContent = {
    id: generateContentId('IMAGE', sectionId),
    type: 'IMAGE',
    titulo,
    fuente,
    preview,
    localPath,
    backendId: null,
    uploadStatus: 'pending',
    orden: newOrden,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: {
        ...section,
        contents: [...section.contents, newImage],
        updatedAt: timestamp
      }
    },
    lastModified: timestamp
  };
}

/**
 * Agrega una tabla a una sección
 */
function handleAddTable(
  state: SectionsContentState,
  command: AddSectionTableCommand
): SectionsContentState {
  const { sectionId, titulo, fuente, columns, rows } = command.payload;
  const section = state.byId[sectionId];
  
  if (!section) {
    console.warn(`[SectionContentReducer] AddTable: sección ${sectionId} no encontrada`);
    return state;
  }
  
  const timestamp = now();
  const newOrden = section.contents.length;
  
  // Convertir rows a TableRowData
  const tableRows: TableRowData[] = (rows ?? []).map((row: { data: Readonly<Record<string, unknown>> }, index: number) => ({
    id: `row_${timestamp}_${index}`,
    orden: index,
    data: row.data
  }));
  
  const newTable: TableContent = {
    id: generateContentId('TABLE', sectionId),
    type: 'TABLE',
    titulo,
    fuente,
    columns: [...columns],
    rows: tableRows,
    totalKey: null,
    campoTotal: null,
    orden: newOrden,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: {
        ...section,
        contents: [...section.contents, newTable],
        updatedAt: timestamp
      }
    },
    lastModified: timestamp
  };
}

/**
 * Agrega un párrafo a una sección
 */
function handleAddParagraph(
  state: SectionsContentState,
  command: AddSectionParagraphCommand
): SectionsContentState {
  const { sectionId, text, format } = command.payload;
  const section = state.byId[sectionId];
  
  if (!section) {
    console.warn(`[SectionContentReducer] AddParagraph: sección ${sectionId} no encontrada`);
    return state;
  }
  
  const timestamp = now();
  const newOrden = section.contents.length;
  
  const newParagraph: ParagraphContent = {
    id: generateContentId('PARAGRAPH', sectionId),
    type: 'PARAGRAPH',
    text,
    format: format ?? 'plain',
    orden: newOrden,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: {
        ...section,
        contents: [...section.contents, newParagraph],
        updatedAt: timestamp
      }
    },
    lastModified: timestamp
  };
}

/**
 * Elimina contenido de una sección
 */
function handleRemoveContent(
  state: SectionsContentState,
  command: RemoveSectionContentCommand
): SectionsContentState {
  const { sectionId, contentId } = command.payload;
  const section = state.byId[sectionId];
  
  if (!section) {
    console.warn(`[SectionContentReducer] RemoveContent: sección ${sectionId} no encontrada`);
    return state;
  }
  
  const contentExists = section.contents.some(c => c.id === contentId);
  if (!contentExists) {
    console.warn(`[SectionContentReducer] RemoveContent: contenido ${contentId} no encontrado`);
    return state;
  }
  
  const timestamp = now();
  
  // Filtrar el contenido y recalcular orden
  const newContents = section.contents
    .filter(c => c.id !== contentId)
    .map((c, index) => ({ ...c, orden: index }));
  
  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: {
        ...section,
        contents: newContents,
        updatedAt: timestamp
      }
    },
    lastModified: timestamp
  };
}

/**
 * Reordena contenido dentro de una sección
 */
function handleReorderContent(
  state: SectionsContentState,
  command: ReorderSectionContentCommand
): SectionsContentState {
  const { sectionId, orderedContentIds } = command.payload;
  const section = state.byId[sectionId];
  
  if (!section) {
    console.warn(`[SectionContentReducer] ReorderContent: sección ${sectionId} no encontrada`);
    return state;
  }
  
  const timestamp = now();
  
  // Reordenar contenido según el array de IDs
  const contentMap = new Map(section.contents.map(c => [c.id, c]));
  const newContents: SectionContent[] = [];
  
  for (let i = 0; i < orderedContentIds.length; i++) {
    const content = contentMap.get(orderedContentIds[i]);
    if (content) {
      newContents.push({ ...content, orden: i });
    }
  }
  
  // Verificar que no perdimos contenido
  if (newContents.length !== section.contents.length) {
    console.warn('[SectionContentReducer] ReorderContent: algunos contenidos no fueron encontrados');
    return state;
  }
  
  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: {
        ...section,
        contents: newContents,
        updatedAt: timestamp
      }
    },
    lastModified: timestamp
  };
}

/**
 * Establece la sección activa
 */
function handleSetActive(
  state: SectionsContentState,
  command: SetActiveSectionContentCommand
): SectionsContentState {
  const { sectionId } = command.payload;
  
  if (!state.byId[sectionId]) {
    console.warn(`[SectionContentReducer] SetActive: sección ${sectionId} no encontrada`);
    return state;
  }
  
  if (state.activeSectionId === sectionId) {
    return state; // Sin cambios
  }
  
  return {
    ...state,
    activeSectionId: sectionId
  };
}

// ============================================================================
// REDUCER PRINCIPAL
// ============================================================================

/**
 * SECTION CONTENT REDUCER
 * 
 * @param state - Estado de secciones de contenido
 * @param command - Comando a ejecutar
 * @param projectState - Estado completo del proyecto (opcional, requerido para initializeTree)
 * @returns Nuevo estado
 */
export function sectionContentReducer(
  state: SectionsContentState = INITIAL_SECTIONS_CONTENT_STATE,
  command: SectionContentCommand,
  projectState?: ProjectState
): SectionsContentState {
  switch (command.type) {
    case 'sectionContent/initializeTree':
      return handleInitializeSectionsTree(state, command, projectState);
    
    case 'sectionContent/updateContent':
      return handleUpdateContent(state, command);
    
    case 'sectionContent/addImage':
      return handleAddImage(state, command);
    
    case 'sectionContent/addTable':
      return handleAddTable(state, command);
    
    case 'sectionContent/addParagraph':
      return handleAddParagraph(state, command);
    
    case 'sectionContent/removeContent':
      return handleRemoveContent(state, command);
    
    case 'sectionContent/reorderContent':
      return handleReorderContent(state, command);
    
    case 'sectionContent/setActive':
      return handleSetActive(state, command);
    
    default:
      return state;
  }
}

/**
 * Helper para agregar una imagen y obtener el nuevo estado
 * (útil para testing y composición)
 */
export function addImageToSection(
  state: SectionsContentState,
  sectionId: string,
  titulo: string,
  fuente: string = '',
  preview: string | null = null
): SectionsContentState {
  return handleAddImage(state, {
    type: 'sectionContent/addImage',
    payload: { sectionId, titulo, fuente, preview, localPath: null }
  });
}

/**
 * Helper para agregar un párrafo y obtener el nuevo estado
 */
export function addParagraphToSection(
  state: SectionsContentState,
  sectionId: string,
  text: string,
  format: 'plain' | 'html' | 'markdown' = 'plain'
): SectionsContentState {
  return handleAddParagraph(state, {
    type: 'sectionContent/addParagraph',
    payload: { sectionId, text, format }
  });
}
