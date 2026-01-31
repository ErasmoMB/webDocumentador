/**
 * COMMANDS MODEL
 * 
 * Definición de todos los comandos para el sistema de estado.
 * Cada comando es serializable y describe una intención de cambio.
 * 
 * REGLAS:
 * - Todos los comandos tienen 'type' como discriminador
 * - Los payloads son inmutables
 * - NO contienen lógica de negocio
 */

import { GroupType } from '../models/section-config.model';
import { FieldValue, GroupDefinition, TableRow, ImageEntry, ProjectMetadata } from './project-state.model';
import { CCPP } from '../models/group-config.model';

// ============================================================================
// METADATA COMMANDS
// ============================================================================

export interface SetProjectNameCommand {
  readonly type: 'metadata/setProjectName';
  readonly payload: { projectName: string };
}

export interface SetConsultoraCommand {
  readonly type: 'metadata/setConsultora';
  readonly payload: { consultora: string };
}

export interface SetDetalleProyectoCommand {
  readonly type: 'metadata/setDetalleProyecto';
  readonly payload: { detalleProyecto: string };
}

export interface UpdateMetadataCommand {
  readonly type: 'metadata/update';
  readonly payload: Partial<Pick<ProjectMetadata, 'projectName' | 'consultora' | 'detalleProyecto'>>;
}

export type MetadataCommand = 
  | SetProjectNameCommand 
  | SetConsultoraCommand 
  | SetDetalleProyectoCommand
  | UpdateMetadataCommand;

// ============================================================================
// GROUP CONFIG COMMANDS
// ============================================================================

export interface AddGroupCommand {
  readonly type: 'groupConfig/addGroup';
  readonly payload: {
    tipo: 'AISD' | 'AISI';
    nombre: string;
    parentId: string | null;
    ccppIds: readonly string[];
  };
}

export interface RemoveGroupCommand {
  readonly type: 'groupConfig/removeGroup';
  readonly payload: {
    tipo: 'AISD' | 'AISI';
    groupId: string;
    cascade: boolean;
  };
}

export interface RenameGroupCommand {
  readonly type: 'groupConfig/renameGroup';
  readonly payload: {
    tipo: 'AISD' | 'AISI';
    groupId: string;
    nuevoNombre: string;
  };
}

export interface ReorderGroupsCommand {
  readonly type: 'groupConfig/reorderGroups';
  readonly payload: {
    tipo: 'AISD' | 'AISI';
    orderedIds: readonly string[];
  };
}

export interface SetGroupCCPPCommand {
  readonly type: 'groupConfig/setGroupCCPP';
  readonly payload: {
    tipo: 'AISD' | 'AISI';
    groupId: string;
    ccppIds: readonly string[];
  };
}

export interface AddCCPPToGroupCommand {
  readonly type: 'groupConfig/addCCPPToGroup';
  readonly payload: {
    tipo: 'AISD' | 'AISI';
    groupId: string;
    ccppId: string;
  };
}

export interface RemoveCCPPFromGroupCommand {
  readonly type: 'groupConfig/removeCCPPFromGroup';
  readonly payload: {
    tipo: 'AISD' | 'AISI';
    groupId: string;
    ccppId: string;
  };
}

export interface RegisterCCPPCommand {
  readonly type: 'groupConfig/registerCCPP';
  readonly payload: {
    ccpp: CCPP;
  };
}

export interface RegisterCCPPBatchCommand {
  readonly type: 'groupConfig/registerCCPPBatch';
  readonly payload: {
    ccppList: readonly CCPP[];
  };
}

export type GroupConfigCommand = 
  | AddGroupCommand
  | RemoveGroupCommand
  | RenameGroupCommand
  | ReorderGroupsCommand
  | SetGroupCCPPCommand
  | AddCCPPToGroupCommand
  | RemoveCCPPFromGroupCommand
  | RegisterCCPPCommand
  | RegisterCCPPBatchCommand;

// ============================================================================
// SECTION COMMANDS
// ============================================================================

export interface InitializeSectionCommand {
  readonly type: 'section/initialize';
  readonly payload: {
    sectionId: string;
    groupType: GroupType;
    groupId: string | null;
  };
}

export interface SetActiveSectionCommand {
  readonly type: 'section/setActive';
  readonly payload: {
    sectionId: string;
  };
}

export interface MarkSectionCompleteCommand {
  readonly type: 'section/markComplete';
  readonly payload: {
    sectionId: string;
    isComplete: boolean;
  };
}

export interface ResetSectionCommand {
  readonly type: 'section/reset';
  readonly payload: {
    sectionId: string;
    preserveStructure: boolean;
  };
}

export interface AssignSectionToGroupCommand {
  readonly type: 'section/assignToGroup';
  readonly payload: {
    sectionId: string;
    groupId: string;
  };
}

// ============================================================================
// SECTION CONTENT COMMANDS (FASE 2)
// ============================================================================

/**
 * Inicializa el árbol de secciones basado en groupConfig
 */
export interface InitializeSectionsTreeCommand {
  readonly type: 'sectionContent/initializeTree';
  readonly payload: {
    readonly timestamp: number;
  };
}

/**
 * Actualiza el contenido de texto en una sección
 */
export interface UpdateSectionContentCommand {
  readonly type: 'sectionContent/updateContent';
  readonly payload: {
    readonly sectionId: string;
    readonly contentId: string;
    readonly changes: {
      readonly text?: string;
      readonly titulo?: string;
      readonly fuente?: string;
    };
  };
}

/**
 * Agrega una imagen a una sección
 */
export interface AddSectionImageCommand {
  readonly type: 'sectionContent/addImage';
  readonly payload: {
    readonly sectionId: string;
    readonly titulo: string;
    readonly fuente: string;
    readonly preview: string | null;
    readonly localPath: string | null;
  };
}

/**
 * Agrega una tabla a una sección
 */
export interface AddSectionTableCommand {
  readonly type: 'sectionContent/addTable';
  readonly payload: {
    readonly sectionId: string;
    readonly titulo: string;
    readonly fuente: string;
    readonly columns: readonly string[];
    readonly rows?: ReadonlyArray<{ data: Readonly<Record<string, unknown>> }>;
  };
}

/**
 * Agrega un párrafo a una sección
 */
export interface AddSectionParagraphCommand {
  readonly type: 'sectionContent/addParagraph';
  readonly payload: {
    readonly sectionId: string;
    readonly text: string;
    readonly format?: 'plain' | 'html' | 'markdown';
  };
}

/**
 * Elimina contenido de una sección
 */
export interface RemoveSectionContentCommand {
  readonly type: 'sectionContent/removeContent';
  readonly payload: {
    readonly sectionId: string;
    readonly contentId: string;
  };
}

/**
 * Reordena contenido dentro de una sección
 */
export interface ReorderSectionContentCommand {
  readonly type: 'sectionContent/reorderContent';
  readonly payload: {
    readonly sectionId: string;
    readonly orderedContentIds: readonly string[];
  };
}

/**
 * Establece la sección activa
 */
export interface SetActiveSectionContentCommand {
  readonly type: 'sectionContent/setActive';
  readonly payload: {
    readonly sectionId: string;
  };
}

export type SectionContentCommand =
  | InitializeSectionsTreeCommand
  | UpdateSectionContentCommand
  | AddSectionImageCommand
  | AddSectionTableCommand
  | AddSectionParagraphCommand
  | RemoveSectionContentCommand
  | ReorderSectionContentCommand
  | SetActiveSectionContentCommand;

export type SectionCommand = 
  | InitializeSectionCommand
  | SetActiveSectionCommand
  | MarkSectionCompleteCommand
  | ResetSectionCommand
  | AssignSectionToGroupCommand;

// ============================================================================
// FIELD COMMANDS
// ============================================================================

export interface SetFieldCommand {
  readonly type: 'field/set';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    fieldName: string;
    value: FieldValue;
    source: 'user' | 'api' | 'default' | 'computed';
  };
}

export interface SetFieldsCommand {
  readonly type: 'field/setMultiple';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    fields: ReadonlyArray<{
      fieldName: string;
      value: FieldValue;
      source: 'user' | 'api' | 'default' | 'computed';
    }>;
  };
}

export interface ClearFieldCommand {
  readonly type: 'field/clear';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    fieldName: string;
  };
}

export interface ClearSectionFieldsCommand {
  readonly type: 'field/clearSection';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
  };
}

export interface TouchFieldCommand {
  readonly type: 'field/touch';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    fieldName: string;
  };
}

export type FieldCommand = 
  | SetFieldCommand
  | SetFieldsCommand
  | ClearFieldCommand
  | ClearSectionFieldsCommand
  | TouchFieldCommand;

// ============================================================================
// TABLE COMMANDS
// ============================================================================

export interface SetTableDataCommand {
  readonly type: 'table/setData';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    tableKey: string;
    rows: ReadonlyArray<Omit<TableRow, 'id' | 'orden'>>;
    config: {
      totalKey: string;
      campoTotal: string;
      campoPorcentaje?: string;
    };
  };
}

export interface AddTableRowCommand {
  readonly type: 'table/addRow';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    tableKey: string;
    data: Readonly<Record<string, any>>;
    insertAt?: number;
  };
}

export interface UpdateTableRowCommand {
  readonly type: 'table/updateRow';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    tableKey: string;
    rowId: string;
    data: Readonly<Record<string, any>>;
  };
}

export interface RemoveTableRowCommand {
  readonly type: 'table/removeRow';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    tableKey: string;
    rowId: string;
  };
}

export interface ReorderTableRowsCommand {
  readonly type: 'table/reorderRows';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    tableKey: string;
    orderedRowIds: readonly string[];
  };
}

export interface ClearTableCommand {
  readonly type: 'table/clear';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    tableKey: string;
  };
}

export type TableCommand = 
  | SetTableDataCommand
  | AddTableRowCommand
  | UpdateTableRowCommand
  | RemoveTableRowCommand
  | ReorderTableRowsCommand
  | ClearTableCommand;

// ============================================================================
// IMAGE COMMANDS
// ============================================================================

export interface AddImageCommand {
  readonly type: 'image/add';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    titulo: string;
    fuente: string;
    preview: string | null;
    localPath: string | null;
  };
}

export interface UpdateImageCommand {
  readonly type: 'image/update';
  readonly payload: {
    imageId: string;
    changes: Partial<Pick<ImageEntry, 'titulo' | 'fuente' | 'preview'>>;
  };
}

export interface RemoveImageCommand {
  readonly type: 'image/remove';
  readonly payload: {
    imageId: string;
  };
}

export interface ReorderImagesCommand {
  readonly type: 'image/reorder';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
    orderedImageIds: readonly string[];
  };
}

export interface SetImageUploadStatusCommand {
  readonly type: 'image/setUploadStatus';
  readonly payload: {
    imageId: string;
    status: 'pending' | 'uploaded' | 'error';
    backendId?: string;
  };
}

export interface ClearSectionImagesCommand {
  readonly type: 'image/clearSection';
  readonly payload: {
    sectionId: string;
    groupId: string | null;
  };
}

export type ImageCommand = 
  | AddImageCommand
  | UpdateImageCommand
  | RemoveImageCommand
  | ReorderImagesCommand
  | SetImageUploadStatusCommand
  | ClearSectionImagesCommand;

// ============================================================================
// PROJECT COMMANDS
// ============================================================================

export interface LoadProjectCommand {
  readonly type: 'project/load';
  readonly payload: {
    data: any; // FormularioDatos legacy
    source: 'storage' | 'api';
  };
}

export interface ClearProjectCommand {
  readonly type: 'project/clear';
  readonly payload: {
    preserveMetadata: boolean;
  };
}

export interface MarkSavedCommand {
  readonly type: 'project/markSaved';
  readonly payload: {
    timestamp: number;
  };
}

export interface SetUbicacionCommand {
  readonly type: 'project/setUbicacion';
  readonly payload: {
    departamento?: string;
    provincia?: string;
    distrito?: string;
  };
}

export interface AddEntrevistadoCommand {
  readonly type: 'project/addEntrevistado';
  readonly payload: {
    nombre: string;
    cargo: string;
    organizacion: string;
  };
}

export interface RemoveEntrevistadoCommand {
  readonly type: 'project/removeEntrevistado';
  readonly payload: {
    index: number;
  };
}

/**
 * Comando para cargar datos JSON desde archivo
 * Usa el json-import.adapter para normalizar los datos
 */
export interface LoadJsonDataCommand {
  readonly type: 'project/loadJsonData';
  readonly payload: {
    readonly fileContent: unknown;
    readonly projectName: string;
    readonly fileName?: string;
  };
}

export type ProjectCommand = 
  | LoadProjectCommand
  | ClearProjectCommand
  | MarkSavedCommand
  | SetUbicacionCommand
  | AddEntrevistadoCommand
  | RemoveEntrevistadoCommand
  | LoadJsonDataCommand;

// ============================================================================
// BATCH COMMANDS
// ============================================================================

export interface BatchCommand {
  readonly type: 'batch/execute';
  readonly payload: {
    commands: readonly ProjectStateCommand[];
    transactionId: string;
  };
}

// ============================================================================
// UNION TYPE
// ============================================================================

export type ProjectStateCommand = 
  | MetadataCommand
  | GroupConfigCommand
  | SectionCommand
  | SectionContentCommand
  | FieldCommand
  | TableCommand
  | ImageCommand
  | ProjectCommand
  | BatchCommand;

// ============================================================================
// COMMAND TYPE GUARDS
// ============================================================================

export function isMetadataCommand(cmd: ProjectStateCommand): cmd is MetadataCommand {
  return cmd.type.startsWith('metadata/');
}

export function isGroupConfigCommand(cmd: ProjectStateCommand): cmd is GroupConfigCommand {
  return cmd.type.startsWith('groupConfig/');
}

export function isSectionCommand(cmd: ProjectStateCommand): cmd is SectionCommand {
  return cmd.type.startsWith('section/') && !cmd.type.startsWith('sectionContent/');
}

export function isSectionContentCommand(cmd: ProjectStateCommand): cmd is SectionContentCommand {
  return cmd.type.startsWith('sectionContent/');
}

export function isFieldCommand(cmd: ProjectStateCommand): cmd is FieldCommand {
  return cmd.type.startsWith('field/');
}

export function isTableCommand(cmd: ProjectStateCommand): cmd is TableCommand {
  return cmd.type.startsWith('table/');
}

export function isImageCommand(cmd: ProjectStateCommand): cmd is ImageCommand {
  return cmd.type.startsWith('image/');
}

export function isProjectCommand(cmd: ProjectStateCommand): cmd is ProjectCommand {
  return cmd.type.startsWith('project/');
}

export function isBatchCommand(cmd: ProjectStateCommand): cmd is BatchCommand {
  return cmd.type === 'batch/execute';
}
