import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItemComponent } from './menu-item.component';
import { MenuItem } from '../../../../internal';

describe('MenuItemComponent', () => {
  let component: MenuItemComponent;
  let fixture: ComponentFixture<MenuItemComponent>;

  const mockMenuItem: MenuItem = {
    name: 'Test Item',
    icon: 'pi pi-test',
    routerLink: '/test',
    tooltip: 'Test tooltip'
  };

  const mockMenuItemWithChildren: MenuItem = {
    name: 'Parent Item',
    icon: 'pi pi-parent',
    tooltip: 'Parent tooltip',
    children: [
      {
        name: 'Child Item',
        icon: 'pi pi-child',
        routerLink: '/child',
        tooltip: 'Child tooltip'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItemComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Set required inputs
    fixture.componentRef.setInput('item', mockMenuItem);
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should detect menu items with children', () => {
    fixture.componentRef.setInput('item', mockMenuItemWithChildren);
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();

    expect(component.hasChildren()).toBe(true);
  });

  it('should detect menu items without children', () => {
    fixture.componentRef.setInput('item', mockMenuItem);
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();

    // The computed property depends on the input signal, let's check if the item is set correctly first
    expect(component.item()).toEqual(mockMenuItem);
    expect(component.hasChildren()).toBe(false);
  });

  it('should return correct tooltip text', () => {
    fixture.componentRef.setInput('item', mockMenuItem);
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();

    expect(component.tooltipText()).toBe('Test tooltip');
  });

  it('should fallback to item name if no tooltip provided', () => {
    const itemWithoutTooltip: MenuItem = {
      name: 'No Tooltip Item',
      icon: 'pi pi-test',
      routerLink: '/test'
    };

    fixture.componentRef.setInput('item', itemWithoutTooltip);
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();

    expect(component.tooltipText()).toBe('No Tooltip Item');
  });

  it('should transform menu item to PrimeNG format correctly', () => {
    fixture.componentRef.setInput('item', mockMenuItemWithChildren);
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();

    const transformed = component.transformMenuItem();
    
    expect(transformed.label).toBe('Parent Item');
    expect(transformed.icon).toBe('pi pi-parent');
    expect(transformed.items).toBeDefined();
    expect(transformed.items?.length).toBe(1);
    expect(transformed.items?.[0].label).toBe('Child Item');
  });

  it('should emit itemClick when onItemClick is called', () => {
    fixture.componentRef.setInput('item', mockMenuItem);
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();

    jest.spyOn(component.itemClick, 'emit');
    
    component.onItemClick();
    
    expect(component.itemClick.emit).toHaveBeenCalledWith(mockMenuItem);
  });

  it('should emit menuToggle when onMenuToggle is called', () => {
    fixture.componentRef.setInput('item', mockMenuItemWithChildren);
    fixture.componentRef.setInput('isCollapsed', true);
    fixture.detectChanges();

    jest.spyOn(component.menuToggle, 'emit');
    
    const mockEvent = new Event('click');
    const mockMenu = { toggle: jest.fn() };
    
    component.onMenuToggle(mockEvent, mockMenu);
    
    expect(component.menuToggle.emit).toHaveBeenCalledWith(mockEvent);
    expect(mockMenu.toggle).toHaveBeenCalledWith(mockEvent);
  });
});