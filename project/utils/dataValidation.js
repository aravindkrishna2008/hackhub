class DataValidation {
  static validateNumericArray(data, paramName = 'data') {
    if (!Array.isArray(data)) {
      throw new Error(`${paramName} must be an array`);
    }
    
    if (data.length === 0) {
      throw new Error(`${paramName} cannot be empty`);
    }
    
    if (!data.every(value => typeof value === 'number' && !isNaN(value))) {
      throw new Error(`${paramName} must contain only valid numbers`);
    }
    
    return true;
  }

  static validateTwoArrays(data1, data2, param1Name = 'data1', param2Name = 'data2') {
    this.validateNumericArray(data1, param1Name);
    this.validateNumericArray(data2, param2Name);
    
    if (data1.length !== data2.length) {
      throw new Error(`${param1Name} and ${param2Name} must have the same length`);
    }
    
    return true;
  }

  static validateContingencyTable(table) {
    if (!Array.isArray(table) || !Array.isArray(table[0])) {
      throw new Error('Contingency table must be a 2D array');
    }
    
    const rows = table.length;
    const cols = table[0].length;
    
    // Check all rows have same length
    if (!table.every(row => row.length === cols)) {
      throw new Error('All rows in contingency table must have the same length');
    }
    
    // Check all values are non-negative integers
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!Number.isInteger(table[i][j]) || table[i][j] < 0) {
          throw new Error('Contingency table must contain non-negative integers');
        }
      }
    }
    
    return true;
  }

  static validateGroups(groups) {
    if (!Array.isArray(groups)) {
      throw new Error('Groups must be an array');
    }
    
    if (groups.length < 2) {
      throw new Error('At least 2 groups are required for ANOVA');
    }
    
    groups.forEach((group, index) => {
      this.validateNumericArray(group, `group ${index + 1}`);
      if (group.length < 2) {
        throw new Error(`Group ${index + 1} must have at least 2 observations`);
      }
    });
    
    return true;
  }

  static validateProportion(successes, sampleSize, paramName = 'data') {
    if (!Number.isInteger(successes) || successes < 0) {
      throw new Error(`${paramName} successes must be a non-negative integer`);
    }
    
    if (!Number.isInteger(sampleSize) || sampleSize <= 0) {
      throw new Error(`${paramName} sample size must be a positive integer`);
    }
    
    if (successes > sampleSize) {
      throw new Error(`${paramName} successes cannot exceed sample size`);
    }
    
    return true;
  }

  static validateSignificanceLevel(alpha) {
    if (typeof alpha !== 'number' || alpha <= 0 || alpha >= 1) {
      throw new Error('Significance level must be a number between 0 and 1');
    }
    
    return true;
  }

  static validateAlternativeHypothesis(alternative) {
    const validAlternatives = ['two-sided', 'greater', 'less'];
    if (!validAlternatives.includes(alternative)) {
      throw new Error(`Alternative hypothesis must be one of: ${validAlternatives.join(', ')}`);
    }
    
    return true;
  }
}

module.exports = DataValidation;