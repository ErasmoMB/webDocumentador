import { TestBed } from '@angular/core/testing';
import { GroupConfigService } from './group-config.service';
import { Grupo } from '../models/group-config.model';

describe('GroupConfigService', () => {
  let service: GroupConfigService;
  const storage: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    }
  } as Storage;

  beforeEach(() => {
    Object.keys(storage).forEach(k => delete storage[k]);
    spyOn(window.localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(window.localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(window.localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);

    TestBed.configureTestingModule({
      providers: [GroupConfigService]
    });
    service = TestBed.inject(GroupConfigService);
  });

  it('should set and get AISD group', () => {
    const grupo: Grupo = {
      nombre: 'CC Ayroca',
      tipo: 'AISD',
      ccppList: [],
      ccppActivos: ['001']
    };
    service.setAISD(grupo);
    // getAISD() devuelve el primer grupo del array (índice 0 por defecto)
    expect(service.getAISD(0)).toEqual(grupo);
    expect(service.getAISDCCPPActivos(0)).toEqual(['001']);
  });

  it('should update AISD active CCPP', () => {
    const grupo: Grupo = {
      nombre: 'CC Ayroca',
      tipo: 'AISD',
      ccppList: [],
      ccppActivos: []
    };
    service.setAISD(grupo);
    // setAISDCCPPActivos actualiza el grupo en el índice 0 por defecto
    service.setAISDCCPPActivos(['010', '020'], 0);
    expect(service.getAISDCCPPActivos(0)).toEqual(['010', '020']);
  });

  it('should clear all config', () => {
    const grupo: Grupo = {
      nombre: 'CC Ayroca',
      tipo: 'AISD',
      ccppList: [],
      ccppActivos: ['001']
    };
    service.setAISD(grupo);
    service.clearAll();
    expect(service.getConfig()).toBeNull();
  });
});
