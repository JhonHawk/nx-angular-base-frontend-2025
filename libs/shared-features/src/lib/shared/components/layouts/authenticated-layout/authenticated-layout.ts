import { ChangeDetectionStrategy, Component, inject, OnInit, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopMenuComponent } from '../top-menu/top-menu.component';
import { OrganizationService } from '../../../internal';

@Component({
  standalone: true,
  selector: 'app-authenticated-layout',
  imports: [RouterOutlet, SidebarComponent, TopMenuComponent],
  templateUrl: './authenticated-layout.html',
  styleUrl: './authenticated-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedLayout implements OnInit {
  private organizationService = inject(OrganizationService);

  logout = output<void>();
  profileClick = output<void>();

  ngOnInit() {
    // Initialize organization service from storage
    this.organizationService.initializeFromStorage();
  }
}
