import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DarkModeService } from '../../../utils/dark-mode.service';
import { ChartData } from '../chart.types';

@Component({
  selector: 'orca-radar-chart',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="card bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
      <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{{ title() }}</h3>
      <p-chart type="radar" [data]="data" [options]="options" class="h-[30rem]" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarChartComponent implements OnInit {
  title = input<string>('Radar Chart');
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
      const textColorSecondary = isDark ? '#a1a1aa' : '#71717a';
      const surfaceBorder = isDark ? '#3f3f46' : '#e4e4e7';

      if (this.chartData()) {
        this.data = this.chartData();
      } else {
        // Default data
        this.data = {
          labels: ['Performance', 'Reliability', 'Security', 'Scalability', 'Usability', 'Maintainability'],
          datasets: [
            {
              label: 'Current System',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: '#3b82f6',
              data: [85, 92, 78, 88, 95, 82],
              fill: true,
              tension: 0.1
            },
            {
              label: 'Target System',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderColor: '#10b981',
              data: [95, 98, 90, 95, 98, 92],
              fill: true,
              tension: 0.1
            }
          ]
        };
      }

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        animation: {
          duration: 2800,
          easing: 'easeInOutQuint',
          animateScale: true,
          animateRotate: true
        },
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: textColorSecondary,
              backdropColor: 'transparent'
            },
            grid: {
              color: surfaceBorder
            },
            angleLines: {
              color: surfaceBorder
            },
            pointLabels: {
              color: textColor
            }
          }
        }
      };
      
      this.cd.markForCheck();
    }
  }
}