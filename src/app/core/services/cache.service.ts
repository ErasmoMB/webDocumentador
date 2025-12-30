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
  private readonly MOCK_DATA_PREFIX = 'mock_data_';
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;
  private autoExportEnabled = false; // Deshabilitado por defecto para evitar descargas automáticas

  saveResponse(url: string, params: any, data: any): void {
    try {
      const cacheKey = this.generateCacheKey(url, params);
      const entry: CacheEntry = {
        data: data,
        timestamp: Date.now(),
        url: url,
        params: params
      };
      
      // Guardar en cache normal
      localStorage.setItem(this.CACHE_PREFIX + cacheKey, JSON.stringify(entry));
      
      // Guardar organizado por endpoint para uso como mock data
      this.saveMockDataByEndpoint(url, params, data);
      
      console.log('✅ Respuesta guardada en cache:', cacheKey);
      
      // Auto-exportar si está habilitado
      if (this.autoExportEnabled) {
        this.autoExportMockData();
      }
    } catch (error) {
      console.error('Error al guardar en cache:', error);
    }
  }

  private saveMockDataByEndpoint(url: string, params: any, data: any): void {
    try {
      // Identificar el tipo de endpoint
      const endpointType = this.getEndpointType(url);
      
      if (!endpointType) return;
      
      // Crear clave única para este endpoint y parámetros
      const endpointKey = this.getEndpointKey(url, params);
      
      // Guardar la respuesta más reciente para este endpoint
      const mockDataEntry = {
        url: url,
        params: params,
        data: data,
        timestamp: Date.now(),
        endpointType: endpointType
      };
      
      localStorage.setItem(`${this.MOCK_DATA_PREFIX}${endpointType}_${endpointKey}`, JSON.stringify(mockDataEntry));
      
      // Actualizar el archivo JSON consolidado para este tipo
      this.updateConsolidatedMockData(endpointType, data);
      
      console.log(`📝 Mock data actualizado para: ${endpointType}`);
    } catch (error) {
      console.error('Error al guardar mock data:', error);
    }
  }

  private getEndpointType(url: string): string | null {
    if (url.includes('/poblacion/') && !url.includes('/distrito') && !url.includes('/provincia')) {
      return 'poblacion';
    }
    if (url.includes('/poblacion/distrito')) {
      return 'poblacion_distrito';
    }
    if (url.includes('/poblacion/provincia')) {
      return 'poblacion_provincia';
    }
    if (url.includes('/censo/pea-nopea')) {
      return 'pea';
    }
    return null;
  }

  private getEndpointKey(url: string, params: any): string {
    if (params) {
      if (params.cpp) {
        return `cpp_${Array.isArray(params.cpp) ? params.cpp.join('_') : params.cpp}`;
      }
      if (params.distrito) {
        return `distrito_${params.distrito}`;
      }
      if (params.provincia) {
        return `provincia_${params.provincia}`;
      }
    }
    return 'default';
  }

  private updateConsolidatedMockData(endpointType: string, data: any): void {
    try {
      // Para poblacion por CPP, guardar la estructura completa
      if (endpointType === 'poblacion' && data && data.data) {
        const consolidatedKey = `${this.MOCK_DATA_PREFIX}consolidated_poblacion`;
        localStorage.setItem(consolidatedKey, JSON.stringify(data.data));
      }
      
      // Para PEA, guardar la estructura completa
      if (endpointType === 'pea' && data && data.data) {
        const consolidatedKey = `${this.MOCK_DATA_PREFIX}consolidated_pea`;
        localStorage.setItem(consolidatedKey, JSON.stringify(data.data));
      }
      
      // Para población por distrito, guardar como array
      if (endpointType === 'poblacion_distrito' && data && data.data) {
        const consolidatedKey = `${this.MOCK_DATA_PREFIX}consolidated_poblacion_distrito`;
        localStorage.setItem(consolidatedKey, JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Error al actualizar mock data consolidado:', error);
    }
  }

  private autoExportMockData(): void {
    try {
      // Exportar automáticamente cada 20 respuestas guardadas (menos frecuente para evitar descargas molestas)
      // Solo si está habilitado explícitamente
      if (!this.autoExportEnabled) {
        return;
      }
      const stats = this.getCacheStats();
      if (stats.total > 0 && stats.total % 20 === 0) {
        console.log('🔄 Auto-exportando mock data... (cada 20 respuestas)');
        this.exportMockDataToJSON();
      }
    } catch (error) {
      console.error('Error en auto-export:', error);
    }
  }

  exportMockDataToJSON(): void {
    try {
      const mockData: any = {
        poblacion: null,
        pea: null,
        poblacion_distrito: null,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      // Obtener datos consolidados
      const poblacionData = localStorage.getItem(`${this.MOCK_DATA_PREFIX}consolidated_poblacion`);
      const peaData = localStorage.getItem(`${this.MOCK_DATA_PREFIX}consolidated_pea`);
      const poblacionDistritoData = localStorage.getItem(`${this.MOCK_DATA_PREFIX}consolidated_poblacion_distrito`);
      
      if (poblacionData) {
        mockData.poblacion = JSON.parse(poblacionData);
      }
      
      if (peaData) {
        mockData.pea = JSON.parse(peaData);
      }
      
      if (poblacionDistritoData) {
        mockData.poblacion_distrito = JSON.parse(poblacionDistritoData);
      }
      
      // Obtener todas las respuestas individuales también
      const allResponses: any = {};
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.MOCK_DATA_PREFIX) && !key.includes('consolidated')) {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '{}');
            allResponses[key.replace(this.MOCK_DATA_PREFIX, '')] = {
              url: entry.url,
              params: entry.params,
              data: entry.data,
              timestamp: entry.timestamp
            };
          } catch (e) {
            console.error('Error parsing entry:', key, e);
          }
        }
      });
      
      mockData.all_responses = allResponses;
      
      // Descargar el archivo
      const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mock-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Mock data exportado automáticamente');
    } catch (error) {
      console.error('Error al exportar mock data:', error);
    }
  }

  getConsolidatedMockData(endpointType: string): any | null {
    try {
      const key = `${this.MOCK_DATA_PREFIX}consolidated_${endpointType}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener mock data consolidado:', error);
      return null;
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

  enableAutoExport(): void {
    this.autoExportEnabled = true;
    console.log('✅ Auto-export habilitado');
  }

  disableAutoExport(): void {
    this.autoExportEnabled = false;
    console.log('⏸️ Auto-export deshabilitado');
  }

  isAutoExportEnabled(): boolean {
    return this.autoExportEnabled;
  }

  // Método para exportar manualmente
  exportAllMockData(): void {
    this.exportMockDataToJSON();
  }

  // Método para verificar qué datos hay guardados
  verificarDatosGuardados(): {
    tieneCache: boolean;
    totalRespuestas: number;
    respuestasPorTipo: { [key: string]: number };
    datosConsolidados: { [key: string]: boolean };
    resumen: string;
  } {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const mockKeys = keys.filter(key => key.startsWith(this.MOCK_DATA_PREFIX));
      
      const respuestasPorTipo: { [key: string]: number } = {};
      const datosConsolidados: { [key: string]: boolean } = {
        poblacion: false,
        pea: false,
        poblacion_distrito: false
      };

      // Contar respuestas por tipo
      mockKeys.forEach(key => {
        if (key.includes('consolidated')) {
          const tipo = key.replace(this.MOCK_DATA_PREFIX + 'consolidated_', '');
          datosConsolidados[tipo] = true;
        } else {
          const tipo = key.split('_')[1] || 'otro';
          respuestasPorTipo[tipo] = (respuestasPorTipo[tipo] || 0) + 1;
        }
      });

      // Obtener detalles de las respuestas
      const detallesRespuestas: any[] = [];
      cacheKeys.forEach(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (entry.url) {
            detallesRespuestas.push({
              url: entry.url,
              params: entry.params,
              timestamp: new Date(entry.timestamp).toLocaleString('es-ES')
            });
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      });

      const tieneCache = cacheKeys.length > 0 || mockKeys.length > 0;
      
      let resumen = `📊 Estado del Cache:\n`;
      resumen += `• Total respuestas guardadas: ${cacheKeys.length}\n`;
      resumen += `• Total datos mock organizados: ${mockKeys.length}\n`;
      resumen += `\n📦 Datos Consolidados:\n`;
      resumen += `• Población: ${datosConsolidados['poblacion'] ? '✅ Sí' : '❌ No'}\n`;
      resumen += `• PEA: ${datosConsolidados['pea'] ? '✅ Sí' : '❌ No'}\n`;
      resumen += `• Población por Distrito: ${datosConsolidados['poblacion_distrito'] ? '✅ Sí' : '❌ No'}\n`;
      
      if (detallesRespuestas.length > 0) {
        resumen += `\n🔗 Respuestas Guardadas:\n`;
        detallesRespuestas.slice(0, 10).forEach((resp, idx) => {
          resumen += `${idx + 1}. ${resp.url}\n`;
          if (resp.params) {
            resumen += `   Parámetros: ${JSON.stringify(resp.params)}\n`;
          }
          resumen += `   Fecha: ${resp.timestamp}\n\n`;
        });
        if (detallesRespuestas.length > 10) {
          resumen += `... y ${detallesRespuestas.length - 10} más\n`;
        }
      }

      return {
        tieneCache,
        totalRespuestas: cacheKeys.length,
        respuestasPorTipo,
        datosConsolidados,
        resumen
      };
    } catch (error) {
      console.error('Error al verificar datos guardados:', error);
      return {
        tieneCache: false,
        totalRespuestas: 0,
        respuestasPorTipo: {},
        datosConsolidados: { poblacion: false, pea: false, poblacion_distrito: false },
        resumen: 'Error al verificar datos'
      };
    }
  }
}

