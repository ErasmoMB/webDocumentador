import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NetworkAwarePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const shouldPreload = route.data?.['preload'] !== false;
    if (!shouldPreload) {
      return of(null);
    }

    const delayMs = Number(route.data?.['preloadDelayMs'] ?? 2500);

    if (this.isSlowConnectionOrSaveData()) {
      return of(null);
    }

    return timer(Math.max(0, delayMs)).pipe(mergeMap(() => load()));
  }

  private isSlowConnectionOrSaveData(): boolean {
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      const connection = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
      if (!connection) {
        return false;
      }

      if (connection.saveData === true) {
        return true;
      }

      const effectiveType = String(connection.effectiveType || '');
      return effectiveType.includes('2g') || effectiveType === 'slow-2g';
    } catch {
      return false;
    }
  }
}
