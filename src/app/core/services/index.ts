/**
 * Barrel export principal para servicios core
 * Uso: import { DataService, ConfigService } from '@core/services';
 */

// ✅ Servicios de infraestructura (caché, API, logging)
export * from './infrastructure';

// ✅ Comandos y tipos
export * from './commands';

// ✅ Datos y normalización
export * from './data';

// ✅ Transformadores de datos
export * from './data-transformers';

// ✅ Mapeo de campos
export * from './field-mapping';

// ✅ Adaptadores de estado
export * from './state-adapters';

// ✅ Servicios de dominio - Backend
export * from './backend';

// ✅ Servicios de formulario
export * from './formulario';

// ✅ Servicios de imagen
export * from './image';

// ✅ Servicios de tablas
export * from './tables';

// ✅ Servicios de numeración
export * from './numbering';

// ✅ Servicios de navegación
export * from './navigation';

// ✅ Servicios de grupos
export * from './groups';

// ✅ Servicios de ubicación
export * from './location';

// ✅ Servicios de utilidad
export * from './utilities';

// ✅ Orquestación de datos
export * from './orchestration';

// ✅ Gestión de estado
export * from './state';

// ✅ Generación de documentos Word
export * from './word-generator';
