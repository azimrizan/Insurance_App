import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { AuthService, User, AuthResponse, SignupInput, LoginInput } from './auth';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  };

  const mockAuthResponse: AuthResponse = {
    token: 'test-token-123',
    user: mockUser
  };

  const mockSignupInput: SignupInput = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  };

  const mockLoginInput: LoginInput = {
    email: 'john@example.com',
    password: 'password123',
    role: 'customer'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signup', () => {
    it('should register user and then auto-login', () => {
      const registerResponse = { message: 'User created successfully', user: mockUser };
      
      service.signup(mockSignupInput).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockAuthResponse.user));
      });

      // First request - register
      const registerReq = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(registerReq.request.method).toBe('POST');
      expect(registerReq.request.body).toEqual(mockSignupInput);
      registerReq.flush(registerResponse);

      // Second request - auto-login
      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(loginReq.request.method).toBe('POST');
      expect(loginReq.request.body).toEqual(mockLoginInput);
      loginReq.flush(mockAuthResponse);
    });

    it('should handle signup error', () => {
      service.signup(mockSignupInput).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush({ error: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should login user and store auth data', () => {
      service.login(mockLoginInput).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockAuthResponse.user));
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginInput);
      req.flush(mockAuthResponse);
    });

    it('should handle login error', () => {
      service.login(mockLoginInput).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user from API', () => {
      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle getCurrentUser error', () => {
      service.getCurrentUser().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear auth data and set current user to null', () => {
      // Set up initial auth data
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.getCurrentUserValue()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'test-token');

      const result = service.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when token does not exist', () => {
      const result = service.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when token is empty string', () => {
      localStorage.setItem('token', '');

      const result = service.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const token = 'test-token-456';
      localStorage.setItem('token', token);

      const result = service.getToken();

      expect(result).toBe(token);
    });

    it('should return null when token does not exist', () => {
      const result = service.getToken();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentUserValue', () => {
    it('should return current user value', () => {
      service['currentUserSubject'].next(mockUser);

      const result = service.getCurrentUserValue();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user is set', () => {
      const result = service.getCurrentUserValue();

      expect(result).toBeNull();
    });
  });

  describe('loadUserFromStorage', () => {
    it('should load user from localStorage on initialization', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Create new service instance to test constructor
      const httpClient = TestBed.inject(HttpClient);
      const newService = new AuthService(httpClient);

      expect(newService.getCurrentUserValue()).toEqual(mockUser);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('user', 'invalid-json');

      // Create new service instance to test constructor
      const httpClient = TestBed.inject(HttpClient);
      
      // Expect the constructor to throw an error due to invalid JSON
      expect(() => new AuthService(httpClient)).toThrow();
    });

    it('should handle null user in localStorage', () => {
      localStorage.setItem('user', 'null');

      // Create new service instance to test constructor
      const httpClient = TestBed.inject(HttpClient);
      const newService = new AuthService(httpClient);

      expect(newService.getCurrentUserValue()).toBeNull();
    });
  });

  describe('currentUser$ observable', () => {
    it('should emit current user changes', () => {
      // Clear localStorage to ensure clean state
      localStorage.clear();
      
      // Create a fresh service instance to avoid initialization issues
      const freshService = new AuthService(TestBed.inject(HttpClient));
      
      // Get the initial value first
      const initialValue = freshService.getCurrentUserValue();
      
      let emittedUser: User | null = initialValue;
      let emissionCount = 0;
      
      freshService.currentUser$.subscribe(user => {
        emittedUser = user;
        emissionCount++;
      });

      // Check initial emission (should match getCurrentUserValue)
      expect(emittedUser).toBe(initialValue);
      expect(emissionCount).toBe(1);

      // Set user
      freshService['currentUserSubject'].next(mockUser);
      expect(emittedUser).toEqual(mockUser);
      expect(emissionCount).toBe(2);

      // Clear user
      freshService['currentUserSubject'].next(null);
      expect(emittedUser).toBeNull();
      expect(emissionCount).toBe(3);
    });
  });
});
