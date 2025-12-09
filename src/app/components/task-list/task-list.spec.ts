import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { TaskListComponent } from './task-list';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskServiceSpy: any;
  let authServiceSpy: any;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'TODO' as const,
      priority: 'HIGH' as const
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      status: 'IN_PROGRESS' as const,
      priority: 'MEDIUM' as const
    },
    {
      id: 3,
      title: 'Task 3',
      description: 'Description 3',
      status: 'DONE' as const,
      priority: 'LOW' as const
    }
  ];

  beforeEach(async () => {
    const taskSpy = {
      getTasks: vi.fn(),
      getTask: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn()
    };

    const authSpy = {
      logout: vi.fn(),
      isAuthenticated: vi.fn(),
      getToken: vi.fn(),
      currentUser: signal({ username: 'testuser', email: 'test@test.com' })
    };

    authSpy.isAuthenticated.mockReturnValue(true);
    authSpy.getToken.mockReturnValue('mock-token');

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    taskServiceSpy = TestBed.inject(TaskService);
    authServiceSpy = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadTasks', () => {
    it('should load tasks successfully', () => {
      taskServiceSpy.getTasks.mockReturnValue(of(mockTasks));

      component.ngOnInit();

      expect(taskServiceSpy.getTasks).toHaveBeenCalled();
      // tasks is a regular property, not a signal
      expect(component.tasks).toEqual(mockTasks);
      // loading is a regular property, not a signal
      expect(component.loading).toBeFalsy();
    });

    it('should handle 401 error and logout', () => {
      const error = { status: 401, message: 'Unauthorized' };
      taskServiceSpy.getTasks.mockReturnValue(throwError(() => error));

      component.loadTasks();

      expect(component.loading).toBeFalsy();
      expect(authServiceSpy.logout).toHaveBeenCalled();
    });

    it('should handle network error', () => {
      const error = { status: 0, message: 'Network error' };
      taskServiceSpy.getTasks.mockReturnValue(throwError(() => error));

      component.loadTasks();

      expect(component.loading).toBeFalsy();
      expect(component.error).toContain('Cannot connect to backend');
    });

    it('should handle general error', () => {
      const error = { status: 500, message: 'Server error' };
      taskServiceSpy.getTasks.mockReturnValue(throwError(() => error));

      component.loadTasks();

      expect(component.loading).toBeFalsy();
      expect(component.error).toBe('Failed to load tasks. Please try again.');
    });
  });

  describe('createTask', () => {
    it('should create a new task', () => {
      const newTask: Task = {
        title: 'New Task',
        description: 'New Description',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const
      };

      const createdTask = { ...newTask, id: 4 };

      component.newTask = newTask;
      taskServiceSpy.createTask.mockReturnValue(of(createdTask));

      component.createTask();

      expect(taskServiceSpy.createTask).toHaveBeenCalledWith(newTask);
      expect(component.tasks).toContain(createdTask);
    });

    it('should not create task with empty title', () => {
      component.newTask.title = ' ';

      component.createTask();

      expect(taskServiceSpy.createTask).not.toHaveBeenCalled();
    });

    it('should handle create error', () => {
      const newTask: Task = {
        title: 'New Task',
        description: 'Description',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const
      };

      component.newTask = newTask;
      taskServiceSpy.createTask.mockReturnValue(throwError(() => ({ status: 500 })));

      component.createTask();

      expect(component.error).toBe('Failed to create task');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', () => {
      const task = mockTasks[0];
      const updatedTask = { ...task, status: 'IN_PROGRESS' as const };

      component.tasks = [...mockTasks];
      taskServiceSpy.updateTask.mockReturnValue(of(updatedTask));

      component.updateTaskStatus(task, 'IN_PROGRESS');

      expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(task.id, updatedTask);
      expect(component.tasks[0].status).toBe('IN_PROGRESS');
    });

    it('should handle update error', () => {
      const task = mockTasks[0];
      taskServiceSpy.updateTask.mockReturnValue(throwError(() => ({ status: 500 })));

      component.updateTaskStatus(task, 'DONE');

      expect(component.error).toBe('Failed to update task');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task after confirmation', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const taskId = 1;

      component.tasks = [...mockTasks];
      taskServiceSpy.deleteTask.mockReturnValue(of(void 0));

      component.deleteTask(taskId);

      expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith(taskId);
      expect(component.tasks.length).toBe(2);
      expect(component.tasks.find((t: Task) => t.id === taskId)).toBeUndefined();
    });

    it('should not delete task if not confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const taskId = 1;

      component.deleteTask(taskId);

      expect(taskServiceSpy.deleteTask).not.toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      taskServiceSpy.deleteTask.mockReturnValue(throwError(() => ({ status: 500 })));

      component.deleteTask(1);

      expect(component.error).toBe('Failed to delete task');
    });
  });

  describe('toggleForm', () => {
    it('should toggle form visibility', () => {
      expect(component.showForm).toBeFalsy();
      component.toggleForm();
      expect(component.showForm).toBeTruthy();
      component.toggleForm();
      expect(component.showForm).toBeFalsy();
    });

    it('should reset form when hiding', () => {
      component.newTask.title = 'Test';
      component.showForm = true;
      component.toggleForm();
      expect(component.newTask.title).toBe('');
      expect(component.showForm).toBeFalsy();
    });
  });

  describe('logout', () => {
    it('should call auth service logout', () => {
      component.logout();
      expect(authServiceSpy.logout).toHaveBeenCalled();
    });
  });
});