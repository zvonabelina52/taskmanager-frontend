import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isLoginMode = true;
  loading = false;
  error = '';
  
  loginData: LoginRequest = {
    username: '',
    password: ''
  };
  
  registerData: RegisterRequest = {
    username: '',
    email: '',
    password: ''
  };
  
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
    this.loading = false;
  }
  
  onLogin() {
  if (!this.loginData.username?.trim()) {
    this.error = 'Please enter username';
    return;
  }
  if (!this.loginData.password) {
    this.error = 'Please enter password';
    return;
  }

  this.loading = true;
  this.error = '';
  
  console.log('=== LOGIN ATTEMPT START ===');
  console.log('Username:', this.loginData.username);
  console.log('Time:', new Date().toISOString());
  
  // Safety timeout - reset loading after 10 seconds
  const timeoutId = setTimeout(() => {
    console.error('Login timeout - forcing loading to false');
    this.loading = false;
    this.error = 'Request timeout. Please try again.';
  }, 10000);
  
  this.authService.login(this.loginData).subscribe({
    next: (response) => {
      clearTimeout(timeoutId);
      console.log('✓ Login successful:', response);
      this.loading = false;
      this.router.navigate(['/tasks']);
    },
    error: (err: HttpErrorResponse) => {
      clearTimeout(timeoutId);
      console.error('✗ Login failed:', err);
      console.error('Error status:', err.status);
      console.error('Error body:', err.error);
      
      this.loading = false;
      
      if (err.status === 0) {
        this.error = 'Cannot connect to server. Is backend running on port 8080?';
      } else if (err.status === 401) {
        this.error = 'Invalid username or password';
      } else if (err.error?.error) {
        this.error = err.error.error;
      } else {
        this.error = `Login failed (${err.status}). Please try again.`;
      }
    }
  });
}
  
  onRegister() {
    // Validation
    if (!this.registerData.username?.trim()) {
      this.error = 'Please enter username';
      return;
    }
    if (!this.registerData.email?.trim()) {
      this.error = 'Please enter email';
      return;
    }
    if (!this.registerData.password || this.registerData.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.error = '';
    
    console.log('Attempting registration for:', this.registerData.username);
    
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading = false;
        this.router.navigate(['/tasks']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Registration failed:', err);
        this.loading = false;
        
        if (err.status === 0) {
          this.error = 'Cannot connect to server. Is the backend running?';
        } else if (err.status === 409) {
          this.error = 'Username or email already exists';
        } else if (err.error?.error) {
          this.error = err.error.error;
        } else {
          this.error = 'Registration failed. Please try again.';
        }
      },
      complete: () => {
        console.log('Registration request completed');
      }
    });
  }
}