import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let executeGuard: CanActivateFn;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    executeGuard = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true when user is authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(true);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return false and navigate to login when user is not authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(false);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle multiple calls correctly', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);

    const result1 = executeGuard({} as any, {} as any);
    const result2 = executeGuard({} as any, {} as any);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(2);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle authentication state changes', () => {
    // First call - not authenticated
    mockAuthService.isAuthenticated.and.returnValue(false);
    const result1 = executeGuard({} as any, {} as any);

    expect(result1).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);

    // Second call - authenticated
    mockAuthService.isAuthenticated.and.returnValue(true);
    const result2 = executeGuard({} as any, {} as any);

    expect(result2).toBe(true);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1); // Only called once
  });
});
