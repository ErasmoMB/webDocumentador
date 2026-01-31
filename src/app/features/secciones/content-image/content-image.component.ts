/**
 * CONTENT IMAGE COMPONENT - FASE 3
 * 
 * ⚠️ COMPONENTE CRÍTICO - Numeración Global de Imágenes
 * 
 * Este componente usa getImageGlobalIndex para mostrar "Figura X"
 * donde X es el índice global calculado en todo el documento.
 * 
 * Test Case:
 * - Agregar imagen en "a.1" → Muestra "Figura 1"
 * - Agregar imagen en "b.1" → Muestra "Figura 2" (no "Figura 1")
 * 
 * Modelo ImageContent:
 * - titulo: string
 * - fuente: string
 * - preview: string | null (URL de preview)
 * - localPath: string | null
 * - backendId: string | null
 * - uploadStatus: 'pending' | 'uploaded' | 'error'
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter,
  ChangeDetectionStrategy,
  inject,
  computed,
  Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageContent } from '../../../core/state/section.model';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';

@Component({
  selector: 'app-content-image',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="content-image" [class.editing]="isEditing">
      
      <!-- IMAGE PREVIEW -->
      <div class="image-wrapper">
        @if (content.preview) {
          <img 
            [src]="content.preview" 
            [alt]="content.titulo || 'Imagen'"
            class="image-preview">
        } @else {
          <div class="image-placeholder">
            <span class="placeholder-icon">🖼️</span>
            <span class="placeholder-text">Sin imagen</span>
            @if (content.uploadStatus === 'pending') {
              <span class="upload-status pending">⏳ Pendiente de subir</span>
            }
            @if (content.uploadStatus === 'error') {
              <span class="upload-status error">❌ Error al subir</span>
            }
          </div>
        }
      </div>
      
      <!-- VIEW MODE - Caption -->
      @if (!isEditing) {
        <figcaption class="image-caption">
          <strong class="figure-number">Figura {{ globalIndex() }}.</strong>
          {{ content.titulo || 'Sin título' }}
          @if (content.fuente) {
            <span class="image-source">Fuente: {{ content.fuente }}</span>
          }
        </figcaption>
      }
      
      <!-- EDIT MODE -->
      @if (isEditing) {
        <div class="image-edit">
          <div class="edit-row">
            <label class="edit-label">
              <span class="label-text">Título</span>
              <input
                type="text"
                class="edit-input"
                [value]="content.titulo"
                (input)="onTitleInput($event)"
                placeholder="Título de la imagen...">
            </label>
          </div>
          
          <div class="edit-row">
            <label class="edit-label">
              <span class="label-text">Fuente</span>
              <input
                type="text"
                class="edit-input"
                [value]="content.fuente"
                (input)="onFuenteInput($event)"
                placeholder="Elaboración propia, Empresa X, etc.">
            </label>
          </div>
          
          <div class="edit-row">
            <label class="edit-label">
              <span class="label-text">URL de preview (opcional)</span>
              <input
                type="text"
                class="edit-input"
                [value]="content.preview || ''"
                (input)="onPreviewInput($event)"
                placeholder="https://ejemplo.com/imagen.png">
            </label>
          </div>
          
          <div class="edit-footer">
            <span class="global-index-badge">
              🔢 Índice Global: {{ globalIndex() }}
            </span>
            <button 
              class="remove-btn"
              (click)="onRemove()"
              title="Eliminar imagen">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      }
    </figure>
  `,
  styles: [`
    .content-image {
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    
    /* IMAGE WRAPPER */
    .image-wrapper {
      width: 100%;
      max-width: 600px;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f5f5;
    }
    
    .image-preview {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .image-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #999;
    }
    
    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 8px;
    }
    
    .placeholder-text {
      font-size: 14px;
    }
    
    /* VIEW MODE CAPTION */
    .image-caption {
      text-align: center;
      font-size: 14px;
      color: #555;
      max-width: 500px;
    }
    
    .figure-number {
      color: #1976d2;
    }
    
    /* EDIT MODE */
    .image-edit {
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .edit-row {
      display: flex;
      flex-direction: column;
    }
    
    .edit-label {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .label-text {
      font-size: 12px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
    }
    
    .edit-input {
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    
    .edit-input:focus {
      outline: none;
      border-color: #1976d2;
    }
    
    .edit-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid #eee;
    }
    
    .global-index-badge {
      background: #e3f2fd;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      color: #1565c0;
    }
    
    .remove-btn {
      padding: 8px 16px;
      background: #fff;
      border: 1px solid #ffcdd2;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      color: #c62828;
      transition: all 0.15s;
    }
    
    .remove-btn:hover {
      background: #ffebee;
      border-color: #ef5350;
    }
  `]
})
export class ContentImageComponent {
  private readonly facade = inject(ProjectStateFacade);
  
  @Input({ required: true }) content!: ImageContent;
  @Input() isEditing = false;
  
  @Output() titleChange = new EventEmitter<string>();
  @Output() fuenteChange = new EventEmitter<string>();
  @Output() previewChange = new EventEmitter<string>();
  @Output() remove = new EventEmitter<void>();
  
  /**
   * ⚠️ CRÍTICO: Índice global reactivo
   * 
   * Este computed se actualiza automáticamente cuando:
   * - Se añade/elimina una imagen en CUALQUIER sección
   * - Se reordena el contenido
   * 
   * Usa el selector getImageGlobalIndex que recorre todo el árbol
   * de secciones en orden jerárquico.
   */
  readonly globalIndex: Signal<number> = computed(() => {
    if (!this.content?.id) return 0;
    return this.facade.getImageGlobalIndex(this.content.id) ?? 0;
  });
  
  onTitleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.titleChange.emit(input.value);
  }
  
  onFuenteInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fuenteChange.emit(input.value);
  }
  
  onPreviewInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.previewChange.emit(input.value);
  }
  
  onRemove(): void {
    this.remove.emit();
  }
}
