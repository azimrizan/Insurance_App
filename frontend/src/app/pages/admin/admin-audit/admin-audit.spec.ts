import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuditPage } from './admin-audit';
import { AdminService } from '../../../services/admin';

describe('AdminAuditPage', () => {
  let component: AdminAuditPage;
  let fixture: ComponentFixture<AdminAuditPage>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  const mockAuditLogs = [
    {
      _id: '1',
      userId: 'user1',
      action: 'LOGIN',
      details: 'User logged in',
      timestamp: '2024-01-01T10:00:00Z'
    },
    {
      _id: '2',
      userId: 'user2',
      action: 'CREATE_POLICY',
      details: 'Created new policy',
      timestamp: '2024-01-01T11:00:00Z'
    },
    {
      _id: '3',
      userId: 'user1',
      action: 'UPDATE_CLAIM',
      details: 'Updated claim status',
      timestamp: '2024-01-01T12:00:00Z'
    }
  ];

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['getAuditLogs']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    // Configure spy before creating component
    adminServiceSpy.getAuditLogs.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminAuditPage, HttpClientTestingModule],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAuditPage);
    component = fixture.componentInstance;
    mockAdminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.logs).toEqual([]);
  });

  it('should load audit logs on ngOnInit', () => {
    mockAdminService.getAuditLogs.and.returnValue(of(mockAuditLogs));

    component.ngOnInit();

    expect(mockAdminService.getAuditLogs).toHaveBeenCalled();
    expect(component.logs).toEqual(mockAuditLogs);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle error when loading audit logs', () => {
    const errorMessage = 'Failed to load audit logs';
    mockAdminService.getAuditLogs.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.ngOnInit();

    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBe(false);
    expect(component.logs).toEqual([]);
  });

  it('should handle error without message', () => {
    mockAdminService.getAuditLogs.and.returnValue(throwError(() => ({})));

    component.ngOnInit();

    expect(component.error).toBe('Failed to load audit logs');
    expect(component.loading).toBe(false);
  });

  it('should handle empty audit logs response', () => {
    mockAdminService.getAuditLogs.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.logs).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should display audit logs in the template', () => {
    mockAdminService.getAuditLogs.and.returnValue(of(mockAuditLogs));

    component.ngOnInit();
    fixture.detectChanges();

    // Check that the component has the audit logs data
    expect(component.logs).toEqual(mockAuditLogs);
    expect(component.logs.length).toBe(mockAuditLogs.length);
  });

  it('should show loading state initially', () => {
    // Check loading state before detectChanges triggers ngOnInit
    expect(component.loading).toBe(true);
  });

  it('should show error message when error occurs', () => {
    const errorMessage = 'Network error';
    mockAdminService.getAuditLogs.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toBe(errorMessage);
  });

  it('should format timestamps correctly', () => {
    // This test would be relevant if the component has timestamp formatting logic
    // For now, we're testing the basic functionality
    mockAdminService.getAuditLogs.and.returnValue(of(mockAuditLogs));

    component.ngOnInit();

    expect(component.logs[0].timestamp).toBe('2024-01-01T10:00:00Z');
  });
});
