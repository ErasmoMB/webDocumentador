import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-memory-debugger',
  template: `
    <div class="memory-debugger" *ngIf="visible">
      <h3>Memory Monitor</h3>
      <p><strong>Used Heap:</strong> {{ usedMemory }}MB</p>
      <p><strong>Total Heap:</strong> {{ totalMemory }}MB</p>
      <p><strong>Navigation Count:</strong> {{ navCount }}</p>
      <button (click)="forceGC()">Force GC (F12)</button>
      <button (click)="toggleVisible()">Hide</button>
    </div>
  `,
  styles: [`
    .memory-debugger {
      position: fixed;
      top: 10px;
      right: 10px;
      background: #1e1e1e;
      color: #00ff00;
      padding: 15px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 99999;
      border: 2px solid #00ff00;
      min-width: 250px;
    }
    .memory-debugger h3 {
      margin: 0 0 10px 0;
    }
    .memory-debugger p {
      margin: 5px 0;
    }
    .memory-debugger button {
      margin-right: 5px;
      padding: 5px 10px;
      background: #00ff00;
      color: black;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-weight: bold;
    }
    .memory-debugger button:hover {
      background: #00aa00;
    }
  `]
})
export class MemoryDebuggerComponent implements OnInit, OnDestroy {
  usedMemory = 0;
  totalMemory = 0;
  navCount = 0;
  visible = true;
  private updateSubscription?: Subscription;

  ngOnInit() {
    // Actualizar memoria cada 500ms
    this.updateSubscription = interval(500).subscribe(() => {
      this.updateMemory();
    });

    // Contar navegaciones
    window.addEventListener('navigate-section', () => {
      this.navCount++;
    });

    // Atajo: Ctrl+M para mostrar/ocultar
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        this.toggleVisible();
      }
    });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private updateMemory() {
    if ((performance as any).memory) {
      this.usedMemory = Math.round((performance as any).memory.usedJSHeapSize / 1048576);
      this.totalMemory = Math.round((performance as any).memory.totalJSHeapSize / 1048576);
    }
  }

  forceGC() {
  }

  toggleVisible() {
    this.visible = !this.visible;
  }
}
