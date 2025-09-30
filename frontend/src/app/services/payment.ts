import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Payment {
  _id: string;
  userId: string;
  userPolicyId?: string;
  amount: number;
  method: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordPaymentRequest {
  policyId?: string;
  amount: number;
  method: string;
  reference: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) { }

  // Record a payment
  recordPayment(paymentData: RecordPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${environment.apiUrl}/payments`, paymentData);
  }

  // Get user's payments
  getUserPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${environment.apiUrl}/payments/user`);
  }
}
