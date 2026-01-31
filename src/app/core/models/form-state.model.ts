/**
 * form-state.model.ts
 * Modelos de estado del formulario.
 */

export interface FormFieldState {
	value: any;
	touched: boolean;
	dirty: boolean;
	errors?: { [key: string]: string };
	metadata?: {
		autoloadedFrom?: string;
		manuallyEdited?: boolean;
	};
}

export interface GroupState {
	[fieldName: string]: FormFieldState;
}

export interface SectionFormState {
	[groupId: string]: GroupState;
}

export interface FormState {
	[sectionId: string]: SectionFormState;
}

export const FORM_STATE_MODEL = true;
