import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeader } from 'customer-features';

interface Activity {
  id: string;
  description: string;
  timestamp: string;
  icon: string;
}

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [PageHeader],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private router = inject(Router);

  // Mock data - replace with real service calls
  teamMembers = signal(45);
  activeProjects = signal(12);
  upcomingEvents = signal(5);
  completedTasks = signal(128);

  recentActivities = signal<Activity[]>([
    {
      id: '1',
      description: 'Nuevo miembro agregado al equipo de Marketing',
      timestamp: 'Hace 30 minutos',
      icon: 'pi-user-plus'
    },
    {
      id: '2',
      description: 'Completado proyecto "Campaña Q4"',
      timestamp: 'Hace 2 horas',
      icon: 'pi-check-circle'
    },
    {
      id: '3',
      description: 'Reunión de equipo programada para mañana',
      timestamp: 'Hace 4 horas',
      icon: 'pi-calendar'
    },
    {
      id: '4',
      description: 'Actualización de estructura organizacional',
      timestamp: 'Ayer',
      icon: 'pi-sitemap'
    }
  ]);

  navigateToTeam() {
    this.router.navigate(['/team']).then();
  }

  navigateToOrganization() {
    this.router.navigate(['/organization']).then();
  }

  navigateToReports() {
    this.router.navigate(['/reports']).then();
  }

  navigateToProfile() {
    this.router.navigate(['/profile']).then();
  }
}
