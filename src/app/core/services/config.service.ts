import { Injectable } from '@angular/core';

export interface AppConfig {
  useMockData: boolean;
  apiUrl: string;
  mockDataPath: string;
  nodeEnv: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig = {
    useMockData: this.getEnvBoolean('USE_MOCK_DATA', true), // Leer de env.js, por defecto true
    apiUrl: this.getEnvString('API_URL', 'http://localhost:8000/api/v1'),
    mockDataPath: this.getEnvString('MOCK_DATA_PATH', 'assets/mockData'),
    nodeEnv: this.getEnvString('NODE_ENV', 'development')
  };

  constructor() {
    this.initializeConfig();
    console.log('ConfigService inicializado:', {
      apiUrl: this.config.apiUrl,
      useMockData: this.config.useMockData,
      hasWindowEnv: typeof window !== 'undefined' && !!(window as any).__ENV__
    });
    
    if (!this.config.useMockData) {
      console.log('🔌 MODO BACKEND ACTIVADO - Conectando a:', this.config.apiUrl);
      console.log('💾 Las respuestas del backend se guardarán automáticamente en cache');
    } else {
      console.log('📦 MODO MOCK ACTIVADO - Usando datos estáticos');
      console.log('💡 Para usar el backend, cambia USE_MOCK_DATA a false en env.js');
    }
  }

  private initializeConfig(): void {
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
      const env = (window as any).__ENV__;
      console.log('Leyendo configuración de window.__ENV__:', env);
      
      if (env.USE_MOCK_DATA !== undefined) {
        this.config.useMockData = this.getEnvBoolean('USE_MOCK_DATA', true);
      }
      if (env.API_URL) {
        this.config.apiUrl = env.API_URL;
      }
      if (env.MOCK_DATA_PATH) {
        this.config.mockDataPath = env.MOCK_DATA_PATH;
      }
      if (env.NODE_ENV) {
        this.config.nodeEnv = env.NODE_ENV;
      }
    } else {
      console.warn('window.__ENV__ no está disponible. Usando valores por defecto.');
    }
    
    if (!this.config.apiUrl) {
      console.error('API_URL no configurada. Usando valor por defecto.');
      this.config.apiUrl = 'http://localhost:8000/api/v1';
    }
  }

  private getEnvString(key: string, defaultValue: string): string {
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
      const value = (window as any).__ENV__[key];
      return value !== undefined && value !== null ? String(value) : defaultValue;
    }
    return defaultValue;
  }

  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
      const value = (window as any).__ENV__[key];
      if (value === 'true' || value === true) return true;
      if (value === 'false' || value === false) return false;
      return defaultValue;
    }
    return defaultValue;
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  isMockMode(): boolean {
    return this.config.useMockData;
  }

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  getMockDataPath(): string {
    return this.config.mockDataPath;
  }

  getNodeEnv(): string {
    return this.config.nodeEnv;
  }
}
