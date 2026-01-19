import { 
  Component, Input, Output, EventEmitter, OnInit, OnChanges, 
  SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef 
} from '@angular/core';
import { PhotoNumberingService } from '../../../core/services/photo-numbering.service';
import { ImageBackendService } from '../../../core/services/image-backend.service';
import { FormularioService } from '../../../core/services/formulario.service';

export interface FotoItem {
  numero?: string;
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
  @Input() modoVista: boolean = false; // cuando es true, solo muestra tarjeta
  @Input() mostrarNumero: boolean = true;
  @Input() sectionId: string = '3.1.1'; // Sección para numeración global
  @Input() photoPrefix: string = ''; // Prefijo de foto (fotografiaGanaderia, fotografiaAgricultura, etc.)
  @Input() key: number = 0; // Clave para forzar actualización del componente

  @Output() tituloChange = new EventEmitter<string>();
  @Output() fuenteChange = new EventEmitter<string>();
  @Output() imagenChange = new EventEmitter<string>();
  @Output() imagenEliminada = new EventEmitter<void>();
  @Output() fotografiasChange = new EventEmitter<FotoItem[]>();

  @ViewChild('container', { static: false }) container?: ElementRef;

  _fotografias: FotoItem[] = [];
  preview: string | null = null;
  dragOver: boolean = false;
  dragOverIndex: number = -1;
  private isInternalUpdate: boolean = false;
  private lastEmittedValue: string = '';
  private hasLoggedPhotos: boolean = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private photoNumberingService: PhotoNumberingService,
    private imageBackendService: ImageBackendService,
    private formularioService: FormularioService
  ) {}

  hasFotos(): boolean {
    return Array.isArray(this._fotografias) && this._fotografias.some(f => !!f && !!f.imagen);
  }

  // NUMERACIÓN GLOBAL INDEPENDIENTE - Calcula dinámicamente sin romper nada
  private calculateGlobalPhotoNumber(index: number): string {
    const datos = this.formularioService.obtenerDatos();
    
    if (!this.photoPrefix) {
      return '';
    }

    // ORDEN GLOBAL con POSICIÓN VISUAL en el documento (no por orden de upload)
    // Incluye sectionId implícitamente en el orden
    const globalOrder = [
      // Sección 1
      'fotografiaSeccion1',
      // Sección 2
      'fotografiaSeccion2',
      // Sección 3
      'fotografiaSeccion3',
      // Sección 4 (3.1.4.A.1) - Incluye AISD primero
      'fotografiaAISD',
      'fotografiaAISD2',
      // Dentro de 3.1.4.A.1: Ubicación ANTES que Población
      'fotografiaUbicacionReferencial',
      'fotografiaPoblacionViviendas',
      // Continúa con otras subsecciones de 3.1.4.A
      'fotografiaInstitucionalidad',      // 3.1.4.A.1.1
      'fotografiaDemografia',              // 3.1.4.A.1.2
      'fotografiaPEA',                     // 3.1.4.A.1.3
      'fotografiaGanaderia',               // 3.1.4.A.1.4
      'fotografiaAgricultura',             // 3.1.4.A.1.4
      'fotografiaComercio',                // 3.1.4.A.1.4
      'fotografiaEstructura',              // 3.1.4.A.1.5
      'fotografiaDesechosSolidos',         // 3.1.4.A.1.6
      'fotografiaElectricidad',            // 3.1.4.A.1.6
      'fotografiaTransporte',              // 3.1.4.A.1.7
      'fotografiaTelecomunicaciones',      // 3.1.4.A.1.7
      'fotografiaSalud',                   // 3.1.4.A.1.8
      'fotografiaIEAyroca',                // 3.1.4.A.1.8
      'fotografiaIE40270',                 // 3.1.4.A.1.8
      'fotografiaRecreacion',              // 3.1.4.A.1.8
      'fotografiaDeporte',                 // 3.1.4.A.1.8
      'fotografiaSaludIndicadores',        // 3.1.4.A.1.9
      'fotografiaEducacionIndicadores',    // 3.1.4.A.1.10
      'fotografiaIglesia',                 // 3.1.4.A.1.11
      'fotografiaReservorio',              // 3.1.4.A.1.12
      'fotografiaUsoSuelos',               // 3.1.4.A.1.12
      'fotografiaIDH',                     // 3.1.4.A.1.13
      'fotografiaNBI',                     // 3.1.4.A.1.14
      'fotografiaOrganizacionSocial',      // 3.1.4.A.1.15
      'fotografiaFestividades',            // 3.1.4.A.1.16
      // Sección 4B
      'fotografiaCahuacho',
      'fotografiaCahuachoB11',
      'fotografiaCahuachoB13',
      'fotografiaCahuachoB14',
      'fotografiaCahuachoB15',
      'fotografiaCahuachoB16',
      'fotografiaCahuachoB17',
      'fotografiaCahuachoB18',
      'fotografiaCahuachoB19',
      'fotografiaDesechosSolidosAISI',
      'fotografiaElectricidadAISI',
      'fotografiaEnergiaCocinarAISI',
      'fotografiaTransporteAISI',
      'fotografiaTelecomunicacionesAISI',
      'fotografiaSaludAISI',
      'fotografiaEducacionAISI',
      'fotografiaRecreacionAISI',
      'fotografiaDeporteAISI'
    ];

    let globalCounter = 0;

    // Recorrer orden global
    for (const prefix of globalOrder) {
      // Si es ESTE prefix, contar hasta el índice actual
      if (prefix === this.photoPrefix) {
        // Contar las imágenes PREVIAS que ya existen
        for (let i = 1; i < index + 1; i++) {
          const key = `${this.photoPrefix}${i}Imagen`;
          const imagen = datos[key];
          // Solo contar si existe y es válido (no vacío, no "null")
          if (imagen && imagen.length > 5) {
            globalCounter++;
          }
        }
        // Sumar 1 por la imagen actual que se está procesando
        globalCounter++;
        return `3.${globalCounter}`;
      } else {
        // Contar TODAS las imágenes de prefixes anteriores
        for (let i = 1; i <= 20; i++) {
          const key = `${prefix}${i}Imagen`;
          const imagen = datos[key];
          if (imagen && imagen.length > 5) {
            globalCounter++;
          }
        }
      }
    }

    return '';
  }

  getFormattedPhotoNumber(index: number): string {
    if (!this.sectionId) {
      return '';
    }
    
    // SIEMPRE usar la lógica de cálculo global independiente
    return this.calculateGlobalPhotoNumber(index);
  }

  getFileInputId(index: number): string {
    const prefix = this.photoPrefix || 'foto';
    // Hacemos el id único por componente para evitar colisiones entre Ganadería/Agricultura/Comercio
    return `${prefix}_${this.sectionId}_${index}`.replace(/\W+/g, '_');
  }

  private getSectionName(): string {
    const sectionMap: { [key: string]: string } = {
      '3.1.1': 'Sección 1',
      '3.1.2': 'Sección 2',
      '3.1.3': 'Sección 3',
      '3.1.4.A': 'Sección 4A',
      '3.1.4.B': 'Sección 4B',
      '3.1.4.A.1': 'Sección 5A',
      '3.1.4.B.1': 'Sección 5B',
      '3.1.4.A.1.1': 'Sección 5A-1',
      '3.1.4.B.1.1': 'Sección 5B-1',
      '3.1.4.A.1.2': 'Sección 6A',
      '3.1.4.A.2': 'Sección 6A',
      '3.1.4.A.1.3': 'Sección 7A',
      '3.1.4.A.3': 'Sección 7A',
      '3.1.4.A.1.4': 'Sección 8A',
      '3.1.4.A.4': 'Sección 8A',
      '3.1.4.A.1.5': 'Sección 9A',
      '3.1.4.A.5': 'Sección 9A',
      '3.1.4.A.1.6': 'Sección 10A',
      '3.1.4.A.6': 'Sección 10A',
    };
    
    // Busca la sección más específica que coincida
    const matches = Object.keys(sectionMap).filter(k => this.sectionId.startsWith(k));
    if (matches.length > 0) {
      matches.sort((a, b) => b.length - a.length);
      return sectionMap[matches[0]];
    }
    return this.sectionId;
  }

  private logSectionPhotos(): void {
    // Log deshabilitado para mantener consola limpia
  }

  ngOnInit() {
    if (this.modoVista) {
      this._fotografias = (this.fotografias || []).filter(f => !!f && !!f.imagen).map(f => ({
        ...f,
        imagen: this.getImageUrl(f.imagen)
      }));
      this.cdRef.markForCheck();
      this.logSectionPhotos();
      return;
    }
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

    if (changes['key']) {
      setTimeout(() => {
        this.inicializarFotografias(false);
        this.cdRef.markForCheck();
      }, 0);
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
        this.hasLoggedPhotos = false;
        this.inicializarFotografias(false);
        setTimeout(() => {
          this.cdRef.markForCheck();
          this.logSectionPhotos();
        }, 0);
      } else if (changes['permitirMultiples']) {
        this.inicializarFotografias(false);
      }
    }
    
    if (changes['photoPrefix'] || changes['sectionId']) {
      setTimeout(() => {
        this.cdRef.markForCheck();
      }, 0);
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
    if (this.modoVista) {
      return;
    }
    if (this.permitirMultiples) {
      if (this.fotografias && this.fotografias.length > 0) {
        this._fotografias = this.fotografias.map(f => ({ 
          ...f, 
          id: f.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          imagen: this.getImageUrl(f.imagen)
        }));
      } else {
        this._fotografias = [{
          titulo: this.titulo || this.tituloDefault,
          fuente: this.fuente || this.fuenteDefault,
          imagen: this.getImageUrl(this.previewInicial),
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }];
      }
    } else {
      this.preview = this.getImageUrl(this.previewInicial);
      if (this._fotografias.length === 0) {
        this._fotografias = [{
          titulo: this.titulo || this.tituloDefault,
          fuente: this.fuente || this.fuenteDefault,
          imagen: this.preview,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }];
      } else {
        this._fotografias[0].titulo = this.titulo || this.tituloDefault;
        this._fotografias[0].fuente = this.fuente || this.fuenteDefault;
        this._fotografias[0].imagen = this.preview;
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
    
    const formularioId = this.formularioService.obtenerDatos().projectName || 'default';
    
    // Calcular el número ANTES de subir
    const numeroGlobal = this.calculateGlobalPhotoNumber(index ?? 0);
    
    this.imageBackendService.uploadImage(file, formularioId, this.sectionId, this.photoPrefix).subscribe({
      next: (response) => {
        const imageId = response.image_id;
        const imageUrl = this.imageBackendService.getImageUrl(imageId);
        if (this.permitirMultiples && index !== undefined) {
          if (this._fotografias[index]) {
            // NUEVO: Guardar tanto imageId como número en localStorage
            const imagenKey = `${this.photoPrefix}${index + 1}Imagen`;
            const numeroKey = `${this.photoPrefix}${index + 1}Numero`;
            this.formularioService.actualizarDato(imagenKey, imageId);
            this.formularioService.actualizarDato(numeroKey, numeroGlobal);
            
            this._fotografias[index] = {
              ...this._fotografias[index],
              imagen: imageUrl,
              numero: numeroGlobal
            };
            this._fotografias = [...this._fotografias];
            this.cdRef.markForCheck();
            setTimeout(() => {
              this.emitirCambios();
            }, 0);
          }
        } else {
          // NUEVO: Guardar en localStorage para imagen única
          const imagenKey = `${this.photoPrefix}Imagen`;
          const numeroKey = `${this.photoPrefix}Numero`;
          this.formularioService.actualizarDato(imagenKey, imageId);
          this.formularioService.actualizarDato(numeroKey, numeroGlobal);
          
          this.preview = imageUrl;
          this.imagenChange.emit(imageId);
          this.cdRef.markForCheck();
        }
      },
      error: (error) => {
        console.warn('Error al subir imagen al backend, usando base64 como fallback:', error);
        this.comprimirImagen(file).then((imagenComprimida) => {
          if (this.permitirMultiples && index !== undefined) {
            if (this._fotografias[index]) {
              // NUEVO: Guardar número incluso con fallback base64
              const numeroKey = `${this.photoPrefix}${index + 1}Numero`;
              this.formularioService.actualizarDato(numeroKey, numeroGlobal);
              
              this._fotografias[index] = {
                ...this._fotografias[index],
                imagen: imagenComprimida,
                numero: numeroGlobal
              };
              this.emitirCambios();
            }
          } else {
            // NUEVO: Guardar número para imagen única con fallback
            const numeroKey = `${this.photoPrefix}Numero`;
            this.formularioService.actualizarDato(numeroKey, numeroGlobal);
            
            this.preview = imagenComprimida;
            this.imagenChange.emit(imagenComprimida);
          }
          this.cdRef.markForCheck();
        }).catch((err) => {
          console.error('Error al procesar la imagen:', err);
        });
      }
    });
  }

  private comprimirImagen(file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.65): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const imagenComprimida = canvas.toDataURL('image/jpeg', quality);
            resolve(imagenComprimida);
          } else {
            reject(new Error('No se pudo obtener el contexto del canvas'));
          }
        };
        
        img.onerror = () => {
          reject(new Error('Error al cargar la imagen'));
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  eliminarImagen(index?: number) {
    if (this.permitirMultiples && index !== undefined) {
      // PRIMERO: Obtener el imageId para eliminar del backend
      const foto = this._fotografias[index];
      const imagenGuardada = foto?.imagen;
      
      // Extraer solo el UUID (últimos caracteres)
      let imageId = imagenGuardada;
      if (imagenGuardada) {
        // Si es una URL, extraer solo el UUID
        if (imagenGuardada.startsWith('http')) {
          imageId = imagenGuardada.split('/').pop() || imagenGuardada;
        }
        // Validar que sea un UUID válido (tiene guiones)
        if (imageId && imageId.includes('-') && imageId.length === 36) {
          this.imageBackendService.deleteImage(imageId).subscribe({
            next: () => {
              // Imagen eliminada del backend
            },
            error: (err) => {
              // Error al eliminar del backend, pero se elimina localmente
            }
          });
        }
      }
      
      // SEGUNDO: Limpiar del localStorage
      const imagenKey = `${this.photoPrefix}${index + 1}Imagen`;
      const numeroKey = `${this.photoPrefix}${index + 1}Numero`;
      this.formularioService.actualizarDato(imagenKey, '');
      this.formularioService.actualizarDato(numeroKey, '');
      
      // TERCERO: Eliminar del componente
      if (this._fotografias.length > 1) {
        this._fotografias.splice(index, 1);
        this.emitirCambios();
      } else if (this._fotografias.length === 1) {
        this._fotografias = [{
          titulo: this.tituloDefault,
          fuente: this.fuenteDefault,
          imagen: null,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }];
        this.emitirCambiosConVacio();
      }
    } else {
      // Para imagen única, también intentar eliminar del backend
      if (this.preview) {
        let imageId = this.preview;
        if (this.preview.startsWith('http')) {
          imageId = this.preview.split('/').pop() || this.preview;
        }
        if (imageId && imageId.includes('-') && imageId.length === 36) {
          this.imageBackendService.deleteImage(imageId).subscribe({
            next: () => {
              console.log(`✅ Imagen única eliminada del backend: ${imageId}`);
            },
            error: (err) => {
              console.warn(`⚠️ Error al eliminar del backend: ${err}`);
            }
          });
        }
      }
      
      // Limpiar localStorage
      const imagenKey = `${this.photoPrefix}Imagen`;
      const numeroKey = `${this.photoPrefix}Numero`;
      this.formularioService.actualizarDato(imagenKey, '');
      this.formularioService.actualizarDato(numeroKey, '');
      console.log(`🗑️ Eliminado del localStorage (única): ${imagenKey}, ${numeroKey}`);
      
      this.preview = null;
      this.imagenChange.emit('');
      this.imagenEliminada.emit();
    }
    this.cdRef.markForCheck();
  }

  private emitirCambiosConVacio() {
    this.lastEmittedValue = '';
    this.fotografiasChange.emit([]);
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

    const fotografiasSerializadas = this._fotografias.map(f => ({
      titulo: f.titulo || '',
      fuente: f.fuente || '',
      imagen: f.imagen || null
    }));
    
    const serialized = JSON.stringify(fotografiasSerializadas);
    
    if (serialized !== this.lastEmittedValue) {
      this.lastEmittedValue = serialized;
      this.isInternalUpdate = true;
      const fotografiasParaEmitir = this._fotografias.map(f => {
        const imagenOriginal = this.extractImageId(f.imagen);
        return {
          ...f,
          imagen: imagenOriginal || f.imagen
        };
      });
      this.fotografiasChange.emit(fotografiasParaEmitir);
      this.hasLoggedPhotos = false;
      this.logSectionPhotos();
      this.cdRef.markForCheck();
    }
  }

  private getImageUrl(imagen: string | null): string | null {
    if (!imagen) return null;
    if (imagen.startsWith('data:image') || imagen.startsWith('http')) {
      return imagen;
    }
    if (this.isImageId(imagen)) {
      return this.imageBackendService.getImageUrl(imagen);
    }
    return imagen;
  }

  private isImageId(value: string): boolean {
    if (typeof value !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  private extractImageId(value: string | null): string | null {
    if (!value) return null;
    if (this.isImageId(value)) return value;
    if (value.includes('/api/imagenes/')) {
      const match = value.match(/\/api\/imagenes\/([0-9a-f-]{36})/i);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }
}
