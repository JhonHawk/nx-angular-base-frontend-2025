import { ChangeDetectionStrategy, Component, computed, inject, InjectionToken, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { SidebarService, DarkModeService } from '../../../internal';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { catchError, of } from 'rxjs';

// Define interfaces for the organization selector functionality
// These should be provided by the apps that use this component
export interface OrganizationOption {
  id: number | 'ORCA';
  name: string;
  isOrcaOption: boolean;
}

export interface OrganizationSelectorService {
  readonly organizationOptions: () => OrganizationOption[];
  readonly selectedOrganization: () => OrganizationOption | null;
  selectOrganization(id: number | 'ORCA'): void;
  loadOrganizations(): void;
}

// Create injection token for the service
export const ORGANIZATION_SELECTOR_SERVICE = new InjectionToken<OrganizationSelectorService>('OrganizationSelectorService');

@Component({
  standalone: true,
  selector: 'orca-top-menu',
  imports: [
    ButtonModule,
    TooltipModule,
    PopoverModule,
    BreadcrumbComponent
  ],
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopMenuComponent implements OnInit {
  private sidebarService = inject(SidebarService);
  private darkModeService = inject(DarkModeService);
  
  // Try to inject organization selector service (optional for backward compatibility)
  private organizationService = inject(ORGANIZATION_SELECTOR_SERVICE, { optional: true });

  // Computed properties
  isDarkMode = this.darkModeService.isDarkMode;
  isSidebarCollapsed = this.sidebarService.collapsed;

  // Organization selector state
  isOrganizationPopoverOpen = signal(false);
  
  // Organization selector computed properties
  organizationOptions = computed(() => {
    return this.organizationService?.organizationOptions() || [];
  });

  selectedOrganization = computed(() => {
    return this.organizationService?.selectedOrganization() || null;
  });

  selectedOrganizationText = computed(() => {
    const selected = this.selectedOrganization();
    return selected?.name || 'Seleccionar organización';
  });

  hasOrganizationSelector = computed(() => {
    return this.organizationService !== null;
  });

  ngOnInit() {
    // Load organizations if service is available
    if (this.organizationService) {
      this.organizationService.loadOrganizations();
    }
  }

  toggleDarkMode() {
    this.darkModeService.toggleTheme();
  }

  toggleSidebar() {
    this.sidebarService.toggleCollapse();
  }

  showHelp() {
    // TODO: Implement help functionality
    console.log('Help clicked');
  }

  toggleOrganizationPopover(event: Event, popover: any) {
    if (this.organizationService) {
      popover.toggle(event);
    }
  }

  selectOrganization(organizationId: number | 'ORCA', popover: any) {
    if (this.organizationService) {
      this.organizationService.selectOrganization(organizationId);
      popover.hide();
    }
  }
}
