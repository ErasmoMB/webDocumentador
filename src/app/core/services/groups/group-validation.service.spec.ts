import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { GroupValidationService } from './group-validation.service';
import { GroupConfigService } from './group-config.service';
import { GroupConfig } from '../models/group-config.model';

describe('GroupValidationService', () => {
  let service: GroupValidationService;
  let configSubject: BehaviorSubject<GroupConfig | null>;

  const mockGroupConfigService = {
    config$: undefined as any,
    getConfig: () => configSubject.value,
    getAISD: () => configSubject.value?.aisd?.[0] || null,
    getAISI: () => configSubject.value?.aisi?.[0] || null,
    getAllAISD: () => configSubject.value?.aisd || []
  } as GroupConfigService;

  beforeEach(() => {
    configSubject = new BehaviorSubject<GroupConfig | null>(null);
    mockGroupConfigService.config$ = configSubject.asObservable();

    TestBed.configureTestingModule({
      providers: [
        GroupValidationService,
        { provide: GroupConfigService, useValue: mockGroupConfigService }
      ]
    });
    service = TestBed.inject(GroupValidationService);
  });

  it('should mark config invalid when empty', () => {
    expect(service.isConfigValid()).toBeFalse();
    service.getValidationState().subscribe(state => {
      expect(state.isValid).toBeFalse();
    });
  });

  it('should validate when AISD present with ccpp', () => {
    configSubject.next({
      aisd: [{ nombre: 'CC', tipo: 'AISD', ccppList: [], ccppActivos: ['001'] }]
    });

    expect(service.isConfigValid()).toBeTrue();
    expect(service.hasAISD()).toBeTrue();
    expect(service.canAccessAISDSection()).toBeTrue();
    service.getValidationState().subscribe(state => {
      expect(state.hasAISD).toBeTrue();
      expect(state.isValid).toBeTrue();
    });
  });

  it('should report errors when configured without active ccpp', () => {
    configSubject.next({
      aisd: [{ nombre: 'CC', tipo: 'AISD', ccppList: [], ccppActivos: [] }]
    });
    const errors = service.getValidationErrors();
    expect(errors.length).toBeGreaterThan(0);
  });
});
