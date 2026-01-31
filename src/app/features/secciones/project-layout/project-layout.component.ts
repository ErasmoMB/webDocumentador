/**
 * PROJECT LAYOUT COMPONENT - FASE 3
 * 
 * Layout principal con:
 * - Sidebar izquierdo: Lista de secciones (iterando sectionOrder)
 * - Área principal: Contenedor de sección activa
 * 
 * Se conecta al ProjectFacade para obtener:
 * - sectionOrder: Lista de IDs de secciones
 * - allSections: Secciones completas con títulos
 * - activeSectionContentId: ID de sección seleccionada
 */

import { 
  Component, 
  inject, 
  signal, 
  computed,
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { Section, SectionType } from '../../../core/state/section.model';
import { SectionContainerComponent } from '../section-container/section-container.component';

interface SidebarItem {
  id: string;
  title: string;
  level: number;
  sectionType: SectionType;
  isActive: boolean;
  hasContent: boolean;
}

@Component({
  selector: 'app-project-layout',
  standalone: true,
  imports: [CommonModule, SectionContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="project-layout">
      <!-- SIDEBAR -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <h2>Secciones</h2>
          <button 
            class="toggle-btn"
            (click)="toggleSidebar()"
            [attr.aria-label]="sidebarCollapsed() ? 'Expandir sidebar' : 'Colapsar sidebar'">
            {{ sidebarCollapsed() ? '→' : '←' }}
          </button>
        </div>
        
        <div class="sidebar-content" *ngIf="!sidebarCollapsed()">
          <!-- Botón para inicializar secciones (demo) -->
          <button 
            class="init-btn"
            *ngIf="sidebarItems().length === 0"
            (click)="initializeSections()">
            Inicializar Secciones
          </button>
          
          <!-- Lista de secciones -->
          <nav class="section-nav">
            <ul>
              @for (item of sidebarItems(); track item.id) {
                <li 
                  class="nav-item"
                  [class.active]="item.isActive"
                  [class.has-content]="item.hasContent"
                  [style.padding-left.px]="item.level * 12 + 8">
                  <button 
                    class="nav-link"
                    (click)="selectSection(item.id)"
                    [attr.aria-current]="item.isActive ? 'page' : null">
                    <span class="section-indicator" [class]="getSectionTypeClass(item.sectionType)"></span>
                    <span class="section-title">{{ item.title }}</span>
                    @if (item.hasContent) {
                      <span class="content-badge">●</span>
                    }
                  </button>
                </li>
              }
            </ul>
          </nav>
        </div>
        
        <!-- Stats del documento -->
        <div class="sidebar-footer" *ngIf="!sidebarCollapsed()">
          <div class="stats">
            <span>📷 {{ totalImages() }} figuras</span>
            <span>📊 {{ totalTables() }} tablas</span>
          </div>
        </div>
      </aside>
      
      <!-- MAIN CONTENT -->
      <main class="main-content">
        @if (activeSectionId()) {
          <app-section-container 
            [sectionId]="activeSectionId()!" />
        } @else {
          <div class="empty-state">
            <h3>Selecciona una sección</h3>
            <p>Haz clic en una sección del sidebar para comenzar a editar.</p>
            @if (sidebarItems().length === 0) {
              <p class="hint">💡 Primero carga un archivo JSON o inicializa las secciones.</p>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .project-layout {
      display: flex;
      height: 100vh;
      background: #f5f5f5;
    }
    
    /* SIDEBAR */
    .sidebar {
      width: 300px;
      background: white;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
    }
    
    .sidebar.collapsed {
      width: 50px;
    }
    
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .sidebar-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .collapsed .sidebar-header h2 {
      display: none;
    }
    
    .toggle-btn {
      background: #f0f0f0;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    
    .init-btn {
      margin: 16px;
      padding: 8px 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .init-btn:hover {
      background: #45a049;
    }
    
    /* NAVIGATION */
    .section-nav ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-item {
      margin: 2px 0;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-size: 13px;
      color: #333;
      transition: background 0.15s;
    }
    
    .nav-link:hover {
      background: #f5f5f5;
    }
    
    .nav-item.active .nav-link {
      background: #e3f2fd;
      color: #1976d2;
      font-weight: 500;
    }
    
    .section-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .section-indicator.static { background: #9e9e9e; }
    .section-indicator.aisd-root { background: #4CAF50; }
    .section-indicator.aisd-sub { background: #81C784; }
    .section-indicator.aisi-root { background: #2196F3; }
    .section-indicator.aisi-sub { background: #64B5F6; }
    
    .section-title {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .content-badge {
      color: #4CAF50;
      font-size: 8px;
    }
    
    .sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }
    
    .stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;
    }
    
    /* MAIN CONTENT */
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: #666;
    }
    
    .empty-state h3 {
      margin: 0 0 8px;
      color: #333;
    }
    
    .empty-state .hint {
      margin-top: 24px;
      padding: 12px 24px;
      background: #fff3e0;
      border-radius: 8px;
      color: #e65100;
    }
  `]
})
export class ProjectLayoutComponent {
  private readonly facade = inject(ProjectStateFacade);
  
  // Estado local del sidebar
  readonly sidebarCollapsed = signal(false);
  
  // Signals del facade
  readonly activeSectionId = this.facade.activeSectionContentId;
  readonly totalImages = this.facade.totalImageCount;
  readonly totalTables = this.facade.totalTableCount;
  
  // Computed: Items del sidebar
  readonly sidebarItems = computed<SidebarItem[]>(() => {
    const sections = this.facade.allSections();
    const activeId = this.activeSectionId();
    
    return sections.map(section => ({
      id: section.id,
      title: this.formatSectionTitle(section),
      level: this.calculateLevel(section.id),
      sectionType: section.sectionType,
      isActive: section.id === activeId,
      hasContent: section.contents.length > 0
    }));
  });
  
  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
  
  selectSection(sectionId: string): void {
    this.facade.setActiveSectionContent(sectionId);
  }
  
  initializeSections(): void {
    this.facade.initializeSectionsTree();
  }
  
  getSectionTypeClass(type: SectionType): string {
    const classMap: Record<SectionType, string> = {
      'STATIC': 'static',
      'AISD_ROOT': 'aisd-root',
      'AISD_SUB': 'aisd-sub',
      'AISI_ROOT': 'aisi-root',
      'AISI_SUB': 'aisi-sub'
    };
    return classMap[type] || 'static';
  }
  
  private formatSectionTitle(section: Section): string {
    // Formatear título con ID para mejor navegación
    return `${section.id} ${section.title}`;
  }
  
  private calculateLevel(sectionId: string): number {
    // Calcular nivel de indentación basado en el ID
    // "1" = nivel 0, "1.1" = nivel 1, "a.1.1" = nivel 2
    const parts = sectionId.split('.');
    return Math.min(parts.length - 1, 3);
  }
}
