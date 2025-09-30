import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Claim {
  _id: string;
  userId: string;
  userPolicyId: string;
  incidentDate: string;
  description: string;
  amountClaimed: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decisionNotes?: string;
  decidedByAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitClaimRequest {
  policyId: string;
  incidentDate: string;
  description: string;
  amount: number;
}

export interface UpdateClaimStatusRequest {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService {

  constructor(private http: HttpClient) { }

  // Submit a new claim
  submitClaim(claimData: SubmitClaimRequest): Observable<Claim> {
    return this.http.post<Claim>(`${environment.apiUrl}/claims`, claimData);
  }

  // Get all claims (for admin/agent) or user's claims
  getClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${environment.apiUrl}/claims`);
  }

  // Get claim by ID
  getClaimById(id: string): Observable<Claim> {
    return this.http.get<Claim>(`${environment.apiUrl}/claims/${id}`);
  }

  // Update claim status (admin/agent only)
  updateClaimStatus(claimId: string, statusData: UpdateClaimStatusRequest): Observable<Claim> {
    return this.http.put<Claim>(`${environment.apiUrl}/claims/${claimId}/status`, statusData);
  }
}
