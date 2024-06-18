import { calculateTestPlanReportCompletionPercentage } from '../components/TestPlanReportStatusDialog/calculateTestPlanReportCompletionPercentage';

describe('calculateTestPlanReportCompletionPercentage', () => {
  const testResult = (id, completedAt = null) => ({ id, completedAt });

  test('returns 0 when metrics or draftTestPlanRuns is not defined', () => {
    expect(calculateTestPlanReportCompletionPercentage({})).toBe(0);
    expect(calculateTestPlanReportCompletionPercentage({ metrics: {} })).toBe(
      0
    );
    expect(
      calculateTestPlanReportCompletionPercentage({
        draftTestPlanRuns: []
      })
    ).toBe(0);
  });

  test('returns 0 when draftTestPlanRuns is empty', () => {
    expect(
      calculateTestPlanReportCompletionPercentage({
        metrics: { testsCount: 5 },
        draftTestPlanRuns: []
      })
    ).toBe(0);
  });

  test('returns 0 and not Infinity when total tests possible is 0', () => {
    const metrics = { testsCount: 0 };
    const t1 = testResult(1);
    const t2 = testResult(2);
    const t3 = testResult(3);
    const t4 = testResult(4);
    const t5 = testResult(5);

    const draftTestPlanRuns = [
      { testResults: [t1, t2, t3] },
      { testResults: [t1, t2, t3, t4, t5] }
    ];

    expect(
      calculateTestPlanReportCompletionPercentage({
        metrics,
        draftTestPlanRuns
      })
    ).toBe(0);
  });

  test('calculates and returns the correct percentage when draftTestPlanRuns has testResults', () => {
    const metrics = { testsCount: 5 };
    const date = new Date();
    const t1 = testResult(1, date);
    const t2 = testResult(2, date);
    const t3 = testResult(3, date);

    const draftTestPlanRuns = [
      { testResults: [t1, t2] },
      { testResults: [t1, t2, t3] }
    ];

    // Output should follow this formula:
    // (NUMBER_COMPLETED_TESTS_BY_ALL_TESTERS / (NUMBER_ASSIGNED_TESTERS * NUMBER_TESTS_IN_PLAN)) * 100
    // (5 / (2 * 5)) * 100 = 50
    expect(
      calculateTestPlanReportCompletionPercentage({
        metrics,
        draftTestPlanRuns
      })
    ).toBe(50);
  });
});
