# Statistics Bot Backend

A comprehensive backend service for statistical analysis, data visualization, and machine learning, designed to work with chatbot interfaces for natural language data analysis queries.

## Features

### Statistical Tests
- **Z-Tests**: One and two-proportion z-tests
- **T-Tests**: One-sample and two-sample t-tests
- **Chi-Squared Tests**: Goodness of fit and independence tests
- **ANOVA**: One-way analysis of variance

### Data Visualization
- Bar charts
- Histograms
- Box plots
- Line graphs
- Scatter plots with trendlines

### Machine Learning
- **Regression Models**: Linear, Polynomial, Random Forest, MLP
- **Classification Models**: Naive Bayes, Neural Network
- Line of best fit calculations
- Model evaluation metrics

### Chatbot Integration
- Natural language processing for statistical queries
- Intent recognition for different analysis types
- Contextual responses with explanations
- Automated chart generation based on user requests

## API Endpoints

### Statistics (`/api/statistics`)
- `POST /z-test/one-proportion` - One-proportion z-test
- `POST /z-test/two-proportion` - Two-proportion z-test
- `POST /t-test/one-sample` - One-sample t-test
- `POST /t-test/two-sample` - Two-sample t-test
- `POST /chi-squared/goodness-of-fit` - Chi-squared goodness of fit
- `POST /chi-squared/independence` - Chi-squared independence test
- `POST /anova` - ANOVA test
- `POST /descriptive` - Descriptive statistics

### Charts (`/api/charts`)
- `POST /bar` - Generate bar chart
- `POST /histogram` - Generate histogram
- `POST /boxplot` - Generate box plot
- `POST /line` - Generate line chart
- `POST /scatter` - Generate scatter plot

### Machine Learning (`/api/ml`)
- `POST /regression/linear` - Linear regression
- `POST /regression/polynomial` - Polynomial regression
- `POST /regression/random-forest` - Random forest regression
- `POST /regression/mlp` - MLP regression
- `POST /classification/naive-bayes` - Naive Bayes classification
- `POST /classification/neural-network` - Neural network classification

### Chatbot (`/api/chatbot`)
- `POST /analyze` - Process natural language analysis requests
- `POST /intent` - Intent recognition for user messages

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

## Example Requests

### Statistical Test
```javascript
// One-sample t-test
POST /api/statistics/t-test/one-sample
{
  "data": [1, 2, 3, 4, 5],
  "hypothesizedMean": 3,
  "significance": 0.05
}
```

### Chart Generation
```javascript
// Create histogram
POST /api/charts/histogram
{
  "data": [1, 2, 2, 3, 3, 3, 4, 4, 5],
  "bins": 5,
  "title": "Data Distribution",
  "xLabel": "Values",
  "yLabel": "Frequency"
}
```

### Chatbot Analysis
```javascript
// Natural language query
POST /api/chatbot/analyze
{
  "message": "Create a histogram of my data and run a t-test",
  "data": [1, 2, 3, 4, 5]
}
```

## Response Format

All endpoints return JSON responses with appropriate data structures:

```javascript
{
  "testType": "One-Sample T-Test",
  "result": { /* test results */ },
  "conclusion": "Statistical interpretation",
  "chart": "data:image/png;base64,..." // For chart endpoints
}
```

## Architecture

- **Modular Design**: Separate services for statistics, charts, ML, and chatbot
- **Error Handling**: Comprehensive validation and error responses
- **Scalable**: Easy to add new statistical procedures and ML models
- **RESTful**: Clean API design following REST principles

## Dependencies

- **Express.js**: Web server framework
- **Chart.js**: Chart generation
- **Simple Statistics**: Statistical calculations
- **ML libraries**: Machine learning implementations
- **Natural**: Natural language processing
- **Canvas**: Server-side chart rendering

## Health Check

Check service status at:
```
GET /api/health
```

This backend provides a complete foundation for statistical analysis applications with chatbot integration, suitable for educational, research, and professional data analysis use cases.