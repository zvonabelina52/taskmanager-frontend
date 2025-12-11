describe('Task Management Application', () => {
  const testUser = {
    username: 'testuser_permanent',
    email: 'testuser_permanent@example.com',
    password: 'Test123!'
  };

  const cleanupUser = {
    username: 'cleanup_user',
    email: 'cleanup_user@example.com',
    password: 'Test123!'
  };

  const invalidUser = {
    username: 'invaliduser123',
    password: 'wrongpassword'
  };

  describe('Authentication', () => {
    // NO before/beforeEach hook for auth tests - we need to test login from scratch

    it('should show error for invalid credentials', () => {
      cy.clearLocalStorage();
      cy.visit('/login', { timeout: 10000 });
      cy.get('input[name="username"]', { timeout: 5000 }).type(invalidUser.username);
      cy.get('input[name="password"]', { timeout: 5000 }).type(invalidUser.password);
      cy.get('button[type="submit"]', { timeout: 5000 }).click();

      // Wait a bit for the API response and error rendering
      cy.wait(2000);

      // Check for error - try multiple selectors
      cy.get('.error, [class*="error"], .alert-error', { timeout: 10000 })
        .should('be.visible')
        .should('contain.text', 'Invalid');

      // Verify we're still on login page
      cy.url({ timeout: 5000 }).should('include', '/login');
    });

    it('should login successfully with valid credentials', () => {
      cy.clearLocalStorage();
      cy.visit('/login', { timeout: 10000 });
      cy.get('input[name="username"]', { timeout: 5000 }).type(testUser.username);
      cy.get('input[name="password"]', { timeout: 5000 }).type(testUser.password);
      cy.get('button[type="submit"]', { timeout: 5000 }).click();

      // Should redirect to tasks page
      cy.url({ timeout: 10000 }).should('include', '/tasks');
    });

    it('should logout successfully', () => {
      // First login
      cy.clearLocalStorage();
      cy.visit('/login', { timeout: 10000 });
      cy.get('input[name="username"]', { timeout: 5000 }).type(testUser.username);
      cy.get('input[name="password"]', { timeout: 5000 }).type(testUser.password);
      cy.get('button[type="submit"]', { timeout: 5000 }).click();
      cy.url({ timeout: 10000 }).should('include', '/tasks');

      // Then logout
      cy.contains('button', 'Logout', { timeout: 5000 }).click({ force: true });
      cy.url({ timeout: 5000 }).should('include', '/login');
    });

    it('should display validation error when username is empty', () => {
      cy.clearLocalStorage();
      cy.visit('/login', { timeout: 10000 });
      
      // Only fill password, leave username empty
      cy.get('input[name="password"]', { timeout: 5000 }).type('anypassword');
      
      // Try to submit - button should be disabled
      cy.get('button[type="submit"]', { timeout: 5000 }).should('be.disabled');

      // Verify we're still on login page
      cy.url({ timeout: 5000 }).should('include', '/login');
    });

    it('should display validation error when password is empty', () => {
      cy.clearLocalStorage();
      cy.visit('/login', { timeout: 10000 });
      
      // Only fill username, leave password empty
      cy.get('input[name="username"]', { timeout: 5000 }).type('anyusername');
      
      // Try to submit - button should be disabled
      cy.get('button[type="submit"]', { timeout: 5000 }).should('be.disabled');

      // Verify we're still on login page
      cy.url({ timeout: 5000 }).should('include', '/login');
    });
  });

  describe('Task Management', () => {
    // Setup: Register cleanup user for testing empty state
    before(() => {
      cy.clearLocalStorage();
      cy.visit('/login', { timeout: 10000 });

      // Try to login with cleanup user (for empty state test)
      cy.get('input[name="username"]', { timeout: 5000 }).type(cleanupUser.username);
      cy.get('input[name="password"]', { timeout: 5000 }).type(cleanupUser.password);
      cy.get('button[type="submit"]', { timeout: 5000 }).click();

      // Check if login was successful
      cy.url({ timeout: 10000 }).then((url) => {
        if (url.includes('/tasks')) {
          // User already exists, delete all tasks and logout
          cy.log('✓ Cleanup user already exists, clearing tasks');
          
          // Delete all tasks for this user
          cy.get('body').then(($body) => {
            // Keep checking and deleting tasks until none remain
            const deleteAllTasks = () => {
              cy.get('button:contains("Delete")', { timeout: 3000 }).then(($buttons) => {
                if ($buttons.length > 0) {
                  cy.get('button:contains("Delete")', { timeout: 3000 }).first().click({ force: true });
                  cy.on('window:confirm', () => true);
                  cy.wait(500);
                  deleteAllTasks();
                }
              });
            };
            deleteAllTasks();
          });

          cy.contains('button', 'Logout', { timeout: 5000 }).click({ force: true });
          cy.url({ timeout: 5000 }).should('include', '/login');
        } else {
          // User doesn't exist, register them
          cy.get('.error', { timeout: 5000 }).should('be.visible');
          cy.log('✓ Cleanup user does not exist, registering');

          // Navigate to register
          cy.contains('a', 'Create one', { timeout: 5000 }).click();

          // Fill in registration form
          cy.get('input[name="username"]', { timeout: 5000 }).clear().type(cleanupUser.username);
          cy.get('input[name="email"]', { timeout: 5000 }).type(cleanupUser.email);
          cy.get('input[name="password"]', { timeout: 5000 }).type(cleanupUser.password);

          // Submit registration
          cy.get('button[type="submit"]', { timeout: 5000 }).click();

          // Wait for successful redirect to tasks page
          cy.url({ timeout: 10000 }).should('include', '/tasks');
          cy.log('✓ Cleanup user registration successful');

          // Logout to reset for tests
          cy.contains('button', 'Logout', { timeout: 5000 }).click({ force: true });
          cy.url({ timeout: 5000 }).should('include', '/login');
        }
      });
    });

    // Login before EACH test
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('/login', { timeout: 10000 });
      cy.get('input[name="username"]', { timeout: 5000 }).type(cleanupUser.username);
      cy.get('input[name="password"]', { timeout: 5000 }).type(cleanupUser.password);
      cy.get('button[type="submit"]', { timeout: 5000 }).click();
      cy.url({ timeout: 10000 }).should('include', '/tasks');
    });

    it('should display empty state when no tasks exist', () => {
      cy.contains('No tasks yet!', { timeout: 5000 }).should('be.visible');
    });

    it('should create a new task', () => {
      // Click button - try multiple selectors
      cy.contains('button', 'New Task', { timeout: 5000 }).click({ force: true });
      cy.get('input[placeholder="Enter task title"]', { timeout: 5000 }).type('My First Task');
      cy.get('textarea[placeholder="Enter task description"]', { timeout: 5000 }).type('This is a test task');
      cy.get('select[name="priority"]', { timeout: 5000 }).select('HIGH');
      cy.contains('button', 'Create Task', { timeout: 5000 }).click({ force: true });

      cy.contains('My First Task', { timeout: 5000 }).should('be.visible');
      cy.contains('This is a test task', { timeout: 5000 }).should('be.visible');
    });

    it('should create multiple tasks', () => {
      const tasks = [
        { title: 'Task 1', desc: 'Description 1', priority: 'HIGH' },
        { title: 'Task 2', desc: 'Description 2', priority: 'MEDIUM' },
        { title: 'Task 3', desc: 'Description 3', priority: 'LOW' }
      ];

      tasks.forEach((task) => {
        cy.contains('button', 'New Task', { timeout: 5000 }).click({ force: true });
        cy.get('input[placeholder="Enter task title"]', { timeout: 5000 }).type(task.title);
        cy.get('textarea[placeholder="Enter task description"]', { timeout: 5000 }).type(task.desc);
        cy.get('select[name="priority"]', { timeout: 5000 }).select(task.priority);
        cy.contains('button', 'Create Task', { timeout: 5000 }).click({ force: true });

        cy.contains(task.title, { timeout: 5000 }).should('be.visible');
      });
    });

    it('should move task to In Progress', () => {
      cy.contains('button', 'New Task', { timeout: 5000 }).click({ force: true });
      cy.get('input[placeholder="Enter task title"]', { timeout: 5000 }).type('Task to Start');
      cy.get('textarea[placeholder="Enter task description"]', { timeout: 5000 }).type('Starting this task');
      cy.get('select[name="priority"]', { timeout: 5000 }).select('MEDIUM');
      cy.contains('button', 'Create Task', { timeout: 5000 }).click({ force: true });

      cy.contains('Task to Start', { timeout: 5000 }).should('be.visible');
      cy.contains('Task to Start', { timeout: 5000 })
        .closest('[class*="card"], div')
        .within(() => {
          cy.contains('button', 'Start', { timeout: 5000 }).click({ force: true });
        });

      cy.contains('In Progress', { timeout: 5000 }).should('be.visible');
      cy.contains('Task to Start', { timeout: 5000 }).should('be.visible');
    });

    it('should move task to Done', () => {
      cy.contains('button', 'New Task', { timeout: 5000 }).click({ force: true });
      cy.get('input[placeholder="Enter task title"]', { timeout: 5000 }).type('Task to Complete');
      cy.get('textarea[placeholder="Enter task description"]', { timeout: 5000 }).type('Completing this task');
      cy.get('select[name="priority"]', { timeout: 5000 }).select('MEDIUM');
      cy.contains('button', 'Create Task', { timeout: 5000 }).click({ force: true });

      cy.contains('Task to Complete', { timeout: 5000 }).should('be.visible');

      // Move to In Progress
      cy.contains('Task to Complete', { timeout: 5000 })
        .closest('[class*="card"], div')
        .within(() => {
          cy.contains('button', 'Start', { timeout: 5000 }).click({ force: true });
        });

      // Move to Done
      cy.contains('Task to Complete', { timeout: 5000 })
        .closest('[class*="card"], div')
        .within(() => {
          cy.contains('button', 'Done', { timeout: 5000 }).click({ force: true });
        });

      cy.contains('Done', { timeout: 5000 }).should('be.visible');
      cy.contains('Task to Complete', { timeout: 5000 }).should('be.visible');
    });

    it('should delete a task', () => {
      cy.contains('button', 'New Task', { timeout: 5000 }).click({ force: true });
      cy.get('input[placeholder="Enter task title"]', { timeout: 5000 }).type('Task to Delete');
      cy.get('textarea[placeholder="Enter task description"]', { timeout: 5000 }).type('This will be deleted');
      cy.get('select[name="priority"]', { timeout: 5000 }).select('LOW');
      cy.contains('button', 'Create Task', { timeout: 5000 }).click({ force: true });

      cy.contains('Task to Delete', { timeout: 5000 }).should('be.visible');
      cy.contains('Task to Delete', { timeout: 5000 })
        .closest('[class*="card"], div')
        .within(() => {
          cy.get('button[class*="delete"], button[title*="delete"], button:contains("Delete")', { timeout: 5000 })
            .first()
            .click({ force: true });
        });

      // Handle confirmation dialog
      cy.on('window:confirm', () => true);
      cy.contains('Task to Delete', { timeout: 5000 }).should('not.exist');
    });

    it('should persist tasks after page reload', () => {
      cy.contains('button', 'New Task', { timeout: 5000 }).click({ force: true });
      cy.get('input[placeholder="Enter task title"]', { timeout: 5000 }).type('Persistent Task');
      cy.get('textarea[placeholder="Enter task description"]', { timeout: 5000 }).type('This should persist');
      cy.get('select[name="priority"]', { timeout: 5000 }).select('MEDIUM');
      cy.contains('button', 'Create Task', { timeout: 5000 }).click({ force: true });

      cy.contains('Persistent Task', { timeout: 5000 }).should('be.visible');
      cy.reload();

      cy.url({ timeout: 10000 }).should('include', '/tasks');
      cy.contains('Persistent Task', { timeout: 5000 }).should('be.visible');
      cy.contains('This should persist', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should redirect to login when accessing tasks without auth', () => {
      cy.clearLocalStorage();
      cy.visit('/tasks', { timeout: 10000 });
      cy.url({ timeout: 5000 }).should('include', '/login');
    });
  });
});