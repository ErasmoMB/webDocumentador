describe('Flujo hacia plantilla', () => {
  it('desde una sección permite ir a plantilla completa', () => {
    cy.visit('/seccion/3.1.4.A.1.3');
    cy.contains('button', 'Ver Plantilla Completa', { timeout: 20000 }).should('be.visible').click();

    cy.location('pathname', { timeout: 20000 }).should('include', '/plantilla');
    cy.get('#main-heading h1', { timeout: 20000 })
      .should('be.visible')
      .and('contain.text', 'CAPÍTULO III');
  });
});
