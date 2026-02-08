describe('Verify table numbering in plantilla', () => {
  it('should display unique, sequential 3.x table numbers', () => {
    cy.visit('/plantilla');
    // wait for dynamic content to load
    cy.get('app-table-wrapper', { timeout: 20000 }).should('exist');

    // collect visible table captions
    cy.get('p.table-title').then($els => {
      const texts: string[] = [];
      $els.each((_, el) => texts.push(el.textContent?.trim() || ''));
      // extract numbers like 3.26
      const numbers = texts
        .map(t => {
          const m = t.match(/3\.\d{1,2}/);
          return m ? m[0] : null;
        })
        .filter(Boolean) as string[];

      // Ensure no duplicates
      const unique = new Set(numbers);
      expect(unique.size).to.equal(numbers.length);

      // Ensure they are in ascending order (numerical comparison)
      const numeric = numbers.map(n => parseFloat(n));
      const sorted = [...numeric].sort((a,b) => a-b);
      expect(numeric).to.deep.equal(sorted);
    });
  });
});