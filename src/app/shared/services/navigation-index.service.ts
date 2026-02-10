import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectStateFacade } from '../../core/state/project-state.facade';
import { StorageFacade } from '../../core/services/infrastructure/storage-facade.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IndexItem {
  id: string;
  title: string;
  level: number;
  route?: string;
  children?: IndexItem[];
  completed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationIndexService {
  private indexStructure: IndexItem[] = [
    {
      id: 'plantilla',
      title: 'PLANTILLA',
      level: 1,
      route: '/plantilla'
    }
  ];

  private expandedItems = new BehaviorSubject<Set<string>>(new Set());
  private completedItems = new BehaviorSubject<Set<string>>(new Set());

  constructor(
    private router: Router,
    private projectFacade: ProjectStateFacade,
    private storage: StorageFacade
  ) {
    this.loadExpandedState();
  }

  private expandAllItems(items: IndexItem[]): Set<string> {
    const expanded = new Set<string>();
    const traverse = (itemList: IndexItem[]) => {
      itemList.forEach(item => {
        if (item.children && item.children.length > 0) {
          expanded.add(item.id);
          traverse(item.children);
        }
      });
    };
    traverse(items);
    return expanded;
  }

  getIndexStructure(): IndexItem[] {
    return this.indexStructure;
  }

  getExpandedItems(): Observable<Set<string>> {
    return this.expandedItems.asObservable();
  }

  getCompletedItems(): Observable<Set<string>> {
    return this.completedItems.asObservable();
  }

  toggleExpand(itemId: string): void {
    const expanded = new Set(this.expandedItems.value);
    if (expanded.has(itemId)) {
      expanded.delete(itemId);
    } else {
      expanded.add(itemId);
    }
    this.expandedItems.next(expanded);
    this.saveExpandedState(expanded);
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems.value.has(itemId);
  }

  navigateToSection(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  checkCompletedSections(): void {
    // Simplificado - solo verificar plantilla si es necesario
    const completed = new Set<string>();
    this.completedItems.next(completed);
  }

  isCompleted(itemId: string): boolean {
    return this.completedItems.value.has(itemId);
  }

  private saveExpandedState(expanded: Set<string>): void {
    this.storage.setItem('sidebarExpanded', JSON.stringify(Array.from(expanded)));
  }

  private loadExpandedState(): void {
    const saved = this.storage.getItem('sidebarExpanded');
    if (saved) {
      const expandedArray = JSON.parse(saved) as string[];
      const expanded = new Set<string>(expandedArray);
      this.expandedItems.next(expanded);
    } else {
      // Si no hay estado guardado, expandir todos los items por defecto
      const allExpanded = this.expandAllItems(this.indexStructure);
      this.expandedItems.next(allExpanded);
      this.saveExpandedState(allExpanded);
    }
  }
}
