import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import {
  HorizontalBarChartComponent,
  VerticalBarChartComponent,
  LineChartComponent,
  DoughnutChartComponent,
  PieChartComponent,
  RadarChartComponent,
  PageHeader,
  salesPerformanceData,
  userGrowthData,
  deviceUsageData,
  marketShareData,
  performanceMetricsData,
  monthlyRevenueData,
  customerSatisfactionData,
  trafficSourcesData,
  teamProductivityData,
} from 'shared-features';

interface Activity {
  id: string;
  description: string;
  timestamp: string;
  icon: string;
}

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    ChartModule,
    HorizontalBarChartComponent,
    VerticalBarChartComponent,
    LineChartComponent,
    DoughnutChartComponent,
    PieChartComponent,
    RadarChartComponent,
    PageHeader,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private router = inject(Router);

  // Mock data - replace with real service calls
  totalClients = signal(125);
  totalUsers = signal(2840);
  activeConnections = signal(156);
  pendingActions = signal(8);

  recentActivities = signal<Activity[]>([
    {
      id: '1',
      description: 'Nueva cuenta "Tech Corp" creada',
      timestamp: 'Hace 2 minutos',
      icon: 'pi-plus-circle',
    },
    {
      id: '2',
      description: 'Usuario suspendido en cuenta "Retail Inc"',
      timestamp: 'Hace 15 minutos',
      icon: 'pi-user-minus',
    },
    {
      id: '3',
      description: 'Límite de usuarios alcanzado en "StartupXYZ"',
      timestamp: 'Hace 1 hora',
      icon: 'pi-exclamation-triangle',
    },
    {
      id: '4',
      description: 'Pago procesado para cuenta "Enterprise Co"',
      timestamp: 'Hace 2 horas',
      icon: 'pi-check-circle',
    },
  ]);

  // Chart data from mock data
  salesData = salesPerformanceData;
  userGrowthChartData = userGrowthData;
  deviceData = deviceUsageData;
  marketData = marketShareData;
  performanceData = performanceMetricsData;
  revenueData = monthlyRevenueData;
  satisfactionData = customerSatisfactionData;
  trafficData = trafficSourcesData;
  productivityData = teamProductivityData;

  navigateToClients() {
    this.router.navigate(['/clients']).then();
  }

  navigateToUsers() {
    this.router.navigate(['/users']).then();
  }

  navigateToReports() {
    this.router.navigate(['/reports']).then();
  }

  navigateToSettings() {
    this.router.navigate(['/settings']).then();
  }
}
