import { TestBed } from '@angular/core/testing';
import { PhotoTransformer } from './photo-transformer.service';
import { TransformedPhoto } from './interfaces';

describe('PhotoTransformer', () => {
  let service: PhotoTransformer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoTransformer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should transform photos correctly', () => {
    const photos = [
      { numero: '1.1', titulo: 'Foto 1', fuente: 'Fuente 1', ruta: '/img1.jpg' },
      { numero: '2.5', titulo: 'Foto 2', fuente: 'Fuente 2', ruta: '/img2.jpg' },
      { numero: '3.10', titulo: 'Foto 3', fuente: 'Fuente 3', ruta: '/img3.jpg' }
    ];

    const result = service.transformPhotos(photos);

    expect(result).toEqual([
      {
        numero: 1,
        titulo: 'Foto 1',
        fuente: 'Fuente 1',
        ruta: '/img1.jpg'
      },
      {
        numero: 5,
        titulo: 'Foto 2',
        fuente: 'Fuente 2',
        ruta: '/img2.jpg'
      },
      {
        numero: 10,
        titulo: 'Foto 3',
        fuente: 'Fuente 3',
        ruta: '/img3.jpg'
      }
    ]);
  });

  it('should filter out invalid photo numbers', () => {
    const photos = [
      { numero: '1.1', titulo: 'Foto 1', fuente: 'Fuente 1', ruta: '/img1.jpg' },
      { numero: 'invalid', titulo: 'Foto 2', fuente: 'Fuente 2', ruta: '/img2.jpg' },
      { numero: '3.15', titulo: 'Foto 3', fuente: 'Fuente 3', ruta: '/img3.jpg' } // > 10, should be filtered
    ];

    const result = service.transformPhotos(photos);

    expect(result).toHaveSize(1);
    expect(result[0]).toEqual({
      numero: 1,
      titulo: 'Foto 1',
      fuente: 'Fuente 1',
      ruta: '/img1.jpg'
    });
  });

  it('should handle empty photos array', () => {
    const result = service.transformPhotos([]);
    expect(result).toEqual([]);
  });

  it('should handle null/undefined photos', () => {
    const result = service.transformPhotos(null as any);
    expect(result).toEqual([]);
  });
});
