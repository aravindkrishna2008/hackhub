const natural = require('natural');
const compromise = require('compromise');
const statisticsService = require('./statisticsService');
const chartService = require('./chartService');
const mlService = require('./mlService');

class ChatbotService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Define intent patterns
    this.intents = {
      'statistical_test': [
        'test', 'ttest', 'ztest', 'anova', 'chi', 'statistical', 'hypothesis', 'significant'
      ],
      'visualization': [
        'chart', 'graph', 'plot', 'histogram', 'scatter', 'bar', 'line', 'box', 'visualize', 'show'
      ],
      'descriptive_stats': [
        'mean', 'average', 'median', 'mode', 'standard', 'deviation', 'variance', 'summary', 'describe'
      ],
      'regression': [
        'regression', 'predict', 'forecast', 'trend', 'correlation', 'relationship', 'model'
      ],
      'classification': [
        'classify', 'classification', 'predict', 'category', 'class', 'label'
      ]
    };
  }

  async processMessage(message, data, context = {}) {
    try {
      const intent = this.recognizeIntent(message);
      const entities = this.extractEntities(message);
      
      let response = {
        intent: intent,
        entities: entities,
        message: message,
        response: '',
        data: null,
        chart: null,
        suggestions: []
      };

      switch (intent) {
        case 'statistical_test':
          response = await this.handleStatisticalTest(message, data, entities, response);
          break;
        case 'visualization':
          response = await this.handleVisualization(message, data, entities, response);
          break;
        case 'descriptive_stats':
          response = await this.handleDescriptiveStats(message, data, entities, response);
          break;
        case 'regression':
          response = await this.handleRegression(message, data, entities, response);
          break;
        case 'classification':
          response = await this.handleClassification(message, data, entities, response);
          break;
        default:
          response = await this.handleGeneral(message, data, entities, response);
      }

      return response;
    } catch (error) {
      return {
        intent: 'error',
        message: message,
        response: `I encountered an error processing your request: ${error.message}`,
        data: null,
        chart: null,
        suggestions: [
          'Try rephrasing your question',
          'Make sure your data is properly formatted',
          'Check if all required parameters are provided'
        ]
      };
    }
  }

  recognizeIntent(message) {
    const tokens = this.tokenizer.tokenize(message.toLowerCase());
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));
    
    let maxScore = 0;
    let detectedIntent = 'general';
    
    for (const [intent, keywords] of Object.entries(this.intents)) {
      const score = keywords.reduce((acc, keyword) => {
        const stemmedKeyword = this.stemmer.stem(keyword);
        return acc + (stemmedTokens.includes(stemmedKeyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }
    
    return detectedIntent;
  }

  extractEntities(message) {
    const doc = compromise(message);
    
    return {
      numbers: doc.numbers().out('array'),
      nouns: doc.nouns().out('array'),
      verbs: doc.verbs().out('array'),
      testTypes: this.extractTestTypes(message),
      chartTypes: this.extractChartTypes(message)
    };
  }

  extractTestTypes(message) {
    const testTypes = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('t-test') || lowerMessage.includes('ttest')) {
      testTypes.push('t-test');
    }
    if (lowerMessage.includes('z-test') || lowerMessage.includes('ztest')) {
      testTypes.push('z-test');
    }
    if (lowerMessage.includes('anova')) {
      testTypes.push('anova');
    }
    if (lowerMessage.includes('chi') || lowerMessage.includes('χ²')) {
      testTypes.push('chi-squared');
    }
    
    return testTypes;
  }

  extractChartTypes(message) {
    const chartTypes = [];
    const lowerMessage = message.toLowerCase();
    
    const charts = ['bar', 'histogram', 'scatter', 'line', 'box'];
    charts.forEach(chart => {
      if (lowerMessage.includes(chart)) {
        chartTypes.push(chart);
      }
    });
    
    return chartTypes;
  }

  async handleStatisticalTest(message, data, entities, response) {
    const testTypes = entities.testTypes;
    
    if (testTypes.length === 0) {
      response.response = "I can help you with statistical tests! Which test would you like to perform? I support:\n" +
                         "• T-tests (one-sample, two-sample)\n" +
                         "• Z-tests (one-proportion, two-proportion)\n" +
                         "• Chi-squared tests (goodness of fit, independence)\n" +
                         "• ANOVA";
      response.suggestions = [
        'Perform a t-test on my data',
        'Run a chi-squared test',
        'Compare two groups with ANOVA',
        'Test proportions with z-test'
      ];
      return response;
    }

    // Handle specific test types
    if (testTypes.includes('t-test') && data && data.length > 0) {
      if (Array.isArray(data[0])) {
        // Two-sample t-test
        response.data = statisticsService.twoSampleTTest(data[0], data[1]);
        response.response = `I performed a two-sample t-test. ${response.data.conclusion}`;
      } else {
        // One-sample t-test (need hypothesized mean)
        const hypothesizedMean = entities.numbers.length > 0 ? parseFloat(entities.numbers[0]) : 0;
        response.data = statisticsService.oneSampleTTest(data, hypothesizedMean);
        response.response = `I performed a one-sample t-test against a hypothesized mean of ${hypothesizedMean}. ${response.data.conclusion}`;
      }
    } else if (testTypes.includes('anova') && data && Array.isArray(data[0])) {
      response.data = statisticsService.anovaTest(data);
      response.response = `I performed an ANOVA test. ${response.data.conclusion}`;
    }

    return response;
  }

  async handleVisualization(message, data, entities, response) {
    const chartTypes = entities.chartTypes;
    
    if (chartTypes.length === 0 || !data || data.length === 0) {
      response.response = "I can create various charts for your data! What type of visualization would you like?\n" +
                         "• Bar chart\n• Histogram\n• Scatter plot\n• Line graph\n• Box plot";
      response.suggestions = [
        'Create a histogram of my data',
        'Show a scatter plot',
        'Make a bar chart',
        'Generate a box plot'
      ];
      return response;
    }

    const chartType = chartTypes[0];
    try {
      let chartBuffer;
      
      switch (chartType) {
        case 'histogram':
          chartBuffer = await chartService.createHistogram(data, 10, 'Data Distribution');
          break;
        case 'bar':
          const labels = data.map((_, i) => `Item ${i + 1}`);
          chartBuffer = await chartService.createBarChart(labels, data, 'Bar Chart');
          break;
        case 'scatter':
          if (Array.isArray(data[0]) && data.length >= 2) {
            chartBuffer = await chartService.createScatterPlot(data[0], data[1], 'Scatter Plot', 'X Values', 'Y Values', true);
          }
          break;
        case 'line':
          const xValues = data.map((_, i) => i);
          chartBuffer = await chartService.createLineChart(xValues, data, 'Line Chart');
          break;
        case 'box':
          chartBuffer = await chartService.createBoxPlot([data], ['Data'], 'Box Plot');
          break;
      }

      if (chartBuffer) {
        response.chart = `data:image/png;base64,${chartBuffer.toString('base64')}`;
        response.response = `I've created a ${chartType} chart for your data. The visualization shows the distribution and patterns in your dataset.`;
      }
    } catch (error) {
      response.response = `I had trouble creating the ${chartType} chart. Please check your data format.`;
    }

    return response;
  }

  async handleDescriptiveStats(message, data, entities, response) {
    if (!data || data.length === 0) {
      response.response = "I need data to calculate descriptive statistics. Please provide your dataset.";
      return response;
    }

    const flatData = Array.isArray(data[0]) ? data.flat() : data;
    response.data = statisticsService.descriptiveStatistics(flatData);
    
    response.response = `Here are the descriptive statistics for your data:\n` +
                       `• Mean: ${response.data.mean}\n` +
                       `• Median: ${response.data.median}\n` +
                       `• Standard Deviation: ${response.data.standardDeviation}\n` +
                       `• Min: ${response.data.minimum}, Max: ${response.data.maximum}\n` +
                       `• Sample Size: ${response.data.count}`;

    return response;
  }

  async handleRegression(message, data, entities, response) {
    if (!data || !Array.isArray(data[0]) || data.length < 2) {
      response.response = "I need x and y data arrays to perform regression analysis. Please provide data in the format [[x1, x2, ...], [y1, y2, ...]]";
      return response;
    }

    try {
      response.data = await mlService.linearRegression(data[0], data[1]);
      response.response = `I performed linear regression on your data. The equation is: ${response.data.equation}\n` +
                         `R-squared: ${response.data.rSquared} (${(parseFloat(response.data.rSquared) * 100).toFixed(1)}% of variance explained)\n` +
                         `Correlation: ${response.data.correlation}`;
      
      // Create scatter plot with trendline
      const chartBuffer = await chartService.createScatterPlot(
        data[0], data[1], 
        'Linear Regression', 'X Values', 'Y Values', true
      );
      response.chart = `data:image/png;base64,${chartBuffer.toString('base64')}`;
    } catch (error) {
      response.response = `I had trouble performing regression analysis: ${error.message}`;
    }

    return response;
  }

  async handleClassification(message, data, entities, response) {
    response.response = "I can help with classification tasks using Naive Bayes or Neural Networks. " +
                       "Please provide features and labels in the format: {features: [[...], [...]], labels: [...], testFeatures: [[...]]}";
    response.suggestions = [
      'Classify with Naive Bayes',
      'Use neural network classification',
      'Predict categories for new data'
    ];
    return response;
  }

  async handleGeneral(message, data, entities, response) {
    response.response = "I'm a statistics bot that can help you with:\n" +
                       "📊 Statistical tests (t-tests, z-tests, ANOVA, chi-squared)\n" +
                       "📈 Data visualization (charts, graphs, plots)\n" +
                       "📋 Descriptive statistics\n" +
                       "🤖 Machine learning (regression, classification)\n\n" +
                       "What would you like to analyze today?";
    
    response.suggestions = [
      'Analyze my data with descriptive statistics',
      'Create a visualization of my data',
      'Perform a statistical test',
      'Build a predictive model'
    ];
    
    return response;
  }
}

module.exports = new ChatbotService();