import { TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { SectionPhotoCoordinator, PhotoHost } from './section-photo-coordinator';
import { ImageManagementFacade } from 'src/app/core/services/images/image-management.facade';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { FotoItem } from '../components/image-upload/image-upload.component';

describe('SectionPhotoCoordinator', () => {
  let coordinator: SectionPhotoCoordinator;
  let mockImageFacade: jasmine.SpyObj<ImageManagementFacade>;
  let mockPhotoNumbering: jasmine.SpyObj<PhotoNumberingService>;
  let mockCdRef: jasmine.SpyObj<ChangeDetectorRef>;
  let mockHost: PhotoHost;

  beforeEach(() => {
    mockImageFacade = jasmine.createSpyObj('ImageManagementFacade', [
      'getGroupPrefix',
      'loadImages'
    ]);
    mockPhotoNumbering = jasmine.createSpyObj('PhotoNumberingService', ['getGlobalPhotoNumber']);
    mockCdRef = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ImageManagementFacade, useValue: mockImageFacade },
        { provide: PhotoNumberingService, useValue: mockPhotoNumbering },
        { provide: ChangeDetectorRef, useValue: mockCdRef }
      ]
    });

    coordinator = new SectionPhotoCoordinator(mockImageFacade, mockPhotoNumbering, mockCdRef);

    mockHost = {
      seccionId: '3.1.2',
      modoFormulario: true,
      PHOTO_PREFIX: 'fotografia',
      fotografiasCache: [],
      fotografiasFormMulti: [],
      photoGroups: new Map(),
      photoGroupsConfig: []
    };
  });

  describe('tieneFotografias', () => {
    it('debe retornar true cuando PHOTO_PREFIX está definido', () => {
      const resultado = coordinator.tieneFotografias(mockHost);
      expect(resultado).toBe(true);
    });

    it('debe retornar false cuando PHOTO_PREFIX está vacío', () => {
      (mockHost as any).PHOTO_PREFIX = '';
      const resultado = coordinator.tieneFotografias(mockHost);
      expect(resultado).toBe(false);
    });
  });

  describe('actualizarFotografiasCache', () => {
    it('debe actualizar fotografiasCache cuando PHOTO_PREFIX está definido', () => {
      const fotos: FotoItem[] = [{ numero: '1', titulo: 'Foto 1', fuente: 'Fuente', imagen: 'img.jpg' }];
      mockImageFacade.getGroupPrefix.and.returnValue('');
      mockImageFacade.loadImages.and.returnValue(fotos);

      coordinator.actualizarFotografiasCache(mockHost);

      expect(mockHost.fotografiasCache).toEqual(fotos);
    });

    it('no debe hacer nada cuando PHOTO_PREFIX está vacío', () => {
      (mockHost as any).PHOTO_PREFIX = '';
      coordinator.actualizarFotografiasCache(mockHost);

      expect(mockImageFacade.loadImages).not.toHaveBeenCalled();
    });
  });

  describe('actualizarFotografiasFormMulti', () => {
    it('debe actualizar fotografiasFormMulti cuando PHOTO_PREFIX está definido', () => {
      const fotos: FotoItem[] = [{ numero: '1', titulo: 'Foto 1', fuente: 'Fuente', imagen: 'img.jpg' }];
      mockImageFacade.getGroupPrefix.and.returnValue('');
      mockImageFacade.loadImages.and.returnValue(fotos);

      coordinator.actualizarFotografiasFormMulti(mockHost);

      expect(mockHost.fotografiasFormMulti).toEqual(fotos);
    });
  });
});
