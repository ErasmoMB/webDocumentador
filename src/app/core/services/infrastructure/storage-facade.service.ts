import { Injectable } from '@angular/core';

/**
 * StorageFacade
 * 
 * Centraliza TODOS los accesos a localStorage en la aplicación.
 * Esto permite:
 * - Un único punto de control para persistencia
 * - Facilitar testing (mock)
 * - Facilitar migración futura (IndexedDB, etc.)
 * - Logging centralizado si se necesita
 * 
 * REGLA: Ningún otro servicio o componente debe acceder a localStorage directamente.
 * 
 * @since ETAPA 1 - Migración SOLID
 */
@Injectable({
  providedIn: 'root'
})
export class StorageFacade {
  
  /**
   * Obtiene un valor de localStorage
   */
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  /**
   * Guarda un valor en localStorage
   */
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * Elimina un valor de localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Limpia todo el localStorage
   */
  clear(): void {
    localStorage.clear();
  }

  /**
   * Obtiene todas las claves de localStorage
   */
  keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Obtiene un valor y lo parsea como JSON
   * Retorna null si no existe o si el JSON es inválido
   */
  getItemParsed<T>(key: string): T | null {
    const value = this.getItem(key);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Guarda un valor como JSON stringificado
   */
  setItemStringified(key: string, value: unknown): void {
    this.setItem(key, JSON.stringify(value));
  }

  /**
   * Verifica si una clave existe en localStorage
   */
  hasKey(key: string): boolean {
    return this.getItem(key) !== null;
  }
}
