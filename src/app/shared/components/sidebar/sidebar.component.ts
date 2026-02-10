import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NavigationIndexService, IndexItem } from '../../services/navigation-index.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() toggleState = new EventEmitter<boolean>();
  isExpanded = true;
  indexStructure: IndexItem[] = [];
  expandedItems = new Set<string>();
  completedItems = new Set<string>();
  private subscriptions = new Subscription();

  constructor(private navigationService: NavigationIndexService) {}

  ngOnInit(): void {
    this.indexStructure = this.navigationService.getIndexStructure();
    
    this.subscriptions.add(
      this.navigationService.getExpandedItems().subscribe(expanded => {
        this.expandedItems = expanded;
      })
    );

    this.subscriptions.add(
      this.navigationService.getCompletedItems().subscribe(completed => {
        this.completedItems = completed;
      })
    );

    this.navigationService.checkCompletedSections();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.toggleState.emit(this.isExpanded);
  }

  toggleExpand(item: IndexItem): void {
    if (item.children && item.children.length > 0) {
      this.navigationService.toggleExpand(item.id);
    }
  }

  isItemExpanded(item: IndexItem): boolean {
    return this.navigationService.isExpanded(item.id);
  }

  isItemCompleted(item: IndexItem): boolean {
    return this.navigationService.isCompleted(item.id);
  }

  navigateToSection(item: IndexItem): void {
    if (item.route) {
      this.navigationService.navigateToSection(item.route);
    }
  }

  hasChildren(item: IndexItem): boolean {
    return !!(item.children && item.children.length > 0);
  }
}

