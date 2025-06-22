const math = require('mathjs');
const ss = require('simple-statistics');

class StatisticsService {
  // One-proportion z-test
  oneProportionZTest(successes, sampleSize, hypothesizedProportion, alternativeHypothesis = 'two-sided', significance = 0.05) {
    const sampleProportion = successes / sampleSize;
    const standardError = Math.sqrt((hypothesizedProportion * (1 - hypothesizedProportion)) / sampleSize);
    const zScore = (sampleProportion - hypothesizedProportion) / standardError;
    
    let pValue;
    if (alternativeHypothesis === 'two-sided') {
      pValue = 2 * (1 - ss.cumulativeStdNormalProbability(Math.abs(zScore)));
    } else if (alternativeHypothesis === 'greater') {
      pValue = 1 - ss.cumulativeStdNormalProbability(zScore);
    } else {
      pValue = ss.cumulativeStdNormalProbability(zScore);
    }
    
    const criticalValue = ss.probit(1 - significance / (alternativeHypothesis === 'two-sided' ? 2 : 1));
    const rejectNull = pValue < significance;
    
    return {
      testType: 'One-Proportion Z-Test',
      sampleProportion: sampleProportion.toFixed(4),
      hypothesizedProportion,
      zScore: zScore.toFixed(4),
      pValue: pValue.toFixed(6),
      criticalValue: criticalValue.toFixed(4),
      significance,
      rejectNull,
      conclusion: rejectNull 
        ? `Reject the null hypothesis. There is sufficient evidence that the proportion differs from ${hypothesizedProportion}.`
        : `Fail to reject the null hypothesis. There is insufficient evidence that the proportion differs from ${hypothesizedProportion}.`
    };
  }

  // Two-proportion z-test
  twoProportionZTest(successes1, sampleSize1, successes2, sampleSize2, alternativeHypothesis = 'two-sided', significance = 0.05) {
    const p1 = successes1 / sampleSize1;
    const p2 = successes2 / sampleSize2;
    const pooledProportion = (successes1 + successes2) / (sampleSize1 + sampleSize2);
    
    const standardError = Math.sqrt(pooledProportion * (1 - pooledProportion) * (1/sampleSize1 + 1/sampleSize2));
    const zScore = (p1 - p2) / standardError;
    
    let pValue;
    if (alternativeHypothesis === 'two-sided') {
      pValue = 2 * (1 - ss.cumulativeStdNormalProbability(Math.abs(zScore)));
    } else if (alternativeHypothesis === 'greater') {
      pValue = 1 - ss.cumulativeStdNormalProbability(zScore);
    } else {
      pValue = ss.cumulativeStdNormalProbability(zScore);
    }
    
    const rejectNull = pValue < significance;
    
    return {
      testType: 'Two-Proportion Z-Test',
      proportion1: p1.toFixed(4),
      proportion2: p2.toFixed(4),
      pooledProportion: pooledProportion.toFixed(4),
      zScore: zScore.toFixed(4),
      pValue: pValue.toFixed(6),
      significance,
      rejectNull,
      conclusion: rejectNull 
        ? `Reject the null hypothesis. There is sufficient evidence of a difference between the two proportions.`
        : `Fail to reject the null hypothesis. There is insufficient evidence of a difference between the two proportions.`
    };
  }

  // One-sample t-test
  oneSampleTTest(data, hypothesizedMean, alternativeHypothesis = 'two-sided', significance = 0.05) {
    const sampleMean = ss.mean(data);
    const sampleStd = ss.standardDeviation(data);
    const n = data.length;
    const df = n - 1;
    
    const tScore = (sampleMean - hypothesizedMean) / (sampleStd / Math.sqrt(n));
    
    // Approximate p-value calculation (for more precision, use a proper t-distribution library)
    let pValue;
    if (alternativeHypothesis === 'two-sided') {
      pValue = 2 * (1 - ss.cumulativeStdNormalProbability(Math.abs(tScore)));
    } else if (alternativeHypothesis === 'greater') {
      pValue = 1 - ss.cumulativeStdNormalProbability(tScore);
    } else {
      pValue = ss.cumulativeStdNormalProbability(tScore);
    }
    
    const rejectNull = pValue < significance;
    
    return {
      testType: 'One-Sample T-Test',
      sampleMean: sampleMean.toFixed(4),
      hypothesizedMean,
      sampleStd: sampleStd.toFixed(4),
      sampleSize: n,
      degreesOfFreedom: df,
      tScore: tScore.toFixed(4),
      pValue: pValue.toFixed(6),
      significance,
      rejectNull,
      conclusion: rejectNull 
        ? `Reject the null hypothesis. There is sufficient evidence that the mean differs from ${hypothesizedMean}.`
        : `Fail to reject the null hypothesis. There is insufficient evidence that the mean differs from ${hypothesizedMean}.`
    };
  }

  // Two-sample t-test
  twoSampleTTest(data1, data2, alternativeHypothesis = 'two-sided', significance = 0.05, equalVariances = true) {
    const mean1 = ss.mean(data1);
    const mean2 = ss.mean(data2);
    const std1 = ss.standardDeviation(data1);
    const std2 = ss.standardDeviation(data2);
    const n1 = data1.length;
    const n2 = data2.length;
    
    let tScore, df, pooledStd;
    
    if (equalVariances) {
      // Pooled variance t-test
      pooledStd = Math.sqrt(((n1 - 1) * std1 ** 2 + (n2 - 1) * std2 ** 2) / (n1 + n2 - 2));
      tScore = (mean1 - mean2) / (pooledStd * Math.sqrt(1/n1 + 1/n2));
      df = n1 + n2 - 2;
    } else {
      // Welch's t-test
      const se1 = std1 ** 2 / n1;
      const se2 = std2 ** 2 / n2;
      tScore = (mean1 - mean2) / Math.sqrt(se1 + se2);
      df = (se1 + se2) ** 2 / (se1 ** 2 / (n1 - 1) + se2 ** 2 / (n2 - 1));
    }
    
    // Approximate p-value calculation
    let pValue;
    if (alternativeHypothesis === 'two-sided') {
      pValue = 2 * (1 - ss.cumulativeStdNormalProbability(Math.abs(tScore)));
    } else if (alternativeHypothesis === 'greater') {
      pValue = 1 - ss.cumulativeStdNormalProbability(tScore);
    } else {
      pValue = ss.cumulativeStdNormalProbability(tScore);
    }
    
    const rejectNull = pValue < significance;
    
    return {
      testType: equalVariances ? 'Two-Sample T-Test (Equal Variances)' : 'Welch\'s T-Test (Unequal Variances)',
      mean1: mean1.toFixed(4),
      mean2: mean2.toFixed(4),
      std1: std1.toFixed(4),
      std2: std2.toFixed(4),
      sampleSize1: n1,
      sampleSize2: n2,
      degreesOfFreedom: Math.round(df),
      tScore: tScore.toFixed(4),
      pValue: pValue.toFixed(6),
      significance,
      rejectNull,
      conclusion: rejectNull 
        ? `Reject the null hypothesis. There is sufficient evidence of a difference between the two means.`
        : `Fail to reject the null hypothesis. There is insufficient evidence of a difference between the two means.`
    };
  }

  // Chi-squared goodness of fit test
  chiSquaredGoodnessOfFit(observed, expected, significance = 0.05) {
    if (observed.length !== expected.length) {
      throw new Error('Observed and expected arrays must have the same length');
    }
    
    const chiSquared = observed.reduce((sum, obs, i) => {
      return sum + ((obs - expected[i]) ** 2) / expected[i];
    }, 0);
    
    const df = observed.length - 1;
    // Approximate p-value using chi-squared distribution
    const pValue = 1 - math.gamma(df/2) / math.gamma(df/2, chiSquared/2);
    const rejectNull = pValue < significance;
    
    return {
      testType: 'Chi-Squared Goodness of Fit Test',
      observed,
      expected,
      chiSquared: chiSquared.toFixed(4),
      degreesOfFreedom: df,
      pValue: pValue.toFixed(6),
      significance,
      rejectNull,
      conclusion: rejectNull 
        ? `Reject the null hypothesis. The observed frequencies differ significantly from the expected frequencies.`
        : `Fail to reject the null hypothesis. The observed frequencies do not differ significantly from the expected frequencies.`
    };
  }

  // Chi-squared test for independence
  chiSquaredIndependence(contingencyTable, significance = 0.05) {
    const rows = contingencyTable.length;
    const cols = contingencyTable[0].length;
    
    // Calculate totals
    const rowTotals = contingencyTable.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals = [];
    for (let j = 0; j < cols; j++) {
      colTotals[j] = contingencyTable.reduce((sum, row) => sum + row[j], 0);
    }
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);
    
    // Calculate expected frequencies
    const expected = [];
    for (let i = 0; i < rows; i++) {
      expected[i] = [];
      for (let j = 0; j < cols; j++) {
        expected[i][j] = (rowTotals[i] * colTotals[j]) / grandTotal;
      }
    }
    
    // Calculate chi-squared statistic
    let chiSquared = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        chiSquared += ((contingencyTable[i][j] - expected[i][j]) ** 2) / expected[i][j];
      }
    }
    
    const df = (rows - 1) * (cols - 1);
    // Approximate p-value
    const pValue = 1 - math.gamma(df/2) / math.gamma(df/2, chiSquared/2);
    const rejectNull = pValue < significance;
    
    return {
      testType: 'Chi-Squared Test for Independence',
      contingencyTable,
      expected,
      chiSquared: chiSquared.toFixed(4),
      degreesOfFreedom: df,
      pValue: pValue.toFixed(6),
      significance,
      rejectNull,
      conclusion: rejectNull 
        ? `Reject the null hypothesis. There is sufficient evidence that the variables are not independent.`
        : `Fail to reject the null hypothesis. There is insufficient evidence that the variables are dependent.`
    };
  }

  // ANOVA test
  anovaTest(groups, significance = 0.05) {
    const k = groups.length; // number of groups
    const n = groups.reduce((sum, group) => sum + group.length, 0); // total sample size
    
    // Calculate group means and overall mean
    const groupMeans = groups.map(group => ss.mean(group));
    const overallMean = ss.mean(groups.flat());
    
    // Calculate sum of squares
    const ssBetween = groups.reduce((sum, group, i) => {
      return sum + group.length * ((groupMeans[i] - overallMean) ** 2);
    }, 0);
    
    const ssWithin = groups.reduce((sum, group, i) => {
      return sum + group.reduce((groupSum, value) => {
        return groupSum + ((value - groupMeans[i]) ** 2);
      }, 0);
    }, 0);
    
    const ssTotal = ssBetween + ssWithin;
    
    // Calculate degrees of freedom
    const dfBetween = k - 1;
    const dfWithin = n - k;
    const dfTotal = n - 1;
    
    // Calculate mean squares
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    
    // Calculate F-statistic
    const fStatistic = msBetween / msWithin;
    
    // Approximate p-value using F-distribution
    const pValue = 1 - math.gamma(dfBetween/2) * math.gamma(dfWithin/2) / 
                   (math.gamma((dfBetween + dfWithin)/2) * math.pow(dfBetween/dfWithin, dfBetween/2) * 
                    math.pow(1 + (dfBetween * fStatistic) / dfWithin, -(dfBetween + dfWithin)/2));
    
    const rejectNull = pValue < significance;
    
    return {
      testType: 'One-Way ANOVA',
      groups: groups.length,
      totalSampleSize: n,
      groupMeans: groupMeans.map(mean => parseFloat(mean.toFixed(4))),
      overallMean: parseFloat(overallMean.toFixed(4)),
      ssBetween: parseFloat(ssBetween.toFixed(4)),
      ssWithin: parseFloat(ssWithin.toFixed(4)),
      ssTotal: parseFloat(ssTotal.toFixed(4)),
      dfBetween,
      dfWithin,
      dfTotal,
      msBetween: parseFloat(msBetween.toFixed(4)),
      msWithin: parseFloat(msWithin.toFixed(4)),
      fStatistic: parseFloat(fStatistic.toFixed(4)),
      pValue: parseFloat(pValue.toFixed(6)),
      significance,
      rejectNull,
      conclusion: rejectNull 
        ? `Reject the null hypothesis. There is sufficient evidence that at least one group mean differs from the others.`
        : `Fail to reject the null hypothesis. There is insufficient evidence that the group means differ.`
    };
  }

  // Descriptive statistics
  descriptiveStatistics(data) {
    const sortedData = [...data].sort((a, b) => a - b);
    
    return {
      count: data.length,
      mean: parseFloat(ss.mean(data).toFixed(4)),
      median: parseFloat(ss.median(data).toFixed(4)),
      mode: ss.mode(data),
      standardDeviation: parseFloat(ss.standardDeviation(data).toFixed(4)),
      variance: parseFloat(ss.variance(data).toFixed(4)),
      minimum: Math.min(...data),
      maximum: Math.max(...data),
      range: Math.max(...data) - Math.min(...data),
      q1: parseFloat(ss.quantile(sortedData, 0.25).toFixed(4)),
      q3: parseFloat(ss.quantile(sortedData, 0.75).toFixed(4)),
      iqr: parseFloat((ss.quantile(sortedData, 0.75) - ss.quantile(sortedData, 0.25)).toFixed(4)),
      skewness: parseFloat(ss.sampleSkewness(data).toFixed(4)),
      kurtosis: parseFloat(ss.sampleKurtosis(data).toFixed(4))
    };
  }
}

module.exports = new StatisticsService();