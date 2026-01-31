/**
 * CONTENT PARAGRAPH COMPONENT - FASE 3
 * 
 * Dumb Component para renderizar/editar párrafos.
 * - View Mode: Muestra el texto formateado
 * - Edit Mode: TextArea para edición
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter,
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphContent } from '../../../core/state/section.model';

@Component({
  selector: 'app-content-paragraph',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-paragraph" [class.editing]="isEditing">
      
      <!-- VIEW MODE -->
      @if (!isEditing) {
        <div class="paragraph-view">
          <p [innerHTML]="formattedText"></p>
        </div>
      }
      
      <!-- EDIT MODE -->
      @if (isEditing) {
        <div class="paragraph-edit">
          <textarea
            class="paragraph-textarea"
            [value]="content.text"
            (input)="onTextInput($event)"
            placeholder="Escribe el contenido del párrafo..."
            rows="4">
          </textarea>
          
          <div class="edit-actions">
            <span class="char-count">{{ content.text.length }} caracteres</span>
            <button 
              class="remove-btn"
              (click)="onRemove()"
              title="Eliminar párrafo">
              🗑️
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .content-paragraph {
      position: relative;
    }
    
    /* VIEW MODE */
    .paragraph-view p {
      margin: 0;
      line-height: 1.7;
      color: #333;
      text-align: justify;
    }
    
    /* EDIT MODE */
    .paragraph-edit {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .paragraph-textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.6;
      resize: vertical;
      min-height: 100px;
      transition: border-color 0.2s;
    }
    
    .paragraph-textarea:focus {
      outline: none;
      border-color: #1976d2;
    }
    
    .edit-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .char-count {
      font-size: 12px;
      color: #999;
    }
    
    .remove-btn {
      padding: 4px 8px;
      background: none;
      border: 1px solid #ffcdd2;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.15s;
    }
    
    .remove-btn:hover {
      background: #ffebee;
      border-color: #ef5350;
    }
  `]
})
export class ContentParagraphComponent {
  @Input({ required: true }) content!: ParagraphContent;
  @Input() isEditing = false;
  
  @Output() textChange = new EventEmitter<string>();
  @Output() remove = new EventEmitter<void>();
  
  get formattedText(): string {
    // Convertir saltos de línea a <br> para visualización
    if (this.content.format === 'html') {
      return this.content.text;
    }
    return this.content.text.replace(/\n/g, '<br>');
  }
  
  onTextInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.textChange.emit(textarea.value);
  }
  
  onRemove(): void {
    this.remove.emit();
  }
}
