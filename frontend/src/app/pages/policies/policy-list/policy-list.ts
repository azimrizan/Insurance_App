import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PolicyService, PolicyProduct } from '../../../services/policy';
import { AuthService, User } from '../../../services/auth';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './policy-list.html',
  styleUrl: './policy-list.scss'
})
export class PolicyListComponent implements OnInit {
  policies: PolicyProduct[] = [];
  loading = true;
  error = '';
  currentUser: User | null = null;
  addForm: FormGroup;
  showAddForm = false;

  constructor(
    private policyService: PolicyService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.addForm = this.fb.group({
      code: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: [''],
      premium: [null, [Validators.required, Validators.min(1)]],
      termMonths: [12, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadPolicies();
  }

  loadPolicies() {
    this.loading = true;
    this.policyService.getPolicyProducts().subscribe({
      next: (policies) => {
        this.policies = policies;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load policies. Please try again.';
        this.loading = false;
        console.error('Error loading policies:', error);
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  createPolicy() {
    if (!this.isAdmin() || this.addForm.invalid) return;
    this.policyService.createPolicyProduct(this.addForm.value).subscribe({
      next: (p) => {
        this.addForm.reset({ termMonths: 12 });
        this.loadPolicies();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create policy.';
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  deletePolicy(productId: string) {
    if (!this.isAdmin()) return;
    if (!confirm('Delete this policy product?')) return;
    this.policyService.deletePolicyProduct(productId).subscribe({
      next: () => this.loadPolicies(),
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete policy product.';
      }
    });
  }
}
