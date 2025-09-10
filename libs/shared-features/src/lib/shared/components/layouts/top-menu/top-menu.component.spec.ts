import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TopMenuComponent } from './top-menu.component';
import { OrganizationService, DarkModeService } from '../../../internal';

describe('TopMenuComponent', () => {
  let component: TopMenuComponent;
  let fixture: ComponentFixture<TopMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopMenuComponent],
      providers: [
        provideRouter([]),
        OrganizationService,
        DarkModeService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dark mode', () => {
    const darkModeService = TestBed.inject(DarkModeService);
    jest.spyOn(darkModeService, 'toggleTheme');
    
    component.toggleDarkMode();
    
    expect(darkModeService.toggleTheme).toHaveBeenCalled();
  });

  it('should show help', () => {
    jest.spyOn(console, 'log');
    component.showHelp();
    expect(console.log).toHaveBeenCalledWith('Help clicked');
  });
});