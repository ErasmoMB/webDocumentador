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
    useMockData: this.getEnvBoolean('USE_MOCK_DATA', false),
    apiUrl: this.getEnvString('API_URL', 'http://localhost:8000'),
    mockDataPath: this.getEnvString('MOCK_DATA_PATH', 'assets/mockData'),
    nodeEnv: this.getEnvString('NODE_ENV', 'development')
  };

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig(): void {
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
      const env = (window as any).__ENV__;
      if (env.USE_MOCK_DATA !== undefined) {
        this.config.useMockData = this.getEnvBoolean('USE_MOCK_DATA', false);
      }
      if (env.API_URL) {
        let apiUrl = env.API_URL;
        apiUrl = apiUrl.replace(/\/api\/?$/, '');
        if (apiUrl.endsWith('/')) {
          apiUrl = apiUrl.slice(0, -1);
        }
        this.config.apiUrl = apiUrl;
      }
      if (env.MOCK_DATA_PATH) {
        this.config.mockDataPath = env.MOCK_DATA_PATH;
      }
      if (env.NODE_ENV) {
        this.config.nodeEnv = env.NODE_ENV;
      }
    }

    if (!this.config.apiUrl) {
      this.config.apiUrl = 'http://localhost:8000';
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
