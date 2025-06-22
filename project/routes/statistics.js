const express = require('express');
const router = express.Router();
const statisticsService = require('../services/statisticsService');

// One-proportion z-test
router.post('/z-test/one-proportion', async (req, res) => {
  try {
    const { successes, sampleSize, hypothesizedProportion, alternativeHypothesis = 'two-sided', significance = 0.05 } = req.body;
    
    if (!successes || !sampleSize || hypothesizedProportion === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = statisticsService.oneProportionZTest(
      successes, 
      sampleSize, 
      hypothesizedProportion, 
      alternativeHypothesis, 
      significance
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Two-proportion z-test
router.post('/z-test/two-proportion', async (req, res) => {
  try {
    const { successes1, sampleSize1, successes2, sampleSize2, alternativeHypothesis = 'two-sided', significance = 0.05 } = req.body;
    
    const result = statisticsService.twoProportionZTest(
      successes1, 
      sampleSize1, 
      successes2, 
      sampleSize2, 
      alternativeHypothesis, 
      significance
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// One-sample t-test
router.post('/t-test/one-sample', async (req, res) => {
  try {
    const { data, hypothesizedMean, alternativeHypothesis = 'two-sided', significance = 0.05 } = req.body;
    
    const result = statisticsService.oneSampleTTest(
      data, 
      hypothesizedMean, 
      alternativeHypothesis, 
      significance
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Two-sample t-test
router.post('/t-test/two-sample', async (req, res) => {
  try {
    const { data1, data2, alternativeHypothesis = 'two-sided', significance = 0.05, equalVariances = true } = req.body;
    
    const result = statisticsService.twoSampleTTest(
      data1, 
      data2, 
      alternativeHypothesis, 
      significance, 
      equalVariances
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chi-squared goodness of fit test
router.post('/chi-squared/goodness-of-fit', async (req, res) => {
  try {
    const { observed, expected, significance = 0.05 } = req.body;
    
    const result = statisticsService.chiSquaredGoodnessOfFit(observed, expected, significance);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chi-squared test for independence/homogeneity
router.post('/chi-squared/independence', async (req, res) => {
  try {
    const { contingencyTable, significance = 0.05 } = req.body;
    
    const result = statisticsService.chiSquaredIndependence(contingencyTable, significance);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ANOVA test
router.post('/anova', async (req, res) => {
  try {
    const { groups, significance = 0.05 } = req.body;
    
    const result = statisticsService.anovaTest(groups, significance);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Descriptive statistics
router.post('/descriptive', async (req, res) => {
  try {
    const { data } = req.body;
    
    const result = statisticsService.descriptiveStatistics(data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;