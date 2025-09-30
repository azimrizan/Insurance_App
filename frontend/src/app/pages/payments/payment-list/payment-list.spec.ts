import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PaymentListComponent } from './payment-list';
import { PaymentService, Payment, RecordPaymentRequest } from '../../../services/payment';
import { AuthService, User } from '../../../services/auth';
import { PolicyService, UserPolicy } from '../../../services/policy';

describe('PaymentListComponent', () => {
  let component: PaymentListComponent;
  let fixture: ComponentFixture<PaymentListComponent>;
  let mockPaymentService: jasmine.SpyObj<PaymentService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;

  const mockUser: User = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  };

  const mockPayments: Payment[] = [
    {
      _id: '1',
      userId: '1',
      userPolicyId: 'policy1',
      amount: 1200,
      method: 'CREDIT_CARD',
      reference: 'TXN123456',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      _id: '2',
      userId: '1',
      userPolicyId: 'policy2',
      amount: 800,
      method: 'BANK_TRANSFER',
      reference: 'TXN789012',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    }
  ];

  const mockPolicies: UserPolicy[] = [
    {
      _id: '1',
      userId: '1',
      policyProductId: {
        _id: 'policy1',
        code: 'AUTO001',
        title: 'Auto Insurance',
        description: 'Comprehensive auto insurance',
        premium: 1200,
        termMonths: 12,
        minSumInsured: 50000,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      },
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      premiumPaid: 1200,
      status: 'ACTIVE',
      assignedAgentId: 'agent1',
      nominee: undefined,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    }
  ];

  const mockRecordPaymentRequest: RecordPaymentRequest = {
    policyId: 'policy1',
    amount: 1200,
    method: 'CREDIT_CARD',
    reference: 'TXN123456'
  };

  beforeEach(async () => {
    const paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['getUserPayments', 'recordPayment']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserValue']);
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getUserPolicies']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PaymentListComponent, ReactiveFormsModule],
      providers: [
        { provide: PaymentService, useValue: paymentServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentListComponent);
    component = fixture.componentInstance;
    mockPaymentService = TestBed.inject(PaymentService) as jasmine.SpyObj<PaymentService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockPolicyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.payments).toEqual([]);
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.currentUser).toBeNull();
    expect(component.policies).toEqual([]);
  });

  it('should initialize form with required validators and default method', () => {
    expect(component.payForm.get('policyId')?.hasError('required')).toBe(true);
    expect(component.payForm.get('amount')?.hasError('required')).toBe(true);
    expect(component.payForm.get('method')?.value).toBe('SIMULATED');
    expect(component.payForm.get('reference')?.hasError('required')).toBe(true);
  });

  it('should validate amount minimum value', () => {
    const amountControl = component.payForm.get('amount');
    
    amountControl?.setValue(0);
    expect(amountControl?.hasError('min')).toBe(true);

    amountControl?.setValue(1);
    expect(amountControl?.hasError('min')).toBe(false);
  });

  it('should load payments and policies on ngOnInit', () => {
    mockAuthService.getCurrentUserValue.and.returnValue(mockUser);
    mockPaymentService.getUserPayments.and.returnValue(of(mockPayments));
    mockPolicyService.getUserPolicies.and.returnValue(of(mockPolicies));

    component.ngOnInit();

    expect(component.currentUser).toEqual(mockUser);
    expect(mockPaymentService.getUserPayments).toHaveBeenCalled();
    expect(mockPolicyService.getUserPolicies).toHaveBeenCalled();
  });

  it('should load payments successfully', () => {
    mockPaymentService.getUserPayments.and.returnValue(of(mockPayments));

    component.loadPayments();

    expect(component.payments).toEqual(mockPayments);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle error when loading payments', () => {
    const error = { message: 'Failed to load payments' };
    mockPaymentService.getUserPayments.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.loadPayments();

    expect(component.error).toBe('Failed to load payments. Please try again.');
    expect(component.loading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error loading payments:', error);
  });

  it('should load policies successfully', () => {
    mockPolicyService.getUserPolicies.and.returnValue(of(mockPolicies));

    component.loadPolicies();

    expect(component.policies).toEqual(mockPolicies);
  });

  it('should handle error when loading policies (non-blocking)', () => {
    const error = { message: 'Failed to load policies' };
    mockPolicyService.getUserPolicies.and.returnValue(throwError(() => error));

    component.loadPolicies();

    // Should not affect component state since it's non-blocking
    expect(component.policies).toEqual([]);
  });

  it('should format date correctly', () => {
    const dateString = '2024-01-01T10:00:00Z';
    const formattedDate = component.formatDate(dateString);
    
    expect(formattedDate).toBe(new Date(dateString).toLocaleDateString());
  });

  it('should format amount correctly', () => {
    const amount = 1200;
    const formattedAmount = component.formatAmount(amount);
    
    expect(formattedAmount).toBe('$1,200.00');
  });

  it('should calculate total amount correctly', () => {
    component.payments = mockPayments;
    const totalAmount = component.getTotalAmount();
    
    expect(totalAmount).toBe(2000); // 1200 + 800
  });

  it('should return zero total amount when no payments', () => {
    component.payments = [];
    const totalAmount = component.getTotalAmount();
    
    expect(totalAmount).toBe(0);
  });

  it('should calculate average amount correctly', () => {
    component.payments = mockPayments;
    const averageAmount = component.getAverageAmount();
    
    expect(averageAmount).toBe(1000); // 2000 / 2
  });

  it('should return zero average amount when no payments', () => {
    component.payments = [];
    const averageAmount = component.getAverageAmount();
    
    expect(averageAmount).toBe(0);
  });

  it('should submit payment with valid form data', () => {
    const newPayment = { ...mockPayments[0], _id: '3' };
    mockPaymentService.recordPayment.and.returnValue(of(newPayment));
    mockPaymentService.getUserPayments.and.returnValue(of(mockPayments));

    // Reset the spy call count to start fresh
    mockPaymentService.getUserPayments.calls.reset();
    
    component.payForm.patchValue(mockRecordPaymentRequest);
    component.submitPayment();

    expect(mockPaymentService.recordPayment).toHaveBeenCalledWith(mockRecordPaymentRequest);
    expect(component.payForm.get('method')?.value).toBe('SIMULATED'); // Should reset to default
    expect(mockPaymentService.getUserPayments).toHaveBeenCalledTimes(1); // Once after submit
  });

  it('should not submit payment with invalid form data', () => {
    component.payForm.patchValue({
      policyId: '',
      amount: null,
      method: '',
      reference: ''
    });

    component.submitPayment();

    expect(mockPaymentService.recordPayment).not.toHaveBeenCalled();
  });

  it('should handle error when submitting payment', () => {
    const error = { error: { message: 'Invalid payment data' } };
    mockPaymentService.recordPayment.and.returnValue(throwError(() => error));

    component.payForm.patchValue(mockRecordPaymentRequest);
    component.submitPayment();

    expect(component.error).toBe('Invalid payment data');
  });

  it('should handle error without message when submitting payment', () => {
    mockPaymentService.recordPayment.and.returnValue(throwError(() => ({})));

    component.payForm.patchValue(mockRecordPaymentRequest);
    component.submitPayment();

    expect(component.error).toBe('Failed to record payment.');
  });

  it('should reset form method to SIMULATED after successful payment', () => {
    const newPayment = { ...mockPayments[0], _id: '3' };
    mockPaymentService.recordPayment.and.returnValue(of(newPayment));
    mockPaymentService.getUserPayments.and.returnValue(of(mockPayments));

    component.payForm.patchValue({
      ...mockRecordPaymentRequest,
      method: 'CREDIT_CARD'
    });

    component.submitPayment();

    expect(component.payForm.get('method')?.value).toBe('SIMULATED');
  });
});
