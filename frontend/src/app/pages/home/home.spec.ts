import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home';
import { AuthService, User } from '../../services/auth';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser$: of(mockUser)
    });

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have app-home selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.tagName.toLowerCase()).toBe('div');
  });

  it('should inject AuthService', () => {
    expect(component.authService).toBe(mockAuthService);
  });

  it('should initialize currentUser$ from AuthService', () => {
    expect(component.currentUser$).toBe(mockAuthService.currentUser$);
  });

  it('should be a standalone component', () => {
    expect(component).toBeInstanceOf(HomeComponent);
  });

  it('should have currentUser$ observable', () => {
    expect(component.currentUser$).toBeDefined();
    expect(component.currentUser$.subscribe).toBeDefined();
  });

  it('should subscribe to currentUser$ observable', (done) => {
    component.currentUser$.subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });
  });

  it('should handle null user in currentUser$', (done) => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser$: of(null)
    });

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    component.currentUser$.subscribe(user => {
      expect(user).toBeNull();
      done();
    });
  });
});
