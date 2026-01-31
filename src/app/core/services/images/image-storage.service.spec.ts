import { TestBed } from '@angular/core/testing';
import { ImageStorageService } from './image-storage.service';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { ReactiveStateAdapter } from '../state-adapters/reactive-state-adapter.service';
import { PhotoNumberingService } from '../photo-numbering.service';
import { FormChangeService } from '../state/form-change.service';
import { ImageLogicService } from './image-logic.service';
import { FotoItem } from 'src/app/shared/components/image-upload/image-upload.component';
import { FormularioDatos } from 'src/app/core/models/formulario.model';

describe('ImageStorageService', () => {
  let service: ImageStorageService;
  let mockProjectFacade: jasmine.SpyObj<ProjectStateFacade>;
  let mockPhotoNumbering: jasmine.SpyObj<PhotoNumberingService>;
  let mockStateAdapter: jasmine.SpyObj<ReactiveStateAdapter>;
  let mockFormChange: jasmine.SpyObj<FormChangeService>;
  let mockImageLogic: jasmine.SpyObj<ImageLogicService>;

  beforeEach(() => {
    mockProjectFacade = jasmine.createSpyObj('ProjectStateFacade', ['obtenerDatos']);
    mockPhotoNumbering = jasmine.createSpyObj('PhotoNumberingService', ['getGlobalPhotoNumber']);
    mockStateAdapter = jasmine.createSpyObj('ReactiveStateAdapter', ['setDatos', 'refreshFromStorage']);
    mockFormChange = jasmine.createSpyObj('FormChangeService', ['persistFields']);
    mockImageLogic = jasmine.createSpyObj('ImageLogicService', ['isValidImage', 'getImageUrl', 'normalizeImageValue']);

    TestBed.configureTestingModule({
      providers: [
        ImageStorageService,
        { provide: ProjectStateFacade, useValue: mockProjectFacade },
        { provide: PhotoNumberingService, useValue: mockPhotoNumbering },
        { provide: ReactiveStateAdapter, useValue: mockStateAdapter },
        { provide: FormChangeService, useValue: mockFormChange },
        { provide: ImageLogicService, useValue: mockImageLogic }
      ]
    });

    service = TestBed.inject(ImageStorageService);
  });

  describe('loadImages', () => {
    it('debe cargar imágenes desde datos', () => {
      const datos = {
        'prefix1Imagen': 'image1.jpg',
        'prefix1Titulo': 'Título 1',
        'prefix1Fuente': 'Fuente 1'
      } as Partial<FormularioDatos> as FormularioDatos;
      mockProjectFacade.obtenerDatos.and.returnValue(datos);
      mockImageLogic.isValidImage.and.returnValue(true);
      mockImageLogic.getImageUrl.and.returnValue('http://example.com/image1.jpg');
      mockPhotoNumbering.getGlobalPhotoNumber.and.returnValue('1');

      const resultado = service.loadImages('3.1.2', 'prefix', '', 10);

      expect(resultado.length).toBeGreaterThan(0);
      expect(mockImageLogic.isValidImage).toHaveBeenCalled();
    });

    it('debe usar groupPrefix cuando está presente', () => {
      const datos = {
        'prefix1Imagen_A1': 'image1.jpg',
        'prefix1Titulo_A1': 'Título 1'
      } as Partial<FormularioDatos> as FormularioDatos;
      mockProjectFacade.obtenerDatos.and.returnValue(datos);
      mockImageLogic.isValidImage.and.returnValue(true);
      mockImageLogic.getImageUrl.and.returnValue('http://example.com/image1.jpg');
      mockPhotoNumbering.getGlobalPhotoNumber.and.returnValue('1');

      const resultado = service.loadImages('3.1.2', 'prefix', '_A1', 10);

      expect(mockImageLogic.isValidImage).toHaveBeenCalled();
    });
  });

  describe('saveImages', () => {
    it('debe guardar imágenes usando FormChangeService', () => {
      const fotos: FotoItem[] = [
        { numero: '1', titulo: 'Foto 1', fuente: 'Fuente 1', imagen: 'image1.jpg' }
      ];
      mockImageLogic.isValidImage.and.returnValue(true);
      mockImageLogic.normalizeImageValue.and.returnValue('image1.jpg');
      mockPhotoNumbering.getGlobalPhotoNumber.and.returnValue('1');
      mockProjectFacade.obtenerDatos.and.returnValue({} as any);

      service.saveImages('3.1.2', 'prefix', fotos, '', 10);

      expect(mockFormChange.persistFields).toHaveBeenCalled();
    });

    it('debe usar groupPrefix cuando está presente', () => {
      const fotos: FotoItem[] = [
        { numero: '1', titulo: 'Foto 1', fuente: 'Fuente 1', imagen: 'image1.jpg' }
      ];
      mockImageLogic.isValidImage.and.returnValue(true);
      mockImageLogic.normalizeImageValue.and.returnValue('image1.jpg');
      mockPhotoNumbering.getGlobalPhotoNumber.and.returnValue('1');
      mockProjectFacade.obtenerDatos.and.returnValue({} as any);

      service.saveImages('3.1.2', 'prefix', fotos, '_A1', 10);

      expect(mockFormChange.persistFields).toHaveBeenCalled();
    });
  });
});
