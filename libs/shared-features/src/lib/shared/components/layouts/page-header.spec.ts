import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  let component: PageHeader;
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeader);
    component = fixture.componentInstance;
    
    // Set required input using fixture.componentRef.setInput
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    expect(component.title()).toBe('Test Title');
  });

  it('should have empty description by default', () => {
    expect(component.description()).toBe('');
  });

  it('should accept description input', () => {
    fixture.componentRef.setInput('description', 'Test Description');
    fixture.detectChanges();
    expect(component.description()).toBe('Test Description');
  });
});
