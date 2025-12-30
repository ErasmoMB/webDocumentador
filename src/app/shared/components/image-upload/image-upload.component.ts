import { 
  Component, Input, Output, EventEmitter, OnInit, OnChanges, 
  SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef 
} from '@angular/core';

export interface FotoItem {
  titulo: string;
  fuente: string;
  imagen: string | null;
  id?: string;
}

@Component({
  selector: 'app-image-upload',
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

  @Output() tituloChange = new EventEmitter<string>();
  @Output() fuenteChange = new EventEmitter<string>();
  @Output() imagenChange = new EventEmitter<string>();
  @Output() imagenEliminada = new EventEmitter<void>();
  @Output() fotografiasChange = new EventEmitter<FotoItem[]>();

  _fotografias: FotoItem[] = [];
  preview: string | null = null;
  dragOver: boolean = false;
  dragOverIndex: number = -1;
  private isInternalUpdate: boolean = false;
  private lastEmittedValue: string = '';

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.inicializarFotografias(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isInternalUpdate) {
      this.isInternalUpdate = false;
      return;
    }

    if (changes['previewInicial']) {
      if (!this.permitirMultiples) {
        this.preview = this.previewInicial;
        this.cdRef.markForCheck();
      } else {
        if (this._fotografias.length > 0) {
          this._fotografias[0].imagen = this.previewInicial;
          this.cdRef.markForCheck();
        } else {
          this.inicializarFotografias(false);
        }
      }
    }

    if (changes['titulo'] && !this.permitirMultiples) {
      if (this._fotografias.length > 0) {
        this._fotografias[0].titulo = this.titulo || this.tituloDefault;
      }
    }

    if (changes['fuente'] && !this.permitirMultiples) {
      if (this._fotografias.length > 0) {
        this._fotografias[0].fuente = this.fuente || this.fuenteDefault;
      }
    }

    if (changes['fotografias'] || changes['permitirMultiples']) {
      const fotografiasChanged = changes['fotografias'];
      if (fotografiasChanged && !this.arraysEqual(
        this._fotografias, 
        fotografiasChanged.currentValue || []
      )) {
        this.inicializarFotografias(false);
      } else if (changes['permitirMultiples']) {
        this.inicializarFotografias(false);
      }
    }
  }

  private arraysEqual(arr1: FotoItem[], arr2: FotoItem[]): boolean {
    if (arr1.length !== arr2.length) return false;
    if (arr1.length === 0 && arr2.length === 0) return true;
    const serialized1 = JSON.stringify(arr1.map(f => ({ 
      titulo: f.titulo || '', 
      fuente: f.fuente || '', 
      imagen: f.imagen || null 
    })).sort((a, b) => (a.titulo + a.fuente).localeCompare(b.titulo + b.fuente)));
    const serialized2 = JSON.stringify(arr2.map(f => ({ 
      titulo: f.titulo || '', 
      fuente: f.fuente || '', 
      imagen: f.imagen || null 
    })).sort((a, b) => (a.titulo + a.fuente).localeCompare(b.titulo + b.fuente)));
    return serialized1 === serialized2;
  }

  inicializarFotografias(emitir: boolean = true) {
    if (this.permitirMultiples) {
      if (this.fotografias && this.fotografias.length > 0) {
        this._fotografias = this.fotografias.map(f => ({ 
          ...f, 
          id: f.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));
      } else {
        this._fotografias = [{
          titulo: this.titulo || this.tituloDefault,
          fuente: this.fuente || this.fuenteDefault,
          imagen: this.previewInicial,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }];
      }
    } else {
      this.preview = this.previewInicial;
      if (this._fotografias.length === 0) {
        this._fotografias = [{
          titulo: this.titulo || this.tituloDefault,
          fuente: this.fuente || this.fuenteDefault,
          imagen: this.previewInicial,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }];
      } else {
        this._fotografias[0].titulo = this.titulo || this.tituloDefault;
        this._fotografias[0].fuente = this.fuente || this.fuenteDefault;
        this._fotografias[0].imagen = this.previewInicial;
      }
    }
    
    if (emitir && this.permitirMultiples) {
      this.emitirCambios();
    }
    this.cdRef.markForCheck();
  }

  onTituloChange(value: string, index?: number) {
    if (this.permitirMultiples && index !== undefined) {
      if (this._fotografias[index]) {
        this._fotografias[index].titulo = value;
        this.emitirCambios();
      }
    } else {
      this.titulo = value;
      this.tituloChange.emit(value);
    }
  }

  onFuenteChange(value: string, index?: number) {
    if (this.permitirMultiples && index !== undefined) {
      if (this._fotografias[index]) {
        this._fotografias[index].fuente = value;
        this.emitirCambios();
      }
    } else {
      this.fuente = value;
      this.fuenteChange.emit(value);
    }
  }

  onFileSelected(event: any, index?: number) {
    if (!event || !event.target) {
      return;
    }
    const file = event.target.files && event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (this.permitirMultiples && index !== undefined) {
        this.procesarImagen(file, index);
      } else {
        this.procesarImagen(file);
      }
    }
    if (event.target) {
      event.target.value = '';
    }
  }

  onDragOver(event: DragEvent, index?: number) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
    if (index !== undefined) {
      this.dragOverIndex = index;
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    this.dragOverIndex = -1;
  }

  onDrop(event: DragEvent, index?: number) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    this.dragOverIndex = -1;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (this.permitirMultiples && index !== undefined) {
          this.procesarImagen(file, index);
        } else {
          this.procesarImagen(file);
        }
      }
    }
  }

  procesarImagen(file: File, index?: number) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (this.permitirMultiples && index !== undefined) {
        if (this._fotografias[index] && e.target && e.target.result) {
          this._fotografias[index].imagen = e.target.result;
          this.emitirCambios();
        }
      } else {
        if (e.target && e.target.result) {
          this.preview = e.target.result;
          this.imagenChange.emit(e.target.result);
        }
      }
      this.cdRef.markForCheck();
    };
    reader.onerror = () => {
      console.error('Error al leer el archivo de imagen');
    };
    reader.readAsDataURL(file);
  }

  eliminarImagen(index?: number) {
    if (this.permitirMultiples && index !== undefined) {
      if (this._fotografias.length > 1) {
        this._fotografias.splice(index, 1);
        this.emitirCambios();
      } else if (this._fotografias.length === 1) {
        this._fotografias[0].imagen = null;
        this.emitirCambios();
      }
    } else {
      this.preview = null;
      this.imagenChange.emit('');
      this.imagenEliminada.emit();
    }
    this.cdRef.markForCheck();
  }

  agregarFoto() {
    if (this.permitirMultiples) {
      const nuevaFoto: FotoItem = {
        titulo: this.tituloDefault,
        fuente: this.fuenteDefault,
        imagen: null,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      };
      this._fotografias.push(nuevaFoto);
      this.emitirCambios();
      this.cdRef.markForCheck();
    }
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    if (fileInput) {
      fileInput.click();
    }
  }

  triggerFileInputById(id: string) {
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  private emitirCambios() {
    if (!this.permitirMultiples) {
      return;
    }

    const serialized = JSON.stringify(this._fotografias.map(f => ({
      titulo: f.titulo || '',
      fuente: f.fuente || '',
      imagen: f.imagen || null
    })).sort((a, b) => {
      const aKey = (a.titulo || '') + (a.fuente || '') + (a.imagen || '');
      const bKey = (b.titulo || '') + (b.fuente || '') + (b.imagen || '');
      return aKey.localeCompare(bKey);
    }));
    
    if (serialized !== this.lastEmittedValue) {
      this.lastEmittedValue = serialized;
      this.isInternalUpdate = true;
      this.fotografiasChange.emit([...this._fotografias]);
      this.cdRef.markForCheck();
    }
  }
}
