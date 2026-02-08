# Plantillas E2E (Cypress) — MODO IDEAL

Este archivo contiene escenarios E2E de referencia para validar la sincronización inmediata entre Form y View.

## Escenario 1 — Editar párrafo y ver en vista sin recargar
```ts
it('Edita párrafo y la vista se actualiza sin recargar', () => {
  cy.visit('/seccion/3.1.4.A.1');
  // abrir editor de la sección
  cy.get('[data-test=seccion-3-1-4-A-1-edit]').click();
  // editar párrafo
  cy.get('app-seccion21-form textarea[data-test=parrafo]').clear().type('Texto de prueba E2E');
  cy.get('app-seccion21-form button[data-test=guardar-parrafo]').click();
  // comprobar preview (sin reload)
  cy.get('app-seccion21-view p[data-test=parrafo]').should('contain', 'Texto de prueba E2E');
});
```

## Escenario 2 — Subir imagen y editar título/fuente
```ts
it('Subir imagen, editar título/fuente y ver en preview', () => {
  cy.visit('/seccion/3.1.4.A.1');
  cy.get('[data-test=seccion-3-1-4-A-1-edit]').click();

  // subir imagen (utilizar fixtures)
  cy.get('app-image-upload input[type=file]').attachFile('foto.jpg');
  cy.get('app-image-upload input[data-test=titulo]').type('Mi título E2E');
  cy.get('app-image-upload input[data-test=fuente]').type('Fuente E2E');
  cy.get('app-image-upload button[data-test=guardar]').click();

  // comprobar preview
  cy.get('app-seccion21-view app-image-upload .foto-item').should('contain', 'Mi título E2E');
  cy.get('app-seccion21-view app-image-upload .foto-item').should('contain', 'Fuente E2E');
});
```

## Escenario 3 — Editar tabla y ver numeración/valores
```ts
it('Editar tabla y verificar vista y numeración del cuadro', () => {
  cy.visit('/seccion/3.1.4.A.1');
  cy.get('[data-test=seccion-3-1-4-A-1-edit]').click();
  cy.get('app-dynamic-table[data-test=ubicacion-cp] input').first().clear().type('Nuevo valor');
  cy.get('app-dynamic-table[data-test=ubicacion-cp] button[data-test=guardar]').click();

  // verificar en la vista a la izquierda
  cy.get('app-seccion21-view app-table-wrapper').should('contain', 'Nuevo valor');
});
```

---

Incluye estos snippets en la PR o en `cypress/e2e` al crear tests para una sección nueva.