import { Injectable } from '@angular/core';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { ReactiveStateAdapter } from '../state-adapters/reactive-state-adapter.service';
import { FormChangeService } from '../state/form-change.service';
import { PhotoNumberingService } from '../numbering/photo-numbering.service';
import { FotoItem } from '../../../shared/components/image-upload/image-upload.component';
import { ImageLogicService } from './image-logic.service';
import { BackendAvailabilityService } from '../infrastructure/backend-availability.service';

/**
 * ✅ FASE 4: Migrado - eliminada dependencia de LegacyDocumentSnapshotService
 * Usa ProjectStateFacade.obtenerDatos() como única fuente de verdad
 */
@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {

  constructor(
    private projectFacade: ProjectStateFacade,
    private photoNumberingService: PhotoNumberingService,
    private stateAdapter: ReactiveStateAdapter,
    private formChange: FormChangeService,
    private imageLogic: ImageLogicService,
    private backendAvailability: BackendAvailabilityService
  ) {}

  loadImages(
    sectionId: string, 
    prefix: string, 
    groupPrefix: string = '', 
    maxPhotos: number = 10
  ): FotoItem[] {
    const fotografias: FotoItem[] = [];
    // ✅ Usar projectFacade.obtenerDatos() que ya lee de localStorage primero
    const datos = this.projectFacade.obtenerDatos();
    
    for (let i = 1; i <= maxPhotos; i++) {
      // ✅ ESQUEMA CANÓNICO: {prefix}{i}Imagen{groupPrefix}
      // Ej: "fotografiaDemografia1Imagen_A1"
      const imagenKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      const tituloKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
      
      const imagen = datos[imagenKey];
      
      // ✅ SIN FALLBACK - Si no hay imagen en clave prefijada, NO buscar en clave base
      // Esto asegura aislamiento completo entre grupos AISI
      if (this.imageLogic.isValidImage(imagen)) {
        const imagenUrl = this.imageLogic.getImageUrl(imagen);
        const titulo = datos[tituloKey] || `Foto ${i}`;
        const fuente = datos[fuenteKey] || 'GEADES, 2024';
        const numeroGlobal = this.photoNumberingService.getGlobalPhotoNumber(
          sectionId,
          i,
          prefix,
          groupPrefix
        );
        fotografias.push({
          numero: numeroGlobal,
          titulo,
          fuente,
          imagen: imagenUrl
        });
      }
    }
    
    return fotografias;
  }

  saveImages(
    sectionId: string, 
    prefix: string, 
    images: FotoItem[], 
    groupPrefix: string = '',
    maxPhotos: number = 10
  ): void {
    const updates: Record<string, any> = {};
    
    for (let i = 1; i <= maxPhotos; i++) {
      // ✅ ESQUEMA CANÓNICO: {prefix}{i}Imagen{groupPrefix}
      const imagenKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      const tituloKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
      const numeroKey = groupPrefix ? `${prefix}${i}Numero${groupPrefix}` : `${prefix}${i}Numero`;
      updates[imagenKey] = '';
      updates[tituloKey] = '';
      updates[fuenteKey] = '';
      updates[numeroKey] = '';
    }

    const imagenBaseKey = groupPrefix ? `${prefix}Imagen${groupPrefix}` : `${prefix}Imagen`;
    const tituloBaseKey = groupPrefix ? `${prefix}Titulo${groupPrefix}` : `${prefix}Titulo`;
    const fuenteBaseKey = groupPrefix ? `${prefix}Fuente${groupPrefix}` : `${prefix}Fuente`;
    updates[imagenBaseKey] = '';
    updates[tituloBaseKey] = '';
    updates[fuenteBaseKey] = '';

    let validIndex = 0;
    images.forEach((foto) => {
      if (this.imageLogic.isValidImage(foto.imagen)) {
        validIndex++;
        const num = validIndex;
        const imagenKey = groupPrefix ? `${prefix}${num}Imagen${groupPrefix}` : `${prefix}${num}Imagen`;
        const tituloKey = groupPrefix ? `${prefix}${num}Titulo${groupPrefix}` : `${prefix}${num}Titulo`;
        const fuenteKey = groupPrefix ? `${prefix}${num}Fuente${groupPrefix}` : `${prefix}${num}Fuente`;
        const numeroKey = groupPrefix ? `${prefix}${num}Numero${groupPrefix}` : `${prefix}${num}Numero`;

        const numeroGlobal = foto.numero || this.photoNumberingService.getGlobalPhotoNumber(
          sectionId,
          num,
          prefix,
          groupPrefix
        );
        
        const imagenValue = foto.imagen 
          ? this.imageLogic.normalizeImageValue(foto.imagen) 
          : '';

        updates[numeroKey] = numeroGlobal;
        updates[imagenKey] = imagenValue;
        updates[tituloKey] = foto.titulo || '';
        updates[fuenteKey] = foto.fuente || '';

        if (num === 1) {
          const imagenBaseKey = groupPrefix ? `${prefix}Imagen${groupPrefix}` : `${prefix}Imagen`;
          const tituloBaseKey = groupPrefix ? `${prefix}Titulo${groupPrefix}` : `${prefix}Titulo`;
          const fuenteBaseKey = groupPrefix ? `${prefix}Fuente${groupPrefix}` : `${prefix}Fuente`;

          updates[imagenBaseKey] = imagenValue;
          updates[tituloBaseKey] = foto.titulo || '';
          updates[fuenteBaseKey] = foto.fuente || '';
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      // 📸 ESTRATEGIA DE PERSISTENCIA DE IMÁGENES:
      // - Base64 SIEMPRE se crea (necesario para exportar a Word)
      // - Se actualizan en el projectFacade state (en memoria)
      // - PersistenceObserver maneja el almacenamiento según disponibilidad del backend:
      //   * Backend disponible → NO guarda en localStorage (SessionDataService maneja)
      //   * Backend NO disponible → Guarda en localStorage (fallback)
      console.log(`📸 [ImageStorageService] Guardando ${Object.keys(updates).length} propiedades de imágenes para sección: ${sectionId}`);
      
      // apply updates
      this.projectFacade.setFields(sectionId, null, updates);
      try { this.formChange.persistFields(sectionId, 'form', updates); } catch (e) { /* persist form error */ }
      try { this.formChange.persistFields(sectionId, 'images', updates); } catch (e) { /* persist images error */ }
    }

    // ✅ Notificar al ReactiveStateAdapter para actualizar la vista inmediatamente
    this.stateAdapter.refreshFromStorage();
  }
}
