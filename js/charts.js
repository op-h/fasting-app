/**
 * Charts.js
 * Wrapper for Chart.js integration
 */

export const WeightChart = {
  chartInstance: null,

  init(canvasId, weightLogs, unit = 'kg') {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Prepare data
    const labels = weightLogs.map(log => {
      const date = new Date(log.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const dataPoints = weightLogs.map(log => log.weight);

    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)'); // Emerald
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    const config = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Weight (${unit})`,
          data: dataPoints,
          borderColor: '#10b981',
          backgroundColor: gradient,
          borderWidth: 3,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              color: '#64748b'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#64748b'
            }
          }
        }
      }
    };

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, config);
  },

  update(weightLogs) {
    if (this.chartInstance) {
      const labels = weightLogs.map(log => {
        const date = new Date(log.timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      const dataPoints = weightLogs.map(log => log.weight);

      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = dataPoints;
      this.chartInstance.update();
    }
  }
};
