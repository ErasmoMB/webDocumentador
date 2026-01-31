/**
 * REDUCERS USAGE EXAMPLES
 * 
 * Ejemplos de ejecución: comando → nuevo estado
 * Este archivo documenta cómo usar los reducers implementados.
 */

import { rootReducer, createInitialState } from './reducers';
import { ProjectStateCommand, BatchCommand } from './commands.model';

// ============================================================================
// EJEMPLO 1: CREAR PROYECTO NUEVO
// ============================================================================

function example1_CreateNewProject(): void {
  // Crear estado inicial
  const state = createInitialState();
  
  // Comando: Establecer nombre del proyecto
  const command: ProjectStateCommand = {
    type: 'metadata/setProjectName',
    payload: { projectName: 'Proyecto Minero Quellaveco' }
  };
  
  // Ejecutar reducer
  const newState = rootReducer(state, command);
  
  // Resultado:
  // newState.metadata.projectName === 'Proyecto Minero Quellaveco'
  // newState._internal.isDirty === true
  console.log('Proyecto creado:', newState.metadata.projectName);
}

// ============================================================================
// EJEMPLO 2: CONFIGURAR GRUPOS AISD
// ============================================================================

function example2_ConfigureAISDGroups(): void {
  let state = createInitialState();
  
  // Agregar primer grupo AISD (Comunidad Campesina)
  state = rootReducer(state, {
    type: 'groupConfig/addGroup',
    payload: { 
      tipo: 'AISD', 
      nombre: 'Comunidad Campesina Ayroca',
      parentId: null,
      ccppIds: ['040501001', '040501002']
    }
  });
  
  // Agregar segundo grupo AISD
  state = rootReducer(state, {
    type: 'groupConfig/addGroup',
    payload: { 
      tipo: 'AISD', 
      nombre: 'Comunidad Campesina Cahuacho',
      parentId: null,
      ccppIds: ['040501003']
    }
  });
  
  // Resultado:
  // state.groupConfig.aisd[0].id === 'A'
  // state.groupConfig.aisd[0].nombre === 'Comunidad Campesina Ayroca'
  // state.groupConfig.aisd[1].id === 'B'
  // state.groupConfig.aisd[1].nombre === 'Comunidad Campesina Cahuacho'
  console.log('Grupos AISD:', state.groupConfig.aisd.map(g => `${g.id}: ${g.nombre}`));
}

// ============================================================================
// EJEMPLO 3: CREAR SUBGRUPOS (JERARQUÍA)
// ============================================================================

function example3_CreateHierarchicalGroups(): void {
  let state = createInitialState();
  
  // Grupo raíz A
  state = rootReducer(state, {
    type: 'groupConfig/addGroup',
    payload: { tipo: 'AISD', nombre: 'Comunidad A', parentId: null, ccppIds: [] }
  });
  
  // Subgrupo A.1
  state = rootReducer(state, {
    type: 'groupConfig/addGroup',
    payload: { tipo: 'AISD', nombre: 'Anexo 1', parentId: 'A', ccppIds: [] }
  });
  
  // Subgrupo A.2
  state = rootReducer(state, {
    type: 'groupConfig/addGroup',
    payload: { tipo: 'AISD', nombre: 'Anexo 2', parentId: 'A', ccppIds: [] }
  });
  
  // Subsubgrupo A.1.1
  state = rootReducer(state, {
    type: 'groupConfig/addGroup',
    payload: { tipo: 'AISD', nombre: 'Sector Norte', parentId: 'A.1', ccppIds: [] }
  });
  
  // Resultado:
  // state.groupConfig.aisd[0].id === 'A' (parentId: null)
  // state.groupConfig.aisd[1].id === 'A.1' (parentId: 'A')
  // state.groupConfig.aisd[2].id === 'A.2' (parentId: 'A')
  // state.groupConfig.aisd[3].id === 'A.1.1' (parentId: 'A.1')
  console.log('Jerarquía:', state.groupConfig.aisd.map(g => `${g.id} (padre: ${g.parentId})`));
}

// ============================================================================
// EJEMPLO 4: INICIALIZAR SECCIONES
// ============================================================================

function example4_InitializeSections(): void {
  let state = createInitialState();
  
  // Sección global (sin grupo)
  state = rootReducer(state, {
    type: 'section/initialize',
    payload: { sectionId: '3.1.1', groupType: 'NONE', groupId: null }
  });
  
  // Sección AISD (vinculada a grupo A)
  state = rootReducer(state, {
    type: 'section/initialize',
    payload: { sectionId: '3.1.4.A', groupType: 'AISD', groupId: 'A' }
  });
  
  // Establecer sección activa
  state = rootReducer(state, {
    type: 'section/setActive',
    payload: { sectionId: '3.1.1' }
  });
  
  // Resultado:
  // state.sections.byId['3.1.1'].isInitialized === true
  // state.sections.byId['3.1.4.A'].groupType === 'AISD'
  // state.sections.activeSectionId === '3.1.1'
  console.log('Secciones inicializadas:', state.sections.allIds);
}

// ============================================================================
// EJEMPLO 5: ESTABLECER CAMPOS DE FORMULARIO
// ============================================================================

function example5_SetFormFields(): void {
  let state = createInitialState();
  
  // Campo simple (sin grupo)
  state = rootReducer(state, {
    type: 'field/set',
    payload: {
      sectionId: '3.1.1',
      groupId: null,
      fieldName: 'projectName',
      value: 'Mi Proyecto',
      source: 'user'
    }
  });
  
  // Múltiples campos en una operación
  state = rootReducer(state, {
    type: 'field/setMultiple',
    payload: {
      sectionId: '3.1.2',
      groupId: null,
      fields: [
        { fieldName: 'consultora', value: 'Consultora ABC', source: 'user' },
        { fieldName: 'fechaTrabajo', value: '2026-01-30', source: 'user' },
        { fieldName: 'cantidadEncuestas', value: 150, source: 'api' }
      ]
    }
  });
  
  // Campo vinculado a grupo
  state = rootReducer(state, {
    type: 'field/set',
    payload: {
      sectionId: '3.1.4.A',
      groupId: 'A',
      fieldName: 'nombreComunidad',
      value: 'Comunidad Campesina Ayroca',
      source: 'user'
    }
  });
  
  console.log('Campos creados:', state.fields.allKeys.length);
}

// ============================================================================
// EJEMPLO 6: MANEJAR TABLAS
// ============================================================================

function example6_ManageTables(): void {
  let state = createInitialState();
  
  // Crear tabla con datos
  state = rootReducer(state, {
    type: 'table/setData',
    payload: {
      sectionId: 'section6',
      groupId: null,
      tableKey: 'poblacionSexo',
      rows: [
        { data: { categoria: 'Hombres', casos: 500, porcentaje: '50%' } },
        { data: { categoria: 'Mujeres', casos: 500, porcentaje: '50%' } }
      ],
      config: {
        totalKey: 'total',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      }
    }
  });
  
  // Agregar fila
  state = rootReducer(state, {
    type: 'table/addRow',
    payload: {
      sectionId: 'section6',
      groupId: null,
      tableKey: 'poblacionSexo',
      data: { categoria: 'No especificado', casos: 10, porcentaje: '1%' }
    }
  });
  
  // Obtener referencia a la tabla
  const tableKey = 'section6::poblacionSexo';
  console.log('Filas en tabla:', state.tables.byKey[tableKey]?.state.rows.length);
}

// ============================================================================
// EJEMPLO 7: MANEJAR IMÁGENES CON NUMERACIÓN GLOBAL
// ============================================================================

function example7_ManageImages(): void {
  let state = createInitialState();
  
  // Agregar imagen en sección 1
  state = rootReducer(state, {
    type: 'image/add',
    payload: {
      sectionId: 'section1',
      groupId: null,
      titulo: 'Vista panorámica del área de estudio',
      fuente: 'Trabajo de campo, enero 2026',
      preview: 'base64...',
      localPath: '/uploads/img001.jpg'
    }
  });
  
  // Agregar imagen en sección 2
  state = rootReducer(state, {
    type: 'image/add',
    payload: {
      sectionId: 'section2',
      groupId: null,
      titulo: 'Reunión con autoridades locales',
      fuente: 'Trabajo de campo, enero 2026',
      preview: 'base64...',
      localPath: null
    }
  });
  
  // Resultado:
  // Primera imagen: numero = 1
  // Segunda imagen: numero = 2 (numeración global)
  const images = state.images.allIds.map(id => state.images.byId[id]);
  console.log('Imágenes:', images.map(img => `#${img.numero}: ${img.titulo}`));
}

// ============================================================================
// EJEMPLO 8: BATCH COMMAND (TRANSACCIÓN)
// ============================================================================

function example8_BatchCommand(): void {
  let state = createInitialState();
  
  // Ejecutar múltiples comandos como una transacción
  const batchCommand: BatchCommand = {
    type: 'batch/execute',
    payload: {
      transactionId: 'init_project_001',
      commands: [
        { type: 'metadata/setProjectName', payload: { projectName: 'Proyecto Integral' } },
        { type: 'metadata/setConsultora', payload: { consultora: 'Consultora XYZ' } },
        { type: 'section/initialize', payload: { sectionId: '3.1.1', groupType: 'NONE', groupId: null } },
        { type: 'section/initialize', payload: { sectionId: '3.1.2', groupType: 'NONE', groupId: null } },
        { type: 'groupConfig/addGroup', payload: { tipo: 'AISD', nombre: 'Comunidad A', parentId: null, ccppIds: [] } },
        { type: 'groupConfig/addGroup', payload: { tipo: 'AISI', nombre: 'Distrito X', parentId: null, ccppIds: [] } }
      ]
    }
  };
  
  state = rootReducer(state, batchCommand);
  
  // Todos los comandos se ejecutaron atómicamente
  console.log('Proyecto:', state.metadata.projectName);
  console.log('Secciones:', state.sections.allIds.length);
  console.log('Grupos AISD:', state.groupConfig.aisd.length);
  console.log('Grupos AISI:', state.groupConfig.aisi.length);
}

// ============================================================================
// EJEMPLO 9: ELIMINAR GRUPO CON CASCADE
// ============================================================================

function example9_CascadeDelete(): void {
  let state = createInitialState();
  
  // Crear jerarquía
  state = rootReducer(state, {
    type: 'groupConfig/addGroup',
    payload: { tipo: 'AISD', nombre: 'Padre', parentId: null, ccppIds: [] }
  });
  state = rootReducer(state, {
    type: 'groupConfig/addGroup',
    payload: { tipo: 'AISD', nombre: 'Hijo 1', parentId: 'A', ccppIds: [] }
  });
  state = rootReducer(state, {
    type: 'groupConfig/addGroup',
    payload: { tipo: 'AISD', nombre: 'Nieto', parentId: 'A.1', ccppIds: [] }
  });
  
  console.log('Antes de eliminar:', state.groupConfig.aisd.length); // 3
  
  // Eliminar padre con cascade (elimina toda la jerarquía)
  state = rootReducer(state, {
    type: 'groupConfig/removeGroup',
    payload: { tipo: 'AISD', groupId: 'A', cascade: true }
  });
  
  console.log('Después de eliminar:', state.groupConfig.aisd.length); // 0
}

// ============================================================================
// EJEMPLO 10: CARGAR PROYECTO DESDE STORAGE
// ============================================================================

function example10_LoadProject(): void {
  let state = createInitialState();
  
  // Simular datos legacy cargados desde localStorage
  const legacyData = {
    projectName: 'Proyecto Guardado',
    consultora: 'Consultora ABC',
    departamentoSeleccionado: 'AREQUIPA',
    provinciaSeleccionada: 'CAYLLOMA',
    distritoSeleccionado: 'CAHUACHO',
    entrevistados: [
      { nombre: 'Juan Pérez', cargo: 'Alcalde', organizacion: 'Municipalidad' }
    ]
  };
  
  // Cargar proyecto
  state = rootReducer(state, {
    type: 'project/load',
    payload: {
      data: legacyData,
      source: 'storage'
    }
  });
  
  // Resultado:
  // state.metadata.projectName === 'Proyecto Guardado'
  // state.globalRegistry.ubicacion.departamento === 'AREQUIPA'
  // state.globalRegistry.entrevistados.length === 1
  // state._internal.loadedFrom === 'storage'
  console.log('Proyecto cargado:', state.metadata.projectName);
  console.log('Ubicación:', state.globalRegistry.ubicacion);
}

// ============================================================================
// EXPORTAR EJEMPLOS PARA PRUEBAS
// ============================================================================

export const examples = {
  example1_CreateNewProject,
  example2_ConfigureAISDGroups,
  example3_CreateHierarchicalGroups,
  example4_InitializeSections,
  example5_SetFormFields,
  example6_ManageTables,
  example7_ManageImages,
  example8_BatchCommand,
  example9_CascadeDelete,
  example10_LoadProject
};
