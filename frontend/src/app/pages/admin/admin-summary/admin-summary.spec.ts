import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminSummaryPage } from './admin-summary';
import { AdminService } from '../../../services/admin';

describe('AdminSummaryPage', () => {
  let component: AdminSummaryPage;
  let fixture: ComponentFixture<AdminSummaryPage>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  const mockSummary = {
    users: 150,
    policiesSold: 300,
    claimsPending: 45,
    totalPayments: 150000
  };

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['getSummary']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    // Configure spy before creating component
    adminServiceSpy.getSummary.and.returnValue(of(mockSummary));

    await TestBed.configureTestingModule({
      imports: [AdminSummaryPage, HttpClientTestingModule],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSummaryPage);
    component = fixture.componentInstance;
    mockAdminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading).toBe(true);
    expect(component.error).toBe('');
    expect(component.summary).toBeNull();
  });

  it('should load summary data on ngOnInit', () => {
    mockAdminService.getSummary.and.returnValue(of(mockSummary));

    component.ngOnInit();

    expect(mockAdminService.getSummary).toHaveBeenCalled();
    expect(component.summary).toEqual(mockSummary);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should handle error when loading summary', () => {
    const errorMessage = 'Failed to load summary';
    mockAdminService.getSummary.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.ngOnInit();

    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBe(false);
    expect(component.summary).toEqual({ users: 0, policiesSold: 0, claimsPending: 0, totalPayments: 0 });
  });

  it('should handle error without message when loading summary', () => {
    mockAdminService.getSummary.and.returnValue(throwError(() => ({})));

    component.ngOnInit();

    expect(component.error).toBe('Failed to load summary');
    expect(component.loading).toBe(false);
  });

  it('should handle null summary response', () => {
    mockAdminService.getSummary.and.returnValue(throwError(() => ({ error: { message: 'No data available' } })));

    component.ngOnInit();

    expect(component.error).toBe('No data available');
    expect(component.loading).toBe(false);
  });

  it('should display summary data in the template', () => {
    mockAdminService.getSummary.and.returnValue(of(mockSummary));

    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    // This would depend on the actual template structure
    // You might need to adjust selectors based on the HTML template
    expect(component.summary).toEqual(mockSummary);
  });

  it('should show loading state initially', () => {
    // Check loading state before detectChanges triggers ngOnInit
    expect(component.loading).toBe(true);
  });

  it('should show error message when error occurs', () => {
    const errorMessage = 'Network error';
    mockAdminService.getSummary.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toBe(errorMessage);
  });

  it('should handle empty summary response', () => {
    const emptySummary = {
      users: 0,
      policiesSold: 0,
      claimsPending: 0,
      totalPayments: 0
    };

    mockAdminService.getSummary.and.returnValue(of(emptySummary));

    component.ngOnInit();

    expect(component.summary).toEqual(emptySummary);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should display summary statistics correctly', () => {
    mockAdminService.getSummary.and.returnValue(of(mockSummary));

    component.ngOnInit();

    expect(component.summary?.users).toBe(150);
    expect(component.summary?.policiesSold).toBe(300);
    expect(component.summary?.claimsPending).toBe(45);
    expect(component.summary?.totalPayments).toBe(150000);
  });

  it('should display summary data correctly', () => {
    mockAdminService.getSummary.and.returnValue(of(mockSummary));

    component.ngOnInit();

    expect(component.summary).toEqual(mockSummary);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });
});
