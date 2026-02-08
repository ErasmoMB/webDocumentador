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
        // Eliminado: cargarFotografias() y markForCheck() 
        // Los componentes ahora manejan su propia detección de cambios
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

