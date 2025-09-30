import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AuditLog } from '../../../services/admin';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-audit.html',
  styleUrls: ['./admin-audit.scss']
})
export class AdminAuditPage implements OnInit {
  logs: AuditLog[] = [];
  loading = true;
  error = '';

  constructor(private admin: AdminService, public authService: AuthService) {}

  ngOnInit(): void {
    this.admin.getAuditLogs().subscribe({
      next: (l) => { this.logs = l; this.loading = false; },
      error: (e) => { this.error = e.error?.message || 'Failed to load audit logs'; this.loading = false; }
    });
  }
}


