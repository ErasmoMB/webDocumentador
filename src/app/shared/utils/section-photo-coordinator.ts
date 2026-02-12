import { ChangeDetectorRef } from '@angular/core';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { PhotoNumberingService } from 'src/app/core/services/numbering/photo-numbering.service';
import { FotoItem } from '../components/image-upload/image-upload.component';
import { PhotoGroupConfig } from './photo-group-config';
import {
  getOrCreatePhotoGroup,
  getPhotosPropertyName,
  loadAllPhotoGroups,
  loadPhotoGroup,
  loadPhotos,
  saveAllPhotoGroups,
  savePhotoGroup,
  savePhotos,
  setPhotoGroup
} from './section-photo-utils';

export interface PhotoHost extends Record<string, any> {
  seccionId: string;
  modoFormulario: boolean;
  readonly PHOTO_PREFIX: string;

  fotografiasCache: FotoItem[];
  fotografiasFormMulti: FotoItem[];

  photoGroups: Map<string, FotoItem[]>;
  photoGroupsConfig: PhotoGroupConfig[];

  actualizarDatos?: () => void;
  onPhotoLoadComplete?: (fotografias: FotoItem[]) => void;
  onPhotoSaveComplete?: (fotografias: FotoItem[], prefix: string) => void;
}

export class SectionPhotoCoordinator {
  constructor(
    private readonly imageFacade: ImageManagementFacade,
    private readonly photoNumberingService: PhotoNumberingService | null,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  tieneFotografias(host: PhotoHost): boolean {
    return !!host.PHOTO_PREFIX;
  }

  actualizarFotografiasCache(host: PhotoHost): void {
    if (!host.PHOTO_PREFIX) return;
    const groupPrefix = this.imageFacade.getGroupPrefix(host.seccionId);
    host.fotografiasCache = this.imageFacade.loadImages(host.seccionId, host.PHOTO_PREFIX, groupPrefix);
  }

  actualizarFotografiasFormMulti(host: PhotoHost): void {
    if (!host.PHOTO_PREFIX) return;
    const groupPrefix = this.imageFacade.getGroupPrefix(host.seccionId);
    host.fotografiasFormMulti = this.imageFacade.loadImages(host.seccionId, host.PHOTO_PREFIX, groupPrefix);
  }

  cargarFotografias(host: PhotoHost): void {
    if (!host.PHOTO_PREFIX) return;

    try {
      const fotos = loadPhotos(this.imageFacade, host.seccionId, host.PHOTO_PREFIX);

      host.fotografiasCache = [...fotos];
      host.fotografiasFormMulti = [...fotos];

      const propertyName = this.getPhotosPropertyName(host);
      if (propertyName) host[propertyName] = [...fotos];

      host.onPhotoLoadComplete?.(fotos);
      this.cdRef.markForCheck();
    } catch (error) {
      try { const { debugError } = require('src/app/shared/utils/debug'); debugError(`Error cargando fotografías en ${host.seccionId}:`, error); } catch {}
    }
  }

  onFotografiasChange(host: PhotoHost, fotografias: FotoItem[], customPrefix?: string): void {
    const prefix = customPrefix || host.PHOTO_PREFIX;
    if (!prefix) return;

    try {
      savePhotos(this.imageFacade, host.seccionId, prefix, fotografias);

      host.fotografiasCache = [...fotografias];
      host.fotografiasFormMulti = [...fotografias];

      const propertyName = this.getPhotosPropertyName(host, prefix);
      if (propertyName) {
        host[propertyName] = [...fotografias];
      }

      host.actualizarDatos?.();
      host.onPhotoSaveComplete?.(fotografias, prefix);
      this.cdRef.detectChanges();

      // Forzar actualización en todos los componentes registrados
      try {
        const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper');
        ViewChildHelper.updateAllComponents('actualizarDatos');
      } catch (e) {}
    } catch (error) {
      try { const { debugError } = require('src/app/shared/utils/debug'); debugError(`Error guardando fotografías en ${host.seccionId}:`, error); } catch {}
    }
  }

  diagnosticarImagenes(host: PhotoHost): void {
    const propName = this.getPhotosPropertyName(host);
    const diagnostico = {
      '🆔 Sección ID': host.seccionId,
      '📸 PHOTO_PREFIX': host.PHOTO_PREFIX || '❌ NO DEFINIDO',
      '🔧 ImageFacade': this.imageFacade ? '✅' : '❌',
      '📦 fotografiasCache': host.fotografiasCache?.length || 0,
      '📝 fotografiasFormMulti': host.fotografiasFormMulti?.length || 0,
      '🎨 Modo Formulario': host.modoFormulario ? 'Sí' : 'No',
      '🔑 Propiedad Dinámica': propName || '❌',
      '📊 Fotos en Propiedad': propName && host[propName] ? host[propName].length : 0
    };

    // optionally log diagnostic when debug enabled
    try { const { debugLog, debugWarn } = require('src/app/shared/utils/debug'); debugLog('Diagnóstico fotografías', diagnostico); if ((host as any).constructor?.prototype?.hasOwnProperty?.('cargarFotografias')) { debugWarn('⚠️  ADVERTENCIA: Esta sección tiene override de cargarFotografias()'); } } catch (e) {}

    // logged: diagnostic separator end
  }

  getPhotoGroup(host: PhotoHost, prefix: string): FotoItem[] {
    return getOrCreatePhotoGroup(host.photoGroups, prefix);
  }

  setPhotoGroup(host: PhotoHost, prefix: string, fotografias: FotoItem[]): void {
    setPhotoGroup(host.photoGroups, prefix, fotografias);
  }

  cargarGrupoFotografias(host: PhotoHost, prefix: string): FotoItem[] {
    return loadPhotoGroup(this.imageFacade, host.seccionId, prefix);
  }

  guardarGrupoFotografias(host: PhotoHost, prefix: string, fotografias: FotoItem[]): void {
    savePhotoGroup(
      this.imageFacade,
      this.photoNumberingService,
      host.seccionId,
      prefix,
      fotografias,
      host.photoGroups
    );
  }

  cargarTodosLosGrupos(host: PhotoHost): void {
    try {
      loadAllPhotoGroups(this.imageFacade, host.seccionId, host.photoGroupsConfig, host.photoGroups);
    } catch {
      return;
    }
  }

  guardarTodosLosGrupos(host: PhotoHost): void {
    try {
      saveAllPhotoGroups(
        this.imageFacade,
        this.photoNumberingService,
        host.seccionId,
        host.photoGroupsConfig,
        host.photoGroups
      );
    } catch {
      return;
    }
  }

  onGrupoFotografiasChange(host: PhotoHost, prefix: string, fotografias: FotoItem[]): void {
    try {
      this.guardarGrupoFotografias(host, prefix, fotografias);
      this.cdRef.detectChanges();
    } catch (error) {
    }
  }

  getFotografiasVista(host: PhotoHost, prefix: string): FotoItem[] {
    const fotos = this.getPhotoGroup(host, prefix);
    if (fotos.length === 0 && !host.modoFormulario) {
      const fotosCargadas = this.cargarGrupoFotografias(host, prefix);
      this.setPhotoGroup(host, prefix, fotosCargadas);
      return fotosCargadas;
    }
    return fotos;
  }

  getFotografiasFormMulti(host: PhotoHost, prefix: string): FotoItem[] {
    return this.getPhotoGroup(host, prefix);
  }

  private getPhotosPropertyName(host: PhotoHost, customPrefix?: string): string {
    const prefix = customPrefix || host.PHOTO_PREFIX;
    return getPhotosPropertyName(prefix);
  }
}
