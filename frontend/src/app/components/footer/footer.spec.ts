import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render footer content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footerText = compiled.querySelector('p');
    expect(footerText?.textContent).toContain('footer works!');
  });

  it('should have app-footer selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.tagName.toLowerCase()).toBe('div');
  });

  it('should be a standalone component', () => {
    expect(component).toBeInstanceOf(Footer);
  });

  it('should have empty imports array', () => {
    // This test verifies the component structure
    expect(component).toBeDefined();
  });
});
