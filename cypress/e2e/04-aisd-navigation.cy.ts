describe('AISD: navegación condicionada', () => {
  it('habilita Siguiente cuando AISD está configurado', () => {
    // Seed mínimo compatible con GroupConfigService/SectionAccessControlService
    cy.seedGroupConfig({
      aisd: [
        {
          nombre: 'AISD Test',
          tipo: 'AISD',
          ccppList: [],
          ccppActivos: ['TEST-CCPP-001'],
        },
      ],
      lastUpdated: Date.now(),
    });

    cy.viewport(1280, 800);
    cy.visit('/seccion/3.1.4.A.1.3');

    // Este header puede estar dentro de un contenedor con overflow (Cypress lo marca no visible).
    // Lo importante para este test es que la vista cargó y que la navegación se habilita.
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
