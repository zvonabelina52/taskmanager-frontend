/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('username', 'password')
       */
      login(username: string, password: string): Chainable;

      /**
       * Custom command to register a new user
       * @example cy.register('username', 'email@test.com', 'password')
       */
      register(username: string, email: string, password: string): Chainable;

      /**
       * Custom command to create a task
       * @example cy.createTask('Task Title', 'Task Description', 'HIGH')
       */
      createTask(title: string, description: string, priority?: string): Chainable;
    }
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/tasks');
});

Cypress.Commands.add('register', (username: string, email: string, password: string) => {
  cy.visit('/login');
  
  // Click "Create one" link to switch to register mode
  cy.contains('a', 'Create one').click();
  
  // Verify we're in register mode
  cy.contains('Create your account').should('be.visible');
  
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  cy.url().should('include', '/tasks');
});

Cypress.Commands.add('createTask', (title: string, description: string, priority: string = 'MEDIUM') => {
  cy.contains('button', 'New Task').click();
  
  cy.get('input[placeholder*="Task title"]').type(title);
  cy.get('textarea[placeholder*="Task description"]').type(description);
  cy.get('select[name="priority"]').select(priority);
  
  cy.get('button[type="submit"]').click();
});

export {};