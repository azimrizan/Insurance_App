import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService, Payment, RecordPaymentRequest } from '../../../services/payment';
import { AuthService, User } from '../../../services/auth';
import { PolicyService, UserPolicy } from '../../../services/policy';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.scss'
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  loading = true;
  error = '';
  currentUser: User | null = null;
  payForm: FormGroup;
  policies: UserPolicy[] = [];

  constructor(
    private paymentService: PaymentService,
    private policyService: PolicyService,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.payForm = this.fb.group({
      policyId: ['', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(1)]],
      method: ['SIMULATED', [Validators.required]],
      reference: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadPayments();
    this.loadPolicies();
  }

  loadPayments() {
    this.loading = true;
    this.paymentService.getUserPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load payments. Please try again.';
        this.loading = false;
        console.error('Error loading payments:', error);
      }
    });
  }

  loadPolicies() {
    this.policyService.getUserPolicies().subscribe({
      next: (policies) => { this.policies = policies; },
      error: () => { /* non-blocking */ }
    });
  }

  submitPayment() {
    if (this.payForm.invalid) return;
    const data: RecordPaymentRequest = this.payForm.value;
    this.paymentService.recordPayment(data).subscribe({
      next: (p) => {
        this.payForm.reset({ method: 'SIMULATED' });
        this.loadPayments();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to record payment.';
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getTotalAmount(): number {
    return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  getAverageAmount(): number {
    return this.payments.length > 0 ? this.getTotalAmount() / this.payments.length : 0;
  }
}
