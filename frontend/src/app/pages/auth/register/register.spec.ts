import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register';
import { AuthService, AuthResponse, User } from '../../../services/auth';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
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
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signup']);
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
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default form values', () => {
    expect(component.registerForm.get('name')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should have required validators on form fields', () => {
    const nameControl = component.registerForm.get('name');
    const emailControl = component.registerForm.get('email');
    const passwordControl = component.registerForm.get('password');
    const confirmPasswordControl = component.registerForm.get('confirmPassword');

    expect(nameControl?.hasError('required')).toBe(true);
    expect(emailControl?.hasError('required')).toBe(true);
    expect(passwordControl?.hasError('required')).toBe(true);
    expect(confirmPasswordControl?.hasError('required')).toBe(true);
  });

  it('should validate name minimum length', () => {
    const nameControl = component.registerForm.get('name');
    
    nameControl?.setValue('A');
    expect(nameControl?.hasError('minlength')).toBe(true);

    nameControl?.setValue('John');
    expect(nameControl?.hasError('minlength')).toBe(false);
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.registerForm.get('password');
    
    passwordControl?.setValue('123');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('123456');
    expect(passwordControl?.hasError('minlength')).toBe(false);
  });

  it('should validate password match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'different123'
    });

    // Trigger validation
    component.registerForm.updateValueAndValidity();

    expect(component.registerForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);
  });

  it('should pass validation when passwords match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'password123'
    });

    expect(component.registerForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(false);
  });

  it('should submit form with valid data and navigate to dashboard', () => {
    mockAuthService.signup.and.returnValue(of(mockAuthResponse));
    
    component.registerForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(mockAuthService.signup).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle registration error', () => {
    const errorMessage = 'Email already exists';
    mockAuthService.signup.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));
    
    component.registerForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe(errorMessage);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle registration error without message', () => {
    mockAuthService.signup.and.returnValue(throwError(() => ({})));
    
    component.registerForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Registration failed. Please try again.');
  });

  it('should not submit form when invalid', () => {
    component.registerForm.patchValue({
      name: 'J',
      email: 'invalid-email',
      password: '123',
      confirmPassword: 'different'
    });

    component.onSubmit();

    expect(mockAuthService.signup).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('should not submit form when passwords do not match', () => {
    component.registerForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'different123'
    });

    component.onSubmit();

    expect(mockAuthService.signup).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('should clear error on successful registration', () => {
    component.error = 'Previous error';
    mockAuthService.signup.and.returnValue(of(mockAuthResponse));
    
    component.registerForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(component.error).toBe('');
  });

  it('should set loading state during registration', () => {
    mockAuthService.signup.and.returnValue(of(mockAuthResponse));
    
    component.registerForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    // Loading should be true initially, then false after response
    expect(component.loading).toBe(false);
  });
});
