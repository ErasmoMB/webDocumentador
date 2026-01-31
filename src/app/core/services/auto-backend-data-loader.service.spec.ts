import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { AutoBackendDataLoaderService } from './auto-backend-data-loader.service';
import { BackendApiService } from './infrastructure/backend-api.service';
import { BackendDataMapperService, SectionDataConfig } from './backend-data-mapper.service';
import { CacheService } from './infrastructure/cache.service';
import { CentrosPobladosActivosService } from './centros-poblados-activos.service';

describe('AutoBackendDataLoaderService', () => {
  let service: AutoBackendDataLoaderService;
  let backendApi: jasmine.SpyObj<BackendApiService>;
  let dataMapper: jasmine.SpyObj<BackendDataMapperService>;
  let cacheService: jasmine.SpyObj<CacheService>;

  beforeEach(() => {
    backendApi = jasmine.createSpyObj<BackendApiService>('BackendApiService', [
      'getDatosDemograficos',
      'getCentrosPobladosAISD',
      'postCentrosPobladosPorCodigos'
    ] as any);

    dataMapper = jasmine.createSpyObj<BackendDataMapperService>('BackendDataMapperService', ['getConfig'] as any);

    cacheService = jasmine.createSpyObj<CacheService>('CacheService', [
      'getCachedResponse',
      'saveResponse',
      'clearCache'
    ] as any);

    // Default: no cache hit
    cacheService.getCachedResponse.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        AutoBackendDataLoaderService,
        { provide: BackendApiService, useValue: backendApi },
        { provide: BackendDataMapperService, useValue: dataMapper },
        { provide: CacheService, useValue: cacheService },
        { provide: CentrosPobladosActivosService, useValue: {} }
      ]
    });

    service = TestBed.inject(AutoBackendDataLoaderService);
  });

  it('normaliza id_ubigeo para /demograficos/datos (quita ceros a la izquierda)', async () => {
    backendApi.getDatosDemograficos.and.returnValue(of({ data: [{ ok: true }] } as any));

    const config: SectionDataConfig = {
      demografia: {
        fieldName: 'demografia',
        endpoint: '/demograficos/datos',
        method: 'GET',
        paramType: 'id_ubigeo'
      }
    };

    dataMapper.getConfig.and.returnValue(config);

    const result = await firstValueFrom(service.loadSectionData('seccion6_aisd', '000123', true));

    expect(backendApi.getDatosDemograficos).toHaveBeenCalledWith('123');
    expect(result['demografia']).toEqual([{ ok: true }]);
  });

  it('retorna [] para endpoints desconocidos sin llamar al backend', async () => {
    const config: SectionDataConfig = {
      desconocido: {
        fieldName: 'desconocido',
        endpoint: '/no-existe',
        method: 'GET',
        paramType: 'id_ubigeo'
      }
    };

    dataMapper.getConfig.and.returnValue(config);

    const result = await firstValueFrom(service.loadSectionData('seccionX', '123', true));

    expect(result['desconocido']).toEqual([]);
    expect(backendApi.getDatosDemograficos).not.toHaveBeenCalled();
  });

  it('usa POST con múltiples códigos cuando method=POST', async () => {
    backendApi.postCentrosPobladosPorCodigos.and.returnValue(
      of({ data: { centros_poblados: [{ id: 1 }] } } as any)
    );

    const config: SectionDataConfig = {
      ccpp: {
        fieldName: 'ccpp',
        endpoint: '/centros-poblados/por-codigos-ubigeo',
        method: 'POST',
        paramType: 'id_ubigeo'
      }
    };

    dataMapper.getConfig.and.returnValue(config);

    const result = await firstValueFrom(service.loadSectionData('seccionX', ['010101', '010102'], true));

    expect(backendApi.postCentrosPobladosPorCodigos).toHaveBeenCalledWith(['010101', '010102']);
    expect(result['ccpp']).toEqual([{ id: 1 }]);
  });

  it('agrega demografía en seccion6_aisd con endpoint /demograficos/datos (aggregatable)', async () => {
    backendApi.getDatosDemograficos.and.callFake((id: string) => {
      const response =
        id === '1'
          ? { data: [{ hombres: 2, mujeres: 3, poblacion_total: 5, menores_1: 1, de_1_a_14: 1, de_15_a_29: 1, de_30_a_44: 1, de_45_a_64: 0, mayores_65: 0 }] }
          : { data: [{ hombres: 1, mujeres: 1, poblacion_total: 2, menores_1: 0, de_1_a_14: 0, de_15_a_29: 1, de_30_a_44: 0, de_45_a_64: 0, mayores_65: 0 }] };
      return of(response as any);
    });

    const config: SectionDataConfig = {
      demografia: {
        fieldName: 'demografia',
        endpoint: '/demograficos/datos',
        method: 'GET',
        paramType: 'id_ubigeo',
        aggregatable: true
      }
    };

    dataMapper.getConfig.and.returnValue(config);

    const result = await firstValueFrom(service.loadSectionData('seccion6_aisd', ['1', '2'], true));
    const aggregated = result['demografia'] as any[];

    expect(aggregated.length).toBe(1);
    expect(aggregated[0].hombres).toBe(3);
    expect(aggregated[0].mujeres).toBe(4);
    expect(aggregated[0].poblacion_total).toBe(7);
  });

  it('aplana resultados para endpoint /aisd/centros-poblados (aggregatable)', async () => {
    backendApi.getCentrosPobladosAISD.and.callFake((id: string) => {
      const response = id === 'A' ? { data: [{ id: 'A1' }] } : { data: [{ id: 'B1' }, { id: 'B2' }] };
      return of(response as any);
    });

    const config: SectionDataConfig = {
      ccpp: {
        fieldName: 'ccpp',
        endpoint: '/aisd/centros-poblados',
        method: 'GET',
        paramType: 'id_ubigeo',
        aggregatable: true
      }
    };

    dataMapper.getConfig.and.returnValue(config);

    const result = await firstValueFrom(service.loadSectionData('seccionX', ['A', 'B'], true));
    expect(result['ccpp']).toEqual([{ id: 'A1' }, { id: 'B1' }, { id: 'B2' }]);
  });

  it('genera keys consistentes para merge (seguro/materiales/servicios)', () => {
    const anyService = service as any;

    expect(anyService.generateItemKey({ tipo_seguro: 'SIS', casos: 1 })).toBe('seg|SIS');
    expect(anyService.generateItemKey({ categoria: 'Pared', tipo_material: 'Ladrillo', casos: 1 })).toBe('mat|Pared|Ladrillo');
    expect(anyService.generateItemKey({ servicio: 'Agua', tipo: 'Red', casos: 1 })).toBe('svc|Agua|Red');
  });

  it('mergeResults suma campos numéricos cuando la key coincide', () => {
    const anyService = service as any;
    const results = [
      [{ categoria: 'X', casos: 2, hombres: 1 }],
      [{ categoria: 'X', casos: 3, hombres: 4 }]
    ];

    const merged = anyService.mergeResults(results);
    expect(merged.length).toBe(1);
    expect(merged[0].casos).toBe(5);
    expect(merged[0].hombres).toBe(5);
  });
});
