import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login';
import { AuthService, AuthResponse, User } from '../../../services/auth';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

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

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl'], {
      events: of()
    });

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default form values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('role')?.value).toBe('customer');
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should have required validators on form fields', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');
    const roleControl = component.loginForm.get('role');

    expect(emailControl?.hasError('required')).toBe(true);
    expect(passwordControl?.hasError('required')).toBe(true);
    expect(roleControl?.hasError('required')).toBe(false); // Has default value
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.loginForm.get('password');
    
    passwordControl?.setValue('123');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('123456');
    expect(passwordControl?.hasError('minlength')).toBe(false);
  });

  it('should submit form with valid data and navigate to dashboard for customer role', () => {
    mockAuthService.login.and.returnValue(of(mockAuthResponse));
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    });

    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should navigate to admin for admin role', () => {
    const adminUser = { ...mockUser, role: 'ADMIN' };
    const adminResponse = { ...mockAuthResponse, user: adminUser };
    mockAuthService.login.and.returnValue(of(adminResponse));
    
    component.loginForm.patchValue({
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should navigate to claims for agent role', () => {
    const agentUser = { ...mockUser, role: 'AGENT' };
    const agentResponse = { ...mockAuthResponse, user: agentUser };
    mockAuthService.login.and.returnValue(of(agentResponse));
    
    component.loginForm.patchValue({
      email: 'agent@example.com',
      password: 'password123',
      role: 'agent'
    });

    component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/claims']);
  });

  it('should handle login error', () => {
    const errorMessage = 'Invalid credentials';
    mockAuthService.login.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'wrongpassword',
      role: 'customer'
    });

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe(errorMessage);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle login error without message', () => {
    mockAuthService.login.and.returnValue(throwError(() => ({})));
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    });

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Login failed. Please try again.');
  });

  it('should not submit form when invalid', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: '123',
      role: 'customer'
    });

    component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('should set loading state during login', () => {
    mockAuthService.login.and.returnValue(of(mockAuthResponse));
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    });

    component.onSubmit();

    // Loading should be true initially, then false after response
    expect(component.loading).toBe(false);
  });

  it('should clear error on successful login', () => {
    component.error = 'Previous error';
    mockAuthService.login.and.returnValue(of(mockAuthResponse));
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    });

    component.onSubmit();

    expect(component.error).toBe('');
  });
});
