/**
 * PrefixManager - Singleton para gestión centralizada de prefijos
 * 
 * PROBLEMA RESUELTO:
 * - Prefijos aplicados en múltiples lugares (components, services, helpers)
 * - Duplicación de lógica PrefijoHelper.obtenerPrefijoGrupo()
 * - Sin caché, recalculando prefijos constantemente
 * 
 * SOLUCIÓN SENIOR:
 * - Singleton pattern con caché
 * - API simple: getFieldKey(sectionId, baseKey)
 * - Invalidación de caché cuando cambia grupo
 * 
 * EJEMPLO USO:
 * ```typescript
 * // ANTES (múltiples lugares):
 * const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
 * const key = prefijo ? `petTabla${prefijo}` : 'petTabla';
 * 
 * // DESPUÉS (centralizado):
 * const key = PrefixManager.getFieldKey(this.seccionId, 'petTabla');
 * ```
 */

import { PrefijoHelper } from './prefijo-helper';

export class PrefixManager {
  private static instance: PrefixManager;
  private prefixCache = new Map<string, string>();
  private fieldKeyCache = new Map<string, string>();

  private constructor() {}

  static getInstance(): PrefixManager {
    if (!PrefixManager.instance) {
      PrefixManager.instance = new PrefixManager();
    }
    return PrefixManager.instance;
  }

  /**
   * Obtiene el prefijo para un sectionId
   * Cachea resultados para performance
   * 
   * @param sectionId - ID de sección (ej: '3.1.4.A.1.3')
   * @returns Prefijo (ej: '_A1') o '' si no aplica
   */
  static getPrefix(sectionId: string): string {
    const instance = PrefixManager.getInstance();
    
    if (!instance.prefixCache.has(sectionId)) {
      const prefix = PrefijoHelper.obtenerPrefijoGrupo(sectionId) || '';
      instance.prefixCache.set(sectionId, prefix);
    }
    
    return instance.prefixCache.get(sectionId)!;
  }

  /**
   * Obtiene la clave de campo con prefijo aplicado
   * Evita duplicación de prefijos
   * 
   * @param sectionId - ID de sección
   * @param baseKey - Clave base (ej: 'petTabla')
   * @returns Clave con prefijo (ej: 'petTabla_A1') o base si ya tiene prefijo
   */
  static getFieldKey(sectionId: string, baseKey: string): string {
    if (!baseKey || !sectionId) return baseKey;

    const cacheKey = `${sectionId}::${baseKey}`;
    const instance = PrefixManager.getInstance();

    if (!instance.fieldKeyCache.has(cacheKey)) {
      const prefix = PrefixManager.getPrefix(sectionId);
      
      // ✅ Prevenir duplicación: si baseKey ya termina con el prefijo, no agregar
      if (prefix && baseKey.endsWith(prefix)) {
        instance.fieldKeyCache.set(cacheKey, baseKey);
      } else {
        const finalKey = prefix ? `${baseKey}${prefix}` : baseKey;
        instance.fieldKeyCache.set(cacheKey, finalKey);
      }
    }

    return instance.fieldKeyCache.get(cacheKey)!;
  }

  /**
   * Limpia caché (útil cuando cambia el grupo AISD/AISI)
   */
  static clearCache(): void {
    const instance = PrefixManager.getInstance();
    instance.prefixCache.clear();
    instance.fieldKeyCache.clear();
  }

  /**
   * Limpia caché para un sectionId específico
   */
  static clearCacheForSection(sectionId: string): void {
    const instance = PrefixManager.getInstance();
    instance.prefixCache.delete(sectionId);
    
    // Eliminar todas las entradas que empiecen con este sectionId
    const keysToDelete: string[] = [];
    instance.fieldKeyCache.forEach((_, key) => {
      if (key.startsWith(`${sectionId}::`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => instance.fieldKeyCache.delete(key));
  }
}
