/**
 * IMAGES REDUCER TESTS
 * 
 * Tests unitarios para el reducer de imágenes.
 * Verifica: pureza, inmutabilidad, numeración global.
 */

import { 
  imagesReducer, 
  getImagesBySection, 
  getImageById,
  countPendingUploads,
  getTotalImages 
} from './images.reducer';
import { 
  INITIAL_IMAGES_STATE, 
  ImagesState, 
  generateImageGroupKey 
} from '../project-state.model';
import { 
  AddImageCommand,
  UpdateImageCommand,
  RemoveImageCommand,
  ReorderImagesCommand,
  SetImageUploadStatusCommand,
  ClearSectionImagesCommand
} from '../commands.model';

describe('ImagesReducer', () => {
  
  describe('Pureza y Determinismo', () => {
    it('no debe mutar el estado original', () => {
      const state = { ...INITIAL_IMAGES_STATE };
      const originalById = { ...state.byId };
      
      const command: AddImageCommand = {
        type: 'image/add',
        payload: {
          sectionId: 'section1',
          groupId: null,
          titulo: 'Imagen 1',
          fuente: 'Fuente',
          preview: 'data:image/png;base64,...',
          localPath: '/path/to/image.png'
        }
      };

      imagesReducer(state, command);
      
      expect(state.byId).toEqual(originalById);
    });
  });

  describe('AddImage', () => {
    it('debe agregar imagen con número global', () => {
      const state = { ...INITIAL_IMAGES_STATE };
      const command: AddImageCommand = {
        type: 'image/add',
        payload: {
          sectionId: 'section1',
          groupId: null,
          titulo: 'Vista panorámica',
          fuente: 'Trabajo de campo',
          preview: 'base64...',
          localPath: null
        }
      };

      const result = imagesReducer(state, command);

      expect(result.allIds.length).toBe(1);
      const imageId = result.allIds[0];
      expect(result.byId[imageId].titulo).toBe('Vista panorámica');
      expect(result.byId[imageId].numero).toBe(1);
      expect(result.byId[imageId].uploadStatus).toBe('pending');
      expect(result.byId[imageId].orden).toBe(0);
    });

    it('debe asignar número consecutivo global', () => {
      let state = { ...INITIAL_IMAGES_STATE };
      
      // Agregar primera imagen
      state = imagesReducer(state, {
        type: 'image/add',
        payload: { sectionId: 'section1', groupId: null, titulo: 'Img 1', fuente: '', preview: null, localPath: null }
      });

      // Agregar segunda imagen en otra sección
      state = imagesReducer(state, {
        type: 'image/add',
        payload: { sectionId: 'section2', groupId: null, titulo: 'Img 2', fuente: '', preview: null, localPath: null }
      });

      expect(state.allIds.length).toBe(2);
      const img1 = state.byId[state.allIds[0]];
      const img2 = state.byId[state.allIds[1]];
      
      expect(img1.numero).toBe(1);
      expect(img2.numero).toBe(2);
    });

    it('debe agregar imagen con grupo', () => {
      const state = { ...INITIAL_IMAGES_STATE };
      const command: AddImageCommand = {
        type: 'image/add',
        payload: {
          sectionId: 'section4',
          groupId: 'A',
          titulo: 'Imagen grupo A',
          fuente: 'Fuente',
          preview: null,
          localPath: null
        }
      };

      const result = imagesReducer(state, command);
      const imageId = result.allIds[0];

      expect(result.byId[imageId].groupId).toBe('A');
      
      const groupKey = generateImageGroupKey('section4', 'A');
      expect(result.bySectionGroup[groupKey]).toContain(imageId);
    });
  });

  describe('UpdateImage', () => {
    it('debe actualizar propiedades de imagen', () => {
      const state: ImagesState = {
        byId: {
          'img1': {
            id: 'img1',
            sectionId: 'section1',
            groupId: null,
            numero: 1,
            titulo: 'Original',
            fuente: 'Fuente original',
            preview: null,
            uploadStatus: 'pending',
            backendId: null,
            localPath: null,
            orden: 0,
            lastModified: 1000
          }
        },
        allIds: ['img1'],
        bySectionGroup: { 'section1': ['img1'] }
      };
      
      const command: UpdateImageCommand = {
        type: 'image/update',
        payload: {
          imageId: 'img1',
          changes: { titulo: 'Título actualizado', fuente: 'Nueva fuente' }
        }
      };

      const result = imagesReducer(state, command);

      expect(result.byId['img1'].titulo).toBe('Título actualizado');
      expect(result.byId['img1'].fuente).toBe('Nueva fuente');
    });

    it('no debe cambiar si no hay cambios reales', () => {
      const state: ImagesState = {
        byId: {
          'img1': {
            id: 'img1',
            sectionId: 'section1',
            groupId: null,
            numero: 1,
            titulo: 'Título',
            fuente: 'Fuente',
            preview: null,
            uploadStatus: 'pending',
            backendId: null,
            localPath: null,
            orden: 0,
            lastModified: 1000
          }
        },
        allIds: ['img1'],
        bySectionGroup: { 'section1': ['img1'] }
      };
      
      const command: UpdateImageCommand = {
        type: 'image/update',
        payload: {
          imageId: 'img1',
          changes: { titulo: 'Título' }
        }
      };

      const result = imagesReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('RemoveImage', () => {
    it('debe eliminar imagen y re-numerar', () => {
      const state: ImagesState = {
        byId: {
          'img1': { id: 'img1', sectionId: 's1', groupId: null, numero: 1, titulo: 'A', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 },
          'img2': { id: 'img2', sectionId: 's1', groupId: null, numero: 2, titulo: 'B', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 1, lastModified: 1000 },
          'img3': { id: 'img3', sectionId: 's1', groupId: null, numero: 3, titulo: 'C', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 2, lastModified: 1000 }
        },
        allIds: ['img1', 'img2', 'img3'],
        bySectionGroup: { 's1': ['img1', 'img2', 'img3'] }
      };
      
      const command: RemoveImageCommand = {
        type: 'image/remove',
        payload: { imageId: 'img2' }
      };

      const result = imagesReducer(state, command);

      expect(result.allIds.length).toBe(2);
      expect(result.byId['img2']).toBeUndefined();
      
      // Verificar re-numeración
      expect(result.byId['img1'].numero).toBe(1);
      expect(result.byId['img3'].numero).toBe(2);
    });

    it('no debe cambiar si imagen no existe', () => {
      const state = { ...INITIAL_IMAGES_STATE };
      const command: RemoveImageCommand = {
        type: 'image/remove',
        payload: { imageId: 'nonexistent' }
      };

      const result = imagesReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('ReorderImages', () => {
    it('debe reordenar imágenes en grupo y re-numerar globalmente', () => {
      const state: ImagesState = {
        byId: {
          'img1': { id: 'img1', sectionId: 's1', groupId: null, numero: 1, titulo: 'A', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 },
          'img2': { id: 'img2', sectionId: 's1', groupId: null, numero: 2, titulo: 'B', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 1, lastModified: 1000 },
          'img3': { id: 'img3', sectionId: 's1', groupId: null, numero: 3, titulo: 'C', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 2, lastModified: 1000 }
        },
        allIds: ['img1', 'img2', 'img3'],
        bySectionGroup: { 's1': ['img1', 'img2', 'img3'] }
      };
      
      const command: ReorderImagesCommand = {
        type: 'image/reorder',
        payload: {
          sectionId: 's1',
          groupId: null,
          orderedImageIds: ['img3', 'img1', 'img2']
        }
      };

      const result = imagesReducer(state, command);

      expect(result.byId['img3'].orden).toBe(0);
      expect(result.byId['img1'].orden).toBe(1);
      expect(result.byId['img2'].orden).toBe(2);
    });
  });

  describe('SetImageUploadStatus', () => {
    it('debe actualizar estado de subida', () => {
      const state: ImagesState = {
        byId: {
          'img1': { id: 'img1', sectionId: 's1', groupId: null, numero: 1, titulo: 'A', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 }
        },
        allIds: ['img1'],
        bySectionGroup: { 's1': ['img1'] }
      };
      
      const command: SetImageUploadStatusCommand = {
        type: 'image/setUploadStatus',
        payload: {
          imageId: 'img1',
          status: 'uploaded',
          backendId: 'backend-123'
        }
      };

      const result = imagesReducer(state, command);

      expect(result.byId['img1'].uploadStatus).toBe('uploaded');
      expect(result.byId['img1'].backendId).toBe('backend-123');
    });

    it('debe manejar estado error', () => {
      const state: ImagesState = {
        byId: {
          'img1': { id: 'img1', sectionId: 's1', groupId: null, numero: 1, titulo: 'A', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 }
        },
        allIds: ['img1'],
        bySectionGroup: { 's1': ['img1'] }
      };
      
      const command: SetImageUploadStatusCommand = {
        type: 'image/setUploadStatus',
        payload: {
          imageId: 'img1',
          status: 'error'
        }
      };

      const result = imagesReducer(state, command);

      expect(result.byId['img1'].uploadStatus).toBe('error');
    });
  });

  describe('ClearSectionImages', () => {
    it('debe eliminar todas las imágenes de una sección', () => {
      const state: ImagesState = {
        byId: {
          'img1': { id: 'img1', sectionId: 's1', groupId: null, numero: 1, titulo: 'A', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 },
          'img2': { id: 'img2', sectionId: 's1', groupId: null, numero: 2, titulo: 'B', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 1, lastModified: 1000 },
          'img3': { id: 'img3', sectionId: 's2', groupId: null, numero: 3, titulo: 'C', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 }
        },
        allIds: ['img1', 'img2', 'img3'],
        bySectionGroup: { 's1': ['img1', 'img2'], 's2': ['img3'] }
      };
      
      const command: ClearSectionImagesCommand = {
        type: 'image/clearSection',
        payload: { sectionId: 's1', groupId: null }
      };

      const result = imagesReducer(state, command);

      expect(result.allIds.length).toBe(1);
      expect(result.allIds).toContain('img3');
      expect(result.byId['img1']).toBeUndefined();
      expect(result.byId['img2']).toBeUndefined();
      expect(result.byId['img3'].numero).toBe(1); // Re-numerado
    });
  });

  describe('Helpers', () => {
    it('getImagesBySection debe filtrar correctamente', () => {
      const state: ImagesState = {
        byId: {
          'img1': { id: 'img1', sectionId: 's1', groupId: null, numero: 1, titulo: 'A', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 },
          'img2': { id: 'img2', sectionId: 's1', groupId: null, numero: 2, titulo: 'B', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 1, lastModified: 1000 },
          'img3': { id: 'img3', sectionId: 's2', groupId: null, numero: 3, titulo: 'C', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 }
        },
        allIds: ['img1', 'img2', 'img3'],
        bySectionGroup: { 's1': ['img1', 'img2'], 's2': ['img3'] }
      };

      const images = getImagesBySection(state, 's1');

      expect(images.length).toBe(2);
    });

    it('countPendingUploads debe contar pendientes', () => {
      const state: ImagesState = {
        byId: {
          'img1': { id: 'img1', sectionId: 's1', groupId: null, numero: 1, titulo: 'A', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 },
          'img2': { id: 'img2', sectionId: 's1', groupId: null, numero: 2, titulo: 'B', fuente: '', preview: null, uploadStatus: 'uploaded', backendId: 'x', localPath: null, orden: 1, lastModified: 1000 },
          'img3': { id: 'img3', sectionId: 's2', groupId: null, numero: 3, titulo: 'C', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 }
        },
        allIds: ['img1', 'img2', 'img3'],
        bySectionGroup: { 's1': ['img1', 'img2'], 's2': ['img3'] }
      };

      expect(countPendingUploads(state)).toBe(2);
    });

    it('getTotalImages debe retornar total', () => {
      const state: ImagesState = {
        byId: {
          'img1': { id: 'img1', sectionId: 's1', groupId: null, numero: 1, titulo: 'A', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 0, lastModified: 1000 },
          'img2': { id: 'img2', sectionId: 's1', groupId: null, numero: 2, titulo: 'B', fuente: '', preview: null, uploadStatus: 'pending', backendId: null, localPath: null, orden: 1, lastModified: 1000 }
        },
        allIds: ['img1', 'img2'],
        bySectionGroup: { 's1': ['img1', 'img2'] }
      };

      expect(getTotalImages(state)).toBe(2);
    });
  });
});
