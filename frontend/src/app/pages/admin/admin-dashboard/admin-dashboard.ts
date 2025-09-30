import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminService, AdminSummary, AuditLog, Agent, BasicUser } from '../../../services/admin';
import { ClaimService, Claim } from '../../../services/claim';
import { AuthService, User } from '../../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {
  summary: AdminSummary | null = null;
  auditLogs: AuditLog[] = [];
  agents: Agent[] = [];
  users: BasicUser[] = [];
  claims: Claim[] = [];
  selectedClaim: Claim | null = null;
  loading = true;
  error = '';
  currentUser: User | null = null;

  // Simple section expand/collapse state
  open = {
    summary: true,
    agents: true,
    claims: true,
    audit: true
  };

  constructor(
    private adminService: AdminService,
    private claimService: ClaimService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load summary data
    this.adminService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (error) => {
        console.error('Error loading summary:', error);
      }
    });

    // Load audit logs
    this.adminService.getAuditLogs().subscribe({
      next: (logs) => {
        this.auditLogs = logs.slice(0, 10); // Show only recent 10
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
      }
    });

    // Load agents
    this.adminService.getAgents().subscribe({
      next: (agents) => {
        this.agents = agents;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        console.error('Error loading agents:', error);
      }
    });

    // Load users for assignment
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });

    // Load claims for admin review
    this.claimService.getClaims().subscribe({
      next: (claims) => { this.claims = claims; },
      error: (err) => console.error('Error loading claims:', err)
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

  onCreateAgent(agentForm: NgForm): void {
    if (!agentForm?.value) {
      return;
    }
    this.adminService.createAgent(agentForm.value).subscribe({
      next: () => {
        this.loadDashboardData();
        agentForm.resetForm();
      }
    });
  }

  onAssignAgent(agentId: string, userId: string): void {
    if (!agentId || !userId) {
      return;
    }
    this.adminService.assignAgent(agentId, { userId }).subscribe({
      next: () => this.loadDashboardData()
    });
  }

  viewClaimDetails(claimId: string): void {
    this.selectedClaim = null;
    this.claimService.getClaimById(claimId).subscribe({
      next: (c) => this.selectedClaim = c,
      error: (err) => console.error('Failed to fetch claim detail', err)
    });
  }

  updateClaimStatus(claimId: string, status: 'APPROVED' | 'REJECTED'): void {
    this.claimService.updateClaimStatus(claimId, { status }).subscribe({
      next: () => {
        this.viewClaimDetails(claimId);
        this.loadDashboardData();
      },
      error: (err) => console.error('Failed to update claim status', err)
    });
  }

  toggle(section: 'summary' | 'agents' | 'claims' | 'audit'): void {
    this.open[section] = !this.open[section];
  }
}
