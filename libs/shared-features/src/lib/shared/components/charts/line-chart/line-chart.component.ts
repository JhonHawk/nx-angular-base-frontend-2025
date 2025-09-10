import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DarkModeService } from '../../../utils/dark-mode.service';
import { ChartData } from '../chart.types';

@Component({
  selector: 'orca-line-chart',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="card bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
      <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{{ title() }}</h3>
      <p-chart type="line" [data]="data" [options]="options" class="h-[30rem]" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements OnInit {
  title = input<string>('Line Chart');
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
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Active Users',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderColor: '#ef4444',
              data: [1200, 1900, 3000, 5000, 2300, 3200, 4100, 3900, 4500, 5200, 4800, 6100],
              fill: false,
              tension: 0.4
            },
            {
              label: 'New Signups',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              borderColor: '#22c55e',
              data: [300, 450, 600, 800, 520, 680, 750, 820, 900, 1100, 980, 1200],
              fill: false,
              tension: 0.4
            }
          ]
        };
      }

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        animation: {
          duration: 2500,
          easing: 'easeInOutCubic',
          tension: {
            duration: 1500,
            easing: 'linear',
            from: 1,
            to: 0,
            loop: false
          }
        },
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500
              }
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          },
          y: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          }
        }
      };
      
      this.cd.markForCheck();
    }
  }
}