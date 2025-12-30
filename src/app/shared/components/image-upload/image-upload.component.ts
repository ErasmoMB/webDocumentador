import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit, OnChanges {
  @Input() titulo: string = '';
  @Input() fuente: string = '';
  @Input() previewInicial: string | null = null;
  @Input() labelTitulo: string = 'Título';
  @Input() labelFuente: string = 'Fuente';
  @Input() labelImagen: string = 'Imagen';
  @Input() placeholderTitulo: string = 'Ej: Vista panorámica';
  @Input() placeholderFuente: string = 'Ej: GEADES, 2024';
  @Input() mostrarTitulo: boolean = true;
  @Input() mostrarFuente: boolean = true;
  @Input() requerido: boolean = true;

  @Output() tituloChange = new EventEmitter<string>();
  @Output() fuenteChange = new EventEmitter<string>();
  @Output() imagenChange = new EventEmitter<string>();
  @Output() imagenEliminada = new EventEmitter<void>();

  preview: string | null = null;
  dragOver: boolean = false;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.preview = this.previewInicial;
  }

  ngOnChanges() {
    if (this.previewInicial !== undefined) {
      this.preview = this.previewInicial;
    }
  }

  onTituloChange(value: string) {
    this.titulo = value;
    this.tituloChange.emit(value);
  }

  onFuenteChange(value: string) {
    this.fuente = value;
    this.fuenteChange.emit(value);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.procesarImagen(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.procesarImagen(file);
      }
    }
  }

  procesarImagen(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.preview = e.target.result;
      this.imagenChange.emit(e.target.result);
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  eliminarImagen() {
    this.preview = null;
    this.imagenChange.emit('');
    this.imagenEliminada.emit();
    this.cdRef.detectChanges();
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }
}

