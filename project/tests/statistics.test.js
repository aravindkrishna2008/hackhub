const statisticsService = require('../services/statisticsService');

describe('Statistics Service', () => {
  const sampleData1 = [1, 2, 3, 4, 5];
  const sampleData2 = [2, 4, 6, 8, 10];

  test('should calculate descriptive statistics correctly', () => {
    const result = statisticsService.descriptiveStatistics(sampleData1);
    
    expect(result.mean).toBe(3);
    expect(result.median).toBe(3);
    expect(result.minimum).toBe(1);
    expect(result.maximum).toBe(5);
    expect(result.count).toBe(5);
  });

  test('should perform one-sample t-test', () => {
    const result = statisticsService.oneSampleTTest(sampleData1, 3);
    
    expect(result.testType).toBe('One-Sample T-Test');
    expect(result.sampleMean).toBe('3.0000');
    expect(result.hypothesizedMean).toBe(3);
    expect(result.degreesOfFreedom).toBe(4);
  });

  test('should perform two-sample t-test', () => {
    const result = statisticsService.twoSampleTTest(sampleData1, sampleData2);
    
    expect(result.testType).toBe('Two-Sample T-Test (Equal Variances)');
    expect(result.sampleSize1).toBe(5);
    expect(result.sampleSize2).toBe(5);
    expect(result.mean1).toBe('3.0000');
    expect(result.mean2).toBe('6.0000');
  });

  test('should perform one-proportion z-test', () => {
    const result = statisticsService.oneProportionZTest(45, 100, 0.5);
    
    expect(result.testType).toBe('One-Proportion Z-Test');
    expect(result.sampleProportion).toBe('0.4500');
    expect(result.hypothesizedProportion).toBe(0.5);
  });

  test('should perform ANOVA test', () => {
    const groups = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const result = statisticsService.anovaTest(groups);
    
    expect(result.testType).toBe('One-Way ANOVA');
    expect(result.groups).toBe(3);
    expect(result.totalSampleSize).toBe(9);
    expect(result.dfBetween).toBe(2);
    expect(result.dfWithin).toBe(6);
  });

  test('should perform chi-squared goodness of fit test', () => {
    const observed = [10, 20, 30];
    const expected = [15, 25, 20];
    const result = statisticsService.chiSquaredGoodnessOfFit(observed, expected);
    
    expect(result.testType).toBe('Chi-Squared Goodness of Fit Test');
    expect(result.degreesOfFreedom).toBe(2);
    expect(result.observed).toEqual(observed);
    expect(result.expected).toEqual(expected);
  });
});