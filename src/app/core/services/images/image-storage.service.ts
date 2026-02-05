import { Injectable } from '@angular/core';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { ReactiveStateAdapter } from '../state-adapters/reactive-state-adapter.service';
import { FormChangeService } from '../state/form-change.service';
import { PhotoNumberingService } from '../photo-numbering.service';
import { FotoItem } from '../../../shared/components/image-upload/image-upload.component';
import { ImageLogicService } from './image-logic.service';

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
    private imageLogic: ImageLogicService
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
      const imagenKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      const tituloKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
      let imagen = datos[imagenKey];
      if (i === 1 && !imagen) {
        const imagenBaseKey = groupPrefix ? `${prefix}Imagen${groupPrefix}` : `${prefix}Imagen`;
        imagen = datos[imagenBaseKey];
      }
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
      // apply updates
      this.projectFacade.setFields(sectionId, null, updates);
      try { this.formChange.persistFields(sectionId, 'form', updates); } catch (e) { /* persist form error */ }
      try { this.formChange.persistFields(sectionId, 'images', updates); } catch (e) { /* persist images error */ }

      // DEBUG: check stored sample keys (first image slot)
      try {
        const sampleImgKey = Object.keys(updates).find(k => k.toLowerCase().includes('imagen'));
        if (sampleImgKey) {
          // sample key saved (debug removed)
        }
      } catch (e) { /* debug sample read error */ }
    }

    // ✅ Notificar al ReactiveStateAdapter para actualizar la vista inmediatamente
    // refreshing state adapter and notifying views
    this.stateAdapter.refreshFromStorage();

    // ✅ Forzar actualización en todos los componentes registrados (preview y formularios)
    try {
      const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper');
      if (ViewChildHelper && typeof ViewChildHelper.updateAllComponents === 'function') {
        // calling ViewChildHelper.updateAllComponents
        ViewChildHelper.updateAllComponents('actualizarDatos');
        // fallback extra tick to avoid timing/race issues when many updates occur quickly
        setTimeout(() => {
          try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
        }, 120);
      }
    } catch (e) {
      // ignore if helper not available
    }

    // Recompute global photo numbering and persist changes (if any) so numbers stay globally consecutive.
    // Use a scheduled renumber to coalesce rapid successive saves and avoid race conditions.
    try {
      this.photoNumberingService.scheduleRenumber(80);
    } catch (e) {
      /* renumber schedule error */
    }
  }
}
