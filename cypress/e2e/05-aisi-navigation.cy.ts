describe('AISI: navegación condicionada', () => {
  it('habilita Siguiente cuando AISI está configurado', () => {
    cy.seedGroupConfig({
      aisi: [
        {
          nombre: 'AISI Test',
          tipo: 'AISI',
          ccppList: [],
          ccppActivos: ['TEST-CCPP-001'],
        },
      ],
      lastUpdated: Date.now(),
    });

    cy.viewport(1280, 800);
    // Sección AISI dinámica (Distrito 1, subsección 1)
    cy.visit('/seccion/3.1.4.B.1.1');

    cy.contains('Formulario de Datos', { timeout: 20000 })
      .scrollIntoView()
      .should('exist');

    cy.url().then((beforeUrl) => {
      cy.contains('button', 'Siguiente', { timeout: 20000 })
        .should('be.visible')
        .should('not.be.disabled')
        .click();

      cy.url({ timeout: 20000 }).should('not.eq', beforeUrl);
      cy.contains('Formulario de Datos', { timeout: 20000 })
        .scrollIntoView()
        .should('exist');
    });
  });
});
