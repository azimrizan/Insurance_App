import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AdminDashboardComponent } from './admin-dashboard';
import { AdminService, AdminSummary, AuditLog, Agent, BasicUser } from '../../../services/admin';
import { ClaimService, Claim } from '../../../services/claim';
import { AuthService, User } from '../../../services/auth';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockClaimService: jasmine.SpyObj<ClaimService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    _id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN'
  };

  const mockSummary: AdminSummary = {
    users: 100,
    policiesSold: 250,
    claimsPending: 50,
    totalPayments: 150000
  };

  const mockAuditLogs: AuditLog[] = [
    {
      _id: '1',
      action: 'User registered',
      userId: 'user1',
      timestamp: '2024-01-01T10:00:00Z',
      details: { email: 'user@example.com' }
    },
    {
      _id: '2',
      action: 'Policy purchased',
      userId: 'user2',
      timestamp: '2024-01-01T09:00:00Z',
      details: { policyId: 'policy1' }
    }
  ];

  const mockAgents: Agent[] = [
    {
      _id: '1',
      name: 'Agent One',
      email: 'agent1@example.com',
      role: 'agent',
      assignedUsers: ['user1', 'user2']
    }
  ];

  const mockUsers: BasicUser[] = [
    {
      _id: 'user1',
      name: 'User One',
      email: 'user1@example.com',
      role: 'customer'
    },
    {
      _id: 'user2',
      name: 'User Two',
      email: 'user2@example.com',
      role: 'customer'
    }
  ];

  const mockClaims: Claim[] = [
    {
      _id: '1',
      userId: 'user1',
      userPolicyId: 'policy1',
      incidentDate: '2024-01-01T00:00:00Z',
      description: 'Car accident',
      amountClaimed: 5000,
      status: 'PENDING',
      decisionNotes: undefined,
      decidedByAgentId: undefined,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    }
  ];

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['getSummary', 'getAuditLogs', 'getAgents', 'getUsers', 'createAgent', 'assignAgent']);
    const claimServiceSpy = jasmine.createSpyObj('ClaimService', ['getClaims', 'getClaimById', 'updateClaimStatus']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserValue']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: ClaimService, useValue: claimServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    mockAdminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    mockClaimService = TestBed.inject(ClaimService) as jasmine.SpyObj<ClaimService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.summary).toBeNull();
    expect(component.auditLogs).toEqual([]);
    expect(component.agents).toEqual([]);
    expect(component.users).toEqual([]);
    expect(component.claims).toEqual([]);
    expect(component.selectedClaim).toBeNull();
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.currentUser).toBeNull();
    expect(component.open.summary).toBe(true);
    expect(component.open.agents).toBe(true);
    expect(component.open.claims).toBe(true);
    expect(component.open.audit).toBe(true);
  });

  it('should load dashboard data on ngOnInit', () => {
    mockAuthService.getCurrentUserValue.and.returnValue(mockUser);
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of(mockAuditLogs));
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.ngOnInit();

    expect(component.currentUser).toEqual(mockUser);
    expect(mockAdminService.getSummary).toHaveBeenCalled();
    expect(mockAdminService.getAuditLogs).toHaveBeenCalled();
    expect(mockAdminService.getAgents).toHaveBeenCalled();
    expect(mockAdminService.getUsers).toHaveBeenCalled();
    expect(mockClaimService.getClaims).toHaveBeenCalled();
  });

  it('should load summary data successfully', () => {
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of([]));
    mockAdminService.getAgents.and.returnValue(of([]));
    mockAdminService.getUsers.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of([]));

    component.loadDashboardData();

    expect(component.summary).toEqual(mockSummary);
  });

  it('should handle error when loading summary', () => {
    const error = { message: 'Failed to load summary' };
    mockAdminService.getSummary.and.returnValue(throwError(() => error));
    mockAdminService.getAuditLogs.and.returnValue(of([]));
    mockAdminService.getAgents.and.returnValue(of([]));
    mockAdminService.getUsers.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of([]));
    spyOn(console, 'error');

    component.loadDashboardData();

    expect(console.error).toHaveBeenCalledWith('Error loading summary:', error);
  });

  it('should load audit logs successfully', () => {
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of(mockAuditLogs));
    mockAdminService.getAgents.and.returnValue(of([]));
    mockAdminService.getUsers.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of([]));

    component.loadDashboardData();

    expect(component.auditLogs).toEqual(mockAuditLogs.slice(0, 10));
  });

  it('should handle error when loading audit logs', () => {
    const error = { message: 'Failed to load audit logs' };
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(throwError(() => error));
    mockAdminService.getAgents.and.returnValue(of([]));
    mockAdminService.getUsers.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of([]));
    spyOn(console, 'error');

    component.loadDashboardData();

    expect(console.error).toHaveBeenCalledWith('Error loading audit logs:', error);
  });

  it('should load agents successfully', () => {
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of([]));
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of([]));

    component.loadDashboardData();

    expect(component.agents).toEqual(mockAgents);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading agents', () => {
    const error = { message: 'Failed to load agents' };
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of([]));
    mockAdminService.getAgents.and.returnValue(throwError(() => error));
    mockAdminService.getUsers.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of([]));
    spyOn(console, 'error');

    component.loadDashboardData();

    expect(component.error).toBe('Failed to load dashboard data. Please try again.');
    expect(component.loading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error loading agents:', error);
  });

  it('should load users successfully', () => {
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of([]));
    mockAdminService.getAgents.and.returnValue(of([]));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockClaimService.getClaims.and.returnValue(of([]));

    component.loadDashboardData();

    expect(component.users).toEqual(mockUsers);
  });

  it('should handle error when loading users', () => {
    const error = { message: 'Failed to load users' };
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of([]));
    mockAdminService.getAgents.and.returnValue(of([]));
    mockAdminService.getUsers.and.returnValue(throwError(() => error));
    mockClaimService.getClaims.and.returnValue(of([]));
    spyOn(console, 'error');

    component.loadDashboardData();

    expect(console.error).toHaveBeenCalledWith('Error loading users:', error);
  });

  it('should load claims successfully', () => {
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of([]));
    mockAdminService.getAgents.and.returnValue(of([]));
    mockAdminService.getUsers.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.loadDashboardData();

    expect(component.claims).toEqual(mockClaims);
  });

  it('should handle error when loading claims', () => {
    const error = { message: 'Failed to load claims' };
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of([]));
    mockAdminService.getAgents.and.returnValue(of([]));
    mockAdminService.getUsers.and.returnValue(of([]));
    mockClaimService.getClaims.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.loadDashboardData();

    expect(console.error).toHaveBeenCalledWith('Error loading claims:', error);
  });

  it('should format date correctly', () => {
    const dateString = '2024-01-01T10:00:00Z';
    const formattedDate = component.formatDate(dateString);
    
    expect(formattedDate).toBe(new Date(dateString).toLocaleDateString());
  });

  it('should format amount correctly', () => {
    const amount = 1200;
    const formattedAmount = component.formatAmount(amount);
    
    expect(formattedAmount).toBe('$1,200.00');
  });

  it('should create agent with valid form data', () => {
    const agentForm = {
      value: { name: 'New Agent', email: 'newagent@example.com', password: 'password123' },
      resetForm: jasmine.createSpy('resetForm')
    };
    mockAdminService.createAgent.and.returnValue(of({
      _id: '3',
      name: 'New Agent',
      email: 'newagent@example.com',
      role: 'agent'
    }));
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of(mockAuditLogs));
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.onCreateAgent(agentForm as any);

    expect(mockAdminService.createAgent).toHaveBeenCalledWith(agentForm.value);
    expect(agentForm.resetForm).toHaveBeenCalled();
  });

  it('should not create agent with invalid form data', () => {
    const agentForm = { value: null };
    mockAdminService.createAgent.and.returnValue(of({
      _id: '3',
      name: 'New Agent',
      email: 'newagent@example.com',
      role: 'agent'
    }));

    component.onCreateAgent(agentForm as any);

    expect(mockAdminService.createAgent).not.toHaveBeenCalled();
  });

  it('should assign agent to user', () => {
    const agentId = 'agent1';
    const userId = 'user1';
    mockAdminService.assignAgent.and.returnValue(of({ message: 'Agent assigned successfully' }));
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of(mockAuditLogs));
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.onAssignAgent(agentId, userId);

    expect(mockAdminService.assignAgent).toHaveBeenCalledWith(agentId, { userId });
  });

  it('should not assign agent with invalid data', () => {
    mockAdminService.assignAgent.and.returnValue(of({ message: 'Agent assigned successfully' }));

    component.onAssignAgent('', 'user1');
    expect(mockAdminService.assignAgent).not.toHaveBeenCalled();

    component.onAssignAgent('agent1', '');
    expect(mockAdminService.assignAgent).not.toHaveBeenCalled();

    component.onAssignAgent('', '');
    expect(mockAdminService.assignAgent).not.toHaveBeenCalled();
  });

  it('should view claim details', () => {
    const claimId = '1';
    mockClaimService.getClaimById.and.returnValue(of(mockClaims[0]));

    component.viewClaimDetails(claimId);

    expect(component.selectedClaim).toEqual(mockClaims[0]); // Should be set to the claim object
    expect(mockClaimService.getClaimById).toHaveBeenCalledWith(claimId);
  });

  it('should handle error when viewing claim details', () => {
    const claimId = '999';
    const error = { message: 'Claim not found' };
    mockClaimService.getClaimById.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.viewClaimDetails(claimId);

    expect(console.error).toHaveBeenCalledWith('Failed to fetch claim detail', error);
  });

  it('should update claim status to APPROVED', () => {
    const claimId = '1';
    mockClaimService.updateClaimStatus.and.returnValue(of(mockClaims[0]));
    mockClaimService.getClaimById.and.returnValue(of(mockClaims[0]));
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of(mockAuditLogs));
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.updateClaimStatus(claimId, 'APPROVED');

    expect(mockClaimService.updateClaimStatus).toHaveBeenCalledWith(claimId, { status: 'APPROVED' });
    expect(mockClaimService.getClaimById).toHaveBeenCalledWith(claimId);
  });

  it('should update claim status to REJECTED', () => {
    const claimId = '1';
    mockClaimService.updateClaimStatus.and.returnValue(of(mockClaims[0]));
    mockClaimService.getClaimById.and.returnValue(of(mockClaims[0]));
    mockAdminService.getSummary.and.returnValue(of(mockSummary));
    mockAdminService.getAuditLogs.and.returnValue(of(mockAuditLogs));
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockClaimService.getClaims.and.returnValue(of(mockClaims));

    component.updateClaimStatus(claimId, 'REJECTED');

    expect(mockClaimService.updateClaimStatus).toHaveBeenCalledWith(claimId, { status: 'REJECTED' });
  });

  it('should handle error when updating claim status', () => {
    const claimId = '1';
    const error = { message: 'Failed to update claim' };
    mockClaimService.updateClaimStatus.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.updateClaimStatus(claimId, 'APPROVED');

    expect(console.error).toHaveBeenCalledWith('Failed to update claim status', error);
  });

  it('should toggle section visibility', () => {
    expect(component.open.summary).toBe(true);
    expect(component.open.agents).toBe(true);
    expect(component.open.claims).toBe(true);
    expect(component.open.audit).toBe(true);

    component.toggle('summary');
    expect(component.open.summary).toBe(false);

    component.toggle('agents');
    expect(component.open.agents).toBe(false);

    component.toggle('claims');
    expect(component.open.claims).toBe(false);

    component.toggle('audit');
    expect(component.open.audit).toBe(false);

    // Toggle back
    component.toggle('summary');
    expect(component.open.summary).toBe(true);
  });
});
