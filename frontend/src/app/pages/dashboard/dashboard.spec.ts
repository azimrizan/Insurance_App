import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard';
import { AuthService, User } from '../../services/auth';
import { PolicyService, UserPolicy } from '../../services/policy';
import { ClaimService, Claim } from '../../services/claim';
import { PaymentService, Payment } from '../../services/payment';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;
  let mockClaimService: jasmine.SpyObj<ClaimService>;
  let mockPaymentService: jasmine.SpyObj<PaymentService>;

  const mockUser: User = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  };

  const mockUserPolicies: UserPolicy[] = [
    {
      _id: '1',
      userId: '1',
      policyProductId: {
        _id: 'policy1',
        code: 'AUTO001',
        title: 'Auto Insurance',
        description: 'Comprehensive auto insurance',
        premium: 1000,
        termMonths: 12,
        minSumInsured: 50000,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      premiumPaid: 1200,
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      _id: '2',
      userId: '1',
      policyProductId: {
        _id: 'policy2',
        code: 'HOME001',
        title: 'Home Insurance',
        description: 'Homeowners insurance',
        premium: 600,
        termMonths: 12,
        minSumInsured: 200000,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2023-12-31T23:59:59Z',
      premiumPaid: 800,
      status: 'CANCELLED',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  ];

  const mockClaims: Claim[] = [
    {
      _id: '1',
      userId: '1',
      userPolicyId: 'policy1',
      incidentDate: '2024-01-01',
      description: 'Car accident',
      amountClaimed: 5000,
      status: 'PENDING',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      _id: '2',
      userId: '1',
      userPolicyId: 'policy1',
      incidentDate: '2024-01-02',
      description: 'Windshield damage',
      amountClaimed: 3000,
      status: 'APPROVED',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    }
  ];

  const mockPayments: Payment[] = [
    {
      _id: '1',
      userId: '1',
      userPolicyId: 'policy1',
      amount: 1200,
      method: 'CREDIT_CARD',
      reference: 'PAY001',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      _id: '2',
      userId: '1',
      userPolicyId: 'policy2',
      amount: 800,
      method: 'BANK_TRANSFER',
      reference: 'PAY002',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    }
  ];

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserValue']);
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getUserPolicies']);
    const claimServiceSpy = jasmine.createSpyObj('ClaimService', ['getClaims']);
    const paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['getUserPayments']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: ClaimService, useValue: claimServiceSpy },
        { provide: PaymentService, useValue: paymentServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockPolicyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    mockClaimService = TestBed.inject(ClaimService) as jasmine.SpyObj<ClaimService>;
    mockPaymentService = TestBed.inject(PaymentService) as jasmine.SpyObj<PaymentService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentUser).toBeNull();
    expect(component.userPolicies).toEqual([]);
    expect(component.recentClaims).toEqual([]);
    expect(component.recentPayments).toEqual([]);
    expect(component.loading).toBe(true);
  });

  it('should load dashboard data on ngOnInit', () => {
    mockAuthService.getCurrentUserValue.and.returnValue(mockUser);
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    mockPaymentService.getUserPayments.and.returnValue(of(mockPayments));

    component.ngOnInit();

    expect(component.currentUser).toEqual(mockUser);
    expect(mockPolicyService.getUserPolicies).toHaveBeenCalled();
    expect(mockClaimService.getClaims).toHaveBeenCalled();
    expect(mockPaymentService.getUserPayments).toHaveBeenCalled();
  });

  it('should load user policies successfully', () => {
    mockPolicyService.getUserPolicies.and.returnValue(of(mockUserPolicies));
    mockClaimService.getClaims.and.returnValue(of([]));
    mockPaymentService.getUserPayments.and.returnValue(of([]));

    component.loadDashboardData();

    expect(component.userPolicies).toEqual(mockUserPolicies);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading user policies', () => {
    const error = { message: 'Failed to load policies' };
    mockPolicyService.getUserPolicies.and.returnValue(throwError(() => error));
    mockClaimService.getClaims.and.returnValue(of([]));
    mockPaymentService.getUserPayments.and.returnValue(of([]));
    spyOn(console, 'error');

    component.loadDashboardData();

    expect(console.error).toHaveBeenCalledWith('Error loading policies:', error);
    expect(component.loading).toBe(false);
  });

  it('should load recent claims successfully', () => {
    mockPolicyService.getUserPolicies.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    mockPaymentService.getUserPayments.and.returnValue(of([]));

    component.loadDashboardData();

    expect(component.recentClaims).toEqual(mockClaims.slice(0, 5));
  });

  it('should handle error when loading claims', () => {
    const error = { message: 'Failed to load claims' };
    mockPolicyService.getUserPolicies.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(throwError(() => error));
    mockPaymentService.getUserPayments.and.returnValue(of([]));
    spyOn(console, 'error');

    component.loadDashboardData();

    expect(console.error).toHaveBeenCalledWith('Error loading claims:', error);
  });

  it('should load recent payments successfully', () => {
    mockPolicyService.getUserPolicies.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of([]));
    mockPaymentService.getUserPayments.and.returnValue(of(mockPayments));

    component.loadDashboardData();

    expect(component.recentPayments).toEqual(mockPayments.slice(0, 5));
  });

  it('should handle error when loading payments', () => {
    const error = { message: 'Failed to load payments' };
    mockPolicyService.getUserPolicies.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of([]));
    mockPaymentService.getUserPayments.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.loadDashboardData();

    expect(console.error).toHaveBeenCalledWith('Error loading payments:', error);
  });

  it('should return correct status color for ACTIVE', () => {
    const color = component.getStatusColor('ACTIVE');
    expect(color).toBe('bg-green-100 text-green-800');
  });

  it('should return correct status color for CANCELLED', () => {
    const color = component.getStatusColor('CANCELLED');
    expect(color).toBe('bg-red-100 text-red-800');
  });

  it('should return correct status color for EXPIRED', () => {
    const color = component.getStatusColor('EXPIRED');
    expect(color).toBe('bg-gray-100 text-gray-800');
  });

  it('should return correct status color for PENDING', () => {
    const color = component.getStatusColor('PENDING');
    expect(color).toBe('bg-yellow-100 text-yellow-800');
  });

  it('should return correct status color for APPROVED', () => {
    const color = component.getStatusColor('APPROVED');
    expect(color).toBe('bg-green-100 text-green-800');
  });

  it('should return correct status color for REJECTED', () => {
    const color = component.getStatusColor('REJECTED');
    expect(color).toBe('bg-red-100 text-red-800');
  });

  it('should return default color for unknown status', () => {
    const color = component.getStatusColor('UNKNOWN');
    expect(color).toBe('bg-gray-100 text-gray-800');
  });

  it('should return correct count of active policies', () => {
    component.userPolicies = mockUserPolicies;
    const activeCount = component.getActivePoliciesCount();
    expect(activeCount).toBe(1); // Only one ACTIVE policy in mock data
  });

  it('should return zero active policies when none exist', () => {
    component.userPolicies = [];
    const activeCount = component.getActivePoliciesCount();
    expect(activeCount).toBe(0);
  });

  it('should return correct count of pending claims', () => {
    component.recentClaims = mockClaims;
    const pendingCount = component.getPendingClaimsCount();
    expect(pendingCount).toBe(1); // Only one PENDING claim in mock data
  });

  it('should return zero pending claims when none exist', () => {
    component.recentClaims = [];
    const pendingCount = component.getPendingClaimsCount();
    expect(pendingCount).toBe(0);
  });
});
