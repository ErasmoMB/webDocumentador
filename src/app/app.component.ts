import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'LBS';
  sidebarExpanded = false;

  constructor() {}

  onSidebarToggle(expanded: boolean): void {
    this.sidebarExpanded = expanded;
  }
}

