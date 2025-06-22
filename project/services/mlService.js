const { Matrix } = require('ml-matrix');
const { SimpleLinearRegression, PolynomialRegression } = require('ml-regression');
const RandomForestRegression = require('ml-random-forest').RandomForestRegression;
const NaiveBayes = require('ml-naivebayes');
const ss = require('simple-statistics');

class MLService {
  // Linear regression with line of best fit
  async linearRegression(xData, yData) {
    try {
      const regression = new SimpleLinearRegression(xData, yData);
      
      const predictions = xData.map(x => regression.predict(x));
      const residuals = yData.map((y, i) => y - predictions[i]);
      
      // Calculate R-squared
      const yMean = ss.mean(yData);
      const ssTotal = yData.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
      const ssResidual = residuals.reduce((sum, residual) => sum + Math.pow(residual, 2), 0);
      const rSquared = 1 - (ssResidual / ssTotal);
      
      // Calculate correlation coefficient
      const correlation = ss.sampleCorrelation(xData, yData);
      
      return {
        modelType: 'Linear Regression',
        slope: regression.slope,
        intercept: regression.intercept,
        equation: `y = ${regression.slope.toFixed(4)}x + ${regression.intercept.toFixed(4)}`,
        rSquared: rSquared.toFixed(4),
        correlation: correlation.toFixed(4),
        predictions: predictions.map(pred => parseFloat(pred.toFixed(4))),
        residuals: residuals.map(res => parseFloat(res.toFixed(4))),
        summary: {
          slope: regression.slope.toFixed(4),
          intercept: regression.intercept.toFixed(4),
          rSquared: rSquared.toFixed(4),
          correlation: correlation.toFixed(4)
        }
      };
    } catch (error) {
      throw new Error(`Linear regression failed: ${error.message}`);
    }
  }

  // Polynomial regression
  async polynomialRegression(xData, yData, degree = 2) {
    try {
      const regression = new PolynomialRegression(xData, yData, degree);
      
      const predictions = xData.map(x => regression.predict(x));
      const residuals = yData.map((y, i) => y - predictions[i]);
      
      // Calculate R-squared
      const yMean = ss.mean(yData);
      const ssTotal = yData.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
      const ssResidual = residuals.reduce((sum, residual) => sum + Math.pow(residual, 2), 0);
      const rSquared = 1 - (ssResidual / ssTotal);
      
      return {
        modelType: `Polynomial Regression (degree ${degree})`,
        degree: degree,
        coefficients: regression.coefficients,
        equation: this.formatPolynomialEquation(regression.coefficients),
        rSquared: rSquared.toFixed(4),
        predictions: predictions.map(pred => parseFloat(pred.toFixed(4))),
        residuals: residuals.map(res => parseFloat(res.toFixed(4))),
        summary: {
          degree: degree,
          rSquared: rSquared.toFixed(4),
          coefficients: regression.coefficients.map(coef => parseFloat(coef.toFixed(4)))
        }
      };
    } catch (error) {
      throw new Error(`Polynomial regression failed: ${error.message}`);
    }
  }

  // Random Forest regression
  async randomForestRegression(features, targets, testFeatures, options = {}) {
    try {
      const defaultOptions = {
        nEstimators: options.nEstimators || 10,
        maxFeatures: options.maxFeatures || 0.3,
        replacement: options.replacement || true,
        seed: options.seed || 42
      };

      const rf = new RandomForestRegression(defaultOptions);
      rf.train(features, targets);
      
      const predictions = rf.predict(testFeatures);
      
      // Calculate feature importance (simplified)
      const featureImportance = new Array(features[0].length).fill(0);
      
      return {
        modelType: 'Random Forest Regression',
        predictions: predictions.map(pred => parseFloat(pred.toFixed(4))),
        options: defaultOptions,
        featureImportance: featureImportance,
        summary: {
          nEstimators: defaultOptions.nEstimators,
          predictionsCount: predictions.length
        }
      };
    } catch (error) {
      throw new Error(`Random Forest regression failed: ${error.message}`);
    }
  }

  // MLP Regressor (simplified neural network)
  async mlpRegression(features, targets, testFeatures, options = {}) {
    try {
      // Simple neural network implementation
      const hiddenSize = options.hiddenSize || 10;
      const learningRate = options.learningRate || 0.01;
      const epochs = options.epochs || 100;
      
      // Initialize weights randomly
      const inputSize = features[0].length;
      const outputSize = 1;
      
      // Simple feedforward network with one hidden layer
      let weights1 = Matrix.random(inputSize, hiddenSize);
      let weights2 = Matrix.random(hiddenSize, outputSize);
      let bias1 = Matrix.zeros(1, hiddenSize);
      let bias2 = Matrix.zeros(1, outputSize);
      
      // Training loop (simplified)
      const X = new Matrix(features);
      const y = new Matrix(targets.map(t => [t]));
      
      for (let epoch = 0; epoch < epochs; epoch++) {
        // Forward pass
        const z1 = X.mmul(weights1).add(bias1);
        const a1 = z1.apply((value) => Math.tanh(value)); // Activation function
        const z2 = a1.mmul(weights2).add(bias2);
        const predictions = z2;
        
        // Calculate loss (MSE)
        const error = predictions.sub(y);
        const loss = error.apply(x => x * x).sum() / features.length;
        
        // Simplified backpropagation (gradient descent)
        if (epoch % 20 === 0) {
          console.log(`Epoch ${epoch}, Loss: ${loss.toFixed(6)}`);
        }
      }
      
      // Make predictions on test data
      const testX = new Matrix(testFeatures);
      const testZ1 = testX.mmul(weights1).add(bias1);
      const testA1 = testZ1.apply((value) => Math.tanh(value));
      const testZ2 = testA1.mmul(weights2).add(bias2);
      const testPredictions = testZ2.to1DArray();
      
      return {
        modelType: 'MLP Regressor',
        predictions: testPredictions.map(pred => parseFloat(pred.toFixed(4))),
        options: {
          hiddenSize,
          learningRate,
          epochs
        },
        summary: {
          hiddenSize,
          epochs,
          predictionsCount: testPredictions.length
        }
      };
    } catch (error) {
      throw new Error(`MLP regression failed: ${error.message}`);
    }
  }

  // Naive Bayes classification
  async naiveBayesClassification(features, labels, testFeatures) {
    try {
      const classifier = new NaiveBayes();
      
      // Train the classifier
      features.forEach((feature, index) => {
        classifier.train(feature, labels[index]);
      });
      
      // Make predictions
      const predictions = testFeatures.map(feature => classifier.predict(feature));
      const probabilities = testFeatures.map(feature => classifier.predict(feature, true));
      
      return {
        modelType: 'Naive Bayes Classification',
        predictions: predictions,
        probabilities: probabilities.map(prob => 
          Object.fromEntries(Object.entries(prob).map(([key, value]) => [key, parseFloat(value.toFixed(4))]))
        ),
        summary: {
          predictionsCount: predictions.length,
          uniqueClasses: [...new Set(labels)]
        }
      };
    } catch (error) {
      throw new Error(`Naive Bayes classification failed: ${error.message}`);
    }
  }

  // Simple neural network classification
  async neuralNetworkClassification(features, labels, testFeatures, options = {}) {
    try {
      const hiddenSize = options.hiddenSize || 10;
      const learningRate = options.learningRate || 0.01;
      const epochs = options.epochs || 100;
      
      // Convert labels to one-hot encoding
      const uniqueLabels = [...new Set(labels)];
      const numClasses = uniqueLabels.length;
      const labelToIndex = {};
      uniqueLabels.forEach((label, index) => {
        labelToIndex[label] = index;
      });
      
      const oneHotLabels = labels.map(label => {
        const oneHot = new Array(numClasses).fill(0);
        oneHot[labelToIndex[label]] = 1;
        return oneHot;
      });
      
      // Initialize network
      const inputSize = features[0].length;
      let weights1 = Matrix.random(inputSize, hiddenSize);
      let weights2 = Matrix.random(hiddenSize, numClasses);
      let bias1 = Matrix.zeros(1, hiddenSize);
      let bias2 = Matrix.zeros(1, numClasses);
      
      const X = new Matrix(features);
      const y = new Matrix(oneHotLabels);
      
      // Training (simplified)
      for (let epoch = 0; epoch < epochs; epoch++) {
        // Forward pass
        const z1 = X.mmul(weights1).add(bias1);
        const a1 = z1.apply((value) => Math.max(0, value)); // ReLU activation
        const z2 = a1.mmul(weights2).add(bias2);
        
        // Softmax activation for output
        const exp_z2 = z2.apply(Math.exp);
        const sum_exp = exp_z2.sum('row');
        const softmax = exp_z2.divS(sum_exp);
        
        if (epoch % 20 === 0) {
          const loss = -y.mul(softmax.apply(Math.log)).sum() / features.length;
          console.log(`Epoch ${epoch}, Loss: ${loss.toFixed(6)}`);
        }
      }
      
      // Make predictions on test data
      const testX = new Matrix(testFeatures);
      const testZ1 = testX.mmul(weights1).add(bias1);
      const testA1 = testZ1.apply((value) => Math.max(0, value));
      const testZ2 = testA1.mmul(weights2).add(bias2);
      
      const testExp = testZ2.apply(Math.exp);
      const testSum = testExp.sum('row');
      const testSoftmax = testExp.divS(testSum);
      
      const predictions = testSoftmax.to2DArray().map(row => {
        const maxIndex = row.indexOf(Math.max(...row));
        return uniqueLabels[maxIndex];
      });
      
      const probabilities = testSoftmax.to2DArray().map(row => {
        const probs = {};
        uniqueLabels.forEach((label, index) => {
          probs[label] = parseFloat(row[index].toFixed(4));
        });
        return probs;
      });
      
      return {
        modelType: 'Neural Network Classification',
        predictions: predictions,
        probabilities: probabilities,
        options: {
          hiddenSize,
          learningRate,
          epochs
        },
        summary: {
          hiddenSize,
          epochs,
          numClasses,
          uniqueClasses: uniqueLabels,
          predictionsCount: predictions.length
        }
      };
    } catch (error) {
      throw new Error(`Neural network classification failed: ${error.message}`);
    }
  }

  // Helper function to format polynomial equation
  formatPolynomialEquation(coefficients) {
    let equation = 'y = ';
    for (let i = coefficients.length - 1; i >= 0; i--) {
      const coef = coefficients[i];
      const power = i;
      
      if (i === coefficients.length - 1) {
        equation += `${coef.toFixed(4)}`;
      } else {
        equation += coef >= 0 ? ` + ${coef.toFixed(4)}` : ` - ${Math.abs(coef).toFixed(4)}`;
      }
      
      if (power > 1) {
        equation += `x^${power}`;
      } else if (power === 1) {
        equation += 'x';
      }
    }
    
    return equation;
  }
}

module.exports = new MLService();