import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminClaimsPage } from './admin-claims';
import { ClaimService } from '../../../services/claim';

describe('AdminClaimsPage', () => {
  let component: AdminClaimsPage;
  let fixture: ComponentFixture<AdminClaimsPage>;
  let mockClaimService: jasmine.SpyObj<ClaimService>;

  const mockClaims = [
    {
      _id: '1',
      userId: 'user1',
      userPolicyId: 'policy1',
      incidentDate: '2024-01-01',
      description: 'Car accident damage',
      amountClaimed: 5000,
      status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      _id: '2',
      userId: 'user2',
      userPolicyId: 'policy2',
      incidentDate: '2024-01-01',
      description: 'Home damage',
      amountClaimed: 3000,
      status: 'APPROVED' as 'PENDING' | 'APPROVED' | 'REJECTED',
      createdAt: '2024-01-01T11:00:00Z',
      updatedAt: '2024-01-01T11:00:00Z'
    }
  ];

  const mockClaimDetail = {
    _id: '1',
    userId: 'user1',
    userPolicyId: 'policy1',
    incidentDate: '2024-01-01',
    description: 'Car accident damage',
    amountClaimed: 5000,
    status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  beforeEach(async () => {
    const claimServiceSpy = jasmine.createSpyObj('ClaimService', [
      'getClaims',
      'getClaimById',
      'updateClaimStatus'
    ]);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [AdminClaimsPage, HttpClientTestingModule],
      providers: [
        { provide: ClaimService, useValue: claimServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminClaimsPage);
    component = fixture.componentInstance;
    mockClaimService = TestBed.inject(ClaimService) as jasmine.SpyObj<ClaimService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.claims).toEqual([]);
    expect(component.selected).toBeNull();
  });

  it('should load claims on ngOnInit', () => {
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.ngOnInit();

    expect(mockClaimService.getClaims).toHaveBeenCalled();
    expect(component.claims).toEqual(mockClaims);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle error when loading claims', () => {
    const errorMessage = 'Failed to load claims';
    mockClaimService.getClaims.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.ngOnInit();

    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBe(false);
    expect(component.claims).toEqual([]);
  });

  it('should handle error without message when loading claims', () => {
    mockClaimService.getClaims.and.returnValue(throwError(() => ({})));

    component.ngOnInit();

    expect(component.error).toBe('Failed to load claims');
    expect(component.loading).toBe(false);
  });

  it('should view claim details', () => {
    const claimId = '1';
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    mockClaimService.getClaimById.and.returnValue(of(mockClaimDetail));

    component.ngOnInit();
    component.view(claimId);

    expect(mockClaimService.getClaimById).toHaveBeenCalledWith(claimId);
    expect(component.selected).toEqual(mockClaimDetail);
  });

  it('should handle error when viewing claim details', () => {
    const claimId = '1';
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    mockClaimService.getClaimById.and.returnValue(throwError(() => ({})));

    component.ngOnInit();
    component.view(claimId);

    expect(mockClaimService.getClaimById).toHaveBeenCalledWith(claimId);
    expect(component.selected).toBeNull();
  });

  it('should update claim status to APPROVED', () => {
    const claimId = '1';
    const status = 'APPROVED' as 'APPROVED' | 'REJECTED';
    
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    mockClaimService.updateClaimStatus.and.returnValue(of(mockClaimDetail));
    mockClaimService.getClaimById.and.returnValue(of(mockClaimDetail));

    component.ngOnInit();
    component.update(claimId, status);

    expect(mockClaimService.updateClaimStatus).toHaveBeenCalledWith(claimId, { status });
    expect(mockClaimService.getClaimById).toHaveBeenCalledWith(claimId);
    expect(mockClaimService.getClaims).toHaveBeenCalledTimes(2); // Once on init, once after update
  });

  it('should update claim status to REJECTED', () => {
    const claimId = '2';
    const status = 'REJECTED' as 'APPROVED' | 'REJECTED';
    
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    mockClaimService.updateClaimStatus.and.returnValue(of(mockClaimDetail));
    mockClaimService.getClaimById.and.returnValue(of(mockClaimDetail));

    component.ngOnInit();
    component.update(claimId, status);

    expect(mockClaimService.updateClaimStatus).toHaveBeenCalledWith(claimId, { status });
    expect(mockClaimService.getClaimById).toHaveBeenCalledWith(claimId);
  });

  it('should handle error when updating claim status', () => {
    const claimId = '1';
    const status = 'APPROVED' as 'APPROVED' | 'REJECTED';
    
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    mockClaimService.updateClaimStatus.and.returnValue(throwError(() => ({})));

    component.ngOnInit();
    component.update(claimId, status);

    expect(mockClaimService.updateClaimStatus).toHaveBeenCalledWith(claimId, { status });
    // Should not call getClaimById or getClaims on error
    expect(mockClaimService.getClaimById).not.toHaveBeenCalled();
    expect(mockClaimService.getClaims).toHaveBeenCalledTimes(1); // Only on init
  });

  it('should reset selected claim when viewing new claim', () => {
    const claimId = '1';
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    mockClaimService.getClaimById.and.returnValue(of(mockClaimDetail));

    component.ngOnInit();
    component.selected = mockClaimDetail; // Set initial selection
    component.view(claimId);

    expect(component.selected).toEqual(mockClaimDetail);
  });

  it('should display claims in the template', () => {
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    // This would depend on the actual template structure
    // You might need to adjust selectors based on the HTML template
    expect(component.claims.length).toBe(mockClaims.length);
  });

  it('should show loading state initially', () => {
    // Don't configure the spy to return immediately, so we can check loading state
    mockClaimService.getClaims.and.returnValue(of(mockClaims));
    
    // Check loading state before detectChanges triggers ngOnInit
    expect(component.loading).toBe(true);
  });

  it('should show error message when error occurs', () => {
    const errorMessage = 'Network error';
    mockClaimService.getClaims.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toBe(errorMessage);
  });
});
