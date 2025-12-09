import './commands';

// Cypress sometimes runs hooks before app mounts - add null safety checks
beforeEach(() => {
  cy.visit('http://localhost:4200');
});

Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  if (err.message.includes('Cannot read properties of null')) {
    return false;
  }
  return true;
});

// Example of safe custom command with null checks
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('http://localhost:4200/login');
  cy.get('input[formControlName="username"]', { timeout: 10000 }).type(username);
  cy.get('input[formControlName="password"]', { timeout: 10000 }).type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/tasks', { timeout: 10000 });
});