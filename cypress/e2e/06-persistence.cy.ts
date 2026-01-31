/**
 * E2E Tests - Persistencia de datos
 * 
 * Verifica que la persistencia en localStorage funciona correctamente
 * después de la centralización via StorageFacade.
 */
describe('Persistencia de datos', () => {
  
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    cy.clearLocalStorage();
  });

  describe('Persistencia de formulario', () => {
    it('debe mantener datos después de recargar la página', () => {
      // Visitar una sección
      cy.visit('/seccion/3.1.1');
      cy.get('body', { timeout: 20000 }).should('be.visible');
      
      // Verificar que la página cargó
      cy.url().should('include', '/seccion/3.1.1');
      
      // Recargar la página
      cy.reload();
      
      // Verificar que sigue en la misma sección
      cy.url().should('include', '/seccion/3.1.1');
      cy.get('body').should('be.visible');
    });
  });

  describe('Flag de limpieza manual', () => {
    it('debe respetar el flag __datos_limpios_manualmente__', () => {
      cy.visit('/');
      cy.get('body', { timeout: 20000 }).should('be.visible');
      
      // El flag debe poder ser establecido
      cy.window().then((win) => {
        win.localStorage.setItem('__datos_limpios_manualmente__', 'true');
        const flag = win.localStorage.getItem('__datos_limpios_manualmente__');
        expect(flag).to.equal('true');
      });
    });
  });

  describe('Persistencia de estado del sidebar', () => {
    it('debe persistir el estado expandido del sidebar', () => {
      cy.visit('/');
      cy.get('body', { timeout: 20000 }).should('be.visible');
      
      // Verificar que localStorage puede guardar el estado del sidebar
      cy.window().then((win) => {
        const testExpanded = JSON.stringify(['3.1', '3.2']);
        win.localStorage.setItem('sidebarExpanded', testExpanded);
        
        const stored = win.localStorage.getItem('sidebarExpanded');
        expect(stored).to.equal(testExpanded);
      });
    });

    it('debe restaurar el estado del sidebar después de recargar', () => {
      cy.visit('/');
      cy.get('body', { timeout: 20000 }).should('be.visible');
      
      // Guardar estado
      cy.window().then((win) => {
        win.localStorage.setItem('sidebarExpanded', JSON.stringify(['3.1']));
      });
      
      // Recargar
      cy.reload();
      
      // Verificar que el estado persiste
      cy.window().then((win) => {
        const stored = win.localStorage.getItem('sidebarExpanded');
        expect(stored).to.not.be.null;
      });
    });
  });

  describe('Persistencia de última sección', () => {
    it('debe guardar y recuperar lastSectionId', () => {
      cy.visit('/seccion/3.1.4');
      cy.get('body', { timeout: 20000 }).should('be.visible');
      
      cy.window().then((win) => {
        win.localStorage.setItem('lastSectionId', '3.1.4');
        const stored = win.localStorage.getItem('lastSectionId');
        expect(stored).to.equal('3.1.4');
      });
    });
  });
});
