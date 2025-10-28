const calculateAssertionStatistics = require('../../util/calculateAssertionStatistics');

describe('calculateAssertionStatistics', () => {
  it('returns empty statistics for empty rows', () => {
    const result = calculateAssertionStatistics([]);

    expect(result).toHaveLength(4);
    result.forEach(stat => {
      expect(stat.passingCount).toBe(0);
      expect(stat.failingCount).toBe(0);
      expect(stat.untestableCount).toBe(0);
      expect(stat.passingPercentage).toBeNull();
      expect(stat.failingPercentage).toBeNull();
      expect(stat.untestablePercentage).toBeNull();
    });
  });

  it('calculates 100% passing for all passed Must behaviors', () => {
    const rows = [
      {
        assertionPriority: 'Must',
        result: 'Passed'
      },
      {
        assertionPriority: 'Must',
        result: 'Passed'
      },
      {
        assertionPriority: 'Must',
        result: 'Passed'
      }
    ];

    const result = calculateAssertionStatistics(rows);
    const mustStat = result[0];

    expect(mustStat.label).toBe('Must-Have Behaviors');
    expect(mustStat.passingCount).toBe(3);
    expect(mustStat.failingCount).toBe(0);
    expect(mustStat.untestableCount).toBe(0);
    expect(mustStat.passingTotal).toBe(3);
    expect(mustStat.passingPercentage).toBe(100);
    expect(mustStat.failingPercentage).toBe(0);
    expect(mustStat.untestablePercentage).toBe(0);
  });

  it('calculates percentages for mixed results', () => {
    const rows = [
      { assertionPriority: 'Must', result: 'Passed' },
      { assertionPriority: 'Must', result: 'Passed' },
      { assertionPriority: 'Must', result: 'Failed' },
      { assertionPriority: 'Should', result: 'Passed' },
      { assertionPriority: 'Should', result: 'Failed' },
      { assertionPriority: 'Should', result: 'Failed' }
    ];

    const result = calculateAssertionStatistics(rows);

    const mustStat = result[0];
    expect(mustStat.passingCount).toBe(2);
    expect(mustStat.failingCount).toBe(1);
    expect(mustStat.passingPercentage).toBe(66);

    const shouldStat = result[1];
    expect(shouldStat.passingCount).toBe(1);
    expect(shouldStat.failingCount).toBe(2);
    expect(shouldStat.passingPercentage).toBe(33);

    const combinedStat = result[2];
    expect(combinedStat.passingCount).toBe(3);
    expect(combinedStat.failingCount).toBe(3);
    expect(combinedStat.passingPercentage).toBe(50);
    expect(combinedStat.failingPercentage).toBe(50);
  });

  it('handles untestable results correctly', () => {
    const rows = [
      { assertionPriority: 'Must', result: 'Passed' },
      { assertionPriority: 'Must', result: 'Failed' },
      { assertionPriority: 'Must', result: 'Untestable' }
    ];

    const result = calculateAssertionStatistics(rows);
    const mustStat = result[0];

    expect(mustStat.passingCount).toBe(1);
    expect(mustStat.failingCount).toBe(1);
    expect(mustStat.untestableCount).toBe(1);
    expect(mustStat.passingPercentage).toBe(33);
    expect(mustStat.failingPercentage).toBe(33);
    expect(mustStat.untestablePercentage).toBe(33);
  });

  it('ensures percentages sum to 100 for combined totals', () => {
    const rows = [
      { assertionPriority: 'Must', result: 'Passed' },
      { assertionPriority: 'Must', result: 'Passed' },
      { assertionPriority: 'Must', result: 'Failed' },
      { assertionPriority: 'Should', result: 'Passed' },
      { assertionPriority: 'Should', result: 'Failed' },
      { assertionPriority: 'Should', result: 'Failed' },
      { assertionPriority: 'Should', result: 'Untestable' }
    ];

    const result = calculateAssertionStatistics(rows);
    const percentOfBehaviorsStat = result[3];

    const percentageSum =
      percentOfBehaviorsStat.passingPercentage +
      percentOfBehaviorsStat.failingPercentage +
      percentOfBehaviorsStat.untestablePercentage;

    expect(percentageSum).toBe(100);
  });

  it('calculates correct percentages with uneven divisions', () => {
    const rows = [
      { assertionPriority: 'Must', result: 'Passed' },
      { assertionPriority: 'Must', result: 'Passed' },
      { assertionPriority: 'Must', result: 'Failed' }
    ];

    const result = calculateAssertionStatistics(rows);
    const mustStat = result[0];

    expect(mustStat.passingPercentage).toBe(66);
    expect(mustStat.failingPercentage).toBe(33);
    expect(mustStat.untestablePercentage).toBe(0);
    const total =
      mustStat.passingPercentage +
      mustStat.failingPercentage +
      mustStat.untestablePercentage;
    expect(total).toBe(99);
  });

  it('returns null percentages when total is zero', () => {
    const rows = [];

    const result = calculateAssertionStatistics(rows);

    result.forEach(stat => {
      if (stat.label === 'Percent of Behaviors') {
        return;
      }
      expect(stat.passingPercentage).toBeNull();
      expect(stat.failingPercentage).toBeNull();
      expect(stat.untestablePercentage).toBeNull();
    });
  });
});
