import { TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, Injector } from '@angular/core';
import { SectionReactiveSyncCoordinator, ReactiveSyncHost } from './section-reactive-sync-coordinator';
import { FieldMappingFacade } from 'src/app/core/services/field-mapping/field-mapping.facade';
import { SectionSyncService } from 'src/app/core/services/state/section-sync.service';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { Subscription } from 'rxjs';

describe('SectionReactiveSyncCoordinator', () => {
  let coordinator: SectionReactiveSyncCoordinator;
  let mockFieldMapping: jasmine.SpyObj<FieldMappingFacade>;
  let mockCdRef: jasmine.SpyObj<ChangeDetectorRef>;
  let mockSectionSync: jasmine.SpyObj<SectionSyncService>;
  let mockProjectFacade: jasmine.SpyObj<ProjectStateFacade>;
  let injector: Injector;
  let mockHost: ReactiveSyncHost;

  beforeEach(() => {
    mockFieldMapping = jasmine.createSpyObj('FieldMappingFacade', ['getFieldsForSection']);
    mockCdRef = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
    mockSectionSync = jasmine.createSpyObj('SectionSyncService', ['subscribeToSection']);
    mockProjectFacade = jasmine.createSpyObj('ProjectStateFacade', ['setFields', 'setField', 'getSectionFields', 'obtenerDatos']);

    TestBed.configureTestingModule({
      providers: [
        { provide: FieldMappingFacade, useValue: mockFieldMapping },
        { provide: ChangeDetectorRef, useValue: mockCdRef },
        { provide: SectionSyncService, useValue: mockSectionSync },
        { provide: ProjectStateFacade, useValue: mockProjectFacade }
      ]
    });

    injector = TestBed.inject(Injector);
    coordinator = new SectionReactiveSyncCoordinator(mockFieldMapping, mockCdRef);

    mockHost = {
      seccionId: '3.1.2',
      datos: {},
      datosAnteriores: {},
      watchedFields: ['campo1', 'campo2'],
      obtenerPrefijoGrupo: jasmine.createSpy('obtenerPrefijoGrupo').and.returnValue(''),
      actualizarValoresConPrefijo: jasmine.createSpy('actualizarValoresConPrefijo'),
      actualizarDatosCustom: jasmine.createSpy('actualizarDatosCustom'),
      onReactiveChanges: jasmine.createSpy('onReactiveChanges')
    };
  });

  describe('dispose', () => {
    it('debe desuscribirse de la suscripción existente', () => {
      const mockSubscription = jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']);
      (coordinator as any).subscription = mockSubscription;

      coordinator.dispose();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect((coordinator as any).subscription).toBeUndefined();
    });

    it('no debe hacer nada si no hay suscripción', () => {
      expect(() => coordinator.dispose()).not.toThrow();
    });
  });

  describe('initialize', () => {
    it('debe inicializar suscripción cuando SectionSyncService está disponible', () => {
      mockFieldMapping.getFieldsForSection.and.returnValue(['campo3']);
      mockSectionSync.subscribeToSection.and.returnValue(jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']));

      coordinator.initialize(injector, mockHost);

      expect(mockSectionSync.subscribeToSection).toHaveBeenCalled();
    });

    it('no debe inicializar si injector es null', () => {
      coordinator.initialize(null, mockHost);

      expect(mockSectionSync.subscribeToSection).not.toHaveBeenCalled();
    });

    it('no debe inicializar si SectionSyncService no está disponible', () => {
      const mockInjectorSinSync = {
        get: (token: any, notFoundValue?: any) => {
          if (token === SectionSyncService) return null;
          if (token === FieldMappingFacade) return mockFieldMapping;
          if (token === ChangeDetectorRef) return mockCdRef;
          return notFoundValue;
        }
      } as Injector;

      coordinator.initialize(mockInjectorSinSync, mockHost);

      expect(mockSectionSync.subscribeToSection).not.toHaveBeenCalled();
    });

    it('debe incluir watchedFields y mappedFields', () => {
      mockFieldMapping.getFieldsForSection.and.returnValue(['campo3']);
      mockSectionSync.subscribeToSection.and.returnValue(jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']));

      coordinator.initialize(injector, mockHost);

      expect(mockSectionSync.subscribeToSection).toHaveBeenCalledWith(
        '3.1.2',
        jasmine.arrayContaining(['campo1', 'campo2', 'campo3']),
        jasmine.any(Function)
      );
    });

    it('debe agregar prefijo a campos cuando hay prefijo', () => {
      (mockHost.obtenerPrefijoGrupo as jasmine.Spy).and.returnValue('_A1');
      mockFieldMapping.getFieldsForSection.and.returnValue(['campo3']);
      mockSectionSync.subscribeToSection.and.returnValue(jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']));

      coordinator.initialize(injector, mockHost);

      expect(mockSectionSync.subscribeToSection).toHaveBeenCalledWith(
        '3.1.2',
        jasmine.arrayContaining(['campo1_A1', 'campo2_A1', 'campo3_A1']),
        jasmine.any(Function)
      );
    });
  });

  describe('handleReactiveChanges', () => {
    let callback: (changes: Record<string, any>) => void;

    beforeEach(() => {
      mockFieldMapping.getFieldsForSection.and.returnValue([]);
      mockSectionSync.subscribeToSection.and.callFake((sectionId, fields, cb) => {
        callback = cb;
        return jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']);
      });
      coordinator.initialize(injector, mockHost);
    });

    it('debe actualizar datos cuando hay cambios', () => {
      const changes = { campo1: 'nuevoValor' };
      callback(changes);

      expect(mockHost.datos['campo1']).toBe('nuevoValor');
      expect(mockHost.datosAnteriores['campo1']).toBe('nuevoValor');
    });

    it('debe manejar arrays correctamente', () => {
      const changes = { tabla1: [{ id: 1, valor: 'test' }] };
      callback(changes);

      expect(Array.isArray(mockHost.datos['tabla1'])).toBe(true);
      expect(mockHost.datos['tabla1'][0].valor).toBe('test');
    });

    it('debe usar ProjectStateFacade para persistir cambios', () => {
      const changes = { campo1: 'nuevoValor' };
      callback(changes);

      expect(mockProjectFacade.setFields).toHaveBeenCalledWith(
        '3.1.2',
        null,
        jasmine.objectContaining({ campo1: 'nuevoValor' })
      );
    });

    it('debe llamar métodos del host cuando hay cambios', () => {
      const changes = { campo1: 'nuevoValor' };
      callback(changes);

      expect(mockHost.actualizarValoresConPrefijo).toHaveBeenCalled();
      expect(mockHost.onReactiveChanges).toHaveBeenCalledWith(changes);
      expect(mockHost.actualizarDatosCustom).toHaveBeenCalled();
    });

    it('no debe hacer nada si no hay cambios', () => {
      const changes = {};
      callback(changes);

      expect(mockHost.actualizarValoresConPrefijo).not.toHaveBeenCalled();
    });

    it('debe manejar prefijos en campos', () => {
      (mockHost.obtenerPrefijoGrupo as jasmine.Spy).and.returnValue('_A1');
      const changes = { campo1_A1: 'nuevoValor' };
      callback(changes);

      expect(mockHost.datos['campo1_A1']).toBe('nuevoValor');
      expect(mockHost.datos['campo1']).toBe('nuevoValor');
    });

    it('debe llamar markForCheck y detectChanges', () => {
      const changes = { campo1: 'nuevoValor' };
      callback(changes);

      expect(mockCdRef.markForCheck).toHaveBeenCalled();
      expect(mockCdRef.detectChanges).toHaveBeenCalled();
    });
  });
});
