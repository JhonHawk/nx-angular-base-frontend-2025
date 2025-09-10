// Mock data for various chart types

export const salesPerformanceData = {
  labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
  datasets: [
    {
      label: 'Revenue (thousands)',
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      data: [450, 620, 580, 750]
    },
    {
      label: 'Profit (thousands)',
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      data: [125, 180, 165, 220]
    }
  ]
};

export const userGrowthData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Active Users',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: '#ef4444',
      data: [1200, 1450, 1800, 2100, 2300, 2800, 3200, 3100, 3500, 3900, 4200, 4800],
      fill: false,
      tension: 0.4
    },
    {
      label: 'Premium Users',
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      borderColor: '#fbbf24',
      data: [180, 220, 280, 320, 380, 450, 520, 490, 580, 640, 720, 850],
      fill: false,
      tension: 0.4
    }
  ]
};

export const deviceUsageData = {
  labels: ['Desktop', 'Mobile', 'Tablet', 'Smart TV', 'Other'],
  datasets: [
    {
      label: 'Device Usage (%)',
      backgroundColor: [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6'  // purple
      ],
      data: [45, 35, 12, 5, 3],
      hoverOffset: 4
    }
  ]
};

export const marketShareData = {
  labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
  datasets: [
    {
      label: 'Market Share (%)',
      backgroundColor: [
        '#06b6d4', // cyan
        '#84cc16', // lime
        '#f97316', // orange
        '#ec4899', // pink
        '#6366f1'  // indigo
      ],
      data: [28, 22, 18, 16, 16],
      hoverOffset: 6
    }
  ]
};

export const performanceMetricsData = {
  labels: ['Speed', 'Reliability', 'Security', 'Scalability', 'User Experience', 'Cost Efficiency'],
  datasets: [
    {
      label: 'Current Performance',
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      borderColor: '#3b82f6',
      data: [85, 92, 78, 88, 95, 82],
      fill: true,
      tension: 0.1
    },
    {
      label: 'Target Performance',
      backgroundColor: 'rgba(16, 185, 129, 0.3)',
      borderColor: '#10b981',
      data: [95, 98, 90, 95, 98, 92],
      fill: true,
      tension: 0.1
    }
  ]
};

export const monthlyRevenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: '2023 Revenue',
      backgroundColor: '#8b5cf6',
      borderColor: '#8b5cf6',
      data: [65000, 72000, 58000, 81000, 95000, 88000, 92000, 85000, 98000, 105000, 115000, 125000]
    },
    {
      label: '2024 Revenue',
      backgroundColor: '#06b6d4',
      borderColor: '#06b6d4',
      data: [78000, 85000, 68000, 95000, 108000, 102000, 115000, 98000, 125000, 138000, 142000, 155000]
    }
  ]
};

export const customerSatisfactionData = {
  labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
  datasets: [
    {
      label: 'Customer Satisfaction',
      backgroundColor: [
        '#10b981', // green
        '#84cc16', // lime
        '#f59e0b', // amber
        '#f97316', // orange
        '#ef4444'  // red
      ],
      data: [45, 35, 12, 6, 2],
      hoverOffset: 4
    }
  ]
};

export const trafficSourcesData = {
  labels: ['Organic Search', 'Direct', 'Social Media', 'Email Marketing', 'Paid Ads', 'Referrals'],
  datasets: [
    {
      label: 'Traffic Sources (%)',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      data: [42, 28, 15, 8, 5, 2],
      fill: false,
      tension: 0.4
    }
  ]
};

export const teamProductivityData = {
  labels: ['Development', 'Design', 'Marketing', 'Sales', 'Support', 'Operations'],
  datasets: [
    {
      label: 'Productivity Score',
      backgroundColor: 'rgba(236, 72, 153, 0.3)',
      borderColor: '#ec4899',
      data: [92, 88, 85, 90, 87, 89],
      fill: true,
      tension: 0.1
    }
  ]
};