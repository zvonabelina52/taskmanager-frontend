/// <reference types="cypress" />

// Extend Cypress Chainable interface
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('username', 'password')
       */
      login(username: string, password: string): Chainable<void>;
      
      /**
       * Custom command to register a new user
       * @example cy.register('username', 'email@test.com', 'password')
       */
      register(username: string, email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to create a task
       * @example cy.createTask('Task Title', 'Task Description', 'HIGH')
       */
      createTask(title: string, description: string, priority?: string): Chainable<void>;
    }
  }
}

// Import commands.js using ES2015 syntax to ensure it's loaded

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/tasks');
});

Cypress.Commands.add('register', (username: string, email: string, password: string) => {
  cy.visit('/register');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/tasks');
});

Cypress.Commands.add('createTask', (title: string, description: string, priority: string = 'MEDIUM') => {
  cy.contains('button', 'New Task').click();
  cy.get('[data-cy="task-title"]').type(title);
  cy.get('[data-cy="task-description"]').type(description);
  cy.get('select[name="priority"]').select(priority);
  cy.get('[data-cy="save-task-btn"]').click();
});

export {};