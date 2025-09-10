import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DarkModeService } from '../../../utils/dark-mode.service';
import { ChartData } from '../chart.types';

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="card bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
      <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{{ title() }}</h3>
      <p-chart type="doughnut" [data]="data" [options]="options" class="h-[30rem]" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoughnutChartComponent implements OnInit {
  title = input<string>('Doughnut Chart');
  chartData = input<ChartData>();

  data: any;
  options: any;

  platformId = inject(PLATFORM_ID);
  darkModeService = inject(DarkModeService);
  
  constructor(private cd: ChangeDetectorRef) {}

  themeEffect = effect(() => {
    if (this.darkModeService.isDarkMode()) {
      this.initChart();
    } else {
      this.initChart();
    }
  });

  ngOnInit() {
    this.initChart();
  }

  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const isDark = this.darkModeService.isDarkMode();
      
      // Theme-aware colors
      const textColor = isDark ? '#f4f4f5' : '#09090b';

      if (this.chartData()) {
        this.data = this.chartData();
      } else {
        // Default data
        this.data = {
          labels: ['Desktop', 'Mobile', 'Tablet'],
          datasets: [
            {
              label: 'Device Usage',
              backgroundColor: [
                '#3b82f6', // blue
                '#10b981', // green
                '#f59e0b', // amber
                '#ef4444', // red
                '#8b5cf6'  // purple
              ],
              borderColor: isDark ? '#27272a' : '#ffffff',
              data: [65, 25, 10],
              hoverOffset: 4
            }
          ]
        };
      }

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            labels: {
              color: textColor,
              usePointStyle: true,
              padding: 20
            },
            position: 'bottom'
          }
        },
        cutout: '60%'
      };
      
      this.cd.markForCheck();
    }
  }
}