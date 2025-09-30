import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ClaimListComponent } from './claim-list';
import { ClaimService, Claim, SubmitClaimRequest } from '../../../services/claim';
import { AuthService, User } from '../../../services/auth';
import { PolicyService, UserPolicy } from '../../../services/policy';

describe('ClaimListComponent', () => {
  let component: ClaimListComponent;
  let fixture: ComponentFixture<ClaimListComponent>;
  let mockClaimService: jasmine.SpyObj<ClaimService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;

  const mockUser: User = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  };

  const mockClaims: Claim[] = [
    {
      _id: '1',
      userId: '1',
      userPolicyId: 'policy1',
      incidentDate: '2024-01-01T00:00:00Z',
      description: 'Car accident damage',
      amountClaimed: 5000,
      status: 'PENDING',
      decisionNotes: undefined,
      decidedByAgentId: undefined,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      _id: '2',
      userId: '1',
      userPolicyId: 'policy2',
      incidentDate: '2024-01-02T00:00:00Z',
      description: 'Home damage',
      amountClaimed: 3000,
      status: 'APPROVED',
      decisionNotes: 'Approved after review',
      decidedByAgentId: 'agent1',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T11:00:00Z'
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

  const mockSubmitClaimRequest: SubmitClaimRequest = {
    policyId: 'policy1',
    incidentDate: '2024-01-01T00:00:00Z',
    description: 'Car accident damage',
    amount: 5000
  };

  beforeEach(async () => {
    const claimServiceSpy = jasmine.createSpyObj('ClaimService', ['getClaims', 'submitClaim', 'updateClaimStatus']);
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
      imports: [ClaimListComponent, ReactiveFormsModule],
      providers: [
        { provide: ClaimService, useValue: claimServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimListComponent);
    component = fixture.componentInstance;
    mockClaimService = TestBed.inject(ClaimService) as jasmine.SpyObj<ClaimService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockPolicyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.claims).toEqual([]);
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.currentUser).toBeNull();
    expect(component.policies).toEqual([]);
  });

  it('should initialize form with required validators', () => {
    expect(component.submitForm.get('policyId')?.hasError('required')).toBe(true);
    expect(component.submitForm.get('incidentDate')?.hasError('required')).toBe(true);
    expect(component.submitForm.get('description')?.hasError('required')).toBe(true);
    expect(component.submitForm.get('amount')?.hasError('required')).toBe(true);
  });

  it('should validate amount minimum value', () => {
    const amountControl = component.submitForm.get('amount');
    
    amountControl?.setValue(0);
    expect(amountControl?.hasError('min')).toBe(true);

    amountControl?.setValue(1);
    expect(amountControl?.hasError('min')).toBe(false);
  });

  it('should load claims and policies on ngOnInit', () => {
    mockAuthService.getCurrentUserValue.and.returnValue(mockUser);
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    mockPolicyService.getUserPolicies.and.returnValue(of(mockPolicies));

    component.ngOnInit();

    expect(component.currentUser).toEqual(mockUser);
    expect(mockClaimService.getClaims).toHaveBeenCalled();
    expect(mockPolicyService.getUserPolicies).toHaveBeenCalled();
  });

  it('should load claims successfully', () => {
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.loadClaims();

    expect(component.claims).toEqual(mockClaims);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle error when loading claims', () => {
    const error = { message: 'Failed to load claims' };
    mockClaimService.getClaims.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.loadClaims();

    expect(component.error).toBe('Failed to load claims. Please try again.');
    expect(component.loading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error loading claims:', error);
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

  it('should submit claim with valid form data', () => {
    const newClaim = { ...mockClaims[0], _id: '3' };
    mockClaimService.submitClaim.and.returnValue(of(newClaim));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.submitForm.patchValue(mockSubmitClaimRequest);
    component.submitClaim();

    expect(mockClaimService.submitClaim).toHaveBeenCalledWith(mockSubmitClaimRequest);
    expect(component.submitForm.pristine).toBe(true); // Form should be reset
    expect(mockClaimService.getClaims).toHaveBeenCalledTimes(1); // Once after submit
  });

  it('should not submit claim with invalid form data', () => {
    component.submitForm.patchValue({
      policyId: '',
      incidentDate: '',
      description: '',
      amount: null
    });

    component.submitClaim();

    expect(mockClaimService.submitClaim).not.toHaveBeenCalled();
  });

  it('should handle error when submitting claim', () => {
    const error = { error: { message: 'Invalid claim data' } };
    mockClaimService.submitClaim.and.returnValue(throwError(() => error));

    component.submitForm.patchValue(mockSubmitClaimRequest);
    component.submitClaim();

    expect(component.error).toBe('Invalid claim data');
  });

  it('should handle error without message when submitting claim', () => {
    mockClaimService.submitClaim.and.returnValue(throwError(() => ({})));

    component.submitForm.patchValue(mockSubmitClaimRequest);
    component.submitClaim();

    expect(component.error).toBe('Failed to submit claim.');
  });

  it('should return correct status class for PENDING', () => {
    const statusClass = component.statusClass('PENDING');
    expect(statusClass).toBe('badge badge-pending');
  });

  it('should return correct status class for APPROVED', () => {
    const statusClass = component.statusClass('APPROVED');
    expect(statusClass).toBe('badge badge-approved');
  });

  it('should return correct status class for REJECTED', () => {
    const statusClass = component.statusClass('REJECTED');
    expect(statusClass).toBe('badge badge-rejected');
  });

  it('should return default status class for unknown status', () => {
    const statusClass = component.statusClass('UNKNOWN');
    expect(statusClass).toBe('badge');
  });

  it('should update claim status to APPROVED', () => {
    const claimId = '1';
    mockClaimService.updateClaimStatus.and.returnValue(of(mockClaims[0]));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.updateStatus(claimId, 'APPROVED');

    expect(mockClaimService.updateClaimStatus).toHaveBeenCalledWith(claimId, { status: 'APPROVED' });
    expect(mockClaimService.getClaims).toHaveBeenCalledTimes(1); // Once after update
  });

  it('should update claim status to REJECTED', () => {
    const claimId = '1';
    mockClaimService.updateClaimStatus.and.returnValue(of(mockClaims[0]));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.updateStatus(claimId, 'REJECTED');

    expect(mockClaimService.updateClaimStatus).toHaveBeenCalledWith(claimId, { status: 'REJECTED' });
  });

  it('should handle error when updating claim status', () => {
    const claimId = '1';
    const error = { message: 'Failed to update claim' };
    mockClaimService.updateClaimStatus.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.updateStatus(claimId, 'APPROVED');

    expect(console.error).toHaveBeenCalledWith('Failed to update claim', error);
  });
});
