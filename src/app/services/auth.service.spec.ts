import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: any;

  const apiUrl = 'http://localhost:8080/api/auth';

  beforeEach(() => {
    const routerSpyObj = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user and store token', () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        username: 'testuser',
        email: 'test@example.com'
      };

      const loginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      // AuthService.login takes a LoginRequest object, not separate params
      let result: any;
      service.login(loginRequest).subscribe({
        next: (response) => {
          result = response;
          expect(response).toEqual(mockResponse);
          expect(localStorage.getItem('token')).toBe('mock-jwt-token');
          expect(service.isAuthenticated()).toBeTruthy();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle login error', () => {
      const loginRequest = {
        username: 'wronguser',
        password: 'wrongpass'
      };

      let errorResult: any;
      service.login(loginRequest).subscribe({
        error: (error) => {
          errorResult = error;
          expect(error.status).toBe(401);
          expect(localStorage.getItem('token')).toBeNull();
          expect(service.isAuthenticated()).toBeFalsy();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      expect(errorResult.status).toBe(401);
    });
  });

  describe('register', () => {
    it('should register user and store token', () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        username: 'newuser',
        email: 'new@example.com'
      };

      const registerRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      };

      let result: any;
      service.register(registerRequest).subscribe({
        next: (response) => {
          result = response;
          expect(response).toEqual(mockResponse);
          expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('should handle registration error', () => {
      const registerRequest = {
        username: 'existing',
        email: 'existing@example.com',
        password: 'password123'
      };

      let errorResult: any;
      service.register(registerRequest).subscribe({
        error: (error) => {
          errorResult = error;
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      req.flush({ message: 'Username already exists' }, { status: 409, statusText: 'Conflict' });

      expect(errorResult.status).toBe(409);
    });
  });

  describe('logout', () => {
    it('should clear token and user data', () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ username: 'test', email: 'test@test.com' }));

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should work when already logged out', () => {
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isAuthenticated', () => {
  it('should return true when user is authenticated', () => {
    const mockResponse = {
      token: 'mock-jwt-token',
      username: 'testuser',
      email: 'test@test.com'
    };

    const loginRequest = {
      username: 'testuser',
      password: 'password123'
    };

    service.login(loginRequest).subscribe({
      next: () => {
        expect(service.isAuthenticated()).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush(mockResponse);
  });

  it('should return false when user is not authenticated', () => {
    expect(service.isAuthenticated()).toBeFalsy();
  });
});

  describe('getToken', () => {
  it('should return token after successful login', () => {
    const mockResponse = {
      token: 'mock-jwt-token',
      username: 'testuser',
      email: 'test@test.com'
    };

    const loginRequest = {
      username: 'testuser',
      password: 'password123'
    };

    service.login(loginRequest).subscribe({
      next: () => {
        expect(service.getToken()).toBe('mock-jwt-token');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush(mockResponse);
  });

  it('should return null when token does not exist', () => {
    expect(service.getToken()).toBeNull();
  });
});

  describe('currentUser signal', () => {
    it('should update when user logs in', () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        username: 'testuser',
        email: 'test@example.com'
      };

      const loginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      let result: any;
      service.login(loginRequest).subscribe({
        next: () => {
          result = service.currentUser();
          expect(service.currentUser()).toEqual({
            username: 'testuser',
            email: 'test@example.com'
          });
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);

      expect(result).toEqual({
        username: 'testuser',
        email: 'test@example.com'
      });
    });

    it('should be null when not authenticated', () => {
      expect(service.currentUser()).toBeNull();
    });
  });
});