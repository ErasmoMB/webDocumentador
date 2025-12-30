import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { ConfigService } from './config.service';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService, ConfigService]
    });

    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get poblacion data in mock mode', (done) => {
    (window as any).__ENV__ = { USE_MOCK_DATA: true };
    
    service.getSharedData('poblacion').subscribe((data) => {
      expect(data).toBeDefined();
      expect(Array.isArray(data) || typeof data === 'object').toBe(true);
      done();
    });
  });

  it('should get pea data in mock mode', (done) => {
    (window as any).__ENV__ = { USE_MOCK_DATA: true };
    
    service.getSharedData('pea').subscribe((data) => {
      expect(data).toBeDefined();
      done();
    });
  });

  it('should get economia data in mock mode', (done) => {
    (window as any).__ENV__ = { USE_MOCK_DATA: true };
    
    service.getSharedData('economia').subscribe((data) => {
      expect(data).toBeDefined();
      done();
    });
  });

  it('should fetch from API in non-mock mode', () => {
    (window as any).__ENV__ = { 
      USE_MOCK_DATA: false, 
      API_URL: 'http://localhost:3000/api' 
    };

    service.getSharedData('poblacion').subscribe();

    const req = httpMock.expectOne((request) => 
      request.url.includes('datos_poblacion')
    );
    
    expect(req.request.method).toBe('GET');
  });
});
