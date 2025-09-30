import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminSummary } from '../../../services/admin';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-summary.html',
  styleUrls: ['./admin-summary.scss']
})
export class AdminSummaryPage implements OnInit {
  summary: AdminSummary | null = null;
  loading = true;
  error = '';

  constructor(private admin: AdminService, public authService: AuthService) {}

  ngOnInit(): void {
    // Set some default data first
    this.summary = {
      users: 0,
      policiesSold: 0,
      claimsPending: 0,
      totalPayments: 0
    };
    this.loading = false;

    // Then try to load real data
    this.admin.getSummary().subscribe({
      next: (s) => { 
        this.summary = s; 
        this.loading = false; 
      },
      error: (e) => { 
        this.error = e.error?.message || 'Failed to load summary'; 
        this.loading = false; 
      }
    });
  }
}


