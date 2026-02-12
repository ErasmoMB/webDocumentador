import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { SectionPersistenceCoordinator } from './section-persistence-coordinator';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FormularioService } from 'src/app/core/services/formulario/formulario.service';

describe('SectionPersistenceCoordinator', () => {
  let coordinator: SectionPersistenceCoordinator;
  let mockProjectFacade: jasmine.SpyObj<ProjectStateFacade>;
  let mockFormularioService: jasmine.SpyObj<FormularioService>;
  let injector: Injector;

  beforeEach(() => {
    mockProjectFacade = jasmine.createSpyObj('ProjectStateFacade', ['setField', 'getSectionFields']);
    mockProjectFacade.getSectionFields.and.returnValue({});

    mockFormularioService = jasmine.createSpyObj('FormularioService', ['actualizarDatos', 'obtenerDatos']);
    mockFormularioService.obtenerDatos.and.returnValue({} as any);

    TestBed.configureTestingModule({
      providers: [
        { provide: ProjectStateFacade, useValue: mockProjectFacade },
        { provide: FormularioService, useValue: mockFormularioService }
      ]
    });

    injector = TestBed.inject(Injector);
    coordinator = new SectionPersistenceCoordinator();
  });

  describe('persistFieldChange', () => {
    const mockHost = {
      seccionId: '3.1.2',
      datos: {}
    };

    it('debe usar ProjectStateFacade.setField cuando está disponible', () => {
      coordinator.persistFieldChange(injector, mockHost, 'campo1', 'valor1');

      expect(mockProjectFacade.setField).toHaveBeenCalledWith(
        '3.1.2',
        null,
        'campo1',
        'valor1'
      );
      expect(mockFormularioService.actualizarDatos).toHaveBeenCalledWith({ campo1: 'valor1' });
    });

    it('debe limpiar valores undefined', () => {
      coordinator.persistFieldChange(injector, mockHost, 'campo1', undefined);

      expect(mockProjectFacade.setField).toHaveBeenCalledWith(
        '3.1.2',
        null,
        'campo1',
        ''
      );
      expect(mockFormularioService.actualizarDatos).toHaveBeenCalledWith({ campo1: '' });
    });

    it('debe limpiar valores string "undefined"', () => {
      coordinator.persistFieldChange(injector, mockHost, 'campo1', 'undefined');

      expect(mockProjectFacade.setField).toHaveBeenCalledWith(
        '3.1.2',
        null,
        'campo1',
        ''
      );
      expect(mockFormularioService.actualizarDatos).toHaveBeenCalledWith({ campo1: '' });
    });

    it('debe usar seccionId "global" cuando no está definido', () => {
      const hostSinSeccion = { seccionId: '', datos: {} };
      coordinator.persistFieldChange(injector, hostSinSeccion, 'campo1', 'valor1');

      expect(mockProjectFacade.setField).toHaveBeenCalledWith(
        'global',
        null,
        'campo1',
        'valor1'
      );
    });

    it('no debe hacer nada cuando injector es null', () => {
      coordinator.persistFieldChange(null, mockHost, 'campo1', 'valor1');

      expect(mockProjectFacade.setField).not.toHaveBeenCalled();
      expect(mockFormularioService.actualizarDatos).not.toHaveBeenCalled();
    });
  });

  describe('restorePersistedSectionState', () => {
    let mockHost: { seccionId: string; datos: Record<string, any> };
    
    beforeEach(() => {
      mockHost = {
        seccionId: '3.1.2',
        datos: {}
      };
    });

    it('debe restaurar estado usando ProjectStateFacade.getSectionFields', () => {
      mockFormularioService.obtenerDatos.and.returnValue({} as any);
      mockProjectFacade.getSectionFields.and.returnValue({ campo1: 'valor1', campo2: 'valor2' });
      
      coordinator.restorePersistedSectionState(injector, mockHost);

      expect(mockProjectFacade.getSectionFields).toHaveBeenCalledWith('3.1.2', null);
      expect(mockHost.datos).toEqual(jasmine.objectContaining({ campo1: 'valor1', campo2: 'valor2' }));
    });

    it('debe usar seccionId "global" cuando no está definido', () => {
      const hostSinSeccion = { seccionId: '', datos: {} };
      mockFormularioService.obtenerDatos.and.returnValue({} as any);
      mockProjectFacade.getSectionFields.and.returnValue({ campo1: 'valor1' });
      
      coordinator.restorePersistedSectionState(injector, hostSinSeccion);

      expect(mockProjectFacade.getSectionFields).toHaveBeenCalledWith('global', null);
    });

    it('no debe hacer nada cuando injector es null', () => {
      coordinator.restorePersistedSectionState(null, mockHost);

      expect(mockProjectFacade.getSectionFields).not.toHaveBeenCalled();
      expect(mockFormularioService.obtenerDatos).not.toHaveBeenCalled();
    });

    it('debe buscar en global si la sección está vacía', () => {
      mockFormularioService.obtenerDatos.and.returnValue({} as any);
      mockProjectFacade.getSectionFields.and.callFake((sectionId: string) => {
        if (sectionId === '3.1.2') return {};
        if (sectionId === 'global') return { campoGlobal: 'valorGlobal' };
        return {};
      });
      
      coordinator.restorePersistedSectionState(injector, mockHost);

      expect(mockProjectFacade.getSectionFields).toHaveBeenCalledWith('3.1.2', null);
      expect(mockProjectFacade.getSectionFields).toHaveBeenCalledWith('global', null);
    });

    it('debe cargar datos primero desde FormularioService (localStorage)', () => {
      mockFormularioService.obtenerDatos.and.returnValue({ campoLegacy: 'valorLegacy', projectName: 'MiProyecto' } as any);
      mockProjectFacade.getSectionFields.and.returnValue({});
      
      coordinator.restorePersistedSectionState(injector, mockHost);

      expect(mockFormularioService.obtenerDatos).toHaveBeenCalled();
      expect(mockHost.datos).toEqual(jasmine.objectContaining({ campoLegacy: 'valorLegacy', projectName: 'MiProyecto' }));
    });
  });
});
