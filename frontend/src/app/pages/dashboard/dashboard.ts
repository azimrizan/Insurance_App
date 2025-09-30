import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth';
import { PolicyService, UserPolicy } from '../../services/policy';
import { ClaimService, Claim } from '../../services/claim';
import { PaymentService, Payment } from '../../services/payment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userPolicies: UserPolicy[] = [];
  recentClaims: Claim[] = [];
  recentPayments: Payment[] = [];
  loading = true;

  constructor(
    public authService: AuthService,
    private policyService: PolicyService,
    private claimService: ClaimService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load user policies
    this.policyService.getUserPolicies().subscribe({
      next: (policies) => {
        this.userPolicies = policies;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading policies:', error);
        this.loading = false;
      }
    });

    // Load recent claims
    this.claimService.getClaims().subscribe({
      next: (claims) => {
        this.recentClaims = claims.slice(0, 5); // Show only recent 5
      },
      error: (error) => {
        console.error('Error loading claims:', error);
      }
    });

    // Load recent payments
    this.paymentService.getUserPayments().subscribe({
      next: (payments) => {
        this.recentPayments = payments.slice(0, 5); // Show only recent 5
      },
      error: (error) => {
        console.error('Error loading payments:', error);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getActivePoliciesCount(): number {
    return this.userPolicies.filter(p => p.status === 'ACTIVE').length;
  }

  getPendingClaimsCount(): number {
    return this.recentClaims.filter(c => c.status === 'PENDING').length;
  }
}
