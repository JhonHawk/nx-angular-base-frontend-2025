import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { BreadcrumbService } from '../../internal';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [BreadcrumbModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  private breadcrumbService = inject(BreadcrumbService);

  // Home item (separate from model items)
  homeItem = computed<MenuItem>(() => ({
    icon: 'pi pi-home',
    routerLink: '/home',
    tooltip: 'Ir al Dashboard'
  }));

  // Items without home (PrimeNG handles home separately)
  items = computed<MenuItem[]>(() => {
    const allBreadcrumbs = this.breadcrumbService.breadcrumbs();
    // Remove the first item (home) since it's handled by [home] property
    return allBreadcrumbs.slice(1);
  });
}
