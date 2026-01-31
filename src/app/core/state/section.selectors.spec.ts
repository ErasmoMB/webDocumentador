/**
 * TESTS: SECTION SELECTORS - FASE 2
 * 
 * Tests críticos para el patrón de "Índice Computado".
 * 
 * TEST CRÍTICO: Si agrego una imagen en la Sección 1, la numeración 
 * de una imagen en la Sección 3 debe aumentar automáticamente.
 */

import {
  selectAllImagesOrdered,
  getImageGlobalIndex,
  selectAllImagesWithGlobalIndex,
  selectSectionImagesWithGlobalIndex,
  selectTotalImageCount,
  selectAllTablesOrdered,
  getTableGlobalIndex,
  selectAllTablesWithGlobalIndex,
  selectTotalTableCount,
  selectActiveSection,
  selectSectionContentSummary,
  selectSectionsCompleteness,
  ImageWithGlobalIndex
} from './section.selectors';
import {
  SectionsContentState,
  Section,
  ImageContent,
  TableContent,
  ParagraphContent,
  INITIAL_SECTIONS_CONTENT_STATE
} from './section.model';
import { addImageToSection, addParagraphToSection } from './section-content.reducer';

// ============================================================================
// HELPERS DE TESTING
// ============================================================================

/**
 * Crea un estado de secciones con secciones vacías para testing
 */
function createTestState(sectionIds: string[]): SectionsContentState {
  const byId: Record<string, Section> = {};
  const timestamp = Date.now();
  
  sectionIds.forEach((id, index) => {
    byId[id] = {
      id,
      title: `Sección ${id}`,
      sectionType: 'STATIC',
      groupId: null,
      parentId: null,
      contents: [],
      orden: index,
      isLocked: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });
  
  return {
    byId,
    sectionOrder: sectionIds,
    activeSectionId: sectionIds[0] || null,
    lastModified: timestamp
  };
}

/**
 * Crea una imagen de prueba
 */
function createTestImage(id: string, orden: number): ImageContent {
  const timestamp = Date.now();
  return {
    id,
    type: 'IMAGE',
    titulo: `Imagen ${id}`,
    fuente: 'Test',
    preview: null,
    localPath: null,
    backendId: null,
    uploadStatus: 'pending',
    orden,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

/**
 * Crea una tabla de prueba
 */
function createTestTable(id: string, orden: number): TableContent {
  const timestamp = Date.now();
  return {
    id,
    type: 'TABLE',
    titulo: `Tabla ${id}`,
    fuente: 'Test',
    columns: ['Col1', 'Col2'],
    rows: [],
    totalKey: null,
    campoTotal: null,
    orden,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

/**
 * Agrega contenido a una sección en el estado
 */
function addContentToSection(
  state: SectionsContentState,
  sectionId: string,
  content: ImageContent | TableContent | ParagraphContent
): SectionsContentState {
  const section = state.byId[sectionId];
  if (!section) return state;
  
  return {
    ...state,
    byId: {
      ...state.byId,
      [sectionId]: {
        ...section,
        contents: [...section.contents, content],
        updatedAt: Date.now()
      }
    },
    lastModified: Date.now()
  };
}

// ============================================================================
// TEST CRÍTICO: NUMERACIÓN AUTOMÁTICA DE IMÁGENES
// ============================================================================

describe('Section Selectors - Numeración Global de Imágenes', () => {

  describe('TEST CRÍTICO: Numeración automática al agregar imagen', () => {
    
    it('agregar imagen en Sección 1 debe aumentar numeración de imagen en Sección 3', () => {
      // ARRANGE: Crear estado con 3 secciones
      let state = createTestState(['1', '2', '3']);
      
      // Agregar una imagen en Sección 3
      const imgSeccion3 = createTestImage('img_seccion3', 0);
      state = addContentToSection(state, '3', imgSeccion3);
      
      // VERIFICAR: Imagen en Sección 3 es Figura 1
      const indexAntes = getImageGlobalIndex(state, 'img_seccion3');
      expect(indexAntes).toBe(1); // Figura 1
      
      // ACT: Agregar imagen en Sección 1
      const imgSeccion1 = createTestImage('img_seccion1', 0);
      state = addContentToSection(state, '1', imgSeccion1);
      
      // ASSERT: La imagen de Sección 3 ahora es Figura 2
      const indexDespues = getImageGlobalIndex(state, 'img_seccion3');
      expect(indexDespues).toBe(2); // ¡Ahora es Figura 2!
      
      // La nueva imagen en Sección 1 es Figura 1
      const indexNueva = getImageGlobalIndex(state, 'img_seccion1');
      expect(indexNueva).toBe(1);
    });

    it('agregar imagen en Sección 2 debe recalcular índices de Sección 3', () => {
      // ARRANGE
      let state = createTestState(['1', '2', '3']);
      
      // Imagen en Sección 1 = Figura 1
      state = addContentToSection(state, '1', createTestImage('img1', 0));
      // Imagen en Sección 3 = Figura 2
      state = addContentToSection(state, '3', createTestImage('img3', 0));
      
      expect(getImageGlobalIndex(state, 'img1')).toBe(1);
      expect(getImageGlobalIndex(state, 'img3')).toBe(2);
      
      // ACT: Agregar imagen en Sección 2
      state = addContentToSection(state, '2', createTestImage('img2', 0));
      
      // ASSERT
      expect(getImageGlobalIndex(state, 'img1')).toBe(1); // Sin cambio
      expect(getImageGlobalIndex(state, 'img2')).toBe(2); // Nueva
      expect(getImageGlobalIndex(state, 'img3')).toBe(3); // Aumentó
    });

    it('eliminar imagen debe recalcular numeración de imágenes posteriores', () => {
      // ARRANGE
      let state = createTestState(['1', '2', '3']);
      
      state = addContentToSection(state, '1', createTestImage('img1', 0));
      state = addContentToSection(state, '2', createTestImage('img2', 0));
      state = addContentToSection(state, '3', createTestImage('img3', 0));
      
      expect(getImageGlobalIndex(state, 'img3')).toBe(3);
      
      // ACT: Eliminar imagen de Sección 1
      state = {
        ...state,
        byId: {
          ...state.byId,
          '1': {
            ...state.byId['1'],
            contents: [] // Eliminar contenido
          }
        }
      };
      
      // ASSERT
      expect(getImageGlobalIndex(state, 'img1')).toBeNull(); // Ya no existe
      expect(getImageGlobalIndex(state, 'img2')).toBe(1);    // Ahora es Figura 1
      expect(getImageGlobalIndex(state, 'img3')).toBe(2);    // Ahora es Figura 2
    });
  });

  describe('selectAllImagesOrdered', () => {

    it('debería retornar array vacío para estado vacío', () => {
      const state = INITIAL_SECTIONS_CONTENT_STATE;
      const images = selectAllImagesOrdered(state);
      expect(images.length).toBe(0);
    });

    it('debería retornar imágenes en orden de sección', () => {
      let state = createTestState(['1', '2', '3']);
      
      // Agregar en orden inverso para verificar que se ordenan por sección
      state = addContentToSection(state, '3', createTestImage('c', 0));
      state = addContentToSection(state, '1', createTestImage('a', 0));
      state = addContentToSection(state, '2', createTestImage('b', 0));
      
      const images = selectAllImagesOrdered(state);
      
      expect(images.length).toBe(3);
      expect(images[0].sectionId).toBe('1');
      expect(images[1].sectionId).toBe('2');
      expect(images[2].sectionId).toBe('3');
    });

    it('debería ordenar imágenes dentro de sección por orden', () => {
      let state = createTestState(['1']);
      
      state = addContentToSection(state, '1', createTestImage('img_orden2', 2));
      state = addContentToSection(state, '1', createTestImage('img_orden0', 0));
      state = addContentToSection(state, '1', createTestImage('img_orden1', 1));
      
      const images = selectAllImagesOrdered(state);
      
      expect(images[0].content.id).toBe('img_orden0');
      expect(images[1].content.id).toBe('img_orden1');
      expect(images[2].content.id).toBe('img_orden2');
    });

    it('debería ignorar contenido que no es imagen', () => {
      let state = createTestState(['1']);
      
      state = addContentToSection(state, '1', createTestImage('img1', 0));
      state = addContentToSection(state, '1', createTestTable('table1', 1));
      state = addContentToSection(state, '1', createTestImage('img2', 2));
      
      const images = selectAllImagesOrdered(state);
      
      expect(images.length).toBe(2);
      expect(images[0].content.id).toBe('img1');
      expect(images[1].content.id).toBe('img2');
    });
  });

  describe('getImageGlobalIndex', () => {

    it('debería retornar null para imagen inexistente', () => {
      const state = createTestState(['1']);
      const index = getImageGlobalIndex(state, 'no_existe');
      expect(index).toBeNull();
    });

    it('debería retornar índice 1-based', () => {
      let state = createTestState(['1']);
      state = addContentToSection(state, '1', createTestImage('primera', 0));
      
      const index = getImageGlobalIndex(state, 'primera');
      expect(index).toBe(1); // 1-based, no 0-based
    });

    it('debería calcular índice correcto con múltiples secciones', () => {
      let state = createTestState(['a', 'b', 'c', 'd']);
      
      state = addContentToSection(state, 'a', createTestImage('a1', 0));
      state = addContentToSection(state, 'a', createTestImage('a2', 1));
      state = addContentToSection(state, 'b', createTestImage('b1', 0));
      state = addContentToSection(state, 'c', createTestImage('c1', 0));
      state = addContentToSection(state, 'c', createTestImage('c2', 1));
      state = addContentToSection(state, 'd', createTestImage('d1', 0));
      
      expect(getImageGlobalIndex(state, 'a1')).toBe(1);
      expect(getImageGlobalIndex(state, 'a2')).toBe(2);
      expect(getImageGlobalIndex(state, 'b1')).toBe(3);
      expect(getImageGlobalIndex(state, 'c1')).toBe(4);
      expect(getImageGlobalIndex(state, 'c2')).toBe(5);
      expect(getImageGlobalIndex(state, 'd1')).toBe(6);
    });
  });

  describe('selectAllImagesWithGlobalIndex', () => {

    it('debería incluir globalIndex en cada imagen', () => {
      let state = createTestState(['1', '2']);
      state = addContentToSection(state, '1', createTestImage('img1', 0));
      state = addContentToSection(state, '2', createTestImage('img2', 0));
      
      const images = selectAllImagesWithGlobalIndex(state);
      
      expect(images[0].globalIndex).toBe(1);
      expect(images[0].content.id).toBe('img1');
      expect(images[1].globalIndex).toBe(2);
      expect(images[1].content.id).toBe('img2');
    });
  });

  describe('selectSectionImagesWithGlobalIndex', () => {

    it('debería filtrar imágenes por sección manteniendo índice global', () => {
      let state = createTestState(['1', '2', '3']);
      
      state = addContentToSection(state, '1', createTestImage('s1_img1', 0));
      state = addContentToSection(state, '2', createTestImage('s2_img1', 0));
      state = addContentToSection(state, '2', createTestImage('s2_img2', 1));
      state = addContentToSection(state, '3', createTestImage('s3_img1', 0));
      
      const section2Images = selectSectionImagesWithGlobalIndex(state, '2');
      
      expect(section2Images.length).toBe(2);
      // Figura 2 y Figura 3 (porque hay 1 imagen antes en sección 1)
      expect(section2Images[0].globalIndex).toBe(2);
      expect(section2Images[1].globalIndex).toBe(3);
    });
  });

  describe('selectTotalImageCount', () => {

    it('debería contar todas las imágenes del documento', () => {
      let state = createTestState(['1', '2', '3']);
      
      state = addContentToSection(state, '1', createTestImage('a', 0));
      state = addContentToSection(state, '1', createTestImage('b', 1));
      state = addContentToSection(state, '3', createTestImage('c', 0));
      
      expect(selectTotalImageCount(state)).toBe(3);
    });
  });
});

// ============================================================================
// TESTS DE TABLAS
// ============================================================================

describe('Section Selectors - Numeración Global de Tablas', () => {

  it('debería numerar tablas independientemente de imágenes', () => {
    let state = createTestState(['1', '2']);
    
    // Mezclar imágenes y tablas
    state = addContentToSection(state, '1', createTestImage('img1', 0));
    state = addContentToSection(state, '1', createTestTable('tab1', 1));
    state = addContentToSection(state, '2', createTestTable('tab2', 0));
    state = addContentToSection(state, '2', createTestImage('img2', 1));
    
    // Imágenes: 1 y 2
    expect(getImageGlobalIndex(state, 'img1')).toBe(1);
    expect(getImageGlobalIndex(state, 'img2')).toBe(2);
    
    // Tablas: 1 y 2 (numeración separada)
    expect(getTableGlobalIndex(state, 'tab1')).toBe(1);
    expect(getTableGlobalIndex(state, 'tab2')).toBe(2);
  });

  it('agregar tabla en sección anterior debe aumentar índices posteriores', () => {
    let state = createTestState(['1', '2', '3']);
    
    state = addContentToSection(state, '3', createTestTable('tab3', 0));
    expect(getTableGlobalIndex(state, 'tab3')).toBe(1);
    
    state = addContentToSection(state, '1', createTestTable('tab1', 0));
    expect(getTableGlobalIndex(state, 'tab1')).toBe(1);
    expect(getTableGlobalIndex(state, 'tab3')).toBe(2); // Aumentó
  });
});

// ============================================================================
// TESTS DE HELPERS Y SELECTORES ADICIONALES
// ============================================================================

describe('Section Selectors - Helpers', () => {

  describe('selectActiveSection', () => {

    it('debería retornar null si no hay sección activa', () => {
      const state: SectionsContentState = {
        ...INITIAL_SECTIONS_CONTENT_STATE,
        activeSectionId: null
      };
      expect(selectActiveSection(state)).toBeNull();
    });

    it('debería retornar la sección activa', () => {
      let state = createTestState(['1', '2']);
      state = { ...state, activeSectionId: '2' };
      
      const active = selectActiveSection(state);
      expect(active?.id).toBe('2');
    });
  });

  describe('selectSectionContentSummary', () => {

    it('debería retornar resumen correcto de contenido', () => {
      let state = createTestState(['1', '2']);
      
      state = addContentToSection(state, '1', createTestImage('img1', 0));
      state = addContentToSection(state, '1', createTestImage('img2', 1));
      state = addContentToSection(state, '1', createTestTable('tab1', 2));
      
      const summary = selectSectionContentSummary(state, '1');
      
      expect(summary).not.toBeNull();
      expect(summary!.imageCount).toBe(2);
      expect(summary!.tableCount).toBe(1);
      expect(summary!.firstImageIndex).toBe(1); // Figura 1
    });

    it('debería incluir índice global correcto considerando secciones anteriores', () => {
      let state = createTestState(['1', '2']);
      
      // 2 imágenes en sección 1
      state = addContentToSection(state, '1', createTestImage('img1', 0));
      state = addContentToSection(state, '1', createTestImage('img2', 1));
      // 1 imagen en sección 2
      state = addContentToSection(state, '2', createTestImage('img3', 0));
      
      const summary = selectSectionContentSummary(state, '2');
      
      // La primera imagen de sección 2 es Figura 3
      expect(summary!.firstImageIndex).toBe(3);
    });
  });

  describe('selectSectionsCompleteness', () => {

    it('debería contar secciones completas e incompletas', () => {
      let state = createTestState(['1', '2', '3']);
      
      // Solo sección 1 tiene contenido
      state = addContentToSection(state, '1', createTestImage('img1', 0));
      
      const completeness = selectSectionsCompleteness(state);
      
      expect(completeness.complete).toBe(1);
      expect(completeness.incomplete).toBe(2);
      expect(completeness.total).toBe(3);
    });
  });
});

// ============================================================================
// TESTS DE INTEGRACIÓN CON REDUCER
// ============================================================================

describe('Integración Selectores + Reducer', () => {

  it('usar addImageToSection helper debe actualizar numeración correctamente', () => {
    let state = createTestState(['1', '2', '3']);
    
    // Usar helper del reducer
    state = addImageToSection(state, '3', 'Imagen en S3', 'Fuente');
    expect(getImageGlobalIndex(state, state.byId['3'].contents[0].id)).toBe(1);
    
    state = addImageToSection(state, '1', 'Imagen en S1', 'Fuente');
    const imgS1 = state.byId['1'].contents[0];
    const imgS3 = state.byId['3'].contents[0];
    
    expect(getImageGlobalIndex(state, imgS1.id)).toBe(1);
    expect(getImageGlobalIndex(state, imgS3.id)).toBe(2);
  });

  it('agregar múltiples imágenes debe mantener numeración consistente', () => {
    let state = createTestState(['1', '2', '3', '4', '5']);
    
    // Agregar imágenes en orden aleatorio
    state = addImageToSection(state, '3', 'Img3', '');
    state = addImageToSection(state, '1', 'Img1', '');
    state = addImageToSection(state, '5', 'Img5', '');
    state = addImageToSection(state, '2', 'Img2', '');
    state = addImageToSection(state, '4', 'Img4', '');
    
    // Verificar que están numeradas correctamente por orden de sección
    const allImages = selectAllImagesWithGlobalIndex(state);
    
    expect(allImages.length).toBe(5);
    expect(allImages[0].sectionId).toBe('1');
    expect(allImages[0].globalIndex).toBe(1);
    expect(allImages[1].sectionId).toBe('2');
    expect(allImages[1].globalIndex).toBe(2);
    expect(allImages[2].sectionId).toBe('3');
    expect(allImages[2].globalIndex).toBe(3);
    expect(allImages[3].sectionId).toBe('4');
    expect(allImages[3].globalIndex).toBe(4);
    expect(allImages[4].sectionId).toBe('5');
    expect(allImages[4].globalIndex).toBe(5);
  });
});
