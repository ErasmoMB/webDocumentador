/**
 * SECTION GENERATOR UTILITY - FASE 2
 * 
 * Función PURA para generar el árbol inicial de secciones basado en groupConfig.
 * 
 * LÓGICA DE NEGOCIO:
 * - Secciones estáticas: 1, 1.1, 1.2, 1.3, 2, 2.1, 2.2, 3
 * - Para cada grupo AISD: Raíz "a.{n}" + 20 subsecciones "a.{n}.1" a "a.{n}.20"
 * - Para cada grupo AISI: Raíz "b.{n}" + 9 subsecciones "b.{n}.1" a "b.{n}.9"
 * 
 * NOTA: Esta función es PURA - no tiene side effects.
 */

import { ProjectState, GroupDefinition } from '../state/project-state.model';
import { 
  Section, 
  SectionsContentState,
  SectionType,
  STATIC_SECTIONS,
  AISD_SUBSECTIONS,
  AISI_SUBSECTIONS,
  INITIAL_SECTIONS_CONTENT_STATE
} from '../state/section.model';

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

interface GenerationContext {
  readonly timestamp: number;
  readonly sectionOrder: string[];
  readonly sectionsById: Record<string, Section>;
}

// ============================================================================
// FUNCIONES AUXILIARES PURAS
// ============================================================================

/**
 * Crea una sección base
 */
function createSection(
  id: string,
  title: string,
  sectionType: SectionType,
  orden: number,
  groupId: string | null = null,
  parentId: string | null = null,
  timestamp: number = Date.now()
): Section {
  return {
    id,
    title,
    sectionType,
    groupId,
    parentId,
    contents: [],
    orden,
    isLocked: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

/**
 * Genera secciones estáticas
 */
function generateStaticSections(context: GenerationContext): GenerationContext {
  const { timestamp, sectionOrder, sectionsById } = context;
  
  const newSectionsById = { ...sectionsById };
  const newSectionOrder = [...sectionOrder];
  
  for (const staticDef of STATIC_SECTIONS) {
    const section = createSection(
      staticDef.id,
      staticDef.title,
      'STATIC',
      staticDef.orden,
      null,
      null,
      timestamp
    );
    
    newSectionsById[staticDef.id] = section;
    newSectionOrder.push(staticDef.id);
  }
  
  return {
    timestamp,
    sectionOrder: newSectionOrder,
    sectionsById: newSectionsById
  };
}

/**
 * Genera secciones para un grupo AISD (Comunidad)
 * - Raíz: "a.{groupIndex}" (ej: "a.1" para el primer grupo AISD)
 * - Subsecciones: "a.{groupIndex}.{1-20}"
 */
function generateAISDSections(
  group: GroupDefinition,
  groupIndex: number,
  context: GenerationContext
): GenerationContext {
  const { timestamp, sectionOrder, sectionsById } = context;
  
  const newSectionsById = { ...sectionsById };
  const newSectionOrder = [...sectionOrder];
  
  // ID base para este grupo (3.1.4.A.1, 3.1.4.A.2, etc.)
  const rootId = `3.1.4.A.${groupIndex + 1}`;
  
  // Crear sección raíz del grupo
  const rootSection = createSection(
    rootId,
    `AISD: ${group.nombre}`,
    'AISD_ROOT',
    sectionOrder.length,
    group.id,
    '3', // Hijo de "3. Línea Base Social"
    timestamp
  );
  
  newSectionsById[rootId] = rootSection;
  newSectionOrder.push(rootId);
  
  // Crear subsecciones (3.1.4.A.1.1 a 3.1.4.A.1.20)
  for (let i = 0; i < AISD_SUBSECTIONS.length; i++) {
    const subDef = AISD_SUBSECTIONS[i];
    const subId = `${rootId}.${subDef.suffix}`;
    
    const subSection = createSection(
      subId,
      subDef.title,
      'AISD_SUB',
      sectionOrder.length + 1 + i,
      group.id,
      rootId,
      timestamp
    );
    
    newSectionsById[subId] = subSection;
    newSectionOrder.push(subId);
  }
  
  return {
    timestamp,
    sectionOrder: newSectionOrder,
    sectionsById: newSectionsById
  };
}

/**
 * Genera secciones para un grupo AISI (Distrito)
 * - Raíz: "b.{groupIndex}" (ej: "b.1" para el primer grupo AISI)
 * - Subsecciones: "b.{groupIndex}.{1-9}"
 */
function generateAISISections(
  group: GroupDefinition,
  groupIndex: number,
  context: GenerationContext
): GenerationContext {
  const { timestamp, sectionOrder, sectionsById } = context;
  
  const newSectionsById = { ...sectionsById };
  const newSectionOrder = [...sectionOrder];
  
  // ID base para este grupo (3.1.4.B.1, 3.1.4.B.2, etc.)
  const rootId = `3.1.4.B.${groupIndex + 1}`;
  
  // Crear sección raíz del grupo
  const rootSection = createSection(
    rootId,
    `AISI: ${group.nombre}`,
    'AISI_ROOT',
    sectionOrder.length,
    group.id,
    '3', // Hijo de "3. Línea Base Social"
    timestamp
  );
  
  newSectionsById[rootId] = rootSection;
  newSectionOrder.push(rootId);
  
  // Crear subsecciones (3.1.4.B.1.1 a 3.1.4.B.1.9)
  for (let i = 0; i < AISI_SUBSECTIONS.length; i++) {
    const subDef = AISI_SUBSECTIONS[i];
    const subId = `${rootId}.${subDef.suffix}`;
    
    const subSection = createSection(
      subId,
      subDef.title,
      'AISI_SUB',
      sectionOrder.length + 1 + i,
      group.id,
      rootId,
      timestamp
    );
    
    newSectionsById[subId] = subSection;
    newSectionOrder.push(subId);
  }
  
  return {
    timestamp,
    sectionOrder: newSectionOrder,
    sectionsById: newSectionsById
  };
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Genera el árbol completo de secciones basado en ProjectState.
 * 
 * Esta es una FUNCIÓN PURA - no tiene side effects.
 * Debe ejecutarse después de cargar el JSON exitosamente.
 * 
 * @param projectState - Estado actual del proyecto con groupConfig poblado
 * @returns Nuevo estado de secciones con árbol completo
 * 
 * @example
 * // Después de cargar JSON
 * const newSectionsState = generateInitialSections(projectState);
 * // Despachar comando para actualizar el estado
 */
export function generateInitialSections(projectState: ProjectState): SectionsContentState {
  const timestamp = Date.now();
  
  // Contexto inicial
  let context: GenerationContext = {
    timestamp,
    sectionOrder: [],
    sectionsById: {}
  };
  
  // 1. Generar secciones estáticas
  context = generateStaticSections(context);
  
  // 2. Generar secciones AISD (una por cada grupo)
  const aisdGroups = projectState.groupConfig.aisd;
  for (let i = 0; i < aisdGroups.length; i++) {
    context = generateAISDSections(aisdGroups[i], i, context);
  }
  
  // 3. Generar secciones AISI (una por cada grupo)
  const aisiGroups = projectState.groupConfig.aisi;
  for (let i = 0; i < aisiGroups.length; i++) {
    context = generateAISISections(aisiGroups[i], i, context);
  }
  
  return {
    byId: context.sectionsById,
    sectionOrder: context.sectionOrder,
    activeSectionId: context.sectionOrder[0] || null,
    lastModified: timestamp
  };
}

/**
 * Regenera secciones para un tipo específico (AISD o AISI)
 * Útil cuando se agregan/eliminan grupos después de la carga inicial
 * 
 * @param currentState - Estado actual de secciones
 * @param projectState - Estado del proyecto con groupConfig actualizado
 * @param groupType - Tipo de grupo a regenerar ('AISD' | 'AISI')
 * @returns Nuevo estado de secciones
 */
export function regenerateSectionsForGroupType(
  currentState: SectionsContentState,
  projectState: ProjectState,
  groupType: 'AISD' | 'AISI'
): SectionsContentState {
  const timestamp = Date.now();
  const prefix = groupType === 'AISD' ? '3.1.4.A.' : '3.1.4.B.';
  
  // Filtrar secciones existentes que NO son del tipo a regenerar
  const filteredById: Record<string, Section> = {};
  const filteredOrder: string[] = [];
  
  for (const sectionId of currentState.sectionOrder) {
    if (!sectionId.startsWith(prefix)) {
      filteredById[sectionId] = currentState.byId[sectionId];
      filteredOrder.push(sectionId);
    }
  }
  
  // Crear contexto con secciones filtradas
  let context: GenerationContext = {
    timestamp,
    sectionOrder: filteredOrder,
    sectionsById: filteredById
  };
  
  // Regenerar secciones del tipo específico
  const groups = groupType === 'AISD' 
    ? projectState.groupConfig.aisd 
    : projectState.groupConfig.aisi;
  
  for (let i = 0; i < groups.length; i++) {
    context = groupType === 'AISD'
      ? generateAISDSections(groups[i], i, context)
      : generateAISISections(groups[i], i, context);
  }
  
  return {
    byId: context.sectionsById,
    sectionOrder: context.sectionOrder,
    activeSectionId: currentState.activeSectionId,
    lastModified: timestamp
  };
}

/**
 * Calcula el número total de secciones que se generarían
 * Útil para validación y UI
 */
export function calculateTotalSections(projectState: ProjectState): {
  static: number;
  aisd: number;
  aisi: number;
  total: number;
} {
  const staticCount = STATIC_SECTIONS.length;
  
  // AISD: 1 raíz + 20 subsecciones por grupo
  const aisdPerGroup = 1 + AISD_SUBSECTIONS.length;
  const aisd = projectState.groupConfig.aisd.length * aisdPerGroup;
  
  // AISI: 1 raíz + 9 subsecciones por grupo
  const aisiPerGroup = 1 + AISI_SUBSECTIONS.length;
  const aisi = projectState.groupConfig.aisi.length * aisiPerGroup;
  
  return {
    static: staticCount,
    aisd,
    aisi,
    total: staticCount + aisd + aisi
  };
}

/**
 * Obtiene las subsecciones IDs para un grupo específico
 */
export function getSubsectionIdsForGroup(
  groupId: string,
  sectionsState: SectionsContentState
): readonly string[] {
  return sectionsState.sectionOrder.filter((sectionId: string) => {
    const section = sectionsState.byId[sectionId];
    return section?.groupId === groupId;
  });
}

/**
 * Verifica si una sección es raíz de grupo
 */
export function isGroupRootSection(section: Section): boolean {
  return section.sectionType === 'AISD_ROOT' || section.sectionType === 'AISI_ROOT';
}

/**
 * Verifica si una sección es subsección de grupo
 */
export function isGroupSubSection(section: Section): boolean {
  return section.sectionType === 'AISD_SUB' || section.sectionType === 'AISI_SUB';
}
