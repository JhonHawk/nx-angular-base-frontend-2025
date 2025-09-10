/**
 * Chart-related type definitions
 * Co-located with chart components for better maintainability
 */

export interface ChartDataset {
  label: string;
  backgroundColor: string | string[];
  borderColor?: string | string[];
  data: number[];
  fill?: boolean;
  tension?: number;
  hoverOffset?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface LineChartDataset extends ChartDataset {
  fill?: boolean;
  tension?: number;
}

export interface DoughnutChartDataset extends ChartDataset {
  hoverOffset?: number;
}

export interface RadarChartDataset extends ChartDataset {
  fill?: boolean;
  tension?: number;
}