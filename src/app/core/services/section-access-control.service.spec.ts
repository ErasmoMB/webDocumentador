import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { GroupConfigService } from './group-config.service';
import { GroupValidationService } from './group-validation.service';
import { SectionAccessControlService } from './section-access-control.service';
import { GroupConfig } from '../models/group-config.model';

describe('SectionAccessControlService', () => {
  let service: SectionAccessControlService;
  let configSubject: BehaviorSubject<GroupConfig | null>;

  const mockGroupConfigService = {
    config$: undefined as any,
    getConfig: () => configSubject.value
  } as GroupConfigService;

  const mockGroupValidationService = {
    getValidationState: () => of({
      config: {},
      isValid: false,
      hasAISD: false,
      hasAISI: false
    }),
    isConfigValid: () => false
  } as GroupValidationService;

  beforeEach(() => {
    configSubject = new BehaviorSubject<GroupConfig | null>(null);
    mockGroupConfigService.config$ = configSubject.asObservable();

    TestBed.configureTestingModule({
      providers: [
        SectionAccessControlService,
        { provide: GroupConfigService, useValue: mockGroupConfigService },
        { provide: GroupValidationService, useValue: mockGroupValidationService }
      ]
    });
    service = TestBed.inject(SectionAccessControlService);
  });

  it('denies AISD section when not configured', (done) => {
    service.isSectionAvailable$('3.1.4.A').subscribe(isAvailable => {
      expect(isAvailable).toBeFalse();
      done();
    });
  });

  it('allows AISD section when config has active ccpp', (done) => {
    configSubject.next({ aisd: { nombre: 'CC', tipo: 'AISD', ccppList: [], ccppActivos: ['001'] } });
    spyOn(mockGroupValidationService, 'getValidationState').and.returnValue(of({
      config: configSubject.value!,
      isValid: true,
      hasAISD: true,
      hasAISI: false
    }));

    service.isSectionAvailable$('3.1.4.A.1').subscribe(isAvailable => {
      expect(isAvailable).toBeTrue();
      done();
    });
  });

  it('allows sections without restriction', () => {
    expect(service.canAccessSection('3.1.1')).toBeTrue();
  });
});
