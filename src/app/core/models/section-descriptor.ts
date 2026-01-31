/**
 * section-descriptor.ts
 * Define la interfaz unificada para describir una sección.
 * Permite mapeo automático JSON → grupos → secciones.
 */

export interface FieldDescriptor {
	name: string;
	label: string;
	type: 'text' | 'textarea' | 'number' | 'date' | 'table' | 'image' | 'select';
	required?: boolean;
	mapping?: string; // Ruta de datos del backend (ej: 'educacion.escuelas[0].nombre')
	validation?: {
		pattern?: string;
		minLength?: number;
		maxLength?: number;
	};
	defaultValue?: any;
}

export interface GroupDescriptor {
	id: string;
	name: string;
	label: string;
	order: number;
	fields: FieldDescriptor[];
	layout?: 'form' | 'table' | 'mixed'; // Cómo mostrar los campos
}

export interface SubsectionDescriptor {
	id: string;
	name: string;
	label: string;
	order: number;
	groups: GroupDescriptor[];
}

export interface SectionDescriptor {
	id: string;
	name: string; // Ej: 'seccion1', 'seccion30'
	label: string; // Ej: 'Información General'
	path: string; // Ruta en router (ej: '/secciones/seccion1')
	componentName: string; // Nombre del componente a usar (ej: 'Seccion1Component')
	order: number;
	aisd_groups?: string[]; // Grupos AISD si aplica
	aisi_groups?: string[]; // Grupos AISI si aplica
	subsections: SubsectionDescriptor[];
	metadata?: {
		icon?: string;
		description?: string;
		draft?: boolean; // En desarrollo
	};
}

export interface DocumentDescriptor {
	id: string;
	name: string;
	sections: SectionDescriptor[];
	metadata?: {
		version: string;
		createdAt: Date;
		updatedAt: Date;
		author?: string;
	};
}

export const SECTION_DESCRIPTOR_MODULE = true;
