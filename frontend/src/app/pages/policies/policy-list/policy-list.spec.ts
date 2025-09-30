import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PolicyListComponent } from './policy-list';
import { PolicyService, PolicyProduct } from '../../../services/policy';
import { AuthService, User } from '../../../services/auth';

describe('PolicyListComponent', () => {
  let component: PolicyListComponent;
  let fixture: ComponentFixture<PolicyListComponent>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  };

  const mockAdminUser: User = {
    _id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };

  const mockPolicies: PolicyProduct[] = [
    {
      _id: '1',
      code: 'AUTO001',
      title: 'Auto Insurance',
      description: 'Comprehensive auto insurance coverage',
      premium: 1200,
      termMonths: 12,
      minSumInsured: 50000,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      _id: '2',
      code: 'HOME001',
      title: 'Home Insurance',
      description: 'Homeowners insurance coverage',
      premium: 800,
      termMonths: 12,
      minSumInsured: 200000,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    }
  ];

  const mockCreatePolicyData = {
    code: 'LIFE001',
    title: 'Life Insurance',
    description: 'Term life insurance',
    premium: 500,
    termMonths: 24
  };

  beforeEach(async () => {
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getPolicyProducts', 'createPolicyProduct', 'deletePolicyProduct']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserValue']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PolicyListComponent, ReactiveFormsModule],
      providers: [
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyListComponent);
    component = fixture.componentInstance;
    mockPolicyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.policies).toEqual([]);
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.currentUser).toBeNull();
    expect(component.showAddForm).toBe(false);
  });

  it('should initialize form with required validators and default termMonths', () => {
    expect(component.addForm.get('code')?.hasError('required')).toBe(true);
    expect(component.addForm.get('title')?.hasError('required')).toBe(true);
    expect(component.addForm.get('description')?.hasError('required')).toBe(false); // Optional field
    expect(component.addForm.get('premium')?.hasError('required')).toBe(true);
    expect(component.addForm.get('termMonths')?.value).toBe(12);
  });

  it('should validate premium minimum value', () => {
    const premiumControl = component.addForm.get('premium');
    
    premiumControl?.setValue(0);
    expect(premiumControl?.hasError('min')).toBe(true);

    premiumControl?.setValue(1);
    expect(premiumControl?.hasError('min')).toBe(false);
  });

  it('should validate termMonths minimum value', () => {
    const termMonthsControl = component.addForm.get('termMonths');
    
    termMonthsControl?.setValue(0);
    expect(termMonthsControl?.hasError('min')).toBe(true);

    termMonthsControl?.setValue(1);
    expect(termMonthsControl?.hasError('min')).toBe(false);
  });

  it('should load policies on ngOnInit', () => {
    mockAuthService.getCurrentUserValue.and.returnValue(mockUser);
    mockPolicyService.getPolicyProducts.and.returnValue(of(mockPolicies));

    component.ngOnInit();

    expect(component.currentUser).toEqual(mockUser);
    expect(mockPolicyService.getPolicyProducts).toHaveBeenCalled();
  });

  it('should load policies successfully', () => {
    mockPolicyService.getPolicyProducts.and.returnValue(of(mockPolicies));

    component.loadPolicies();

    expect(component.policies).toEqual(mockPolicies);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle error when loading policies', () => {
    const error = { message: 'Failed to load policies' };
    mockPolicyService.getPolicyProducts.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.loadPolicies();

    expect(component.error).toBe('Failed to load policies. Please try again.');
    expect(component.loading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error loading policies:', error);
  });

  it('should return true for admin user', () => {
    component.currentUser = mockAdminUser;
    expect(component.isAdmin()).toBe(true);
  });

  it('should return false for non-admin user', () => {
    component.currentUser = mockUser;
    expect(component.isAdmin()).toBe(false);
  });

  it('should return false when no user', () => {
    component.currentUser = null;
    expect(component.isAdmin()).toBe(false);
  });

  it('should create policy when admin and form is valid', () => {
    const newPolicy = { ...mockCreatePolicyData, _id: '3', createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z', minSumInsured: 100000 };
    component.currentUser = mockAdminUser;
    mockPolicyService.createPolicyProduct.and.returnValue(of(newPolicy));
    mockPolicyService.getPolicyProducts.and.returnValue(of(mockPolicies));

    component.addForm.patchValue(mockCreatePolicyData);
    component.createPolicy();

    expect(mockPolicyService.createPolicyProduct).toHaveBeenCalledWith(mockCreatePolicyData);
    expect(component.addForm.get('termMonths')?.value).toBe(12); // Should reset to default
    expect(mockPolicyService.getPolicyProducts).toHaveBeenCalledTimes(1); // Once after create
  });

  it('should not create policy when not admin', () => {
    component.currentUser = mockUser;
    component.addForm.patchValue(mockCreatePolicyData);

    component.createPolicy();

    expect(mockPolicyService.createPolicyProduct).not.toHaveBeenCalled();
  });

  it('should not create policy when form is invalid', () => {
    component.currentUser = mockAdminUser;
    component.addForm.patchValue({
      code: '',
      title: '',
      description: '',
      premium: null,
      termMonths: 0
    });

    component.createPolicy();

    expect(mockPolicyService.createPolicyProduct).not.toHaveBeenCalled();
  });

  it('should handle error when creating policy', () => {
    const error = { error: { message: 'Policy code already exists' } };
    component.currentUser = mockAdminUser;
    mockPolicyService.createPolicyProduct.and.returnValue(throwError(() => error));

    component.addForm.patchValue(mockCreatePolicyData);
    component.createPolicy();

    expect(component.error).toBe('Policy code already exists');
  });

  it('should handle error without message when creating policy', () => {
    component.currentUser = mockAdminUser;
    mockPolicyService.createPolicyProduct.and.returnValue(throwError(() => ({})));

    component.addForm.patchValue(mockCreatePolicyData);
    component.createPolicy();

    expect(component.error).toBe('Failed to create policy.');
  });

  it('should toggle add form visibility', () => {
    expect(component.showAddForm).toBe(false);

    component.toggleAddForm();
    expect(component.showAddForm).toBe(true);

    component.toggleAddForm();
    expect(component.showAddForm).toBe(false);
  });

  it('should delete policy when admin and confirmed', () => {
    const productId = '1';
    component.currentUser = mockAdminUser;
    spyOn(window, 'confirm').and.returnValue(true);
    mockPolicyService.deletePolicyProduct.and.returnValue(of({ message: 'Policy deleted successfully' }));
    mockPolicyService.getPolicyProducts.and.returnValue(of(mockPolicies));

    component.deletePolicy(productId);

    expect(window.confirm).toHaveBeenCalledWith('Delete this policy product?');
    expect(mockPolicyService.deletePolicyProduct).toHaveBeenCalledWith(productId);
    expect(mockPolicyService.getPolicyProducts).toHaveBeenCalledTimes(1); // Once after delete
  });

  it('should not delete policy when not admin', () => {
    const productId = '1';
    component.currentUser = mockUser;

    component.deletePolicy(productId);

    expect(mockPolicyService.deletePolicyProduct).not.toHaveBeenCalled();
  });

  it('should not delete policy when not confirmed', () => {
    const productId = '1';
    component.currentUser = mockAdminUser;
    spyOn(window, 'confirm').and.returnValue(false);

    component.deletePolicy(productId);

    expect(window.confirm).toHaveBeenCalledWith('Delete this policy product?');
    expect(mockPolicyService.deletePolicyProduct).not.toHaveBeenCalled();
  });

  it('should handle error when deleting policy', () => {
    const productId = '1';
    const error = { error: { message: 'Policy not found' } };
    component.currentUser = mockAdminUser;
    spyOn(window, 'confirm').and.returnValue(true);
    mockPolicyService.deletePolicyProduct.and.returnValue(throwError(() => error));

    component.deletePolicy(productId);

    expect(component.error).toBe('Policy not found');
  });

  it('should handle error without message when deleting policy', () => {
    const productId = '1';
    component.currentUser = mockAdminUser;
    spyOn(window, 'confirm').and.returnValue(true);
    mockPolicyService.deletePolicyProduct.and.returnValue(throwError(() => ({})));

    component.deletePolicy(productId);

    expect(component.error).toBe('Failed to delete policy product.');
  });
});
