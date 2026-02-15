import { 
  Component, Input, Output, EventEmitter, OnInit, OnChanges, 
  SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren, QueryList, ElementRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalNumberingService } from '../../../core/services/numbering/global-numbering.service';
import { ImageBackendService } from '../../../core/services/image/image-backend.service';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';


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
  // Debounce timers for title/source edits per photo (keyed by 'meta_<index>' or 'meta_single')
  private metaDebounceTimers: Map<string, any> = new Map();
  private readonly META_DEBOUNCE_MS = 600; // debounce delay when editing title/fuente

  get stableId(): string {
    return (this.photoPrefix + '_' + this.sectionId).replace(/\W+/g, '_');
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private globalNumbering: GlobalNumberingService,
    private imageBackendService: ImageBackendService,
    private imageFacade: ImageManagementFacade
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

  ngOnDestroy() {
    // Clear any pending meta timers
    try {
      this.metaDebounceTimers.forEach(t => clearTimeout(t));
      this.metaDebounceTimers.clear();
    } catch (e) {}
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
      // Update local model immediately
      this._fotografias[i].titulo = val;
      this._fotografias = [...this._fotografias];
      this.cdRef.detectChanges();

      // Debounce: solo emitir cambios (el contenedor persiste)
      this.scheduleMetaEmit(i);
    } else {
      this.titulo = val;
      this.tituloChange.emit(val);
      // Debounce: solo emitir cambios (el contenedor persiste)
      this.scheduleMetaEmit();
    }
  }

  onFuenteChange(val: string, i?: number) {
    if (i !== undefined && this._fotografias[i]) {
      // Update local model immediately
      this._fotografias[i].fuente = val;
      this._fotografias = [...this._fotografias];
      this.cdRef.detectChanges();

      // Debounce: solo emitir cambios (el contenedor persiste)
      this.scheduleMetaEmit(i);
    } else {
      this.fuente = val;
      this.fuenteChange.emit(val);
      // Debounce: solo emitir cambios (el contenedor persiste)
      this.scheduleMetaEmit();
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
    const numGlobal = this.calculateGlobalPhotoNumber(index || 0);

    // ✅ ESTRATEGIA: Ir directo a base64 (no intentar upload al backend)
    // Las imágenes en base64 se guardan en SessionDataService + fallback localStorage
    // Base64 es lo necesario para exportar a Word
    this.comprimirImagen(file).then(base64 => {
      this.aplicarImagenLocalmente(base64, numGlobal, base64, index);
    });
  }

  aplicarImagenLocalmente(imgData: string, numGlobal: string, persistValue: string, index?: number) {
    const scrollContainer = this.getScrollContainer();
    const scrollPosition = scrollContainer?.scrollTop || 0;
    
    if (this.permitirMultiples && index !== undefined && this._fotografias[index]) {
      this._fotografias[index].imagen = imgData;
      this._fotografias[index].numero = numGlobal;
      
      const foto = this._fotografias[index];
      
      this._fotografias = [...this._fotografias];
      this.emitirCambios();
    } else {
      this.preview = imgData;
      this.imagenChange.emit(imgData);
      
      // Mantener estado local consistente también en single
      try {
        if (this._fotografias && this._fotografias[0]) {
          this._fotografias[0].imagen = imgData;
          this._fotografias[0].numero = numGlobal;
          this._fotografias = [...this._fotografias];
          this.emitirCambios();
        }
      } catch {}
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
    if (i !== undefined) {
      // clear any pending meta timer for this photo
      const key = `meta_${i}`;
      if (this.metaDebounceTimers.has(key)) {
        clearTimeout(this.metaDebounceTimers.get(key));
        this.metaDebounceTimers.delete(key);
      }
    }

    if (this.permitirMultiples && i !== undefined) {
      this._fotografias.splice(i, 1);
      if (this._fotografias.length === 0) this._fotografias = [this.createEmptyFoto()];
      this.emitirCambios();
    } else {
      // single mode
      this.preview = null;
      this.imagenChange.emit('');

      // Mantener array local consistente
      try {
        if (this._fotografias && this._fotografias[0]) {
          this._fotografias[0].imagen = null;
          this._fotografias[0].numero = '';
          this._fotografias = [...this._fotografias];
          this.emitirCambios();
        }
      } catch {}
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

  private scheduleMetaEmit(index?: number) {
    const key = (index !== undefined) ? `meta_${index}` : 'meta_single';

    if (this.metaDebounceTimers.has(key)) {
      clearTimeout(this.metaDebounceTimers.get(key));
    }

    const timeout = setTimeout(() => {
      try {
        // En modo externo, solo emitir cambios para que el contenedor persista.
        this.emitirCambios();
      } catch {}
      this.metaDebounceTimers.delete(key);
      this.cdRef.detectChanges();
    }, this.META_DEBOUNCE_MS);

    this.metaDebounceTimers.set(key, timeout);
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
      const prefijoGrupo = this.imageFacade.getGroupPrefix(this.sectionId) || '';
      const photoIndex = index; // 0-basado
      const numero = this.globalNumbering.getGlobalPhotoNumber(
        this.sectionId,
        prefijoGrupo,
        photoIndex
      );
      if (numero) return numero;
    } catch (e) {
      /* calculateGlobalPhotoNumber error */
    }

    // Fallback: conteo local (no depende de claves legacy en estado)
    const fotos = Array.isArray(this._fotografias) ? this._fotografias : [];
    const count = fotos.slice(0, Math.max(0, index)).filter(f => !!f && !!f.imagen).length;
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
