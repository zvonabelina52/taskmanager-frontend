describe('Task Management', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the app title', () => {
    cy.contains('Task Manager');
  });

  it('should create a new task', () => {
    cy.get('[data-cy=new-task-btn]').click();
    cy.get('[data-cy=task-title]').type('Test Task');
    cy.get('[data-cy=task-description]').type('Test Description');
    cy.get('[data-cy=save-task-btn]').click();
    cy.contains('Test Task').should('be.visible');
  });
});