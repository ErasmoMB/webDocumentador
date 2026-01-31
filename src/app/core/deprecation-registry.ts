/**
 * DEPRECATION REGISTRY - PASO 6.5
 * 
 * Este archivo documenta los componentes y servicios que deben
 * migrarse gradualmente al nuevo patrón de Store.
 * 
 * NO eliminar servicios hasta que todos sus consumidores estén migrados.
 */

// ============================================================================
// SERVICIOS CON BehaviorSubject PARA DEPRECAR
// ============================================================================

/**
 * ReactiveStateAdapter
 * Path: src/app/core/services/legacy/legacy-state-adapter.service.ts
 * BehaviorSubjects: 5
 * - datosSubject
 * - loadingSubject
 * - errorSubject
 * - aisdGroupSubject
 * - aisiGroupSubject
 * 
 * Reemplazo: UIReadAdapter
 * - datos$ → reader.projectInfo
 * - aisdGroup$ → reader.aisdGroups
 */
export const LEGACY_STATE_ADAPTER_DEPRECATION = {
  service: 'ReactiveStateAdapter',
  path: 'src/app/core/services/legacy/legacy-state-adapter.service.ts',
  behaviorSubjects: ['datosSubject', 'loadingSubject', 'errorSubject', 'aisdGroupSubject', 'aisiGroupSubject'],
  replacement: 'UIReadAdapter',
  status: 'TO_MIGRATE'
} as const;

/**
 * GroupConfigService
 * Path: src/app/core/services/group-config.service.ts
 * BehaviorSubjects: 1
 * - configSubject
 * 
 * Reemplazo: UIReadAdapter + UIWriteAdapter
 * - config$ → reader.aisdGroups / reader.aisiGroups
 * - setAISD() → writer.addGroup('AISD', ...)
 */
export const GROUP_CONFIG_SERVICE_DEPRECATION = {
  service: 'GroupConfigService',
  path: 'src/app/core/services/group-config.service.ts',
  behaviorSubjects: ['configSubject'],
  replacement: 'UIReadAdapter + UIWriteAdapter',
  status: 'TO_MIGRATE'
} as const;

/**
 * FormStateService
 * Path: src/app/core/services/state/form-state.service.ts
 * BehaviorSubjects: 1
 * - formSubject
 * 
 * Reemplazo: UIReadAdapter + UIWriteAdapter
 * - state$ → reader.getSectionFields()
 * - updateField() → writer.setField()
 */
export const FORM_STATE_SERVICE_DEPRECATION = {
  service: 'FormStateService',
  path: 'src/app/core/services/state/form-state.service.ts',
  behaviorSubjects: ['formSubject'],
  replacement: 'UIReadAdapter + UIWriteAdapter',
  status: 'TO_MIGRATE'
} as const;

/**
 * SeccionStateService
 * Path: src/app/features/secciones/services/seccion-state.service.ts
 * BehaviorSubjects: 1
 * - stateSubject
 * 
 * Reemplazo: UIReadAdapter
 * - state$ → reader.getSectionNavSignal()
 */
export const SECCION_STATE_SERVICE_DEPRECATION = {
  service: 'SeccionStateService',
  path: 'src/app/features/secciones/services/seccion-state.service.ts',
  behaviorSubjects: ['stateSubject'],
  replacement: 'UIReadAdapter',
  status: 'TO_MIGRATE'
} as const;

/**
 * NavigationIndexService
 * Path: src/app/shared/services/navigation-index.service.ts
 * BehaviorSubjects: 2
 * - expandedItems
 * - completedItems
 * 
 * Reemplazo: UIReadAdapter (para secciones completas)
 */
export const NAVIGATION_INDEX_SERVICE_DEPRECATION = {
  service: 'NavigationIndexService',
  path: 'src/app/shared/services/navigation-index.service.ts',
  behaviorSubjects: ['expandedItems', 'completedItems'],
  replacement: 'UIReadAdapter',
  status: 'TO_MIGRATE'
} as const;

/**
 * Seccion3FuentesManagementService
 * Path: src/app/core/services/seccion3-fuentes-management.service.ts
 * BehaviorSubjects: 1
 * - fuentesSubject
 * 
 * Reemplazo: Store fields
 */
export const SECCION3_FUENTES_SERVICE_DEPRECATION = {
  service: 'Seccion3FuentesManagementService',
  path: 'src/app/core/services/seccion3-fuentes-management.service.ts',
  behaviorSubjects: ['fuentesSubject'],
  replacement: 'UIWriteAdapter.setField()',
  status: 'TO_MIGRATE'
} as const;

// ============================================================================
// PATRONES LEGACY PARA ELIMINAR
// ============================================================================

/**
 * Patrón: datosAnteriores
 * 
 * Componentes que tienen:
 * - protected/private datosAnteriores: any = {};
 * - Detección manual en ngDoCheck
 * 
 * Reemplazo: Signals del UIReadAdapter
 */
export const DATOS_ANTERIORES_PATTERN = {
  pattern: 'datosAnteriores',
  searchQuery: 'datosAnteriores: any = {}',
  affectedFiles: [
    'src/app/shared/components/base-section.component.ts',
    'src/app/shared/components/seccion31/seccion31.component.ts',
    'src/app/shared/components/seccion32/seccion32.component.ts',
    'src/app/shared/components/seccion33/seccion33.component.ts',
    'src/app/shared/components/seccion34/seccion34.component.ts',
    'src/app/shared/components/seccion35/seccion35.component.ts',
    'src/app/shared/components/seccion36/seccion36.component.ts'
  ],
  replacement: 'Signals via UIReadAdapter',
  status: 'TO_MIGRATE'
} as const;

// ============================================================================
// REGISTRO COMPLETO
// ============================================================================

export const DEPRECATION_REGISTRY = {
  services: [
    LEGACY_STATE_ADAPTER_DEPRECATION,
    GROUP_CONFIG_SERVICE_DEPRECATION,
    FORM_STATE_SERVICE_DEPRECATION,
    SECCION_STATE_SERVICE_DEPRECATION,
    NAVIGATION_INDEX_SERVICE_DEPRECATION,
    SECCION3_FUENTES_SERVICE_DEPRECATION
  ],
  patterns: [
    DATOS_ANTERIORES_PATTERN
  ],
  totalBehaviorSubjects: 11,
  totalAffectedComponents: 7,
  migrationPriority: [
    'GroupConfigService',      // Más usado
    'FormStateService',        // Crítico para forms
    'ReactiveStateAdapter',      // Adaptador principal
    'SeccionStateService',     // Por sección
    'NavigationIndexService',  // UI navigation
    'Seccion3FuentesManagementService' // Específico
  ]
} as const;

// ============================================================================
// HELPER PARA MIGRACIÓN GRADUAL
// ============================================================================

/**
 * Decorator para marcar métodos como deprecated.
 * Útil durante la transición.
 */
export function Deprecated(message: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      console.warn(`⚠️ DEPRECATED: ${propertyKey} - ${message}`);
      return original.apply(this, args);
    };
    return descriptor;
  };
}

/**
 * Utility para verificar si un servicio está migrado.
 */
export function checkMigrationStatus(serviceName: string): 'TO_MIGRATE' | 'MIGRATED' | 'UNKNOWN' {
  const service = DEPRECATION_REGISTRY.services.find(s => s.service === serviceName);
  return service?.status ?? 'UNKNOWN';
}
