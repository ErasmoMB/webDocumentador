import { debugLog, debugWarn, debugError } from './debug';

export class ViewChildHelper {
  private static componentMap = new Map<string, any>();
  private static isUpdating = false;

  static registerComponent(id: string, component: any): void {
    if (component) {
      this.componentMap.set(id, component);
    }
  }

  static getComponent(id: string): any {
    return this.componentMap.get(id);
  }

  static updateAllComponents(method: string): void {
    // Guard against recursive calls to prevent stack overflow
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    try {
      this.componentMap.forEach((component, id) => {
        if (!component) return;

        // Call the requested method if present
        if (typeof component[method] === 'function') {
          try {
            component[method]();
          } catch (error) {
            debugError('[ViewChildHelper] Error calling', method, 'on', id, ':', error);
          }
        }

        // If we asked to actualizarDatos, also refresh photographs if component supports it
        if (method === 'actualizarDatos') {
          try {
            if (typeof component['cargarFotografias'] === 'function') {
              try { component['cargarFotografias'](); } catch {}
            }
          } catch {}
        }

        // Try to mark component for check if possible
        try {
          if (component && component['cdRef'] && typeof component['cdRef'].markForCheck === 'function') {
            component['cdRef'].markForCheck();
          }
        } catch {}
      });
    } finally {
      this.isUpdating = false;
    }
  }

  static clear(): void {
    this.componentMap.clear();
  }

  static removeComponent(id: string): void {
    this.componentMap.delete(id);
  }

  static hasComponent(id: string): boolean {
    return this.componentMap.has(id);
  }
}

