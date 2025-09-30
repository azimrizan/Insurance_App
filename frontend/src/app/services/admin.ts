import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminSummary {
  users: number;
  policiesSold: number;
  claimsPending: number;
  totalPayments: number;
}

export interface AuditLog {
  _id: string;
  action: string;
  userId: string;
  userName?: string | null;
  details: any;
  timestamp: string;
}

export interface Agent {
  _id: string;
  name: string;
  email: string;
  role: string;
  assignedUsers?: string[];
}

export interface BasicUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface CreateAgentRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AssignAgentRequest {
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  // Get admin dashboard summary
  getSummary(): Observable<AdminSummary> {
    return this.http.get<AdminSummary>(`${environment.apiUrl}/admin/summary`);
  }

  // Get audit logs
  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${environment.apiUrl}/admin/audit`);
  }

  // Get all users (for assignment)
  getUsers(query?: string): Observable<BasicUser[]> {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.http.get<BasicUser[]>(`${environment.apiUrl}/admin/users${q}`);
  }

  // Get all agents
  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${environment.apiUrl}/admin/agents`);
  }

  // Create new agent
  createAgent(agentData: CreateAgentRequest): Observable<Agent> {
    return this.http.post<Agent>(`${environment.apiUrl}/admin/agents`, agentData);
  }

  // Assign user to agent
  assignAgent(agentId: string, assignData: AssignAgentRequest): Observable<{message: string}> {
    return this.http.put<{message: string}>(`${environment.apiUrl}/admin/agents/${agentId}/assign`, assignData);
  }
}
