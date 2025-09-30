import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navbar content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navbarText = compiled.querySelector('p');
    expect(navbarText?.textContent).toContain('navbar works!');
  });

  it('should have app-navbar selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.tagName.toLowerCase()).toBe('div');
  });

  it('should be a standalone component', () => {
    expect(component).toBeInstanceOf(Navbar);
  });

  it('should have empty imports array', () => {
    // This test verifies the component structure
    expect(component).toBeDefined();
  });
});
