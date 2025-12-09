import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
  };
  let routerSpy: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const authSpy = {
      login: vi.fn(),
      register: vi.fn()
    };
    const routerSpyObj = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as any;
    routerSpy = TestBed.inject(Router) as any;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onLogin', () => {
    it('should call authService.login with credentials', () => {
      const mockResponse = {
        token: 'mock-token',
        username: 'testuser',
        email: 'test@test.com'
      };

      // Set loginData directly (no form, regular properties)
      component.loginData.username = 'testuser';
      component.loginData.password = 'password123';

      authServiceSpy.login.mockReturnValue(of(mockResponse));

      component.onLogin();

      expect(authServiceSpy.login).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          password: 'password123'
        })
      );
    });

    it('should handle login error', () => {
      const error = { status: 401, error: { message: 'Invalid credentials' } };

      component.loginData.username = 'wronguser';
      component.loginData.password = 'wrongpass';

      authServiceSpy.login.mockReturnValue(throwError(() => error));

      component.onLogin();

      // error is a regular string property, not a signal
      expect(component.error).toBe('Invalid username or password');
    });

    it('should not submit with empty username', () => {
      component.loginData.username = '';
      component.loginData.password = 'password123';

      component.onLogin();

      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });
  });

  describe('onRegister', () => {
    it('should validate register data', () => {
      component.registerData.username = '';
      component.registerData.email = 'test@test.com';
      component.registerData.password = 'password123';

      component.onRegister();

      expect(authServiceSpy.register).not.toHaveBeenCalled();
      expect(component.error).toBe('Please enter username');
    });

    it('should call authService.register with correct data', () => {
      const mockResponse = {
        token: 'mock-token',
        username: 'newuser',
        email: 'new@test.com'
      };

      component.registerData.username = 'newuser';
      component.registerData.email = 'new@test.com';
      component.registerData.password = 'Password123!';

      authServiceSpy.register.mockReturnValue(of(mockResponse));

      component.onRegister();

      expect(authServiceSpy.register).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
          email: 'new@test.com',
          password: 'Password123!'
        })
      );
    });
  });

  describe('toggleMode', () => {
    it('should toggle between login and register mode', () => {
      expect(component.isLoginMode).toBe(true);
      component.toggleMode();
      expect(component.isLoginMode).toBe(false);
      component.toggleMode();
      expect(component.isLoginMode).toBe(true);
    });

    it('should clear error when toggling mode', () => {
      component.error = 'Some error';
      component.toggleMode();
      expect(component.error).toBe('');
    });
  });
});