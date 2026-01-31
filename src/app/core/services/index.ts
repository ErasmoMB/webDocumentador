/**
 * Barrel export principal para servicios core
 * Uso: import { DataService, ConfigService } from '@core/services';
 */

// Servicios de infraestructura
export * from './infrastructure';

// Servicios de dominio
export * from './domain';

// Servicios de utilidad
export * from './config.service';
export * from './data.service';
export * from './formulario.service';
export * from './autocomplete.service';
export * from './image-management.service';
export * from './table-adapter.service';
export * from './word-generator.facade.service';

// ✅ NUEVOS: Servicios centralizados para tablas
export * from './section-table-registry.service';
export * from './table-handler-factory.service';

// Sub-módulos
export * from './orchestration';
export * from './state';
