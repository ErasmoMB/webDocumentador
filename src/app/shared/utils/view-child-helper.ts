export class ViewChildHelper {
  private static componentMap = new Map<string, any>();

  static registerComponent(id: string, component: any): void {
    if (component) {
      this.componentMap.set(id, component);
    }
  }

  static getComponent(id: string): any {
    return this.componentMap.get(id);
  }

  static updateAllComponents(method: string): void {
    this.componentMap.forEach(component => {
      if (component && typeof component[method] === 'function') {
        try {
          component[method]();
        } catch (error) {
          console.error(`Error calling ${method} on component:`, error);
        }
      }
    });
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

