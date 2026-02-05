import { 
  Component, Input, Output, EventEmitter, OnInit, OnChanges, 
  SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren, QueryList, ElementRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoNumberingService } from '../../../core/services/photo-numbering.service';
import { ImageBackendService } from '../../../core/services/image-backend.service';
import { ImageManagementFacade } from 'src/app/core/services/images/image-management.facade';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { FormChangeService } from '../../../core/services/state/form-change.service';
import { debugLog } from '../../utils/debug';
import { ViewChildHelper } from '../../utils/view-child-helper';

export interface FotoItem {
  numero?: string;
  titulo: string;
  fuente: string;
  imagen: string | null;
  id?: string;
}

@Component({
    selector: 'app-image-upload',
    imports: [CommonModule],
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploadComponent implements OnInit, OnChanges {
  @Input() titulo: string = '';
  @Input() fuente: string = '';
  @Input() previewInicial: string | null = null;
  @Input() fotografias: FotoItem[] = [];
  @Input() permitirMultiples: boolean = true;
  @Input() labelTitulo: string = 'Título';
  @Input() labelFuente: string = 'Fuente';
  @Input() labelImagen: string = 'Imagen';
  @Input() placeholderTitulo: string = 'Ej: Vista panorámica';
  @Input() placeholderFuente: string = 'Ej: GEADES, 2024';
  @Input() tituloDefault: string = 'Título de fotografía';
  @Input() fuenteDefault: string = 'GEADES, 2024';
  @Input() mostrarTitulo: boolean = true;
  @Input() mostrarFuente: boolean = true;
  @Input() requerido: boolean = true;
  @Input() modoVista: boolean = false;
  @Input() mostrarNumero: boolean = true;
  @Input() sectionId: string = '3.1.1';
  @Input() photoPrefix: string = '';
  @Input() key: number = 0;

  @Output() tituloChange = new EventEmitter<string>();
  @Output() fuenteChange = new EventEmitter<string>();
  @Output() imagenChange = new EventEmitter<string>();
  @Output() imagenEliminada = new EventEmitter<void>();
  @Output() fotografiasChange = new EventEmitter<FotoItem[]>();

  @ViewChildren('fileInput') fileInputs?: QueryList<ElementRef<HTMLInputElement>>;

  _fotografias: FotoItem[] = [];
  preview: string | null = null;
  dragOver: boolean = false;
  dragOverIndex: number = -1;
  
  private isInternalUpdate: boolean = false;

  get stableId(): string {
    return (this.photoPrefix + '_' + this.sectionId).replace(/\W+/g, '_');
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private photoNumberingService: PhotoNumberingService,
    private imageBackendService: ImageBackendService,
    private imageFacade: ImageManagementFacade,
    private projectFacade: ProjectStateFacade,
    private formChange: FormChangeService
  ) {}

  get fotografiasParaRender(): FotoItem[] {
    if (this.modoVista) return this._fotografias;
    if (this.permitirMultiples && (!this._fotografias || this._fotografias.length === 0)) {
      this.inicializarFotografias(false);
    }
    return this._fotografias;
  }

  hasFotos(): boolean {
    return Array.isArray(this._fotografias) && this._fotografias.some(f => !!f && !!f.imagen);
  }

  ngOnInit() {
    this.inicializarFotografias(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isInternalUpdate) {
      this.isInternalUpdate = false;
      return;
    }

    if (this.modoVista) {
      this._fotografias = (this.fotografias || []).filter(f => !!f && !!f.imagen).map(f => ({
        ...f,
        imagen: this.getImageUrl(f.imagen)
      }));
      this.cdRef.markForCheck();
      return;
    }

    if (changes['fotografias']) {
      const incoming = changes['fotografias'].currentValue || [];
      const hasPlaceholders = this._fotografias.some(f => !f.imagen);
      
      if (!this.arraysEqual(this._fotografias, incoming)) {
        if (incoming.length < this._fotografias.length && hasPlaceholders) {
             return;
        }
        this.inicializarFotografias(false);
      }
    }
  }

  inicializarFotografias(emitir: boolean = true) {
    if (this.modoVista) return;

    if (this.permitirMultiples) {
      if (this.fotografias && this.fotografias.length > 0) {
        this._fotografias = this.fotografias.map(f => ({
          ...f,
          id: f.id || this.generateId(),
          imagen: this.getImageUrl(f.imagen)
        }));
      } else if (this._fotografias.length === 0) {
        this._fotografias = [this.createEmptyFoto()];
      }
    } else {
      this.preview = this.getImageUrl(this.previewInicial);
      this._fotografias = [{
        ...this.createEmptyFoto(),
        imagen: this.preview
      }];
    }

    if (emitir) this.emitirCambios();
    this.cdRef.markForCheck();
  }

  createEmptyFoto(): FotoItem {
    return {
      titulo: this.titulo || this.tituloDefault,
      fuente: this.fuente || this.fuenteDefault,
      imagen: null,
      id: this.generateId()
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private arraysEqual(a: FotoItem[], b: FotoItem[]): boolean {
    const validA = a.filter(f => !!f.imagen);
    const validB = b.filter(f => !!f.imagen);
    if (validA.length !== validB.length) return false;
    return JSON.stringify(validA.map(f => this.extractImageId(f.imagen))) === 
           JSON.stringify(validB.map(f => this.extractImageId(f.imagen)));
  }

  onTituloChange(val: string, i?: number) {
    if (i !== undefined && this._fotografias[i]) {
      this._fotografias[i].titulo = val;
      const fieldKey = `${this.photoPrefix}${i + 1}Titulo`;
      this.formChange.persistFields(this.sectionId, 'images', {
        [fieldKey]: val
      });
      this._fotografias = [...this._fotografias];
      this.cdRef.detectChanges();
      this.emitirCambios();
    } else {
      this.titulo = val;
      this.tituloChange.emit(val);
    }
  }

  onFuenteChange(val: string, i?: number) {
    if (i !== undefined && this._fotografias[i]) {
      this._fotografias[i].fuente = val;
      const fieldKey = `${this.photoPrefix}${i + 1}Fuente`;
      this.formChange.persistFields(this.sectionId, 'images', {
        [fieldKey]: val
      });
      this._fotografias = [...this._fotografias];
      this.cdRef.detectChanges();
      this.emitirCambios();
    } else {
      this.fuente = val;
      this.fuenteChange.emit(val);
    }
  }

  onFileSelected(event: any, index?: number) {
    const scrollContainer = this.getScrollContainer();
    const scrollPosition = scrollContainer?.scrollTop || 0;
    
    const file = event.target?.files?.[0];
    if (file) {
      this.procesarImagen(file, index);
    }
    
    if (event.target) event.target.value = '';
    
    setTimeout(() => {
      if (scrollContainer && scrollPosition > 0) {
        scrollContainer.scrollTop = scrollPosition;
      }
    }, 0);
  }

  procesarImagen(file: File, index?: number) {
    const projectName = this.projectFacade.obtenerDatos()['projectName'] || 'default';
    const numGlobal = this.calculateGlobalPhotoNumber(index || 0);

    this.imageBackendService.uploadImage(file, projectName, this.sectionId, this.photoPrefix).subscribe({
      next: (res) => {
        const url = this.imageBackendService.getImageUrl(res.image_id);
        this.aplicarImagenLocalmente(url, numGlobal, res.image_id, index);
      },
      error: (err) => {
        console.warn('Backend inalcanzable. Usando fallback Base64.', err);
        this.comprimirImagen(file).then(base64 => {
          this.aplicarImagenLocalmente(base64, numGlobal, base64, index);
        });
      }
    });
  }

  aplicarImagenLocalmente(imgData: string, numGlobal: string, persistValue: string, index?: number) {
    const scrollContainer = this.getScrollContainer();
    const scrollPosition = scrollContainer?.scrollTop || 0;
    
    if (this.permitirMultiples && index !== undefined && this._fotografias[index]) {
      this._fotografias[index].imagen = imgData;
      this._fotografias[index].numero = numGlobal;
      
      const foto = this._fotografias[index];
      this.formChange.persistFields(this.sectionId, 'images', {
        [`${this.photoPrefix}${index + 1}Imagen`]: persistValue,
        [`${this.photoPrefix}${index + 1}Numero`]: numGlobal,
        [`${this.photoPrefix}${index + 1}Titulo`]: foto.titulo || this.tituloDefault,
        [`${this.photoPrefix}${index + 1}Fuente`]: foto.fuente || this.fuenteDefault
      });
      
      this._fotografias = [...this._fotografias];
      this.emitirCambios();

      try {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.sectionId);
        const fotosParaGuardar = this._fotografias.map(f => ({
          ...f,
          imagen: this.extractImageId(f.imagen) || f.imagen
        }));
        this.imageFacade.saveImages(this.sectionId, this.photoPrefix, fotosParaGuardar, groupPrefix);
      } catch (e) {
        /* saveImages multi error */
      }
    } else {
      this.preview = imgData;
      this.imagenChange.emit(imgData);
      this.formChange.persistFields(this.sectionId, 'images', {
        [`${this.photoPrefix}Imagen`]: persistValue,
        [`${this.photoPrefix}Numero`]: numGlobal,
        [`${this.photoPrefix}Titulo`]: this.titulo || this.tituloDefault,
        [`${this.photoPrefix}Fuente`]: this.fuente || this.fuenteDefault
      });

      try {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.sectionId);
        const fotosParaGuardar = [{
          numero: numGlobal,
          titulo: this.titulo || this.tituloDefault,
          fuente: this.fuente || this.fuenteDefault,
          imagen: persistValue
        }];
        this.imageFacade.saveImages(this.sectionId, this.photoPrefix, fotosParaGuardar, groupPrefix);
        try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) { /* ViewChildHelper error */ }
      } catch (e) {
      }
    }
    
    this.cdRef.markForCheck();
    
    setTimeout(() => {
      if (scrollContainer && scrollPosition > 0) {
        scrollContainer.scrollTop = scrollPosition;
      }
    }, 0);
  }

  private getScrollContainer(): HTMLElement | null {
    let element = document.querySelector('.seccion-formulario-content');
    if (!element) {
      element = document.querySelector('.formulario-sidebar');
    }
    if (!element) {
      element = document.querySelector('[class*="sidebar"]');
    }
    return element as HTMLElement;
  }

  eliminarImagen(i?: number) {
    if (this.permitirMultiples && i !== undefined) {
      this._fotografias.splice(i, 1);
      if (this._fotografias.length === 0) this._fotografias = [this.createEmptyFoto()];
      
      this.formChange.persistFields(this.sectionId, 'images', {
        [`${this.photoPrefix}${i + 1}Imagen`]: '',
        [`${this.photoPrefix}${i + 1}Numero`]: '',
        [`${this.photoPrefix}${i + 1}Titulo`]: '',
        [`${this.photoPrefix}${i + 1}Fuente`]: ''
      });
      
      this.emitirCambios();

      try {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.sectionId);
        const fotosParaGuardar = this._fotografias.map(f => ({
          ...f,
          imagen: this.extractImageId(f.imagen) || f.imagen
        }));
        this.imageFacade.saveImages(this.sectionId, this.photoPrefix, fotosParaGuardar, groupPrefix);
        // Forzar actualización global por si algo no se refresca inmediatamente
        try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
      } catch (e) {
      }
    } else {
      this.preview = null;
      this.imagenChange.emit('');
      this.formChange.persistFields(this.sectionId, 'images', {
        [`${this.photoPrefix}Imagen`]: '',
        [`${this.photoPrefix}Numero`]: '',
        [`${this.photoPrefix}Titulo`]: '',
        [`${this.photoPrefix}Fuente`]: ''
      });

      try {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.sectionId);
        this.imageFacade.saveImages(this.sectionId, this.photoPrefix, [], groupPrefix);
      } catch (e) {
      }
    }
    this.cdRef.detectChanges();
  }

  agregarFoto() {
    this._fotografias.push(this.createEmptyFoto());
    this.cdRef.detectChanges();
  }

  private emitirCambios() {
    this.isInternalUpdate = true;
    const payload = this._fotografias.map(f => ({
      ...f,
      imagen: this.extractImageId(f.imagen) || f.imagen
    }));
    this.fotografiasChange.emit(payload);
  }

  getFormattedPhotoNumber(i: number): string {
    return this.calculateGlobalPhotoNumber(i);
  }

  getFileInputId(i: number): string {
    return `file_${this.stableId}_${i}`;
  }

  onLabelClick(event: Event) {
    const scrollContainer = this.getScrollContainer();
    if (scrollContainer) {
      const scrollPosition = scrollContainer.scrollTop;
      
      setTimeout(() => {
        scrollContainer.scrollTop = scrollPosition;
      }, 50);
      
      setTimeout(() => {
        scrollContainer.scrollTop = scrollPosition;
      }, 200);
    }
  }


  private calculateGlobalPhotoNumber(index: number): string {
    try {
      const groupPrefix = this.imageFacade.getGroupPrefix(this.sectionId) || '';
      const photoIndexOneBased = (index || 0) + 1; // index is 0-based in templates
      const numero = this.photoNumberingService.getGlobalPhotoNumber(
        this.sectionId,
        photoIndexOneBased,
        this.photoPrefix,
        groupPrefix
      );
      if (numero) return numero;
    } catch (e) {
      /* calculateGlobalPhotoNumber error */
    }

    // Fallback: conservative local computation (handles older formats without group suffixes)
    const datos = this.projectFacade.obtenerDatos();
    const prefix = this.photoPrefix;
    let count = 0;
    for (let i = 1; i <= index; i++) {
      if (datos[`${prefix}${i}Imagen`] && String(datos[`${prefix}${i}Imagen`]).length > 5) count++;
      // also try with common group suffixes as fallback
      const suffixes = ['_A1','_A2','_A3','_A4','_A5','_A6','_A7','_A8','_A9','_A10','_B1','_B2','_B3','_B4','_B5','_B6','_B7','_B8','_B9','_B10'];
      for (const suf of suffixes) {
        if (datos[`${prefix}${i}Imagen${suf}`] && String(datos[`${prefix}${i}Imagen${suf}`]).length > 5) {
          count++;
          break;
        }
      }
    }
    return `3.${count + 1}`;
  }

  private getImageUrl(img: string | null): string | null {
    if (!img || img.startsWith('data:') || img.startsWith('http')) return img;
    return this.imageBackendService.getImageUrl(img);
  }

  private extractImageId(val: string | null): string | null {
    if (!val) return null;
    const match = val.match(/\/imagenes\/([0-9a-f-]{36})/i);
    return match ? match[1] : null;
  }

  private comprimirImagen(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width; let h = img.height;
          if (w > 800) { h = (h * 800) / w; w = 800; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  onDragOver(e: any, i?: number) { e.preventDefault(); this.dragOver = true; if (i !== undefined) this.dragOverIndex = i; }
  onDragLeave(e: any) { this.dragOver = false; }
  onDrop(e: any, i?: number) {
    e.preventDefault();
    this.dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.procesarImagen(file, i);
  }

  triggerFileInput(fileInput: HTMLInputElement | ElementRef<HTMLInputElement> | any): void {
    if (!fileInput) return;
    
    const input = fileInput instanceof ElementRef ? fileInput.nativeElement : fileInput;
    if (input && typeof input.click === 'function') {
      input.click();
    }
  }
}
