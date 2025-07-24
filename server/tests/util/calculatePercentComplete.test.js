const {
  calculatePercentComplete
} = require('../../util/calculatePercentComplete');

describe('calculatePercentComplete', () => {
  const mockAtId = 1;

  const createRunnableTest = (id, scenarioCount = 1, assertionCount = 3) => ({
    id,
    scenarios: Array(scenarioCount)
      .fill()
      .map((_, i) => ({
        id: `scenario-${id}-${i}`,
        at: { id: mockAtId },
        commands: [{ id: `command-${id}-${i}`, atOperatingMode: 'default' }]
      })),
    assertions: Array(assertionCount)
      .fill()
      .map((_, i) => ({
        id: `assertion-${id}-${i}`,
        text: `Assertion ${i + 1}`
      }))
  });

  describe('basic calculations', () => {
    it('should return 0 when no assertions are validated (all passed=null)', () => {
      const runnableTests = [createRunnableTest('test1')];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(0);
    });

    it('should return 100 when all assertions are validated', () => {
      const runnableTests = [createRunnableTest('test1')];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(100);
    });

    it('should return 50 when half the assertions are validated', () => {
      const runnableTests = [createRunnableTest('test1', 1, 4)];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(50);
    });

    it('should return 33 when 1/3 of assertions are validated (floor)', () => {
      const runnableTests = [createRunnableTest('test1')];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(33); // Math.floor(33.333...)
    });
  });

  describe('tests the key fix: counting assertions from tests without results', () => {
    it('should count assertions from tests that have no results yet', () => {
      // Two tests: one with results, one without
      const runnableTests = [
        createRunnableTest('test1', 1, 2), // 2 assertions
        createRunnableTest('test2', 1, 2) // 2 assertions (no results yet)
      ];

      // Only test1 has results
      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: true }, { passed: null }]
                }
              ]
            }
          ]
        }
      ];

      // 1 validated out of 4 total = 25%
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(25);
    });

    it('should return 0 when no tests have results but tests exist', () => {
      const runnableTests = [
        createRunnableTest('test1'),
        createRunnableTest('test2')
      ];
      const draftTestPlanRuns = []; // No test results at all

      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(0);
    });

    it('should handle multiple scenarios per test correctly', () => {
      const runnableTests = [
        createRunnableTest('test1', 2, 2) // 2 scenarios, 2 assertions each = 4 total assertions
      ];

      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: true }, { passed: true }]
                },
                {
                  assertionResults: [{ passed: null }, { passed: null }]
                }
              ]
            }
          ]
        }
      ];

      // 2 validated out of 4 total = 50%
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(50);
    });
  });

  describe('complex nested structures', () => {
    it('should handle multiple test results', () => {
      const runnableTests = [
        createRunnableTest('test1', 1, 2),
        createRunnableTest('test2', 1, 2)
      ];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(50); // 2 validated out of 4 total
    });

    it('should handle multiple scenario results', () => {
      const runnableTests = [createRunnableTest('test1', 2, 2)];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(75); // 3 validated out of 4 total
    });

    it('should handle multiple test plan runs', () => {
      const runnableTests = [
        createRunnableTest('test1', 1, 2),
        createRunnableTest('test2', 1, 2)
      ];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(37); // 3 validated out of 8 total
    });

    it('should handle deeply nested structure with mixed data', () => {
      const runnableTests = [
        createRunnableTest('test1', 2, 3),
        createRunnableTest('test2', 1, 4)
      ];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(60); // 6 validated out of 10 total = 60%
    });
  });

  describe('boundary conditions', () => {
    it('should handle single assertion validated', () => {
      const runnableTests = [createRunnableTest('test1', 1, 1)];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(100);
    });

    it('should handle single assertion not validated', () => {
      const runnableTests = [createRunnableTest('test1', 1, 1)];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(0);
    });

    it('should return 0 when runnableTests is empty', () => {
      const runnableTests = [];
      const draftTestPlanRuns = [];
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(0);
    });

    it('should return 0 when runnableTests is null', () => {
      const runnableTests = null;
      const draftTestPlanRuns = [];
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(0);
    });
  });

  describe('AT filtering', () => {
    it('should only count scenarios for the specified AT', () => {
      const runnableTests = [
        {
          id: 'test1',
          scenarios: [
            {
              id: 'scenario1',
              at: { id: 1 },
              commands: [{ id: 'command1', atOperatingMode: 'default' }]
            }, // This AT
            {
              id: 'scenario2',
              at: { id: 2 },
              commands: [{ id: 'command2', atOperatingMode: 'default' }]
            } // Different AT
          ],
          assertions: [
            { id: 'assertion1', text: 'Assertion 1' },
            { id: 'assertion2', text: 'Assertion 2' }
          ]
        }
      ];

      const draftTestPlanRuns = [
        {
          testResults: [
            {
              scenarioResults: [
                {
                  assertionResults: [{ passed: true }, { passed: null }]
                }
              ]
            }
          ]
        }
      ];

      // Should only count assertions for AT id 1 (1 scenario * 2 assertions = 2 total)
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: 1
      });
      expect(result).toBe(50); // 1 validated out of 2 total
    });
  });

  describe('passed value variations', () => {
    it('should count false as validated', () => {
      const runnableTests = [createRunnableTest('test1', 1, 2)];
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
      const result = calculatePercentComplete({
        draftTestPlanRuns,
        runnableTests,
        atId: mockAtId
      });
      expect(result).toBe(50); // false counts as validated
    });
  });
});
