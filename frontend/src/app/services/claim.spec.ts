import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ClaimService, Claim, SubmitClaimRequest, UpdateClaimStatusRequest } from './claim';
import { environment } from '../../environments/environment';

describe('ClaimService', () => {
  let service: ClaimService;
  let httpMock: HttpTestingController;

  const mockClaim: Claim = {
    _id: '1',
    userId: 'user1',
    userPolicyId: 'policy1',
    incidentDate: '2024-01-01T00:00:00Z',
    description: 'Car accident damage',
    amountClaimed: 5000,
    status: 'PENDING',
    decisionNotes: undefined,
    decidedByAgentId: undefined,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  const mockClaims: Claim[] = [
    mockClaim,
    {
      _id: '2',
      userId: 'user2',
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

  const mockSubmitClaimRequest: SubmitClaimRequest = {
    policyId: 'policy1',
    incidentDate: '2024-01-01T00:00:00Z',
    description: 'Car accident damage',
    amount: 5000
  };

  const mockUpdateClaimStatusRequest: UpdateClaimStatusRequest = {
    status: 'APPROVED',
    notes: 'Approved after review'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimService]
    });
    service = TestBed.inject(ClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('submitClaim', () => {
    it('should submit a new claim', () => {
      service.submitClaim(mockSubmitClaimRequest).subscribe(claim => {
        expect(claim).toEqual(mockClaim);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockSubmitClaimRequest);
      req.flush(mockClaim);
    });

    it('should handle submitClaim error', () => {
      service.submitClaim(mockSubmitClaimRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims`);
      req.flush({ error: 'Invalid claim data' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getClaims', () => {
    it('should get all claims', () => {
      service.getClaims().subscribe(claims => {
        expect(claims).toEqual(mockClaims);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClaims);
    });

    it('should handle getClaims error', () => {
      service.getClaims().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims`);
      req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getClaimById', () => {
    it('should get claim by ID', () => {
      const claimId = '1';
      service.getClaimById(claimId).subscribe(claim => {
        expect(claim).toEqual(mockClaim);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims/${claimId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClaim);
    });

    it('should handle getClaimById error', () => {
      const claimId = '999';
      service.getClaimById(claimId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims/${claimId}`);
      req.flush({ error: 'Claim not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateClaimStatus', () => {
    it('should update claim status', () => {
      const claimId = '1';
      const updatedClaim = { ...mockClaim, status: 'APPROVED' as const, decisionNotes: 'Approved after review' };

      service.updateClaimStatus(claimId, mockUpdateClaimStatusRequest).subscribe(claim => {
        expect(claim).toEqual(updatedClaim);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims/${claimId}/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUpdateClaimStatusRequest);
      req.flush(updatedClaim);
    });

    it('should handle updateClaimStatus error', () => {
      const claimId = '1';

      service.updateClaimStatus(claimId, mockUpdateClaimStatusRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims/${claimId}/status`);
      req.flush({ error: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });

    it('should update claim status to REJECTED', () => {
      const claimId = '1';
      const rejectRequest: UpdateClaimStatusRequest = {
        status: 'REJECTED',
        notes: 'Claim rejected due to insufficient evidence'
      };
      const updatedClaim = { ...mockClaim, status: 'REJECTED' as const, decisionNotes: 'Claim rejected due to insufficient evidence' };

      service.updateClaimStatus(claimId, rejectRequest).subscribe(claim => {
        expect(claim).toEqual(updatedClaim);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims/${claimId}/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(rejectRequest);
      req.flush(updatedClaim);
    });

    it('should update claim status without notes', () => {
      const claimId = '1';
      const updateRequest: UpdateClaimStatusRequest = {
        status: 'APPROVED'
      };
      const updatedClaim = { ...mockClaim, status: 'APPROVED' as const };

      service.updateClaimStatus(claimId, updateRequest).subscribe(claim => {
        expect(claim).toEqual(updatedClaim);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/claims/${claimId}/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(updatedClaim);
    });
  });
});
