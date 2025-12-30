import { Injectable } from '@angular/core';

interface CacheEntry {
  data: any;
  timestamp: number;
  url: string;
  params?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly CACHE_PREFIX = 'api_cache_';
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

  saveResponse(url: string, params: any, data: any): void {
    try {
      const cacheKey = this.generateCacheKey(url, params);
      const entry: CacheEntry = {
        data: data,
        timestamp: Date.now(),
        url: url,
        params: params
      };
      
      localStorage.setItem(this.CACHE_PREFIX + cacheKey, JSON.stringify(entry));
      console.log('Respuesta guardada en cache:', cacheKey);
    } catch (error) {
      console.error('Error al guardar en cache:', error);
    }
  }

  getCachedResponse(url: string, params: any): any | null {
    try {
      const cacheKey = this.generateCacheKey(url, params);
      const cached = localStorage.getItem(this.CACHE_PREFIX + cacheKey);
      
      if (!cached) {
        return null;
      }

      const entry: CacheEntry = JSON.parse(cached);
      
      if (this.isExpired(entry.timestamp)) {
        localStorage.removeItem(this.CACHE_PREFIX + cacheKey);
        return null;
      }

      console.log('Usando respuesta desde cache:', cacheKey);
      return entry.data;
    } catch (error) {
      console.error('Error al leer cache:', error);
      return null;
    }
  }

  exportCacheToJSON(): void {
    try {
      const cacheData: any = {};
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const entry: CacheEntry = JSON.parse(localStorage.getItem(key) || '{}');
          const cleanKey = key.replace(this.CACHE_PREFIX, '');
          cacheData[cleanKey] = {
            url: entry.url,
            params: entry.params,
            data: entry.data,
            timestamp: entry.timestamp
          };
        }
      });

      const blob = new Blob([JSON.stringify(cacheData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `api-cache-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Cache exportado a JSON');
    } catch (error) {
      console.error('Error al exportar cache:', error);
    }
  }

  importCacheFromJSON(jsonData: any): void {
    try {
      Object.keys(jsonData).forEach(key => {
        const entry = jsonData[key];
        const cacheKey = this.generateCacheKey(entry.url, entry.params);
        const cacheEntry: CacheEntry = {
          data: entry.data,
          timestamp: entry.timestamp || Date.now(),
          url: entry.url,
          params: entry.params
        };
        localStorage.setItem(this.CACHE_PREFIX + cacheKey, JSON.stringify(cacheEntry));
      });
      console.log('Cache importado desde JSON');
    } catch (error) {
      console.error('Error al importar cache:', error);
    }
  }

  clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cache limpiado');
    } catch (error) {
      console.error('Error al limpiar cache:', error);
    }
  }

  getCacheStats(): { total: number; size: number } {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      let totalSize = 0;
      
      cacheKeys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });

      return {
        total: cacheKeys.length,
        size: totalSize
      };
    } catch (error) {
      console.error('Error al obtener estadisticas de cache:', error);
      return { total: 0, size: 0 };
    }
  }

  private generateCacheKey(url: string, params: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    const key = `${url}_${paramsStr}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '_');
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_EXPIRY;
  }

  getMockDataFromCache(endpoint: string, params: any): any | null {
    const cached = this.getCachedResponse(endpoint, params);
    if (cached && cached.success) {
      return cached;
    }
    return null;
  }
}

