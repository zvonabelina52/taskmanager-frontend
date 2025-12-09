import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, Task } from './task.service';
import { environment } from '../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should return an array of tasks', () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test Task 1',
          description: 'Description 1',
          status: 'TODO' as const,
          priority: 'HIGH' as const
        },
        {
          id: 2,
          title: 'Test Task 2',
          description: 'Description 2',
          status: 'IN_PROGRESS' as const,
          priority: 'MEDIUM' as const
        }
      ];

      service.getTasks().subscribe(tasks => {
        expect(tasks.length).toBe(2);
        expect(tasks).toEqual(mockTasks);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
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

      const createdTask: Task = { ...newTask, id: 1 };

      service.createTask(newTask).subscribe(task => {
        expect(task).toEqual(createdTask);
        expect(task.id).toBeDefined();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTask);
      req.flush(createdTask);
    });
  });
});