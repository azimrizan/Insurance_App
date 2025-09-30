import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, Agent, BasicUser } from '../../../services/admin';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-agents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-agents.html',
  styleUrls: ['./admin-agents.scss']
  
})
export class AdminAgentsPage {
  agents: Agent[] = [];
  users: BasicUser[] = [];
  error = '';

  constructor(private admin: AdminService, public authService: AuthService) {
    this.load();
    this.admin.getUsers().subscribe({ next: (u) => this.users = u });
  }

  load() {
    this.admin.getAgents().subscribe({
      next: (a) => this.agents = a,
      error: (e) => this.error = e.error?.message || 'Failed to load agents'
    });
  }

  createAgent(f: NgForm) {
    if (!f.value) return;
    this.admin.createAgent(f.value).subscribe({ next: () => { f.resetForm(); this.load(); } });
  }

  assign(agentId: string, userId: string) {
    if (!agentId || !userId) return;
    this.admin.assignAgent(agentId, { userId }).subscribe({ next: () => this.load() });
  }
}


