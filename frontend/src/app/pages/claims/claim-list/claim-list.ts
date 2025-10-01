import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClaimService, Claim, SubmitClaimRequest } from '../../../services/claim';
import { AuthService, User } from '../../../services/auth';
import { PolicyService, UserPolicy } from '../../../services/policy';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './claim-list.html',
  styleUrl: './claim-list.scss'
})
export class ClaimListComponent implements OnInit {
  claims: Claim[] = [];
  loading = true;
  error = '';
  currentUser: User | null = null;
  submitForm: FormGroup;
  policies: UserPolicy[] = [];

  constructor(
    private claimService: ClaimService,
    private policyService: PolicyService,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.submitForm = this.fb.group({
      policyId: ['', [Validators.required]],
      incidentDate: ['', [Validators.required]],
      description: ['', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadClaims();
    this.loadPolicies();
  }

  loadClaims() {
    this.loading = true;
    this.claimService.getClaims().subscribe({
      next: (claims) => {
        this.claims = claims;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load claims. Please try again.';
        this.loading = false;
        console.error('Error loading claims:', error);
      }
    });
  }

  loadPolicies() {
    this.policyService.getUserPolicies().subscribe({
      next: (policies) => { this.policies = policies; },
      error: () => { /* non-blocking */ }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  submitClaim() {
    if (this.submitForm.invalid) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }
    
    this.error = ''; // Clear previous errors
    const data: SubmitClaimRequest = this.submitForm.value;
    
    this.claimService.submitClaim(data).subscribe({
      next: (claim) => {
        this.submitForm.reset();
        this.loadClaims();
        this.error = ''; // Clear any previous errors
      },
      error: (err) => {
        console.error('Claim submission error:', err);
        this.error = err.error?.message || err.message || 'Failed to submit claim. Please try again.';
      }
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'badge badge-pending';
      case 'APPROVED':
        return 'badge badge-approved';
      case 'REJECTED':
        return 'badge badge-rejected';
      default:
        return 'badge';
    }
  }

  updateStatus(claimId: string, status: 'APPROVED' | 'REJECTED') {
    this.claimService.updateClaimStatus(claimId, { status }).subscribe({
      next: () => this.loadClaims(),
      error: (err) => console.error('Failed to update claim', err)
    });
  }
}
