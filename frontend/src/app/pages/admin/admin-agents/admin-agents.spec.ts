import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAgentsPage } from './admin-agents';
import { AdminService } from '../../../services/admin';

describe('AdminAgentsPage', () => {
  let component: AdminAgentsPage;
  let fixture: ComponentFixture<AdminAgentsPage>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  const mockAgents = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'agent',
      assignedUsers: []
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'agent',
      assignedUsers: []
    }
  ];

  const mockUsers = [
    {
      _id: '1',
      name: 'User One',
      email: 'user1@example.com',
      role: 'customer'
    },
    {
      _id: '2',
      name: 'User Two',
      email: 'user2@example.com',
      role: 'customer'
    }
  ];

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'getAgents',
      'getUsers',
      'createAgent',
      'assignAgent'
    ]);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    // Configure spies before creating component
    adminServiceSpy.getAgents.and.returnValue(of([]));
    adminServiceSpy.getUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminAgentsPage, HttpClientTestingModule],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAgentsPage);
    component = fixture.componentInstance;
    mockAdminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load agents and users on initialization', () => {
    // Reconfigure spies for this specific test
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));

    // Create a new component instance with the configured spies
    fixture = TestBed.createComponent(AdminAgentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockAdminService.getAgents).toHaveBeenCalled();
    expect(mockAdminService.getUsers).toHaveBeenCalled();
    expect(component.agents).toEqual(mockAgents);
    expect(component.users).toEqual(mockUsers);
  });

  it('should handle error when loading agents', () => {
    const errorMessage = 'Failed to load agents';
    mockAdminService.getAgents.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));

    // Create a new component instance with the configured spies
    fixture = TestBed.createComponent(AdminAgentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBe(errorMessage);
  });

  it('should create a new agent', () => {
    const newAgent = {
      name: 'New Agent',
      email: 'newagent@example.com',
      password: 'password123'
    };

    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockAdminService.createAgent.and.returnValue(of({
      _id: '3',
      name: 'New Agent',
      email: 'newagent@example.com',
      role: 'agent'
    }));
    mockAdminService.getAgents.and.returnValue(of([...mockAgents, { ...newAgent, _id: '3', role: 'agent', assignedUsers: [] }]));

    fixture.detectChanges();

    const mockForm = {
      value: newAgent,
      resetForm: jasmine.createSpy('resetForm')
    };

    component.createAgent(mockForm as any);

    expect(mockAdminService.createAgent).toHaveBeenCalledWith(newAgent);
    expect(mockForm.resetForm).toHaveBeenCalled();
    expect(mockAdminService.getAgents).toHaveBeenCalledTimes(2); // Once on init, once after create
  });

  it('should not create agent if form value is null', () => {
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));

    fixture.detectChanges();

    const mockForm = {
      value: null,
      resetForm: jasmine.createSpy('resetForm')
    };

    component.createAgent(mockForm as any);

    expect(mockAdminService.createAgent).not.toHaveBeenCalled();
    expect(mockForm.resetForm).not.toHaveBeenCalled();
  });

  it('should assign agent to user', () => {
    const agentId = '1';
    const userId = '2';

    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockAdminService.assignAgent.and.returnValue(of({ message: 'Agent assigned successfully' }));

    fixture.detectChanges();

    component.assign(agentId, userId);

    expect(mockAdminService.assignAgent).toHaveBeenCalledWith(agentId, { userId });
    expect(mockAdminService.getAgents).toHaveBeenCalledTimes(2); // Once on init, once after assign
  });

  it('should not assign agent if agentId or userId is missing', () => {
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));

    fixture.detectChanges();

    component.assign('', '2');
    expect(mockAdminService.assignAgent).not.toHaveBeenCalled();

    component.assign('1', '');
    expect(mockAdminService.assignAgent).not.toHaveBeenCalled();

    component.assign('', '');
    expect(mockAdminService.assignAgent).not.toHaveBeenCalled();
  });

  it('should reload agents after successful operations', () => {
    mockAdminService.getAgents.and.returnValue(of(mockAgents));
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockAdminService.createAgent.and.returnValue(of({
      _id: '3',
      name: 'New Agent',
      email: 'newagent@example.com',
      role: 'agent'
    }));

    fixture.detectChanges();

    const mockForm = {
      value: { name: 'Test Agent', email: 'test@example.com', password: 'password123' },
      resetForm: jasmine.createSpy('resetForm')
    };

    component.createAgent(mockForm as any);

    expect(mockAdminService.getAgents).toHaveBeenCalledTimes(2);
  });
});
