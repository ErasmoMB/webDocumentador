export type GroupType = 'AISD' | 'AISI' | 'BOTH' | 'NONE';

export interface SectionDefinition {
  id: string;
  nombre: string;
  groupType: GroupType;
  requiereConfiguracion: boolean;
  descripcion: string;
}

export interface SectionAccessState {
  sectionId: string;
  isAvailable: boolean;
  reason?: string;
  requiredGroups?: GroupType[];
}

// Mapa de secciones y sus requerimientos de grupo
export const SECTIONS_CONFIG: Record<string, SectionDefinition> = {
  '3.1.1': {
    id: '3.1.1',
    nombre: 'Información General',
    groupType: 'NONE',
    requiereConfiguracion: false,
    descripcion: 'Datos de identificación del documento'
  },
  '3.1.2.A': {
    id: '3.1.2.A',
    nombre: 'Antecedentes Administrativos',
    groupType: 'NONE',
    requiereConfiguracion: false,
    descripcion: 'Información administrativa'
  },
  '3.1.3.A': {
    id: '3.1.3.A',
    nombre: 'Ubicación Geográfica',
    groupType: 'NONE',
    requiereConfiguracion: false,
    descripcion: 'Datos de ubicación'
  },
  '3.1.4.A': {
    id: '3.1.4.A',
    nombre: 'Configuración AISD (Comunidad Campesina)',
    groupType: 'AISD',
    requiereConfiguracion: true,
    descripcion: 'Configuración de secciones AISD'
  },
  '3.1.4.A.1': {
    id: '3.1.4.A.1',
    nombre: 'Secciones AISD Dinámicas',
    groupType: 'AISD',
    requiereConfiguracion: true,
    descripcion: 'Secciones generadas dinámicamente para AISD'
  },
  '3.1.4.B.1': {
    id: '3.1.4.B.1',
    nombre: 'Configuración AISI (Distrito)',
    groupType: 'AISI',
    requiereConfiguracion: true,
    descripcion: 'Configuración de secciones AISI'
  },
  '3.1.4.B': {
    id: '3.1.4.B',
    nombre: 'Secciones AISI Dinámicas',
    groupType: 'AISI',
    requiereConfiguracion: true,
    descripcion: 'Secciones generadas dinámicamente para AISI'
  }
};

export function getSectionGroupType(sectionId: string): GroupType {
  // Secciones dinámicas AISD: 3.1.4.A.X.Y
  if (sectionId.startsWith('3.1.4.A.') && !sectionId.startsWith('3.1.4.A.1.1.1')) {
    return 'AISD';
  }

  // Secciones dinámicas AISI: 3.1.4.B.X.Y
  if (sectionId.startsWith('3.1.4.B.') && !sectionId.startsWith('3.1.4.B.1.1.1')) {
    return 'AISI';
  }

  // Buscar en configuración predefinida
  const config = SECTIONS_CONFIG[sectionId];
  return config?.groupType || 'NONE';
}
