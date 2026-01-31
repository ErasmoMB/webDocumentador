describe('Smoke', () => {
  it('carga la plantilla por defecto', () => {
    cy.visit('/');
    cy.get('#main-heading h1', { timeout: 20000 })
      .should('be.visible')
      .and('contain.text', 'CAPÍTULO III');
  });

  it('carga una sección y renderiza formulario', () => {
    cy.visit('/seccion/3.1.4.A.1.3');
    cy.contains('Formulario de Datos', { timeout: 20000 }).should('be.visible');
  });
});
