import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from '../../core/services/formulario.service';
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
    private formularioService: FormularioService
  ) {
    this.loadExpandedState();
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
    localStorage.setItem('sidebarExpanded', JSON.stringify(Array.from(expanded)));
  }

  private loadExpandedState(): void {
    const saved = localStorage.getItem('sidebarExpanded');
    if (saved) {
      const expandedArray = JSON.parse(saved) as string[];
      const expanded = new Set<string>(expandedArray);
      this.expandedItems.next(expanded);
    }
  }
}

