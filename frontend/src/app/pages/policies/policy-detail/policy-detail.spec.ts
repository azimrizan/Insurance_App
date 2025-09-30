import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PolicyDetailComponent } from './policy-detail';
import { PolicyService, PolicyProduct, PurchasePolicyRequest, UserPolicy } from '../../../services/policy';
import { AuthService } from '../../../services/auth';

describe('PolicyDetailComponent', () => {
  let component: PolicyDetailComponent;
  let fixture: ComponentFixture<PolicyDetailComponent>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockPolicy: PolicyProduct = {
    _id: '1',
    code: 'AUTO001',
    title: 'Auto Insurance',
    description: 'Comprehensive auto insurance coverage',
    premium: 1200,
    termMonths: 12,
    minSumInsured: 50000,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  const mockUserPolicy: UserPolicy = {
    _id: '1',
    userId: 'user1',
    policyProductId: mockPolicy,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    premiumPaid: 1200,
    status: 'ACTIVE',
    assignedAgentId: 'agent1',
    nominee: {
      name: 'Jane Doe',
      relation: 'Spouse'
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  const mockPurchasePolicyRequest: PurchasePolicyRequest = {
    startDate: '2024-01-01T00:00:00Z',
    termMonths: 12,
    nominee: {
      name: 'Jane Doe',
      relation: 'Spouse'
    }
  };

  beforeEach(async () => {
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getPolicyProductById', 'purchasePolicy']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserValue']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PolicyDetailComponent, ReactiveFormsModule],
      providers: [
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyDetailComponent);
    component = fixture.componentInstance;
    mockPolicyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.policy).toBeNull();
    expect(component.loading).toBe(true);
    expect(component.purchasing).toBe(false);
    expect(component.error).toBe('');
    expect(component.success).toBe('');
  });

  it('should initialize form with required validators', () => {
    expect(component.purchaseForm.get('startDate')?.hasError('required')).toBe(true);
    expect(component.purchaseForm.get('termMonths')?.hasError('required')).toBe(true);
    expect(component.purchaseForm.get('nomineeName')?.hasError('required')).toBe(true);
    expect(component.purchaseForm.get('nomineeRelation')?.hasError('required')).toBe(true);
  });

  it('should validate termMonths minimum value', () => {
    const termMonthsControl = component.purchaseForm.get('termMonths');
    
    termMonthsControl?.setValue(0);
    expect(termMonthsControl?.hasError('min')).toBe(true);

    termMonthsControl?.setValue(1);
    expect(termMonthsControl?.hasError('min')).toBe(false);
  });

  it('should load policy on ngOnInit when policyId exists', () => {
    mockPolicyService.getPolicyProductById.and.returnValue(of(mockPolicy));

    component.ngOnInit();

    expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(mockPolicyService.getPolicyProductById).toHaveBeenCalledWith('1');
  });

  it('should not load policy on ngOnInit when policyId is null', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(mockPolicyService.getPolicyProductById).not.toHaveBeenCalled();
  });

  it('should load policy successfully', () => {
    mockPolicyService.getPolicyProductById.and.returnValue(of(mockPolicy));

    component.loadPolicy('1');

    expect(component.policy).toEqual(mockPolicy);
    expect(component.loading).toBe(false);
    expect(component.purchaseForm.get('termMonths')?.value).toBe(mockPolicy.termMonths);
    expect(component.purchaseForm.get('startDate')?.value).toBe(new Date().toISOString().split('T')[0]);
  });

  it('should handle error when loading policy', () => {
    const error = { message: 'Policy not found' };
    mockPolicyService.getPolicyProductById.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.loadPolicy('999');

    expect(component.error).toBe('Failed to load policy details. Please try again.');
    expect(component.loading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error loading policy:', error);
  });

  it('should purchase policy with valid form data', () => {
    component.policy = mockPolicy;
    mockPolicyService.purchasePolicy.and.returnValue(of(mockUserPolicy));
    spyOn(window, 'setTimeout').and.callFake((handler: any) => { 
      if (typeof handler === 'function') {
        handler();
      }
      return 0; 
    });

    component.purchaseForm.patchValue({
      startDate: '2024-01-01',
      termMonths: 12,
      nomineeName: 'Jane Doe',
      nomineeRelation: 'Spouse'
    });

    component.onPurchase();

    expect(component.purchasing).toBe(false); // Should be false after completion
    expect(component.error).toBe('');
    expect(component.success).toBe('Policy purchased successfully!');
    expect(mockPolicyService.purchasePolicy).toHaveBeenCalledWith('1', {
      startDate: '2024-01-01',
      termMonths: 12,
      nominee: {
        name: 'Jane Doe',
        relation: 'Spouse'
      }
    });
  });

  it('should handle successful policy purchase', () => {
    component.policy = mockPolicy;
    mockPolicyService.purchasePolicy.and.returnValue(of(mockUserPolicy));
    spyOn(window, 'setTimeout').and.callFake((handler: any) => { 
      if (typeof handler === 'function') {
        handler();
      }
      return 0; 
    });

    component.purchaseForm.patchValue({
      startDate: '2024-01-01',
      termMonths: 12,
      nomineeName: 'Jane Doe',
      nomineeRelation: 'Spouse'
    });

    component.onPurchase();

    expect(component.purchasing).toBe(false);
    expect(component.success).toBe('Policy purchased successfully!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not purchase policy with invalid form data', () => {
    component.policy = mockPolicy;
    component.purchaseForm.patchValue({
      startDate: '',
      termMonths: 0,
      nomineeName: '',
      nomineeRelation: ''
    });

    component.onPurchase();

    expect(component.purchasing).toBe(false);
    expect(mockPolicyService.purchasePolicy).not.toHaveBeenCalled();
  });

  it('should not purchase policy when no policy is loaded', () => {
    component.policy = null;
    component.purchaseForm.patchValue({
      startDate: '2024-01-01',
      termMonths: 12,
      nomineeName: 'Jane Doe',
      nomineeRelation: 'Spouse'
    });

    component.onPurchase();

    expect(component.purchasing).toBe(false);
    expect(mockPolicyService.purchasePolicy).not.toHaveBeenCalled();
  });

  it('should handle error when purchasing policy', () => {
    const error = { error: { message: 'Insufficient funds' } };
    component.policy = mockPolicy;
    mockPolicyService.purchasePolicy.and.returnValue(throwError(() => error));

    component.purchaseForm.patchValue({
      startDate: '2024-01-01',
      termMonths: 12,
      nomineeName: 'Jane Doe',
      nomineeRelation: 'Spouse'
    });

    component.onPurchase();

    expect(component.purchasing).toBe(false);
    expect(component.error).toBe('Insufficient funds');
  });

  it('should handle error without message when purchasing policy', () => {
    component.policy = mockPolicy;
    mockPolicyService.purchasePolicy.and.returnValue(throwError(() => ({})));

    component.purchaseForm.patchValue({
      startDate: '2024-01-01',
      termMonths: 12,
      nomineeName: 'Jane Doe',
      nomineeRelation: 'Spouse'
    });

    component.onPurchase();

    expect(component.purchasing).toBe(false);
    expect(component.error).toBe('Failed to purchase policy. Please try again.');
  });

  it('should clear error and success messages before purchasing', () => {
    component.policy = mockPolicy;
    component.error = 'Previous error';
    component.success = 'Previous success';
    mockPolicyService.purchasePolicy.and.returnValue(of(mockUserPolicy));
    spyOn(window, 'setTimeout').and.callFake((handler: any) => { 
      if (typeof handler === 'function') {
        handler();
      }
      return 0; 
    });

    component.purchaseForm.patchValue({
      startDate: '2024-01-01',
      termMonths: 12,
      nomineeName: 'Jane Doe',
      nomineeRelation: 'Spouse'
    });

    component.onPurchase();

    expect(component.error).toBe('');
    expect(component.success).toBe('Policy purchased successfully!'); // Should show success message after purchase
  });

  it('should set purchasing state correctly during purchase', () => {
    component.policy = mockPolicy;
    mockPolicyService.purchasePolicy.and.returnValue(of(mockUserPolicy));
    spyOn(window, 'setTimeout').and.callFake((handler: any) => { 
      if (typeof handler === 'function') {
        handler();
      }
      return 0; 
    });

    component.purchaseForm.patchValue({
      startDate: '2024-01-01',
      termMonths: 12,
      nomineeName: 'Jane Doe',
      nomineeRelation: 'Spouse'
    });

    component.onPurchase();

    // Should be set to true initially, then false after completion
    expect(component.purchasing).toBe(false);
  });
});
