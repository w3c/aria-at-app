const calculateAssertionStatistics = rows => {
  const statistics = {
    must: {
      total: 0,
      passed: 0,
      failed: 0,
      untestable: 0
    },
    should: {
      total: 0,
      passed: 0,
      failed: 0,
      untestable: 0
    }
  };

  rows.forEach(row => {
    const priority = row.assertionPriority === 'Must' ? 'must' : 'should';
    statistics[priority].total++;

    if (row.result === 'Passed') {
      statistics[priority].passed++;
    } else if (row.result === 'Failed') {
      statistics[priority].failed++;
    } else if (row.result === 'Untestable') {
      statistics[priority].untestable++;
    }
  });

  const mustTotal = statistics.must.total;
  const shouldTotal = statistics.should.total;
  const combinedTotal = mustTotal + shouldTotal;

  const combinedPassed = statistics.must.passed + statistics.should.passed;
  const combinedFailed = statistics.must.failed + statistics.should.failed;
  const combinedUntestable =
    statistics.must.untestable + statistics.should.untestable;

  const calculatePercentage = (count, total) =>
    total === 0 ? null : Math.floor((count / total) * 100);

  return [
    {
      label: 'Must-Have Behaviors',
      passingCount: statistics.must.passed,
      passingTotal: mustTotal,
      failingCount: statistics.must.failed,
      failingTotal: mustTotal,
      untestableCount: statistics.must.untestable,
      untestableTotal: mustTotal,
      passingPercentage: calculatePercentage(statistics.must.passed, mustTotal),
      failingPercentage: calculatePercentage(statistics.must.failed, mustTotal),
      untestablePercentage: calculatePercentage(
        statistics.must.untestable,
        mustTotal
      )
    },
    {
      label: 'Should-Have Behaviors',
      passingCount: statistics.should.passed,
      passingTotal: shouldTotal,
      failingCount: statistics.should.failed,
      failingTotal: shouldTotal,
      untestableCount: statistics.should.untestable,
      untestableTotal: shouldTotal,
      passingPercentage: calculatePercentage(
        statistics.should.passed,
        shouldTotal
      ),
      failingPercentage: calculatePercentage(
        statistics.should.failed,
        shouldTotal
      ),
      untestablePercentage: calculatePercentage(
        statistics.should.untestable,
        shouldTotal
      )
    },
    {
      label: 'Must + Should',
      passingCount: combinedPassed,
      passingTotal: combinedTotal,
      failingCount: combinedFailed,
      failingTotal: combinedTotal,
      untestableCount: combinedUntestable,
      untestableTotal: combinedTotal,
      passingPercentage: calculatePercentage(combinedPassed, combinedTotal),
      failingPercentage: calculatePercentage(combinedFailed, combinedTotal),
      untestablePercentage: calculatePercentage(
        combinedUntestable,
        combinedTotal
      )
    },
    {
      label: 'Percent of Behaviors',
      passingCount: combinedPassed,
      passingTotal: combinedTotal,
      failingCount: combinedFailed,
      failingTotal: combinedTotal,
      untestableCount: combinedUntestable,
      untestableTotal: combinedTotal,
      passingPercentage: calculatePercentage(combinedPassed, combinedTotal),
      failingPercentage: calculatePercentage(combinedFailed, combinedTotal),
      untestablePercentage:
        combinedTotal === 0
          ? null
          : 100 -
            Math.floor((combinedPassed / combinedTotal) * 100) -
            Math.floor((combinedFailed / combinedTotal) * 100)
    }
  ];
};

module.exports = calculateAssertionStatistics;
