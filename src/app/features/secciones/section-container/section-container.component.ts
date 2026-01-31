/**
 * SECTION CONTAINER COMPONENT - FASE 3
 * 
 * Smart Component que:
 * - Se conecta al Facade para obtener datos de la sección
 * - Toggle entre View Mode y Edit Mode
 * - En View Mode: Renderiza contenido para lectura
 * - En Edit Mode: Formularios para edición + botones para agregar contenido
 */

import { 
  Component, 
  Input, 
  inject, 
  signal, 
  computed,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { Section, SectionContent, isImageContent, isTableContent, isParagraphContent } from '../../../core/state/section.model';
import { ContentParagraphComponent } from '../content-paragraph/content-paragraph.component';
import { ContentImageComponent } from '../content-image/content-image.component';
import { ContentTableComponent } from '../content-table/content-table.component';

@Component({
  selector: 'app-section-container',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ContentParagraphComponent,
    ContentImageComponent,
    ContentTableComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-container" *ngIf="section()">
      <!-- HEADER -->
      <header class="section-header">
        <div class="section-info">
          <span class="section-badge" [class]="sectionTypeBadge()">
            {{ sectionTypeLabel() }}
          </span>
          <h1 class="section-title">{{ section()!.title }}</h1>
          <span class="section-id">ID: {{ section()!.id }}</span>
        </div>
        
        <div class="section-actions">
          <button 
            class="mode-toggle"
            [class.editing]="isEditing()"
            (click)="toggleEditMode()">
            {{ isEditing() ? '👁️ Ver' : '✏️ Editar' }}
          </button>
        </div>
      </header>
      
      <!-- CONTENT AREA -->
      <div class="section-content" [class.edit-mode]="isEditing()">
        
        <!-- Empty State -->
        @if (section()!.contents.length === 0) {
          <div class="empty-content">
            <p>Esta sección no tiene contenido todavía.</p>
            @if (isEditing()) {
              <p>Usa los botones de abajo para agregar contenido.</p>
            }
          </div>
        }
        
        <!-- Content Items -->
        @for (content of section()!.contents; track content.id) {
          <div class="content-item" [class.editing]="isEditing()">
            
            <!-- PARAGRAPH -->
            @if (isParagraph(content)) {
              <app-content-paragraph
                [content]="content"
                [isEditing]="isEditing()"
                (textChange)="onParagraphChange(content.id, $event)"
                (remove)="onRemoveContent(content.id)" />
            }
            
            <!-- IMAGE -->
            @if (isImage(content)) {
              <app-content-image
                [content]="content"
                [isEditing]="isEditing()"
                (titleChange)="onImageTitleChange(content.id, $event)"
                (fuenteChange)="onImageFuenteChange(content.id, $event)"
                (previewChange)="onImagePreviewChange(content.id, $event)"
                (remove)="onRemoveContent(content.id)" />
            }
            
            <!-- TABLE -->
            @if (isTable(content)) {
              <app-content-table
                [content]="content"
                [isEditing]="isEditing()"
                (contentChange)="onTableChange(content.id, $event)"
                (remove)="onRemoveContent(content.id)" />
            }
          </div>
        }
      </div>
      
      <!-- ADD CONTENT TOOLBAR (Edit Mode only) -->
      @if (isEditing()) {
        <div class="add-content-toolbar">
          <span class="toolbar-label">Agregar:</span>
          <button 
            class="add-btn add-paragraph"
            (click)="addParagraph()">
            📝 Párrafo
          </button>
          <button 
            class="add-btn add-image"
            (click)="addImage()">
            🖼️ Imagen
          </button>
          <button 
            class="add-btn add-table"
            (click)="addTable()">
            📊 Tabla
          </button>
        </div>
      }
      
      <!-- FOOTER: Content Summary -->
      <footer class="section-footer">
        <div class="content-summary">
          <span>{{ paragraphCount() }} párrafos</span>
          <span>{{ imageCount() }} imágenes</span>
          <span>{{ tableCount() }} tablas</span>
        </div>
        <div class="last-modified" *ngIf="section()!.updatedAt">
          Última modificación: {{ formatDate(section()!.updatedAt) }}
        </div>
      </footer>
    </div>
    
    <!-- Section not found -->
    <div class="not-found" *ngIf="!section()">
      <p>Sección no encontrada: {{ sectionId }}</p>
    </div>
  `,
  styles: [`
    .section-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 900px;
      margin: 0 auto;
    }
    
    /* HEADER */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .section-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .section-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      width: fit-content;
    }
    
    .section-badge.static { background: #f5f5f5; color: #666; }
    .section-badge.aisd { background: #e8f5e9; color: #2e7d32; }
    .section-badge.aisi { background: #e3f2fd; color: #1565c0; }
    
    .section-title {
      margin: 8px 0 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .section-id {
      font-size: 12px;
      color: #999;
    }
    
    .mode-toggle {
      padding: 8px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .mode-toggle:hover {
      border-color: #1976d2;
    }
    
    .mode-toggle.editing {
      background: #1976d2;
      border-color: #1976d2;
      color: white;
    }
    
    /* CONTENT */
    .section-content {
      padding: 24px;
      min-height: 200px;
    }
    
    .section-content.edit-mode {
      background: #fafafa;
    }
    
    .empty-content {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    .content-item {
      margin-bottom: 16px;
    }
    
    .content-item:last-child {
      margin-bottom: 0;
    }
    
    /* ADD TOOLBAR */
    .add-content-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: #f5f5f5;
      border-top: 1px solid #e0e0e0;
    }
    
    .toolbar-label {
      font-size: 14px;
      color: #666;
    }
    
    .add-btn {
      padding: 8px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s;
    }
    
    .add-btn:hover {
      background: #f0f0f0;
      border-color: #ccc;
    }
    
    .add-paragraph:hover { border-color: #9c27b0; }
    .add-image:hover { border-color: #4CAF50; }
    .add-table:hover { border-color: #2196F3; }
    
    /* FOOTER */
    .section-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
      font-size: 12px;
      color: #666;
    }
    
    .content-summary {
      display: flex;
      gap: 16px;
    }
    
    /* NOT FOUND */
    .not-found {
      padding: 40px;
      text-align: center;
      color: #999;
    }
  `]
})
export class SectionContainerComponent implements OnChanges {
  private readonly facade = inject(ProjectStateFacade);
  
  @Input({ required: true }) sectionId!: string;
  
  // Estado local
  readonly isEditing = signal(false);
  
  // Signal computado para la sección actual
  readonly section = computed<Section | null>(() => {
    return this.facade.getSectionContent(this.sectionId) ?? null;
  });
  
  // Contadores de contenido
  readonly paragraphCount = computed(() => 
    this.section()?.contents.filter(c => c.type === 'PARAGRAPH').length ?? 0
  );
  
  readonly imageCount = computed(() => 
    this.section()?.contents.filter(c => c.type === 'IMAGE').length ?? 0
  );
  
  readonly tableCount = computed(() => 
    this.section()?.contents.filter(c => c.type === 'TABLE').length ?? 0
  );
  
  // Badge del tipo de sección
  readonly sectionTypeBadge = computed(() => {
    const type = this.section()?.sectionType;
    if (type?.includes('AISD')) return 'aisd';
    if (type?.includes('AISI')) return 'aisi';
    return 'static';
  });
  
  readonly sectionTypeLabel = computed(() => {
    const type = this.section()?.sectionType;
    const labels: Record<string, string> = {
      'STATIC': 'Estática',
      'AISD_ROOT': 'AISD',
      'AISD_SUB': 'AISD',
      'AISI_ROOT': 'AISI',
      'AISI_SUB': 'AISI'
    };
    return labels[type ?? ''] ?? 'Sección';
  });
  
  ngOnChanges(changes: SimpleChanges): void {
    // Resetear modo edición al cambiar de sección
    if (changes['sectionId']) {
      this.isEditing.set(false);
    }
  }
  
  toggleEditMode(): void {
    this.isEditing.update(v => !v);
  }
  
  // Type guards para template
  isParagraph(content: SectionContent): boolean {
    return isParagraphContent(content);
  }
  
  isImage(content: SectionContent): boolean {
    return isImageContent(content);
  }
  
  isTable(content: SectionContent): boolean {
    return isTableContent(content);
  }
  
  // Acciones de contenido
  addParagraph(): void {
    this.facade.addSectionParagraph(this.sectionId, 'Nuevo párrafo...');
  }
  
  addImage(): void {
    this.facade.addSectionImage(this.sectionId, 'Nueva imagen', 'Elaboración propia');
  }
  
  addTable(): void {
    this.facade.addSectionTable(this.sectionId, 'Nueva tabla', 'Elaboración propia', ['Columna 1', 'Columna 2']);
  }
  
  onParagraphChange(contentId: string, text: string): void {
    this.facade.updateSectionContent(this.sectionId, contentId, { text });
  }
  
  onImageTitleChange(contentId: string, titulo: string): void {
    this.facade.updateSectionContent(this.sectionId, contentId, { titulo });
  }
  
  onImageFuenteChange(contentId: string, fuente: string): void {
    this.facade.updateSectionContent(this.sectionId, contentId, { fuente });
  }
  
  onImagePreviewChange(contentId: string, preview: string): void {
    this.facade.updateSectionContent(this.sectionId, contentId, { preview });
  }
  
  onTableChange(contentId: string, changes: Partial<{ titulo: string; fuente: string; columns: string[]; rows: unknown[] }>): void {
    this.facade.updateSectionContent(this.sectionId, contentId, changes);
  }
  
  onRemoveContent(contentId: string): void {
    if (confirm('¿Eliminar este contenido?')) {
      this.facade.removeSectionContent(this.sectionId, contentId);
    }
  }
  
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
