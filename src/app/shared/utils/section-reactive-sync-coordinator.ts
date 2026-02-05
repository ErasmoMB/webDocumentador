import { ChangeDetectorRef, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { FieldMappingFacade } from 'src/app/core/services/field-mapping/field-mapping.facade';
import { SectionSyncService } from 'src/app/core/services/state/section-sync.service';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';

export interface ReactiveSyncHost {
	seccionId: string;
	datos: any;
	datosAnteriores: any;
	watchedFields: string[];

	obtenerPrefijoGrupo(): string;
	actualizarValoresConPrefijo(): void;
	actualizarDatosCustom(): void;
	onReactiveChanges(changes: Record<string, any>): void;
}

export class SectionReactiveSyncCoordinator {
	private subscription?: Subscription;
	private injector?: Injector;

	constructor(
		private readonly fieldMapping: FieldMappingFacade,
		private readonly cdRef: ChangeDetectorRef
	) {}

	dispose(): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = undefined;
		}
	}

	initialize(injector: Injector | undefined | null, host: ReactiveSyncHost): void {
		this.dispose();
		this.injector = injector || undefined;

		try {
			if (!injector) return;

			const sectionSync = injector.get(SectionSyncService, null);
			if (!sectionSync) return;

			const relevantFields = this.getRelevantFields(host);
			if (relevantFields.length === 0) return;

			this.subscription = sectionSync.subscribeToSection(host.seccionId, relevantFields, (changes: Record<string, any>) => {
				this.handleReactiveChanges(host, changes);
			});
		} catch (error) {
			console.warn('No se pudo inicializar sincronización reactiva:', error);
		}
	}

	private getRelevantFields(host: ReactiveSyncHost): string[] {
		const fields = new Set<string>();

		if (host.watchedFields && host.watchedFields.length > 0) {
			host.watchedFields.forEach(f => fields.add(f));
		}

		try {
			const mappedFields = this.fieldMapping.getFieldsForSection(host.seccionId);
			if (mappedFields && mappedFields.length > 0) {
				mappedFields.forEach(f => fields.add(f));
			}
		} catch {
		}

		const prefijo = host.obtenerPrefijoGrupo();
		if (prefijo) {
			const fieldsArray = Array.from(fields);
			fieldsArray.forEach(f => {
				if (!f.endsWith(prefijo)) {
					fields.add(`${f}${prefijo}`);
				}
			});
		}

		return Array.from(fields);
	}

	private handleReactiveChanges(host: ReactiveSyncHost, changes: Record<string, any>): void {
		if (!changes || Object.keys(changes).length === 0) return;

		let hayCambiosReales = false;
		const prefijo = host.obtenerPrefijoGrupo();

		Object.keys(changes).forEach(fieldName => {
			// Si el host indica que el campo está siendo editado activamente, no sobrescribirlo
			if ((host as any).isFieldBeingEdited && typeof (host as any).isFieldBeingEdited === 'function' && (host as any).isFieldBeingEdited(fieldName)) {
				return;
			}
			const nuevoValor = changes[fieldName];
			const valorAnterior = host.datos[fieldName];

			if (Array.isArray(nuevoValor)) {
				const nuevoArray = nuevoValor.map(item => (typeof item === 'object' && item !== null ? { ...item } : item));

				const contenidoAnterior = JSON.stringify(valorAnterior);
				const contenidoNuevo = JSON.stringify(nuevoArray);

				if (contenidoAnterior !== contenidoNuevo) {
					host.datos[fieldName] = nuevoArray;
					host.datosAnteriores[fieldName] = nuevoArray.map(item => (typeof item === 'object' && item !== null ? { ...item } : item));
					hayCambiosReales = true;

					if (prefijo && fieldName.endsWith(prefijo)) {
						const campoBase = fieldName.replace(prefijo, '');
						host.datos[campoBase] = nuevoArray.map(item => (typeof item === 'object' && item !== null ? { ...item } : item));
					}
				}
			} else {
				if (valorAnterior !== nuevoValor) {
					host.datos[fieldName] = nuevoValor;
					host.datosAnteriores[fieldName] = nuevoValor;
					hayCambiosReales = true;

					if (prefijo && fieldName.endsWith(prefijo)) {
						const campoBase = fieldName.replace(prefijo, '');
						host.datos[campoBase] = nuevoValor;
					}
				}
			}
		});

		if (!hayCambiosReales) return;

		const updates: Record<string, any> = {};
		Object.keys(changes).forEach(fieldName => {
			updates[fieldName] = host.datos[fieldName];

			if (prefijo && fieldName.endsWith(prefijo)) {
				const campoBase = fieldName.replace(prefijo, '');
				updates[campoBase] = host.datos[campoBase];
			}
		});

		if (!this.injector) return;

		// Usar ProjectStateFacade para persistir cambios
		const projectFacade = this.injector.get(ProjectStateFacade, null);
		if (projectFacade) {
			projectFacade.setFields(host.seccionId, null, updates);
		}

		host.actualizarValoresConPrefijo();
		host.onReactiveChanges(changes);
		host.actualizarDatosCustom();

		this.cdRef.markForCheck();
		this.cdRef.detectChanges();
	}
}
