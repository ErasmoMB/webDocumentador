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
    
    // ✅ CORREGIR DUPLICADO: Verificar si prefix ya contiene groupPrefix
    // Si prefix ya tiene el grupo (ej: "fotografia_B1") y groupPrefix es "_B1",
    // no añadir groupPrefix de nuevo para evitar "fotografia_B11Imagen_B1"
    const prefixHasGroup = groupPrefix && prefix.includes(groupPrefix);
    const finalGroupPrefix = prefixHasGroup ? '' : groupPrefix;
    
    for (let i = 1; i <= maxPhotos; i++) {
      // ✅ CLAVE CORREGIDA: {prefix}{i}Imagen{finalGroupPrefix}
      // Ej: "fotografia1Imagen_B1" o "fotografia_B11Imagen" (si prefix ya tiene grupo)
      const imagenKey = finalGroupPrefix ? `${prefix}${i}Imagen${finalGroupPrefix}` : `${prefix}${i}Imagen`;
      const tituloKey = finalGroupPrefix ? `${prefix}${i}Titulo${finalGroupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = finalGroupPrefix ? `${prefix}${i}Fuente${finalGroupPrefix}` : `${prefix}${i}Fuente`;
      
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
          finalGroupPrefix
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
    
    // ✅ CORREGIR DUPLICADO: Verificar si prefix ya contiene groupPrefix
    const prefixHasGroup = groupPrefix && prefix.includes(groupPrefix);
    const finalGroupPrefix = prefixHasGroup ? '' : groupPrefix;
    
    for (let i = 1; i <= maxPhotos; i++) {
      // ✅ CLAVES CORREGIDAS: {prefix}{i}Imagen{finalGroupPrefix}
      const imagenKey = finalGroupPrefix ? `${prefix}${i}Imagen${finalGroupPrefix}` : `${prefix}${i}Imagen`;
      const tituloKey = finalGroupPrefix ? `${prefix}${i}Titulo${finalGroupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = finalGroupPrefix ? `${prefix}${i}Fuente${finalGroupPrefix}` : `${prefix}${i}Fuente`;
      const numeroKey = finalGroupPrefix ? `${prefix}${i}Numero${finalGroupPrefix}` : `${prefix}${i}Numero`;
      updates[imagenKey] = '';
      updates[tituloKey] = '';
      updates[fuenteKey] = '';
      updates[numeroKey] = '';
    }

    const imagenBaseKey = finalGroupPrefix ? `${prefix}Imagen${finalGroupPrefix}` : `${prefix}Imagen`;
    const tituloBaseKey = finalGroupPrefix ? `${prefix}Titulo${finalGroupPrefix}` : `${prefix}Titulo`;
    const fuenteBaseKey = finalGroupPrefix ? `${prefix}Fuente${finalGroupPrefix}` : `${prefix}Fuente`;
    updates[imagenBaseKey] = '';
    updates[tituloBaseKey] = '';
    updates[fuenteBaseKey] = '';

    let validIndex = 0;
    images.forEach((foto) => {
      if (this.imageLogic.isValidImage(foto.imagen)) {
        validIndex++;
        const num = validIndex;
        const imagenKey = finalGroupPrefix ? `${prefix}${num}Imagen${finalGroupPrefix}` : `${prefix}${num}Imagen`;
        const tituloKey = finalGroupPrefix ? `${prefix}${num}Titulo${finalGroupPrefix}` : `${prefix}${num}Titulo`;
        const fuenteKey = finalGroupPrefix ? `${prefix}${num}Fuente${finalGroupPrefix}` : `${prefix}${num}Fuente`;
        const numeroKey = finalGroupPrefix ? `${prefix}${num}Numero${finalGroupPrefix}` : `${prefix}${num}Numero`;

        const numeroGlobal = foto.numero || this.photoNumberingService.getGlobalPhotoNumber(
          sectionId,
          num,
          prefix,
          finalGroupPrefix
        );
        
        const imagenValue = foto.imagen 
          ? this.imageLogic.normalizeImageValue(foto.imagen) 
          : '';

        updates[numeroKey] = numeroGlobal;
        updates[imagenKey] = imagenValue;
        updates[tituloKey] = foto.titulo || '';
        updates[fuenteKey] = foto.fuente || '';

        if (num === 1) {
          const imagenBaseKey = finalGroupPrefix ? `${prefix}Imagen${finalGroupPrefix}` : `${prefix}Imagen`;
          const tituloBaseKey = finalGroupPrefix ? `${prefix}Titulo${finalGroupPrefix}` : `${prefix}Titulo`;
          const fuenteBaseKey = finalGroupPrefix ? `${prefix}Fuente${finalGroupPrefix}` : `${prefix}Fuente`;

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
    }

    // ✅ Notificar al ReactiveStateAdapter para actualizar la vista inmediatamente
    this.stateAdapter.refreshFromStorage();

    // ✅ Forzar actualización en todos los componentes registrados (preview y formularios)
    try {
      const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper');
      if (ViewChildHelper && typeof ViewChildHelper.updateAllComponents === 'function') {
        ViewChildHelper.updateAllComponents('actualizarDatos');
        setTimeout(() => {
          ViewChildHelper.updateAllComponents('actualizarDatos');
        });
      }
    } catch (e) { /* ViewChildHelper not available */ }
  }
}
