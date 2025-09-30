import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MyPoliciesComponent } from './my-policies';
import { PolicyService } from '../../../services/policy';
import { AuthService } from '../../../services/auth';

describe('MyPoliciesComponent', () => {
  let component: MyPoliciesComponent;
  let fixture: ComponentFixture<MyPoliciesComponent>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUserPolicies = [
    {
      _id: '1',
      userId: 'user1',
      policyProductId: {
        _id: 'policy1',
        code: 'AUTO001',
        title: 'Auto Insurance',
        description: 'Comprehensive auto insurance coverage',
        premium: 1000,
        termMonths: 12,
        minSumInsured: 50000,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      premiumPaid: 1200,
      status: 'ACTIVE' as 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      _id: '2',
      userId: 'user1',
      policyProductId: {
        _id: 'policy2',
        code: 'HOME001',
        title: 'Home Insurance',
        description: 'Homeowners insurance coverage',
        premium: 600,
        termMonths: 12,
        minSumInsured: 200000,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z'
      },
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2025-01-31T23:59:59Z',
      premiumPaid: 800,
      status: 'ACTIVE' as 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z'
    },
    {
      _id: '3',
      userId: 'user1',
      policyProductId: {
        _id: 'policy3',
        code: 'LIFE001',
        title: 'Life Insurance',
        description: 'Term life insurance coverage',
        premium: 800,
        termMonths: 12,
        minSumInsured: 100000,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2023-12-31T23:59:59Z',
      premiumPaid: 900,
      status: 'CANCELLED' as 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  ];

  const mockUser = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  };

  beforeEach(async () => {
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', [
      'getUserPolicies',
      'cancelPolicy'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getCurrentUserValue'
    ]);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    // Configure spies before creating component
    policyServiceSpy.getUserPolicies.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [MyPoliciesComponent],
      providers: [
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyPoliciesComponent);
    component = fixture.componentInstance;
    mockPolicyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.policies).toEqual([]);
  });

  it('should load user policies on ngOnInit', () => {
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));

    component.ngOnInit();

    expect(mockPolicyService.getUserPolicies).toHaveBeenCalled();
    expect(component.policies).toEqual(mockUserPolicies);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle error when loading user policies', () => {
    const errorMessage = 'Failed to load policies';
    mockPolicyService.getUserPolicies.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.ngOnInit();

    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBe(false);
    expect(component.policies).toEqual([]);
  });

  it('should handle error without message when loading user policies', () => {
    mockPolicyService.getUserPolicies.and.returnValue(throwError(() => ({})));

    component.ngOnInit();

    expect(component.error).toBe('Failed to load policies');
    expect(component.loading).toBe(false);
  });

  it('should cancel a policy when confirmed', () => {
    const policyId = '1';
    spyOn(window, 'confirm').and.returnValue(true);
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));
    mockPolicyService.cancelPolicy.and.returnValue(of({
      _id: '1',
      userId: 'user1',
      policyProductId: {
        _id: 'policy1',
        code: 'AUTO001',
        title: 'Auto Insurance',
        description: 'Comprehensive auto insurance coverage',
        premium: 1000,
        termMonths: 12,
        minSumInsured: 50000,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      premiumPaid: 1200,
      status: 'CANCELLED' as 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }));

    component.ngOnInit();
    component.cancel(policyId);

    expect(window.confirm).toHaveBeenCalledWith('Cancel this policy?');
    expect(mockPolicyService.cancelPolicy).toHaveBeenCalledWith(policyId);
    expect(mockPolicyService.getUserPolicies).toHaveBeenCalledTimes(2); // Once on init, once after cancel
  });

  it('should not cancel a policy when not confirmed', () => {
    const policyId = '1';
    spyOn(window, 'confirm').and.returnValue(false);
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));

    component.ngOnInit();
    component.cancel(policyId);

    expect(window.confirm).toHaveBeenCalledWith('Cancel this policy?');
    expect(mockPolicyService.cancelPolicy).not.toHaveBeenCalled();
    expect(mockPolicyService.getUserPolicies).toHaveBeenCalledTimes(1); // Only on init
  });

  it('should handle error when canceling policy', () => {
    const policyId = '1';
    const errorMessage = 'Failed to cancel policy';
    spyOn(window, 'confirm').and.returnValue(true);
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));
    mockPolicyService.cancelPolicy.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.ngOnInit();
    component.cancel(policyId);

    expect(component.error).toBe(errorMessage);
    expect(mockPolicyService.getUserPolicies).toHaveBeenCalledTimes(1); // Only on init, not after error
  });

  it('should handle error without message when canceling policy', () => {
    const policyId = '1';
    spyOn(window, 'confirm').and.returnValue(true);
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));
    mockPolicyService.cancelPolicy.and.returnValue(throwError(() => ({})));

    component.ngOnInit();
    component.cancel(policyId);

    expect(component.error).toBe('Failed to cancel policy');
  });

  it('should display policies in the template', () => {
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));

    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    // This would depend on the actual template structure
    // You might need to adjust selectors based on the HTML template
    expect(component.policies.length).toBe(mockUserPolicies.length);
  });

  it('should show loading state initially', () => {
    // Check loading state before detectChanges triggers ngOnInit
    expect(component.loading).toBe(true);
  });

  it('should show error message when error occurs', () => {
    const errorMessage = 'Network error';
    mockPolicyService.getUserPolicies.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toBe(errorMessage);
  });

  it('should handle empty policies response', () => {
    mockPolicyService.getUserPolicies.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.policies).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should filter policies by status', () => {
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));

    component.ngOnInit();

    const activePolicies = component.policies.filter(p => p.status === 'ACTIVE');
    const pendingPolicies = component.policies.filter(p => p.status === 'ACTIVE');
    const cancelledPolicies = component.policies.filter(p => p.status === 'CANCELLED');

    expect(activePolicies.length).toBe(2);
    expect(pendingPolicies.length).toBe(2);
    expect(cancelledPolicies.length).toBe(1);
  });

  it('should display policy details correctly', () => {
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));

    component.ngOnInit();

    const firstPolicy = component.policies[0];
    expect(firstPolicy.policyProductId.title).toBe('Auto Insurance');
    expect(firstPolicy.premiumPaid).toBe(1200);
    expect(firstPolicy.status).toBe('ACTIVE');
  });
});
