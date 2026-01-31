describe('Navegación entre secciones', () => {
  it('permite ir a siguiente y anterior', () => {
    cy.visit('/seccion/3.1.1');

    cy.contains('Formulario de Datos', { timeout: 20000 }).should('be.visible');

    cy.url().then((beforeUrl) => {
      cy.contains('button', 'Siguiente', { timeout: 20000 })
        .should('be.visible')
        .should('not.be.disabled')
        .click();
      cy.url({ timeout: 20000 }).should('not.eq', beforeUrl);

      cy.contains('button', 'Anterior', { timeout: 20000 })
        .should('be.visible')
        .click();
      cy.url({ timeout: 20000 }).should('eq', beforeUrl);
    });
  });
});
