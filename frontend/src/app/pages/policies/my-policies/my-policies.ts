import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyService, UserPolicy } from '../../../services/policy';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-my-policies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-policies.html',
  styleUrl: './my-policies.scss'
})
export class MyPoliciesComponent implements OnInit {
  loading = true;
  error = '';
  policies: UserPolicy[] = [];

  constructor(private policyService: PolicyService, public authService: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.policyService.getUserPolicies().subscribe({
      next: (items) => { this.policies = items; this.loading = false; },
      error: (err) => { this.error = err.error?.message || 'Failed to load policies'; this.loading = false; }
    });
  }

  cancel(policyId: string) {
    if (!confirm('Cancel this policy?')) return;
    this.policyService.cancelPolicy(policyId).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err.error?.message || 'Failed to cancel policy'; }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'badge-success';
      case 'CANCELLED':
        return 'badge-error';
      case 'EXPIRED':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  }
}


