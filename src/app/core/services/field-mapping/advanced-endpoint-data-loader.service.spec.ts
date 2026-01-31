import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BackendApiService } from '../infrastructure/backend-api.service';
import { AisdAggregationService } from './aisd-aggregation.service';
import { AdvancedEndpointDataLoaderService } from './advanced-endpoint-data-loader.service';
import { DemographyAggregatorService } from './demography-aggregator.service';
import { DemographyTableTransformService } from './demography-table-transform.service';
import { CategoryAggregationService } from './category-aggregation.service';
import { CategoryTableTransformService } from './category-table-transform.service';

describe('AdvancedEndpointDataLoaderService', () => {
  let service: AdvancedEndpointDataLoaderService;
  let aisdAggregation: jasmine.SpyObj<AisdAggregationService>;
  let demographyTransform: jasmine.SpyObj<DemographyTableTransformService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdvancedEndpointDataLoaderService,
        {
          provide: BackendApiService,
          useValue: {
            getPET: jasmine.createSpy('getPET'),
            getDatosDemograficos: jasmine.createSpy('getDatosDemograficos'),
            getActividadesPrincipales: jasmine.createSpy('getActividadesPrincipales'),
            getLenguasPorUbicacion: jasmine.createSpy('getLenguasPorUbicacion'),
            getReligionesPorUbicacion: jasmine.createSpy('getReligionesPorUbicacion'),
            getMaterialesConstruccion: jasmine.createSpy('getMaterialesConstruccion')
          }
        },
        {
          provide: AisdAggregationService,
          useValue: jasmine.createSpyObj<AisdAggregationService>('AisdAggregationService', ['loadAggregated'])
        },
        {
          provide: DemographyAggregatorService,
          useValue: jasmine.createSpyObj<DemographyAggregatorService>('DemographyAggregatorService', [
            'addDemografia',
            'addDemograficos'
          ])
        },
        {
          provide: DemographyTableTransformService,
          useValue: jasmine.createSpyObj<DemographyTableTransformService>('DemographyTableTransformService', [
            'transformarPET',
            'transformarPoblacionSexo',
            'transformarPoblacionEtario'
          ])
        },
        {
          provide: CategoryAggregationService,
          useValue: jasmine.createSpyObj<CategoryAggregationService>('CategoryAggregationService', [
            'addDirectByCategoria',
            'addMateriales'
          ])
        },
        {
          provide: CategoryTableTransformService,
          useValue: jasmine.createSpyObj<CategoryTableTransformService>('CategoryTableTransformService', [
            'transformPEAOcupaciones',
            'calculateDirectPercentages'
          ])
        }
      ]
    });

    service = TestBed.inject(AdvancedEndpointDataLoaderService);
    aisdAggregation = TestBed.inject(AisdAggregationService) as jasmine.SpyObj<AisdAggregationService>;
    demographyTransform = TestBed.inject(
      DemographyTableTransformService
    ) as jasmine.SpyObj<DemographyTableTransformService>;
  });

  it('devuelve null si no hay handler para el endpoint/campo', () => {
    const mapping = { fieldName: 'x', endpoint: '/no-existe', dataSource: 'backend' as const };
    const result = service.tryLoad('x', '3.1.1', mapping, { id_ubigeo: '000000' });
    expect(result).toBeNull();
  });

  it('aplica mapping.transform en /aisd/pet', (done) => {
    aisdAggregation.loadAggregated.and.returnValue(of(['raw']));

    const mapping = {
      fieldName: 'pet',
      endpoint: '/aisd/pet',
      dataSource: 'backend' as const,
      transform: (data: any) => ['t:' + String(Array.isArray(data) ? data[0] : data)]
    };

    const obs = service.tryLoad('pet', '3.1.4', mapping, { id_ubigeo: '000000' });
    expect(obs).not.toBeNull();

    obs!.subscribe(value => {
      expect(value).toEqual(['t:raw']);
      expect(aisdAggregation.loadAggregated).toHaveBeenCalled();
      done();
    });
  });

  it('usa el transformador de tabla para petTabla', (done) => {
    aisdAggregation.loadAggregated.and.returnValue(of([{ de_15_a_29: 1 }]));
    demographyTransform.transformarPET.and.returnValue([{ categoria: '15 a 29 años', casos: 1, porcentaje: '100,00 %' }]);

    const mapping = { fieldName: 'petTabla', endpoint: '/any', dataSource: 'backend' as const };

    const obs = service.tryLoad('petTabla', '3.1.4', mapping, { id_ubigeo: '000000' });
    expect(obs).not.toBeNull();

    obs!.subscribe(value => {
      expect(demographyTransform.transformarPET).toHaveBeenCalled();
      expect(value).toEqual([{ categoria: '15 a 29 años', casos: 1, porcentaje: '100,00 %' }]);
      done();
    });
  });
});
