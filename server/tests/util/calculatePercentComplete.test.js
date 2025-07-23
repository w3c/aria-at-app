const {
  calculatePercentComplete
} = require('../../util/calculatePercentComplete');

describe('calculatePercentComplete', () => {
  describe('basic calculations', () => {
    it('should return 0 when no assertions are validated (all passed=null)', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [
                    { passed: null },
                    { passed: null },
                    { passed: null }
                  ]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(0);
    });

    it('should return 100 when all assertions are validated', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [
                    { passed: true },
                    { passed: false },
                    { passed: true }
                  ]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(100);
    });

    it('should return 50 when half the assertions are validated', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [
                    { passed: true },
                    { passed: false },
                    { passed: null },
                    { passed: null }
                  ]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(50);
    });

    it('should return 33 when 1/3 of assertions are validated (floor)', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [
                    { passed: true },
                    { passed: null },
                    { passed: null }
                  ]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(33); // Math.floor(33.333...)
    });
  });

  describe('complex nested structures', () => {
    it('should handle multiple test results', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: true }, { passed: false }]
                }
              ]
            },
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: null }, { passed: null }]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(50); // 2 validated out of 4 total
    });

    it('should handle multiple scenario results', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: true }, { passed: false }]
                },
                {
                  assertionResults: [{ passed: null }, { passed: true }]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(75); // 3 validated out of 4 total
    });

    it('should handle multiple test plan runs', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: true }, { passed: false }]
                }
              ]
            }
          ]
        },
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: null }, { passed: true }]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(75); // 3 validated out of 4 total
    });

    it('should handle deeply nested structure with mixed data', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [
                    { passed: true },
                    { passed: false },
                    { passed: null }
                  ]
                },
                {
                  assertionResults: [{ passed: true }, { passed: true }]
                }
              ]
            },
            {
              scenarioResults: [
                {
                  assertionResults: [
                    { passed: null },
                    { passed: false },
                    { passed: null },
                    { passed: true }
                  ]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(66); // 6 validated out of 9 total = 66.666... -> 66
    });
  });

  describe('boundary conditions', () => {
    it('should handle single assertion validated', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: true }]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(100);
    });

    it('should handle single assertion not validated', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: null }]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(0);
    });
  });

  describe('passed value variations', () => {
    it('should count false as validated', () => {
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: false }, { passed: null }]
                }
              ]
            }
          ]
        }
      ];
      const result = calculatePercentComplete({ draftTestPlanRuns });
      expect(result).toBe(50); // false counts as validated
    });
  });
});
