import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should read configuration from window.__ENV__', () => {
    (window as any).__ENV__ = {
      USE_MOCK_DATA: true,
      API_URL: 'http://api.test',
      MOCK_DATA_PATH: 'assets/test',
      NODE_ENV: 'test'
    };

    expect(service.isMockMode()).toBe(true);
    expect(service.getApiUrl()).toBe('http://api.test');
    expect(service.getMockDataPath()).toBe('assets/test');
    expect(service.getNodeEnv()).toBe('test');
  });

  it('should return false for isMockMode when USE_MOCK_DATA is false', () => {
    (window as any).__ENV__ = {
      USE_MOCK_DATA: false,
      API_URL: 'http://api.prod',
      MOCK_DATA_PATH: 'assets/data',
      NODE_ENV: 'production'
    };

    expect(service.isMockMode()).toBe(false);
  });

  it('should fallback to environment.ts when window.__ENV__ is not set', () => {
    (window as any).__ENV__ = undefined;
    const apiUrl = service.getApiUrl();
    
    expect(apiUrl).toBeDefined();
  });
});
