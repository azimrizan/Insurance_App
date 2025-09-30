import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Claim } from './claim';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  constructor(private http: HttpClient) { }

  // Get assigned users
  getAssignedUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/agent/assigned-users`);
  }

  // Get claims assigned to agent
  getAssignedClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${environment.apiUrl}/agent/claims`);
  }

  // Update claim status
  updateClaimStatus(claimId: string, status: string, notes?: string): Observable<Claim> {
    return this.http.put<Claim>(`${environment.apiUrl}/agent/claims/${claimId}`, {
      status,
      notes
    });
  }
}
