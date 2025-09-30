import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AdminService, AdminSummary, AuditLog, Agent, BasicUser, CreateAgentRequest, AssignAgentRequest } from './admin';
import { environment } from '../../environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const mockSummary: AdminSummary = {
    users: 150,
    policiesSold: 300,
    claimsPending: 12,
    totalPayments: 125
  };

  const mockAuditLogs: AuditLog[] = [
    {
      _id: '1',
      action: 'LOGIN',
      userId: 'user1',
      userName: 'John Doe',
      details: { ip: '192.168.1.1' },
      timestamp: '2024-01-01T10:00:00Z'
    },
    {
      _id: '2',
      action: 'CREATE_POLICY',
      userId: 'user2',
      userName: 'Jane Smith',
      details: { policyId: 'policy1' },
      timestamp: '2024-01-01T11:00:00Z'
    }
  ];

  const mockAgents: Agent[] = [
    {
      _id: '1',
      name: 'Agent One',
      email: 'agent1@example.com',
      role: 'AGENT',
      assignedUsers: ['user1', 'user2']
    },
    {
      _id: '2',
      name: 'Agent Two',
      email: 'agent2@example.com',
      role: 'AGENT',
      assignedUsers: ['user3']
    }
  ];

  const mockUsers: BasicUser[] = [
    {
      _id: '1',
      name: 'User One',
      email: 'user1@example.com',
      role: 'USER'
    },
    {
      _id: '2',
      name: 'User Two',
      email: 'user2@example.com',
      role: 'USER'
    }
  ];

  const mockCreateAgentRequest: CreateAgentRequest = {
    name: 'New Agent',
    email: 'newagent@example.com',
    password: 'password123',
    role: 'AGENT'
  };

  const mockAssignAgentRequest: AssignAgentRequest = {
    userId: 'user1'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSummary', () => {
    it('should get admin summary', () => {
      service.getSummary().subscribe(summary => {
        expect(summary).toEqual(mockSummary);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/summary`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);
    });

    it('should handle getSummary error', () => {
      service.getSummary().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/summary`);
      req.flush({ error: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getAuditLogs', () => {
    it('should get audit logs', () => {
      service.getAuditLogs().subscribe(logs => {
        expect(logs).toEqual(mockAuditLogs);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/audit`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAuditLogs);
    });

    it('should handle getAuditLogs error', () => {
      service.getAuditLogs().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/audit`);
      req.flush({ error: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getUsers', () => {
    it('should get all users without query', () => {
      service.getUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should get users with query parameter', () => {
      const query = 'john';
      service.getUsers(query).subscribe(users => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/users?q=${encodeURIComponent(query)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle getUsers error', () => {
      service.getUsers().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/users`);
      req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getAgents', () => {
    it('should get all agents', () => {
      service.getAgents().subscribe(agents => {
        expect(agents).toEqual(mockAgents);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/agents`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAgents);
    });

    it('should handle getAgents error', () => {
      service.getAgents().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/agents`);
      req.flush({ error: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('createAgent', () => {
    it('should create new agent', () => {
      const newAgent: Agent = {
        _id: '3',
        name: 'New Agent',
        email: 'newagent@example.com',
        role: 'AGENT',
        assignedUsers: []
      };

      service.createAgent(mockCreateAgentRequest).subscribe(agent => {
        expect(agent).toEqual(newAgent);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/agents`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCreateAgentRequest);
      req.flush(newAgent);
    });

    it('should handle createAgent error', () => {
      service.createAgent(mockCreateAgentRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/agents`);
      req.flush({ error: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('assignAgent', () => {
    it('should assign user to agent', () => {
      const agentId = '1';
      const response = { message: 'User assigned successfully' };

      service.assignAgent(agentId, mockAssignAgentRequest).subscribe(result => {
        expect(result).toEqual(response);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/agents/${agentId}/assign`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockAssignAgentRequest);
      req.flush(response);
    });

    it('should handle assignAgent error', () => {
      const agentId = '1';

      service.assignAgent(agentId, mockAssignAgentRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/agents/${agentId}/assign`);
      req.flush({ error: 'Agent not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
