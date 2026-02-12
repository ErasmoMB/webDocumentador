import { TestBed } from '@angular/core/testing';
import { ImageManagementFacade } from './image-management.facade';
import { ImageLogicService } from './image-logic.service';
import { ImageStorageService } from './image-storage.service';
import { PhotoNumberingService } from '../photo-numbering.service';
import { FotoItem } from 'src/app/shared/components/image-upload/image-upload.component';

describe('ImageManagementFacade', () => {
  let facade: ImageManagementFacade;
  let mockImageLogic: jasmine.SpyObj<ImageLogicService>;
  let mockImageStorage: jasmine.SpyObj<ImageStorageService>;
  let mockPhotoNumbering: jasmine.SpyObj<PhotoNumberingService>;

  beforeEach(() => {
    mockImageLogic = jasmine.createSpyObj('ImageLogicService', [
      'isValidImage',
      'isImageId',
      'getImageUrl',
      'getFieldWithPrefix'
    ]);
    mockImageStorage = jasmine.createSpyObj('ImageStorageService', [
      'loadImages',
      'saveImages'
    ]);
    mockPhotoNumbering = jasmine.createSpyObj('PhotoNumberingService', [
      'getGroupPrefix'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ImageManagementFacade,
        { provide: ImageLogicService, useValue: mockImageLogic },
        { provide: ImageStorageService, useValue: mockImageStorage },
        { provide: PhotoNumberingService, useValue: mockPhotoNumbering }
      ]
    });

    facade = TestBed.inject(ImageManagementFacade);
  });

  describe('loadImages', () => {
    it('debe delegar a ImageStorageService', () => {
      const fotos: FotoItem[] = [];
      mockImageStorage.loadImages.and.returnValue(fotos);

      const resultado = facade.loadImages('3.1.2', 'prefix', '_A1', 10);

      expect(mockImageStorage.loadImages).toHaveBeenCalledWith('3.1.2', 'prefix', '_A1', 10);
      expect(resultado).toBe(fotos);
    });
  });

  describe('saveImages', () => {
    it('debe delegar a ImageStorageService', () => {
      const fotos: FotoItem[] = [];

      facade.saveImages('3.1.2', 'prefix', fotos, '_A1', 10);

      expect(mockImageStorage.saveImages).toHaveBeenCalledWith('3.1.2', 'prefix', fotos, '_A1', 10);
    });
  });

  describe('getGroupPrefix', () => {
    it('debe delegar a PhotoNumberingService', () => {
      mockPhotoNumbering.getGroupPrefix.and.returnValue('_A1');

      const resultado = facade.getGroupPrefix('3.1.2');

      expect(mockPhotoNumbering.getGroupPrefix).toHaveBeenCalledWith('3.1.2');
      expect(resultado).toBe('_A1');
    });
  });

  describe('isValidImage', () => {
    it('debe delegar a ImageLogicService', () => {
      mockImageLogic.isValidImage.and.returnValue(true);

      const resultado = facade.isValidImage('image.png');

      expect(mockImageLogic.isValidImage).toHaveBeenCalledWith('image.png');
      expect(resultado).toBe(true);
    });
  });

  describe('isImageId', () => {
    it('debe delegar a ImageLogicService', () => {
      mockImageLogic.isImageId.and.returnValue(true);

      const resultado = facade.isImageId('123e4567-e89b-12d3-a456-426614174000');

      expect(mockImageLogic.isImageId).toHaveBeenCalled();
      expect(resultado).toBe(true);
    });
  });

  describe('getImageUrl', () => {
    it('debe delegar a ImageLogicService', () => {
      mockImageLogic.getImageUrl.and.returnValue('http://example.com/image.png');

      const resultado = facade.getImageUrl('image-id');

      expect(mockImageLogic.getImageUrl).toHaveBeenCalledWith('image-id');
      expect(resultado).toBe('http://example.com/image.png');
    });
  });

  describe('getFieldWithPrefix', () => {
    it('debe delegar a ImageLogicService', () => {
      mockImageLogic.getFieldWithPrefix.and.returnValue('campo1_A1');

      const resultado = facade.getFieldWithPrefix('campo1', '_A1');

      expect(mockImageLogic.getFieldWithPrefix).toHaveBeenCalledWith('campo1', '_A1');
      expect(resultado).toBe('campo1_A1');
    });
  });
});
