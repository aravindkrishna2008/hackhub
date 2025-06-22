const express = require('express');
const router = express.Router();
const chartService = require('../services/chartService');

// Bar chart
router.post('/bar', async (req, res) => {
  try {
    const { labels, data, title, xLabel, yLabel, options = {} } = req.body;
    
    const chartBuffer = await chartService.createBarChart(labels, data, title, xLabel, yLabel, options);
    const base64Image = chartBuffer.toString('base64');
    
    res.json({ 
      chart: `data:image/png;base64,${base64Image}`,
      type: 'bar'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Histogram
router.post('/histogram', async (req, res) => {
  try {
    const { data, bins = 10, title, xLabel, yLabel, options = {} } = req.body;
    
    const chartBuffer = await chartService.createHistogram(data, bins, title, xLabel, yLabel, options);
    const base64Image = chartBuffer.toString('base64');
    
    res.json({ 
      chart: `data:image/png;base64,${base64Image}`,
      type: 'histogram'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Box plot
router.post('/boxplot', async (req, res) => {
  try {
    const { data, labels, title, yLabel, options = {} } = req.body;
    
    const chartBuffer = await chartService.createBoxPlot(data, labels, title, yLabel, options);
    const base64Image = chartBuffer.toString('base64');
    
    res.json({ 
      chart: `data:image/png;base64,${base64Image}`,
      type: 'boxplot'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Line graph
router.post('/line', async (req, res) => {
  try {
    const { xData, yData, title, xLabel, yLabel, options = {} } = req.body;
    
    const chartBuffer = await chartService.createLineChart(xData, yData, title, xLabel, yLabel, options);
    const base64Image = chartBuffer.toString('base64');
    
    res.json({ 
      chart: `data:image/png;base64,${base64Image}`,
      type: 'line'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scatter plot
router.post('/scatter', async (req, res) => {
  try {
    const { xData, yData, title, xLabel, yLabel, showTrendline = false, options = {} } = req.body;
    
    const chartBuffer = await chartService.createScatterPlot(xData, yData, title, xLabel, yLabel, showTrendline, options);
    const base64Image = chartBuffer.toString('base64');
    
    res.json({ 
      chart: `data:image/png;base64,${base64Image}`,
      type: 'scatter'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;