describe('Sección 13 - Indicadores de Salud', () => {
  beforeEach(() => {
    // Navegar directamente a Sección 13 (siguiendo patrón de otros tests)
    cy.visit('/seccion/3.1.13');

    // Esperar que cargue el formulario
    cy.contains('Formulario de Datos', { timeout: 20000 }).should('be.visible');
  });

  it('debe cargar la sección correctamente', () => {
    // Verificar que estamos en Sección 13
    cy.contains('Formulario de Datos', { timeout: 10000 }).should('be.visible');

    // Verificar que hay elementos básicos de UI
    cy.get('body').should('not.be.empty');

    // Verificar que no hay errores de JavaScript (mediante ausencia de elementos de error comunes)
    cy.get('body').should('not.contain', 'ERROR');
    cy.get('body').should('not.contain', 'Exception');
  });

  it('debe mostrar elementos de navegación', () => {
    // Verificar que existen los botones de navegación (pueden estar deshabilitados)
    cy.contains('button', 'Siguiente').should('exist');
    cy.contains('button', 'Anterior').should('exist');

    // Verificar que la URL es correcta
    cy.url().should('include', '/seccion/3.1.13');
  });
});