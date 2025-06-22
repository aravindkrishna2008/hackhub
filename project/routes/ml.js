const express = require('express');
const router = express.Router();
const mlService = require('../services/mlService');

// Linear regression with line of best fit
router.post('/regression/linear', async (req, res) => {
  try {
    const { xData, yData } = req.body;
    
    const result = await mlService.linearRegression(xData, yData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Polynomial regression
router.post('/regression/polynomial', async (req, res) => {
  try {
    const { xData, yData, degree = 2 } = req.body;
    
    const result = await mlService.polynomialRegression(xData, yData, degree);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Random Forest regression
router.post('/regression/random-forest', async (req, res) => {
  try {
    const { features, targets, testFeatures, options = {} } = req.body;
    
    const result = await mlService.randomForestRegression(features, targets, testFeatures, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MLP Regressor
router.post('/regression/mlp', async (req, res) => {
  try {
    const { features, targets, testFeatures, options = {} } = req.body;
    
    const result = await mlService.mlpRegression(features, targets, testFeatures, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Naive Bayes classification
router.post('/classification/naive-bayes', async (req, res) => {
  try {
    const { features, labels, testFeatures } = req.body;
    
    const result = await mlService.naiveBayesClassification(features, labels, testFeatures);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple neural network classification
router.post('/classification/neural-network', async (req, res) => {
  try {
    const { features, labels, testFeatures, options = {} } = req.body;
    
    const result = await mlService.neuralNetworkClassification(features, labels, testFeatures, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;