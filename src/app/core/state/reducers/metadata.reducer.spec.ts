/**
 * METADATA REDUCER TESTS
 * 
 * Tests unitarios para el reducer de metadata.
 * Verifica: pureza, inmutabilidad, determinismo.
 */

import { metadataReducer, createInitialMetadata } from './metadata.reducer';
import { INITIAL_PROJECT_METADATA, ProjectMetadata } from '../project-state.model';
import { 
  SetProjectNameCommand,
  SetConsultoraCommand,
  SetDetalleProyectoCommand,
  UpdateMetadataCommand
} from '../commands.model';

describe('MetadataReducer', () => {
  
  describe('Pureza y Determinismo', () => {
    it('debe retornar el mismo estado si no hay cambios', () => {
      const state: ProjectMetadata = {
        ...INITIAL_PROJECT_METADATA,
        projectName: 'Test Project'
      };
      
      const command: SetProjectNameCommand = {
        type: 'metadata/setProjectName',
        payload: { projectName: 'Test Project' }
      };

      const result = metadataReducer(state, command);
      expect(result).toBe(state); // Misma referencia
    });

    it('debe ser determinista - mismo input produce mismo output', () => {
      const state = { ...INITIAL_PROJECT_METADATA };
      const command: SetProjectNameCommand = {
        type: 'metadata/setProjectName',
        payload: { projectName: 'Project X' }
      };

      const result1 = metadataReducer(state, command);
      const result2 = metadataReducer(state, command);

      expect(result1.projectName).toBe(result2.projectName);
    });

    it('no debe mutar el estado original', () => {
      const state = { ...INITIAL_PROJECT_METADATA, projectName: 'Original' };
      const originalState = { ...state };
      
      const command: SetProjectNameCommand = {
        type: 'metadata/setProjectName',
        payload: { projectName: 'Modified' }
      };

      metadataReducer(state, command);
      
      expect(state).toEqual(originalState);
    });
  });

  describe('SetProjectName', () => {
    it('debe actualizar projectName', () => {
      const state = { ...INITIAL_PROJECT_METADATA };
      const command: SetProjectNameCommand = {
        type: 'metadata/setProjectName',
        payload: { projectName: 'Mi Proyecto' }
      };

      const result = metadataReducer(state, command);

      expect(result.projectName).toBe('Mi Proyecto');
      expect(result.updatedAt).toBeGreaterThan(0);
    });

    it('debe manejar string vacío', () => {
      const state = { ...INITIAL_PROJECT_METADATA, projectName: 'Test' };
      const command: SetProjectNameCommand = {
        type: 'metadata/setProjectName',
        payload: { projectName: '' }
      };

      const result = metadataReducer(state, command);

      expect(result.projectName).toBe('');
    });
  });

  describe('SetConsultora', () => {
    it('debe actualizar consultora', () => {
      const state = { ...INITIAL_PROJECT_METADATA };
      const command: SetConsultoraCommand = {
        type: 'metadata/setConsultora',
        payload: { consultora: 'Consultora ABC' }
      };

      const result = metadataReducer(state, command);

      expect(result.consultora).toBe('Consultora ABC');
    });
  });

  describe('SetDetalleProyecto', () => {
    it('debe actualizar detalleProyecto', () => {
      const state = { ...INITIAL_PROJECT_METADATA };
      const command: SetDetalleProyectoCommand = {
        type: 'metadata/setDetalleProyecto',
        payload: { detalleProyecto: 'Descripción detallada del proyecto' }
      };

      const result = metadataReducer(state, command);

      expect(result.detalleProyecto).toBe('Descripción detallada del proyecto');
    });
  });

  describe('UpdateMetadata', () => {
    it('debe actualizar múltiples campos', () => {
      const state = { ...INITIAL_PROJECT_METADATA };
      const command: UpdateMetadataCommand = {
        type: 'metadata/update',
        payload: {
          projectName: 'Nuevo Nombre',
          consultora: 'Nueva Consultora'
        }
      };

      const result = metadataReducer(state, command);

      expect(result.projectName).toBe('Nuevo Nombre');
      expect(result.consultora).toBe('Nueva Consultora');
      expect(result.detalleProyecto).toBe(''); // No cambia
    });

    it('debe ignorar campos undefined', () => {
      const state = { 
        ...INITIAL_PROJECT_METADATA,
        projectName: 'Original',
        consultora: 'Original'
      };
      const command: UpdateMetadataCommand = {
        type: 'metadata/update',
        payload: {
          projectName: 'Nuevo'
        }
      };

      const result = metadataReducer(state, command);

      expect(result.projectName).toBe('Nuevo');
      expect(result.consultora).toBe('Original');
    });

    it('no debe cambiar si todos los valores son iguales', () => {
      const state = { 
        ...INITIAL_PROJECT_METADATA,
        projectName: 'Test'
      };
      const command: UpdateMetadataCommand = {
        type: 'metadata/update',
        payload: {
          projectName: 'Test'
        }
      };

      const result = metadataReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('CreateInitialMetadata', () => {
    it('debe crear metadata con timestamps', () => {
      const metadata = createInitialMetadata();

      expect(metadata.projectId).toMatch(/^project_\d+$/);
      expect(metadata.createdAt).toBeGreaterThan(0);
      expect(metadata.updatedAt).toBeGreaterThan(0);
    });

    it('debe aceptar projectId personalizado', () => {
      const metadata = createInitialMetadata('custom-id');

      expect(metadata.projectId).toBe('custom-id');
    });
  });
});
