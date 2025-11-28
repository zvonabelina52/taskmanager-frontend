import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  
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
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks. Make sure the backend is running.';
        this.loading = false;
        console.error(err);
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
      },
      error: (err) => {
        this.error = 'Failed to create task';
        console.error(err);
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
      },
      error: (err) => {
        this.error = 'Failed to update task';
        console.error(err);
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
      },
      error: (err) => {
        this.error = 'Failed to delete task';
        console.error(err);
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
}