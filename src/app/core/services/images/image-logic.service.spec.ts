import { TestBed } from '@angular/core/testing';
import { ImageLogicService } from './image-logic.service';
import { ImageBackendService } from '../image-backend.service';

describe('ImageLogicService', () => {
  let service: ImageLogicService;
  let mockImageBackendService: jasmine.SpyObj<ImageBackendService>;

  beforeEach(() => {
    mockImageBackendService = jasmine.createSpyObj('ImageBackendService', ['getImageUrl']);

    TestBed.configureTestingModule({
      providers: [
        ImageLogicService,
        { provide: ImageBackendService, useValue: mockImageBackendService }
      ]
    });

    service = TestBed.inject(ImageLogicService);
  });

  describe('isValidImage', () => {
    it('debe retornar false para valores null o undefined', () => {
      expect(service.isValidImage(null)).toBe(false);
      expect(service.isValidImage(undefined)).toBe(false);
    });

    it('debe retornar false para strings vacíos', () => {
      expect(service.isValidImage('')).toBe(false);
      expect(service.isValidImage('   ')).toBe(false);
    });

    it('debe retornar false para string "null"', () => {
      expect(service.isValidImage('null')).toBe(false);
    });

    it('debe retornar true para data URLs', () => {
      expect(service.isValidImage('data:image/png;base64,iVBORw0KGgoAAAANS')).toBe(true);
    });

    it('debe retornar true para strings largos (probablemente base64)', () => {
      const longString = 'a'.repeat(101);
      expect(service.isValidImage(longString)).toBe(true);
    });

    it('debe retornar true para image IDs válidos', () => {
      const imageId = '123e4567-e89b-12d3-a456-426614174000';
      expect(service.isValidImage(imageId)).toBe(true);
    });

    it('debe retornar true para archivos File con tipo image', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      expect(service.isValidImage(file)).toBe(true);
    });

    it('debe retornar false para archivos File sin tipo image', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(service.isValidImage(file)).toBe(false);
    });
  });

  describe('isImageId', () => {
    it('debe retornar true para UUIDs válidos', () => {
      expect(service.isImageId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(service.isImageId('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
    });

    it('debe retornar false para strings que no son UUIDs', () => {
      expect(service.isImageId('not-a-uuid')).toBe(false);
      expect(service.isImageId('123')).toBe(false);
      expect(service.isImageId('')).toBe(false);
    });

    it('debe retornar false para valores no string', () => {
      expect(service.isImageId(null as any)).toBe(false);
      expect(service.isImageId(123 as any)).toBe(false);
      expect(service.isImageId({} as any)).toBe(false);
    });
  });

  describe('getImageUrl', () => {
    it('debe retornar string vacío para valores null o undefined', () => {
      expect(service.getImageUrl('')).toBe('');
      expect(service.getImageUrl(null as any)).toBe('');
    });

    it('debe retornar data URL sin modificar', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANS';
      expect(service.getImageUrl(dataUrl)).toBe(dataUrl);
    });

    it('debe retornar HTTP URL sin modificar', () => {
      const httpUrl = 'http://example.com/image.png';
      expect(service.getImageUrl(httpUrl)).toBe(httpUrl);
    });

    it('debe usar ImageBackendService para image IDs', () => {
      const imageId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedUrl = 'http://backend.com/images/' + imageId;
      mockImageBackendService.getImageUrl.and.returnValue(expectedUrl);

      const result = service.getImageUrl(imageId);

      expect(mockImageBackendService.getImageUrl).toHaveBeenCalledWith(imageId);
      expect(result).toBe(expectedUrl);
    });

    it('debe retornar el string original si no es data URL, HTTP URL ni image ID', () => {
      const plainString = 'some-image-path';
      expect(service.getImageUrl(plainString)).toBe(plainString);
    });
  });

  describe('normalizeImageValue', () => {
    it('debe retornar string vacío para valores null o undefined', () => {
      expect(service.normalizeImageValue(null as any)).toBe('');
      expect(service.normalizeImageValue(undefined as any)).toBe('');
      expect(service.normalizeImageValue('')).toBe('');
    });

    it('debe retornar data URL sin modificar', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANS';
      expect(service.normalizeImageValue(dataUrl)).toBe(dataUrl);
    });

    it('debe retornar image ID sin modificar', () => {
      const imageId = '123e4567-e89b-12d3-a456-426614174000';
      expect(service.normalizeImageValue(imageId)).toBe(imageId);
    });

    it('debe extraer UUID de URL de API', () => {
      const apiUrl = '/api/imagenes/123e4567-e89b-12d3-a456-426614174000';
      expect(service.normalizeImageValue(apiUrl)).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('debe retornar string original si no coincide con ningún patrón', () => {
      const plainString = 'some-image-path';
      expect(service.normalizeImageValue(plainString)).toBe(plainString);
    });
  });

  describe('getFieldWithPrefix', () => {
    it('debe retornar campo sin prefijo cuando groupPrefix está vacío', () => {
      expect(service.getFieldWithPrefix('campo1', '')).toBe('campo1');
    });

    it('debe retornar campo con prefijo cuando groupPrefix está presente', () => {
      expect(service.getFieldWithPrefix('campo1', '_A1')).toBe('campo1_A1');
    });

    it('debe manejar groupPrefix por defecto como vacío', () => {
      expect(service.getFieldWithPrefix('campo1')).toBe('campo1');
    });
  });
});
