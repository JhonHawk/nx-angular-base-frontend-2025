import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DarkModeService } from '../../../utils/dark-mode.service';
import { ChartData } from '../chart.types';

@Component({
  selector: 'orca-horizontal-bar-chart',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="card bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
      <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">{{ title() }}</h3>
      <p-chart type="bar" [data]="data" [options]="options" class="h-[30rem]" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HorizontalBarChartComponent implements OnInit {
  title = input<string>('Horizontal Bar Chart');
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
      const documentStyle = getComputedStyle(document.documentElement);
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
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
              label: 'Sales',
              backgroundColor: '#3b82f6',
              borderColor: '#3b82f6',
              data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
              label: 'Revenue',
              backgroundColor: '#10b981',
              borderColor: '#10b981',
              data: [28, 48, 40, 19, 86, 27, 90]
            }
          ]
        };
      }

      this.options = {
        indexAxis: 'y',
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        animation: {
          duration: 2200,
          easing: 'easeInOutQuart',
          delay: (context: any) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 200;
            }
            return delay;
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