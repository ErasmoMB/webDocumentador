/**
 * Barrel export principal para módulo core
 * Uso: import { DataService, CacheInterceptor, GlobalErrorHandler } from '@core';
 */
export * from './core.module';
// export * from './services'; // Removido para evitar conflictos con Clean Architecture
export * from './guards';
export * from './interceptors';
export * from './handlers';

// Nueva arquitectura Clean Architecture
export * from './domain/entities';
export * from './domain/interfaces';
export * from './application/use-cases';
export * from './infrastructure/services';
export * from './dependency-injection.config';
// Export System (PASO 8)
export * from './export';
