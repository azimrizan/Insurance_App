import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClaimService, Claim } from '../../../services/claim';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-claims',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-claims.html',
  styleUrls: ['./admin-claims.scss']
})
export class AdminClaimsPage implements OnInit {
  claims: Claim[] = [];
  selected: Claim | null = null;
  loading = true;
  error = '';

  constructor(private claimService: ClaimService, public authService: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.claimService.getClaims().subscribe({
      next: (items) => { this.claims = items; this.loading = false; },
      error: (err) => { this.error = err.error?.message || 'Failed to load claims'; this.loading = false; }
    });
  }

  view(id: string) {
    this.selected = null;
    this.claimService.getClaimById(id).subscribe({
      next: (c) => this.selected = c,
      error: () => {}
    });
  }

  update(id: string, status: 'APPROVED' | 'REJECTED') {
    this.claimService.updateClaimStatus(id, { status }).subscribe({
      next: () => { this.view(id); this.load(); },
      error: () => {}
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'badge-success';
      case 'REJECTED':
        return 'badge-error';
      case 'PENDING':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  }
}


