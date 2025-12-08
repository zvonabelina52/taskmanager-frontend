import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  currentUser = this.authService.currentUser;
  
  tasks: Task[] = [];
  loading = false;
  error = '';
  
  // Form fields for new task
  newTask: Task = {
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM'
  };
  
  showForm = false;
  editingTask: Task | null = null;

  ngOnInit() {
    console.log('TaskList component initialized');
    console.log('Current user:', this.currentUser());
    console.log('Is authenticated:', this.authService.isAuthenticated());
    console.log('Token:', this.authService.getToken());
    
    this.loadTasks();
  }

  loadTasks() {
    console.log('Loading tasks...');
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges(); // Force update
    
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        console.log('Tasks loaded successfully:', tasks);
        this.tasks = tasks;
        this.loading = false;
        console.log('Loading state:', this.loading);
        console.log('Tasks array:', this.tasks);
        console.log('Tasks length:', this.tasks.length);
        this.cdr.detectChanges(); // Force update after loading
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        
        this.loading = false;
        
        if (err.status === 401) {
          this.error = 'Session expired. Please login again.';
          this.authService.logout();
        } else if (err.status === 0) {
          this.error = 'Cannot connect to backend. Please check if it\'s running.';
        } else {
          this.error = 'Failed to load tasks. Please try again.';
        }
        
        this.cdr.detectChanges(); // Force update on error
      }
    });
  }

  createTask() {
    if (!this.newTask.title.trim()) {
      return;
    }

    this.taskService.createTask(this.newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to create task';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  updateTaskStatus(task: Task, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') {
    const updatedTask = { ...task, status: newStatus };
    
    this.taskService.updateTask(task.id!, updatedTask).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updated;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to update task';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  deleteTask(id: number) {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to delete task';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.newTask = {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM'
    };
    this.showForm = false;
  }

  getTasksByStatus(status: string) {
    return this.tasks.filter(t => t.status === status);
  }

  logout() {
    this.authService.logout();
  }
}