import { TestBed } from '@angular/core/testing';
import { SectionNavigationService } from './section-navigation.service';
import { SectionAccessControlService } from './section-access-control.service';
import { FormularioDatos } from '../models/formulario.model';

describe('SectionNavigationService', () => {
  let service: SectionNavigationService;
  const mockAccessControl = {
    canAccessSection: (sectionId: string) => !sectionId.includes('block')
  } as SectionAccessControlService;

  const baseDatos: FormularioDatos = {
    comunidadesCampesinas: [{} as any],
    distritosAISI: [{
      id: 'dist_1',
      nombre: 'Distrito 1',
      centrosPobladosSeleccionados: []
    }]
  } as unknown as FormularioDatos;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SectionNavigationService,
        { provide: SectionAccessControlService, useValue: mockAccessControl }
      ]
    });
    service = TestBed.inject(SectionNavigationService);
  });

  it('should skip blocked sections when going next', () => {
    // Inject a blocked section by modifying access control behavior on the fly
    spyOn(mockAccessControl, 'canAccessSection').and.callFake((sectionId: string) => {
      return sectionId !== '3.1.4.A.1.blocked';
    });

    const datos: any = {
      comunidadesCampesinas: [{}],
      distritosAISI: [{
        id: 'd_1',
        nombre: 'D1',
        centrosPobladosSeleccionados: []
      }]
    };

    // Build a custom order including a blocked marker
    spyOn(service, 'obtenerTodasLasSecciones').and.returnValue([
      '3.1.1',
      '3.1.2.A',
      '3.1.3.A',
      '3.1.4.A',
      '3.1.4.A.1.blocked',
      '3.1.4.A.1.2'
    ]);

    const next = service.obtenerSeccionSiguiente('3.1.3.A', datos);
    expect(next).toBe('3.1.4.A');
    const nextAfterA = service.obtenerSeccionSiguiente('3.1.4.A', datos);
    expect(nextAfterA).toBe('3.1.4.A.1.2');
  });

  it('should skip blocked sections when going previous', () => {
    spyOn(service, 'obtenerTodasLasSecciones').and.returnValue([
      '3.1.1',
      '3.1.2.A',
      '3.1.3.A',
      '3.1.4.A.blocked',
      '3.1.4.A.1.1'
    ]);

    spyOn(mockAccessControl, 'canAccessSection').and.callFake((sectionId: string) => {
      return !sectionId.includes('blocked');
    });

    const prev = service.obtenerSeccionAnterior('3.1.4.A.1.1', baseDatos);
    expect(prev).toBe('3.1.3.A');
  });
});
