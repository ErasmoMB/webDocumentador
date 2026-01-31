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
    // updateAllComponents called with method logged
    // Guard against recursive calls to prevent stack overflow
    if (this.isUpdating) {
      return;
    }
    
    this.isUpdating = true;
    try {
      this.componentMap.forEach((component, id) => {
        // calling method on component logged
        if (component && typeof component[method] === 'function') {
          try {
            component[method]();
          } catch (error) {
            console.error('[ViewChildHelper] Error calling', method, 'on', id, ':', error);
          }
        } else {
          console.warn('[ViewChildHelper] Component', id, 'does not have method', method);
        }
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

