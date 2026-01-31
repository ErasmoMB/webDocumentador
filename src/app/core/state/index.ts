/**
 * STATE MODULE BARREL EXPORT
 * 
 * Exporta todos los componentes del sistema de estado.
 */

// Models
export * from './project-state.model';
export * from './commands.model';

// Reducers
export {
  rootReducer,
  createInitialState,
  isStateDirty,
  getStateDebugInfo,
  metadataReducer,
  projectReducer,
  globalRegistryReducer,
  markStateDirty,
  sectionsReducer,
  fieldsReducer,
  tablesReducer,
  imagesReducer,
  groupConfigReducer,
  ccppRegistryReducer
} from './reducers';

// UI Contract (ÚNICO punto de acceso para componentes)
export {
  // Tipos públicos para UI
  ProjectInfo,
  GroupOption,
  SectionNavItem,
  FormField,
  UITableRow,
  GalleryImage,
  UbicacionInfo,
  // Selectores
  Selectors,
  // Command Builders
  Commands,
  // Store Service
  UIStoreService,
  // Utilidades
  isValidField,
  isSectionEditable,
  createUIElementId
} from './ui-store.contract';

// Facade (para migración gradual)
export { ProjectStateFacade } from './project-state.facade';

// Usage Examples (for documentation)
export { examples as usageExamples } from './usage-examples';

