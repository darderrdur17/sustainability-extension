// 🌱 EcoGuard Pro - Dashboard Module
class DashboardManager {
  constructor() {
    this.charts = {};
    this.data = {
      weeklyTrend: [],
      categoryBreakdown: {},
      industryComparison: [],
      carbonTracking: []
    };
  }

  async init() {
    await this.loadData();
    this.initializeCharts();
  }

  async loadData() {
    // Load analysis history
    const history = await chrome.storage.local.get(['analysisHistory']);
    const analysisHistory = history.analysisHistory || [];
    
    // Process data for charts
    this.processWeeklyTrend(analysisHistory);
    this.processCategoryBreakdown(analysisHistory);
    this.processIndustryComparison(analysisHistory);
    this.processCarbonTracking(analysisHistory);
  }

  processWeeklyTrend(history) {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayAnalyses = history.filter(item => 
        new Date(item.timestamp).toDateString() === dateStr
      );
      
      const avgScore = dayAnalyses.length > 0 
        ? dayAnalyses.reduce((sum, item) => sum + (item.score || 0), 0) / dayAnalyses.length
        : 0;
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score: Math.round(avgScore),
        count: dayAnalyses.length
      });
    }
    
    this.data.weeklyTrend = last7Days;
  }

  processCategoryBreakdown(history) {
    if (history.length === 0) return;
    
    const totals = { environmental: 0, social: 0, governance: 0 };
    let count = 0;
    
    history.forEach(item => {
      if (item.breakdownScores) {
        totals.environmental += item.breakdownScores.environmental || 0;
        totals.social += item.breakdownScores.social || 0;
        totals.governance += item.breakdownScores.governance || 0;
        count++;
      }
    });
    
    if (count > 0) {
      this.data.categoryBreakdown = {
        environmental: Math.round(totals.environmental / count),
        social: Math.round(totals.social / count),
        governance: Math.round(totals.governance / count)
      };
    }
  }

  processIndustryComparison(history) {
    // Simulate industry benchmark data
    this.data.industryComparison = [
      { industry: 'Technology', score: 75, userScore: this.getUserAverageScore(history) },
      { industry: 'Fashion', score: 45, userScore: this.getUserAverageScore(history) },
      { industry: 'Automotive', score: 60, userScore: this.getUserAverageScore(history) },
      { industry: 'Food & Beverage', score: 55, userScore: this.getUserAverageScore(history) }
    ];
  }

  processCarbonTracking(history) {
    // Simulate carbon tracking data based on analysis scores
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayAnalyses = history.filter(item => 
        new Date(item.timestamp).toDateString() === date.toDateString()
      );
      
      let carbonImpact = 0;
      if (dayAnalyses.length > 0) {
        const avgScore = dayAnalyses.reduce((sum, item) => sum + (item.score || 0), 0) / dayAnalyses.length;
        carbonImpact = Math.max(0, (100 - avgScore) * 0.1 * dayAnalyses.length);
      }
      
      last30Days.push({
        date: date.toISOString().split('T')[0],
        carbon: carbonImpact
      });
    }
    
    this.data.carbonTracking = last30Days;
  }

  getUserAverageScore(history) {
    if (history.length === 0) return 0;
    const validScores = history.filter(item => item.score).map(item => item.score);
    return validScores.length > 0 
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;
  }

  initializeCharts() {
    this.createTrendChart();
    this.createCategoryChart();
    this.createBenchmarkChart();
  }

  createTrendChart() {
    const canvas = document.getElementById('trend-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    this.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.data.weeklyTrend.map(d => d.date),
        datasets: [{
          label: 'Sustainability Score',
          data: this.data.weeklyTrend.map(d => d.score),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0,0,0,0.1)'
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              afterLabel: (context) => {
                const dataPoint = this.data.weeklyTrend[context.dataIndex];
                return `Analyses: ${dataPoint.count}`;
              }
            }
          }
        }
      }
    });
  }

  createCategoryChart() {
    const canvas = document.getElementById('category-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    this.charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Environmental', 'Social', 'Governance'],
        datasets: [{
          data: [
            this.data.categoryBreakdown.environmental || 0,
            this.data.categoryBreakdown.social || 0,
            this.data.categoryBreakdown.governance || 0
          ],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b'
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.parsed}/25`;
              }
            }
          }
        }
      }
    });
  }

  createBenchmarkChart() {
    const canvas = document.getElementById('benchmark-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const userAvg = this.getUserAverageScore(this.data.weeklyTrend);
    
    this.charts.benchmark = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.data.industryComparison.map(d => d.industry),
        datasets: [
          {
            label: 'Industry Average',
            data: this.data.industryComparison.map(d => d.score),
            backgroundColor: 'rgba(107, 114, 128, 0.6)',
            borderColor: '#6b7280',
            borderWidth: 1
          },
          {
            label: 'Your Average',
            data: this.data.industryComparison.map(() => userAvg),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10b981',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0,0,0,0.1)'
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 10
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            cornerRadius: 8
          }
        }
      }
    });
  }

  async updateCharts() {
    await this.loadData();
    
    // Update trend chart
    if (this.charts.trend) {
      this.charts.trend.data.labels = this.data.weeklyTrend.map(d => d.date);
      this.charts.trend.data.datasets[0].data = this.data.weeklyTrend.map(d => d.score);
      this.charts.trend.update();
    }
    
    // Update category chart
    if (this.charts.category) {
      this.charts.category.data.datasets[0].data = [
        this.data.categoryBreakdown.environmental || 0,
        this.data.categoryBreakdown.social || 0,
        this.data.categoryBreakdown.governance || 0
      ];
      this.charts.category.update();
    }
    
    // Update benchmark chart
    if (this.charts.benchmark) {
      const userAvg = this.getUserAverageScore(this.data.weeklyTrend);
      this.charts.benchmark.data.datasets[1].data = this.data.industryComparison.map(() => userAvg);
      this.charts.benchmark.update();
    }
  }

  updateCarbonStats() {
    const recent = this.data.carbonTracking.slice(-30);
    
    const today = recent[recent.length - 1]?.carbon || 0;
    const week = recent.slice(-7).reduce((sum, d) => sum + d.carbon, 0);
    const month = recent.reduce((sum, d) => sum + d.carbon, 0);
    
    document.getElementById('daily-carbon').textContent = `${today.toFixed(1)} kg`;
    document.getElementById('weekly-carbon').textContent = `${week.toFixed(1)} kg`;
    document.getElementById('monthly-carbon').textContent = `${month.toFixed(1)} kg`;
  }

  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
}

// Global dashboard manager instance
window.dashboardManager = new DashboardManager(); 
