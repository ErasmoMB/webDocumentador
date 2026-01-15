import { FotoItem } from '../components/image-upload/image-upload.component';

export interface PhotoGroupConfig {
  prefix: string;
  label: string;
  tituloDefault?: string;
  fuenteDefault?: string;
  placeholderTitulo?: string;
  placeholderFuente?: string;
  requerido?: boolean;
}
