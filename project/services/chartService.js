const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const ss = require('simple-statistics');

class ChartService {
  constructor() {
    this.width = 800;
    this.height = 600;
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({ 
      width: this.width, 
      height: this.height,
      backgroundColour: 'white'
    });
  }

  async createBarChart(labels, data, title, xLabel, yLabel, options = {}) {
    const configuration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: options.datasetLabel || 'Data',
          data: data,
          backgroundColor: options.backgroundColor || 'rgba(54, 162, 235, 0.6)',
          borderColor: options.borderColor || 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: title || 'Bar Chart'
          },
          legend: {
            display: options.showLegend !== false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xLabel || 'Categories'
            }
          },
          y: {
            title: {
              display: true,
              text: yLabel || 'Values'
            },
            beginAtZero: true
          }
        }
      }
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  async createHistogram(data, bins = 10, title, xLabel, yLabel, options = {}) {
    // Calculate histogram bins
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;
    
    const binEdges = [];
    const binCounts = new Array(bins).fill(0);
    const binLabels = [];
    
    for (let i = 0; i <= bins; i++) {
      binEdges.push(min + i * binWidth);
    }
    
    for (let i = 0; i < bins; i++) {
      binLabels.push(`${binEdges[i].toFixed(2)}-${binEdges[i + 1].toFixed(2)}`);
    }
    
    // Count data points in each bin
    data.forEach(value => {
      let binIndex = Math.floor((value - min) / binWidth);
      if (binIndex === bins) binIndex = bins - 1; // Handle edge case
      binCounts[binIndex]++;
    });

    const configuration = {
      type: 'bar',
      data: {
        labels: binLabels,
        datasets: [{
          label: options.datasetLabel || 'Frequency',
          data: binCounts,
          backgroundColor: options.backgroundColor || 'rgba(75, 192, 192, 0.6)',
          borderColor: options.borderColor || 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: title || 'Histogram'
          },
          legend: {
            display: options.showLegend !== false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xLabel || 'Bins'
            }
          },
          y: {
            title: {
              display: true,
              text: yLabel || 'Frequency'
            },
            beginAtZero: true
          }
        }
      }
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  async createBoxPlot(data, labels, title, yLabel, options = {}) {
    // Calculate box plot statistics for each dataset
    const datasets = Array.isArray(data[0]) ? data : [data];
    const datasetLabels = labels || datasets.map((_, i) => `Dataset ${i + 1}`);
    
    const boxPlotData = datasets.map((dataset, index) => {
      const sorted = [...dataset].sort((a, b) => a - b);
      const q1 = ss.quantile(sorted, 0.25);
      const median = ss.median(sorted);
      const q3 = ss.quantile(sorted, 0.75);
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;
      
      const outliers = sorted.filter(val => val < lowerFence || val > upperFence);
      const min = Math.max(Math.min(...sorted), lowerFence);
      const max = Math.min(Math.max(...sorted), upperFence);

      return {
        label: datasetLabels[index],
        data: [{
          x: index,
          min: min,
          q1: q1,
          median: median,
          q3: q3,
          max: max,
          outliers: outliers
        }],
        backgroundColor: options.backgroundColor || 'rgba(255, 99, 132, 0.6)',
        borderColor: options.borderColor || 'rgba(255, 99, 132, 1)'
      };
    });

    // Since Chart.js doesn't have native box plot support, we'll create a custom representation
    const configuration = {
      type: 'scatter',
      data: {
        datasets: boxPlotData.map((dataset, index) => ({
          label: dataset.label,
          data: [
            { x: index - 0.2, y: dataset.data[0].min },
            { x: index - 0.2, y: dataset.data[0].q1 },
            { x: index - 0.2, y: dataset.data[0].median },
            { x: index - 0.2, y: dataset.data[0].q3 },
            { x: index - 0.2, y: dataset.data[0].max }
          ],
          backgroundColor: dataset.backgroundColor,
          borderColor: dataset.borderColor,
          pointRadius: 3
        }))
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: title || 'Box Plot'
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Groups'
            }
          },
          y: {
            title: {
              display: true,
              text: yLabel || 'Values'
            }
          }
        }
      }
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  async createLineChart(xData, yData, title, xLabel, yLabel, options = {}) {
    const data = xData.map((x, i) => ({ x: x, y: yData[i] }));

    const configuration = {
      type: 'line',
      data: {
        datasets: [{
          label: options.datasetLabel || 'Data',
          data: data,
          borderColor: options.borderColor || 'rgba(255, 99, 132, 1)',
          backgroundColor: options.backgroundColor || 'rgba(255, 99, 132, 0.2)',
          fill: options.fill || false,
          tension: options.tension || 0.1
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: title || 'Line Chart'
          },
          legend: {
            display: options.showLegend !== false
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: xLabel || 'X Values'
            }
          },
          y: {
            title: {
              display: true,
              text: yLabel || 'Y Values'
            }
          }
        }
      }
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  async createScatterPlot(xData, yData, title, xLabel, yLabel, showTrendline = false, options = {}) {
    const data = xData.map((x, i) => ({ x: x, y: yData[i] }));
    
    const datasets = [{
      label: options.datasetLabel || 'Data Points',
      data: data,
      backgroundColor: options.backgroundColor || 'rgba(54, 162, 235, 0.6)',
      borderColor: options.borderColor || 'rgba(54, 162, 235, 1)',
      pointRadius: options.pointRadius || 4
    }];

    // Add trendline if requested
    if (showTrendline) {
      const regression = ss.linearRegression(data.map(point => [point.x, point.y]));
      const regressionLine = ss.linearRegressionLine(regression);
      
      const minX = Math.min(...xData);
      const maxX = Math.max(...xData);
      const trendlineData = [
        { x: minX, y: regressionLine(minX) },
        { x: maxX, y: regressionLine(maxX) }
      ];

      datasets.push({
        label: 'Trendline',
        data: trendlineData,
        type: 'line',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        pointRadius: 0,
        tension: 0
      });
    }

    const configuration = {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: title || 'Scatter Plot'
          },
          legend: {
            display: options.showLegend !== false
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: xLabel || 'X Values'
            }
          },
          y: {
            title: {
              display: true,
              text: yLabel || 'Y Values'
            }
          }
        }
      }
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }
}

module.exports = new ChartService();