describe('UI básica', () => {
  it('en /seccion muestra título y botones de acción', () => {
    cy.visit('/seccion/3.1.4.A.1.3');

    // Header de preview
    cy.contains('button', 'Limpiar', { timeout: 20000 }).should('be.visible');
    cy.contains('button', 'Llenar Datos', { timeout: 20000 }).should('be.visible');

    // Footer del formulario
    cy.contains('button', 'Anterior').should('be.visible');
  });
});
