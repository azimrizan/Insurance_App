import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PolicyProduct {
  _id: string;
  code: string;
  title: string;
  description: string;
  premium: number;
  termMonths: number;
  minSumInsured: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPolicy {
  _id: string;
  userId: string;
  policyProductId: PolicyProduct;
  startDate: string;
  endDate: string;
  premiumPaid: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  assignedAgentId?: string;
  nominee?: {
    name: string;
    relation: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PurchasePolicyRequest {
  startDate?: string;
  termMonths?: number;
  nominee?: {
    name: string;
    relation: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  constructor(private http: HttpClient) { }

  // Get all available policy products
  getPolicyProducts(): Observable<PolicyProduct[]> {
    return this.http.get<PolicyProduct[]>(`${environment.apiUrl}/policies`);
  }

  // Get policy product by ID
  getPolicyProductById(id: string): Observable<PolicyProduct> {
    return this.http.get<PolicyProduct>(`${environment.apiUrl}/policies/${id}`);
  }

  // Create new policy product (admin only)
  createPolicyProduct(policyData: Partial<PolicyProduct>): Observable<PolicyProduct> {
    return this.http.post<PolicyProduct>(`${environment.apiUrl}/policies`, policyData);
  }

  // Delete policy product (admin only)
  deletePolicyProduct(policyId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/policies/${policyId}`);
  }

  // Purchase a policy
  purchasePolicy(policyId: string, purchaseData: PurchasePolicyRequest): Observable<UserPolicy> {
    return this.http.post<UserPolicy>(`${environment.apiUrl}/policies/${policyId}/purchase`, purchaseData);
  }

  // Get user's policies
  getUserPolicies(): Observable<UserPolicy[]> {
    return this.http.get<UserPolicy[]>(`${environment.apiUrl}/policies/user/me`);
  }

  // Cancel a policy
  cancelPolicy(policyId: string): Observable<UserPolicy> {
    return this.http.put<UserPolicy>(`${environment.apiUrl}/policies/user/${policyId}/cancel`, {});
  }
}
