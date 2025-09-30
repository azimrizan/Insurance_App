import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AgentService } from './agent';
import { Claim } from './claim';
import { environment } from '../../environments/environment';

describe('AgentService', () => {
  let service: AgentService;
  let httpMock: HttpTestingController;

  const mockAssignedUsers = [
    {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
      policies: ['policy1', 'policy2']
    },
    {
      _id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'USER',
      policies: ['policy3']
    }
  ];

  const mockAssignedClaims: Claim[] = [
    {
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
    },
    {
      _id: '2',
      userId: 'user2',
      userPolicyId: 'policy3',
      incidentDate: '2024-01-02T00:00:00Z',
      description: 'Home damage',
      amountClaimed: 3000,
      status: 'PENDING',
      decisionNotes: undefined,
      decidedByAgentId: undefined,
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    }
  ];

  const mockUpdatedClaim: Claim = {
    _id: '1',
    userId: 'user1',
    userPolicyId: 'policy1',
    incidentDate: '2024-01-01T00:00:00Z',
    description: 'Car accident damage',
    amountClaimed: 5000,
    status: 'APPROVED',
    decisionNotes: 'Approved after review',
    decidedByAgentId: 'agent1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AgentService]
    });
    service = TestBed.inject(AgentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAssignedUsers', () => {
    it('should get assigned users', () => {
      service.getAssignedUsers().subscribe(users => {
        expect(users).toEqual(mockAssignedUsers);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/assigned-users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAssignedUsers);
    });

    it('should handle getAssignedUsers error', () => {
      service.getAssignedUsers().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/assigned-users`);
      req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should return empty array when no assigned users', () => {
      service.getAssignedUsers().subscribe(users => {
        expect(users).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/assigned-users`);
      req.flush([]);
    });

    it('should handle different HTTP status codes for getAssignedUsers', () => {
      const statusCodes = [200, 401, 403, 404, 500];
      
      statusCodes.forEach(status => {
        service.getAssignedUsers().subscribe({
          next: (users) => {
            if (status === 200) {
              expect(users).toEqual(mockAssignedUsers);
            } else {
              fail('Should have failed for non-200 status');
            }
          },
          error: (error) => {
            if (status !== 200) {
              expect(error.status).toBe(status);
            } else {
              fail('Should not have failed for 200 status');
            }
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/agent/assigned-users`);
        if (status === 200) {
          req.flush(mockAssignedUsers);
        } else {
          req.flush({ error: 'Error' }, { status, statusText: 'Error' });
        }
      });
    });
  });

  describe('getAssignedClaims', () => {
    it('should get assigned claims', () => {
      service.getAssignedClaims().subscribe(claims => {
        expect(claims).toEqual(mockAssignedClaims);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAssignedClaims);
    });

    it('should handle getAssignedClaims error', () => {
      service.getAssignedClaims().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims`);
      req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should return empty array when no assigned claims', () => {
      service.getAssignedClaims().subscribe(claims => {
        expect(claims).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims`);
      req.flush([]);
    });

    it('should handle different HTTP status codes for getAssignedClaims', () => {
      const statusCodes = [200, 401, 403, 404, 500];
      
      statusCodes.forEach(status => {
        service.getAssignedClaims().subscribe({
          next: (claims) => {
            if (status === 200) {
              expect(claims).toEqual(mockAssignedClaims);
            } else {
              fail('Should have failed for non-200 status');
            }
          },
          error: (error) => {
            if (status !== 200) {
              expect(error.status).toBe(status);
            } else {
              fail('Should not have failed for 200 status');
            }
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims`);
        if (status === 200) {
          req.flush(mockAssignedClaims);
        } else {
          req.flush({ error: 'Error' }, { status, statusText: 'Error' });
        }
      });
    });
  });

  describe('updateClaimStatus', () => {
    it('should update claim status to APPROVED', () => {
      const claimId = '1';
      const status = 'APPROVED';
      const notes = 'Approved after review';

      service.updateClaimStatus(claimId, status, notes).subscribe(claim => {
        expect(claim).toEqual(mockUpdatedClaim);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims/${claimId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status, notes });
      req.flush(mockUpdatedClaim);
    });

    it('should update claim status to REJECTED', () => {
      const claimId = '1';
      const status = 'REJECTED';
      const notes = 'Rejected due to insufficient evidence';
      const rejectedClaim = { ...mockUpdatedClaim, status: 'REJECTED' as const, decisionNotes: notes };

      service.updateClaimStatus(claimId, status, notes).subscribe(claim => {
        expect(claim).toEqual(rejectedClaim);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims/${claimId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status, notes });
      req.flush(rejectedClaim);
    });

    it('should update claim status without notes', () => {
      const claimId = '1';
      const status = 'APPROVED';
      const claimWithoutNotes = { ...mockUpdatedClaim, decisionNotes: undefined };

      service.updateClaimStatus(claimId, status).subscribe(claim => {
        expect(claim).toEqual(claimWithoutNotes);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims/${claimId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status, notes: undefined });
      req.flush(claimWithoutNotes);
    });

    it('should handle updateClaimStatus error', () => {
      const claimId = '999';
      const status = 'APPROVED';

      service.updateClaimStatus(claimId, status).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims/${claimId}`);
      req.flush({ error: 'Claim not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle updateClaimStatus with different statuses', () => {
      const claimId = '1';
      const statuses = ['APPROVED', 'REJECTED', 'PENDING'];
      
      statuses.forEach(status => {
        const updatedClaim = { ...mockUpdatedClaim, status: status as any };
        service.updateClaimStatus(claimId, status).subscribe(claim => {
          expect(claim).toEqual(updatedClaim);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims/${claimId}`);
        expect(req.request.body).toEqual({ status, notes: undefined });
        req.flush(updatedClaim);
      });
    });

    it('should handle updateClaimStatus with different HTTP status codes', () => {
      const claimId = '1';
      const status = 'APPROVED';
      const statusCodes = [200, 400, 401, 403, 404, 500];
      
      statusCodes.forEach(httpStatus => {
        service.updateClaimStatus(claimId, status).subscribe({
          next: (claim) => {
            if (httpStatus === 200) {
              expect(claim).toEqual(mockUpdatedClaim);
            } else {
              fail('Should have failed for non-200 status');
            }
          },
          error: (error) => {
            if (httpStatus !== 200) {
              expect(error.status).toBe(httpStatus);
            } else {
              fail('Should not have failed for 200 status');
            }
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/agent/claims/${claimId}`);
        if (httpStatus === 200) {
          req.flush(mockUpdatedClaim);
        } else {
          req.flush({ error: 'Error' }, { status: httpStatus, statusText: 'Error' });
        }
      });
    });
  });
});
