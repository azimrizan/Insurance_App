import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PolicyService, PolicyProduct, PurchasePolicyRequest } from '../../../services/policy';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './policy-detail.html',
  styleUrl: './policy-detail.scss'
})
export class PolicyDetailComponent implements OnInit {
  policy: PolicyProduct | null = null;
  loading = true;
  purchasing = false;
  error = '';
  success = '';

  purchaseForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.purchaseForm = this.fb.group({
      startDate: ['', [Validators.required]],
      termMonths: ['', [Validators.required, Validators.min(1)]],
      nomineeName: ['', [Validators.required]],
      nomineeRelation: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    const policyId = this.route.snapshot.paramMap.get('id');
    if (policyId) {
      this.loadPolicy(policyId);
    }
  }

  loadPolicy(id: string) {
    this.loading = true;
    this.policyService.getPolicyProductById(id).subscribe({
      next: (policy) => {
        this.policy = policy;
        this.loading = false;
        // Set default values
        this.purchaseForm.patchValue({
          termMonths: policy.termMonths,
          startDate: new Date().toISOString().split('T')[0]
        });
      },
      error: (error) => {
        this.error = 'Failed to load policy details. Please try again.';
        this.loading = false;
        console.error('Error loading policy:', error);
      }
    });
  }

  onPurchase() {
    if (this.purchaseForm.valid && this.policy) {
      this.purchasing = true;
      this.error = '';
      this.success = '';

      const purchaseData: PurchasePolicyRequest = {
        startDate: this.purchaseForm.value.startDate,
        termMonths: this.purchaseForm.value.termMonths,
        nominee: {
          name: this.purchaseForm.value.nomineeName,
          relation: this.purchaseForm.value.nomineeRelation
        }
      };

      this.policyService.purchasePolicy(this.policy._id, purchaseData).subscribe({
        next: (userPolicy) => {
          this.purchasing = false;
          this.success = 'Policy purchased successfully!';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: (error) => {
          this.purchasing = false;
          this.error = error.error?.message || 'Failed to purchase policy. Please try again.';
        }
      });
    }
  }
}
