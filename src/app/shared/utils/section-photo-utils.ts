import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { PhotoNumberingService } from 'src/app/core/services/numbering/photo-numbering.service';
import { FotoItem } from '../components/image-upload/image-upload.component';
import { PhotoGroupConfig } from './photo-group-config';

export function getPhotosPropertyName(prefix?: string): string {
  if (!prefix) return '';

  if (prefix.startsWith('fotografia') && !prefix.startsWith('fotografias')) {
    return prefix.replace('fotografia', 'fotografias');
  }

  return prefix;
}

export function loadPhotos(
  imageFacade: ImageManagementFacade,
  seccionId: string,
  prefix: string
): FotoItem[] {
  const groupPrefix = imageFacade.getGroupPrefix(seccionId);
  return imageFacade.loadImages(seccionId, prefix, groupPrefix);
}

export function savePhotos(
  imageFacade: ImageManagementFacade,
  seccionId: string,
  prefix: string,
  fotografias: FotoItem[]
): void {
  const groupPrefix = imageFacade.getGroupPrefix(seccionId);
  imageFacade.saveImages(seccionId, prefix, fotografias, groupPrefix);
}

export function getOrCreatePhotoGroup(
  photoGroups: Map<string, FotoItem[]>,
  prefix: string
): FotoItem[] {
  if (!photoGroups.has(prefix)) {
    photoGroups.set(prefix, []);
  }
  return photoGroups.get(prefix)!;
}

export function setPhotoGroup(
  photoGroups: Map<string, FotoItem[]>,
  prefix: string,
  fotografias: FotoItem[]
): void {
  photoGroups.set(prefix, [...fotografias]);
}

export function loadPhotoGroup(
  imageFacade: ImageManagementFacade,
  seccionId: string,
  prefix: string
): FotoItem[] {
  return loadPhotos(imageFacade, seccionId, prefix);
}

export function savePhotoGroup(
  imageFacade: ImageManagementFacade,
  photoNumberingService: PhotoNumberingService | null,
  seccionId: string,
  prefix: string,
  fotografias: FotoItem[],
  photoGroups: Map<string, FotoItem[]>
): void {
  const groupPrefix = imageFacade.getGroupPrefix(seccionId);

  const fotosConNumeros = fotografias.map((foto, index) => {
    if (foto.numero && foto.numero !== '') return foto;

    const numeroGlobal =
      photoNumberingService?.getGlobalPhotoNumber(
        seccionId,
        index + 1,
        prefix,
        groupPrefix
      ) || '';

    return { ...foto, numero: numeroGlobal };
  });

  imageFacade.saveImages(seccionId, prefix, fotosConNumeros, groupPrefix);
  setPhotoGroup(photoGroups, prefix, fotosConNumeros);
}

export function loadAllPhotoGroups(
  imageFacade: ImageManagementFacade,
  seccionId: string,
  photoGroupsConfig: PhotoGroupConfig[],
  photoGroups: Map<string, FotoItem[]>
): void {
  if (photoGroupsConfig.length === 0) return;

  photoGroupsConfig.forEach(config => {
    const fotos = loadPhotoGroup(imageFacade, seccionId, config.prefix);
    setPhotoGroup(photoGroups, config.prefix, fotos);
  });
}

export function saveAllPhotoGroups(
  imageFacade: ImageManagementFacade,
  photoNumberingService: PhotoNumberingService | null,
  seccionId: string,
  photoGroupsConfig: PhotoGroupConfig[],
  photoGroups: Map<string, FotoItem[]>
): void {
  if (photoGroupsConfig.length === 0) return;

  photoGroupsConfig.forEach(config => {
    const fotos = getOrCreatePhotoGroup(photoGroups, config.prefix);
    if (!fotos || fotos.length === 0) return;

    savePhotoGroup(
      imageFacade,
      photoNumberingService,
      seccionId,
      config.prefix,
      fotos,
      photoGroups
    );
  });
}
