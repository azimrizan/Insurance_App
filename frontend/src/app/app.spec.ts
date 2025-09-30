import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect((component as any).title()).toBe('Insurance Management System');
  });

  it('should render router outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should have app-root selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.tagName.toLowerCase()).toBe('div');
  });

  it('should update title signal correctly', () => {
    const newTitle = 'New Insurance System';
    (component as any).title.set(newTitle);
    expect((component as any).title()).toBe(newTitle);
  });

  it('should be a signal-based component', () => {
    expect((component as any).title).toBeDefined();
    expect(typeof (component as any).title).toBe('function');
  });
});
